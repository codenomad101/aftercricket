'use client';

import { useEffect, useState } from 'react';

interface PlayerStat {
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
  stats: {
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
  };
}

export default function StatsPage() {
  const [stats, setStats] = useState<PlayerStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [format, setFormat] = useState('ODI');
  const [selectedTeam, setSelectedTeam] = useState<string>('all');
  const [teams, setTeams] = useState<Array<{ id: number; name: string }>>([]);

  useEffect(() => {
    fetchTeams();
  }, []);

  useEffect(() => {
    fetchStats();
  }, [format, selectedTeam]);

  const fetchTeams = async () => {
    try {
      const response = await fetch('/api/teams');
      const data = await response.json();
      if (data.success) {
        setTeams(data.data);
      }
    } catch (error) {
      console.error('Error fetching teams:', error);
    }
  };

  const fetchStats = async () => {
    setLoading(true);
    try {
      const url = `/api/players/stats?format=${format}${selectedTeam !== 'all' ? `&teamId=${selectedTeam}` : ''}&limit=100`;
      const response = await fetch(url);
      const data = await response.json();
      if (data.success) {
        setStats(data.data || []);
      } else {
        console.error('Failed to fetch stats:', data.error);
        setStats([]);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
      setStats([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-4">Player Statistics</h1>

      {/* Filters */}
      <div className="mb-6 flex flex-wrap gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Format</label>
          <select
            value={format}
            onChange={(e) => setFormat(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            <option value="ODI">ODI</option>
            <option value="TEST">Test</option>
            <option value="T20I">T20I</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Team</label>
          <select
            value={selectedTeam}
            onChange={(e) => setSelectedTeam(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            <option value="all">All Teams</option>
            {teams.map((team) => (
              <option key={team.id} value={team.id}>
                {team.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="text-lg text-gray-600">Loading statistics...</div>
        </div>
      ) : stats.length === 0 ? (
        <div className="bg-white rounded-xl p-12 shadow-lg text-center">
          <p className="text-xl text-gray-600 mb-2">No statistics available</p>
          <p className="text-sm text-gray-500">
            Try selecting a different format or team. Make sure player statistics have been imported into the database.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-red-600 text-white">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Player</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Team</th>
                  <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider">Matches</th>
                  <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider">Runs</th>
                  <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider">Wickets</th>
                  <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider">Bat Avg</th>
                  <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider">Bowl Avg</th>
                  <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider">SR</th>
                  <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider">HS</th>
                  <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider">100s</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {stats.map((item) => (
                  <tr key={item.stats.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{item.player.name}</div>
                      {item.player.role && (
                        <div className="text-sm text-gray-500">{item.player.role}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {item.team?.flag && <span className="mr-2">{item.team.flag}</span>}
                        <span className="text-sm text-gray-900">{item.team?.name || 'N/A'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-900">
                      {item.stats.matches || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-900">
                      {item.stats.runs || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-900">
                      {item.stats.wickets || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-900">
                      {item.stats.battingAverage || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-900">
                      {item.stats.bowlingAverage || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-900">
                      {item.stats.strikeRate || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-900">
                      {item.stats.highestScore || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-900">
                      {item.stats.centuries || 0}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}



