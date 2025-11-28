import { NextResponse } from 'next/server';
import { getLiveMatches } from '@/lib/cricket-api';

export async function GET() {
  try {
    const matches = await getLiveMatches();
    return NextResponse.json({ success: true, data: matches });
  } catch (error) {
    console.error('Error fetching live scores:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch live scores' },
      { status: 500 }
    );
  }
}



