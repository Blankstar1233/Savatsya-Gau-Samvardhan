import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Theme = 'light' | 'dark' | 'system';
export type ColorScheme = 'default' | 'warm' | 'cool' | 'vintage';

export interface ThemeConfig {
  theme: Theme;
  colorScheme: ColorScheme;
  fontSize: 'small' | 'medium' | 'large';
  animations: boolean;
  highContrast: boolean;
  reduceMotion: boolean;
}

type ThemeContextType = {
  config: ThemeConfig;
  setTheme: (theme: Theme) => void;
  setColorScheme: (scheme: ColorScheme) => void;
  setFontSize: (size: 'small' | 'medium' | 'large') => void;
  toggleAnimations: (value?: boolean) => void;
  toggleHighContrast: (value?: boolean) => void;
  toggleReduceMotion: (value?: boolean) => void;
  resetToDefaults: () => void;
  isDarkMode: boolean;
};

const defaultConfig: ThemeConfig = {
  theme: 'light',
  colorScheme: 'default',
  fontSize: 'medium',
  animations: true,
  highContrast: false,
  reduceMotion: false
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [config, setConfig] = useState<ThemeConfig>(defaultConfig);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    // Load saved config or use defaults
    const savedConfig = localStorage.getItem('theme-config');
    if (savedConfig) {
      const parsed = JSON.parse(savedConfig);
      // Force override if it's still set to 'system' (migration from old default)
      if (parsed.theme === 'system') {
        parsed.theme = 'light';
      }
      setConfig(parsed);
    }
  }, []);

  useEffect(() => {
   
    const shouldBeDark = config.theme === 'dark' || 
      (config.theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    
    setIsDarkMode(shouldBeDark);
    
   
    const root = document.documentElement;
    if (shouldBeDark) root.classList.add('dark'); else root.classList.remove('dark');
    root.setAttribute('data-color-scheme', config.colorScheme);
    root.setAttribute('data-font-size', config.fontSize);
    if (config.highContrast) root.classList.add('high-contrast'); else root.classList.remove('high-contrast');
    if (config.reduceMotion) root.classList.add('reduce-motion'); else root.classList.remove('reduce-motion');
    if (!config.animations) root.classList.add('no-animations'); else root.classList.remove('no-animations');

   
    localStorage.setItem('theme-config', JSON.stringify(config));

   
    try { window.dispatchEvent(new CustomEvent('theme:updated', { detail: config })); } catch (e) {}
  }, [config]);

  const setTheme = (theme: Theme) => {
    setConfig(prev => ({ ...prev, theme }));
  };

  const setColorScheme = (colorScheme: ColorScheme) => {
    setConfig(prev => ({ ...prev, colorScheme }));
    const token = localStorage.getItem('token');
    if (token) {
      fetch('/api/user/preferences', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ uiConfig: { colorScheme } })
      }).catch(() => {});
    }
  };

  const setFontSize = (fontSize: 'small' | 'medium' | 'large') => {
    setConfig(prev => ({ ...prev, fontSize }));
    const token = localStorage.getItem('token');
    if (token) {
      fetch('/api/user/preferences', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ uiConfig: { fontSize } })
      }).catch(() => {});
    }
  };

  const toggleAnimations = (value?: boolean) => {
    setConfig(prev => {
      const animations = typeof value === 'boolean' ? value : !prev.animations;
      const next = { ...prev, animations };
      const token = localStorage.getItem('token');
      if (token) {
        fetch('/api/user/preferences', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ uiConfig: { animations } })
        }).catch(() => {});
      }
      return next;
    });
  };

  const toggleHighContrast = (value?: boolean) => {
    setConfig(prev => {
      const highContrast = typeof value === 'boolean' ? value : !prev.highContrast;
      const next = { ...prev, highContrast };
      const token = localStorage.getItem('token');
      if (token) {
        fetch('/api/user/preferences', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ uiConfig: { highContrast } })
        }).catch(() => {});
      }
      return next;
    });
  };

  const toggleReduceMotion = (value?: boolean) => {
    setConfig(prev => {
      const reduceMotion = typeof value === 'boolean' ? value : !prev.reduceMotion;
      const next = { ...prev, reduceMotion };
      const token = localStorage.getItem('token');
      if (token) {
        fetch('/api/user/preferences', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ uiConfig: { reduceMotion } })
        }).catch(() => {});
      }
      return next;
    });
  };

  const resetToDefaults = () => {
    setConfig(defaultConfig);
  };

  return (
    <ThemeContext.Provider value={{
      config,
      setTheme,
      setColorScheme,
      setFontSize,
      toggleAnimations,
      toggleHighContrast,
      toggleReduceMotion,
      resetToDefaults,
      isDarkMode
    }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
