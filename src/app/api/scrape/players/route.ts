import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getPlayerInfo } from '@/lib/wikipedia-scraper';
import { db } from '@/lib/db';
import { players, playerStats, teams } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';

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
    const { playerName, teamId, isInPlaying11 } = body;

    if (!playerName) {
      return NextResponse.json(
        { success: false, error: 'Player name is required' },
        { status: 400 }
      );
    }

    // Scrape player info from Wikipedia
    const playerInfo = await getPlayerInfo(playerName);

    if (!playerInfo) {
      return NextResponse.json(
        { success: false, error: 'Could not find player information' },
        { status: 404 }
      );
    }

    // Check if player already exists
    const existingPlayer = await db
      .select()
      .from(players)
      .where(eq(players.name, playerName))
      .limit(1);

    let playerId: number;
    if (existingPlayer.length > 0) {
      // Update existing player
      await db
        .update(players)
        .set({
          fullName: playerInfo.fullName || existingPlayer[0].fullName,
          teamId: teamId || existingPlayer[0].teamId,
          role: playerInfo.role || existingPlayer[0].role,
          battingStyle: playerInfo.battingStyle || existingPlayer[0].battingStyle,
          bowlingStyle: playerInfo.bowlingStyle || existingPlayer[0].bowlingStyle,
          dateOfBirth: playerInfo.dateOfBirth || existingPlayer[0].dateOfBirth,
          placeOfBirth: playerInfo.placeOfBirth || existingPlayer[0].placeOfBirth,
          imageUrl: playerInfo.imageUrl || existingPlayer[0].imageUrl,
          wikipediaUrl: playerInfo.wikipediaUrl,
          isInPlaying11: isInPlaying11 !== undefined ? isInPlaying11 : existingPlayer[0].isInPlaying11,
          updatedAt: new Date(),
        })
        .where(eq(players.id, existingPlayer[0].id));
      playerId = existingPlayer[0].id;
    } else {
      // Create new player
      const result = await db
        .insert(players)
        .values({
          name: playerInfo.name,
          fullName: playerInfo.fullName,
          teamId: teamId || null,
          role: playerInfo.role,
          battingStyle: playerInfo.battingStyle,
          bowlingStyle: playerInfo.bowlingStyle,
          dateOfBirth: playerInfo.dateOfBirth,
          placeOfBirth: playerInfo.placeOfBirth,
          imageUrl: playerInfo.imageUrl,
          wikipediaUrl: playerInfo.wikipediaUrl,
          isInPlaying11: isInPlaying11 || false,
        })
        .returning();
      playerId = result[0].id;
    }

    // Save player stats if available
    if (playerInfo.stats) {
      const formats = ['test', 'odi', 't20i'];
      for (const format of formats) {
        const stats = playerInfo.stats[format as keyof typeof playerInfo.stats];
        if (stats) {
          const existingStats = await db
            .select()
            .from(playerStats)
            .where(
              and(
                eq(playerStats.playerId, playerId),
                eq(playerStats.format, format.toUpperCase())
              )
            )
            .limit(1);

          if (existingStats.length > 0) {
            await db
              .update(playerStats)
              .set({
                matches: stats.matches || 0,
                runs: stats.runs || 0,
                wickets: stats.wickets || 0,
                battingAverage: stats.battingAverage,
                bowlingAverage: stats.bowlingAverage,
                strikeRate: stats.strikeRate,
                economyRate: stats.economyRate,
                highestScore: stats.highestScore,
                bestBowling: stats.bestBowling,
                centuries: stats.centuries || 0,
                halfCenturies: stats.halfCenturies || 0,
                fiveWickets: stats.fiveWickets || 0,
                updatedAt: new Date(),
              })
              .where(eq(playerStats.id, existingStats[0].id));
          } else {
            await db.insert(playerStats).values({
              playerId,
              format: format.toUpperCase(),
              matches: stats.matches || 0,
              runs: stats.runs || 0,
              wickets: stats.wickets || 0,
              battingAverage: stats.battingAverage,
              bowlingAverage: stats.bowlingAverage,
              strikeRate: stats.strikeRate,
              economyRate: stats.economyRate,
              highestScore: stats.highestScore,
              bestBowling: stats.bestBowling,
              centuries: stats.centuries || 0,
              halfCenturies: stats.halfCenturies || 0,
              fiveWickets: stats.fiveWickets || 0,
            });
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      data: { playerId, playerInfo },
    });
  } catch (error: any) {
    console.error('Error scraping player:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to scrape player' },
      { status: 500 }
    );
  }
}



