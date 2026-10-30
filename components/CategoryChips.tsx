'use client';

import React from 'react';

interface CategoryChipsProps {
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
}

const CATEGORIES = [
  'Tất cả',
  'Thịnh hành',
  'Âm nhạc',
  'Lo-Fi Thư giãn',
  'Sơn Tùng M-TP',
  'Gaming',
  'Podcasts',
  'Lập trình & Tech',
  'Tin tức 24h',
  'EDM Remix',
  'Hoạt hình',
  'Acoustic Chill',
];

export default function CategoryChips({
  selectedCategory,
  onSelectCategory,
}: CategoryChipsProps) {
  return (
    <div className="w-full overflow-x-auto no-scrollbar py-2 px-1">
      <div className="flex items-center gap-2.5 min-w-max">
        {CATEGORIES.map((cat) => {
          const isSelected = selectedCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => onSelectCategory(cat)}
              className={`px-4 py-1.5 text-xs font-medium rounded-full transition-all duration-200 whitespace-nowrap ${
                isSelected
                  ? 'bg-neutral-100 text-neutral-900 shadow-md font-semibold'
                  : 'bg-[#222222] text-neutral-300 hover:bg-[#333333] hover:text-white border border-[#2e2e2e]'
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>
    </div>
  );
}
