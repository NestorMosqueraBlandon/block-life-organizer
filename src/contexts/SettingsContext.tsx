
import React, { createContext, useContext, useState, useEffect } from 'react';

export interface NotificationSettings {
  enabled: boolean;
  defaultReminder: number; // minutes before event
  soundEnabled: boolean;
  browserNotifications: boolean;
}

export interface CalendarSettings {
  defaultView: 'daily' | 'weekly';
  workingHours: {
    start: string;
    end: string;
  };
  weekStartsOn: 0 | 1; // 0 = Sunday, 1 = Monday
  notifications: NotificationSettings;
  theme: 'light' | 'dark' | 'system';
}

const defaultSettings: CalendarSettings = {
  defaultView: 'weekly',
  workingHours: {
    start: '09:00',
    end: '17:00'
  },
  weekStartsOn: 1,
  notifications: {
    enabled: true,
    defaultReminder: 15,
    soundEnabled: true,
    browserNotifications: true
  },
  theme: 'system'
};

interface SettingsContextType {
  settings: CalendarSettings;
  updateSettings: (newSettings: Partial<CalendarSettings>) => void;
  resetSettings: () => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<CalendarSettings>(defaultSettings);

  useEffect(() => {
    const savedSettings = localStorage.getItem('calendar-settings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setSettings({ ...defaultSettings, ...parsed });
      } catch (error) {
        console.error('Failed to parse saved settings:', error);
      }
    }
  }, []);

  const updateSettings = (newSettings: Partial<CalendarSettings>) => {
    const updatedSettings = { ...settings, ...newSettings };
    setSettings(updatedSettings);
    localStorage.setItem('calendar-settings', JSON.stringify(updatedSettings));
  };

  const resetSettings = () => {
    setSettings(defaultSettings);
    localStorage.setItem('calendar-settings', JSON.stringify(defaultSettings));
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, resetSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
