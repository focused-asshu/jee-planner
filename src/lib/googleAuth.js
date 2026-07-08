const GIS_SCRIPT_ID = 'google-identity-services';
const GIS_SCRIPT_SRC = 'https://accounts.google.com/gsi/client';
const GIS_LOAD_TIMEOUT_MS = 15000;

const normalizeEnvValue = (value) => (typeof value === 'string' ? value.trim() : '');

const GOOGLE_CLIENT_ID = normalizeEnvValue(import.meta.env.VITE_GOOGLE_CLIENT_ID);
const DRIVE_APPDATA_SCOPE = 'https://www.googleapis.com/auth/drive.appdata https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email';

let gisScriptPromise;
let tokenClient;
let accessToken = null;
let tokenExpiresAt = 0;
let currentProfile = null;

const isOnline = () => typeof navigator === 'undefined' || navigator.onLine;
const hasGoogleOAuth = () => Boolean(window.google?.accounts?.oauth2?.initTokenClient);

export const getGoogleClientId = () => GOOGLE_CLIENT_ID;
export const getDriveScope = () => DRIVE_APPDATA_SCOPE;
export const isGoogleSignInConfigured = () => Boolean(GOOGLE_CLIENT_ID);

const resolveLoadedGoogle = () => {
  if (!hasGoogleOAuth()) {
    throw new Error('Google Sign-In loaded, but OAuth is unavailable. Please refresh and try again.');
  }

  return window.google;
};

export const loadGoogleIdentityServices = () => {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('Google Sign-In is only available in the browser.'));
  }

  if (hasGoogleOAuth()) {
    return Promise.resolve(window.google);
  }

  if (!gisScriptPromise) {
    gisScriptPromise = new Promise((resolve, reject) => {
      let timeoutId;
      const finish = (callback) => {
        window.clearTimeout(timeoutId);
        callback();
      };
      const resolveGoogle = () => finish(() => {
        try {
          resolve(resolveLoadedGoogle());
        } catch (error) {
          reject(error);
        }
      });
      const rejectGoogle = () => finish(() => reject(new Error('Unable to load Google Sign-In.')));
      const existingScript = document.getElementById(GIS_SCRIPT_ID);

      timeoutId = window.setTimeout(rejectGoogle, GIS_LOAD_TIMEOUT_MS);

      if (existingScript) {
        if (hasGoogleOAuth()) {
          resolveGoogle();
          return;
        }

        existingScript.addEventListener('load', resolveGoogle, { once: true });
        existingScript.addEventListener('error', rejectGoogle, { once: true });
        return;
      }

      const script = document.createElement('script');
      script.id = GIS_SCRIPT_ID;
      script.src = GIS_SCRIPT_SRC;
      script.async = true;
      script.defer = true;
      script.onload = resolveGoogle;
      script.onerror = rejectGoogle;
      document.head.appendChild(script);
    }).catch((error) => {
      gisScriptPromise = null;
      throw error;
    });
  }

  return gisScriptPromise;
};

const fetchProfile = async (token) => {
  const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    throw new Error('Unable to read your Google profile.');
  }

  const profile = await response.json();
  return {
    name: profile.name ?? profile.email ?? 'Google user',
    email: profile.email ?? '',
    picture: profile.picture ?? '',
  };
};

const verifyGrantedScopes = (google, response) => {
  const hasAllScopes = google.accounts.oauth2.hasGrantedAllScopes(response, ...DRIVE_APPDATA_SCOPE.split(' '));

  if (!hasAllScopes) {
    throw new Error('Google Drive AppData permission is required to back up your planner.');
  }
};

const requestToken = async ({ prompt = '' } = {}) => {
  if (!GOOGLE_CLIENT_ID) {
    throw new Error('Google Sign-In is not configured. Add VITE_GOOGLE_CLIENT_ID to your environment.');
  }

  if (!isOnline()) {
    throw new Error('You are offline. Backup is unavailable.');
  }

  const google = await loadGoogleIdentityServices();

  return new Promise((resolve, reject) => {
    tokenClient = google.accounts.oauth2.initTokenClient({
      client_id: GOOGLE_CLIENT_ID,
      scope: DRIVE_APPDATA_SCOPE,
      prompt,
      callback: async (response) => {
        if (response.error) {
          reject(new Error(response.error === 'access_denied' ? 'Google sign-in was cancelled.' : 'Google sign-in failed.'));
          return;
        }

        try {
          verifyGrantedScopes(google, response);
          accessToken = response.access_token;
          tokenExpiresAt = Date.now() + Math.max(0, Number(response.expires_in ?? 3600) - 60) * 1000;
          currentProfile = await fetchProfile(accessToken);
          resolve({ accessToken, profile: currentProfile });
        } catch (error) {
          reject(error);
        }
      },
      error_callback: () => reject(new Error('Google sign-in was cancelled.')),
    });

    tokenClient.requestAccessToken({ prompt });
  });
};

export const connectGoogle = () => requestToken({ prompt: 'consent select_account' });

export const getAccessToken = async () => {
  if (accessToken && Date.now() < tokenExpiresAt) {
    return accessToken;
  }

  const result = await requestToken({ prompt: '' });
  return result.accessToken;
};

export const getGoogleProfile = () => currentProfile;

export const disconnectGoogle = () => {
  if (accessToken && window.google?.accounts?.oauth2) {
    window.google.accounts.oauth2.revoke(accessToken, () => {});
  }

  accessToken = null;
  tokenExpiresAt = 0;
  currentProfile = null;
};
