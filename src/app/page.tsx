'use client';

import MatchSlider from '@/components/MatchSlider';
import NewsSliderSmall from '@/components/NewsSliderSmall';
import NewsSlider from '@/components/NewsSlider';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Match Slider Section */}
        <div className="mb-12 animate-fadeIn">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl md:text-4xl font-black text-gray-800 font-papyrus">
              🔥 Live Cricket Action
            </h2>
          </div>
          <MatchSlider />
        </div>

        {/* Featured Content Section */}
        <div className="mb-8 bg-gradient-to-r from-purple-100 to-pink-100 rounded-3xl p-4 shadow-lg">
          <div className="text-center mb-4">
            <h2 className="text-lg md:text-2xl font-black text-gray-800 mb-2 font-papyrus">
              ⚡ Featured Content
            </h2>
            <p className="text-sm text-gray-700">
              Don't miss out on the hottest cricket content
            </p>
          </div>
          <NewsSliderSmall />
        </div>

        {/* News Sections */}
        <div className="space-y-12 animate-fadeIn">
          {/* India News Section */}
          <div className="bg-white rounded-3xl p-8 shadow-lg">
            <div className="flex items-center mb-6">
              <div className="text-4xl mr-4">🇮🇳</div>
              <div>
                <h2 className="text-xl md:text-3xl font-black text-gray-800 font-papyrus">
                  India Cricket News
                </h2>
                <p className="text-gray-600">Latest updates from Indian cricket</p>
              </div>
            </div>
            <NewsSlider title="" filterBy="india" />
          </div>

          {/* International News Section */}
          <div className="bg-white rounded-3xl p-8 shadow-lg">
            <div className="flex items-center mb-6">
              <div className="text-4xl mr-4">🌍</div>
              <div>
                <h2 className="text-xl md:text-3xl font-black text-gray-800 font-papyrus">
                  International Cricket News
                </h2>
                <p className="text-gray-600">Cricket news from around the world</p>
              </div>
            </div>
            <NewsSlider title="" filterBy="other" />
          </div>
        </div>

        {/* Call to Action Section */}
        <div className="mt-16 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white rounded-3xl p-12 shadow-2xl">
          <div className="text-center">
            <h2 className="text-2xl md:text-4xl font-black mb-4 font-papyrus">
              Never Miss a Moment!
            </h2>
            <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
              Get instant notifications for live matches, breaking news, and exclusive cricket content
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <button className="bg-white text-purple-600 px-8 py-4 rounded-full font-bold text-lg hover:bg-gray-100 transform hover:scale-105 transition-all duration-300 shadow-xl">
                📱 Get Notifications
              </button>
              <Link
                href="/articles"
                className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-white hover:text-purple-600 transform hover:scale-105 transition-all duration-300"
              >
                📰 Browse All News
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
