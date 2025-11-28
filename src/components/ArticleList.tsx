'use client';

import { useEffect, useState } from 'react';
import { Article, Category } from '@/types';
import ArticleCard from './ArticleCard';

interface ArticleListProps {
  initialArticles?: Article[];
  initialCategoryId?: number;
  initialFilter?: string;
}

export default function ArticleList({ initialArticles = [], initialCategoryId, initialFilter = 'all' }: ArticleListProps) {
  const [articles, setArticles] = useState<Article[]>(initialArticles);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<string>(initialFilter);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

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
      setCategoriesLoading(false);
    }
  };

  const fetchArticles = async (filter: string) => {
    setLoading(true);
    try {
      let url = '/api/articles';
      
      // Find category IDs for Indian and International
      if (filter === 'indian') {
        const indianCategory = categories.find(cat => 
          cat.name.toLowerCase() === 'india' || cat.name.toLowerCase() === 'indian'
        );
        if (indianCategory) {
          url = `/api/articles?categoryId=${indianCategory.id}`;
        }
      } else if (filter === 'international') {
        const intlCategory = categories.find(cat => 
          cat.name.toLowerCase() === 'international'
        );
        if (intlCategory) {
          url = `/api/articles?categoryId=${intlCategory.id}`;
        }
      }
      
      const response = await fetch(url);
      const data = await response.json();
      if (data.success) {
        setArticles(data.data);
      }
    } catch (error) {
      console.error('Error fetching articles:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!categoriesLoading && categories.length > 0) {
      if (selectedFilter !== 'all') {
        fetchArticles(selectedFilter);
      } else if (initialArticles.length > 0) {
        // If "all" is selected and we have initial articles, use them
        setArticles(initialArticles);
      } else {
        // If "all" is selected but no initial articles, fetch all
        fetchArticles('all');
      }
    }
  }, [selectedFilter, categories, categoriesLoading, initialArticles]);

  const handleFilterChange = (filter: string) => {
    setSelectedFilter(filter);
  };

  if (loading && articles.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-sm text-gray-600">Loading articles...</div>
      </div>
    );
  }

  if (articles.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-sm text-gray-600">No articles found</div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <label htmlFor="news-filter" className="block text-sm font-medium text-gray-700 mb-2">
          Filter News
        </label>
        <select
          id="news-filter"
          value={selectedFilter}
          onChange={(e) => handleFilterChange(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-red-600 bg-white text-gray-900 text-sm font-medium min-w-[200px]"
        >
          <option value="all">All News</option>
          <option value="indian">Indian</option>
          <option value="international">International</option>
        </select>
      </div>
      
      {loading && articles.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-sm text-gray-600">Loading articles...</div>
        </div>
      ) : articles.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-sm text-gray-600">No articles found</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {articles.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      )}
    </div>
  );
}



