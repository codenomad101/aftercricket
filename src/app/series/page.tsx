'use client';

import { useEffect, useState } from 'react';
import { CricketSeries } from '@/types';

export default function SeriesPage() {
  const [series, setSeries] = useState<CricketSeries[]>([]);
  const [loading, setLoading] = useState(true);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    fetchSeries();
  }, [offset]);

  const fetchSeries = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/cricket/series?offset=${offset}`);
      const data = await response.json();
      if (data.success) {
        setSeries(data.data);
        setHasMore(data.data.length === 50); // Assuming 50 per page
      }
    } catch (error) {
      console.error('Error fetching series:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return 'TBD';
    // If date is just month and day (e.g., "Mar 26"), return as is
    if (dateStr.length <= 6) return dateStr;
    // Otherwise try to format full date
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  if (loading && series.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-6">Cricket Series</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white rounded-lg shadow-lg p-6 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-4">Cricket Series</h1>

      {series.length === 0 ? (
        <div className="bg-white rounded-xl p-12 shadow-lg text-center">
          <p className="text-xl text-gray-600">No series available at the moment</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {series.map((s) => (
              <div
                key={s.id}
                className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 p-4 border-l-4 border-red-600"
              >
                <h2 className="text-base font-bold text-gray-900 mb-2 line-clamp-2 leading-tight">
                  {s.name}
                </h2>
                
                <div className="space-y-1.5 mb-3">
                  <div className="flex items-center text-xs text-gray-600">
                    <span className="font-medium mr-1.5">📅</span>
                    <span>{formatDate(s.startDate)} - {formatDate(s.endDate)}</span>
                  </div>
                  
                  <div className="flex items-center text-xs text-gray-600">
                    <span className="font-medium mr-1.5">🏏</span>
                    <span className="font-semibold text-gray-900">{s.matches} matches</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5 mb-2">
                  {s.test > 0 && (
                    <span className="px-2 py-0.5 bg-red-100 text-red-800 rounded-full text-[10px] font-semibold">
                      Test: {s.test}
                    </span>
                  )}
                  {s.odi > 0 && (
                    <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full text-[10px] font-semibold">
                      ODI: {s.odi}
                    </span>
                  )}
                  {s.t20 > 0 && (
                    <span className="px-2 py-0.5 bg-green-100 text-green-800 rounded-full text-[10px] font-semibold">
                      T20: {s.t20}
                    </span>
                  )}
                </div>

                {s.squads !== undefined && s.squads > 0 && (
                  <div className="text-xs text-gray-500">
                    Squads: {s.squads}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Pagination */}
          <div className="flex justify-center items-center space-x-4">
            <button
              onClick={() => setOffset(Math.max(0, offset - 50))}
              disabled={offset === 0 || loading}
              className="px-4 py-1.5 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>
            <span className="text-sm text-gray-600">Page {Math.floor(offset / 50) + 1}</span>
            <button
              onClick={() => setOffset(offset + 50)}
              disabled={!hasMore || loading}
              className="px-4 py-1.5 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
}
