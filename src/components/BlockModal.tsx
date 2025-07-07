import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Calendar, Clock, Type, AlignLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectLabel, SelectGroup } from '@/components/ui/select';
import { CalendarBlock, Task, CATEGORY_COLORS } from '../types/calendar';
import { format } from 'date-fns';
import { useCustomCategories } from '../hooks/useCustomCategories';
import CategoryModal from './CategoryModal';
import { Checkbox as UICheckbox } from '@/components/ui/checkbox';

interface BlockModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (block: Omit<CalendarBlock, 'id'>) => void;
  editingBlock?: CalendarBlock | null;
}

const WEEK_DAYS = [
  { label: 'Sun', value: 0 },
  { label: 'Mon', value: 1 },
  { label: 'Tue', value: 2 },
  { label: 'Wed', value: 3 },
  { label: 'Thu', value: 4 },
  { label: 'Fri', value: 5 },
  { label: 'Sat', value: 6 },
];

const BlockModal = ({ isOpen, onClose, onSave, editingBlock }: BlockModalProps) => {
  const { getAllCategories, getCategoryColor } = useCustomCategories();
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startTime: '09:00',
    endTime: '10:00',
    date: format(new Date(), 'yyyy-MM-dd'),
    category: 'work',
    hasQuiz: false,
    priority: 'medium' as 'low' | 'medium' | 'high',
    tasks: [] as Task[],
    recurring: undefined as CalendarBlock['recurring']
  });

  const [newTaskTitle, setNewTaskTitle] = useState('');

  useEffect(() => {
    if (editingBlock) {
      setFormData({
        title: editingBlock.title,
        description: editingBlock.description || '',
        startTime: editingBlock.startTime,
        endTime: editingBlock.endTime,
        date: editingBlock.date,
        category: editingBlock.category,
        hasQuiz: editingBlock.hasQuiz || false,
        priority: editingBlock.priority || 'medium',
        tasks: editingBlock.tasks || [],
        recurring: editingBlock.recurring
      });
    } else {
      setFormData({
        title: '',
        description: '',
        startTime: '09:00',
        endTime: '10:00',
        date: format(new Date(), 'yyyy-MM-dd'),
        category: 'work',
        hasQuiz: false,
        priority: 'medium',
        tasks: [],
        recurring: undefined
      });
    }
  }, [editingBlock, isOpen]);

  const allCategories = getAllCategories();
  const defaultCategories = allCategories.filter(cat => cat.isDefault);
  const customCategories = allCategories.filter(cat => !cat.isDefault);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const blockData = {
      ...formData,
      color: getCategoryColor(formData.category)
    };
    
    onSave(blockData);
  };

  const addTask = () => {
    if (!newTaskTitle.trim()) return;
    
    const newTask: Task = {
      id: Date.now().toString(),
      title: newTaskTitle.trim(),
      completed: false,
      priority: 'medium'
    };
    
    setFormData(prev => ({
      ...prev,
      tasks: [...prev.tasks, newTask]
    }));
    setNewTaskTitle('');
  };

  const toggleTask = (taskId: string) => {
    setFormData(prev => ({
      ...prev,
      tasks: prev.tasks.map(task =>
        task.id === taskId ? { ...task, completed: !task.completed } : task
      )
    }));
  };

  const removeTask = (taskId: string) => {
    setFormData(prev => ({
      ...prev,
      tasks: prev.tasks.filter(task => task.id !== taskId)
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            {editingBlock ? 'Edit Block' : 'Create New Block'}
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-140px)]">
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Label htmlFor="title" className="flex items-center space-x-2">
                  <Type className="h-4 w-4" />
                  <span>Title</span>
                </Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter block title"
                  required
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="date" className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4" />
                  <span>Date</span>
                </Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                  required
                  className="mt-1"
                />
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="category">Category</Label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsCategoryModalOpen(true)}
                    className="text-blue-600 hover:text-blue-700"
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Manage
                  </Button>
                </div>
                <Select
                  value={formData.category}
                  onValueChange={(value: string) => 
                    setFormData(prev => ({ ...prev, category: value }))
                  }
                >
                  <SelectTrigger className="mt-1">
                    <div className="flex items-center space-x-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: getCategoryColor(formData.category) }}
                      />
                      <SelectValue />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    {defaultCategories.length > 0 && (
                      <SelectGroup>
                        <SelectLabel>Default Categories</SelectLabel>
                        {defaultCategories.map((category) => {
                          const key = `default-${category.name}`;
                          return (
                            <SelectItem key={key} value={category.name}>
                              <div className="flex items-center space-x-2">
                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: category.color }} />
                                <span className="capitalize">{category.name}</span>
                              </div>
                            </SelectItem>
                          );
                        })}
                      </SelectGroup>
                    )}
                    {customCategories.length > 0 && (
                      <SelectGroup>
                        <SelectLabel>Custom Categories</SelectLabel>
                        {customCategories.map((category) => {
                          const key = `custom-${'id' in category ? category.id : category.name}`;
                          return (
                            <SelectItem key={key} value={category.name}>
                              <div className="flex items-center space-x-2">
                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: category.color }} />
                                <span className="capitalize">{category.name}</span>
                              </div>
                            </SelectItem>
                          );
                        })}
                      </SelectGroup>
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="startTime" className="flex items-center space-x-2">
                  <Clock className="h-4 w-4" />
                  <span>Start Time</span>
                </Label>
                <Input
                  id="startTime"
                  type="time"
                  value={formData.startTime}
                  onChange={(e) => setFormData(prev => ({ ...prev, startTime: e.target.value }))}
                  required
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="endTime">End Time</Label>
                <Input
                  id="endTime"
                  type="time"
                  value={formData.endTime}
                  onChange={(e) => setFormData(prev => ({ ...prev, endTime: e.target.value }))}
                  required
                  className="mt-1"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <Label htmlFor="description" className="flex items-center space-x-2">
                <AlignLeft className="h-4 w-4" />
                <span>Description</span>
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Add details about this block..."
                className="mt-1"
                rows={3}
              />
            </div>

            {/* Checkboxes */}
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="hasQuiz"
                  checked={formData.hasQuiz}
                  onCheckedChange={(checked) => 
                    setFormData(prev => ({ ...prev, hasQuiz: checked as boolean }))
                  }
                />
                <Label htmlFor="hasQuiz">Has Quiz/Test</Label>
              </div>

              <div>
                <Label htmlFor="priority">Priority</Label>
                <Select
                  value={formData.priority}
                  onValueChange={(value: 'low' | 'medium' | 'high') => 
                    setFormData(prev => ({ ...prev, priority: value }))
                  }
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Recurrence Options */}
            <div>
              <Label htmlFor="recurringType">Recurrence</Label>
              <Select
                value={formData.recurring?.type || 'none'}
                onValueChange={(value: string) => {
                  setFormData(prev => ({
                    ...prev,
                    recurring: value === 'none' ? undefined : { type: value as 'daily' | 'weekly' | 'monthly', endDate: prev.recurring?.endDate }
                  }));
                }}
              >
                <SelectTrigger className="mt-1 w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
              {formData.recurring && (
                <div className="mt-2">
                  <Label htmlFor="recurringEndDate">Repeat until</Label>
                  <Input
                    id="recurringEndDate"
                    type="date"
                    value={formData.recurring.endDate || ''}
                    min={formData.date}
                    onChange={e => setFormData(prev => ({
                      ...prev,
                      recurring: prev.recurring ? { ...prev.recurring, endDate: e.target.value } : undefined
                    }))}
                    className="mt-1 w-40"
                  />
                </div>
              )}
              {formData.recurring && formData.recurring.type === 'weekly' && (
                <div className="mt-2">
                  <Label>Select days of week</Label>
                  <div className="flex space-x-2 mt-1">
                    {WEEK_DAYS.map(day => (
                      <div key={day.value} className="flex flex-col items-center">
                        <UICheckbox
                          checked={formData.recurring?.daysOfWeek?.includes(day.value) || false}
                          onCheckedChange={checked => {
                            setFormData(prev => ({
                              ...prev,
                              recurring: prev.recurring ? {
                                ...prev.recurring,
                                daysOfWeek: checked
                                  ? [...(prev.recurring.daysOfWeek || []), day.value]
                                  : (prev.recurring.daysOfWeek || []).filter(d => d !== day.value)
                              } : undefined
                            }));
                          }}
                        />
                        <span className="text-xs">{day.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Tasks */}
            <div>
              <Label className="text-base font-medium">Tasks</Label>
              
              {/* Add Task */}
              <div className="flex space-x-2 mt-2">
                <Input
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  placeholder="Add a task..."
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTask())}
                />
                <Button type="button" onClick={addTask} size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              {/* Task List */}
              {formData.tasks.length > 0 && (
                <div className="mt-3 space-y-2">
                  {formData.tasks.map((task) => (
                    <div key={task.id} className="flex items-center space-x-3 p-2 bg-gray-50 rounded">
                      <Checkbox
                        checked={task.completed}
                        onCheckedChange={() => toggleTask(task.id)}
                      />
                      <span className={`flex-1 ${task.completed ? 'line-through text-gray-500' : ''}`}>
                        {task.title}
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeTask(task.id)}
                        className="h-6 w-6 p-0 hover:bg-red-100 hover:text-red-600"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t bg-gray-50">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            form="block-form"
            onClick={handleSubmit}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {editingBlock ? 'Update Block' : 'Create Block'}
          </Button>
        </div>
      </div>

      {/* Category Management Modal */}
      <CategoryModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
      />
    </div>
  );
};

export default BlockModal;
