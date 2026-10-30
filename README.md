# YouTube Pro - Ad-Free Video Streaming & Downloader Web App

Ứng dụng web YouTube Pro hiện đại, tối ưu giao diện bo tròn phong cách cao cấp, hỗ trợ phát video hoàn toàn **không quảng cáo xen kẽ**, hỗ trợ **nghe nhạc nền / tắt màn hình (MediaSession API)** trên iOS & Android, tải **Video (1080p, 720p)** và **Âm thanh (MP3 320kbps)** qua **Vercel Serverless Functions**, tự động lưu **lịch sử xem tạm thời** trên trình duyệt (localStorage), hỗ trợ đồng bộ tùy chọn qua Supabase, và tích hợp sẵn **CI/CD GitHub Actions**.

---

## ✨ Tính Năng Nổi Bật

### 1. Giao diện Đa Nền Tảng & Thiết Kế Bo Tròn (Modern Rounded UI)
- **Tối ưu 100% thiết bị**: Tương thích mượt mà từ điện thoại (iOS Safari, Android Chrome), máy tính bảng đến máy tính để bàn (macOS, Windows, Linux).
- **Hỗ trợ Safe Area**: Chuẩn tai thỏ, Dynamic Island và thanh điều hướng dưới đáy (`pb-safe`) cho iPhone & iPad.
- **Góc cạnh bo tròn mềm mại**: Tất cả card video, modal tải xuống, thanh tìm kiếm, player và nút bấm đều được thiết kế với chuẩn bo góc sâu (`rounded-2xl`, `rounded-3xl`, `rounded-full`).
- **Giao diện YouTube Pro Dark Mode OLED**: Phông nền đen sâu huyền bí với hiệu ứng đổ bóng phát sáng đỏ cao cấp (*YouTube Glow*).

### 2. Trình Phát Video Tùy Biến & Loại Bỏ Quảng Cáo Xen Kẽ
- **Chặn quảng cáo xen kẽ**: Thưởng thức video mượt mà, không bị gián đoạn giữa chừng bởi quảng cáo phiền toái.
- **Điều khiển tốc độ phát lại đa mức**: `0.25x`, `0.5x`, `0.75x`, `1x (Chuẩn)`, `1.25x`, `1.5x`, `1.75x`, `2x` (tự động ghi nhớ thiết lập tốc độ ưa thích của bạn).
- **Chế độ nghe nền (Background Audio Mode)**: Tích hợp chuẩn **Web MediaSession API** cho phép hiển thị trình điều khiển bài hát (Tên bài hát, Kênh, Ảnh bìa, Play/Pause/Skip) ngay trên **Màn hình khóa (Lock Screen)** và Trung tâm điều khiển của iOS & Android khi khóa máy hoặc chuyển tab.
- **Tiện ích bổ sung**:
  - Tua nhanh / lùi 10 giây.
  - Chế độ lặp lại video (Loop Mode).
  - Hẹn giờ tắt nhạc thông minh (Sleep Timer: 15, 30, 45, 60 phút).
  - Chế độ rạp chiếu (Theater mode) và toàn màn hình.

### 3. Tải Video & Âm Thanh MP3 Đa Định Dạng (Vercel Serverless)
- Tích hợp trung tâm tải trực tiếp và modal tải nhanh:
  - **Video (MP4)**: `1080p (Full HD)`, `720p (HD Khuyên dùng)`, `480p (Tiêu chuẩn)`, `360p (Tiết kiệm dữ liệu)`.
  - **Audio (MP3)**: `320kbps (Chất lượng phòng thu)`, `192kbps (Chuẩn âm thanh)`, `128kbps (Nhẹ & Tiết kiệm)`.
- **Hạ tầng Serverless**: Tận dụng Route Handler của Vercel (`/api/download`) để phân giải luồng stream và chuyển tiếp tải file trực tiếp.
- Kèm liên kết máy chủ dự phòng đối tác (Cobalt, Y2Mate, Loader) đảm bảo tải thành công 100%.

### 4. Lịch Sử Xem & Thư Viện Tạm Thời (LocalStorage & Supabase)
- **Lưu lịch sử tạm thời trên trình duyệt**:
  - Tự động lưu tiến trình xem video (thời gian đã xem, phần trăm hoàn thành).
  - Mục *"Tiếp tục xem"* ngay trên trang chủ giúp bạn xem tiếp video dở dang chỉ với 1 cú chạm.
  - Quản lý danh sách lịch sử: Xem lại, xóa từng mục hoặc xóa toàn bộ lịch sử.
- **Danh sách Yêu thích / Đã lưu**: Đánh dấu video hay để mở lại nhanh chóng mà không cần đăng nhập tài khoản.
- **Hỗ trợ Supabase (Tùy chọn)**: Nếu muốn đồng bộ giữa nhiều thiết bị, chỉ cần cấu hình `NEXT_PUBLIC_SUPABASE_URL` và `NEXT_PUBLIC_SUPABASE_ANON_KEY` trong biến môi trường.

### 5. Tìm Kiếm Thông Minh & Danh Mục Phong Phú
- Gợi ý từ khóa tự động thời gian thực (`/api/suggestions`).
- Lịch sử tìm kiếm gần đây.
- Hỗ trợ dán trực tiếp link video YouTube hoặc Shorts (`https://youtu.be/...`) vào thanh tìm kiếm để phát hoặc tải ngay lập tức.
- Thanh lọc danh mục trượt mượt mà: Thịnh hành, Âm nhạc, Lo-Fi Chill, Gaming, Podcasts, Tin tức, Lập trình,...

---

## 🛠️ Cấu Trúc Dự Án

```
├── .github/
│   └── workflows/
│       └── ci.yml             # CI/CD tự động kiểm tra cú pháp và build
├── app/
│   ├── api/
│   │   ├── download/route.ts  # Serverless Function xử lý tải MP3 & MP4
│   │   ├── search/route.ts    # Serverless Function tìm kiếm & trending
│   │   ├── suggestions/route.ts# Serverless Function gợi ý từ khóa
│   │   └── video/[id]/route.ts# Serverless Function lấy chi tiết video
│   ├── downloads/page.tsx     # Trang công cụ dán link tải MP3/1080p
│   ├── history/page.tsx       # Trang lịch sử xem tạm thời (localStorage)
│   ├── saved/page.tsx         # Trang video yêu thích / đã lưu
│   ├── watch/page.tsx         # Trang xem video với Custom Player
│   ├── globals.css            # Toàn bộ hiệu ứng bo tròn, safe area, glow
│   ├── layout.tsx             # Root layout đa thiết bị & metadata
│   └── page.tsx               # Trang chủ với Video Grid & Tiếp tục xem
├── components/
│   ├── BottomNav.tsx          # Thanh điều hướng đáy di động (iOS/Android)
│   ├── CategoryChips.tsx      # Thanh danh mục bo tròn dạng pill
│   ├── DownloadModal.tsx      # Modal tải đa định dạng 1080p/720p/MP3
│   ├── Header.tsx             # Thanh đầu trang tìm kiếm + gợi ý
│   ├── Sidebar.tsx            # Menu bên máy tính/máy tính bảng
│   ├── VideoCard.tsx          # Card video bo tròn 3xl với nút tải nhanh
│   └── VideoPlayer.tsx        # Trình phát video không quảng cáo, chỉnh tốc độ, nghe nền
├── lib/
│   ├── storage.ts             # Quản lý localStorage & Supabase sync
│   └── supabase.ts            # Khởi tạo Supabase client (tùy chọn)
└── types/
    └── index.ts               # Định nghĩa TypeScript
```

---

## 🚀 Hướng Dẫn Cài Đặt & Chạy Cục Bộ

### 1. Cài đặt thư viện:
```bash
npm install
```

### 2. Chạy môi trường thử nghiệm (Development):
```bash
npm run dev
```
Mở trình duyệt tại [http://localhost:3000](http://localhost:3000).

### 3. Kiểm tra cú pháp (Lint) & Build đóng gói:
```bash
npm run lint
npm run build
```

---

## ☁️ Hướng Dẫn Deploy Lên Vercel

### Cách 1: Kết nối trực tiếp qua GitHub (Khuyên Dùng)
1. Đẩy mã nguồn lên kho lưu trữ GitHub của bạn:
   ```bash
   git remote add origin https://github.com/<tai-khoan>/<ten-repo>.git
   git branch -M main
   git push -u origin main
   ```
2. Truy cập [Vercel](https://vercel.com) -> Chọn **"Add New..."** -> **"Project"**.
3. Chọn repo vừa tạo trên GitHub -> Nhấn **Deploy**.
4. Vercel sẽ tự động phát hiện Next.js, cấu hình các API routes thành **Serverless Functions** và kích hoạt CI/CD trên mỗi lần `git push`.

### Cách 2: Deploy qua Vercel CLI
```bash
npx vercel
```

---

## 🛡️ Tích Hợp CI/CD (GitHub Actions)

Tệp cấu hình `.github/workflows/ci.yml` đã được thiết lập sẵn:
- Tự động kích hoạt khi có commit mới hoặc Pull Request vào nhánh `main` / `master`.
- Tự động kiểm tra cú pháp mã nguồn bằng `npm run lint`.
- Tự động biên dịch toàn bộ ứng dụng và kiểm tra kiểu TypeScript bằng `npm run build`.
- Đảm bảo dự án luôn ổn định và không phát sinh lỗi trước khi Vercel nhận phiên bản mới.
