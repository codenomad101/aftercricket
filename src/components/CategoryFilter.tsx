'use client';

import { useEffect, useState } from 'react';
import { Category } from '@/types';

interface CategoryFilterProps {
  selectedCategory: number | null;
  onCategoryChange: (categoryId: number | null) => void;
}

export default function CategoryFilter({
  selectedCategory,
  onCategoryChange,
}: CategoryFilterProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      const data = await response.json();
      if (data.success) {
        setCategories(data.data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="mb-6">Loading categories...</div>;
  }

  return (
    <div className="flex flex-wrap gap-2 mb-4">
      <button
        onClick={() => onCategoryChange(null)}
        className={`px-3 py-1.5 rounded-full font-semibold text-xs transition-all duration-300 transform hover:scale-105 shadow-md ${
          selectedCategory === null
            ? 'bg-red-600 text-white shadow-lg scale-105'
            : 'bg-gray-100 text-gray-700 hover:bg-red-600 hover:text-white'
        }`}
      >
        All
      </button>
      {categories.map((category) => (
        <button
          key={category.id}
          onClick={() => onCategoryChange(category.id)}
          className={`px-3 py-1.5 rounded-full font-semibold text-xs transition-all duration-300 transform hover:scale-105 shadow-md ${
            selectedCategory === category.id
              ? 'bg-red-600 text-white shadow-lg scale-105'
              : 'bg-gray-100 text-gray-700 hover:bg-red-600 hover:text-white'
          }`}
        >
          {category.name}
        </button>
      ))}
    </div>
  );
}

