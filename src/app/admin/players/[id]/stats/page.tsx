'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

interface Player {
  id: number;
  name: string;
  fullName: string | null;
  role: string | null;
  team: {
    id: number;
    name: string;
    flag: string | null;
  } | null;
}

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

export default function PlayerStatsPage() {
  const params = useParams();
  const router = useRouter();
  const playerId = params.id as string;
  const [player, setPlayer] = useState<Player | null>(null);
  const [stats, setStats] = useState<PlayerStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingStat, setEditingStat] = useState<PlayerStat | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    if (playerId) {
      fetchPlayer();
      fetchStats();
    }
  }, [playerId]);

  const fetchPlayer = async () => {
    try {
      const response = await fetch(`/api/players?teamId=`);
      const data = await response.json();
      if (data.success) {
        const foundPlayer = data.data.find((p: any) => p.id === parseInt(playerId));
        if (foundPlayer) {
          setPlayer(foundPlayer);
        }
      }
    } catch (error) {
      console.error('Error fetching player:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch(`/api/players/${playerId}/stats`);
      const data = await response.json();
      if (data.success) {
        setStats(data.data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (statId: number) => {
    if (!confirm('Are you sure you want to delete these stats?')) {
      return;
    }

    try {
      const response = await fetch(`/api/players/stats/${statId}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        setStats(stats.filter((s) => s.id !== statId));
      } else {
        alert('Failed to delete stats');
      }
    } catch (error) {
      console.error('Error deleting stats:', error);
      alert('Failed to delete stats');
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const statData = {
      playerId: parseInt(playerId),
      format: formData.get('format'),
      matches: parseInt(formData.get('matches') as string) || 0,
      runs: parseInt(formData.get('runs') as string) || 0,
      wickets: parseInt(formData.get('wickets') as string) || 0,
      battingAverage: formData.get('battingAverage') || null,
      bowlingAverage: formData.get('bowlingAverage') || null,
      strikeRate: formData.get('strikeRate') || null,
      economyRate: formData.get('economyRate') || null,
      highestScore: formData.get('highestScore') || null,
      bestBowling: formData.get('bestBowling') || null,
      centuries: parseInt(formData.get('centuries') as string) || 0,
      halfCenturies: parseInt(formData.get('halfCenturies') as string) || 0,
      fiveWickets: parseInt(formData.get('fiveWickets') as string) || 0,
    };

    try {
      const url = editingStat
        ? `/api/players/stats/${editingStat.id}`
        : '/api/players/stats/create';
      const method = editingStat ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(statData),
      });

      if (response.ok) {
        setShowAddForm(false);
        setEditingStat(null);
        fetchStats();
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to save stats');
      }
    } catch (error) {
      console.error('Error saving stats:', error);
      alert('Failed to save stats');
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  if (!player) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Player not found</p>
        <Link href="/admin/players" className="text-red-600 hover:text-red-700 mt-4 inline-block">
          Back to Players
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <Link href="/admin/players" className="text-red-600 hover:text-red-700 mb-4 inline-block">
          ← Back to Players
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">
          Player Stats: {player.name}
        </h1>
        {player.team && (
          <p className="text-gray-600 mt-2">
            {player.team.flag} {player.team.name} • {player.role || 'Player'}
          </p>
        )}
      </div>

      <div className="mb-6">
        <button
          onClick={() => {
            setShowAddForm(true);
            setEditingStat(null);
          }}
          className="bg-red-600 text-white px-6 py-2 rounded-md hover:bg-red-700 transition-colors"
        >
          Add Stats
        </button>
      </div>

      {/* Add/Edit Form */}
      {(showAddForm || editingStat) && (
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            {editingStat ? 'Edit Stats' : 'Add New Stats'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Format</label>
                <select
                  name="format"
                  required
                  defaultValue={editingStat?.format || ''}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="">Select Format</option>
                  <option value="TEST">Test</option>
                  <option value="ODI">ODI</option>
                  <option value="T20I">T20I</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Matches</label>
                <input
                  type="number"
                  name="matches"
                  defaultValue={editingStat?.matches || 0}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Runs</label>
                <input
                  type="number"
                  name="runs"
                  defaultValue={editingStat?.runs || 0}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Wickets</label>
                <input
                  type="number"
                  name="wickets"
                  defaultValue={editingStat?.wickets || 0}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Batting Average</label>
                <input
                  type="text"
                  name="battingAverage"
                  defaultValue={editingStat?.battingAverage || ''}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Bowling Average</label>
                <input
                  type="text"
                  name="bowlingAverage"
                  defaultValue={editingStat?.bowlingAverage || ''}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Strike Rate</label>
                <input
                  type="text"
                  name="strikeRate"
                  defaultValue={editingStat?.strikeRate || ''}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Economy Rate</label>
                <input
                  type="text"
                  name="economyRate"
                  defaultValue={editingStat?.economyRate || ''}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Highest Score</label>
                <input
                  type="text"
                  name="highestScore"
                  defaultValue={editingStat?.highestScore || ''}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Best Bowling</label>
                <input
                  type="text"
                  name="bestBowling"
                  defaultValue={editingStat?.bestBowling || ''}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Centuries</label>
                <input
                  type="number"
                  name="centuries"
                  defaultValue={editingStat?.centuries || 0}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Half Centuries</label>
                <input
                  type="number"
                  name="halfCenturies"
                  defaultValue={editingStat?.halfCenturies || 0}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">5 Wickets</label>
                <input
                  type="number"
                  name="fiveWickets"
                  defaultValue={editingStat?.fiveWickets || 0}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
            </div>
            <div className="flex space-x-4">
              <button
                type="submit"
                className="bg-red-600 text-white px-6 py-2 rounded-md hover:bg-red-700 transition-colors"
              >
                {editingStat ? 'Update' : 'Add'} Stats
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowAddForm(false);
                  setEditingStat(null);
                }}
                className="bg-gray-300 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Stats Table */}
      {stats.length === 0 ? (
        <div className="bg-white rounded-lg shadow-lg p-12 text-center">
          <p className="text-gray-600">No statistics available for this player</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-red-600 text-white">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Format</th>
                <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider">Matches</th>
                <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider">Runs</th>
                <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider">Wickets</th>
                <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider">Bat Avg</th>
                <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider">Bowl Avg</th>
                <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider">SR</th>
                <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider">HS</th>
                <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider">100s</th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {stats.map((stat) => (
                <tr key={stat.id}>
                  <td className="px-6 py-4 whitespace-nowrap font-medium">{stat.format}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">{stat.matches}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">{stat.runs}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">{stat.wickets}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">{stat.battingAverage || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">{stat.bowlingAverage || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">{stat.strikeRate || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">{stat.highestScore || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">{stat.centuries}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => {
                        setEditingStat(stat);
                        setShowAddForm(true);
                      }}
                      className="text-red-600 hover:text-red-700 mr-4"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(stat.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

