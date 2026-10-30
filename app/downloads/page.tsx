'use client';

import React, { useState } from 'react';
import {
  DownloadCloud,
  Link as LinkIcon,
  Search,
  Sparkles,
  Music,
  Video,
  Check,
  Copy,
  ExternalLink,
  Loader2,
  ShieldCheck,
  FileCheck,
} from 'lucide-react';
import { DownloadOption } from '@/types';

export default function DownloadsPage() {
  const [inputUrl, setInputUrl] = useState('');
  const [resolvedId, setResolvedId] = useState<string | null>(null);
  const [videoTitle, setVideoTitle] = useState('');
  const [thumbnail, setThumbnail] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [options, setOptions] = useState<DownloadOption[]>([]);
  const [mirrors, setMirrors] = useState<any[]>([]);
  const [activeFormat, setActiveFormat] = useState<'video' | 'audio'>('video');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  const extractYoutubeId = (url: string): string | null => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=|shorts\/)([^#&?]*).*/;
    const match = url.trim().match(regExp);
    if (match && match[2].length === 11) return match[2];
    if (url.trim().length === 11) return url.trim(); // User pasted raw ID
    return null;
  };

  const handleAnalyze = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMsg('');

    const id = extractYoutubeId(inputUrl);
    if (!id) {
      setErrorMsg('Vui lòng dán liên kết YouTube hoặc Shorts hợp lệ (VD: https://youtu.be/...)');
      return;
    }

    setIsAnalyzing(true);
    setResolvedId(id);
    setThumbnail(`https://i.ytimg.com/vi/${id}/hqdefault.jpg`);

    try {
      // 1. Fetch title
      const videoRes = await fetch(`/api/video/${id}`);
      if (videoRes.ok) {
        const vData = await videoRes.json();
        if (vData.video?.title) {
          setVideoTitle(vData.video.title);
          if (vData.video.thumbnail) {
            setThumbnail(vData.video.thumbnail);
          }
        }
      }

      // 2. Fetch download options
      const dlRes = await fetch(`/api/download?id=${id}&action=options`);
      if (dlRes.ok) {
        const dlData = await dlRes.json();
        setOptions(dlData.options || []);
        setMirrors(dlData.mirrors || []);
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('Không thể lấy thông tin tải. Vui lòng kiểm tra lại liên kết.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleDownload = (option: DownloadOption) => {
    setDownloadingId(option.id);
    const link = document.createElement('a');
    link.href = option.downloadUrl || `/api/download?id=${resolvedId}&format=${option.format}&quality=${option.quality}&action=redirect`;
    link.target = '_blank';
    link.download = `${(videoTitle || 'youtube_pro').slice(0, 40)}.${option.format}`;
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

  const videoOptions = options.filter((o) => o.format === 'mp4');
  const audioOptions = options.filter((o) => o.format === 'mp3');

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      {/* Hero Banner */}
      <div className="text-center space-y-3 pt-4 sm:pt-6">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-600/15 border border-red-500/30 text-red-400 text-xs font-semibold shadow-sm">
          <Sparkles size={14} />
          <span>Vercel Serverless Stream Engine</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
          Tải Video & Âm Thanh MP3 YouTube Miễn Phí
        </h1>
        <p className="text-xs sm:text-sm text-neutral-400 max-w-xl mx-auto">
          Tải video chất lượng cao 1080p, 720p hoặc tách file âm thanh MP3 320kbps siêu nét không dính quảng cáo với máy chủ serverless tốc độ cao.
        </p>
      </div>

      {/* URL Input Form */}
      <form
        onSubmit={handleAnalyze}
        className="p-2 sm:p-3 bg-[#171717] border border-[#2a2a2a] rounded-3xl sm:rounded-full shadow-2xl flex flex-col sm:flex-row items-center gap-2"
      >
        <div className="flex items-center flex-1 w-full px-4 text-neutral-400">
          <LinkIcon size={20} className="mr-3 text-red-500 flex-shrink-0" />
          <input
            type="text"
            value={inputUrl}
            onChange={(e) => setInputUrl(e.target.value)}
            placeholder="Dán liên kết YouTube hoặc Shorts vào đây (VD: https://youtu.be/...)"
            className="w-full py-2.5 bg-transparent text-sm text-white placeholder-neutral-500 focus:outline-none"
          />
        </div>
        <button
          type="submit"
          disabled={isAnalyzing || !inputUrl.trim()}
          className="w-full sm:w-auto px-7 py-3 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white text-sm font-bold rounded-2xl sm:rounded-full shadow-lg shadow-red-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {isAnalyzing ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              <span>Đang phân tích...</span>
            </>
          ) : (
            <>
              <DownloadCloud size={18} />
              <span>Phân Tích Link</span>
            </>
          )}
        </button>
      </form>

      {errorMsg && (
        <div className="p-3 bg-red-950/40 border border-red-800/60 rounded-2xl text-xs text-red-300 text-center animate-fade-in">
          {errorMsg}
        </div>
      )}

      {/* Resolved Results Card */}
      {resolvedId && (
        <div className="p-5 sm:p-7 bg-[#151515] border border-[#282828] rounded-3xl shadow-2xl space-y-6 animate-fade-in">
          {/* Video Preview */}
          <div className="flex flex-col sm:flex-row gap-4 sm:items-center">
            <div className="relative aspect-video w-full sm:w-48 rounded-2xl overflow-hidden bg-neutral-900 flex-shrink-0 shadow-md">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={thumbnail}
                alt={videoTitle || 'Thumbnail'}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-[11px] font-bold px-2 py-0.5 bg-red-600/20 text-red-400 rounded-md">
                Đã sẵn sàng tải xuống
              </span>
              <h3 className="text-base sm:text-lg font-bold text-white mt-1.5 line-clamp-2">
                {videoTitle || 'Video YouTube'}
              </h3>
              <p className="text-xs text-neutral-400 mt-1">
                ID Video: <span className="text-neutral-300 font-mono">{resolvedId}</span>
              </p>
            </div>
          </div>

          {/* Format Selector Tabs */}
          <div className="flex items-center gap-3 border-b border-[#242424] pb-3">
            <button
              onClick={() => setActiveFormat('video')}
              className={`flex items-center gap-2 px-5 py-2 text-xs sm:text-sm font-bold rounded-full transition-all ${
                activeFormat === 'video'
                  ? 'bg-red-600 text-white shadow-md shadow-red-600/30'
                  : 'bg-[#202020] text-neutral-400 hover:text-white'
              }`}
            >
              <Video size={16} />
              <span>Video (MP4)</span>
            </button>
            <button
              onClick={() => setActiveFormat('audio')}
              className={`flex items-center gap-2 px-5 py-2 text-xs sm:text-sm font-bold rounded-full transition-all ${
                activeFormat === 'audio'
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-600/30'
                  : 'bg-[#202020] text-neutral-400 hover:text-white'
              }`}
            >
              <Music size={16} />
              <span>Âm thanh (MP3)</span>
            </button>
          </div>

          {/* Download Options List */}
          <div className="space-y-3">
            {activeFormat === 'video' ? (
              videoOptions.map((opt) => (
                <div
                  key={opt.id}
                  className="p-4 bg-[#1e1e1e] hover:bg-[#252525] border border-[#2c2c2c] rounded-2xl flex items-center justify-between gap-3 transition-colors"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-sm text-white">{opt.label}</h4>
                      {opt.quality === '1080p' && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 bg-red-600/25 text-red-400 rounded border border-red-500/30">
                          1080p Full HD
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-neutral-400 mt-0.5 flex items-center gap-2">
                      <span>Độ phân giải: {opt.resolution}</span>
                      <span>•</span>
                      <span>Dung lượng: {opt.sizeEstimate}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleCopyLink(opt.downloadUrl || '', opt.id)}
                      className="p-2 text-neutral-400 hover:text-white rounded-xl hover:bg-neutral-700/50"
                      title="Sao chép link tải"
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
                      className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white text-xs font-bold rounded-xl shadow transition-all active:scale-95"
                    >
                      {downloadingId === opt.id ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        <DownloadCloud size={14} />
                      )}
                      <span>Tải về</span>
                    </button>
                  </div>
                </div>
              ))
            ) : (
              audioOptions.map((opt) => (
                <div
                  key={opt.id}
                  className="p-4 bg-[#1e1e1e] hover:bg-[#252525] border border-[#2c2c2c] rounded-2xl flex items-center justify-between gap-3 transition-colors"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-sm text-white">{opt.label}</h4>
                      {opt.quality === '320kbps' && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 bg-purple-600/25 text-purple-400 rounded border border-purple-500/30">
                          HQ 320k
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-neutral-400 mt-0.5 flex items-center gap-2">
                      <span>Định dạng MP3 âm thanh</span>
                      <span>•</span>
                      <span>Dung lượng: {opt.sizeEstimate}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleCopyLink(opt.downloadUrl || '', opt.id)}
                      className="p-2 text-neutral-400 hover:text-white rounded-xl hover:bg-neutral-700/50"
                      title="Sao chép link tải"
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
                      className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold rounded-xl shadow transition-all active:scale-95"
                    >
                      {downloadingId === opt.id ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        <DownloadCloud size={14} />
                      )}
                      <span>Tải MP3</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Backup mirrors section */}
          {mirrors.length > 0 && (
            <div className="pt-4 border-t border-[#262626]">
              <h5 className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2">
                Máy chủ tải dự phòng (Dành cho kết nối quốc tế hoặc video giới hạn tuổi)
              </h5>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {mirrors.map((m, i) => (
                  <a
                    key={i}
                    href={m.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 bg-[#1a1a1a] hover:bg-[#222] border border-[#2b2b2b] rounded-2xl flex items-center justify-between text-xs text-neutral-300 hover:text-white transition-colors"
                  >
                    <span>{m.name}</span>
                    <ExternalLink size={14} className="text-neutral-500" />
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Feature Guarantee Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
        <div className="p-4 bg-[#141414] border border-[#222] rounded-3xl space-y-2">
          <div className="w-10 h-10 rounded-2xl bg-red-600/15 text-red-500 flex items-center justify-center">
            <ShieldCheck size={20} />
          </div>
          <h4 className="font-bold text-sm text-white">An Toàn 100%</h4>
          <p className="text-xs text-neutral-400 leading-relaxed">
            Không popup, không chuyển hướng độc hại, không yêu cầu cài đặt tiện ích mở rộng rủi ro.
          </p>
        </div>

        <div className="p-4 bg-[#141414] border border-[#222] rounded-3xl space-y-2">
          <div className="w-10 h-10 rounded-2xl bg-purple-600/15 text-purple-400 flex items-center justify-center">
            <Music size={20} />
          </div>
          <h4 className="font-bold text-sm text-white">Âm Thanh 320kbps</h4>
          <p className="text-xs text-neutral-400 leading-relaxed">
            Chuyển đổi âm thanh trực tiếp giữ nguyên chất âm gốc chất lượng cao cho tai nghe và dàn loa.
          </p>
        </div>

        <div className="p-4 bg-[#141414] border border-[#222] rounded-3xl space-y-2">
          <div className="w-10 h-10 rounded-2xl bg-emerald-600/15 text-emerald-400 flex items-center justify-center">
            <FileCheck size={20} />
          </div>
          <h4 className="font-bold text-sm text-white">Đa Nền Tảng</h4>
          <p className="text-xs text-neutral-400 leading-relaxed">
            Hỗ trợ toàn bộ trình duyệt trên iPhone (Safari), iPad, Android, Mac, Windows và Linux.
          </p>
        </div>
      </div>
    </div>
  );
}
