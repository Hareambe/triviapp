import { extractYouTubeInfo } from './youtube';

export type MediaType = 'video' | 'audio' | 'image' | 'none';

/**
 * Extracts Google Drive file ID from standard sharing or viewing URLs
 */
export function extractGoogleDriveFileId(url?: string | null): string | null {
  if (!url || typeof url !== 'string') return null;

  // Patterns for Google Drive links
  // e.g. https://drive.google.com/file/d/1a2b3c.../view?usp=sharing
  const fileDMatch = url.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]{20,})/i);
  if (fileDMatch) return fileDMatch[1];

  // e.g. https://drive.google.com/open?id=1a2b3c...
  const idParamMatch = url.match(/drive\.google\.com\/(?:open|uc)\?(?:.*&)?id=([a-zA-Z0-9_-]{20,})/i);
  if (idParamMatch) return idParamMatch[1];

  // e.g. https://drive.google.com/thumbnail?id=1a2b3c...
  const thumbMatch = url.match(/drive\.google\.com\/thumbnail\?(?:.*&)?id=([a-zA-Z0-9_-]{20,})/i);
  if (thumbMatch) return thumbMatch[1];

  // e.g. https://lh3.googleusercontent.com/d/1a2b3c...
  const lh3Match = url.match(/googleusercontent\.com\/d\/([a-zA-Z0-9_-]{20,})/i);
  if (lh3Match) return lh3Match[1];

  return null;
}

/**
 * Converts Google Drive, Dropbox, Imgur, or public links into direct viewable image URLs
 */
export function getDirectImageUrl(url?: string | null): string {
  if (!url || typeof url !== 'string') return '';
  const clean = url.trim();

  // 1. Google Drive direct image URL
  const driveId = extractGoogleDriveFileId(clean);
  if (driveId) {
    // drive.google.com/thumbnail?id={id}&sz=w1600 provides reliable high-res image rendering
    return `https://drive.google.com/thumbnail?id=${driveId}&sz=w1600`;
  }

  // 2. Dropbox direct image link
  if (clean.includes('dropbox.com')) {
    const rawUrl = clean.replace('www.dropbox.com', 'dl.dropboxusercontent.com').replace(/[?&]dl=0/, '');
    return rawUrl.includes('?') ? `${rawUrl}&raw=1` : `${rawUrl}?raw=1`;
  }

  // 3. Imgur page link to direct image link (e.g. https://imgur.com/abc1234 -> https://i.imgur.com/abc1234.png)
  const imgurMatch = clean.match(/^https?:\/\/(?:www\.)?imgur\.com\/([a-zA-Z0-9]+)$/i);
  if (imgurMatch && imgurMatch[1] && !['gallery', 'a', 't'].includes(imgurMatch[1])) {
    return `https://i.imgur.com/${imgurMatch[1]}.png`;
  }

  return clean;
}

/**
 * Checks whether a given URL or string is an image.
 * Matches standard extensions, query formats, known image hosts, CDNs, and data URIs.
 */
export function isImageUrl(url?: string | null): boolean {
  if (!url || typeof url !== 'string') return false;
  const clean = url.trim().toLowerCase();

  // Not a valid URL or data string
  if (!clean.startsWith('http://') && !clean.startsWith('https://') && !clean.startsWith('data:image/')) {
    return false;
  }

  // Definitely not an image if it is a YouTube link
  if (extractYouTubeInfo(clean) !== null) {
    return false;
  }

  // Base64 Data URI
  if (clean.startsWith('data:image/')) return true;

  // Google Drive Link
  if (extractGoogleDriveFileId(clean) !== null) return true;

  // File extension anywhere in pathname (e.g. .jpg, .png, .webp, .gif, .svg, .avif, .bmp, .tiff, .jfif, .heic)
  if (/\.(jpeg|jpg|png|webp|gif|svg|avif|bmp|tiff|tif|jfif|heic|heif|ico)(?:[?#&].*)?$/i.test(clean)) {
    return true;
  }

  // Image format query parameters (e.g. ?format=jpg, ?ext=png, &fm=webp, ?f=auto)
  if (/[?&](?:format|fmt|fm|ext|auto)=([a-z0-9_]+)/i.test(clean)) {
    return true;
  }

  // Known image hosting services, CDNs, and media storage
  if (
    clean.includes('images.unsplash.com') ||
    clean.includes('upload.wikimedia.org') ||
    clean.includes('wikimedia.org') ||
    clean.includes('imgur.com') ||
    clean.includes('i.ibb.co') ||
    clean.includes('postimg.cc') ||
    clean.includes('googleusercontent.com') ||
    clean.includes('gstatic.com') ||
    clean.includes('twimg.com') ||
    clean.includes('redd.it') ||
    clean.includes('preview.redd.it') ||
    clean.includes('discordapp.com') ||
    clean.includes('discord.com/attachments') ||
    clean.includes('cloudinary.com') ||
    clean.includes('pinimg.com') ||
    clean.includes('media-amazon.com') ||
    clean.includes('freepik.com') ||
    clean.includes('pexels.com') ||
    clean.includes('pixabay.com') ||
    clean.includes('githubusercontent.com') ||
    clean.includes('giphy.com') ||
    clean.includes('tenor.com') ||
    clean.includes('dropbox.com')
  ) {
    return true;
  }

  // Path containing typical image folders / endpoints
  if (/\/(images|image|photos|photo|img|pics|pictures|thumbnails|media|assets)\//i.test(clean)) {
    return true;
  }

  return false;
}

/**
 * Detects whether media is youtube video, youtube audio, image, or none
 */
export function detectMediaType(url?: string | null, isAudioOnly?: boolean): MediaType {
  if (!url) return 'none';
  if (extractYouTubeInfo(url)) {
    return isAudioOnly ? 'audio' : 'video';
  }
  if (isImageUrl(url)) return 'image';
  return 'none';
}
