// src/hooks/useMenuData.js
import { useState, useEffect, useCallback } from 'react';
import { UtensilsCrossed, Star, Coffee, ChefHat, Heart, GlassWater, Cake, ShoppingBag, GalleryVertical } from 'lucide-react';

const API_URL = 'http://localhost:3001/api';

const iconMap = {
  'UtensilsCrossed': UtensilsCrossed,
  'Star': Star,
  'Coffee': Coffee,
  'ChefHat': ChefHat,
  'Heart': Heart,
  'GlassWater': GlassWater,
  'Cake': Cake,
  'ShoppingBag': ShoppingBag,
  'GalleryVertical': GalleryVertical,
};

const getIconComponent = (iconName) => iconMap[iconName] || UtensilsCrossed;

const useMenuData = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [menuTypes, setMenuTypes] = useState([]);
  const [categories, setCategories] = useState([]);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedMenuType, setSelectedMenuType] = useState('regular');

  const fetchAllMenuData = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/menu-data`);
      if (!response.ok) throw new Error('Failed to fetch menu data');
      const data = await response.json();
      
      setMenuItems(data.menuItems || []);
      setMenuTypes(data.menuTypes || []);

      const defaultCategories = [
        { id: 'all', name: 'Tất cả', icon: getIconComponent('UtensilsCrossed') },
        { id: 'popular', name: 'Phổ biến', icon: getIconComponent('Star') },
      ];
      const backendCategories = (data.categories || []).map(cat => ({
        ...cat,
        icon: getIconComponent(cat.icon_name)
      }));
      setCategories([...defaultCategories, ...backendCategories]);

    } catch (error) {
      console.error("Error fetching menu data:", error);
    }
  }, []);

  useEffect(() => {
    fetchAllMenuData();
  }, [fetchAllMenuData]);

  const addCategory = async (id, name, icon) => {
    try {
      const response = await fetch(`${API_URL}/categories`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, name, icon_name: icon }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message);
      await fetchAllMenuData();
      return { success: true, message: result.message };
    } catch (error) {
      return { success: false, message: error.message };
    }
  };

  const updateCategory = async (id, name, icon) => {
    try {
      const response = await fetch(`${API_URL}/categories/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, icon_name: icon }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message);
      await fetchAllMenuData();
      return { success: true, message: result.message };
    } catch (error)
    {
      return { success: false, message: error.message };
    }
  };

  const deleteCategory = async (id) => {
    try {
        const response = await fetch(`${API_URL}/categories/${id}`, { method: 'DELETE' });
        const result = await response.json();
        if (!response.ok) throw new Error(result.message);
        await fetchAllMenuData();
        return { success: true, message: result.message };
    } catch (error) {
        return { success: false, message: error.message };
    }
  };
  
  const addMenuItem = async (itemData) => {
    try {
        const response = await fetch(`${API_URL}/menu-items`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(itemData),
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.message);
        await fetchAllMenuData();
        return { success: true, message: result.message };
    } catch (error) {
        return { success: false, message: error.message };
    }
  };
  
  const updateMenuItem = async (itemId, itemData) => {
    try {
        const response = await fetch(`${API_URL}/menu-items/${itemId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(itemData),
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.message);
        await fetchAllMenuData();
        return { success: true, message: result.message };
    } catch (error) {
        return { success: false, message: error.message };
    }
  };
  
  const deleteMenuItem = async (itemId) => {
    try {
        const response = await fetch(`${API_URL}/menu-items/${itemId}`, { method: 'DELETE' });
        const result = await response.json();
        if (!response.ok) throw new Error(result.message);
        await fetchAllMenuData();
        return { success: true, message: result.message };
    } catch (error) {
        return { success: false, message: error.message };
    }
  };

  const updateItemInventory = async (itemId, inventoryData) => {
    try {
        const response = await fetch(`${API_URL}/menu-items/${itemId}/inventory`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(inventoryData),
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.message);
        await fetchAllMenuData();
        return { success: true, message: result.message };
    } catch (error) {
        return { success: false, message: error.message };
    }
  };

  const addMenuType = (id, name) => {
    console.log('TODO: Call API to add menu type', { id, name });
  };

  const deleteMenuType = (menuTypeId) => {
    console.log('TODO: Call API to delete menu type', menuTypeId);
  };

  return {
    menuItems, setMenuItems,
    menuTypes, setMenuTypes,
    categories, setCategories,
    addMenuType, deleteMenuType,
    addMenuItem, updateMenuItem, deleteMenuItem,
    updateItemInventory,
    addCategory, updateCategory, deleteCategory,
    searchTerm, setSearchTerm,
    selectedCategory, setSelectedCategory,
    selectedMenuType, setSelectedMenuType,
    fetchAllMenuData,
  };
};

export default useMenuData;