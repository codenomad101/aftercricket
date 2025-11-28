'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';

export default function AdminNav() {
  const pathname = usePathname();

  const navItems = [
    { href: '/admin', label: 'Dashboard', icon: '📊' },
    { href: '/admin/articles', label: 'Articles', icon: '📝' },
    { href: '/admin/articles/new', label: 'New Article', icon: '➕' },
    { href: '/admin/players', label: 'Players', icon: '👤' },
    { href: '/admin/teams', label: 'Teams', icon: '🏏' },
    { href: '/admin/categories', label: 'Categories', icon: '📁' },
  ];

  return (
    <nav className="bg-red-600 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex space-x-4">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center space-x-1 ${
                  pathname === item.href
                    ? 'bg-white text-red-600'
                    : 'text-white hover:bg-red-700'
                }`}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            ))}
          </div>
          <div className="flex items-center space-x-4">
            <Link
              href="/"
              className="text-white hover:text-red-200 transition-colors"
            >
              View Site
            </Link>
            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className="bg-red-700 hover:bg-red-800 px-4 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

