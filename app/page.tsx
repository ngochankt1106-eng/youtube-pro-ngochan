'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import CategoryChips from '@/components/CategoryChips';
import VideoCard from '@/components/VideoCard';
import { VideoItem, WatchHistoryItem } from '@/types';
import { getWatchHistory } from '@/lib/storage';
import { Sparkles, Clock, Flame, Play, RefreshCw } from 'lucide-react';
import Link from 'next/link';

function HomeContent() {
  const searchParams = useSearchParams();
  const queryParam = searchParams.get('q') || '';
  const categoryParam = searchParams.get('category') || 'Tất cả';

  const [selectedCategory, setSelectedCategory] = useState(categoryParam);
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [historyItems, setHistoryItems] = useState<WatchHistoryItem[]>([]);

  // Load continue watching history
  useEffect(() => {
    const history = getWatchHistory();
    setHistoryItems(history.slice(0, 6));
  }, []);

  // Sync category param
  useEffect(() => {
    if (categoryParam) {
      setSelectedCategory(categoryParam);
    }
  }, [categoryParam]);

  // Fetch videos
  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    const q = queryParam || (selectedCategory !== 'Tất cả' ? selectedCategory : '');
    const url = `/api/search?q=${encodeURIComponent(q)}&category=${encodeURIComponent(
      selectedCategory
    )}`;

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        if (isMounted) {
          setVideos(data.items || []);
        }
      })
      .catch((err) => {
        console.error('Error fetching videos:', err);
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [queryParam, selectedCategory]);

  return (
    <div className="space-y-6">
      {/* Category Pills Header */}
      <div className="sticky top-[57px] z-20 bg-[#0F0F0F]/95 backdrop-blur-md pt-1 pb-2">
        <CategoryChips
          selectedCategory={selectedCategory}
          onSelectCategory={(cat) => setSelectedCategory(cat)}
        />
      </div>

      {/* Continue Watching (Tiếp tục xem) Shelf if history exists */}
      {!queryParam && historyItems.length > 0 && selectedCategory === 'Tất cả' && (
        <section className="bg-gradient-to-r from-[#171717] to-[#121212] border border-[#272727] rounded-3xl p-4 sm:p-5 shadow-lg">
          <div className="flex items-center justify-between mb-3.5">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-xl bg-red-600/20 text-red-500">
                <Clock size={18} />
              </div>
              <h2 className="text-base font-bold text-white">Tiếp tục xem</h2>
            </div>
            <Link
              href="/history"
              className="text-xs font-semibold text-neutral-400 hover:text-red-400 transition-colors"
            >
              Xem tất cả ({historyItems.length})
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {historyItems.map((item) => (
              <Link
                key={item.id}
                href={`/watch?v=${item.id}&t=${item.progress}`}
                className="group flex flex-col bg-[#1d1d1d] hover:bg-[#252525] border border-[#2c2c2c] rounded-2xl overflow-hidden transition-all hover:scale-[1.02]"
              >
                <div className="relative aspect-video w-full bg-neutral-900">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.thumbnail}
                    alt={item.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Play size={20} className="text-white fill-current" />
                  </div>
                </div>
                <div className="p-2 flex-1 flex flex-col justify-between">
                  <h4 className="text-xs font-semibold text-neutral-200 line-clamp-1 group-hover:text-red-400">
                    {item.title}
                  </h4>
                  <p className="text-[10px] text-neutral-500 truncate mt-0.5">
                    {item.channelTitle}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Main Video Grid */}
      <section>
        {queryParam && (
          <div className="mb-4 flex items-center gap-2 text-sm text-neutral-400">
            <span>Kết quả tìm kiếm cho:</span>
            <span className="font-semibold text-white px-2.5 py-1 bg-[#1e1e1e] rounded-full border border-[#333]">
              &ldquo;{queryParam}&rdquo;
            </span>
          </div>
        )}

        {isLoading ? (
          /* Loading Skeletons with Rounded Corners */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="bg-[#141414] border border-[#222] rounded-3xl p-3 space-y-3 animate-pulse"
              >
                <div className="aspect-video w-full rounded-2xl bg-neutral-800/80" />
                <div className="flex gap-3">
                  <div className="w-9 h-9 rounded-full bg-neutral-800 flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-neutral-800 rounded-md w-4/5" />
                    <div className="h-3 bg-neutral-800/60 rounded-md w-1/2" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : videos.length === 0 ? (
          <div className="py-20 text-center flex flex-col items-center justify-center text-neutral-400 space-y-3">
            <div className="w-14 h-14 rounded-full bg-[#1c1c1c] flex items-center justify-center text-neutral-500">
              <Sparkles size={28} />
            </div>
            <p className="text-base font-semibold text-neutral-200">
              Không tìm thấy video nào phù hợp
            </p>
            <p className="text-xs text-neutral-500 max-w-sm">
              Hãy thử tìm kiếm với từ khóa khác hoặc dán link YouTube trực tiếp vào thanh tìm kiếm.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
            {videos.map((video) => (
              <VideoCard key={video.id} video={video} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-neutral-400">Đang tải YouTube Pro...</div>
      }
    >
      <HomeContent />
    </Suspense>
  );
}
