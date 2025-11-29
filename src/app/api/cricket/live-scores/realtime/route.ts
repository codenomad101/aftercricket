import { NextResponse } from 'next/server';
import { getLiveMatches } from '@/lib/cricket-api';

/**
 * Real-time endpoint that bypasses cache for fresh data
 * Use this endpoint for live score updates
 */
export async function GET() {
  try {
    // Force refresh to get latest data
    const matches = await getLiveMatches(true);
    return NextResponse.json({ 
      success: true, 
      data: matches,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error fetching real-time live scores:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch live scores' },
      { status: 500 }
    );
  }
}

