
import React from 'react';
import { ChevronLeft, ChevronRight, Calendar, Grid, List } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format, addWeeks, subWeeks, addDays, subDays } from 'date-fns';

interface CalendarHeaderProps {
  currentView: 'daily' | 'weekly';
  setCurrentView: (view: 'daily' | 'weekly') => void;
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
}

const CalendarHeader = ({ 
  currentView, 
  setCurrentView, 
  selectedDate, 
  setSelectedDate 
}: CalendarHeaderProps) => {
  const navigateDate = (direction: 'prev' | 'next') => {
    if (currentView === 'weekly') {
      setSelectedDate(direction === 'next' 
        ? addWeeks(selectedDate, 1) 
        : subWeeks(selectedDate, 1)
      );
    } else {
      setSelectedDate(direction === 'next' 
        ? addDays(selectedDate, 1) 
        : subDays(selectedDate, 1)
      );
    }
  };

  const goToToday = () => {
    setSelectedDate(new Date());
  };

  const getDateDisplayText = () => {
    if (currentView === 'weekly') {
      return format(selectedDate, 'MMM yyyy');
    } else {
      return format(selectedDate, 'MMMM d, yyyy');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-4">
      <div className="flex items-center justify-between">
        {/* Date Navigation */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateDate('prev')}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-gray-500" />
              <span className="text-lg font-semibold text-gray-900 min-w-[200px]">
                {getDateDisplayText()}
              </span>
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateDate('next')}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={goToToday}
            className="text-blue-600 border-blue-200 hover:bg-blue-50"
          >
            Today
          </Button>
        </div>

        {/* View Toggle */}
        <div className="flex items-center bg-gray-100 rounded-lg p-1">
          <Button
            variant={currentView === 'daily' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setCurrentView('daily')}
            className={currentView === 'daily' ? 'bg-white shadow-sm' : ''}
          >
            <List className="h-4 w-4 mr-2" />
            Daily
          </Button>
          <Button
            variant={currentView === 'weekly' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setCurrentView('weekly')}
            className={currentView === 'weekly' ? 'bg-white shadow-sm' : ''}
          >
            <Grid className="h-4 w-4 mr-2" />
            Weekly
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CalendarHeader;
