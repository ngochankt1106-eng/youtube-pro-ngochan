import { NextRequest, NextResponse } from 'next/server';
import { VideoItem } from '@/types';

// Curated high quality trending videos for fallback / instant fast load
const FALLBACK_VIDEOS: VideoItem[] = [
  {
    id: 'dQw4w9WgXcQ',
    title: 'Rick Astley - Never Gonna Give You Up (Official Music Video)',
    description: 'The official video for “Never Gonna Give You Up” by Rick Astley',
    thumbnail: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg',
    channelTitle: 'Rick Astley',
    publishedAt: '2009-10-25T06:57:33Z',
    duration: '3:33',
    viewCount: '1.5B',
    likeCount: '16M',
  },
  {
    id: 'jfKfPfyJRdk',
    title: 'lofi hip hop radio 📚 - beats to relax/study to',
    description: 'lofi hip hop radio - peaceful beats to relax, study, and chill to.',
    thumbnail: 'https://i.ytimg.com/vi/jfKfPfyJRdk/hqdefault.jpg',
    channelTitle: 'Lofi Girl',
    publishedAt: '2023-01-01T00:00:00Z',
    duration: 'LIVE',
    viewCount: '68M',
    likeCount: '3.4M',
  },
  {
    id: '2g811Eo7K8U',
    title: 'SƠN TÙNG M-TP | ĐỪNG LÀM TRÁI TIM ANH ĐAU | OFFICIAL MUSIC VIDEO',
    description: 'SƠN TÙNG M-TP | ĐỪNG LÀM TRÁI TIM ANH ĐAU | OFFICIAL MUSIC VIDEO',
    thumbnail: 'https://i.ytimg.com/vi/2g811Eo7K8U/hqdefault.jpg',
    channelTitle: 'Sơn Tùng M-TP Official',
    publishedAt: '2024-06-08T13:00:00Z',
    duration: '5:24',
    viewCount: '85M',
    likeCount: '1.8M',
  },
  {
    id: 'kOCkne-Bku4',
    title: 'CHẠNG VẠNG - DINH DƯỠNG CHO TÂM HỒN | NHẠC L-O-F-I CHILL',
    description: 'Tuyển tập những bài hát lofi acoustic chill thư giãn nhẹ nhàng nhất',
    thumbnail: 'https://i.ytimg.com/vi/kOCkne-Bku4/hqdefault.jpg',
    channelTitle: 'Chillies & Friends',
    publishedAt: '2023-08-12T10:00:00Z',
    duration: '42:15',
    viewCount: '12M',
    likeCount: '240K',
  },
  {
    id: 'kJQP7kiw5Fk',
    title: 'Luis Fonsi - Despacito ft. Daddy Yankee',
    description: 'Luis Fonsi - Despacito ft. Daddy Yankee (Official Music Video)',
    thumbnail: 'https://i.ytimg.com/vi/kJQP7kiw5Fk/hqdefault.jpg',
    channelTitle: 'Luis Fonsi',
    publishedAt: '2017-01-13T05:00:02Z',
    duration: '4:42',
    viewCount: '8.4B',
    likeCount: '52M',
  },
  {
    id: 'JGwWNGJdvx8',
    title: 'Ed Sheeran - Shape of You (Official Music Video)',
    description: 'The official music video for Ed Sheeran - Shape of You',
    thumbnail: 'https://i.ytimg.com/vi/JGwWNGJdvx8/hqdefault.jpg',
    channelTitle: 'Ed Sheeran',
    publishedAt: '2017-01-30T11:00:00Z',
    duration: '4:24',
    viewCount: '6.2B',
    likeCount: '34M',
  },
  {
    id: 'fJ9rUzIMcZQ',
    title: 'Queen – Bohemian Rhapsody (Official Video Remastered)',
    description: 'Remastered in HD! Bohemian Rhapsody by Queen',
    thumbnail: 'https://i.ytimg.com/vi/fJ9rUzIMcZQ/hqdefault.jpg',
    channelTitle: 'Queen Official',
    publishedAt: '2008-08-01T14:48:40Z',
    duration: '5:59',
    viewCount: '1.7B',
    likeCount: '12M',
  },
  {
    id: '7PCkvCPvDXgk',
    title: 'Coding Music - Deep Focus Lo-Fi Beats to Code/Study to',
    description: 'Super relaxing coding lofi beats for concentration and software developers',
    thumbnail: 'https://i.ytimg.com/vi/7PCkvCPvDXgk/hqdefault.jpg',
    channelTitle: 'The Jazz Hop Café',
    publishedAt: '2023-04-18T16:00:00Z',
    duration: '1:15:30',
    viewCount: '5.2M',
    likeCount: '180K',
  },
];

// Helper to parse YouTube duration ISO 8601 (PT1H2M3S)
function formatDuration(isoDuration?: string): string {
  if (!isoDuration) return '';
  const match = isoDuration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return isoDuration;
  const hours = parseInt(match[1] || '0', 10);
  const minutes = parseInt(match[2] || '0', 10);
  const seconds = parseInt(match[3] || '0', 10);

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

// Scrape YouTube HTML Search
async function searchViaScrape(query: string): Promise<VideoItem[]> {
  const url = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
  const response = await fetch(url, {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
      'Accept-Language': 'vi-VN,vi;q=0.9,en-US;q=0.8,en;q=0.7',
    },
    next: { revalidate: 1800 },
  });

  if (!response.ok) {
    throw new Error(`YouTube Scrape failed: ${response.status}`);
  }

  const html = await response.text();
  const match = html.match(/ytInitialData\s*=\s*({.+?});<\/script>/);
  if (!match || !match[1]) {
    throw new Error('ytInitialData not found');
  }

  const json = JSON.parse(match[1]);
  const contents =
    json?.contents?.twoColumnSearchResultsRenderer?.primaryContents?.sectionListRenderer?.contents?.[0]
      ?.itemSectionRenderer?.contents;

  if (!Array.isArray(contents)) {
    throw new Error('No items found in scrape');
  }

  const results: VideoItem[] = [];

  for (const item of contents) {
    const vr = item.videoRenderer;
    if (!vr || !vr.videoId) continue;

    const id = vr.videoId;
    const title = vr.title?.runs?.[0]?.text || vr.title?.simpleText || 'Video';
    const channelTitle =
      vr.ownerText?.runs?.[0]?.text ||
      vr.longBylineText?.runs?.[0]?.text ||
      'YouTube Creator';
    const thumbnail =
      vr.thumbnail?.thumbnails?.[vr.thumbnail.thumbnails.length - 1]?.url ||
      `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
    const publishedAt = vr.publishedTimeText?.simpleText || '';
    const duration = vr.lengthText?.simpleText || '';
    const viewCount = vr.viewCountText?.simpleText || vr.shortViewCountText?.simpleText || '';
    const description =
      vr.detailedMetadataSnippets?.[0]?.snippetText?.runs?.map((r: { text: string }) => r.text).join('') || '';

    results.push({
      id,
      title,
      description,
      thumbnail: thumbnail.startsWith('//') ? `https:${thumbnail}` : thumbnail,
      channelTitle,
      publishedAt,
      duration,
      viewCount,
    });
  }

  return results;
}

// Invidious API instances fallback
const INVIDIOUS_INSTANCES = [
  'https://inv.tux.pizza',
  'https://invidious.nerdvpn.de',
  'https://vid.puffyan.us',
  'https://yt.artemislena.eu',
];

async function searchViaInvidious(query: string): Promise<VideoItem[]> {
  for (const instance of INVIDIOUS_INSTANCES) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);
      const res = await fetch(
        `${instance}/api/v1/search?q=${encodeURIComponent(query)}&type=video`,
        {
          headers: { 'Accept': 'application/json' },
          signal: controller.signal,
          next: { revalidate: 1800 },
        }
      );
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          return data.map((item: any) => ({
            id: item.videoId,
            title: item.title,
            description: item.description || '',
            thumbnail: item.videoThumbnails?.[0]?.url || `https://i.ytimg.com/vi/${item.videoId}/hqdefault.jpg`,
            channelTitle: item.author || 'YouTube Channel',
            publishedAt: item.publishedText || '',
            duration: item.lengthSeconds ? `${Math.floor(item.lengthSeconds / 60)}:${(item.lengthSeconds % 60).toString().padStart(2, '0')}` : '',
            viewCount: item.viewCountText || (item.viewCount ? `${item.viewCount.toLocaleString()} lượt xem` : ''),
          }));
        }
      }
    } catch (err) {
      // try next instance
    }
  }
  throw new Error('All Invidious instances failed');
}

// Official YouTube Data API v3
async function searchViaOfficialApi(apiKey: string, query: string): Promise<VideoItem[]> {
  const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=25&q=${encodeURIComponent(
    query
  )}&type=video&key=${apiKey}`;

  const res = await fetch(url, { next: { revalidate: 3600 } });
  if (!res.ok) {
    throw new Error(`Official API error: ${res.statusText}`);
  }

  const data = await res.json();
  return (data.items || []).map((item: any) => ({
    id: item.id.videoId,
    title: item.snippet.title,
    description: item.snippet.description,
    thumbnail: item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.medium?.url || `https://i.ytimg.com/vi/${item.id.videoId}/hqdefault.jpg`,
    channelTitle: item.snippet.channelTitle,
    publishedAt: item.snippet.publishedAt,
    viewCount: '',
    duration: '',
  }));
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get('q') || '';
  const category = searchParams.get('category') || '';

  let searchQuery = q.trim();
  if (!searchQuery) {
    if (category && category !== 'Tất cả' && category !== 'All') {
      searchQuery = `${category} trending`;
    } else {
      searchQuery = 'nhạc trẻ việt nam hot trending';
    }
  }

  const apiKey = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY;

  // 1. Try Official API if key is present
  if (apiKey) {
    try {
      const items = await searchViaOfficialApi(apiKey, searchQuery);
      if (items.length > 0) {
        return NextResponse.json({ items, source: 'official_api' });
      }
    } catch (e) {
      console.warn('Official API failed, falling back to scrapers:', e);
    }
  }

  // 2. Try YouTube HTML Scrape
  try {
    const items = await searchViaScrape(searchQuery);
    if (items.length > 0) {
      return NextResponse.json({ items, source: 'scrape' });
    }
  } catch (e) {
    console.warn('Scraper failed, falling back to Invidious:', e);
  }

  // 3. Try Invidious API
  try {
    const items = await searchViaInvidious(searchQuery);
    if (items.length > 0) {
      return NextResponse.json({ items, source: 'invidious' });
    }
  } catch (e) {
    console.warn('Invidious failed, using curated fallback:', e);
  }

  // 4. Fallback to rich curated list with filter
  const filtered = FALLBACK_VIDEOS.filter((v) =>
    searchQuery === 'nhạc trẻ việt nam hot trending'
      ? true
      : v.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.channelTitle.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return NextResponse.json({
    items: filtered.length > 0 ? filtered : FALLBACK_VIDEOS,
    source: 'fallback',
  });
}
