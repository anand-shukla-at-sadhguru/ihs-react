import { useEffect, useState } from 'react';

type Theme = 'dark' | 'light' | 'system';

export function useTheme(): [Theme, (theme: Theme) => void] {
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('theme') as Theme) || 'system';
    }
    return 'system'; // Default for SSR or initial load before mount
  });

  useEffect(() => {
    const isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const currentTheme = theme === 'system' ? (isDarkMode ? 'dark' : 'light') : theme;

    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(currentTheme);

    // Update meta theme-color
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
       metaThemeColor.setAttribute('content', currentTheme === 'dark' ? '#0f172a' : '#ffffff');
    }

  }, [theme]);

  const setTheme = (newTheme: Theme) => {
    localStorage.setItem('theme', newTheme);
    setThemeState(newTheme);
  };

  // Optional: Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
        if (theme === 'system') {
            const newSystemTheme = mediaQuery.matches ? 'dark' : 'light';
            const root = window.document.documentElement;
            root.classList.remove('light', 'dark');
            root.classList.add(newSystemTheme);
             const metaThemeColor = document.querySelector('meta[name="theme-color"]');
            if (metaThemeColor) {
                metaThemeColor.setAttribute('content', newSystemTheme === 'dark' ? '#0f172a' : '#ffffff');
            }
        }
    };
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);


  return [theme, setTheme];
}