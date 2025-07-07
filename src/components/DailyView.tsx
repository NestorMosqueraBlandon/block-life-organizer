import React from 'react';
import { format, isSameDay, isAfter, isBefore, parseISO } from 'date-fns';
import { CalendarBlock } from '../types/calendar';
import BlockCard from './BlockCard';

interface DailyViewProps {
  selectedDate: Date;
  blocks: CalendarBlock[];
  onEditBlock: (block: CalendarBlock) => void;
  onDeleteBlock: (blockId: string) => void;
}

const expandRecurringBlocks = (blocks: CalendarBlock[], selectedDate: Date) => {
  return blocks.filter(block => {
    if (!block.recurring) return isSameDay(new Date(block.date), selectedDate);
    const blockStart = parseISO(block.date);
    const endDate = block.recurring.endDate ? parseISO(block.recurring.endDate) : undefined;
    if (isAfter(selectedDate, blockStart) || isSameDay(selectedDate, blockStart)) {
      if (!endDate || isBefore(selectedDate, endDate) || isSameDay(selectedDate, endDate)) {
        if (block.recurring.type === 'daily') return true;
        if (block.recurring.type === 'weekly') {
          if (block.recurring.daysOfWeek && block.recurring.daysOfWeek.length > 0) {
            return block.recurring.daysOfWeek.includes(selectedDate.getDay());
          } else {
            // fallback for old events
            return blockStart.getDay() === selectedDate.getDay();
          }
        }
        if (block.recurring.type === 'monthly') {
          return blockStart.getDate() === selectedDate.getDate();
        }
      }
    }
    return false;
  });
};

const DailyView = ({ selectedDate, blocks, onEditBlock, onDeleteBlock }: DailyViewProps) => {
  const dayBlocks = expandRecurringBlocks(blocks, selectedDate)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  const timeSlots = Array.from({ length: 24 }, (_, i) => {
    const hour = i.toString().padStart(2, '0');
    return `${hour}:00`;
  });

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      {/* Day Header */}
      <div className="p-6 border-b">
        <h2 className="text-2xl font-bold text-gray-900">
          {format(selectedDate, 'EEEE, MMMM d, yyyy')}
        </h2>
        <p className="text-gray-600 mt-1">
          {dayBlocks.length} {dayBlocks.length === 1 ? 'block' : 'blocks'} scheduled
        </p>
      </div>

      {/* Timeline */}
      <div className="relative">
        <div className="grid grid-cols-12 gap-4 p-6">
          {/* Time column */}
          <div className="col-span-2">
            {timeSlots.map((time) => (
              <div key={time} className="h-16 flex items-start justify-end pr-4">
                <span className="text-sm text-gray-500 font-medium">{time}</span>
              </div>
            ))}
          </div>

          {/* Content column */}
          <div className="col-span-10 relative">
            {timeSlots.map((time, index) => (
              <div
                key={time}
                className={`h-16 border-b ${
                  index % 2 === 0 ? 'bg-gray-50' : 'bg-white'
                } rounded-sm`}
              />
            ))}
            
            {/* Blocks */}
            <div className="absolute inset-0">
              {dayBlocks.map((block) => {
                const startHour = parseInt(block.startTime.split(':')[0]);
                const endHour = parseInt(block.endTime.split(':')[0]);
                const top = startHour * 64; // 64px per hour
                const height = (endHour - startHour) * 64;
                
                return (
                  <div
                    key={block.id}
                    className="absolute left-0 right-0 pr-4"
                    style={{
                      top: `${top}px`,
                      height: `${height}px`,
                    }}
                  >
                    <BlockCard
                      block={block}
                      onEdit={() => onEditBlock(block)}
                      onDelete={() => onDeleteBlock(block.id)}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DailyView;
