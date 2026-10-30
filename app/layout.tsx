import type { Metadata, Viewport } from 'next';
import './globals.css';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';
import ClientLayoutWrapper from '@/components/ClientLayoutWrapper';

export const metadata: Metadata = {
  title: 'YouTube Pro - Không Quảng Cáo & Tải Video MP3',
  description:
    'Xem video YouTube tùy biến không quảng cáo xen kẽ, chế độ phát nền, tải video 1080p và MP3 chất lượng cao, lưu lịch sử xem tạm thời.',
  keywords: [
    'youtube pro',
    'youtube khong quang cao',
    'tai video youtube',
    'tai mp3 youtube',
    'nghe nhac tat man hinh',
  ],
  icons: {
    icon: '/logo.png',
    apple: '/logo.png',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  viewportFit: 'cover',
  themeColor: '#0F0F0F',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" className="dark">
      <head>
        <link rel="icon" href="/logo.png" />
      </head>
      <body className="bg-[#0F0F0F] text-[#F1F1F1] min-h-screen flex flex-col selection:bg-red-600 selection:text-white">
        <ClientLayoutWrapper>{children}</ClientLayoutWrapper>
      </body>
    </html>
  );
}
