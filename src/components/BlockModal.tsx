
import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Calendar, Clock, Type, AlignLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CalendarBlock, Task, CATEGORY_COLORS } from '../types/calendar';
import { format } from 'date-fns';

interface BlockModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (block: Omit<CalendarBlock, 'id'>) => void;
  editingBlock?: CalendarBlock | null;
}

const BlockModal = ({ isOpen, onClose, onSave, editingBlock }: BlockModalProps) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startTime: '09:00',
    endTime: '10:00',
    date: format(new Date(), 'yyyy-MM-dd'),
    category: 'work' as keyof typeof CATEGORY_COLORS,
    hasQuiz: false,
    priority: 'medium' as 'low' | 'medium' | 'high',
    tasks: [] as Task[]
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
        tasks: editingBlock.tasks || []
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
        tasks: []
      });
    }
  }, [editingBlock, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const blockData = {
      ...formData,
      color: CATEGORY_COLORS[formData.category]
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
                <Label htmlFor="category">Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value: keyof typeof CATEGORY_COLORS) => 
                    setFormData(prev => ({ ...prev, category: value }))
                  }
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="work">Work</SelectItem>
                    <SelectItem value="study">Study</SelectItem>
                    <SelectItem value="personal">Personal</SelectItem>
                    <SelectItem value="meeting">Meeting</SelectItem>
                    <SelectItem value="break">Break</SelectItem>
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
            onClick={handleSubmit}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {editingBlock ? 'Update Block' : 'Create Block'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default BlockModal;
