import { useState, useEffect } from 'react';
import { CalendarBlock } from '../types/calendar';

const STORAGE_KEY = 'calendar-blocks';

function loadBlocks(): CalendarBlock[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function saveBlocks(blocks: CalendarBlock[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(blocks));
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

export const useCalendarDB = () => {
  const [blocks, setBlocks] = useState<CalendarBlock[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setBlocks(loadBlocks());
    setIsLoading(false);
  }, []);

  const persist = (updated: CalendarBlock[]) => {
    setBlocks(updated);
    saveBlocks(updated);
  };

  const addBlock = async (blockData: Omit<CalendarBlock, 'id'>) => {
    const newBlock: CalendarBlock = { ...blockData, id: generateId() };
    persist([...blocks, newBlock]);
    return newBlock;
  };

  const updateBlock = async (updatedBlock: CalendarBlock) => {
    persist(blocks.map(b => (b.id === updatedBlock.id ? updatedBlock : b)));
  };

  const deleteBlock = async (blockId: string) => {
    persist(blocks.filter(b => b.id !== blockId));
  };

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
    refetch: () => setBlocks(loadBlocks()),
  };
};
