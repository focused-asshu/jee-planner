import { defaultChapters } from '../data/chapters';
import { getCompletionStats, getTotalStudySeconds } from './stats';
import { getAccessToken } from './googleAuth';
import { STORAGE_KEY, STORAGE_VERSION, loadData, saveData } from './storage';

export const LEGACY_BACKUP_FILE_NAME = 'jee-planner-backup.json';
export const BACKUP_FILE_NAME = LEGACY_BACKUP_FILE_NAME;
export const MANAGED_BACKUP_PREFIX = 'jee-planner-backup-';
export const MANAGED_BACKUP_SUFFIX = '.json';
export const MAX_BACKUP_HISTORY = 3;
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

const safeNumber = (value) => Math.max(0, Math.floor(Number(value) || 0));

const getBrowserName = () => {
  if (typeof navigator === 'undefined') return 'Unknown browser';
  const userAgent = navigator.userAgent || '';
  if (/Edg\//.test(userAgent)) return 'Edge';
  if (/Chrome\//.test(userAgent) && !/Chromium\//.test(userAgent)) return 'Chrome';
  if (/Firefox\//.test(userAgent)) return 'Firefox';
  if (/Safari\//.test(userAgent) && !/Chrome\//.test(userAgent)) return 'Safari';
  return 'Browser';
};

const getPlatformName = () => {
  if (typeof navigator === 'undefined') return 'Unknown platform';
  const platform = navigator.userAgentData?.platform || navigator.platform || 'Unknown platform';
  if (/Win/i.test(platform)) return 'Windows';
  if (/Mac/i.test(platform)) return 'macOS';
  if (/Linux/i.test(platform)) return 'Linux';
  if (/Android/i.test(platform)) return 'Android';
  if (/iPhone|iPad|iPod/i.test(platform)) return 'iOS';
  return platform;
};

export const getBackupDeviceLabel = (metadata = {}) => {
  if (metadata.deviceLabel) return metadata.deviceLabel;
  const browserName = metadata.browserName || 'Browser';
  const platform = metadata.platform || 'device';
  return `${browserName} on ${platform}`;
};

export const createBackupMetadata = (plannerData = loadData()) => {
  const completionStats = getCompletionStats(plannerData, defaultChapters);
  const browserName = getBrowserName();
  const platform = getPlatformName();

  return {
    deviceLabel: `${browserName} on ${platform}`,
    browserName,
    platform,
    plannerVersion: STORAGE_VERSION,
    chapterCount: completionStats.total,
    completedChapters: completionStats.completed,
    totalStudySeconds: getTotalStudySeconds(plannerData),
    dailySessionCount: Object.values(plannerData?.dailySessions ?? {}).filter((session) => safeNumber(session?.totalSeconds) > 0).length,
  };
};

export const createBackupPayload = () => {
  const now = new Date().toISOString();
  const plannerData = loadData();

  return {
    app: 'JEE Planner',
    backupVersion: 1,
    createdAt: getCloudBackupSettings().createdAt ?? now,
    updatedAt: now,
    metadata: createBackupMetadata(plannerData),
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

export const getBackupTimestamp = (date = new Date()) => date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z');
export const getTimestampedBackupFileName = (date = new Date()) => `${MANAGED_BACKUP_PREFIX}${getBackupTimestamp(date)}${MANAGED_BACKUP_SUFFIX}`;

const parseManagedBackupTimestamp = (name) => {
  const match = name?.match(/^jee-planner-backup-(\d{8}T\d{6}Z)\.json$/);
  if (!match) return null;
  const value = match[1];
  return `${value.slice(0, 4)}-${value.slice(4, 6)}-${value.slice(6, 8)}T${value.slice(9, 11)}:${value.slice(11, 13)}:${value.slice(13, 15)}Z`;
};

const isManagedTimestampedBackup = (file) => Boolean(parseManagedBackupTimestamp(file?.name));
const isLegacyBackup = (file) => file?.name === LEGACY_BACKUP_FILE_NAME;

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
  const query = encodeURIComponent(`(name contains '${MANAGED_BACKUP_PREFIX}' or name='${LEGACY_BACKUP_FILE_NAME}') and trashed=false`);
  const url = `${DRIVE_FILES_ENDPOINT}?spaces=appDataFolder&q=${query}&fields=files(id,name,modifiedTime,size)&pageSize=100`;
  const response = await driveFetch(url);
  const result = await response.json();
  return (result.files ?? []).filter((file) => isManagedTimestampedBackup(file) || isLegacyBackup(file));
};

export const sortBackupFilesNewestFirst = (files) => [...files].sort((a, b) => {
  const aTime = Date.parse(parseManagedBackupTimestamp(a.name) || a.modifiedTime || 0);
  const bTime = Date.parse(parseManagedBackupTimestamp(b.name) || b.modifiedTime || 0);
  return bTime - aTime;
});

export const getBackupStorageSummary = (files) => {
  if (!files?.length) return 'Backup storage: 0 KB across 0 backups';
  if (files.some((file) => file.size === undefined || file.size === null)) return 'Backup storage: unavailable';
  const totalBytes = files.reduce((total, file) => total + safeNumber(file.size), 0);
  const kb = Math.max(1, Math.round(totalBytes / 1024));
  return `Backup storage: ${kb} KB across ${files.length} backup${files.length === 1 ? '' : 's'}`;
};

const downloadBackupPayloadById = async (fileId) => {
  const response = await driveFetch(`${DRIVE_FILES_ENDPOINT}/${fileId}?alt=media`);
  let payload;
  try {
    payload = await response.json();
  } catch {
    throw new Error('The cloud backup is corrupt JSON.');
  }
  validateBackupPayload(payload);
  return payload;
};

const enrichBackupFile = async (file) => {
  try {
    const payload = await downloadBackupPayloadById(file.id);
    return { ...file, backupUpdatedAt: payload.updatedAt, metadata: payload.metadata ?? createBackupMetadata(payload.data?.planner), isValid: true };
  } catch (error) {
    return { ...file, isValid: false, error: error.message || 'Invalid backup payload' };
  }
};

export const listBackupHistory = async () => {
  if (!navigator.onLine) throw new Error('You are offline. Backup is unavailable.');
  const files = await findBackupFiles();
  const timestamped = sortBackupFilesNewestFirst(files.filter(isManagedTimestampedBackup));
  const enrichedTimestamped = await Promise.all(timestamped.map(enrichBackupFile));
  const validTimestamped = enrichedTimestamped.filter((file) => file.isValid).slice(0, MAX_BACKUP_HISTORY);
  const legacy = files.find(isLegacyBackup);
  const enrichedLegacy = legacy ? await enrichBackupFile({ ...legacy, legacy: true }) : null;
  const visibleLegacy = enrichedLegacy?.isValid ? [enrichedLegacy] : [];

  return {
    files: [...validTimestamped, ...visibleLegacy],
    storageSummary: getBackupStorageSummary(validTimestamped),
  };
};

export const findBackupFile = async () => {
  const history = await listBackupHistory();
  return history.files[0] ?? null;
};

const cleanupBackupHistory = async () => {
  const files = await findBackupFiles();
  const timestamped = sortBackupFilesNewestFirst(files.filter(isManagedTimestampedBackup));
  const enrichedTimestamped = await Promise.all(timestamped.map(enrichBackupFile));
  const validTimestamped = enrichedTimestamped.filter((file) => file.isValid);
  const validIdsToKeep = new Set(validTimestamped.slice(0, MAX_BACKUP_HISTORY).map((file) => file.id));
  const olderValidTimestamped = validTimestamped.filter((file) => !validIdsToKeep.has(file.id));
  const legacy = files.filter(isLegacyBackup);
  const cleanupTargets = validTimestamped.length > 0 ? [...olderValidTimestamped, ...legacy] : olderValidTimestamped;
  await Promise.all(cleanupTargets.map((file) => driveFetch(`${DRIVE_FILES_ENDPOINT}/${file.id}`, { method: 'DELETE' }).catch(() => null)));
};

const uploadNewBackupFile = async (payload) => {
  const metadata = { name: getTimestampedBackupFileName(new Date(payload.updatedAt)), parents: ['appDataFolder'], mimeType: 'application/json' };
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

  const response = await driveFetch(`${DRIVE_UPLOAD_ENDPOINT}?uploadType=multipart&fields=id,name,modifiedTime,size`, {
    method: 'POST',
    headers: { 'Content-Type': `multipart/related; boundary=${boundary}` },
    body,
  });
  return response.json();
};

export const uploadBackup = async () => {
  if (!navigator.onLine) throw new Error('You are offline. Backup is unavailable.');

  const payload = createBackupPayload();
  validateBackupPayload(payload);
  const file = await uploadNewBackupFile(payload);
  await cleanupBackupHistory();
  saveCloudBackupSettings({ createdAt: payload.createdAt, lastCloudFileId: file.id });
  clearBackupDirty(payload.updatedAt);
  return { payload, file };
};

export const downloadBackup = async (fileId = null) => {
  if (!navigator.onLine) throw new Error('You are offline. Backup is unavailable.');

  const file = fileId ? { id: fileId } : await findBackupFile();
  if (!file) throw new Error('No cloud backup was found.');

  return downloadBackupPayloadById(file.id);
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
