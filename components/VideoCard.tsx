'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { VideoItem } from '@/types';
import { Play, Download, Bookmark, Check, MoreVertical } from 'lucide-react';
import { isVideoSaved, toggleSaveVideo } from '@/lib/storage';
import DownloadModal from './DownloadModal';

interface VideoCardProps {
  video: VideoItem;
  onPlay?: (video: VideoItem) => void;
}

export default function VideoCard({ video, onPlay }: VideoCardProps) {
  const [isSaved, setIsSaved] = useState(() => isVideoSaved(video.id));
  const [isDownloadOpen, setIsDownloadOpen] = useState(false);

  const handleToggleSave = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const saved = toggleSaveVideo(video);
    setIsSaved(saved);
  };

  const handleOpenDownload = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDownloadOpen(true);
  };

  return (
    <>
      <div className="group flex flex-col bg-[#141414] hover:bg-[#1c1c1c] border border-[#232323] hover:border-[#383838] rounded-3xl p-2.5 transition-all duration-300 hover:shadow-xl hover:shadow-black/50 hover:-translate-y-1">
        {/* Thumbnail Container */}
        <Link
          href={`/watch?v=${video.id}`}
          className="relative aspect-video w-full rounded-2xl overflow-hidden bg-neutral-900 block"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={video.thumbnail}
            alt={video.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />

          {/* Duration Badge */}
          {video.duration && (
            <div className="absolute bottom-2 right-2 px-2 py-0.5 text-[11px] font-bold text-white bg-black/85 backdrop-blur-sm rounded-lg shadow">
              {video.duration}
            </div>
          )}

          {/* Play Overlay on Hover */}
          <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <div className="w-12 h-12 rounded-full bg-red-600/90 text-white flex items-center justify-center shadow-lg shadow-red-600/40 transform scale-75 group-hover:scale-100 transition-transform">
              <Play size={22} className="ml-0.5 fill-current" />
            </div>
          </div>
        </Link>

        {/* Video Info */}
        <div className="flex gap-3 mt-3 px-1">
          {/* Channel Avatar Placeholder */}
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-neutral-700 to-neutral-600 flex-shrink-0 flex items-center justify-center text-xs font-bold text-neutral-200 uppercase">
            {video.channelTitle ? video.channelTitle.charAt(0) : 'Y'}
          </div>

          <div className="flex-1 min-w-0">
            <Link
              href={`/watch?v=${video.id}`}
              className="text-sm font-semibold text-neutral-100 hover:text-red-400 line-clamp-2 leading-snug transition-colors"
              title={video.title}
            >
              {video.title}
            </Link>

            <p className="text-xs text-neutral-400 mt-1 truncate hover:text-neutral-200">
              {video.channelTitle}
            </p>

            <div className="flex items-center gap-1.5 text-[11px] text-neutral-500 mt-0.5">
              {video.viewCount && <span>{video.viewCount}</span>}
              {video.viewCount && video.publishedAt && <span>•</span>}
              {video.publishedAt && <span>{video.publishedAt}</span>}
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-col gap-1 items-center justify-start">
            <button
              onClick={handleToggleSave}
              className={`p-1.5 rounded-full transition-colors ${
                isSaved
                  ? 'text-red-500 bg-red-500/10'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
              }`}
              title={isSaved ? 'Đã lưu' : 'Lưu video'}
            >
              <Bookmark size={16} className={isSaved ? 'fill-current' : ''} />
            </button>

            <button
              onClick={handleOpenDownload}
              className="p-1.5 text-neutral-400 hover:text-red-400 hover:bg-neutral-800 rounded-full transition-colors"
              title="Tải MP3 / Video"
            >
              <Download size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Download Modal */}
      <DownloadModal
        videoId={video.id}
        videoTitle={video.title}
        isOpen={isDownloadOpen}
        onClose={() => setIsDownloadOpen(false)}
      />
    </>
  );
}
