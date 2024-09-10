import { Theme, THEME_STORAGE_KEY, DEFAULT_THEME } from '../config/themeConfig'

export function applyTheme(theme: Theme) {
  const root = window.document.documentElement
  root.classList.remove('light', 'dark')
  root.classList.add(theme)
  localStorage.setItem(THEME_STORAGE_KEY, theme)
}

export function getInitialTheme(): Theme {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(THEME_STORAGE_KEY) as Theme || DEFAULT_THEME
  }
  return DEFAULT_THEME
}