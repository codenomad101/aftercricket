'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Player {
  id: number;
  name: string;
  fullName?: string;
  role?: string;
  teamId?: number;
  team?: { name: string; flag: string };
  isInPlaying11: boolean;
}

interface Team {
  id: number;
  name: string;
  flag: string;
}

export default function PlayersPage() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [scraping, setScraping] = useState(false);
  const [message, setMessage] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [selectedTeamId, setSelectedTeamId] = useState('');
  const [isInPlaying11, setIsInPlaying11] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [playersRes, teamsRes] = await Promise.all([
        fetch('/api/players'),
        fetch('/api/teams'),
      ]);
      const playersData = await playersRes.json();
      const teamsData = await teamsRes.json();
      
      if (playersData.success) {
        setPlayers(playersData.data);
      }
      if (teamsData.success) {
        setTeams(teamsData.data);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleScrapePlayer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!playerName.trim()) {
      setMessage('Please enter a player name');
      return;
    }

    setScraping(true);
    setMessage('');
    try {
      const response = await fetch('/api/scrape/players', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          playerName: playerName.trim(),
          teamId: selectedTeamId ? parseInt(selectedTeamId) : null,
          isInPlaying11,
        }),
      });
      const data = await response.json();
      if (data.success) {
        setMessage(`Successfully scraped ${playerName}!`);
        setPlayerName('');
        setSelectedTeamId('');
        setIsInPlaying11(false);
        fetchData();
      } else {
        setMessage(`Error: ${data.error}`);
      }
    } catch (error) {
      setMessage('Error scraping player');
    } finally {
      setScraping(false);
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading players...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-dark-brown">Players Management</h1>
      </div>

      {/* Scrape Player Form */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
        <h2 className="text-xl font-bold text-dark-brown mb-4">Scrape Player from Wikipedia</h2>
        <form onSubmit={handleScrapePlayer} className="space-y-4">
          {message && (
            <div className={`p-4 rounded-lg ${
              message.includes('Error') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
            }`}>
              {message}
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Player Name *
              </label>
              <input
                type="text"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-light-blue"
                placeholder="e.g., Virat Kohli"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Team
              </label>
              <select
                value={selectedTeamId}
                onChange={(e) => setSelectedTeamId(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-light-blue"
              >
                <option value="">Select Team</option>
                {teams.map((team) => (
                  <option key={team.id} value={team.id}>
                    {team.flag} {team.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isInPlaying11}
                  onChange={(e) => setIsInPlaying11(e.target.checked)}
                  className="w-4 h-4 text-light-blue focus:ring-light-blue border-gray-300 rounded"
                />
                <span className="text-sm text-gray-700">In Playing 11</span>
              </label>
            </div>
          </div>
          <button
            type="submit"
            disabled={scraping}
            className="bg-gradient-to-r from-dark-brown to-dark-blue text-white px-6 py-2 rounded-lg hover:shadow-lg transition-all disabled:opacity-50"
          >
            {scraping ? 'Scraping...' : 'Scrape Player'}
          </button>
        </form>
      </div>

      {/* Players List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <h2 className="text-xl font-bold text-dark-brown p-4 bg-light-blue">All Players</h2>
        {players.length === 0 ? (
          <div className="text-center py-12 text-gray-600">
            No players found. Start by scraping a player above.
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Full Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Team</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Playing 11</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {players.map((player) => (
                <tr key={player.id}>
                  <td className="px-6 py-4 whitespace-nowrap font-medium">{player.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{player.fullName || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {player.team ? (
                      <span className="flex items-center space-x-2">
                        <span>{player.team.flag}</span>
                        <span>{player.team.name}</span>
                      </span>
                    ) : (
                      '-'
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{player.role || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {player.isInPlaying11 ? (
                      <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">Yes</span>
                    ) : (
                      <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs">No</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Link
                      href={`/admin/players/${player.id}/stats`}
                      className="text-red-600 hover:text-red-700 font-medium"
                    >
                      Manage Stats
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}



