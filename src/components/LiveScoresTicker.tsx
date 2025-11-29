'use client';

import { useEffect, useState } from 'react';
import { CricketMatch } from '@/types';

export default function LiveScoresTicker() {
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

    if (loading || matches.length === 0) {
        return null;
    }

    return (
        <div className="bg-red-600 text-white py-2 overflow-hidden shadow-lg border-b-2 border-red-700">
            <div className="ticker-wrapper">
                <div className="ticker-content">
                    {/* Duplicate matches for seamless loop */}
                    {[...matches, ...matches].map((match, index) => (
                        <div key={`${match.id}-${index}`} className="ticker-item">
                            <span className="font-bold">🏏</span>
                            <span className="font-bold mx-2">{match.name}</span>
                            {match.teams && match.teams[0] && match.score && match.score[0] && (
                                <>
                                    <span className="mx-2">|</span>
                                    <span className="font-semibold">
                                        {match.teams[0]}: <span className="font-bold">{match.score[0].r}/{match.score[0].w}</span> <span className="text-sm opacity-90">({match.score[0].o} ov)</span>
                                    </span>
                                </>
                            )}
                            {match.teams && match.teams[1] && match.score && match.score[1] && (
                                <>
                                    <span className="mx-2">vs</span>
                                    <span className="font-semibold">
                                        {match.teams[1]}: <span className="font-bold">{match.score[1].r}/{match.score[1].w}</span> <span className="text-sm opacity-90">({match.score[1].o} ov)</span>
                                    </span>
                                </>
                            )}
                            <span className="mx-3">|</span>
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${match.status === 'Live' || match.status === 'live'
                                ? 'bg-white text-red-800 animate-pulse shadow-lg'
                                : 'bg-green-500 text-white'
                                }`}>
                                {match.status}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            <style jsx>{`
        .ticker-wrapper {
          width: 100%;
          overflow: hidden;
        }
        
        .ticker-content {
          display: flex;
          animation: scroll 60s linear infinite;
          white-space: nowrap;
        }
        
        .ticker-item {
          display: inline-flex;
          align-items: center;
          padding: 0 3rem;
          font-size: 0.8rem;
        }
        
        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        
        .ticker-content:hover {
          animation-play-state: paused;
        }
        
        @media (max-width: 768px) {
          .ticker-item {
            font-size: 0.7rem;
            padding: 0 2rem;
          }
        }
      `}</style>
        </div>
    );
}
