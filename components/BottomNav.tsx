'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Flame, Bookmark, History, DownloadCloud } from 'lucide-react';

export default function BottomNav() {
  const pathname = usePathname();

  const navItems = [
    { label: 'Trang chủ', href: '/', icon: Home },
    { label: 'Thịnh hành', href: '/?category=Trending', icon: Flame },
    { label: 'Tải xuống', href: '/downloads', icon: DownloadCloud, highlight: true },
    { label: 'Đã lưu', href: '/saved', icon: Bookmark },
    { label: 'Lịch sử', href: '/history', icon: History },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-[#121212]/95 backdrop-blur-xl border-t border-[#262626] pb-safe px-2 transition-all">
      <div className="flex items-center justify-around py-1.5 max-w-md mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.href === '/'
              ? pathname === '/'
              : pathname.startsWith(item.href);

          if (item.highlight) {
            return (
              <Link
                key={item.label}
                href={item.href}
                className="flex flex-col items-center justify-center -mt-4 group"
              >
                <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-red-600 to-rose-500 text-white flex items-center justify-center shadow-lg shadow-red-600/40 transform active:scale-95 transition-transform">
                  <Icon size={22} />
                </div>
                <span className="text-[10px] mt-1 font-medium text-neutral-300">
                  {item.label}
                </span>
              </Link>
            );
          }

          return (
            <Link
              key={item.label}
              href={item.href}
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-colors ${
                isActive
                  ? 'text-red-500 font-semibold'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <Icon
                size={20}
                className={`transition-transform ${
                  isActive ? 'scale-110 text-red-500' : 'text-neutral-400'
                }`}
              />
              <span className="text-[10px] mt-0.5 tracking-tight">
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
