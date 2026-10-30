'use client';

import React, { useState, useEffect } from 'react';
import {
  Download,
  X,
  Music,
  Video,
  ExternalLink,
  Copy,
  Check,
  Sparkles,
  Loader2,
  Server,
  ShieldCheck,
} from 'lucide-react';
import { DownloadOption } from '@/types';

interface DownloadModalProps {
  videoId: string;
  videoTitle?: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function DownloadModal({
  videoId,
  videoTitle = 'Video YouTube',
  isOpen,
  onClose,
}: DownloadModalProps) {
  const [activeTab, setActiveTab] = useState<'video' | 'audio' | 'mirrors'>('video');
  const [options, setOptions] = useState<DownloadOption[]>([]);
  const [mirrors, setMirrors] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !videoId) return;

    setIsLoading(true);
    fetch(`/api/download?id=${videoId}&action=options`)
      .then((res) => res.json())
      .then((data) => {
        setOptions(data.options || []);
        setMirrors(data.mirrors || []);
      })
      .catch((err) => console.error('Failed to load download options:', err))
      .finally(() => setIsLoading(false));
  }, [isOpen, videoId]);

  if (!isOpen) return null;

  const videoOptions = options.filter((o) => o.format === 'mp4');
  const audioOptions = options.filter((o) => o.format === 'mp3');

  const handleDownload = (option: DownloadOption) => {
    setDownloadingId(option.id);
    const link = document.createElement('a');
    link.href = option.downloadUrl || `/api/download?id=${videoId}&format=${option.format}&quality=${option.quality}&action=redirect`;
    link.target = '_blank';
    link.download = `${videoTitle.slice(0, 40)}.${option.format}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setTimeout(() => {
      setDownloadingId(null);
    }, 2000);
  };

  const handleCopyLink = (url: string, id: string) => {
    const fullUrl = url.startsWith('http') ? url : `${window.location.origin}${url}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg bg-[#181818] border border-[#2e2e2e] rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#282828] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-red-600 to-rose-500 text-white flex items-center justify-center shadow-md shadow-red-600/30">
              <Download size={18} />
            </div>
            <div>
              <h3 className="text-base font-bold text-white leading-tight">
                Tải Video & Âm thanh MP3
              </h3>
              <p className="text-xs text-neutral-400 truncate max-w-[280px] sm:max-w-[340px]">
                {videoTitle}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-neutral-400 hover:text-white rounded-full hover:bg-neutral-800 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex items-center px-5 pt-3 gap-2 bg-[#141414] border-b border-[#242424]">
          <button
            onClick={() => setActiveTab('video')}
            className={`flex items-center gap-2 pb-3 px-3 text-xs sm:text-sm font-semibold border-b-2 transition-colors ${
              activeTab === 'video'
                ? 'border-red-500 text-red-500'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Video size={16} />
            <span>Video (MP4)</span>
          </button>
          <button
            onClick={() => setActiveTab('audio')}
            className={`flex items-center gap-2 pb-3 px-3 text-xs sm:text-sm font-semibold border-b-2 transition-colors ${
              activeTab === 'audio'
                ? 'border-red-500 text-red-500'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Music size={16} />
            <span>Âm thanh (MP3)</span>
          </button>
          <button
            onClick={() => setActiveTab('mirrors')}
            className={`flex items-center gap-2 pb-3 px-3 text-xs sm:text-sm font-semibold border-b-2 transition-colors ${
              activeTab === 'mirrors'
                ? 'border-red-500 text-red-500'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Server size={16} />
            <span>Máy chủ dự phòng</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-3 flex-1">
          {isLoading ? (
            <div className="py-12 flex flex-col items-center justify-center text-neutral-400 gap-3">
              <Loader2 className="animate-spin text-red-500" size={32} />
              <p className="text-sm">Đang phân tích các luồng tải chất lượng cao...</p>
            </div>
          ) : (
            <>
              {activeTab === 'video' && (
                <div className="space-y-2.5">
                  {videoOptions.map((opt) => (
                    <div
                      key={opt.id}
                      className="p-3.5 bg-[#202020] hover:bg-[#262626] border border-[#2f2f2f] rounded-2xl flex items-center justify-between gap-3 transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm text-white">
                            {opt.label}
                          </span>
                          {opt.quality === '1080p' && (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 bg-red-600/30 text-red-400 rounded-md border border-red-500/30">
                              Full HD
                            </span>
                          )}
                          {opt.quality === '720p' && (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 bg-emerald-600/20 text-emerald-400 rounded-md border border-emerald-500/30">
                              Khuyên dùng
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-neutral-400 mt-0.5 flex items-center gap-3">
                          <span>{opt.resolution}</span>
                          <span>•</span>
                          <span>{opt.sizeEstimate}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleCopyLink(opt.downloadUrl || '', opt.id)}
                          className="p-2 text-neutral-400 hover:text-white rounded-xl hover:bg-neutral-700/50 transition-colors"
                          title="Sao chép liên kết"
                        >
                          {copiedId === opt.id ? (
                            <Check size={16} className="text-emerald-400" />
                          ) : (
                            <Copy size={16} />
                          )}
                        </button>
                        <button
                          onClick={() => handleDownload(opt)}
                          disabled={downloadingId === opt.id}
                          className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white text-xs font-semibold rounded-xl shadow-md transition-all active:scale-95 disabled:opacity-50"
                        >
                          {downloadingId === opt.id ? (
                            <Loader2 size={14} className="animate-spin" />
                          ) : (
                            <Download size={14} />
                          )}
                          <span>Tải</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'audio' && (
                <div className="space-y-2.5">
                  {audioOptions.map((opt) => (
                    <div
                      key={opt.id}
                      className="p-3.5 bg-[#202020] hover:bg-[#262626] border border-[#2f2f2f] rounded-2xl flex items-center justify-between gap-3 transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm text-white">
                            {opt.label}
                          </span>
                          {opt.quality === '320kbps' && (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 bg-purple-600/30 text-purple-400 rounded-md border border-purple-500/30">
                              HQ 320k
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-neutral-400 mt-0.5 flex items-center gap-3">
                          <span>Định dạng MP3 âm thanh</span>
                          <span>•</span>
                          <span>{opt.sizeEstimate}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleCopyLink(opt.downloadUrl || '', opt.id)}
                          className="p-2 text-neutral-400 hover:text-white rounded-xl hover:bg-neutral-700/50 transition-colors"
                          title="Sao chép liên kết"
                        >
                          {copiedId === opt.id ? (
                            <Check size={16} className="text-emerald-400" />
                          ) : (
                            <Copy size={16} />
                          )}
                        </button>
                        <button
                          onClick={() => handleDownload(opt)}
                          disabled={downloadingId === opt.id}
                          className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-semibold rounded-xl shadow-md transition-all active:scale-95 disabled:opacity-50"
                        >
                          {downloadingId === opt.id ? (
                            <Loader2 size={14} className="animate-spin" />
                          ) : (
                            <Download size={14} />
                          )}
                          <span>Tải MP3</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'mirrors' && (
                <div className="space-y-2.5">
                  <p className="text-xs text-neutral-400 mb-2">
                    Nếu máy chủ Vercel quá tải, bạn có thể sử dụng trực tiếp các máy chủ dự phòng đối tác với tốc độ tải không giới hạn:
                  </p>
                  {mirrors.map((m, idx) => (
                    <a
                      key={idx}
                      href={m.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-3.5 bg-[#202020] hover:bg-[#282828] border border-[#2f2f2f] rounded-2xl flex items-center justify-between gap-3 transition-colors group block"
                    >
                      <div>
                        <div className="font-semibold text-sm text-white group-hover:text-red-400 transition-colors flex items-center gap-1.5">
                          <span>{m.name}</span>
                          <ExternalLink size={13} className="text-neutral-500" />
                        </div>
                        <p className="text-xs text-neutral-400 mt-0.5">{m.note}</p>
                      </div>
                      <span className="text-xs px-3 py-1.5 bg-[#2b2b2b] group-hover:bg-red-600 text-neutral-200 group-hover:text-white rounded-xl transition-colors font-medium">
                        Mở
                      </span>
                    </a>
                  ))}
                </div>
              )}
            </>
          )}

          {/* Safety badge */}
          <div className="pt-2 flex items-center justify-center gap-1.5 text-[11px] text-neutral-500">
            <ShieldCheck size={13} className="text-emerald-500" />
            <span>Tệp an toàn 100%, không chứa mã độc hoặc popup quảng cáo</span>
          </div>
        </div>
      </div>
    </div>
  );
}
