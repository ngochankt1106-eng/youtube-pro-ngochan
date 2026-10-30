export interface VideoItem {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  channelTitle: string;
  channelId?: string;
  publishedAt: string;
  duration?: string;
  viewCount?: string;
  likeCount?: string;
}

export interface VideoDetail extends VideoItem {
  subscribers?: string;
  commentCount?: string;
  tags?: string[];
  relatedVideos?: VideoItem[];
}

export interface WatchHistoryItem extends VideoItem {
  watchedAt: number;
  progress: number; // in seconds
  durationSeconds?: number;
}

export interface SavedVideoItem extends VideoItem {
  savedAt: number;
}

export interface DownloadOption {
  id: string;
  label: string;
  format: 'mp4' | 'mp3';
  quality: '1080p' | '720p' | '480p' | '360p' | '320kbps' | '192kbps' | '128kbps';
  resolution?: string;
  sizeEstimate?: string;
  downloadUrl?: string;
  service?: 'serverless' | 'external' | 'direct';
}
