import { useState, useEffect } from 'react';
import { DEFAULT_CATEGORIES } from '../types/calendar';

const STORAGE_KEY = 'custom-categories';

function loadCustomCategories() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function saveCustomCategories(cats: any[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cats));
}

export const useCustomCategories = () => {
  const [customCategories, setCustomCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const defaultCategories = Object.entries(DEFAULT_CATEGORIES).map(([name, color]) => ({
    name,
    color,
  }));

  useEffect(() => {
    setCustomCategories(loadCustomCategories());
    setLoading(false);
  }, []);

  const addCategory = async (name: string, color: string) => {
    const updated = [...customCategories, { id: Date.now().toString(36), name, color, createdAt: Date.now() }];
    setCustomCategories(updated);
    saveCustomCategories(updated);
  };

  const deleteCategory = async (id: string) => {
    const updated = customCategories.filter(c => c.id !== id && c.name !== id);
    setCustomCategories(updated);
    saveCustomCategories(updated);
  };

  const getAllCategories = () => {
    const defaultCats = defaultCategories.map(cat => ({ ...cat, isDefault: true }));
    const customCats = customCategories.map(cat => ({ ...cat, isDefault: false }));
    return [...defaultCats, ...customCats];
  };

  const getCategoryColor = (name: string) => {
    const all = getAllCategories();
    return all.find(cat => cat.name === name)?.color || '#bdbdbd';
  };

  return {
    customCategories,
    defaultCategories,
    loading,
    error,
    addCategory,
    deleteCategory,
    getAllCategories,
    getCategoryColor,
    refetch: () => setCustomCategories(loadCustomCategories()),
  };
};
