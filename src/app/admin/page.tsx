'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';

interface DashboardStats {
  articles: {
    total: number;
    published: number;
    draft: number;
  };
  players: number;
  teams: number;
  categories: number;
}

export default function AdminDashboard() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session) {
      router.push('/login');
      return;
    }

    fetchStats();
  }, [session, status, router]);

  const fetchStats = async () => {
    try {
      // Fetch articles
      const articlesRes = await fetch('/api/articles?published=false');
      const articlesData = await articlesRes.json();
      const allArticles = articlesData.success ? articlesData.data : [];
      const publishedArticles = allArticles.filter((a: any) => a.published);
      const draftArticles = allArticles.filter((a: any) => !a.published);

      // Fetch players
      const playersRes = await fetch('/api/players');
      const playersData = await playersRes.json();
      const playersCount = playersData.success ? playersData.data.length : 0;

      // Fetch teams
      const teamsRes = await fetch('/api/teams');
      const teamsData = await teamsRes.json();
      const teamsCount = teamsData.success ? teamsData.data.length : 0;

      // Fetch categories
      const categoriesRes = await fetch('/api/categories');
      const categoriesData = await categoriesRes.json();
      const categoriesCount = categoriesData.success ? categoriesData.data.length : 0;

      setStats({
        articles: {
          total: allArticles.length,
          published: publishedArticles.length,
          draft: draftArticles.length,
        },
        players: playersCount,
        teams: teamsCount,
        categories: categoriesCount,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="text-center py-12">
        <div className="text-lg text-gray-600">Loading...</div>
      </div>
    );
  }

  const quickActions = [
    { href: '/admin/articles/new', label: 'Create Article', icon: '📝', color: 'bg-red-600 hover:bg-red-700' },
    { href: '/admin/players', label: 'Manage Players', icon: '👤', color: 'bg-blue-600 hover:bg-blue-700' },
    { href: '/admin/teams', label: 'Manage Teams', icon: '🏏', color: 'bg-green-600 hover:bg-green-700' },
    { href: '/admin/categories', label: 'Manage Categories', icon: '📁', color: 'bg-purple-600 hover:bg-purple-700' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
        <p className="text-gray-600">Manage your cricket news platform</p>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-red-600">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Articles</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.articles.total}</p>
              </div>
              <div className="text-4xl">📰</div>
            </div>
            <div className="mt-4 flex space-x-4 text-sm">
              <span className="text-green-600">{stats.articles.published} published</span>
              <span className="text-gray-500">{stats.articles.draft} draft</span>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-blue-600">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Players</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.players}</p>
              </div>
              <div className="text-4xl">👤</div>
            </div>
            <Link href="/admin/players" className="text-sm text-blue-600 hover:text-blue-700 mt-4 inline-block">
              Manage Players →
            </Link>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-green-600">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Teams</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.teams}</p>
              </div>
              <div className="text-4xl">🏏</div>
            </div>
            <Link href="/admin/teams" className="text-sm text-green-600 hover:text-green-700 mt-4 inline-block">
              Manage Teams →
            </Link>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-purple-600">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Categories</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.categories}</p>
              </div>
              <div className="text-4xl">📁</div>
            </div>
            <Link href="/admin/categories" className="text-sm text-purple-600 hover:text-purple-700 mt-4 inline-block">
              Manage Categories →
            </Link>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className={`${action.color} text-white rounded-lg p-6 shadow-lg hover:shadow-xl transition-all transform hover:scale-105`}
            >
              <div className="text-4xl mb-3">{action.icon}</div>
              <div className="text-lg font-semibold">{action.label}</div>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Articles */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900">Recent Articles</h2>
          <Link href="/admin/articles" className="text-red-600 hover:text-red-700 font-medium">
            View All →
          </Link>
        </div>
        <div className="text-center py-8 text-gray-600">
          <p>Recent articles will appear here</p>
          <Link href="/admin/articles/new" className="text-red-600 hover:text-red-700 mt-2 inline-block">
            Create your first article
          </Link>
        </div>
      </div>
    </div>
  );
}
