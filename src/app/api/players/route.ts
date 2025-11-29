import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { players, teams } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const teamId = searchParams.get('teamId');

    let query = db
      .select({
        id: players.id,
        name: players.name,
        fullName: players.fullName,
        role: players.role,
        teamId: players.teamId,
        isInPlaying11: players.isInPlaying11,
        team: {
          id: teams.id,
          name: teams.name,
          flag: teams.flag,
        },
      })
      .from(players)
      .leftJoin(teams, eq(players.teamId, teams.id))
      .$dynamic();

    if (teamId) {
      query = query.where(eq(players.teamId, parseInt(teamId)));
    }

    const result = await query;

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error('Error fetching players:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch players' },
      { status: 500 }
    );
  }
}



