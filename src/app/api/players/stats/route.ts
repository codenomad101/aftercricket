import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { players, playerStats, teams } from '@/lib/db/schema';
import { eq, and, or, sql } from 'drizzle-orm';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format') || 'ODI';
    const teamId = searchParams.get('teamId');
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 100;

    // Build conditions
    const conditions = [];
    
    // Format matching - try multiple variations
    const formatUpper = format.toUpperCase();
    conditions.push(
      or(
        eq(playerStats.format, formatUpper),
        eq(playerStats.format, format.toLowerCase()),
        sql`UPPER(${playerStats.format}) = UPPER(${formatUpper})`
      )
    );

    if (teamId) {
      conditions.push(eq(players.teamId, parseInt(teamId)));
    }

    let query = db
      .select({
        player: {
          id: players.id,
          name: players.name,
          fullName: players.fullName,
          role: players.role,
          teamId: players.teamId,
        },
        team: {
          id: teams.id,
          name: teams.name,
          flag: teams.flag,
        },
        stats: {
          id: playerStats.id,
          format: playerStats.format,
          matches: playerStats.matches,
          runs: playerStats.runs,
          wickets: playerStats.wickets,
          battingAverage: playerStats.battingAverage,
          bowlingAverage: playerStats.bowlingAverage,
          strikeRate: playerStats.strikeRate,
          economyRate: playerStats.economyRate,
          highestScore: playerStats.highestScore,
          bestBowling: playerStats.bestBowling,
          centuries: playerStats.centuries,
          halfCenturies: playerStats.halfCenturies,
          fiveWickets: playerStats.fiveWickets,
        },
      })
      .from(playerStats)
      .innerJoin(players, eq(playerStats.playerId, players.id))
      .leftJoin(teams, eq(players.teamId, teams.id));

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const result = await query.limit(limit);

    // Sort by runs (descending) for batsmen, wickets (descending) for bowlers
    const sortedResult = result.sort((a, b) => {
      if (a.stats.runs && b.stats.runs) {
        return b.stats.runs - a.stats.runs;
      }
      if (a.stats.wickets && b.stats.wickets) {
        return b.stats.wickets - a.stats.wickets;
      }
      return 0;
    });

    console.log(`Fetched ${sortedResult.length} player stats for format: ${format}`);
    return NextResponse.json({ success: true, data: sortedResult });
  } catch (error) {
    console.error('Error fetching player stats:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to fetch player stats' },
      { status: 500 }
    );
  }
}

