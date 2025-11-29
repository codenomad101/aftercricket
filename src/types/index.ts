export interface CricketMatch {
  id: string;
  name: string;
  matchType: string;
  status: string;
  venue: string;
  date: string;
  dateTimeGMT: string;
  teams: string[];
  teamInfo?: Array<{
    name: string;
    shortname: string;
    img: string;
  }>;
  score?: Array<{
    r: number;
    w: number;
    o: number;
    inning: string;
  }>;
  series_id?: string;
  fantasyEnabled?: boolean;
  bbbEnabled?: boolean;
  hasSquad?: boolean;
  matchStarted?: boolean;
  matchEnded?: boolean;
  result?: string; // e.g., "India won by 5 wickets", "Australia won by 42 runs"
  matchTime?: string; // e.g., "2:30 PM", "Today 3:00 PM", "Tomorrow 10:00 AM"
}

export interface CricketApiResponse {
  apikey?: string;
  status: string;
  data: CricketMatch[];
  info?: {
    hitsToday?: number;
    hitsUsed?: number;
    hitsLimit?: number;
    credits?: number;
    server?: number;
    offsetRows?: number;
    totalRows?: number;
    queryTime?: number;
    s?: number;
    cache?: number;
  };
}

export interface Article {
  id: number;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  imageUrl?: string;
  categoryId: number;
  authorId: number;
  published: boolean;
  createdAt: Date;
  updatedAt: Date;
  category?: Category;
  author?: User;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  createdAt: Date;
}

export interface User {
  id: number;
  email: string;
  name: string;
  password: string;
  role: 'admin' | 'user';
  createdAt: Date;
}

export interface ApiCache {
  id: number;
  key: string;
  value: string;
  expiresAt: Date;
  createdAt: Date;
}

export interface CricketSeries {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  odi: number;
  t20: number;
  test: number;
  squads?: number;
  matches: number;
}

export interface SeriesApiResponse {
  apikey?: string;
  status: string;
  data: CricketSeries[];
  info?: {
    hitsToday?: number;
    hitsUsed?: number;
    hitsLimit?: number;
    credits?: number;
    server?: number;
    offsetRows?: number;
    totalRows?: number;
    queryTime?: number;
    s?: number;
    cache?: number;
  };
}



