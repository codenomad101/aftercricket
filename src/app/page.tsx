'use client';

import MatchSlider from '@/components/MatchSlider';
import NewsSliderSmall from '@/components/NewsSliderSmall';
import NewsSlider from '@/components/NewsSlider';

export default function Home() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Match Slider Section */}
      <div className="mb-4 animate-fadeIn">
        <MatchSlider />
      </div>

      {/* Small News Slider */}
      <div className="mb-6 animate-fadeIn">
        <NewsSliderSmall />
      </div>

      {/* News Sections */}
      <div className="space-y-8 animate-fadeIn">
        {/* India News Section */}
        <NewsSlider title="India News" filterBy="india" />
        
        {/* Other Countries News Section */}
        <NewsSlider title="International News" filterBy="other" />
      </div>
    </div>
  );
}
