import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { players, playerStats, teams } from '@/lib/db/schema';
import { eq, inArray } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 100;

    // Get all players with teams
    const playersList = await db
      .select({
        id: players.id,
        name: players.name,
        fullName: players.fullName,
        role: players.role,
        teamId: players.teamId,
        team: {
          id: teams.id,
          name: teams.name,
          flag: teams.flag,
        },
      })
      .from(players)
      .leftJoin(teams, eq(players.teamId, teams.id))
      .limit(limit);

    if (playersList.length === 0) {
      return NextResponse.json({ success: true, data: [] });
    }

    // Get all stats for these players in one query
    const playerIds = playersList.map((p) => p.id);
    const allStats = await db
      .select()
      .from(playerStats)
      .where(inArray(playerStats.playerId, playerIds));

    // Group stats by player ID
    const statsByPlayerId = new Map<number, typeof allStats>();
    allStats.forEach((stat) => {
      if (!statsByPlayerId.has(stat.playerId)) {
        statsByPlayerId.set(stat.playerId, []);
      }
      statsByPlayerId.get(stat.playerId)!.push(stat);
    });

    // Combine players with their stats
    const result = playersList.map((player) => {
      const stats = statsByPlayerId.get(player.id) || [];
      return {
        player: {
          id: player.id,
          name: player.name,
          fullName: player.fullName,
          role: player.role,
          teamId: player.teamId,
        },
        team: player.team,
        stats: stats.map((s) => ({
          id: s.id,
          format: s.format,
          matches: s.matches,
          runs: s.runs,
          wickets: s.wickets,
          battingAverage: s.battingAverage,
          bowlingAverage: s.bowlingAverage,
          strikeRate: s.strikeRate,
          economyRate: s.economyRate,
          highestScore: s.highestScore,
          bestBowling: s.bestBowling,
          centuries: s.centuries,
          halfCenturies: s.halfCenturies,
          fiveWickets: s.fiveWickets,
        })),
      };
    });

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error('Error fetching players with stats:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch players with stats' },
      { status: 500 }
    );
  }
}

