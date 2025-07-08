import { useState, useEffect } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'https://block-life-organizer.onrender.com/api';

export const useCustomCategories = () => {
  const [customCategories, setCustomCategories] = useState([]);
  const [defaultCategories, setDefaultCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const getToken = () => localStorage.getItem('token');

  const fetchCategories = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/categories`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (!res.ok) throw new Error('Failed to fetch categories');
      const data = await res.json();
      setDefaultCategories(data.default || []);
      setCustomCategories(data.custom || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
    // eslint-disable-next-line
  }, []);

  const addCategory = async (name, color) => {
    try {
      const res = await fetch(`${API_URL}/categories`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ name, color }),
      });
      if (!res.ok) throw new Error('Failed to add category');
      await fetchCategories();
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const deleteCategory = async (name) => {
    try {
      const res = await fetch(`${API_URL}/categories/${encodeURIComponent(name)}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (!res.ok) throw new Error('Failed to delete category');
      await fetchCategories();
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const getAllCategories = () => {
    const defaultCats = (defaultCategories || []).map(cat => ({ ...cat, isDefault: true }));
    const customCats = (customCategories || []).map(cat => ({ ...cat, isDefault: false }));
    return [...defaultCats, ...customCats];
  };

  const getCategoryColor = (name) => {
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
    refetch: fetchCategories,
  };
};
