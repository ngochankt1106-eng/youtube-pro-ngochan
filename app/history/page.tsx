'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { WatchHistoryItem } from '@/types';
import {
  getWatchHistory,
  removeFromWatchHistory,
  clearWatchHistory,
} from '@/lib/storage';
import { History, Trash2, Play, Clock, X, ArrowRight } from 'lucide-react';

export default function HistoryPage() {
  const [historyItems, setHistoryItems] = useState<WatchHistoryItem[]>([]);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    setHistoryItems(getWatchHistory());
  }, []);

  const handleRemove = (id: string) => {
    const updated = removeFromWatchHistory(id);
    setHistoryItems(updated);
  };

  const handleClearAll = () => {
    if (window.confirm('Bạn có chắc chắn muốn xóa toàn bộ lịch sử xem tạm thời?')) {
      clearWatchHistory();
      setHistoryItems([]);
    }
  };

  const formatWatchedTime = (timestamp: number) => {
    const diff = Date.now() - timestamp;
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return 'Vừa xem xong';
    if (minutes < 60) return `${minutes} phút trước`;
    if (hours < 24) return `${hours} giờ trước`;
    return `${days} ngày trước`;
  };

  if (!isClient) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between p-4 sm:p-6 bg-gradient-to-r from-[#181818] to-[#121212] border border-[#272727] rounded-3xl">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-red-600/15 text-red-500 flex items-center justify-center">
            <History size={26} />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-white">
              Lịch sử xem tạm thời
            </h1>
            <p className="text-xs text-neutral-400 mt-0.5">
              Lưu trực tiếp trên trình duyệt thiết bị • An toàn & Không theo dõi
            </p>
          </div>
        </div>

        {historyItems.length > 0 && (
          <button
            onClick={handleClearAll}
            className="flex items-center gap-1.5 px-4 py-2 bg-neutral-800 hover:bg-red-600/20 text-neutral-300 hover:text-red-400 rounded-full text-xs font-semibold border border-neutral-700/60 transition-colors"
          >
            <Trash2 size={14} />
            <span className="hidden sm:inline">Xóa tất cả</span>
          </button>
        )}
      </div>

      {/* History List */}
      {historyItems.length === 0 ? (
        <div className="py-20 text-center flex flex-col items-center justify-center p-8 bg-[#141414] border border-[#222] rounded-3xl space-y-3">
          <div className="w-16 h-16 rounded-full bg-[#1e1e1e] flex items-center justify-center text-neutral-500">
            <Clock size={32} />
          </div>
          <h3 className="text-base font-bold text-neutral-200">
            Chưa có lịch sử xem nào
          </h3>
          <p className="text-xs text-neutral-500 max-w-sm">
            Các video bạn xem sẽ được tự động lưu tạm tại đây để bạn có thể tiếp tục xem lại bất kỳ lúc nào.
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
        <div className="space-y-3">
          {historyItems.map((item) => (
            <div
              key={item.id}
              className="group flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-3 bg-[#151515] hover:bg-[#1c1c1c] border border-[#242424] hover:border-[#383838] rounded-3xl transition-all"
            >
              <div className="flex items-center gap-3.5 flex-1 min-w-0 w-full sm:w-auto">
                {/* Thumbnail */}
                <Link
                  href={`/watch?v=${item.id}&t=${item.progress}`}
                  className="relative aspect-video w-32 sm:w-40 rounded-2xl overflow-hidden bg-neutral-900 flex-shrink-0 block"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.thumbnail}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Play size={22} className="text-white fill-current" />
                  </div>
                  {item.duration && (
                    <div className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 text-[10px] font-bold text-white bg-black/80 rounded-md">
                      {item.duration}
                    </div>
                  )}
                </Link>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <Link
                    href={`/watch?v=${item.id}&t=${item.progress}`}
                    className="text-sm font-semibold text-white hover:text-red-400 line-clamp-2 transition-colors"
                  >
                    {item.title}
                  </Link>
                  <p className="text-xs text-neutral-400 mt-0.5 truncate">
                    {item.channelTitle}
                  </p>
                  <div className="flex items-center gap-2 text-[11px] text-neutral-500 mt-1">
                    <span>{formatWatchedTime(item.watchedAt)}</span>
                    {item.progress > 0 && (
                      <>
                        <span>•</span>
                        <span className="text-red-400">
                          Đã xem đến {Math.floor(item.progress / 60)}:
                          {(item.progress % 60).toString().padStart(2, '0')}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 self-end sm:self-center">
                <Link
                  href={`/watch?v=${item.id}&t=${item.progress}`}
                  className="flex items-center gap-1.5 px-4 py-2 bg-red-600/10 hover:bg-red-600 text-red-500 hover:text-white rounded-full text-xs font-semibold transition-all"
                >
                  <Play size={13} className="fill-current" />
                  <span>Xem tiếp</span>
                </Link>

                <button
                  onClick={() => handleRemove(item.id)}
                  className="p-2 text-neutral-400 hover:text-red-400 hover:bg-[#252525] rounded-full transition-colors"
                  title="Xóa khỏi lịch sử"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
