
import { useState, useEffect } from 'react';
import { CalendarBlock } from '../types/calendar';
import { calendarDB } from '../utils/indexedDB';

export const useCalendarDB = () => {
  const [blocks, setBlocks] = useState<CalendarBlock[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initDB = async () => {
      try {
        setIsLoading(true);
        await calendarDB.init();
        const allBlocks = await calendarDB.getAllBlocks();
        setBlocks(allBlocks);
      } catch (err) {
        console.error('Failed to initialize database:', err);
        setError('Failed to initialize database');
      } finally {
        setIsLoading(false);
      }
    };

    initDB();
  }, []);

  const addBlock = async (blockData: Omit<CalendarBlock, 'id'>) => {
    try {
      const newBlock: CalendarBlock = {
        ...blockData,
        id: Date.now().toString()
      };
      
      await calendarDB.addBlock(newBlock);
      setBlocks(prev => [...prev, newBlock]);
      return newBlock;
    } catch (err) {
      console.error('Failed to add block:', err);
      setError('Failed to add block');
      throw err;
    }
  };

  const updateBlock = async (updatedBlock: CalendarBlock) => {
    try {
      await calendarDB.updateBlock(updatedBlock);
      setBlocks(prev => prev.map(block => 
        block.id === updatedBlock.id ? updatedBlock : block
      ));
    } catch (err) {
      console.error('Failed to update block:', err);
      setError('Failed to update block');
      throw err;
    }
  };

  const deleteBlock = async (blockId: string) => {
    try {
      await calendarDB.deleteBlock(blockId);
      setBlocks(prev => prev.filter(block => block.id !== blockId));
    } catch (err) {
      console.error('Failed to delete block:', err);
      setError('Failed to delete block');
      throw err;
    }
  };

  const getBlocksByDateRange = async (startDate: string, endDate: string) => {
    try {
      return await calendarDB.getBlocksByDateRange(startDate, endDate);
    } catch (err) {
      console.error('Failed to get blocks by date range:', err);
      setError('Failed to get blocks by date range');
      throw err;
    }
  };

  return {
    blocks,
    isLoading,
    error,
    addBlock,
    updateBlock,
    deleteBlock,
    getBlocksByDateRange
  };
};
