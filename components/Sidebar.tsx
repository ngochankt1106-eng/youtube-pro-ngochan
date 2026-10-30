'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  Flame,
  Bookmark,
  History,
  DownloadCloud,
  Headphones,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose?: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();

  const navItems = [
    { label: 'Trang chủ', href: '/', icon: Home },
    { label: 'Thịnh hành', href: '/?category=Trending', icon: Flame },
    { label: 'Yêu thích & Lưu', href: '/saved', icon: Bookmark },
    { label: 'Lịch sử xem', href: '/history', icon: History },
    { label: 'Tải Video / MP3', href: '/downloads', icon: DownloadCloud },
  ];

  return (
    <>
      {/* Backdrop for mobile / tablet drawer */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm md:hidden transition-opacity"
        />
      )}

      <aside
        className={`fixed md:sticky top-[57px] left-0 z-30 h-[calc(100vh-57px)] bg-[#0F0F0F] border-r border-[#222222] transition-all duration-300 ease-in-out flex flex-col justify-between p-3 select-none ${
          isOpen
            ? 'w-64 translate-x-0'
            : '-translate-x-full md:translate-x-0 md:w-20'
        }`}
      >
        <div className="flex flex-col gap-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === '/'
                ? pathname === '/'
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.label}
                href={item.href}
                onClick={onClose}
                className={`flex items-center gap-4 px-3.5 py-3 rounded-2xl font-medium transition-all group ${
                  isActive
                    ? 'bg-red-600/15 text-red-500 font-semibold'
                    : 'text-neutral-400 hover:text-white hover:bg-neutral-900/80'
                }`}
                title={item.label}
              >
                <Icon
                  size={22}
                  className={`flex-shrink-0 transition-transform group-hover:scale-110 ${
                    isActive ? 'text-red-500' : 'text-neutral-400 group-hover:text-white'
                  }`}
                />
                <span
                  className={`text-sm truncate transition-opacity duration-200 ${
                    isOpen ? 'opacity-100' : 'md:hidden opacity-0'
                  }`}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>

        {/* Pro Banner in sidebar (when expanded) */}
        {isOpen && (
          <div className="mt-auto p-4 rounded-3xl bg-gradient-to-br from-[#1a1a1a] to-[#121212] border border-[#2c2c2c] shadow-lg">
            <div className="flex items-center gap-2 text-red-500 text-xs font-bold uppercase tracking-wider mb-1.5">
              <Sparkles size={14} />
              <span>Tính năng PRO</span>
            </div>
            <p className="text-xs text-neutral-300 leading-relaxed">
              • Chặn 100% quảng cáo xen kẽ<br />
              • Chế độ nghe nền màn hình khóa<br />
              • Tải MP3 320k & MP4 1080p<br />
              • Lưu lịch sử tạm trên trình duyệt
            </p>
            <div className="mt-3 flex items-center gap-1.5 text-[11px] text-neutral-400">
              <ShieldCheck size={14} className="text-emerald-400" />
              <span>Bảo mật & Không cần đăng nhập</span>
            </div>
          </div>
        )}
      </aside>
    </>
  );
}
