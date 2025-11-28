import { NextResponse } from 'next/server';
import { getSeries } from '@/lib/cricket-api';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const offset = parseInt(searchParams.get('offset') || '0');
    
    const series = await getSeries(offset);
    return NextResponse.json({ success: true, data: series });
  } catch (error) {
    console.error('Error fetching series:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch series' },
      { status: 500 }
    );
  }
}

