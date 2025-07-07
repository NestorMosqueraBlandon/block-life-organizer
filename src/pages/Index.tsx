
import React from 'react';
import CalendarApp from '../components/CalendarApp';
import { SettingsProvider } from '../contexts/SettingsContext';

const Index = () => {
  return (
    <SettingsProvider>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <CalendarApp />
      </div>
    </SettingsProvider>
  );
};

export default Index;
