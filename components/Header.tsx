'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Search,
  X,
  History,
  Bookmark,
  Download,
  Menu,
  Youtube,
  Clock,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { getSearchHistory, addSearchHistory, removeSearchHistoryItem } from '@/lib/storage';

interface HeaderProps {
  onToggleSidebar?: () => void;
  onSearch?: (query: string) => void;
  initialQuery?: string;
}

export default function Header({ onToggleSidebar, onSearch, initialQuery = '' }: HeaderProps) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [isFocused, setIsFocused] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  useEffect(() => {
    setSearchHistory(getSearchHistory());
  }, []);

  // Fetch suggestions with debounce
  useEffect(() => {
    if (!query.trim()) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/suggestions?q=${encodeURIComponent(query.trim())}`);
        if (res.ok) {
          const data = await res.json();
          setSuggestions(data.suggestions || []);
        }
      } catch (e) {
        // ignore
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [query]);

  // Click outside to close suggestions dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setIsFocused(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const extractYoutubeId = (url: string): string | null => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  const handleSearchSubmit = (searchTerm?: string) => {
    const finalQuery = (searchTerm !== undefined ? searchTerm : query).trim();
    if (!finalQuery) return;

    // Check if the user pasted a direct YouTube URL
    const ytId = extractYoutubeId(finalQuery);
    if (ytId) {
      setIsFocused(false);
      setIsMobileSearchOpen(false);
      router.push(`/watch?v=${ytId}`);
      return;
    }

    // Save to search history
    const updated = addSearchHistory(finalQuery);
    setSearchHistory(updated);

    setIsFocused(false);
    setIsMobileSearchOpen(false);

    if (onSearch) {
      onSearch(finalQuery);
    } else {
      router.push(`/?q=${encodeURIComponent(finalQuery)}`);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSearchSubmit();
    } else if (e.key === 'Escape') {
      setIsFocused(false);
    }
  };

  const handleRemoveHistoryItem = (e: React.MouseEvent, item: string) => {
    e.stopPropagation();
    const updated = removeSearchHistoryItem(item);
    setSearchHistory(updated);
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-[#0F0F0F]/90 backdrop-blur-md border-b border-[#272727]/80 px-3 md:px-6 py-2.5 transition-all">
      <div className="flex items-center justify-between gap-3 max-w-7xl mx-auto">
        {/* Left: Hamburger + Logo */}
        <div className="flex items-center gap-3">
          {onToggleSidebar && (
            <button
              onClick={onToggleSidebar}
              className="p-2 text-neutral-300 hover:text-white hover:bg-neutral-800 rounded-full transition-colors hidden md:flex items-center justify-center"
              aria-label="Toggle menu"
            >
              <Menu size={20} />
            </button>
          )}

          <Link href="/" className="flex items-center gap-2 group select-none">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-red-600 to-rose-500 flex items-center justify-center text-white shadow-lg shadow-red-600/30 group-hover:scale-105 transition-transform">
              <Youtube size={22} className="fill-current text-white" />
            </div>
            <div className="flex items-center">
              <span className="font-bold text-lg tracking-tight text-white hidden sm:inline">
                YouTube
              </span>
              <span className="ml-1 px-1.5 py-0.5 text-[10px] font-black tracking-wider uppercase bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-full shadow-sm">
                PRO
              </span>
            </div>
          </Link>
        </div>

        {/* Center: Search Bar (Desktop / Tablet) */}
        <div
          ref={searchContainerRef}
          className="relative flex-1 max-w-xl mx-2 hidden sm:block"
        >
          <div className="flex items-center w-full bg-[#1e1e1e] border border-[#333333] hover:border-neutral-600 focus-within:border-red-500 focus-within:ring-1 focus-within:ring-red-500 rounded-full overflow-hidden transition-all shadow-inner">
            <div className="pl-4 pr-1 text-neutral-400">
              <Search size={18} />
            </div>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onKeyDown={handleKeyDown}
              placeholder="Tìm video, nghệ sĩ hoặc dán link YouTube..."
              className="w-full py-2 px-2 bg-transparent text-sm text-neutral-100 placeholder-neutral-500 focus:outline-none"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="p-1.5 mr-1 text-neutral-400 hover:text-white rounded-full hover:bg-neutral-700/50"
              >
                <X size={16} />
              </button>
            )}
            <button
              onClick={() => handleSearchSubmit()}
              className="bg-[#272727] hover:bg-red-600 hover:text-white text-neutral-300 px-5 py-2.5 transition-colors border-l border-[#333333] flex items-center justify-center"
            >
              <Search size={16} />
            </button>
          </div>

          {/* Suggestions & Search History Dropdown */}
          {isFocused && (suggestions.length > 0 || searchHistory.length > 0) && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-[#1b1b1b]/95 backdrop-blur-xl border border-[#333333] rounded-2xl shadow-2xl py-2 z-50 overflow-hidden animate-fade-in max-h-96 overflow-y-auto">
              {/* If no current query: Show Search History */}
              {!query.trim() && searchHistory.length > 0 && (
                <div>
                  <div className="px-4 py-1.5 text-xs font-semibold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
                    <History size={13} />
                    Lịch sử tìm kiếm
                  </div>
                  {searchHistory.map((item, index) => (
                    <div
                      key={index}
                      onClick={() => handleSearchSubmit(item)}
                      className="px-4 py-2 hover:bg-[#272727] flex items-center justify-between cursor-pointer text-sm text-neutral-200 transition-colors"
                    >
                      <div className="flex items-center gap-3 truncate">
                        <Clock size={15} className="text-neutral-500 flex-shrink-0" />
                        <span className="truncate">{item}</span>
                      </div>
                      <button
                        onClick={(e) => handleRemoveHistoryItem(e, item)}
                        className="p-1 text-neutral-500 hover:text-red-400 rounded-full hover:bg-neutral-700/40"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Suggestions */}
              {suggestions.length > 0 && (
                <div>
                  {query.trim() && (
                    <div className="px-4 py-1.5 text-xs font-semibold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
                      <TrendingUp size={13} />
                      Gợi ý tìm kiếm
                    </div>
                  )}
                  {suggestions.map((suggestion, index) => (
                    <div
                      key={index}
                      onClick={() => handleSearchSubmit(suggestion)}
                      className="px-4 py-2 hover:bg-[#272727] flex items-center justify-between cursor-pointer text-sm text-neutral-200 transition-colors"
                    >
                      <div className="flex items-center gap-3 truncate">
                        <Search size={15} className="text-neutral-500 flex-shrink-0" />
                        <span className="truncate">{suggestion}</span>
                      </div>
                      <ArrowRight size={13} className="text-neutral-600" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Action Buttons */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Mobile Search Toggle */}
          <button
            onClick={() => setIsMobileSearchOpen(true)}
            className="sm:hidden p-2 text-neutral-300 hover:text-white hover:bg-neutral-800 rounded-full transition-colors"
            aria-label="Search"
          >
            <Search size={20} />
          </button>

          <Link
            href="/downloads"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-neutral-800 hover:bg-red-600 text-neutral-200 hover:text-white rounded-full transition-colors border border-neutral-700/60"
          >
            <Download size={14} />
            <span className="hidden md:inline">Tải Video / MP3</span>
          </Link>

          <Link
            href="/saved"
            className="p-2 text-neutral-300 hover:text-white hover:bg-neutral-800 rounded-full transition-colors"
            title="Đã lưu & Yêu thích"
          >
            <Bookmark size={18} />
          </Link>

          <Link
            href="/history"
            className="p-2 text-neutral-300 hover:text-white hover:bg-neutral-800 rounded-full transition-colors"
            title="Lịch sử xem tạm thời"
          >
            <History size={18} />
          </Link>
        </div>
      </div>

      {/* Mobile Search Overlay Fullscreen Drawer */}
      {isMobileSearchOpen && (
        <div className="fixed inset-0 z-50 bg-[#0F0F0F] p-4 flex flex-col sm:hidden animate-fade-in">
          <div className="flex items-center gap-2">
            <div className="flex-1 flex items-center bg-[#1e1e1e] border border-[#333] rounded-full px-3 py-1.5">
              <Search size={18} className="text-neutral-400 mr-2" />
              <input
                autoFocus
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Tìm hoặc dán link YouTube..."
                className="w-full bg-transparent text-sm text-neutral-100 placeholder-neutral-500 focus:outline-none"
              />
              {query && (
                <button
                  onClick={() => setQuery('')}
                  className="p-1 text-neutral-400 hover:text-white"
                >
                  <X size={16} />
                </button>
              )}
            </div>
            <button
              onClick={() => setIsMobileSearchOpen(false)}
              className="px-3 py-1.5 text-sm text-neutral-300 font-medium"
            >
              Hủy
            </button>
          </div>

          {/* Mobile Suggestions list */}
          <div className="mt-4 flex-1 overflow-y-auto">
            {suggestions.map((item, idx) => (
              <div
                key={idx}
                onClick={() => handleSearchSubmit(item)}
                className="py-3 px-2 border-b border-[#222] flex items-center justify-between text-neutral-200 active:bg-neutral-800"
              >
                <div className="flex items-center gap-3">
                  <Search size={16} className="text-neutral-500" />
                  <span className="text-sm">{item}</span>
                </div>
                <ArrowRight size={14} className="text-neutral-600" />
              </div>
            ))}
            {!query && searchHistory.map((item, idx) => (
              <div
                key={idx}
                onClick={() => handleSearchSubmit(item)}
                className="py-3 px-2 border-b border-[#222] flex items-center justify-between text-neutral-200 active:bg-neutral-800"
              >
                <div className="flex items-center gap-3">
                  <Clock size={16} className="text-neutral-500" />
                  <span className="text-sm">{item}</span>
                </div>
                <ArrowRight size={14} className="text-neutral-600" />
              </div>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
