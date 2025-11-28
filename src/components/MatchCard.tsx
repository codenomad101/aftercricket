'use client';

import { CricketMatch } from '@/types';
import { format } from 'date-fns';
import Image from 'next/image';

interface MatchCardProps {
  match: CricketMatch;
}

export default function MatchCard({ match }: MatchCardProps) {
  const isLive = match.status?.toLowerCase().includes('live') || match.matchStarted;
  const isCompleted = match.matchEnded || match.status?.toLowerCase().includes('won') || match.status?.toLowerCase().includes('won by');
  
  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 p-3 min-w-[240px] flex-shrink-0 border border-gray-200">
      {/* Status Badge */}
      <div className="flex justify-between items-center mb-2">
        <span
          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
            isLive
              ? 'bg-red-500 text-white animate-pulse'
              : isCompleted
              ? 'bg-green-500 text-white'
              : 'bg-yellow-500 text-white'
          }`}
        >
          {match.status || 'Upcoming'}
        </span>
        <span className="text-[10px] text-gray-600">
          {format(new Date(match.date), 'MMM dd')}
        </span>
      </div>

      {/* Match Name */}
      <h3 className="text-sm font-semibold text-gray-900 mb-2 line-clamp-2 leading-tight">
        {match.name}
      </h3>

      {/* Teams with Flags */}
      <div className="space-y-1.5 mb-2">
        {match.teams && match.teams[0] && (
          <div className="flex items-center justify-between bg-gray-50 rounded p-1.5">
            <div className="flex items-center space-x-1.5">
              {match.teamInfo && match.teamInfo[0]?.img ? (
                <Image
                  src={match.teamInfo[0].img}
                  alt={match.teams[0]}
                  width={20}
                  height={20}
                  className="rounded-full"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              ) : (
                <div className="w-5 h-5 rounded-full bg-gray-300 flex items-center justify-center text-[10px] font-bold text-gray-600">
                  {match.teams[0].charAt(0).toUpperCase()}
                </div>
              )}
              <span className="text-xs font-medium text-gray-900 truncate max-w-[100px]">{match.teams[0]}</span>
            </div>
            {match.score && match.score[0] && (
              <span className="text-xs font-bold text-gray-900">
                {match.score[0].r}/{match.score[0].w}
                <span className="text-[10px] ml-0.5 text-gray-600">
                  ({match.score[0].o})
                </span>
              </span>
            )}
          </div>
        )}

        {match.teams && match.teams[1] && (
          <div className="flex items-center justify-between bg-gray-50 rounded p-1.5">
            <div className="flex items-center space-x-1.5">
              {match.teamInfo && match.teamInfo[1]?.img ? (
                <Image
                  src={match.teamInfo[1].img}
                  alt={match.teams[1]}
                  width={20}
                  height={20}
                  className="rounded-full"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              ) : (
                <div className="w-5 h-5 rounded-full bg-gray-300 flex items-center justify-center text-[10px] font-bold text-gray-600">
                  {match.teams[1].charAt(0).toUpperCase()}
                </div>
              )}
              <span className="text-xs font-medium text-gray-900 truncate max-w-[100px]">{match.teams[1]}</span>
            </div>
            {match.score && match.score[1] && (
              <span className="text-xs font-bold text-gray-900">
                {match.score[1].r}/{match.score[1].w}
                <span className="text-[10px] ml-0.5 text-gray-600">
                  ({match.score[1].o})
                </span>
              </span>
            )}
          </div>
        )}
      </div>

      {/* Venue and Match Type */}
      <div className="pt-2 border-t border-gray-200">
        <p className="text-[10px] text-gray-600 mb-1 flex items-center truncate">
          <span className="mr-1">📍</span>
          <span className="truncate">{match.venue}</span>
        </p>
        {match.matchType && (
          <span className="text-[10px] text-gray-500 uppercase">{match.matchType}</span>
        )}
      </div>
    </div>
  );
}

