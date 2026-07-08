import { getAccessToken } from './googleAuth';
import { STORAGE_KEY, loadData, saveData } from './storage';

export const BACKUP_FILE_NAME = 'jee-planner-backup.json';
export const CLOUD_BACKUP_SETTINGS_KEY = 'jee-planner-cloud-backup-settings';
export const LOCAL_UPDATE_KEY = 'jee-planner-last-local-update';
export const AUTO_SAVE_DEBOUNCE_MS = 60 * 1000;
const DRIVE_FILES_ENDPOINT = 'https://www.googleapis.com/drive/v3/files';
const DRIVE_UPLOAD_ENDPOINT = 'https://www.googleapis.com/upload/drive/v3/files';

const APP_LOCAL_STORAGE_KEYS = [
  STORAGE_KEY,
  LOCAL_UPDATE_KEY,
  CLOUD_BACKUP_SETTINGS_KEY,
  'jee-planner-journal',
  'jee-planner-ambient-settings',
  'jee-planner-theme',
  'jee-planner-dashboard-preferences',
  'jee-planner-keyboard-shortcut-preferences',
  'jee-planner-settings',
];

export const getCloudBackupSettings = () => {
  if (typeof window === 'undefined') return {};

  try {
    return JSON.parse(window.localStorage.getItem(CLOUD_BACKUP_SETTINGS_KEY) ?? '{}');
  } catch {
    return {};
  }
};

export const saveCloudBackupSettings = (settings) => {
  window.localStorage.setItem(CLOUD_BACKUP_SETTINGS_KEY, JSON.stringify({ ...getCloudBackupSettings(), ...settings }));
};

export const markBackupDirty = (updatedAt = new Date().toISOString()) => {
  if (typeof window === 'undefined') return;

  window.localStorage.setItem(LOCAL_UPDATE_KEY, updatedAt);
  saveCloudBackupSettings({
    dirty: true,
    dirtySince: getCloudBackupSettings().dirtySince ?? updatedAt,
    lastDirtyAt: updatedAt,
  });
};

export const clearBackupDirty = (updatedAt = new Date().toISOString()) => {
  saveCloudBackupSettings({ dirty: false, dirtySince: null, lastDirtyAt: null, lastCloudBackup: updatedAt });
};

export const markLocalUpdate = markBackupDirty;

export const getLastLocalUpdate = () => {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem(LOCAL_UPDATE_KEY);
};

export const hasDirtyChanges = () => Boolean(getCloudBackupSettings().dirty);

const readKnownLocalStorage = () => {
  const datasets = {};

  APP_LOCAL_STORAGE_KEYS.forEach((key) => {
    const value = window.localStorage.getItem(key);
    if (value !== null) datasets[key] = value;
  });

  return datasets;
};

export const createBackupPayload = () => {
  const now = new Date().toISOString();
  const plannerData = loadData();

  return {
    app: 'JEE Planner',
    backupVersion: 1,
    createdAt: getCloudBackupSettings().createdAt ?? now,
    updatedAt: now,
    data: {
      planner: plannerData,
      localStorage: readKnownLocalStorage(),
    },
  };
};

export const validateBackupPayload = (payload) => {
  if (!payload || payload.app !== 'JEE Planner' || payload.backupVersion !== 1 || !payload.data?.planner) {
    throw new Error('This does not look like a valid JEE Planner backup.');
  }

  if (!payload.updatedAt || Number.isNaN(Date.parse(payload.updatedAt))) {
    throw new Error('This backup is missing a valid update time.');
  }

  return true;
};

const driveFetch = async (url, options = {}) => {
  const token = await getAccessToken();
  const response = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(options.headers ?? {}),
    },
  });

  if (!response.ok) {
    const message = response.status === 404 ? 'Backup missing.' : 'Google Drive is unavailable right now.';
    throw new Error(message);
  }

  return response;
};

export const findBackupFiles = async () => {
  const query = encodeURIComponent(`name='${BACKUP_FILE_NAME}' and trashed=false`);
  const url = `${DRIVE_FILES_ENDPOINT}?spaces=appDataFolder&q=${query}&fields=files(id,name,modifiedTime)&pageSize=10`;
  const response = await driveFetch(url);
  const result = await response.json();
  return result.files ?? [];
};

export const findBackupFile = async () => {
  const files = await findBackupFiles();
  return files[0] ?? null;
};

const removeExtraBackupFiles = async (files) => {
  await Promise.all(files.slice(1).map((file) => driveFetch(`${DRIVE_FILES_ENDPOINT}/${file.id}`, { method: 'DELETE' }).catch(() => null)));
};

export const uploadBackup = async () => {
  if (!navigator.onLine) throw new Error('You are offline. Backup is unavailable.');

  const payload = createBackupPayload();
  validateBackupPayload(payload);
  const existingFiles = await findBackupFiles();
  await removeExtraBackupFiles(existingFiles);
  const existingFile = existingFiles[0] ?? null;
  const metadata = { name: BACKUP_FILE_NAME, parents: ['appDataFolder'], mimeType: 'application/json' };
  const boundary = `jee_planner_${Date.now()}`;
  const body = [
    `--${boundary}`,
    'Content-Type: application/json; charset=UTF-8',
    '',
    JSON.stringify(metadata),
    `--${boundary}`,
    'Content-Type: application/json; charset=UTF-8',
    '',
    JSON.stringify(payload),
    `--${boundary}--`,
  ].join('\r\n');

  const url = existingFile
    ? `${DRIVE_UPLOAD_ENDPOINT}/${existingFile.id}?uploadType=multipart&fields=id,modifiedTime`
    : `${DRIVE_UPLOAD_ENDPOINT}?uploadType=multipart&fields=id,modifiedTime`;

  const response = await driveFetch(url, {
    method: existingFile ? 'PATCH' : 'POST',
    headers: { 'Content-Type': `multipart/related; boundary=${boundary}` },
    body,
  });
  const file = await response.json();
  saveCloudBackupSettings({ createdAt: payload.createdAt, lastCloudFileId: file.id });
  clearBackupDirty(payload.updatedAt);
  return { payload, file };
};

export const downloadBackup = async () => {
  if (!navigator.onLine) throw new Error('You are offline. Backup is unavailable.');

  const file = await findBackupFile();
  if (!file) throw new Error('No cloud backup was found.');

  const response = await driveFetch(`${DRIVE_FILES_ENDPOINT}/${file.id}?alt=media`);
  let payload;
  try {
    payload = await response.json();
  } catch {
    throw new Error('The cloud backup is corrupt JSON.');
  }
  validateBackupPayload(payload);
  return payload;
};

export const restoreBackupPayload = (payload) => {
  validateBackupPayload(payload);
  const localStorageData = payload.data.localStorage ?? {};

  Object.entries(localStorageData).forEach(([key, value]) => {
    if (APP_LOCAL_STORAGE_KEYS.includes(key) && typeof value === 'string') {
      window.localStorage.setItem(key, value);
    }
  });

  saveData(payload.data.planner);
  markLocalUpdate(new Date().toISOString());
};

export const shouldAutoBackup = () => {
  const settings = getCloudBackupSettings();
  return Boolean(settings.autoBackup && settings.dirty);
};
