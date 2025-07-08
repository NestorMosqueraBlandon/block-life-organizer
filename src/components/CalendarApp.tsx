import React, { useState, useEffect } from 'react';
import { Calendar, Plus, Settings, Bell, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import CalendarHeader from './CalendarHeader';
import WeeklyView from './WeeklyView';
import DailyView from './DailyView';
import BlockModal from './BlockModal';
import SettingsModal from './SettingsModal';
import NotificationsPanel from './NotificationsPanel';
import { CalendarBlock } from '../types/calendar';
import { useCalendarDB } from '../hooks/useCalendarDB';
import { useNotifications } from '../hooks/useNotifications';
import { useSettings } from '../contexts/SettingsContext';
import { Skeleton } from '@/components/ui/skeleton';
import { useNavigate } from 'react-router-dom';
import { useCustomCategories } from '../hooks/useCustomCategories';

const CalendarApp = () => {
  const { settings } = useSettings();
  const [currentView, setCurrentView] = useState<'daily' | 'weekly'>(settings.defaultView);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [editingBlock, setEditingBlock] = useState<CalendarBlock | null>(null);

  const { blocks, isLoading, error, addBlock, updateBlock, deleteBlock } = useCalendarDB();
  const { getAllCategories, refetch: refetchCategories } = useCustomCategories();
  
  // Initialize notifications
  useNotifications(blocks);

  const navigate = useNavigate();
  const username = localStorage.getItem('username');
  const name = localStorage.getItem('name');

  useEffect(() => {
    const openSettings = () => setIsSettingsOpen(true);
    const openNotifications = () => setIsNotificationsOpen(true);
    window.addEventListener('open-settings', openSettings);
    window.addEventListener('open-notifications', openNotifications);
    return () => {
      window.removeEventListener('open-settings', openSettings);
      window.removeEventListener('open-notifications', openNotifications);
    };
  }, []);

  const handleAddBlock = () => {
    setEditingBlock(null);
    setIsModalOpen(true);
  };

  const handleEditBlock = (block: CalendarBlock) => {
    setEditingBlock(block);
    setIsModalOpen(true);
  };

  const handleSaveBlock = async (blockData: Omit<CalendarBlock, 'id'>) => {
    try {
      if (editingBlock) {
        await updateBlock({ ...blockData, id: editingBlock.id });
      } else {
        await addBlock(blockData);
      }
      setIsModalOpen(false);
      setEditingBlock(null);
    } catch (error) {
      console.error('Failed to save block:', error);
    }
  };

  const handleDeleteBlock = async (blockId: string) => {
    try {
      await deleteBlock(blockId);
    } catch (error) {
      console.error('Failed to delete block:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('name');
    localStorage.removeItem('email');
    navigate('/login');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-3">
              <Skeleton className="h-10 w-10 rounded-lg" />
              <div>
                <Skeleton className="h-8 w-48 mb-2" />
                <Skeleton className="h-4 w-64" />
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Skeleton className="h-9 w-32" />
              <Skeleton className="h-9 w-24" />
              <Skeleton className="h-9 w-28" />
            </div>
          </div>
          <Skeleton className="h-96 w-full rounded-lg" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-2">Database Error</h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto px-2 md:px-4 py-4 md:py-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 md:mb-8 gap-3 md:gap-0">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-600 rounded-lg">
              <Calendar className="h-6 w-6 text-white" />
            </div>
            <div className="flex flex-col">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 leading-tight">Personal Calendar</h1>
              <p className="text-gray-600 text-sm md:text-base">Manage your time blocks efficiently</p>
              {name && (
                <span className="text-blue-700 text-sm font-semibold mt-1">Welcome, {name}!</span>
              )}
            </div>
          </div>
          <div className="flex items-center justify-between md:justify-end w-full md:w-auto mt-2 md:mt-0 gap-2 md:gap-3">
            <div className="flex items-center space-x-2 overflow-x-auto scrollbar-hide">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setIsNotificationsOpen(true)}
                className="min-w-[40px]"
              >
                <Bell className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Notifications</span>
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setIsSettingsOpen(true)}
                className="min-w-[40px]"
              >
                <Settings className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Settings</span>
              </Button>
              <Button onClick={handleAddBlock} className="bg-blue-600 hover:bg-blue-700 min-w-[40px]">
                <Plus className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Add Block</span>
              </Button>
            </div>
            <div className="ml-2 flex-shrink-0 flex items-center space-x-2">
              <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center">
                <User className="h-5 w-5 text-gray-400" />
              </div>
              <Button variant="outline" size="sm" onClick={handleLogout} className="ml-2">
                Logout
              </Button>
            </div>
          </div>
        </div>

        {/* Calendar Header */}
        <CalendarHeader
          currentView={currentView}
          setCurrentView={setCurrentView}
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
        />

        {/* Calendar Views */}
        <div className="mt-6">
          {currentView === 'weekly' ? (
            <WeeklyView
              selectedDate={selectedDate}
              blocks={blocks}
              onEditBlock={handleEditBlock}
              onDeleteBlock={handleDeleteBlock}
            />
          ) : (
            <DailyView
              selectedDate={selectedDate}
              blocks={blocks}
              onEditBlock={handleEditBlock}
              onDeleteBlock={handleDeleteBlock}
            />
          )}
        </div>

        {/* Modals */}
        <BlockModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveBlock}
          editingBlock={editingBlock}
        />

        <SettingsModal
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
        />

        <NotificationsPanel
          isOpen={isNotificationsOpen}
          onClose={() => setIsNotificationsOpen(false)}
          blocks={blocks}
          onOpenSettings={() => {
            setIsNotificationsOpen(false);
            setIsSettingsOpen(true);
          }}
        />
      </div>
    </div>
  );
};

export default CalendarApp;
