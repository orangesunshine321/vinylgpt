import Discogs from 'discogs-client';
export async function findRelease(artist: string, title: string) {
  const client = new Discogs({ userToken: process.env.DISCOGS_TOKEN });
  const res = await client.search.artistRelease(artist, { release_title: title });
  return res.results[0] || null;
}