'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { SavedVideoItem } from '@/types';
import { getSavedVideos, toggleSaveVideo } from '@/lib/storage';
import { Bookmark, Play, Trash2, ArrowRight } from 'lucide-react';
import VideoCard from '@/components/VideoCard';

export default function SavedPage() {
  const [savedItems, setSavedItems] = useState<SavedVideoItem[]>([]);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    setSavedItems(getSavedVideos());
  }, []);

  const handleRefresh = () => {
    setSavedItems(getSavedVideos());
  };

  if (!isClient) return null;

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between p-4 sm:p-6 bg-gradient-to-r from-[#181818] to-[#121212] border border-[#272727] rounded-3xl">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-pink-600 to-rose-500 text-white flex items-center justify-center shadow-lg shadow-pink-600/20">
            <Bookmark size={24} className="fill-current" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-white">
              Video Đã Lưu & Yêu Thích
            </h1>
            <p className="text-xs text-neutral-400 mt-0.5">
              Danh sách các bài hát & video bạn yêu thích lưu tạm trên máy
            </p>
          </div>
        </div>
      </div>

      {/* Grid or Empty */}
      {savedItems.length === 0 ? (
        <div className="py-20 text-center flex flex-col items-center justify-center p-8 bg-[#141414] border border-[#222] rounded-3xl space-y-3">
          <div className="w-16 h-16 rounded-full bg-[#1e1e1e] flex items-center justify-center text-neutral-500">
            <Bookmark size={32} />
          </div>
          <h3 className="text-base font-bold text-neutral-200">
            Chưa có video nào được lưu
          </h3>
          <p className="text-xs text-neutral-500 max-w-sm">
            Nhấp vào biểu tượng dấu trang (Bookmark) trên bất kỳ video nào để thêm vào danh sách yêu thích của bạn.
          </p>
          <Link
            href="/"
            className="mt-2 flex items-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-full text-xs font-bold transition-all shadow-lg shadow-red-600/30"
          >
            <span>Khám phá video ngay</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
          {savedItems.map((item) => (
            <VideoCard key={item.id} video={item} />
          ))}
        </div>
      )}
    </div>
  );
}
