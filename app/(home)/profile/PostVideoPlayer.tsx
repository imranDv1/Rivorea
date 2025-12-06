"use client";

import { useEffect, useRef, useState } from "react";
import { Play, Pause, Volume2, VolumeX, Maximize2, Minimize2 } from "lucide-react";

type PostVideoPlayerProps = {
  src: string;
  className?: string;
};

export function PostVideoPlayer({ src, className = "" }: PostVideoPlayerProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
      if (video.duration) {
        setProgress((video.currentTime / video.duration) * 100);
      }
    };

    const handleLoadedMetadata = () => {
      setDuration(video.duration || 0);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setProgress(0);
      setCurrentTime(0);
    };

    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("loadedmetadata", handleLoadedMetadata);
    video.addEventListener("ended", handleEnded);

    return () => {
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("loadedmetadata", handleLoadedMetadata);
      video.removeEventListener("ended", handleEnded);
    };
  }, []);

  useEffect(() => {
    if (typeof document === "undefined") return;

    const handleFullscreenChange = () => {
      const fullscreenElement =
        document.fullscreenElement ||
        // @ts-expect-error - vendor prefixes
        document.webkitFullscreenElement ||
        // @ts-expect-error - vendor prefixes
        document.mozFullScreenElement ||
        // @ts-expect-error - vendor prefixes
        document.msFullscreenElement;

      if (!fullscreenElement) {
        setIsFullscreen(false);
      }
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange);
    document.addEventListener("mozfullscreenchange", handleFullscreenChange);


    document.addEventListener("MSFullscreenChange", handleFullscreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener("webkitfullscreenchange", handleFullscreenChange);
      document.removeEventListener("mozfullscreenchange", handleFullscreenChange);
      document.removeEventListener("MSFullscreenChange", handleFullscreenChange);
    };
  }, []);

  // Close the speed menu when clicking outside
  useEffect(() => {
    if (!showSpeedMenu) return;
    const handleClick = (e: MouseEvent) => {
      // If the menu or button is not present or the click happened inside, return
      const menu = document.getElementById("video-speed-menu");
      const button = document.getElementById("video-speed-btn");
      if (
        (menu && menu.contains(e.target as Node)) ||
        (button && button.contains(e.target as Node))
      )
        return;
      setShowSpeedMenu(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [showSpeedMenu]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      video.play();
      setIsPlaying(true);
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setIsMuted(video.muted);
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const video = videoRef.current;
    if (!video || !duration) return;

    const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const newProgress = Math.min(Math.max(clickX / rect.width, 0), 1);
    const newTime = newProgress * duration;

    video.currentTime = newTime;
    setCurrentTime(newTime);
    setProgress(newProgress * 100);
  };

  const formatTime = (time: number) => {
    if (!Number.isFinite(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60)
      .toString()
      .padStart(2, "0");
    return `${minutes}:${seconds}`;
  };

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full bg-black overflow-hidden group ${className}`}
    >
      <video
        ref={videoRef}
        src={src}
        className="w-full h-full object-cover"
        playsInline
      />

      {/* Play overlay (center) buttons  */}
      <button
        type="button"
        onClick={togglePlay}
        className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/20 transition-colors"
      >
        <span className="bg-black/60 rounded-full p-3 text-white opacity-80">
          {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
        </span>
      </button>

      {/* Controls bar */}
      <div className="absolute bottom-0 left-0 right-0 px-3 pb-2 pt-3 bg-gradient-to-t from-black/70 via-black/40 to-transparent opacity-100 group-hover:opacity-100 transition-opacity">
        {/* Progress bar */}
        <div
          className="w-full h-1.5 bg-white/20 rounded-full cursor-pointer mb-2"
          onClick={handleSeek}
        >
          <div
            className="h-full bg-blue-500 rounded-full"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-xs text-white/90">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={togglePlay}
              className="p-1 rounded-full hover:bg-white/10"
            >
              {isPlaying ? (
                <Pause className="w-4 h-4" />
              ) : (
                <Play className="w-4 h-4" />
              )}
            </button>
            <button
              type="button"
              onClick={toggleMute}
              className="p-1 rounded-full hover:bg-white/10"
            >
              {isMuted ? (
                <VolumeX className="w-4 h-4" />
              ) : (
                <Volume2 className="w-4 h-4" />
              )}
            </button>
            <span className="ml-1">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Playback speed control */}
            <div className="relative">
              <button
                type="button"
                id="video-speed-btn"
                onClick={() => setShowSpeedMenu((prev) => !prev)}
                className="px-2 py-1 rounded bg-black/40 hover:bg-black/60 text-[10px] font-medium"
              >
                {playbackRate.toFixed(1)}x
              </button>
              {showSpeedMenu && (
                <div
                  id="video-speed-menu"
                  className="absolute right-0 bottom-full mb-1 w-16 rounded bg-black/80 text-[10px] overflow-hidden border border-white/10 shadow-lg z-50"
                >
                  {[0.5, 1, 1.5, 2].map((rate) => (
                    <button
                      key={rate}
                      type="button"
                      onClick={() => {
                        const video = videoRef.current;
                        if (!video) return;
                        video.playbackRate = rate;
                        setPlaybackRate(rate);
                        setShowSpeedMenu(false);
                      }}
                      className={`w-full text-left px-2 py-1 hover:bg-white/10 ${
                        playbackRate === rate ? "text-blue-400" : ""
                      }`}
                    >
                      {rate.toFixed(1)}x
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={async () => {
                const container = containerRef.current;
                if (!container || typeof document === "undefined") return;

                try {
                  const isCurrentlyFullscreen =
                    document.fullscreenElement === container ||
                    // @ts-expect-error - vendor prefixes
                    document.webkitFullscreenElement === container;

                  if (!isCurrentlyFullscreen) {
                    if (container.requestFullscreen) {
                      await container.requestFullscreen();
                      // @ts-expect-error - vendor prefixes
                    } else if (container.webkitRequestFullscreen) {
                      // @ts-expect-error - vendor prefixes
                      await container.webkitRequestFullscreen();
                    }
                    setIsFullscreen(true);
                  } else {
                    if (document.exitFullscreen) {
                      await document.exitFullscreen();
                      // @ts-expect-error - vendor prefixes
                    } else if (document.webkitExitFullscreen) {
                      // @ts-expect-error - vendor prefixes
                      await document.webkitExitFullscreen();
                    }
                    setIsFullscreen(false);
                  }
                } catch (err) {
                  console.error("Failed to toggle fullscreen", err);
                }
              }}
              className="p-1 rounded-full hover:bg-white/10"
            >
              {isFullscreen ? (
                <Minimize2 className="w-4 h-4" />
              ) : (
                <Maximize2 className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

