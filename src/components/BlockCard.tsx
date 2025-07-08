import React from 'react';
import { Edit2, Trash2, CheckSquare, Clock, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CalendarBlock, CATEGORY_COLORS } from '../types/calendar';
import { useCustomCategories } from '../hooks/useCustomCategories';

interface BlockCardProps {
  block: CalendarBlock;
  onEdit: () => void;
  onDelete: () => void;
  compact?: boolean;
  height?: number;
}

const BlockCard = ({ block, onEdit, onDelete, compact = false, height = 120 }: BlockCardProps) => {
  const { getCategoryColor } = useCustomCategories();
  const categoryColor = getCategoryColor(block.category);
  const completedTasks = block.tasks?.filter(task => task.completed).length || 0;
  const totalTasks = block.tasks?.length || 0;
  

  return (
    <div
      className={`rounded-lg shadow-sm border-l-4 bg-white hover:shadow-md transition-shadow duration-200 ${
        compact ? 'p-2' : 'p-4'
      }`}
      style={{ borderLeftColor: categoryColor, height }}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-start space-x-2 mb-1">
            <h3 className={`font-semibold text-gray-900 truncate ${
              compact ? 'text-sm' : 'text-base'
            }`}>
              {block.title}
              {block.recurring && (
                <span title="Recurring event" className="ml-2 text-xs text-blue-500">🔁</span>
              )}
            </h3>
            {block.hasQuiz && (
              <AlertCircle className="h-4 w-4 text-orange-500 flex-shrink-0" />
            )}
          </div>
          
          <div className="flex items-start space-x-3 text-sm text-gray-600 mb-2">
            <div className="flex items-start space-x-1">
              <Clock className="h-3 w-3" />
              <span>{block.startTime} - {block.endTime}</span>
            </div>
            <div
              className="px-2 py-1 rounded-full text-xs font-medium text-white"
              style={{ backgroundColor: categoryColor }}
            >
              {block.category}
            </div>
          </div>

          {!compact && block.description && (
            <p className="text-sm text-gray-600 mb-2">{block.description}</p>
          )}

          {totalTasks > 0 && (
            <div className="flex items-center space-x-2 text-sm">
              <CheckSquare className="h-3 w-3 text-green-500" />
              <span className="text-gray-600">
                {completedTasks}/{totalTasks} tasks completed
              </span>
            </div>
          )}
        </div>

        {!compact && (
          <div className="flex items-center space-x-1 ml-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={onEdit}
              className="h-8 w-8 p-0 hover:bg-gray-100"
            >
              <Edit2 className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onDelete}
              className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default BlockCard;
