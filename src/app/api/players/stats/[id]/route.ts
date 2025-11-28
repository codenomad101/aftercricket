import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { playerStats } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const statId = parseInt(params.id);
    const body = await request.json();
    const {
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

    const result = await db
      .update(playerStats)
      .set({
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
      .where(eq(playerStats.id, statId))
      .returning();

    if (result.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Stats not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: result[0] });
  } catch (error: any) {
    console.error('Error updating player stats:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update player stats' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const statId = parseInt(params.id);

    await db
      .delete(playerStats)
      .where(eq(playerStats.id, statId));

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting player stats:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to delete player stats' },
      { status: 500 }
    );
  }
}

