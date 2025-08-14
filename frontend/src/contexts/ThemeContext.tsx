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
  toggleAnimations: () => void;
  toggleHighContrast: () => void;
  toggleReduceMotion: () => void;
  resetToDefaults: () => void;
  isDarkMode: boolean;
};

const defaultConfig: ThemeConfig = {
  theme: 'system',
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
    // Load saved config
    const savedConfig = localStorage.getItem('theme-config');
    if (savedConfig) {
      setConfig(JSON.parse(savedConfig));
    }
  }, []);

  useEffect(() => {
    // Determine if dark mode should be active
    const shouldBeDark = config.theme === 'dark' || 
      (config.theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    
    setIsDarkMode(shouldBeDark);
    
    // Apply theme to document
    const root = document.documentElement;
    root.classList.toggle('dark', shouldBeDark);
    root.setAttribute('data-color-scheme', config.colorScheme);
    root.setAttribute('data-font-size', config.fontSize);
    root.classList.toggle('high-contrast', config.highContrast);
    root.classList.toggle('reduce-motion', config.reduceMotion);
    root.classList.toggle('no-animations', !config.animations);

    // Save config
    localStorage.setItem('theme-config', JSON.stringify(config));
  }, [config]);

  const setTheme = (theme: Theme) => {
    setConfig(prev => ({ ...prev, theme }));
  };

  const setColorScheme = (colorScheme: ColorScheme) => {
    setConfig(prev => ({ ...prev, colorScheme }));
  };

  const setFontSize = (fontSize: 'small' | 'medium' | 'large') => {
    setConfig(prev => ({ ...prev, fontSize }));
  };

  const toggleAnimations = () => {
    setConfig(prev => ({ ...prev, animations: !prev.animations }));
  };

  const toggleHighContrast = () => {
    setConfig(prev => ({ ...prev, highContrast: !prev.highContrast }));
  };

  const toggleReduceMotion = () => {
    setConfig(prev => ({ ...prev, reduceMotion: !prev.reduceMotion }));
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
