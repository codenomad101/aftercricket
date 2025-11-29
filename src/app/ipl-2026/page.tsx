'use client';

import { useState } from 'react';
import Image from 'next/image';

interface NewsArticle {
    id: number;
    title: string;
    summary: string;
    date: string;
    category: string;
}

export default function IPL2026Page() {
    const [selectedCategory, setSelectedCategory] = useState<string>('all');

    // IPL 2026 News Articles
    const newsArticles: NewsArticle[] = [
        {
            id: 1,
            title: "IPL 2026 Mega Auction: Record-Breaking Bids Expected",
            summary: "The IPL 2026 mega auction is set to witness unprecedented bidding wars as franchises prepare to rebuild their squads. With a purse of ₹120 crore per team, experts predict several players could breach the ₹25 crore mark. Star all-rounders and young Indian talents are expected to be the most sought-after players.",
            date: "2025-11-15",
            category: "auction"
        },
        {
            id: 2,
            title: "New IPL Franchise Announced: Ahmedabad Giants Join the League",
            summary: "The BCCI has officially announced the addition of a 11th franchise to the IPL, with the Ahmedabad Giants set to make their debut in IPL 2026. The team, owned by a consortium of business leaders, will play their home matches at the Narendra Modi Stadium, the world's largest cricket stadium.",
            date: "2025-11-10",
            category: "teams"
        },
        {
            id: 3,
            title: "IPL 2026 Schedule Released: Tournament to Start in March",
            summary: "The BCCI has released the complete schedule for IPL 2026, with the tournament set to commence on March 22, 2026. The league stage will feature 84 matches over 60 days, followed by playoffs and the final on May 31, 2026. The opening match will be held in Mumbai between defending champions and the new franchise.",
            date: "2025-11-20",
            category: "schedule"
        },
        {
            id: 4,
            title: "Impact Player Rule to Continue in IPL 2026 with Modifications",
            summary: "The IPL Governing Council has decided to retain the Impact Player rule for IPL 2026, but with significant modifications. Teams will now be allowed to use the Impact Player only in the first 15 overs, and the substitute must be an uncapped Indian player, promoting young talent.",
            date: "2025-11-18",
            category: "rules"
        },
        {
            id: 5,
            title: "IPL 2026 Prize Money Increased to ₹50 Crore for Winners",
            summary: "In a major boost for the tournament, the BCCI has announced a 25% increase in prize money for IPL 2026. The winning team will receive ₹50 crore, while the runners-up will get ₹25 crore. Additionally, the Orange Cap and Purple Cap winners will receive ₹1 crore each.",
            date: "2025-11-12",
            category: "news"
        },
        {
            id: 6,
            title: "International Stars Confirm Availability for Entire IPL 2026 Season",
            summary: "Several international cricket boards have confirmed that their players will be available for the entire duration of IPL 2026. This includes stars from England, Australia, South Africa, and New Zealand, ensuring that franchises can plan their strategies without worrying about mid-season departures.",
            date: "2025-11-25",
            category: "players"
        },
        {
            id: 7,
            title: "IPL 2026 to Feature Enhanced Technology and Fan Experience",
            summary: "The IPL 2026 season will introduce cutting-edge technology including AI-powered ball tracking, real-time player statistics on stadium screens, and an immersive AR experience for fans watching from home. The BCCI has partnered with leading tech companies to revolutionize cricket viewing.",
            date: "2025-11-22",
            category: "technology"
        },
        {
            id: 8,
            title: "Women's IPL to Run Parallel to Men's IPL in 2026",
            summary: "In a historic move, the BCCI has announced that the Women's IPL (WIPL) will run concurrently with the men's IPL in 2026. This will create a cricket festival spanning two months, with matches scheduled to ensure maximum viewership for both tournaments.",
            date: "2025-11-08",
            category: "wipl"
        }
    ];

    const categories = [
        { id: 'all', label: 'All News' },
        { id: 'auction', label: 'Auction' },
        { id: 'teams', label: 'Teams' },
        { id: 'players', label: 'Players' },
        { id: 'schedule', label: 'Schedule' },
        { id: 'rules', label: 'Rules' },
        { id: 'technology', label: 'Technology' },
    ];

    const filteredArticles = selectedCategory === 'all'
        ? newsArticles
        : newsArticles.filter(article => article.category === selectedCategory);

    return (
        <main className="min-h-screen bg-gradient-to-b from-purple-50 via-white to-blue-50">
            {/* Hero Section */}
            <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 text-white py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <h1 className="text-6xl md:text-7xl font-black mb-6 font-papyrus animate-pulse">
                            IPL 2026
                        </h1>
                        <p className="text-2xl md:text-3xl font-semibold mb-4">
                            The Biggest Cricket Carnival Returns
                        </p>
                        <p className="text-lg md:text-xl opacity-90 max-w-3xl mx-auto">
                            Get ready for the most exciting season of the Indian Premier League with new teams,
                            record-breaking auctions, and unforgettable cricket action!
                        </p>
                    </div>
                </div>
            </div>

            {/* Tournament Info Cards */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    <div className="bg-white rounded-2xl shadow-xl p-6 border-t-4 border-purple-600 transform hover:scale-105 transition-all duration-300">
                        <div className="text-center">
                            <div className="text-5xl mb-3">📅</div>
                            <h3 className="text-xl font-bold text-gray-800 mb-2">Tournament Dates</h3>
                            <p className="text-3xl font-black text-purple-600 mb-1">March 22 - May 31</p>
                            <p className="text-sm text-gray-600">2026</p>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl shadow-xl p-6 border-t-4 border-pink-600 transform hover:scale-105 transition-all duration-300">
                        <div className="text-center">
                            <div className="text-5xl mb-3">🏆</div>
                            <h3 className="text-xl font-bold text-gray-800 mb-2">Total Matches</h3>
                            <p className="text-3xl font-black text-pink-600 mb-1">84+</p>
                            <p className="text-sm text-gray-600">League + Playoffs</p>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl shadow-xl p-6 border-t-4 border-red-600 transform hover:scale-105 transition-all duration-300">
                        <div className="text-center">
                            <div className="text-5xl mb-3">💰</div>
                            <h3 className="text-xl font-bold text-gray-800 mb-2">Prize Money</h3>
                            <p className="text-3xl font-black text-red-600 mb-1">₹50 Cr</p>
                            <p className="text-sm text-gray-600">For Winners</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* News Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="mb-8">
                    <h2 className="text-4xl font-black text-gray-800 mb-4 font-papyrus">
                        Latest IPL 2026 News
                    </h2>
                    <p className="text-lg text-gray-600">
                        Stay updated with all the latest news, updates, and announcements about IPL 2026
                    </p>
                </div>

                {/* Category Filter */}
                <div className="mb-8 flex flex-wrap gap-3">
                    {categories.map((category) => (
                        <button
                            key={category.id}
                            onClick={() => setSelectedCategory(category.id)}
                            className={`px-6 py-2 rounded-full font-semibold transition-all duration-300 transform hover:scale-105 ${selectedCategory === category.id
                                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                                    : 'bg-white text-gray-700 hover:bg-gray-100 shadow'
                                }`}
                        >
                            {category.label}
                        </button>
                    ))}
                </div>

                {/* News Articles Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredArticles.map((article) => (
                        <article
                            key={article.id}
                            className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transform hover:scale-105 transition-all duration-300 border border-gray-100"
                        >
                            <div className="h-2 bg-gradient-to-r from-purple-600 via-pink-600 to-red-600"></div>
                            <div className="p-6">
                                <div className="flex items-center justify-between mb-3">
                                    <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-semibold uppercase">
                                        {article.category}
                                    </span>
                                    <span className="text-sm text-gray-500">
                                        {new Date(article.date).toLocaleDateString('en-US', {
                                            month: 'short',
                                            day: 'numeric',
                                            year: 'numeric'
                                        })}
                                    </span>
                                </div>

                                <h3 className="text-xl font-bold text-gray-800 mb-3 line-clamp-2 hover:text-purple-600 transition-colors">
                                    {article.title}
                                </h3>

                                <p className="text-gray-600 text-sm line-clamp-4 leading-relaxed">
                                    {article.summary}
                                </p>

                                <button className="mt-4 text-purple-600 font-semibold hover:text-pink-600 transition-colors flex items-center group">
                                    Read More
                                    <svg
                                        className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform"
                                        fill="none"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path d="M9 5l7 7-7 7" />
                                    </svg>
                                </button>
                            </div>
                        </article>
                    ))}
                </div>

                {filteredArticles.length === 0 && (
                    <div className="text-center py-12">
                        <p className="text-xl text-gray-600">No articles found in this category.</p>
                    </div>
                )}
            </div>

            {/* Call to Action */}
            <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 text-white py-16 mt-12">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-4xl font-black mb-4 font-papyrus">
                        Don't Miss a Single Match!
                    </h2>
                    <p className="text-xl mb-8 opacity-90">
                        Subscribe to get instant updates on IPL 2026 matches, scores, and exclusive content
                    </p>
                    <button className="bg-white text-purple-600 px-8 py-4 rounded-full font-bold text-lg hover:bg-gray-100 transform hover:scale-105 transition-all duration-300 shadow-xl">
                        Subscribe Now
                    </button>
                </div>
            </div>
        </main>
    );
}
