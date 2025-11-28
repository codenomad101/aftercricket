import { NextResponse } from 'next/server';
import { scrapeAllData } from '@/scripts/scrape-all-data';

export async function POST() {
  try {
    // Run scraping in background (don't wait for completion)
    scrapeAllData().catch(console.error);

    return NextResponse.json({
      success: true,
      message: 'Scraping started in background. This may take several minutes.',
    });
  } catch (error: any) {
    console.error('Error starting scrape:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to start scraping' },
      { status: 500 }
    );
  }
}

