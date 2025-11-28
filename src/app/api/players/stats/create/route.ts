import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { playerStats } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      playerId,
      format,
      matches,
      runs,
      wickets,
      battingAverage,
      bowlingAverage,
      strikeRate,
      economyRate,
      highestScore,
      bestBowling,
      centuries,
      halfCenturies,
      fiveWickets,
    } = body;

    // Check if stats already exist for this player and format
    const existing = await db
      .select()
      .from(playerStats)
      .where(eq(playerStats.playerId, playerId))
      .where(eq(playerStats.format, format.toUpperCase()))
      .limit(1);

    if (existing.length > 0) {
      return NextResponse.json(
        { success: false, error: 'Stats for this format already exist. Use update instead.' },
        { status: 400 }
      );
    }

    const result = await db
      .insert(playerStats)
      .values({
        playerId,
        format: format.toUpperCase(),
        matches: matches || 0,
        runs: runs || 0,
        wickets: wickets || 0,
        battingAverage: battingAverage || null,
        bowlingAverage: bowlingAverage || null,
        strikeRate: strikeRate || null,
        economyRate: economyRate || null,
        highestScore: highestScore || null,
        bestBowling: bestBowling || null,
        centuries: centuries || 0,
        halfCenturies: halfCenturies || 0,
        fiveWickets: fiveWickets || 0,
        updatedAt: new Date(),
      })
      .returning();

    return NextResponse.json({ success: true, data: result[0] });
  } catch (error: any) {
    console.error('Error creating player stats:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create player stats' },
      { status: 500 }
    );
  }
}

