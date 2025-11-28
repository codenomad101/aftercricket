'use client';

import { useEffect, useState } from 'react';
import { Article } from '@/types';
import NewsCard from './NewsCard';

interface NewsSliderProps {
  title: string;
  filterBy?: 'india' | 'other';
}

export default function NewsSlider({ title, filterBy }: NewsSliderProps) {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchArticles();
  }, [filterBy]);

  const fetchArticles = async () => {
    try {
      const response = await fetch('/api/articles?published=true');
      const data = await response.json();
      if (data.success) {
        let filteredArticles = data.data;
        
        // Filter by India or other countries based on category or title
        if (filterBy === 'india') {
          filteredArticles = data.data.filter((article: Article) => {
            const title = article.title?.toLowerCase() || '';
            const categoryName = article.category?.name?.toLowerCase() || '';
            const categorySlug = article.category?.slug?.toLowerCase() || '';
            // Check if category is "India" or title contains "india"/"indian"
            return categoryName === 'india' || 
                   categorySlug === 'india' ||
                   title.includes('india') || 
                   title.includes('indian');
          });
        } else if (filterBy === 'other') {
          filteredArticles = data.data.filter((article: Article) => {
            const title = article.title?.toLowerCase() || '';
            const categoryName = article.category?.name?.toLowerCase() || '';
            const categorySlug = article.category?.slug?.toLowerCase() || '';
            // Exclude India category and articles with "india"/"indian" in title
            return categoryName !== 'india' && 
                   categorySlug !== 'india' &&
                   !title.includes('india') && 
                   !title.includes('indian');
          });
        }
        
        setArticles(filteredArticles.slice(0, 6)); // Limit to 6 articles
      }
    } catch (error) {
      console.error('Error fetching articles:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">{title}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-white rounded-lg p-4 shadow-md animate-pulse"
            >
              <div className="h-3 bg-gray-200 rounded w-3/4 mb-3"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (articles.length === 0) {
    return (
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">{title}</h2>
        <div className="bg-white rounded-lg p-8 shadow-md text-center">
          <p className="text-sm text-gray-600">No news available at the moment</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">{title}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {articles.map((article) => (
          <NewsCard key={article.id} article={article} />
        ))}
      </div>
    </div>
  );
}

