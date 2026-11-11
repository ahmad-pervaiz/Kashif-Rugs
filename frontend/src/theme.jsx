import { createContext, useContext, useEffect, useState } from 'react';
const ThemeContext = createContext(null);
const valid = value => value === 'light' || value === 'dark';
export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light');
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
    try { localStorage.setItem('kashifRugsTheme', theme); } catch { /* The toggle still works when storage is unavailable. */ }
  }, [theme]);
  useEffect(() => {
    const sync = event => { if (event.key === 'kashifRugsTheme' && valid(event.newValue)) setTheme(event.newValue); };
    window.addEventListener('storage', sync);
    return () => window.removeEventListener('storage', sync);
  }, []);
  return <ThemeContext.Provider value={{ theme, toggleTheme: () => setTheme(value => value === 'dark' ? 'light' : 'dark') }}>{children}</ThemeContext.Provider>;
}
export function useTheme() {
  const value = useContext(ThemeContext);
  if (!value) throw new Error('useTheme requires ThemeProvider');
  return value;
}
