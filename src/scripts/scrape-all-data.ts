// Load environment variables FIRST using require (executes immediately)
require('dotenv').config({ path: require('path').join(process.cwd(), '.env') });
require('dotenv').config({ path: require('path').join(process.cwd(), '.env.local') });

// Now import database and other modules
import { db } from '../lib/db';
import { teams, players, playerStats } from '../lib/db/schema';
import { getTeamInfo, getPlayerInfo } from '../lib/wikipedia-scraper';
import { eq } from 'drizzle-orm';

const MAJOR_TEAMS = ['India', 'Australia', 'England', 'Pakistan', 'South Africa'];

async function scrapeAndSaveTeam(teamName: string) {
  console.log(`\n📊 Scraping team: ${teamName}...`);
  
  try {
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
      console.log(`✅ Updated team: ${teamInfo.name} (ID: ${teamId})`);
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
      console.log(`✅ Created team: ${teamInfo.name} (ID: ${teamId})`);
    }

    // Scrape players from playing 11
    if (teamInfo.playing11 && teamInfo.playing11.length > 0) {
      console.log(`\n👥 Found ${teamInfo.playing11.length} players in playing 11`);
      
      for (const playerName of teamInfo.playing11) {
        await scrapeAndSavePlayer(playerName, teamId, true);
        // Add delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    } else {
      console.log(`⚠️  No playing 11 found for ${teamName}`);
    }

    return teamId;
  } catch (error) {
    console.error(`❌ Error scraping team ${teamName}:`, error);
    return null;
  }
}

async function scrapeAndSavePlayer(playerName: string, teamId: number | null, isInPlaying11: boolean = false) {
  console.log(`  🔍 Scraping player: ${playerName}...`);
  
  try {
    const playerInfo = await getPlayerInfo(playerName);
    
    if (!playerInfo) {
      console.log(`  ⚠️  Could not find info for: ${playerName}`);
      return null;
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
          isInPlaying11: isInPlaying11 || existingPlayer[0].isInPlaying11,
          updatedAt: new Date(),
        })
        .where(eq(players.id, existingPlayer[0].id));
      playerId = existingPlayer[0].id;
      console.log(`  ✅ Updated player: ${playerName} (ID: ${playerId})`);
    } else {
      // Create new player - truncate fullName if it's too long
      const fullName = playerInfo.fullName && playerInfo.fullName.length > 1000 
        ? playerInfo.fullName.substring(0, 1000) 
        : playerInfo.fullName;

      const result = await db
        .insert(players)
        .values({
          name: playerInfo.name,
          fullName: fullName,
          teamId: teamId || null,
          role: playerInfo.role,
          battingStyle: playerInfo.battingStyle,
          bowlingStyle: playerInfo.bowlingStyle,
          dateOfBirth: playerInfo.dateOfBirth,
          placeOfBirth: playerInfo.placeOfBirth,
          imageUrl: playerInfo.imageUrl,
          wikipediaUrl: playerInfo.wikipediaUrl,
          isInPlaying11: isInPlaying11,
        })
        .returning();
      playerId = result[0].id;
      console.log(`  ✅ Created player: ${playerName} (ID: ${playerId})`);
    }

    // Save player stats if available
    if (playerInfo.stats) {
      const formats = ['test', 'odi', 't20i'];
      for (const format of formats) {
        const stats = playerInfo.stats[format as keyof typeof playerInfo.stats];
        if (stats && (stats.matches || stats.runs || stats.wickets)) {
          const existingStats = await db
            .select()
            .from(playerStats)
            .where(eq(playerStats.playerId, playerId))
            .where(eq(playerStats.format, format.toUpperCase()))
            .limit(1);

          const statsData = {
            playerId,
            format: format.toUpperCase(),
            matches: stats.matches || 0,
            runs: stats.runs || 0,
            wickets: stats.wickets || 0,
            battingAverage: stats.battingAverage?.toString(),
            bowlingAverage: stats.bowlingAverage?.toString(),
            strikeRate: stats.strikeRate?.toString(),
            economyRate: stats.economyRate?.toString(),
            highestScore: stats.highestScore?.toString(),
            bestBowling: stats.bestBowling?.toString(),
            centuries: stats.centuries || 0,
            halfCenturies: stats.halfCenturies || 0,
            fiveWickets: stats.fiveWickets || 0,
            updatedAt: new Date(),
          };

          if (existingStats.length > 0) {
            await db
              .update(playerStats)
              .set(statsData)
              .where(eq(playerStats.id, existingStats[0].id));
            console.log(`    📈 Updated ${format.toUpperCase()} stats`);
          } else {
            await db.insert(playerStats).values(statsData);
            console.log(`    📈 Created ${format.toUpperCase()} stats`);
          }
        }
      }
    }

    return playerId;
  } catch (error) {
    console.error(`  ❌ Error scraping player ${playerName}:`, error);
    return null;
  }
}

async function scrapeAllData() {
  console.log('🚀 Starting automatic data scraping...\n');
  console.log('This will scrape all teams and their players from Wikipedia.');
  console.log('This may take several minutes due to rate limiting...\n');

  const results = {
    teams: 0,
    players: 0,
    stats: 0,
  };

  for (const teamName of MAJOR_TEAMS) {
    const teamId = await scrapeAndSaveTeam(teamName);
    if (teamId) {
      results.teams++;
      
      // Count players for this team
      const teamPlayers = await db
        .select()
        .from(players)
        .where(eq(players.teamId, teamId));
      results.players += teamPlayers.length;
      
      // Count stats
      for (const player of teamPlayers) {
        const playerStatsData = await db
          .select()
          .from(playerStats)
          .where(eq(playerStats.playerId, player.id));
        results.stats += playerStatsData.length;
      }
    }
    // Add delay between teams
    await new Promise(resolve => setTimeout(resolve, 3000));
  }

  console.log('\n✨ Scraping complete!');
  console.log(`\n📊 Summary:`);
  console.log(`   Teams: ${results.teams}`);
  console.log(`   Players: ${results.players}`);
  console.log(`   Stats Records: ${results.stats}`);
}

// Run if called directly
if (require.main === module) {
  scrapeAllData()
    .then(() => {
      console.log('\n✅ Done!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Failed:', error);
      process.exit(1);
    });
}

export { scrapeAllData };

