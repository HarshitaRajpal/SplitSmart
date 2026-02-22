import { createContext, useContext, useMemo, useState, useEffect } from 'react';
import { ConfigProvider, theme } from 'antd';

const themes = {
  light: {
    algorithm: undefined,
    token: {
      colorPrimary: '#6366f1',
      borderRadius: 12,
      fontFamily: '"Outfit", "DM Sans", sans-serif',
    },
  },
  dark: {
    algorithm: 'dark',
    token: {
      colorPrimary: '#818cf8',
      borderRadius: 12,
      fontFamily: '"Outfit", "DM Sans", sans-serif',
    },
  },
  ocean: {
    algorithm: undefined,
    token: {
      colorPrimary: '#0ea5e9',
      colorBgContainer: '#f0f9ff',
      borderRadius: 12,
      fontFamily: '"Outfit", "DM Sans", sans-serif',
    },
  },
  forest: {
    algorithm: undefined,
    token: {
      colorPrimary: '#22c55e',
      colorBgContainer: '#f0fdf4',
      borderRadius: 12,
      fontFamily: '"Outfit", "DM Sans", sans-serif',
    },
  },
  sunset: {
    algorithm: undefined,
    token: {
      colorPrimary: '#f97316',
      colorBgContainer: '#fff7ed',
      borderRadius: 12,
      fontFamily: '"Outfit", "DM Sans", sans-serif',
    },
  },
};

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [themeName, setThemeName] = useState(() => localStorage.getItem('splitsmart-theme') || 'light');

  useEffect(() => {
    localStorage.setItem('splitsmart-theme', themeName);
    document.documentElement.setAttribute('data-theme', themeName);
  }, [themeName]);

  const config = useMemo(() => {
    const t = themes[themeName] || themes.light;
    const algorithm = t.algorithm === 'dark' ? theme.darkAlgorithm : undefined;
    return {
      theme: {
        token: t.token,
        algorithm: algorithm,
      },
    };
  }, [themeName]);

  return (
    <ThemeContext.Provider value={{ themeName, setThemeName, themes: Object.keys(themes) }}>
      <ConfigProvider {...config}>{children}</ConfigProvider>
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
