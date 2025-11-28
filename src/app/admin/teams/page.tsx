'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface Team {
  id: number;
  name: string;
  country: string;
  flag: string;
}

export default function TeamsPage() {
  const router = useRouter();
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [scraping, setScraping] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchTeams();
  }, []);

  const fetchTeams = async () => {
    try {
      const response = await fetch('/api/teams');
      const data = await response.json();
      if (data.success) {
        setTeams(data.data);
      }
    } catch (error) {
      console.error('Error fetching teams:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleScrapeAll = async () => {
    setScraping(true);
    setMessage('Starting automatic scraping of all teams and players. This may take several minutes...');
    try {
      const response = await fetch('/api/scrape/all', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await response.json();
      if (data.success) {
        setMessage(data.message || 'Scraping started! Check back in a few minutes.');
        // Refresh teams after a delay
        setTimeout(() => {
          fetchTeams();
        }, 5000);
      } else {
        setMessage(`Error: ${data.error}`);
      }
    } catch (error) {
      setMessage('Error starting scrape');
    } finally {
      setScraping(false);
    }
  };

  const handleScrapeTeam = async (teamName: string) => {
    setScraping(true);
    setMessage('');
    try {
      const response = await fetch('/api/scrape/teams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ teamName }),
      });
      const data = await response.json();
      if (data.success) {
        setMessage(`Successfully scraped ${teamName}!`);
        fetchTeams();
      } else {
        setMessage(`Error: ${data.error}`);
      }
    } catch (error) {
      setMessage('Error scraping team');
    } finally {
      setScraping(false);
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading teams...</div>;
  }

  const majorTeams = ['India', 'Australia', 'England', 'Pakistan', 'South Africa'];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-dark-brown">Teams Management</h1>
        <div className="flex space-x-4">
          <button
            onClick={handleScrapeAll}
            disabled={scraping}
            className="bg-gradient-to-r from-dark-brown to-dark-blue text-white px-6 py-2 rounded-lg hover:shadow-lg transition-all disabled:opacity-50"
          >
            {scraping ? 'Scraping...' : 'Scrape All Teams'}
          </button>
        </div>
      </div>

      {message && (
        <div className={`mb-4 p-4 rounded-lg ${
          message.includes('Error') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
        }`}>
          {message}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {majorTeams.map((teamName) => {
          const team = teams.find(t => t.name === teamName);
          return (
            <div
              key={teamName}
              className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <span className="text-4xl">{team?.flag || '🏏'}</span>
                  <div>
                    <h3 className="text-xl font-bold text-dark-brown">{teamName}</h3>
                    {team && (
                      <p className="text-sm text-gray-600">ID: {team.id}</p>
                    )}
                  </div>
                </div>
              </div>
              <button
                onClick={() => handleScrapeTeam(teamName)}
                disabled={scraping}
                className="w-full bg-light-blue text-dark-blue px-4 py-2 rounded-lg hover:bg-light-brown hover:text-dark-brown transition-colors disabled:opacity-50"
              >
                {scraping ? 'Scraping...' : team ? 'Update Team' : 'Scrape Team'}
              </button>
            </div>
          );
        })}
      </div>

      {teams.length > 0 && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <h2 className="text-xl font-bold text-dark-brown p-4 bg-light-blue">All Teams</h2>
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Flag</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Country</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {teams.map((team) => (
                <tr key={team.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-2xl">{team.flag}</td>
                  <td className="px-6 py-4 whitespace-nowrap font-medium">{team.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{team.country}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => router.push(`/admin/teams/${team.id}/players`)}
                      className="text-light-blue hover:text-dark-blue"
                    >
                      View Players
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

