'use client';

import { useEffect, useState } from 'react';
import { CricketMatch } from '@/types';
import { format } from 'date-fns';

const cardColors = [
  'bg-gradient-to-br from-blue-500 to-blue-700',
  'bg-gradient-to-br from-green-500 to-green-700',
  'bg-gradient-to-br from-purple-500 to-purple-700',
  'bg-gradient-to-br from-orange-500 to-orange-700',
  'bg-gradient-to-br from-pink-500 to-pink-700',
  'bg-gradient-to-br from-teal-500 to-teal-700',
  'bg-gradient-to-br from-indigo-500 to-indigo-700',
  'bg-gradient-to-br from-red-500 to-red-700',
];

export default function LiveScores() {
  const [matches, setMatches] = useState<CricketMatch[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMatches();
    const interval = setInterval(fetchMatches, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, []);

  const fetchMatches = async () => {
    try {
      const response = await fetch('/api/cricket/live-scores');
      const data = await response.json();
      if (data.success) {
        setMatches(data.data);
      }
    } catch (error) {
      console.error('Error fetching matches:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-dark-brown mb-6 flex items-center">
          <span className="mr-3">🏏</span>
          Live Cricket Scores
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-white rounded-xl p-6 shadow-lg animate-pulse"
            >
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (matches.length === 0) {
    return (
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-dark-brown mb-6 flex items-center">
          <span className="mr-3">🏏</span>
          Live Cricket Scores
        </h2>
        <div className="bg-white rounded-xl p-12 shadow-lg text-center">
          <p className="text-xl text-gray-600">No live matches at the moment</p>
          <p className="text-sm text-gray-500 mt-2">Check back later for updates</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-12">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold text-dark-brown flex items-center">
          <span className="mr-3 animate-pulse">🔴</span>
          Live Cricket Scores
        </h2>
        <span className="text-sm text-gray-600 bg-light-blue px-3 py-1 rounded-full">
          Auto-refreshing every minute
        </span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {matches.map((match, index) => {
          const colorClass = cardColors[index % cardColors.length];
          const isLive = match.status === 'Live' || match.status === 'live';
          const isCompleted = match.status === 'Completed' || match.status === 'completed';

          return (
            <div
              key={match.id}
              className={`${colorClass} rounded-xl p-6 text-white shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 relative overflow-hidden`}
            >
              {/* Animated background pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full -mr-16 -mt-16"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-white rounded-full -ml-12 -mb-12"></div>
              </div>

              <div className="relative z-10">
                {/* Status Badge */}
                <div className="flex justify-between items-start mb-4">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold ${
                      isLive
                        ? 'bg-red-500 text-white animate-pulse'
                        : isCompleted
                        ? 'bg-green-500 text-white'
                        : 'bg-yellow-500 text-white'
                    }`}
                  >
                    {match.status}
                  </span>
                  <span className="text-xs opacity-80">
                    {format(new Date(match.date), 'MMM dd')}
                  </span>
                </div>

                {/* Match Name */}
                <h3 className="text-xl font-bold mb-2 line-clamp-2">
                  {match.name}
                </h3>

                {/* Venue */}
                <p className="text-sm opacity-90 mb-4 flex items-center">
                  <span className="mr-2">📍</span>
                  {match.venue}
                </p>

                {/* Teams and Scores */}
                <div className="space-y-3 mt-4">
                  {match.teams && match.teams[0] && (
                    <div className="bg-white bg-opacity-20 rounded-lg p-3 backdrop-blur-sm">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold">{match.teams[0]}</span>
                        {match.score && match.score[0] && (
                          <span className="text-lg font-bold">
                            {match.score[0].r}/{match.score[0].w}
                            <span className="text-sm ml-1">
                              ({match.score[0].o} ov)
                            </span>
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {match.teams && match.teams[1] && (
                    <div className="bg-white bg-opacity-20 rounded-lg p-3 backdrop-blur-sm">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold">{match.teams[1]}</span>
                        {match.score && match.score[1] && (
                          <span className="text-lg font-bold">
                            {match.score[1].r}/{match.score[1].w}
                            <span className="text-sm ml-1">
                              ({match.score[1].o} ov)
                            </span>
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Match Type */}
                {match.matchType && (
                  <div className="mt-4 pt-4 border-t border-white border-opacity-30">
                    <span className="text-xs opacity-80">{match.matchType}</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
