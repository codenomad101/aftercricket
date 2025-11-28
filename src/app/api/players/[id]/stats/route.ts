import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { playerStats } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const playerId = parseInt(params.id);
    
    const stats = await db
      .select()
      .from(playerStats)
      .where(eq(playerStats.playerId, playerId));

    return NextResponse.json({ success: true, data: stats });
  } catch (error) {
    console.error('Error fetching player stats:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch player stats' },
      { status: 500 }
    );
  }
}

