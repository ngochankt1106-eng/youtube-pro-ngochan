import { WatchHistoryItem, SavedVideoItem, VideoItem } from '@/types';
import { supabase, isSupabaseConfigured } from './supabase';

const HISTORY_KEY = 'yt_pro_history_v1';
const SAVED_KEY = 'yt_pro_saved_v1';
const SPEED_KEY = 'yt_pro_pref_speed';
const SEARCH_HISTORY_KEY = 'yt_pro_search_history';

export function getWatchHistory(): WatchHistoryItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error('Failed to load history from localStorage', e);
    return [];
  }
}

export function saveWatchHistory(items: WatchHistoryItem[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(items.slice(0, 100))); // keep max 100
  } catch (e) {
    console.error('Failed to save history', e);
  }
}

export function addToWatchHistory(video: VideoItem, progressSeconds: number = 0, durationSeconds?: number): WatchHistoryItem[] {
  const current = getWatchHistory();
  const existingIndex = current.findIndex((item) => item.id === video.id);

  const historyItem: WatchHistoryItem = {
    ...video,
    watchedAt: Date.now(),
    progress: Math.floor(progressSeconds),
    durationSeconds: durationSeconds ? Math.floor(durationSeconds) : undefined,
  };

  let updated: WatchHistoryItem[];
  if (existingIndex > -1) {
    current.splice(existingIndex, 1);
    updated = [historyItem, ...current];
  } else {
    updated = [historyItem, ...current];
  }

  saveWatchHistory(updated);

  // Optional Supabase sync
  if (isSupabaseConfigured && supabase) {
    supabase
      .from('user_watch_history')
      .upsert({
        video_id: video.id,
        title: video.title,
        channel_title: video.channelTitle,
        thumbnail: video.thumbnail,
        progress_seconds: Math.floor(progressSeconds),
        duration_seconds: durationSeconds ? Math.floor(durationSeconds) : null,
        watched_at: new Date().toISOString(),
      })
      .then(
        () => {},
        (err) => console.warn('Supabase sync skipped:', err)
      );
  }

  return updated;
}

export function removeFromWatchHistory(id: string): WatchHistoryItem[] {
  const current = getWatchHistory();
  const filtered = current.filter((item) => item.id !== id);
  saveWatchHistory(filtered);

  if (isSupabaseConfigured && supabase) {
    supabase
      .from('user_watch_history')
      .delete()
      .eq('video_id', id)
      .then(
        () => {},
        (err) => console.warn('Supabase delete skipped:', err)
      );
  }

  return filtered;
}

export function clearWatchHistory(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(HISTORY_KEY);
  if (isSupabaseConfigured && supabase) {
    supabase.from('user_watch_history').delete().neq('video_id', '').then(() => {});
  }
}

// Saved / Favorites
export function getSavedVideos(): SavedVideoItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(SAVED_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

export function isVideoSaved(id: string): boolean {
  const saved = getSavedVideos();
  return saved.some((item) => item.id === id);
}

export function toggleSaveVideo(video: VideoItem): boolean {
  const current = getSavedVideos();
  const exists = current.some((item) => item.id === video.id);

  if (exists) {
    const filtered = current.filter((item) => item.id !== video.id);
    localStorage.setItem(SAVED_KEY, JSON.stringify(filtered));
    return false;
  } else {
    const newItem: SavedVideoItem = {
      ...video,
      savedAt: Date.now(),
    };
    localStorage.setItem(SAVED_KEY, JSON.stringify([newItem, ...current]));
    return true;
  }
}

// Playback Speed
export function getStoredPlaybackSpeed(): number {
  if (typeof window === 'undefined') return 1;
  const raw = localStorage.getItem(SPEED_KEY);
  return raw ? parseFloat(raw) : 1;
}

export function setStoredPlaybackSpeed(speed: number): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(SPEED_KEY, speed.toString());
}

// Search History
export function getSearchHistory(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(SEARCH_HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

export function addSearchHistory(query: string): string[] {
  if (typeof window === 'undefined' || !query.trim()) return [];
  const current = getSearchHistory();
  const trimmed = query.trim();
  const filtered = current.filter((item) => item.toLowerCase() !== trimmed.toLowerCase());
  const updated = [trimmed, ...filtered].slice(0, 10);
  try {
    localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(updated));
  } catch (e) {}
  return updated;
}

export function removeSearchHistoryItem(query: string): string[] {
  const current = getSearchHistory();
  const filtered = current.filter((item) => item !== query);
  localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(filtered));
  return filtered;
}

export function clearSearchHistory(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(SEARCH_HISTORY_KEY);
}
