import { useState, useEffect } from 'react';
import { CalendarBlock } from '../types/calendar';

const API_URL = import.meta.env.VITE_API_URL || 'https://block-life-organizer.onrender.com/api';

function pad(n: number) {
  return n.toString().padStart(2, '0');
}

function backendToCalendarBlock(event: any): CalendarBlock {
  // Map backend event to frontend CalendarBlock (no Date parsing)
  const startTime = event.start ? event.start.split('T')[1]?.slice(0,5) : '';
  const endTime = event.end ? event.end.split('T')[1]?.slice(0,5) : '';
  const date = event.start ? event.start.split('T')[0] : '';
  return {
    id: event._id,
    title: event.title,
    description: event.description,
    startTime,
    endTime,
    date,
    category: event.category,
    color: event.color,
    tasks: event.tasks,
    recurring: event.recurring,
    hasQuiz: event.hasQuiz,
    priority: event.priority,
  };
}

function calendarBlockToBackend(block: Omit<CalendarBlock, 'id'> | CalendarBlock) {
  // Convert frontend CalendarBlock to backend event format (no Date)
  const { date, startTime, endTime, recurring, ...rest } = block;
  const start = date && startTime ? `${date}T${startTime}` : undefined;
  const end = date && endTime ? `${date}T${endTime}` : undefined;
  return {
    ...rest,
    start,
    end,
    recurring: recurring ? recurring : { type: 'none' },
  };
}

export const useCalendarDB = () => {
  const [blocks, setBlocks] = useState<CalendarBlock[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getToken = () => localStorage.getItem('token');

  const fetchBlocks = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/events`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (!res.ok) throw new Error('Failed to fetch events');
      const data = await res.json();
      setBlocks(data.map(backendToCalendarBlock));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBlocks();
    // eslint-disable-next-line
  }, []);

  const addBlock = async (blockData: Omit<CalendarBlock, 'id'>) => {
    try {
      const backendData = calendarBlockToBackend(blockData);
      const res = await fetch(`${API_URL}/events`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify(backendData),
      });
      if (!res.ok) throw new Error('Failed to add event');
      const newBlock = await res.json();
      setBlocks(prev => [...prev, backendToCalendarBlock(newBlock)]);
      return newBlock;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const updateBlock = async (updatedBlock: CalendarBlock) => {
    try {
      const backendData = calendarBlockToBackend(updatedBlock);
      const res = await fetch(`${API_URL}/events/${updatedBlock.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify(backendData),
      });
      if (!res.ok) throw new Error('Failed to update event');
      const newBlock = await res.json();
      setBlocks(prev => prev.map(block => (block.id === updatedBlock.id ? backendToCalendarBlock(newBlock) : block)));
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const deleteBlock = async (blockId: string) => {
    try {
      const res = await fetch(`${API_URL}/events/${blockId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (!res.ok) throw new Error('Failed to delete event');
      setBlocks(prev => prev.filter(block => block.id !== blockId));
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  // Optionally, implement server-side filtering for efficiency
  const getBlocksByDateRange = (startDate: string, endDate: string) => {
    return blocks.filter(block => block.date >= startDate && block.date <= endDate);
  };

  return {
    blocks,
    isLoading,
    error,
    addBlock,
    updateBlock,
    deleteBlock,
    getBlocksByDateRange,
    refetch: fetchBlocks,
  };
};
