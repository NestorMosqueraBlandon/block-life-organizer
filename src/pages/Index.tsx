import React, { useEffect } from 'react';
import CalendarApp from '../components/CalendarApp';
import { SettingsProvider } from '../contexts/SettingsContext';
import { useNavigate } from 'react-router-dom';

const Index = () => {
  const navigate = useNavigate();
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) navigate('/login');
  }, [navigate]);

  // Only render if authenticated
  if (!localStorage.getItem('token')) return null;

  return (
    <SettingsProvider>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <CalendarApp />
      </div>
    </SettingsProvider>
  );
};

export default Index;
