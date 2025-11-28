'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';

export default function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [newsDropdownOpen, setNewsDropdownOpen] = useState(false);
  const [statsDropdownOpen, setStatsDropdownOpen] = useState(false);
  const [mobileNewsDropdownOpen, setMobileNewsDropdownOpen] = useState(false);
  const [mobileStatsDropdownOpen, setMobileStatsDropdownOpen] = useState(false);
  const newsDropdownRef = useRef<HTMLDivElement>(null);
  const statsDropdownRef = useRef<HTMLDivElement>(null);

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/series', label: 'Series' },
  ];

  const newsLinks = [
    { href: '/articles', label: 'All News' },
    { href: '/articles?filter=indian', label: 'Indian' },
    { href: '/articles?filter=international', label: 'International' },
  ];

  const statsLinks = [
    { href: '/stats', label: 'Player Stats' },
    { href: '/teams', label: 'Team Stats' },
    { href: '/rankings', label: 'Rankings' },
  ];

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (newsDropdownRef.current && !newsDropdownRef.current.contains(event.target as Node)) {
        setNewsDropdownOpen(false);
      }
      if (statsDropdownRef.current && !statsDropdownRef.current.contains(event.target as Node)) {
        setStatsDropdownOpen(false);
      }
    };

    if (newsDropdownOpen || statsDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [newsDropdownOpen, statsDropdownOpen]);

  const secondaryMenuItems = [
    { href: '/live-scores', label: 'Live Scores' },
    { href: '/ipl-2025', label: 'IPL 2025' },
    { href: '/match-predictions', label: 'Match Predictions' },
    { href: '/fantasy-tips', label: 'Fantasy Tips' },
    { href: '/interviews', label: 'Interviews' },
    { href: '/web-stories', label: 'Web Stories' },
    { href: '/videos', label: 'Videos' },
    { href: '/series', label: 'Series' },
    { href: '/schedule', label: 'Schedule' },
    { href: '/poll', label: 'Poll' },
    { href: '/northern', label: 'Northern' },
  ];

  return (
    <header className="bg-red-600 text-white shadow-xl sticky top-0 z-50">
      {/* Main Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link 
            href="/" 
            className="flex flex-col hover:opacity-90 transition-all duration-300 transform hover:scale-105"
          >
            <span className="text-2xl font-bold font-papyrus">afterCricket</span>
          </Link>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-6 items-center">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                  pathname === link.href
                    ? 'bg-white text-red-600 shadow-lg'
                    : 'hover:bg-red-700 hover:text-white'
                }`}
              >
                {link.label}
              </Link>
            ))}
            
            {/* News Dropdown */}
            <div className="relative" ref={newsDropdownRef}>
              <button
                onClick={() => setNewsDropdownOpen(!newsDropdownOpen)}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 flex items-center ${
                  pathname === '/articles' || pathname.startsWith('/articles')
                    ? 'bg-white text-red-600 shadow-lg'
                    : 'hover:bg-red-700 hover:text-white'
                }`}
              >
                News
                <svg
                  className={`ml-2 w-4 h-4 transition-transform ${newsDropdownOpen ? 'rotate-180' : ''}`}
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {newsDropdownOpen && (
                <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-lg shadow-xl z-50 border border-gray-200">
                  {newsLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setNewsDropdownOpen(false)}
                      className={`block px-4 py-2 text-sm transition-colors first:rounded-t-lg last:rounded-b-lg ${
                        pathname === link.href || (pathname === '/articles' && link.href === '/articles')
                          ? 'bg-red-600 text-white'
                          : 'text-gray-700 hover:bg-red-50 hover:text-red-600'
                      }`}
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
            
            {/* Stats Dropdown */}
            <div className="relative" ref={statsDropdownRef}>
              <button
                onClick={() => setStatsDropdownOpen(!statsDropdownOpen)}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 flex items-center ${
                  pathname.startsWith('/stats') || pathname.startsWith('/teams') || pathname.startsWith('/rankings')
                    ? 'bg-white text-red-600 shadow-lg'
                    : 'hover:bg-red-700 hover:text-white'
                }`}
              >
                Stats
                <svg
                  className={`ml-2 w-4 h-4 transition-transform ${statsDropdownOpen ? 'rotate-180' : ''}`}
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {statsDropdownOpen && (
                <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-lg shadow-xl z-50 border border-gray-200">
                  {statsLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setStatsDropdownOpen(false)}
                      className={`block px-4 py-2 text-sm transition-colors first:rounded-t-lg last:rounded-b-lg ${
                        pathname === link.href
                          ? 'bg-red-600 text-white'
                          : 'text-gray-700 hover:bg-red-50 hover:text-red-600'
                      }`}
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-red-700 transition-colors"
            aria-label="Toggle menu"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {mobileMenuOpen ? (
                <path d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <nav className="md:hidden py-4 space-y-2 animate-fadeIn">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                  pathname === link.href
                    ? 'bg-white text-red-600'
                    : 'hover:bg-red-700 hover:text-white'
                }`}
              >
                {link.label}
              </Link>
            ))}
            
            {/* Mobile News Dropdown */}
            <div>
              <button
                onClick={() => setMobileNewsDropdownOpen(!mobileNewsDropdownOpen)}
                className={`w-full text-left px-4 py-2 rounded-lg font-medium transition-all duration-300 flex items-center justify-between ${
                  pathname === '/articles' || pathname.startsWith('/articles')
                    ? 'bg-white text-red-600'
                    : 'hover:bg-red-700 hover:text-white'
                }`}
              >
                News
                <svg
                  className={`w-4 h-4 transition-transform ${mobileNewsDropdownOpen ? 'rotate-180' : ''}`}
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {mobileNewsDropdownOpen && (
                <div className="ml-4 mt-2 space-y-1">
                  {newsLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => {
                        setMobileMenuOpen(false);
                        setMobileNewsDropdownOpen(false);
                      }}
                      className={`block px-4 py-2 rounded-lg text-sm transition-all duration-300 ${
                        pathname === link.href || (pathname === '/articles' && link.href === '/articles')
                          ? 'bg-white text-red-600'
                          : 'hover:bg-red-700 hover:text-white'
                      }`}
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
            
            {/* Mobile Stats Dropdown */}
            <div>
              <button
                onClick={() => setMobileStatsDropdownOpen(!mobileStatsDropdownOpen)}
                className={`w-full text-left px-4 py-2 rounded-lg font-medium transition-all duration-300 flex items-center justify-between ${
                  pathname.startsWith('/stats') || pathname.startsWith('/teams') || pathname.startsWith('/rankings')
                    ? 'bg-white text-red-600'
                    : 'hover:bg-red-700 hover:text-white'
                }`}
              >
                Stats
                <svg
                  className={`w-4 h-4 transition-transform ${mobileStatsDropdownOpen ? 'rotate-180' : ''}`}
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {mobileStatsDropdownOpen && (
                <div className="ml-4 mt-2 space-y-1">
                  {statsLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => {
                        setMobileMenuOpen(false);
                        setMobileStatsDropdownOpen(false);
                      }}
                      className={`block px-4 py-2 rounded-lg text-sm transition-all duration-300 ${
                        pathname === link.href
                          ? 'bg-white text-red-600'
                          : 'hover:bg-red-700 hover:text-white'
                      }`}
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </nav>
        )}
      </div>
      
      {/* Secondary Menu */}
      <div className="bg-red-100 border-t border-red-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="hidden md:flex items-center space-x-1 overflow-x-auto scrollbar-hide py-2">
            {secondaryMenuItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`px-3 py-1 text-xs font-medium whitespace-nowrap transition-colors ${
                  pathname === item.href
                    ? 'text-red-700 font-semibold'
                    : 'text-red-600 hover:text-red-700 hover:bg-red-200'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          
          {/* Mobile Secondary Menu */}
          <nav className="md:hidden flex items-center space-x-1 overflow-x-auto scrollbar-hide py-2 px-2">
            {secondaryMenuItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`px-2 py-1 text-xs font-medium whitespace-nowrap transition-colors ${
                  pathname === item.href
                    ? 'text-red-700 font-semibold'
                    : 'text-red-600 hover:text-red-700'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
}

