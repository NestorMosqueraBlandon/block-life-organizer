
import { useState, useEffect } from 'react';
import { CustomCategory, DEFAULT_CATEGORIES } from '../types/calendar';

const STORAGE_KEY = 'calendar-custom-categories';

export const useCustomCategories = () => {
  const [customCategories, setCustomCategories] = useState<CustomCategory[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setCustomCategories(parsed);
      } catch (error) {
        console.error('Failed to parse custom categories:', error);
      }
    }
  }, []);

  const saveCategories = (categories: CustomCategory[]) => {
    setCustomCategories(categories);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(categories));
  };

  const addCategory = (name: string, color: string) => {
    const newCategory: CustomCategory = {
      id: Date.now().toString(),
      name: name.toLowerCase(),
      color,
      createdAt: Date.now()
    };
    
    const updated = [...customCategories, newCategory];
    saveCategories(updated);
    return newCategory;
  };

  const deleteCategory = (categoryId: string) => {
    const updated = customCategories.filter(cat => cat.id !== categoryId);
    saveCategories(updated);
  };

  const getAllCategories = () => {
    const defaultCats = Object.entries(DEFAULT_CATEGORIES).map(([name, color]) => ({
      name,
      color,
      isDefault: true
    }));
    
    const customCats = customCategories.map(cat => ({
      name: cat.name,
      color: cat.color,
      isDefault: false,
      id: cat.id
    }));

    return [...defaultCats, ...customCats];
  };

  const getCategoryColor = (categoryName: string) => {
    // Check default categories first
    if (categoryName in DEFAULT_CATEGORIES) {
      return DEFAULT_CATEGORIES[categoryName as keyof typeof DEFAULT_CATEGORIES];
    }
    
    // Check custom categories
    const customCat = customCategories.find(cat => cat.name === categoryName);
    return customCat?.color || '#6B7280'; // fallback to gray
  };

  return {
    customCategories,
    addCategory,
    deleteCategory,
    getAllCategories,
    getCategoryColor
  };
};
