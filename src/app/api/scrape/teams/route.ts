import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { scrapeAllTeams, getTeamInfo } from '@/lib/wikipedia-scraper';
import { db } from '@/lib/db';
import { teams, players } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

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
    const { teamName } = body;

    if (teamName) {
      // Scrape single team
      const teamInfo = await getTeamInfo(teamName);
      
      // Save or update team
      const existingTeam = await db
        .select()
        .from(teams)
        .where(eq(teams.name, teamInfo.name))
        .limit(1);

      let teamId: number;
      if (existingTeam.length > 0) {
        await db
          .update(teams)
          .set({
            country: teamInfo.country,
            flag: teamInfo.flag,
            updatedAt: new Date(),
          })
          .where(eq(teams.id, existingTeam[0].id));
        teamId = existingTeam[0].id;
      } else {
        const result = await db
          .insert(teams)
          .values({
            name: teamInfo.name,
            country: teamInfo.country,
            flag: teamInfo.flag,
          })
          .returning();
        teamId = result[0].id;
      }

      return NextResponse.json({
        success: true,
        data: { teamInfo, teamId },
      });
    } else {
      // Scrape all teams
      const teamsInfo = await scrapeAllTeams();
      
      // Save teams to database
      const savedTeams = [];
      for (const teamInfo of teamsInfo) {
        const existingTeam = await db
          .select()
          .from(teams)
          .where(eq(teams.name, teamInfo.name))
          .limit(1);

        if (existingTeam.length > 0) {
          await db
            .update(teams)
            .set({
              country: teamInfo.country,
              flag: teamInfo.flag,
              updatedAt: new Date(),
            })
            .where(eq(teams.id, existingTeam[0].id));
          savedTeams.push({ ...teamInfo, id: existingTeam[0].id });
        } else {
          const result = await db
            .insert(teams)
            .values({
              name: teamInfo.name,
              country: teamInfo.country,
              flag: teamInfo.flag,
            })
            .returning();
          savedTeams.push({ ...teamInfo, id: result[0].id });
        }
      }

      return NextResponse.json({
        success: true,
        data: savedTeams,
      });
    }
  } catch (error: any) {
    console.error('Error scraping teams:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to scrape teams' },
      { status: 500 }
    );
  }
}



