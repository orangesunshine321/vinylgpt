// lib/discogs.ts
import axios from 'axios';

export interface DiscogsRelease {
  id: number;
  title: string;
  thumb: string;
  year?: number;
  genre?: string[];
  format?: string[];
}

export async function findRelease(artist: string, title: string): Promise<DiscogsRelease | null> {
  const token = process.env.DISCOGS_TOKEN;
  const query = encodeURIComponent(`${artist} ${title}`);
  const url = `https://api.discogs.com/database/search?q=${query}&token=${token}&type=release&per_page=5`;
  const { data } = await axios.get(url);
  return data.results?.[0] ?? null;
}
