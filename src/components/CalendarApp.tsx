
import React, { useState } from 'react';
import { Calendar, Plus, Settings, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import CalendarHeader from './CalendarHeader';
import WeeklyView from './WeeklyView';
import DailyView from './DailyView';
import BlockModal from './BlockModal';
import { CalendarBlock } from '../types/calendar';
import { useCalendarDB } from '../hooks/useCalendarDB';
import { Skeleton } from '@/components/ui/skeleton';

const CalendarApp = () => {
  const [currentView, setCurrentView] = useState<'daily' | 'weekly'>('weekly');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBlock, setEditingBlock] = useState<CalendarBlock | null>(null);

  const { blocks, isLoading, error, addBlock, updateBlock, deleteBlock } = useCalendarDB();

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
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-600 rounded-lg">
              <Calendar className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Personal Calendar</h1>
              <p className="text-gray-600">Manage your time blocks efficiently</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <Button variant="outline" size="sm">
              <Bell className="h-4 w-4 mr-2" />
              Notifications
            </Button>
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
            <Button onClick={handleAddBlock} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Add Block
            </Button>
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

        {/* Block Modal */}
        <BlockModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveBlock}
          editingBlock={editingBlock}
        />
      </div>
    </div>
  );
};

export default CalendarApp;
