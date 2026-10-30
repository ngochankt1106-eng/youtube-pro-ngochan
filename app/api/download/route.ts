import { NextRequest, NextResponse } from 'next/server';
import { DownloadOption } from '@/types';

// Invidious streaming instances
const STREAM_INSTANCES = [
  'https://inv.tux.pizza',
  'https://invidious.nerdvpn.de',
  'https://vid.puffyan.us',
  'https://yt.artemislena.eu',
];

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  const format = searchParams.get('format') || 'mp4';
  const quality = searchParams.get('quality') || '720p';
  const action = searchParams.get('action') || 'options';

  if (!id) {
    return NextResponse.json({ error: 'Missing video ID' }, { status: 400 });
  }

  // 1. Fetch available download options list
  if (action === 'options') {
    const options: DownloadOption[] = [
      {
        id: 'mp4-1080',
        label: 'Video 1080p (Full HD)',
        format: 'mp4',
        quality: '1080p',
        resolution: '1920x1080',
        sizeEstimate: '~85 MB - 160 MB',
        downloadUrl: `/api/download?id=${id}&format=mp4&quality=1080p&action=redirect`,
        service: 'serverless',
      },
      {
        id: 'mp4-720',
        label: 'Video 720p (HD Khuyên dùng)',
        format: 'mp4',
        quality: '720p',
        resolution: '1280x720',
        sizeEstimate: '~35 MB - 60 MB',
        downloadUrl: `/api/download?id=${id}&format=mp4&quality=720p&action=redirect`,
        service: 'serverless',
      },
      {
        id: 'mp4-480',
        label: 'Video 480p (Tiêu chuẩn)',
        format: 'mp4',
        quality: '480p',
        resolution: '854x480',
        sizeEstimate: '~18 MB - 30 MB',
        downloadUrl: `/api/download?id=${id}&format=mp4&quality=480p&action=redirect`,
        service: 'serverless',
      },
      {
        id: 'mp4-360',
        label: 'Video 360p (Tiết kiệm dữ liệu)',
        format: 'mp4',
        quality: '360p',
        resolution: '640x360',
        sizeEstimate: '~10 MB - 18 MB',
        downloadUrl: `/api/download?id=${id}&format=mp4&quality=360p&action=redirect`,
        service: 'serverless',
      },
      {
        id: 'mp3-320',
        label: 'Audio MP3 320kbps (Chất lượng cao)',
        format: 'mp3',
        quality: '320kbps',
        sizeEstimate: '~8 MB - 15 MB',
        downloadUrl: `/api/download?id=${id}&format=mp3&quality=320kbps&action=redirect`,
        service: 'serverless',
      },
      {
        id: 'mp3-192',
        label: 'Audio MP3 192kbps (Chuẩn âm thanh)',
        format: 'mp3',
        quality: '192kbps',
        sizeEstimate: '~5 MB - 9 MB',
        downloadUrl: `/api/download?id=${id}&format=mp3&quality=192kbps&action=redirect`,
        service: 'serverless',
      },
      {
        id: 'mp3-128',
        label: 'Audio MP3 128kbps (Nhẹ)',
        format: 'mp3',
        quality: '128kbps',
        sizeEstimate: '~3 MB - 6 MB',
        downloadUrl: `/api/download?id=${id}&format=mp3&quality=128kbps&action=redirect`,
        service: 'serverless',
      },
    ];

    // Third-party direct mirror download links (Cobalt, Y2Mate, SafeYouTube)
    const mirrors = [
      {
        name: 'Máy chủ Tải 1 (Tốc độ cao)',
        url: `https://cobalt.tools/#${encodeURIComponent(`https://www.youtube.com/watch?v=${id}`)}`,
        note: 'Hỗ trợ tải trực tiếp MP3 và Video 1080p không quảng cáo',
      },
      {
        name: 'Máy chủ Tải 2 (Y2Mate Pro)',
        url: `https://www.y2mate.com/youtube/${id}`,
        note: 'Tải nhanh MP3 320kbps & MP4 1080p/720p',
      },
      {
        name: 'Máy chủ Tải 3 (Loader.to MP3/MP4)',
        url: `https://loader.to/api/button/?url=https://www.youtube.com/watch?v=${id}&f=mp3`,
        note: 'Chuyển đổi âm thanh MP3 nhanh chóng',
      },
      {
        name: 'Máy chủ Tải 4 (SSYouTube)',
        url: `https://ssyoutube.com/en/convert?url=https://www.youtube.com/watch?v=${id}`,
        note: 'Dự phòng đa chất lượng',
      },
    ];

    return NextResponse.json({
      videoId: id,
      options,
      mirrors,
    });
  }

  // 2. Stream audio for background playback
  if (action === 'stream') {
    for (const instance of STREAM_INSTANCES) {
      try {
        const streamInfoRes = await fetch(`${instance}/api/v1/videos/${id}`);
        if (streamInfoRes.ok) {
          const videoInfo = await streamInfoRes.json();
          // Find best audio format
          const audioFormats = videoInfo.adaptiveFormats?.filter(
            (f: any) => f.type?.includes('audio') || f.container === 'm4a'
          );
          if (audioFormats && audioFormats.length > 0) {
            const bestAudio = audioFormats[0];
            return NextResponse.redirect(bestAudio.url);
          }
        }
      } catch (e) {
        // Continue to next instance
      }
    }

    // Fallback audio direct stream URL
    return NextResponse.redirect(`https://yt.artemislena.eu/latest_version?id=${id}&itag=140`);
  }

  // 3. Redirect / Download Handler
  if (action === 'redirect') {
    // Try resolving direct stream URL via Invidious instances
    for (const instance of STREAM_INSTANCES) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 3500);
        const res = await fetch(`${instance}/api/v1/videos/${id}`, {
          signal: controller.signal,
        });
        clearTimeout(timeout);

        if (res.ok) {
          const data = await res.json();
          if (format === 'mp3') {
            const audioStreams = data.adaptiveFormats?.filter((f: any) => f.type?.includes('audio'));
            if (audioStreams && audioStreams.length > 0) {
              const streamUrl = audioStreams[0].url;
              return NextResponse.redirect(streamUrl);
            }
          } else {
            // Video format
            const matchingVideo = data.formatStreams?.find((f: any) =>
              f.qualityLabel?.includes(quality.replace('p', ''))
            ) || data.formatStreams?.[0];

            if (matchingVideo?.url) {
              return NextResponse.redirect(matchingVideo.url);
            }
          }
        }
      } catch (err) {
        // Try next instance
      }
    }

    // Direct fallback download URL
    const itag = format === 'mp3' ? '140' : quality === '1080p' ? '137' : quality === '720p' ? '22' : '18';
    const fallbackUrl = `https://invidious.nerdvpn.de/latest_version?id=${id}&itag=${itag}&local=true`;
    return NextResponse.redirect(fallbackUrl);
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
}
