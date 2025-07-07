
import React from 'react';
import { format, startOfWeek, addDays, isSameDay } from 'date-fns';
import { CalendarBlock, CATEGORY_COLORS } from '../types/calendar';
import BlockCard from './BlockCard';

interface WeeklyViewProps {
  selectedDate: Date;
  blocks: CalendarBlock[];
  onEditBlock: (block: CalendarBlock) => void;
  onDeleteBlock: (blockId: string) => void;
}

const WeeklyView = ({ selectedDate, blocks, onEditBlock, onDeleteBlock }: WeeklyViewProps) => {
  const weekStart = startOfWeek(selectedDate, { weekStartsOn: 0 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const getBlocksForDay = (date: Date) => {
    return blocks.filter(block => isSameDay(new Date(block.date), date));
  };

  const timeSlots = Array.from({ length: 24 }, (_, i) => {
    const hour = i.toString().padStart(2, '0');
    return `${hour}:00`;
  });

  return (
    <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
      {/* Week Header */}
      <div className="grid grid-cols-8 border-b">
        <div className="p-4 text-sm font-medium text-gray-500 border-r">Time</div>
        {weekDays.map((day, index) => (
          <div key={index} className="p-4 text-center border-r last:border-r-0">
            <div className="text-sm font-medium text-gray-900">
              {format(day, 'EEE')}
            </div>
            <div className="text-lg font-semibold text-gray-900 mt-1">
              {format(day, 'd')}
            </div>
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="relative overflow-auto max-h-[600px]">
        <div className="grid grid-cols-8">
          {/* Time column */}
          <div className="border-r">
            {timeSlots.map((time, index) => (
              <div
                key={time}
                className={`h-12 px-3 py-2 text-xs text-gray-500 border-b ${
                  index % 2 === 0 ? 'bg-gray-50' : 'bg-white'
                }`}
              >
                {time}
              </div>
            ))}
          </div>

          {/* Days columns */}
          {weekDays.map((day, dayIndex) => (
            <div key={dayIndex} className="border-r last:border-r-0 relative">
              {timeSlots.map((time, timeIndex) => (
                <div
                  key={`${dayIndex}-${timeIndex}`}
                  className={`h-12 border-b ${
                    timeIndex % 2 === 0 ? 'bg-gray-50' : 'bg-white'
                  }`}
                />
              ))}
              
              {/* Blocks for this day */}
              <div className="absolute inset-0 pointer-events-none">
                {getBlocksForDay(day).map((block) => {
                  const startHour = parseInt(block.startTime.split(':')[0]);
                  const endHour = parseInt(block.endTime.split(':')[0]);
                  const top = startHour * 48; // 48px per hour (12px * 4 quarter-hours)
                  const height = (endHour - startHour) * 48;
                  
                  return (
                    <div
                      key={block.id}
                      className="absolute left-1 right-1 pointer-events-auto"
                      style={{
                        top: `${top}px`,
                        height: `${height}px`,
                      }}
                    >
                      <BlockCard
                        block={block}
                        onEdit={() => onEditBlock(block)}
                        onDelete={() => onDeleteBlock(block.id)}
                        compact
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WeeklyView;
