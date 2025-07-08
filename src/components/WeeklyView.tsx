import React, { useState } from 'react';
import { format, startOfWeek, addDays, isSameDay, isAfter, isBefore, parseISO } from 'date-fns';
import { CalendarBlock, CATEGORY_COLORS } from '../types/calendar';
import BlockCard from './BlockCard';
import { Dialog } from '@/components/ui/dialog';
import { Card } from '@/components/ui/card';

interface WeeklyViewProps {
  selectedDate: Date;
  blocks: CalendarBlock[];
  onEditBlock: (block: CalendarBlock) => void;
  onDeleteBlock: (blockId: string) => void;
}

const WeeklyView = ({ selectedDate, blocks, onEditBlock, onDeleteBlock }: WeeklyViewProps) => {
  const weekStart = startOfWeek(selectedDate, { weekStartsOn: 0 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const expandRecurringBlocks = (blocks: CalendarBlock[], date: Date) => {
    const dateStr = `${date.getFullYear()}-${(date.getMonth()+1).toString().padStart(2,'0')}-${date.getDate().toString().padStart(2,'0')}`;
    return blocks.filter(block => {
      if (!block.recurring) return block.date === dateStr;
      const blockStart = block.date;
      const endDate = block.recurring.endDate;
      // Compare as strings (local)
      if (blockStart && (dateStr >= blockStart)) {
        if (!endDate || dateStr <= endDate) {
          if (block.recurring.type === 'daily') return true;
          if (block.recurring.type === 'weekly') {
            if (block.recurring.daysOfWeek && block.recurring.daysOfWeek.length > 0) {
              return block.recurring.daysOfWeek.includes(date.getDay());
            } else {
              // fallback for old events
              const blockStartDate = new Date(blockStart);
              return blockStartDate.getDay() === date.getDay();
            }
          }
          if (block.recurring.type === 'monthly') {
            return parseInt(blockStart.split('-')[2]) === date.getDate();
          }
        }
      }
      return false;
    });
  };

  const getBlocksForDay = (date: Date) => {
    return expandRecurringBlocks(blocks, date);
  };

  // Set the calendar to start at 04:00 (4am)
  const START_HOUR = 4;
  const END_HOUR = 24;
  const timeSlots = Array.from({ length: END_HOUR - START_HOUR }, (_, i) => {
    const hour = (i + START_HOUR).toString().padStart(2, '0');
    return `${hour}:00`;
  });

  const [viewingBlock, setViewingBlock] = useState<CalendarBlock | null>(null);

  const PIXELS_PER_HOUR = 49;
  const PIXELS_PER_MINUTE = PIXELS_PER_HOUR / 60;

  return (
    <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
      {/* Week Header */}
      <div className="grid grid-cols-8 md:grid-cols-8 grid-cols-2 border-b md:overflow-visible overflow-x-auto">
        <div className="p-2 md:p-4 text-xs md:text-sm font-medium text-gray-500 border-r">Time</div>
        {weekDays.map((day, index) => (
          <div key={index} className="p-2 md:p-4 text-center border-r last:border-r-0">
            <div className="text-xs md:text-sm font-medium text-gray-900">
              {format(day, 'EEE')}
            </div>
            <div className="text-base md:text-lg font-semibold text-gray-900 mt-1">
              {format(day, 'd')}
            </div>
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="relative overflow-x-auto max-h-[600px]">
        <div className="grid grid-cols-8 md:grid-cols-8 grid-cols-2">
          {/* Time column */}
          <div className="border-r">
            {timeSlots.map((time, index) => (
              <div
                key={time}
                className={`h-10 md:h-12 px-1 md:px-3 py-1 md:py-2 text-[10px] md:text-xs text-gray-500 border-b ${
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
                  className={`h-10 md:h-12 border-b ${
                    timeIndex % 2 === 0 ? 'bg-gray-50' : 'bg-white'
                  }`}
                />
              ))}
              
              {/* Blocks for this day */}
              <div className="absolute inset-0 pointer-events-none">
                {getBlocksForDay(day).map((block) => {
                  const [startHour, startMin] = block.startTime.split(':').map(Number);
                  const [endHour, endMin] = block.endTime.split(':').map(Number);
                  if (startHour < START_HOUR) return null;
                  const top = ((startHour - START_HOUR) * 60 + startMin) * PIXELS_PER_MINUTE;
                  console.log(((endHour * 60 + endMin) - (startHour * 60 + startMin)))
                  const height = ((endHour * 60 + endMin) - (startHour * 60 + startMin)) * PIXELS_PER_MINUTE;
                  return (
                    <div
                      key={block.id}
                      className="absolute left-0 right-0 md:left-1 md:right-1 pointer-events-auto cursor-pointer"
                      style={{
                        top: `${top}px`,
                        height: `${height}px`,
                      }}
                      onClick={() => setViewingBlock(block)}
                    >
                      <BlockCard
                        block={block}
                        onEdit={() => onEditBlock(block)}
                        onDelete={() => onDeleteBlock(block.id)}
                        compact
                        height={height}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* View Event Modal */}
      {viewingBlock && (
        <Dialog open={!!viewingBlock} onOpenChange={open => !open && setViewingBlock(null)}>
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <Card className="w-full max-w-md p-6 relative shadow-xl">
              <button
                className="absolute top-3 right-3 text-gray-400 hover:text-gray-700"
                onClick={() => setViewingBlock(null)}
                aria-label="Close"
              >
                ×
              </button>
              <h2 className="text-2xl font-bold mb-2 text-gray-900 flex items-center gap-2">
                {viewingBlock.title}
                {viewingBlock.recurring && viewingBlock.recurring.type !== 'none' && (
                  <span className="text-blue-500 text-base" title="Recurring">🔁</span>
                )}
              </h2>
              <div className="mb-2 text-gray-600 text-sm">
                {viewingBlock.date} | {viewingBlock.startTime} - {viewingBlock.endTime}
              </div>
              <div className="mb-2 flex items-center gap-2">
                <span className="inline-block w-3 h-3 rounded-full" style={{ backgroundColor: viewingBlock.color }} />
                <span className="capitalize text-xs font-medium bg-gray-100 px-2 py-1 rounded">{viewingBlock.category}</span>
              </div>
              {viewingBlock.description && (
                <div className="mb-2 text-gray-700 whitespace-pre-line">
                  {viewingBlock.description}
                </div>
              )}
              {viewingBlock.recurring && viewingBlock.recurring.type !== 'none' && (
                <div className="mb-2 text-xs text-blue-600">
                  Repeats: {viewingBlock.recurring.type.charAt(0).toUpperCase() + viewingBlock.recurring.type.slice(1)}
                  {viewingBlock.recurring.endDate && (
                    <> until {viewingBlock.recurring.endDate}</>
                  )}
                </div>
              )}
              <div className="mt-3">
                <div className="font-semibold text-sm mb-1">Tasks:</div>
                {viewingBlock.tasks && viewingBlock.tasks.length > 0 ? (
                  <ul className="list-disc pl-5 text-sm text-gray-700">
                    {viewingBlock.tasks.map(task => (
                      <li key={task.id} className={task.completed ? 'line-through text-gray-400' : ''}>
                        {task.title}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-xs text-gray-400 italic">No task for this event</div>
                )}
              </div>
            </Card>
          </div>
        </Dialog>
      )}
    </div>
  );
};

export default WeeklyView;
