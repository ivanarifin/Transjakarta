import React, {createContext, useContext, useEffect, useState} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {lightColors, darkColors, ThemeColors} from './colors';

type ThemeType = 'light' | 'dark';

interface ThemeContextType {
  theme: ThemeType;
  isDark: boolean;
  colors: ThemeColors;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = '@theme_preference';

export const ThemeProvider: React.FC<{children: React.ReactNode}> = ({
  children,
}) => {
  const [theme, setTheme] = useState<ThemeType>('light');

  useEffect(() => {
    const loadTheme = async () => {
      try {
        // Check if AsyncStorage is available before using it
        if (AsyncStorage) {
          const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
          if (savedTheme === 'light' || savedTheme === 'dark') {
            setTheme(savedTheme);
          }
        }
      } catch (error: any) {
        // Gracefully handle "Native module is null" error which can happen in some environments
        if (error?.message?.includes('Native module is null')) {
          console.warn('AsyncStorage native module not available, using default theme');
        } else {
          console.error('Failed to load theme preference', error);
        }
      }
    };
    loadTheme();
  }, []);

  const toggleTheme = React.useCallback(async () => {
    setTheme(prev => {
      const newTheme = prev === 'light' ? 'dark' : 'light';
      // Save to AsyncStorage as a side effect
      if (AsyncStorage) {
        AsyncStorage.setItem(THEME_STORAGE_KEY, newTheme).catch(error => {
          if (error?.message?.includes('Native module is null')) {
            console.warn('AsyncStorage native module not available, theme preference not saved');
          } else {
            console.error('Failed to save theme preference', error);
          }
        });
      }
      return newTheme;
    });
  }, []);

  const isDark = theme === 'dark';
  const colors = isDark ? darkColors : lightColors;

  return (
    <ThemeContext.Provider value={{theme, isDark, colors, toggleTheme}}>
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
