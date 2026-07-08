export const THEME_STORAGE_KEY = 'jee-planner-theme';
export const THEME_OPTIONS = ['light', 'dark', 'system'];

export const getStoredThemePreference = () => {
  if (typeof window === 'undefined') return 'system';
  const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
  return THEME_OPTIONS.includes(storedTheme) ? storedTheme : 'system';
};

export const resolveThemePreference = (preference) => {
  if (preference === 'dark' || preference === 'light') return preference;
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

export const persistThemePreference = (preference) => {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(THEME_STORAGE_KEY, preference);
};
