'use client';

import Link from 'next/link';
import { format } from 'date-fns';
import { Article } from '@/types';

interface ArticleCardProps {
  article: Article;
}

export default function ArticleCard({ article }: ArticleCardProps) {
  return (
    <Link href={`/articles/${article.slug}`}>
      <div className="group bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 p-4 h-full transform hover:-translate-y-1 border border-gray-100 overflow-hidden relative">
        {/* Gradient overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-br from-red-50/0 to-red-100/0 group-hover:from-red-50/10 group-hover:to-red-100/10 transition-all duration-300 pointer-events-none"></div>
        
        <div className="relative z-10">
          {article.imageUrl && (
            <div className="mb-3 -mx-4 -mt-4">
              <img
                src={article.imageUrl}
                alt={article.title}
                className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-300"
                onError={(e) => { e.currentTarget.style.display = 'none'; }}
              />
            </div>
          )}
          {article.category && (
            <span className="inline-block bg-gradient-to-r from-red-500 to-red-600 text-white px-2 py-1 rounded-full text-[10px] font-semibold mb-2">
              {article.category.name}
            </span>
          )}
          <h2 className="text-base font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-red-600 transition-colors duration-300 leading-tight">
            {article.title}
          </h2>
          {article.excerpt && (
            <p className="text-xs text-gray-600 mb-3 line-clamp-2 leading-relaxed">
              {article.excerpt}
            </p>
          )}
          <div className="flex items-center justify-between text-xs pt-3 border-t border-gray-100">
            <span className="text-gray-500 flex items-center">
              <span className="mr-1">📅</span>
              {format(new Date(article.createdAt), 'MMM dd, yyyy')}
            </span>
            <span className="text-red-600 group-hover:text-red-700 font-semibold flex items-center transition-all duration-300 transform group-hover:translate-x-1">
              Read
              <span className="ml-1 group-hover:translate-x-1 transition-transform duration-300">→</span>
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

