'use client';

import { useEffect, useState, useRef } from 'react';
import { Article } from '@/types';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';

export default function NewsSliderSmall() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    try {
      const response = await fetch('/api/articles?published=true');
      const data = await response.json();
      if (data.success) {
        setArticles(data.data.slice(0, 10)); // Limit to 10 articles
      }
    } catch (error) {
      console.error('Error fetching articles:', error);
    } finally {
      setLoading(false);
    }
  };

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -300, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 300, behavior: 'smooth' });
    }
  };

  const handleClick = (slug: string) => {
    router.push(`/articles/${slug}`);
  };

  if (loading) {
    return (
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-3">Latest News</h2>
        <div className="flex gap-3 overflow-hidden">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-white rounded-lg p-3 shadow-md animate-pulse min-w-[280px] flex-shrink-0"
            >
              <div className="h-3 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (articles.length === 0) {
    return null;
  }

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg md:text-xl font-bold text-gray-900">Latest News</h2>
        <div className="flex gap-1.5">
          <button
            onClick={scrollLeft}
            className="p-1.5 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
            aria-label="Scroll left"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={scrollRight}
            className="p-1.5 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
            aria-label="Scroll right"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
      <div
        ref={scrollContainerRef}
        className="flex gap-3 overflow-x-auto scrollbar-hide pb-2"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {articles.map((article) => (
          <div
            key={article.id}
            onClick={() => handleClick(article.slug)}
            className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 p-3 min-w-[200px] md:min-w-[280px] flex-shrink-0 border border-gray-200 cursor-pointer"
          >
            {article.category && (
              <span className="inline-block bg-red-600 text-white px-2 py-0.5 rounded-full text-[10px] font-semibold mb-2">
                {article.category.name}
              </span>
            )}
            <h3 className="text-xs md:text-sm font-semibold text-gray-900 mb-2 line-clamp-2 leading-tight">
              {article.title}
            </h3>
            {article.excerpt && (
              <p className="text-[10px] md:text-xs text-gray-600 mb-2 line-clamp-2">
                {article.excerpt}
              </p>
            )}
            <div className="text-[10px] text-gray-500 flex items-center">
              <span className="mr-1">📅</span>
              {format(new Date(article.createdAt), 'MMM dd, yyyy')}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

