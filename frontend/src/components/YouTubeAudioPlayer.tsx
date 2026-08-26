import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Volume2, VolumeX, Loader2 } from 'lucide-react';
import { loadYouTubeIframeAPI } from '../utils/youtube';

interface YouTubeAudioPlayerProps {
  videoId: string;
  startSeconds?: number;
}

declare global {
  interface Window {
    YT: {
      Player: new (
        element: HTMLElement | string,
        config: {
          videoId: string;
          playerVars?: Record<string, unknown>;
          events?: {
            onReady?: (event: { target: YTPlayerInstance }) => void;
            onStateChange?: (event: { data: number; target: YTPlayerInstance }) => void;
            onError?: (event: { data: number }) => void;
          };
        }
      ) => YTPlayerInstance;
      PlayerState: {
        UNSTARTED: number;
        ENDED: number;
        PLAYING: number;
        PAUSED: number;
        BUFFERING: number;
        CUED: number;
      };
    };
    onYouTubeIframeAPIReady?: () => void;
  }
}

interface YTPlayerInstance {
  playVideo: () => void;
  pauseVideo: () => void;
  seekTo: (seconds: number, allowSeekAhead?: boolean) => void;
  getCurrentTime: () => number;
  getDuration: () => number;
  setVolume: (volume: number) => void;
  getVolume: () => number;
  mute: () => void;
  unMute: () => void;
  isMuted: () => boolean;
  destroy: () => void;
}

function formatTime(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

export const YouTubeAudioPlayer: React.FC<YouTubeAudioPlayerProps> = ({
  videoId,
  startSeconds = 0,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const playerRef = useRef<YTPlayerInstance | null>(null);

  const [isReady, setIsReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(startSeconds || 0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(100);
  const [isMuted, setIsMuted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isCancelled = false;
    let progressTimer: number | null = null;

    const setupPlayer = async () => {
      try {
        await loadYouTubeIframeAPI();
        if (isCancelled || !containerRef.current || !window.YT) return;

        // Clean up previous instance if exists
        if (playerRef.current && typeof playerRef.current.destroy === 'function') {
          try {
            playerRef.current.destroy();
          } catch {
            // ignore
          }
        }

        const origin = typeof window !== 'undefined' ? window.location.origin : '';

        new window.YT.Player(containerRef.current, {
          videoId,
          playerVars: {
            autoplay: 0,
            controls: 0,
            disablekb: 1,
            fs: 0,
            modestbranding: 1,
            playsinline: 1,
            rel: 0,
            start: startSeconds || 0,
            enablejsapi: 1,
            origin,
          },
          events: {
            onReady: (e) => {
              if (isCancelled) return;
              playerRef.current = e.target;
              setIsReady(true);
              const dur = e.target.getDuration();
              if (dur > 0) setDuration(dur);
              if (startSeconds && startSeconds > 0) {
                e.target.seekTo(startSeconds, true);
                setCurrentTime(startSeconds);
              }
              e.target.setVolume(100);
            },
            onStateChange: (e) => {
              if (isCancelled) return;
              if (e.data === window.YT.PlayerState.PLAYING) {
                setIsPlaying(true);
                const dur = e.target.getDuration();
                if (dur > 0) setDuration(dur);
              } else if (
                e.data === window.YT.PlayerState.PAUSED ||
                e.data === window.YT.PlayerState.ENDED
              ) {
                setIsPlaying(false);
              }
            },
            onError: (err) => {
              if (isCancelled) return;
              console.warn('YouTube Player error event:', err);
              // If embedding restrictions apply to this video ID
              setError('Unable to stream audio for this specific video.');
            },
          },
        });
      } catch (err) {
        if (!isCancelled) {
          console.error('Failed to load YouTube IFrame API:', err);
          setError('Failed to initialize audio player.');
        }
      }
    };

    setupPlayer();

    // Regular polling for smooth timeline progress updates
    progressTimer = window.setInterval(() => {
      if (playerRef.current && typeof playerRef.current.getCurrentTime === 'function') {
        const curr = playerRef.current.getCurrentTime();
        const dur = playerRef.current.getDuration();
        if (!isNaN(curr)) setCurrentTime(curr);
        if (!isNaN(dur) && dur > 0) setDuration(dur);
      }
    }, 250);

    return () => {
      isCancelled = true;
      if (progressTimer) clearInterval(progressTimer);
      if (playerRef.current && typeof playerRef.current.destroy === 'function') {
        try {
          playerRef.current.destroy();
        } catch {
          // ignore cleanup errors
        }
      }
    };
  }, [videoId, startSeconds]);

  const togglePlayPause = () => {
    if (!playerRef.current) return;
    if (isPlaying) {
      playerRef.current.pauseVideo();
    } else {
      playerRef.current.playVideo();
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const targetTime = parseFloat(e.target.value);
    setCurrentTime(targetTime);
    if (playerRef.current) {
      playerRef.current.seekTo(targetTime, true);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVol = parseInt(e.target.value, 10);
    setVolume(newVol);
    if (playerRef.current) {
      playerRef.current.setVolume(newVol);
      if (newVol > 0 && isMuted) {
        playerRef.current.unMute();
        setIsMuted(false);
      }
    }
  };

  const toggleMute = () => {
    if (!playerRef.current) return;
    if (isMuted) {
      playerRef.current.unMute();
      setIsMuted(false);
      if (volume === 0) {
        setVolume(50);
        playerRef.current.setVolume(50);
      }
    } else {
      playerRef.current.mute();
      setIsMuted(true);
    }
  };

  return (
    <div className="w-full max-w-2xl bg-slate-900/95 border-2 border-purple-600/70 rounded-2xl p-4 sm:p-5 shadow-2xl my-3 mx-auto relative text-slate-100 backdrop-blur-md overflow-hidden">
      {/* Standard-sized iframe container with opacity-0 - ensures browser doesn't throttle or freeze loading */}
      <div className="absolute inset-0 w-64 h-36 opacity-0 pointer-events-none -z-10 overflow-hidden">
        <div ref={containerRef} />
      </div>

      {error ? (
        <div className="text-rose-400 text-xs font-semibold py-2 text-center">{error}</div>
      ) : (
        <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
          {/* 1. Play / Pause Button */}
          <button
            type="button"
            onClick={togglePlayPause}
            disabled={!isReady}
            className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-purple-600 hover:bg-purple-500 active:scale-95 text-white flex items-center justify-center shadow-lg shadow-purple-600/30 transition-all cursor-pointer disabled:opacity-50 shrink-0 border border-purple-400/40"
            title={isPlaying ? 'Pause Audio' : 'Play Audio'}
          >
            {!isReady ? (
              <Loader2 className="w-6 h-6 animate-spin text-purple-200" />
            ) : isPlaying ? (
              <Pause className="w-6 h-6 fill-white text-white" />
            ) : (
              <Play className="w-6 h-6 fill-white text-white ml-0.5" />
            )}
          </button>

          {/* 2. Video / Song Timeline Bar (Adjust where the song is) */}
          <div className="flex-1 w-full flex flex-col gap-1.5 min-w-[180px]">
            <div className="flex items-center justify-between text-xs font-mono font-bold">
              <span className="text-purple-300">{formatTime(currentTime)}</span>
              <span className="text-slate-400">{formatTime(duration)}</span>
            </div>
            <input
              type="range"
              min={0}
              max={duration || 100}
              step={0.5}
              value={currentTime}
              onChange={handleSeek}
              disabled={!isReady}
              title="Seek audio position"
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-500 hover:accent-purple-400 transition-all disabled:opacity-50"
            />
          </div>

          {/* 3. Sound / Volume Bar (Adjust volume level) */}
          <div className="flex items-center gap-2.5 w-full sm:w-auto shrink-0 justify-end">
            <button
              type="button"
              onClick={toggleMute}
              disabled={!isReady}
              className="text-slate-400 hover:text-purple-300 p-1.5 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer disabled:opacity-50"
              title={isMuted || volume === 0 ? 'Unmute' : 'Mute'}
            >
              {isMuted || volume === 0 ? (
                <VolumeX className="w-5 h-5 text-rose-400" />
              ) : (
                <Volume2 className="w-5 h-5 text-purple-300" />
              )}
            </button>
            <input
              type="range"
              min={0}
              max={100}
              step={1}
              value={isMuted ? 0 : volume}
              onChange={handleVolumeChange}
              disabled={!isReady}
              title={`Volume: ${isMuted ? 0 : volume}%`}
              className="w-20 sm:w-24 h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-500 hover:accent-purple-400 transition-all disabled:opacity-50"
            />
            <span className="text-[11px] font-mono font-bold text-slate-400 w-7 text-right">
              {isMuted ? '0%' : `${volume}%`}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
