'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import VideoPlayer from '@/components/VideoPlayer';
import VideoCard from '@/components/VideoCard';
import { VideoDetail, VideoItem } from '@/types';
import {
  Eye,
  Calendar,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Share2,
  Bookmark,
  Check,
  ThumbsUp,
  MessageSquare,
  ShieldCheck,
} from 'lucide-react';
import { isVideoSaved, toggleSaveVideo } from '@/lib/storage';

function WatchContent() {
  const searchParams = useSearchParams();
  const videoId = searchParams.get('v') || 'dQw4w9WgXcQ';
  const startTime = parseFloat(searchParams.get('t') || '0');

  const [videoDetail, setVideoDetail] = useState<VideoDetail | null>(null);
  const [relatedVideos, setRelatedVideos] = useState<VideoItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDescExpanded, setIsDescExpanded] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isLiked, setIsLiked] = useState(false);

  // Fetch video detail
  useEffect(() => {
    setIsLoading(true);
    fetch(`/api/video/${videoId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.video) {
          setVideoDetail(data.video);
          setIsSaved(isVideoSaved(data.video.id));
        }
      })
      .catch((err) => console.error('Failed to load video detail:', err))
      .finally(() => setIsLoading(false));

    // Fetch related videos
    fetch(`/api/search?q=nhac hot trending`)
      .then((res) => res.json())
      .then((data) => {
        const filtered = (data.items || []).filter(
          (item: VideoItem) => item.id !== videoId
        );
        setRelatedVideos(filtered);
      })
      .catch((err) => console.error('Failed to load related videos:', err));
  }, [videoId]);

  const handleToggleSave = () => {
    if (!videoDetail) return;
    const saved = toggleSaveVideo(videoDetail);
    setIsSaved(saved);
  };

  const handleToggleLike = () => {
    setIsLiked(!isLiked);
  };

  const currentVideo: VideoItem = videoDetail || {
    id: videoId,
    title: 'Đang tải video...',
    description: '',
    thumbnail: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
    channelTitle: 'YouTube Pro',
    publishedAt: '',
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 max-w-7xl mx-auto pb-12">
      {/* Left Column: Player & Video Info */}
      <div className="flex-1 min-w-0">
        {/* Custom Ad-Free Player */}
        <VideoPlayer
          video={currentVideo}
          initialTime={startTime}
          autoPlay={true}
        />

        {/* Video Info Card */}
        <div className="mt-4 p-4 sm:p-5 bg-[#141414] border border-[#242424] rounded-3xl space-y-4">
          <h1 className="text-lg sm:text-xl font-bold text-white leading-tight">
            {videoDetail?.title || 'YouTube Video'}
          </h1>

          {/* Channel info and action bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-1 border-t border-[#222222]">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-neutral-700 to-neutral-600 flex items-center justify-center font-bold text-base text-white uppercase shadow">
                {videoDetail?.channelTitle ? videoDetail.channelTitle.charAt(0) : 'Y'}
              </div>
              <div>
                <h3 className="font-semibold text-sm sm:text-base text-white">
                  {videoDetail?.channelTitle || 'YouTube Creator'}
                </h3>
                <p className="text-xs text-neutral-400">
                  {videoDetail?.subscribers || 'Kênh đối tác Pro'}
                </p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleToggleLike}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold transition-colors ${
                  isLiked
                    ? 'bg-red-600 text-white'
                    : 'bg-[#222222] hover:bg-[#2c2c2c] text-neutral-200'
                }`}
              >
                <ThumbsUp size={15} className={isLiked ? 'fill-current' : ''} />
                <span>{videoDetail?.likeCount || 'Thích'}</span>
              </button>

              <button
                onClick={handleToggleSave}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold transition-colors ${
                  isSaved
                    ? 'bg-red-600/20 text-red-400 border border-red-500/30'
                    : 'bg-[#222222] hover:bg-[#2c2c2c] text-neutral-200'
                }`}
              >
                <Bookmark size={15} className={isSaved ? 'fill-current' : ''} />
                <span>{isSaved ? 'Đã lưu' : 'Lưu lại'}</span>
              </button>
            </div>
          </div>

          {/* Description Section */}
          <div className="p-3.5 bg-[#1a1a1a] rounded-2xl border border-[#2b2b2b] text-xs sm:text-sm text-neutral-300 space-y-2">
            <div className="flex items-center gap-3 font-semibold text-neutral-200 text-xs">
              <span>{videoDetail?.viewCount || '1.2M lượt xem'}</span>
              <span>•</span>
              <span>{videoDetail?.publishedAt || 'Gần đây'}</span>
            </div>

            <p
              className={`leading-relaxed whitespace-pre-line text-neutral-300 ${
                isDescExpanded ? '' : 'line-clamp-2'
              }`}
            >
              {videoDetail?.description ||
                'Thưởng thức âm nhạc và video chất lượng cao không quảng cáo trên YouTube Pro.'}
            </p>

            <button
              onClick={() => setIsDescExpanded(!isDescExpanded)}
              className="text-xs font-bold text-neutral-400 hover:text-white flex items-center gap-1 pt-1"
            >
              <span>{isDescExpanded ? 'Thu gọn' : 'Xem thêm'}</span>
              {isDescExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
          </div>
        </div>
      </div>

      {/* Right Column: Related Videos List */}
      <div className="w-full lg:w-96 flex-shrink-0 space-y-3">
        <div className="flex items-center gap-2 px-1">
          <Sparkles size={16} className="text-red-500" />
          <h3 className="font-bold text-sm text-white">Video đề xuất tiếp theo</h3>
        </div>

        <div className="space-y-3">
          {relatedVideos.slice(0, 10).map((video) => (
            <VideoCard key={video.id} video={video} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function WatchPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-neutral-400">Đang tải player...</div>}>
      <WatchContent />
    </Suspense>
  );
}
