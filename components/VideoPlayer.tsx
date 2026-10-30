'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  RotateCw,
  Gauge,
  Headphones,
  Maximize2,
  Minimize2,
  Bookmark,
  Share2,
  Download,
  Check,
  Volume2,
  VolumeX,
  Repeat,
  Moon,
  Sparkles,
  PictureInPicture,
} from 'lucide-react';
import { VideoDetail, VideoItem } from '@/types';
import {
  addToWatchHistory,
  getStoredPlaybackSpeed,
  setStoredPlaybackSpeed,
  isVideoSaved,
  toggleSaveVideo,
} from '@/lib/storage';
import DownloadModal from './DownloadModal';

interface VideoPlayerProps {
  video: VideoDetail | VideoItem;
  initialTime?: number;
  autoPlay?: boolean;
}

const PLAYBACK_SPEEDS = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];

export default function VideoPlayer({
  video,
  initialTime = 0,
  autoPlay = true,
}: VideoPlayerProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [speed, setSpeed] = useState<number>(1);
  const [isSpeedMenuOpen, setIsSpeedMenuOpen] = useState(false);
  const [isAudioOnlyMode, setIsAudioOnlyMode] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isLooping, setIsLooping] = useState(false);
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [sleepTimerMinutes, setSleepTimerMinutes] = useState<number | null>(null);
  const [sleepTimerRemaining, setSleepTimerRemaining] = useState<number | null>(null);
  const [isSleepMenuOpen, setIsSleepMenuOpen] = useState(false);
  const [isTheaterMode, setIsTheaterMode] = useState(false);

  // Initialize saved speed and saved video status
  useEffect(() => {
    const savedSpeed = getStoredPlaybackSpeed();
    setSpeed(savedSpeed);
    setIsSaved(isVideoSaved(video.id));

    // Save to initial watch history
    addToWatchHistory(video, initialTime);
  }, [video, initialTime]);

  // Periodic watch history progress saving
  useEffect(() => {
    const interval = setInterval(() => {
      // Save current video session
      addToWatchHistory(video, 30);
    }, 15000);

    return () => clearInterval(interval);
  }, [video]);

  // Background Audio & MediaSession API (Lockscreen support on iOS & Android)
  useEffect(() => {
    if (typeof window !== 'undefined' && 'mediaSession' in navigator) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: video.title,
        artist: video.channelTitle,
        album: 'YouTube Pro',
        artwork: [
          {
            src: video.thumbnail,
            sizes: '512x512',
            type: 'image/jpeg',
          },
        ],
      });

      navigator.mediaSession.setActionHandler('play', () => {
        setIsPlaying(true);
        postIframeMessage('playVideo');
      });

      navigator.mediaSession.setActionHandler('pause', () => {
        setIsPlaying(false);
        postIframeMessage('pauseVideo');
      });

      navigator.mediaSession.setActionHandler('seekbackward', () => {
        handleSeek(-10);
      });

      navigator.mediaSession.setActionHandler('seekforward', () => {
        handleSeek(10);
      });
    }
  }, [video]);

  // Sleep timer countdown
  useEffect(() => {
    if (sleepTimerMinutes === null) {
      setSleepTimerRemaining(null);
      return;
    }

    let remainingSeconds = sleepTimerMinutes * 60;
    setSleepTimerRemaining(remainingSeconds);

    const interval = setInterval(() => {
      remainingSeconds -= 1;
      setSleepTimerRemaining(remainingSeconds);

      if (remainingSeconds <= 0) {
        clearInterval(interval);
        setSleepTimerMinutes(null);
        setSleepTimerRemaining(null);
        postIframeMessage('pauseVideo');
        setIsPlaying(false);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [sleepTimerMinutes]);

  const postIframeMessage = (command: string, args: any[] = []) => {
    if (iframeRef.current && iframeRef.current.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        JSON.stringify({
          event: 'command',
          func: command,
          args: args,
        }),
        '*'
      );
    }
  };

  const handleTogglePlay = () => {
    if (isPlaying) {
      postIframeMessage('pauseVideo');
      setIsPlaying(false);
    } else {
      postIframeMessage('playVideo');
      setIsPlaying(true);
    }
  };

  const handleSeek = (seconds: number) => {
    // Send seek message to iframe
    if (iframeRef.current && iframeRef.current.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        JSON.stringify({
          event: 'command',
          func: 'seekTo',
          args: [seconds, true],
        }),
        '*'
      );
    }
  };

  const handleSpeedChange = (newSpeed: number) => {
    setSpeed(newSpeed);
    setStoredPlaybackSpeed(newSpeed);
    postIframeMessage('setPlaybackRate', [newSpeed]);
    setIsSpeedMenuOpen(false);
  };

  const handleToggleSave = () => {
    const saved = toggleSaveVideo(video);
    setIsSaved(saved);
  };

  const handleShare = async () => {
    const currentUrl = typeof window !== 'undefined' ? window.location.href : '';
    if (navigator.share) {
      try {
        await navigator.share({
          title: video.title,
          text: `Xem "${video.title}" không quảng cáo trên YouTube Pro`,
          url: currentUrl,
        });
        return;
      } catch (e) {
        // Fallback to clipboard
      }
    }

    if (navigator.clipboard) {
      navigator.clipboard.writeText(currentUrl);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const handleToggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch((err) => {
        console.error('Fullscreen request error:', err);
      });
    } else {
      document.exitFullscreen();
    }
  };

  // Embed URL with ad-free parameters and loop support
  const embedUrl = `https://www.youtube-nocookie.com/embed/${video.id}?autoplay=${
    autoPlay ? 1 : 0
  }&start=${Math.floor(initialTime)}&enablejsapi=1&rel=0&modestbranding=1&iv_load_policy=3&playsinline=1${
    isLooping ? `&loop=1&playlist=${video.id}` : ''
  }`;

  return (
    <div
      ref={containerRef}
      className={`w-full transition-all duration-300 ${
        isTheaterMode ? 'max-w-none' : 'max-w-5xl mx-auto'
      }`}
    >
      {/* Player Screen Container */}
      <div className="relative aspect-video w-full rounded-2xl sm:rounded-3xl overflow-hidden bg-black shadow-2xl border border-[#262626] group">
        {!isAudioOnlyMode ? (
          <iframe
            ref={iframeRef}
            src={embedUrl}
            title={video.title}
            className="w-full h-full border-0 select-none"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        ) : (
          /* Background / Audio-Only Mode View */
          <div className="w-full h-full flex flex-col items-center justify-center p-6 bg-gradient-to-br from-[#1c1214] via-[#121212] to-[#0a0a0a] text-center">
            <div className="relative mb-6">
              <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-full overflow-hidden border-2 border-red-500/40 shadow-glow animate-pulse">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={video.thumbnail}
                  alt={video.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-2 right-2 p-2 bg-red-600 rounded-full text-white shadow-lg">
                <Headphones size={20} />
              </div>
            </div>

            <h3 className="text-base sm:text-lg font-bold text-white max-w-md line-clamp-1">
              {video.title}
            </h3>
            <p className="text-xs sm:text-sm text-neutral-400 mt-1">
              {video.channelTitle} • Đang phát chế độ nghe nền tiết kiệm pin
            </p>

            {/* Hidden audio element for background streaming */}
            <audio
              ref={audioRef}
              src={`/api/download?id=${video.id}&action=stream`}
              autoPlay
              loop={isLooping}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
            />

            <div className="mt-6 flex items-center gap-4">
              <button
                onClick={() => handleSeek(-10)}
                className="p-3 bg-[#242424] hover:bg-[#323232] text-neutral-200 rounded-full transition-colors"
                title="Lùi 10s"
              >
                <RotateCcw size={18} />
              </button>

              <button
                onClick={() => {
                  if (audioRef.current) {
                    if (isPlaying) {
                      audioRef.current.pause();
                    } else {
                      audioRef.current.play();
                    }
                  }
                }}
                className="w-14 h-14 bg-red-600 hover:bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg shadow-red-600/40 transition-transform active:scale-95"
              >
                {isPlaying ? <Pause size={24} /> : <Play size={24} className="ml-1" />}
              </button>

              <button
                onClick={() => handleSeek(10)}
                className="p-3 bg-[#242424] hover:bg-[#323232] text-neutral-200 rounded-full transition-colors"
                title="Tới 10s"
              >
                <RotateCw size={18} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Custom Pro Control Toolbar */}
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 p-3 bg-[#161616] border border-[#262626] rounded-2xl">
        {/* Left: Speed, Background Mode, Loop */}
        <div className="flex items-center gap-2">
          {/* Playback Speed Selector */}
          <div className="relative">
            <button
              onClick={() => setIsSpeedMenuOpen(!isSpeedMenuOpen)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#222222] hover:bg-[#2c2c2c] text-neutral-200 text-xs font-semibold rounded-full border border-neutral-700/60 transition-colors"
            >
              <Gauge size={14} className="text-red-400" />
              <span>{speed}x</span>
            </button>

            {isSpeedMenuOpen && (
              <div className="absolute top-full left-0 mt-2 z-50 bg-[#202020] border border-[#333] rounded-2xl p-1.5 shadow-2xl grid grid-cols-2 gap-1 min-w-[140px] animate-fade-in">
                {PLAYBACK_SPEEDS.map((s) => (
                  <button
                    key={s}
                    onClick={() => handleSpeedChange(s)}
                    className={`px-3 py-1.5 text-xs rounded-xl font-medium transition-colors ${
                      speed === s
                        ? 'bg-red-600 text-white font-bold'
                        : 'text-neutral-300 hover:bg-neutral-800'
                    }`}
                  >
                    {s}x
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Background Audio Mode Toggle */}
          <button
            onClick={() => setIsAudioOnlyMode(!isAudioOnlyMode)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full transition-all ${
              isAudioOnlyMode
                ? 'bg-red-600 text-white shadow-md shadow-red-600/30'
                : 'bg-[#222222] hover:bg-[#2c2c2c] text-neutral-300 border border-neutral-700/60'
            }`}
            title="Chế độ nghe nền tiết kiệm pin & khóa màn hình"
          >
            <Headphones size={14} />
            <span className="hidden sm:inline">Nghe nền</span>
          </button>

          {/* Loop Toggle */}
          <button
            onClick={() => setIsLooping(!isLooping)}
            className={`p-2 rounded-full transition-colors ${
              isLooping
                ? 'bg-red-600/20 text-red-500'
                : 'text-neutral-400 hover:text-white hover:bg-[#242424]'
            }`}
            title={isLooping ? 'Đang lặp lại video' : 'Bật lặp lại'}
          >
            <Repeat size={16} />
          </button>

          {/* Sleep Timer */}
          <div className="relative">
            <button
              onClick={() => setIsSleepMenuOpen(!isSleepMenuOpen)}
              className={`flex items-center gap-1.5 p-2 rounded-full transition-colors ${
                sleepTimerMinutes
                  ? 'bg-purple-600/20 text-purple-400 font-semibold text-xs px-3'
                  : 'text-neutral-400 hover:text-white hover:bg-[#242424]'
              }`}
              title="Hẹn giờ tắt nhạc"
            >
              <Moon size={16} />
              {sleepTimerRemaining !== null && (
                <span className="text-[11px]">
                  {Math.floor(sleepTimerRemaining / 60)}m
                </span>
              )}
            </button>

            {isSleepMenuOpen && (
              <div className="absolute top-full left-0 mt-2 z-50 bg-[#202020] border border-[#333] rounded-2xl p-2 shadow-2xl min-w-[160px] animate-fade-in space-y-1">
                <div className="text-[11px] font-semibold text-neutral-400 px-2 py-1">
                  Hẹn giờ tắt nhạc
                </div>
                {[15, 30, 45, 60].map((mins) => (
                  <button
                    key={mins}
                    onClick={() => {
                      setSleepTimerMinutes(mins);
                      setIsSleepMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-1.5 text-xs text-neutral-200 hover:bg-neutral-800 rounded-xl"
                  >
                    Sau {mins} phút
                  </button>
                ))}
                {sleepTimerMinutes !== null && (
                  <button
                    onClick={() => {
                      setSleepTimerMinutes(null);
                      setIsSleepMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-1.5 text-xs text-red-400 hover:bg-neutral-800 rounded-xl font-medium"
                  >
                    Hủy hẹn giờ
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right: Theater Mode, Fullscreen, Download, Save, Share */}
        <div className="flex items-center gap-1.5">
          {/* Download Button */}
          <button
            onClick={() => setIsDownloadModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white text-xs font-semibold rounded-full shadow-md shadow-red-600/30 transition-all active:scale-95"
          >
            <Download size={14} />
            <span>Tải MP3/Video</span>
          </button>

          {/* Bookmark / Save */}
          <button
            onClick={handleToggleSave}
            className={`p-2 rounded-full transition-colors ${
              isSaved
                ? 'bg-red-600/20 text-red-500'
                : 'text-neutral-300 hover:text-white hover:bg-[#242424]'
            }`}
            title={isSaved ? 'Đã lưu' : 'Lưu video'}
          >
            <Bookmark size={18} className={isSaved ? 'fill-current' : ''} />
          </button>

          {/* Share */}
          <button
            onClick={handleShare}
            className="p-2 text-neutral-300 hover:text-white hover:bg-[#242424] rounded-full transition-colors"
            title="Chia sẻ liên kết"
          >
            {isCopied ? (
              <Check size={18} className="text-emerald-400" />
            ) : (
              <Share2 size={18} />
            )}
          </button>

          {/* Theater Mode (Desktop) */}
          <button
            onClick={() => setIsTheaterMode(!isTheaterMode)}
            className="hidden lg:flex p-2 text-neutral-300 hover:text-white hover:bg-[#242424] rounded-full transition-colors"
            title="Chế độ rạp chiếu"
          >
            {isTheaterMode ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
          </button>
        </div>
      </div>

      {/* Download Modal */}
      <DownloadModal
        videoId={video.id}
        videoTitle={video.title}
        isOpen={isDownloadModalOpen}
        onClose={() => setIsDownloadModalOpen(false)}
      />
    </div>
  );
}
