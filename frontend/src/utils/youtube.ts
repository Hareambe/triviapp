/**
 * Helper utilities for detecting, extracting, and embedding YouTube videos
 */

export interface YouTubeInfo {
  videoId: string;
  startSeconds?: number;
  embedUrl: string;
  cleanText: string;
}

/**
 * Converts a time string like "1m30s", "90s", "90", or "1h2m3s" into total seconds
 */
export function parseTimeStringToSeconds(timeStr: string): number {
  if (!timeStr) return 0;
  if (/^\d+$/.test(timeStr)) {
    return parseInt(timeStr, 10);
  }

  let totalSeconds = 0;
  const hoursMatch = timeStr.match(/(\d+)h/i);
  const minutesMatch = timeStr.match(/(\d+)m/i);
  const secondsMatch = timeStr.match(/(\d+)s/i);

  if (hoursMatch) totalSeconds += parseInt(hoursMatch[1], 10) * 3600;
  if (minutesMatch) totalSeconds += parseInt(minutesMatch[1], 10) * 60;
  if (secondsMatch) totalSeconds += parseInt(secondsMatch[1], 10);

  return totalSeconds;
}

/**
 * Extracts YouTube video ID and optional timestamp from a URL or text string
 */
export function extractYouTubeInfo(input?: string | null): YouTubeInfo | null {
  if (!input || typeof input !== 'string') return null;

  // Regex to match various YouTube URL formats
  const ytRegex =
    /(?:https?:\/\/)?(?:www\.|m\.)?(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|v\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})(?:[^\s]*)?/i;

  const match = input.match(ytRegex);
  if (!match) return null;

  const fullUrl = match[0];
  const videoId = match[1];

  // Extract timestamp if present (t=... or start=...)
  let startSeconds: number | undefined;
  const timeMatch = fullUrl.match(/[?&](?:t|start)=([a-zA-Z0-9]+)/i);
  if (timeMatch && timeMatch[1]) {
    const parsed = parseTimeStringToSeconds(timeMatch[1]);
    if (parsed > 0) {
      startSeconds = parsed;
    }
  }

  // Remove the URL from the prompt text for cleaner display if text accompanies the URL
  const cleanText = input.replace(ytRegex, '').trim();

  // Construct standard embed URL with parameters
  const params = new URLSearchParams();
  params.set('rel', '0');
  params.set('modestbranding', '1');
  params.set('enablejsapi', '1');
  if (typeof window !== 'undefined' && window.location.origin) {
    params.set('origin', window.location.origin);
  }
  if (startSeconds && startSeconds > 0) {
    params.set('start', String(startSeconds));
  }

  const embedUrl = `https://www.youtube.com/embed/${videoId}?${params.toString()}`;

  return {
    videoId,
    startSeconds,
    embedUrl,
    cleanText,
  };
}

/**
 * Extracts all valid YouTube info items from single or multiple media URLs or prompt
 */
export function extractAllYouTubeInfos(
  mediaUrls?: string[] | null,
  mediaUrl?: string | null,
  prompt?: string | null
): YouTubeInfo[] {
  const results: YouTubeInfo[] = [];

  if (Array.isArray(mediaUrls) && mediaUrls.length > 0) {
    for (const url of mediaUrls) {
      const info = extractYouTubeInfo(url);
      if (info) results.push(info);
    }
  }

  if (results.length === 0 && mediaUrl) {
    const info = extractYouTubeInfo(mediaUrl);
    if (info) results.push(info);
  }

  if (results.length === 0 && prompt) {
    const info = extractYouTubeInfo(prompt);
    if (info) results.push(info);
  }

  return results;
}

let ytApiPromise: Promise<void> | null = null;

/**
 * Reliable singleton loader for the YouTube IFrame API script
 */
export function loadYouTubeIframeAPI(): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve();
  if (window.YT && window.YT.Player) {
    return Promise.resolve();
  }

  if (ytApiPromise) {
    return ytApiPromise;
  }

  ytApiPromise = new Promise<void>((resolve) => {
    // If API loaded already
    if (window.YT && window.YT.Player) {
      resolve();
      return;
    }

    const previousCallback = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      if (previousCallback) previousCallback();
      resolve();
    };

    // Check if script tag is already in DOM
    const existingScript = document.getElementById('yt-iframe-api-script');
    if (!existingScript) {
      const tag = document.createElement('script');
      tag.id = 'yt-iframe-api-script';
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      if (firstScriptTag && firstScriptTag.parentNode) {
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
      } else {
        document.head.appendChild(tag);
      }
    }
  });

  return ytApiPromise;
}
