'use client';

import { useEffect, useState, useRef } from 'react';
import { CricketMatch } from '@/types';
import MatchCard from './MatchCard';

export default function MatchSlider() {
  const [matches, setMatches] = useState<CricketMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchMatches();
    // Real-time updates: Refresh every 30 seconds for live scores
    const interval = setInterval(fetchMatches, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchMatches = async () => {
    try {
      // Use real-time endpoint for fresh data
      const response = await fetch('/api/cricket/live-scores/realtime', {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
        },
      });
      const data = await response.json();
      if (data.success) {
        setMatches(data.data.slice(0, 10)); // Limit to 10 matches for slider
      }
    } catch (error) {
      console.error('Error fetching matches:', error);
      // Fallback to regular endpoint if real-time fails
      try {
        const fallbackResponse = await fetch('/api/cricket/live-scores');
        const fallbackData = await fallbackResponse.json();
        if (fallbackData.success) {
          setMatches(fallbackData.data.slice(0, 10));
        }
      } catch (fallbackError) {
        console.error('Fallback fetch also failed:', fallbackError);
      }
    } finally {
      setLoading(false);
    }
  };

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -400, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 400, behavior: 'smooth' });
    }
  };

  if (loading) {
    return (
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-3">Live Matches</h2>
        <div className="flex gap-3 overflow-hidden">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-white rounded-lg p-3 shadow-md animate-pulse min-w-[240px] flex-shrink-0"
            >
              <div className="h-3 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (matches.length === 0) {
    return (
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-3">Live Matches</h2>
        <div className="bg-white rounded-lg p-6 shadow-md text-center">
          <p className="text-sm text-gray-600">No matches at the moment</p>
          <p className="text-xs text-gray-500 mt-1">Check back later for updates</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xl font-bold text-gray-900">Live Matches</h2>
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
        {matches.map((match) => (
          <MatchCard key={match.id} match={match} />
        ))}
      </div>
    </div>
  );
}

