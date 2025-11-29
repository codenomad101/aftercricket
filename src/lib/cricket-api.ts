// This file now uses web scraping instead of cricketData API
// See cricket-scraper.ts for the implementation details

import { getLiveMatches as getLiveMatchesScraped, getSeries as getSeriesScraped, getMatchDetails as getMatchDetailsScraped } from './cricket-scraper';
import { CricketMatch, CricketSeries } from '@/types';

// Re-export scraper functions for backward compatibility
export async function getLiveMatches(forceRefresh: boolean = false): Promise<CricketMatch[]> {
  return getLiveMatchesScraped(forceRefresh);
}

export async function getSeries(offset: number = 0): Promise<CricketSeries[]> {
  return getSeriesScraped(offset);
}

export async function getMatchDetails(matchId: string): Promise<CricketMatch | null> {
  return getMatchDetailsScraped(matchId);
}
