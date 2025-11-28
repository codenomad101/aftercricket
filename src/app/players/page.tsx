'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface PlayerStat {
  id: number;
  format: string;
  matches: number;
  runs: number;
  wickets: number;
  battingAverage: string | null;
  bowlingAverage: string | null;
  strikeRate: string | null;
  economyRate: string | null;
  highestScore: string | null;
  bestBowling: string | null;
  centuries: number;
  halfCenturies: number;
  fiveWickets: number;
}

interface Player {
  player: {
    id: number;
    name: string;
    fullName: string | null;
    role: string | null;
    teamId: number | null;
  };
  team: {
    id: number;
    name: string;
    flag: string | null;
  } | null;
  stats: PlayerStat[];
}

const TRENDING_PLAYERS = [
  'Virat Kohli',
  'Rohit Sharma',
  'Steve Smith',
  'Babar Azam',
  'Shubman Gill',
  'Vaibhav Suryavanshi',
  'Kane Williamson',
  'Joe Root',
  'KL Rahul',
  'Rishabh Pant',
];

export default function PlayersPage() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [format, setFormat] = useState('ODI');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchPlayers();
  }, [format]);

  const fetchPlayers = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/players/with-stats?limit=100&format=${format}`);
      const data = await response.json();
      if (data.success) {
        setPlayers(data.data);
      }
    } catch (error) {
      console.error('Error fetching players:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPlayerStats = (player: Player, format: string) => {
    return player.stats.find((s) => s.format.toUpperCase() === format.toUpperCase());
  };

  const filteredPlayers = players.filter((p) => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      p.player.name.toLowerCase().includes(search) ||
      p.player.fullName?.toLowerCase().includes(search) ||
      p.team?.name.toLowerCase().includes(search)
    );
  });

  const trendingPlayers = filteredPlayers.filter((p) =>
    TRENDING_PLAYERS.some((name) => p.player.name.toLowerCase().includes(name.toLowerCase()))
  );

  const otherPlayers = filteredPlayers.filter(
    (p) => !TRENDING_PLAYERS.some((name) => p.player.name.toLowerCase().includes(name.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Players</h1>
        <div className="text-center py-12">
          <div className="text-sm text-gray-600">Loading players...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-4">Players</h1>

      {/* Filters */}
      <div className="mb-4 flex flex-wrap gap-4">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Format</label>
          <select
            value={format}
            onChange={(e) => setFormat(e.target.value)}
            className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            <option value="ODI">ODI</option>
            <option value="TEST">Test</option>
            <option value="T20I">T20I</option>
          </select>
        </div>
        <div className="flex-1 min-w-[200px]">
          <label className="block text-xs font-medium text-gray-700 mb-1">Search</label>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search players..."
            className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
          />
        </div>
      </div>

      {/* Trending Players */}
      {trendingPlayers.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-3 flex items-center">
            <span className="mr-2">🔥</span>
            Trending Players
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {trendingPlayers.map((item) => {
              const stat = getPlayerStats(item, format);
              return (
                <div
                  key={item.player.id}
                  className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 p-4 border-l-4 border-red-600"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="text-base font-bold text-gray-900">{item.player.name}</h3>
                      {item.player.fullName && (
                        <p className="text-xs text-gray-600">{item.player.fullName}</p>
                      )}
                    </div>
                    {item.team && (
                      <div className="flex items-center text-xs">
                        {item.team.flag && <span className="mr-1">{item.team.flag}</span>}
                        <span className="text-gray-600">{item.team.name}</span>
                      </div>
                    )}
                  </div>
                  {item.player.role && (
                    <span className="inline-block px-2 py-0.5 bg-red-100 text-red-800 rounded-full text-[10px] font-semibold mb-2">
                      {item.player.role}
                    </span>
                  )}
                  {stat ? (
                    <div className="mt-2 space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-600">Matches:</span>
                        <span className="font-semibold text-gray-900">{stat.matches}</span>
                      </div>
                      {stat.runs > 0 && (
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-600">Runs:</span>
                          <span className="font-semibold text-gray-900">{stat.runs}</span>
                        </div>
                      )}
                      {stat.wickets > 0 && (
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-600">Wickets:</span>
                          <span className="font-semibold text-gray-900">{stat.wickets}</span>
                        </div>
                      )}
                      {stat.battingAverage && (
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-600">Bat Avg:</span>
                          <span className="font-semibold text-gray-900">{stat.battingAverage}</span>
                        </div>
                      )}
                      {stat.centuries > 0 && (
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-600">100s:</span>
                          <span className="font-semibold text-gray-900">{stat.centuries}</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-xs text-gray-500 mt-2">No {format} stats available</p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* All Players */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-3">All Players</h2>
        {otherPlayers.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <p className="text-sm text-gray-600">No players found</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-red-600 text-white">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider">Player</th>
                    <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider">Team</th>
                    <th className="px-4 py-2 text-center text-xs font-medium uppercase tracking-wider">Role</th>
                    <th className="px-4 py-2 text-center text-xs font-medium uppercase tracking-wider">Matches</th>
                    <th className="px-4 py-2 text-center text-xs font-medium uppercase tracking-wider">Runs</th>
                    <th className="px-4 py-2 text-center text-xs font-medium uppercase tracking-wider">Wickets</th>
                    <th className="px-4 py-2 text-center text-xs font-medium uppercase tracking-wider">Bat Avg</th>
                    <th className="px-4 py-2 text-center text-xs font-medium uppercase tracking-wider">100s</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {otherPlayers.map((item) => {
                    const stat = getPlayerStats(item, format);
                    return (
                      <tr key={item.player.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{item.player.name}</div>
                          {item.player.fullName && (
                            <div className="text-xs text-gray-500">{item.player.fullName}</div>
                          )}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          {item.team ? (
                            <div className="flex items-center text-xs">
                              {item.team.flag && <span className="mr-1">{item.team.flag}</span>}
                              <span className="text-gray-900">{item.team.name}</span>
                            </div>
                          ) : (
                            <span className="text-xs text-gray-500">-</span>
                          )}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-center">
                          {item.player.role ? (
                            <span className="text-xs text-gray-900">{item.player.role}</span>
                          ) : (
                            <span className="text-xs text-gray-500">-</span>
                          )}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-center text-xs text-gray-900">
                          {stat?.matches || 0}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-center text-xs text-gray-900">
                          {stat?.runs || 0}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-center text-xs text-gray-900">
                          {stat?.wickets || 0}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-center text-xs text-gray-900">
                          {stat?.battingAverage || '-'}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-center text-xs text-gray-900">
                          {stat?.centuries || 0}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
