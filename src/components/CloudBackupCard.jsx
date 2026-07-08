import { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, Clock, RotateCcw, Square } from 'lucide-react';
import { connectGoogle, disconnectGoogle, getGoogleProfile } from '../lib/googleAuth';
import {
  AUTO_SAVE_DEBOUNCE_MS,
  downloadBackup,
  getCloudBackupSettings,
  getLastLocalUpdate,
  restoreBackupPayload,
  saveCloudBackupSettings,
  shouldAutoBackup,
  uploadBackup,
} from '../lib/googleDriveBackup';
import { loadData } from '../lib/storage';

const formatDateTime = (value) => {
  if (!value) return 'Never';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Unknown';
  return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(date);
};

const isOffline = () => typeof navigator !== 'undefined' && !navigator.onLine;

const getBackupStatusLabel = ({ online, isSaving, lastError, dirty }) => {
  if (!online) return 'Offline — changes stored locally';
  if (isSaving) return 'Saving...';
  if (lastError) return 'Backup failed — will retry automatically';
  if (dirty) return 'Unsaved changes — autosave pending';
  return '✓ All changes saved';
};

export function CloudBackupCard({ plannerData, onRestoreComplete }) {
  const [profile, setProfile] = useState(() => getGoogleProfile());
  const [settings, setSettings] = useState(() => getCloudBackupSettings());
  const [statusMessage, setStatusMessage] = useState('');
  const [isBusy, setIsBusy] = useState(false);
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [autoSaveError, setAutoSaveError] = useState('');
  const [online, setOnline] = useState(() => !isOffline());

  const isConnected = Boolean(profile);
  const lastLocalUpdate = getLastLocalUpdate();
  const autoBackup = Boolean(settings.autoBackup);
  const dirty = Boolean(settings.dirty);

  const accountLabel = useMemo(() => {
    if (!profile) return 'Not connected';
    return profile.email ? `${profile.name} (${profile.email})` : profile.name;
  }, [profile]);

  const backupStatus = getBackupStatusLabel({ online, isSaving: isAutoSaving || isBusy, lastError: autoSaveError, dirty });

  const refreshSettings = () => setSettings(getCloudBackupSettings());

  const flushAutoSave = async ({ silent = false } = {}) => {
    refreshSettings();

    if (!isConnected || !shouldAutoBackup()) return;

    if (!navigator.onLine) {
      setOnline(false);
      return;
    }

    setIsAutoSaving(true);
    setAutoSaveError('');

    try {
      await uploadBackup();
      refreshSettings();
      if (!silent) setStatusMessage('✓ All changes saved');
    } catch (error) {
      setAutoSaveError(error.message || 'Backup failed — will retry automatically');
      if (!silent) setStatusMessage(error.message || 'Backup failed — will retry automatically');
    } finally {
      setIsAutoSaving(false);
    }
  };

  useEffect(() => {
    const handleOnline = () => {
      setOnline(true);
      window.setTimeout(() => flushAutoSave({ silent: true }), 0);
    };
    const handleOffline = () => setOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [isConnected]);

  useEffect(() => {
    refreshSettings();
  }, [plannerData]);

  useEffect(() => {
    if (!isConnected || !online || !autoBackup || !dirty) return undefined;

    const timeoutId = window.setTimeout(() => flushAutoSave({ silent: true }), AUTO_SAVE_DEBOUNCE_MS);
    return () => window.clearTimeout(timeoutId);
  }, [plannerData, isConnected, online, autoBackup, dirty]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        flushAutoSave({ silent: true });
      }
    };
    const handlePageHide = () => {
      flushAutoSave({ silent: true });
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('pagehide', handlePageHide);
    window.addEventListener('beforeunload', handlePageHide);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('pagehide', handlePageHide);
      window.removeEventListener('beforeunload', handlePageHide);
    };
  }, [isConnected, autoBackup, dirty]);

  const runAction = async (action, successMessage) => {
    setIsBusy(true);
    setStatusMessage('');
    try {
      await action();
      refreshSettings();
      setAutoSaveError('');
      setStatusMessage(successMessage);
    } catch (error) {
      setStatusMessage(error.message || 'Something went wrong. Please try again.');
    } finally {
      setIsBusy(false);
    }
  };

  const handleConnect = () => runAction(async () => {
    const result = await connectGoogle();
    setProfile(result.profile);
  }, 'Google Drive connected. AutoSave will run when enabled.');

  const handleBackup = () => runAction(uploadBackup, '✓ All changes saved');

  const handleRestore = () => runAction(async () => {
    const backup = await downloadBackup();
    const confirmation = [
      'Cloud Backup',
      formatDateTime(backup.updatedAt),
      '',
      'Local Data',
      formatDateTime(lastLocalUpdate),
      '',
      'This will replace your current local data.',
    ].join('\n');

    if (!window.confirm(confirmation)) return;

    restoreBackupPayload(backup);
    onRestoreComplete(loadData());
  }, 'Backup restored. Local planner data was refreshed.');

  const handleDisconnect = () => {
    disconnectGoogle();
    setProfile(null);
    setStatusMessage('Google Drive disconnected. Local data remains on this device.');
  };

  const handleAutoBackupChange = (event) => {
    const nextSettings = { autoBackup: event.target.checked };
    saveCloudBackupSettings(nextSettings);
    refreshSettings();

    if (event.target.checked) {
      window.setTimeout(() => flushAutoSave({ silent: true }), 0);
    }
  };

  return (
    <section className="p-4 sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-ink-muted">Settings</p>
          <h2 className="mt-2 flex items-center gap-2 text-xl font-bold text-ink">
            {online ? <CheckCircle2 className="h-5 w-5 text-sky-600" /> : <Square className="h-5 w-5 text-ember-600" />}
            Cloud Backup
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-ink-muted">
            AutoSave-style backup and restore for your local JEE Planner data with Google Drive AppData. This is not cloud sync.
          </p>
        </div>
        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${isConnected ? 'bg-sky-50 text-sky-700' : 'bg-canvas text-ink-muted'}`}>
          {online ? (isConnected ? 'Connected' : 'Not Connected') : 'Offline'}
        </span>
      </div>

      <div className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
        <Info label="Status" value={online ? (isConnected ? 'Connected' : 'Not Connected') : 'Offline — Backup unavailable.'} />
        <Info label="Backup status" value={backupStatus} />
        <Info label="Google account" value={accountLabel} />
        <Info label="Last Local Update" value={formatDateTime(lastLocalUpdate)} />
        <Info label="Last Cloud Backup" value={formatDateTime(settings.lastCloudBackup)} />
      </div>

      {profile ? (
        <div className="mt-5 flex items-center gap-3 rounded-2xl border border-border bg-white p-3">
          {profile.picture ? <img src={profile.picture} alt="" className="h-10 w-10 rounded-full" /> : null}
          <div>
            <p className="text-xs font-semibold text-ink-muted">Connected as:</p>
            <p className="text-sm font-semibold text-ink">{accountLabel}</p>
          </div>
        </div>
      ) : null}

      <label className="mt-5 flex items-center justify-between gap-4 rounded-2xl border border-border bg-white p-4 text-sm font-semibold text-ink">
        <span>
          Auto Backup
          <span className="block text-xs font-normal text-ink-muted">Debounces uploads for about 60 seconds after changes, flushes on page hide, and retries when you are back online.</span>
        </span>
        <input type="checkbox" checked={autoBackup} onChange={handleAutoBackupChange} disabled={!isConnected || !online} className="h-5 w-5 accent-ember-600" />
      </label>

      <div className="mt-5 flex flex-wrap gap-2">
        {!isConnected ? <Button onClick={handleConnect} disabled={!online || isBusy} icon={CheckCircle2}>Connect Google</Button> : null}
        <Button onClick={handleBackup} disabled={!isConnected || !online || isBusy} icon={CheckCircle2}>Backup Now</Button>
        <Button onClick={handleRestore} disabled={!isConnected || !online || isBusy} icon={RotateCcw}>Restore Backup</Button>
        {isConnected ? <Button onClick={handleDisconnect} disabled={isBusy} icon={Square} variant="secondary">Disconnect</Button> : null}
      </div>

      {(isBusy || isAutoSaving) ? <p className="mt-4 flex items-center gap-2 text-sm text-ink-muted"><Clock className="h-4 w-4 animate-spin" /> {backupStatus}</p> : null}
      {statusMessage ? <p className="mt-4 rounded-xl border border-border bg-canvas px-3 py-2 text-sm text-ink-muted">{statusMessage}</p> : null}
    </section>
  );
}

function Info({ label, value }) {
  return (
    <div className="rounded-2xl border border-border bg-white p-3">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-ink-muted">{label}</p>
      <p className="mt-1 font-medium text-ink">{value}</p>
    </div>
  );
}

function Button({ children, icon: Icon, variant = 'primary', ...props }) {
  const classes = variant === 'primary'
    ? 'bg-ember-600 text-white hover:bg-ember-700'
    : 'border border-border bg-paper text-ink hover:bg-sky-50';
  return (
    <button type="button" className={`inline-flex min-h-11 items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${classes}`} {...props}>
      <Icon className="h-4 w-4" />
      {children}
    </button>
  );
}
