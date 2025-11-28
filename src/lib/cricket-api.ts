import { db } from './db';
import { apiCache } from './db/schema';
import { eq, and, gt } from 'drizzle-orm';
import { CricketMatch, CricketApiResponse, CricketSeries, SeriesApiResponse } from '@/types';

const CACHE_TTL_MINUTES = 15;

async function getCachedData(key: string): Promise<string | null> {
  const cached = await db
    .select()
    .from(apiCache)
    .where(and(eq(apiCache.key, key), gt(apiCache.expiresAt, new Date())))
    .limit(1);

  if (cached.length > 0) {
    return cached[0].value;
  }
  return null;
}

async function setCachedData(key: string, value: string, ttlDays?: number): Promise<void> {
  const expiresAt = new Date();
  if (ttlDays) {
    expiresAt.setDate(expiresAt.getDate() + ttlDays);
  } else {
    expiresAt.setMinutes(expiresAt.getMinutes() + CACHE_TTL_MINUTES);
  }

  // Delete old cache if exists
  await db.delete(apiCache).where(eq(apiCache.key, key));

  // Insert new cache
  await db.insert(apiCache).values({
    key,
    value,
    expiresAt,
  });
}

export async function getLiveMatches(): Promise<CricketMatch[]> {
  const cacheKey = 'live_matches';
  
  // Try to get from cache
  const cached = await getCachedData(cacheKey);
  if (cached) {
    try {
      const data = JSON.parse(cached);
      return data.data || [];
    } catch (e) {
      console.error('Error parsing cached data:', e);
    }
  }

  // Fetch from API
  try {
    const apiKey = process.env.CRICKET_API_KEY;
    // cricapi.com API endpoint
    const baseUrl = 'https://api.cricapi.com/v1';
    
    // Using cricapi.com API - matches endpoint
    const response = await fetch(
      `${baseUrl}/matches?apikey=${apiKey}&offset=0`,
      {
        headers: {
          'Accept': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data: CricketApiResponse = await response.json();
    
    // Cache the response
    await setCachedData(cacheKey, JSON.stringify(data));

    return data.data || [];
  } catch (error) {
    console.error('Error fetching live matches:', error);
    return [];
  }
}

export async function getMatchDetails(matchId: string): Promise<CricketMatch | null> {
  const cacheKey = `match_${matchId}`;
  
  // Try to get from cache
  const cached = await getCachedData(cacheKey);
  if (cached) {
    try {
      return JSON.parse(cached);
    } catch (e) {
      console.error('Error parsing cached match data:', e);
    }
  }

  // Fetch from API
  try {
    const apiKey = process.env.CRICKET_API_KEY;
    const baseUrl = 'https://api.cricapi.com/v1';
    
    const response = await fetch(
      `${baseUrl}/match/${matchId}?apikey=${apiKey}`,
      {
        headers: {
          'Accept': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    
    // Cache the response
    await setCachedData(cacheKey, JSON.stringify(data));

    return data;
  } catch (error) {
    console.error('Error fetching match details:', error);
    return null;
  }
}

export async function getSeries(offset: number = 0): Promise<CricketSeries[]> {
  const cacheKey = `series_${offset}`;
  
  // Try to get from cache (cached for 1 week)
  const cached = await getCachedData(cacheKey);
  if (cached) {
    try {
      const data = JSON.parse(cached);
      console.log(`Using cached series data for offset ${offset}`);
      return data.data || [];
    } catch (e) {
      console.error('Error parsing cached series data:', e);
    }
  }

  // Fetch from API if not in cache or cache expired
  console.log(`Fetching series data from API for offset ${offset}...`);
  try {
    const apiKey = process.env.CRICKET_API_KEY;
    const baseUrl = 'https://api.cricapi.com/v1';
    
    const response = await fetch(
      `${baseUrl}/series?apikey=${apiKey}&offset=${offset}`,
      {
        headers: {
          'Accept': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data: SeriesApiResponse = await response.json();
    
    // Cache the response for 7 days (1 week)
    await setCachedData(cacheKey, JSON.stringify(data), 7);
    console.log(`Cached series data for offset ${offset} (expires in 7 days)`);

    return data.data || [];
  } catch (error) {
    console.error('Error fetching series:', error);
    return [];
  }
}

