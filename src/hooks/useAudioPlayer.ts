import { useEffect, useRef, useState, useCallback } from "react";

// Global registry — ensures only ONE audio plays at a time across the app.
const registry = new Set<HTMLAudioElement>();

/**
 * Audio elements are created lazily on the first user click (inside the
 * gesture), with preload="none". Creating one eagerly per card made browsers
 * throttle/auto-pause media and left play() promises rejected unhandled.
 */
export function useAudioPlayer(src: string) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const cleanupRef = useRef<(() => void) | null>(null);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const ensureAudio = useCallback(() => {
    if (audioRef.current) return audioRef.current;
    const a = new Audio();
    a.preload = "none";
    a.setAttribute("playsinline", "");
    a.src = src;
    audioRef.current = a;
    registry.add(a);

    const onTime = () => setCurrentTime(a.currentTime);
    const onLoaded = () => setDuration(Number.isFinite(a.duration) ? a.duration : 0);
    const onEnded = () => setPlaying(false);
    const onPause = () => setPlaying(false);
    const onPlay = () => setPlaying(true);
    const onError = () => {
      setPlaying(false);
      console.warn("Audio failed to load:", src, a.error?.message);
    };
    a.addEventListener("timeupdate", onTime);
    a.addEventListener("loadedmetadata", onLoaded);
    a.addEventListener("ended", onEnded);
    a.addEventListener("pause", onPause);
    a.addEventListener("playing", onPlay);
    a.addEventListener("error", onError);

    cleanupRef.current = () => {
      a.pause();
      a.removeEventListener("timeupdate", onTime);
      a.removeEventListener("loadedmetadata", onLoaded);
      a.removeEventListener("ended", onEnded);
      a.removeEventListener("pause", onPause);
      a.removeEventListener("playing", onPlay);
      a.removeEventListener("error", onError);
      a.removeAttribute("src");
      a.load();
      registry.delete(a);
    };
    return a;
  }, [src]);

  useEffect(() => {
    return () => {
      cleanupRef.current?.();
      cleanupRef.current = null;
      audioRef.current = null;
      setPlaying(false);
    };
  }, [src]);

  const play = useCallback(async () => {
    const a = ensureAudio();
    registry.forEach((other) => {
      if (other !== a && !other.paused) other.pause();
    });
    setPlaying(true);
    try {
      await a.play();
    } catch (err) {
      setPlaying(false);
      // AbortError = play interrupted by a pause (another card started); harmless.
      if ((err as DOMException)?.name !== "AbortError") {
        console.warn("Audio playback blocked:", (err as Error)?.message);
      }
    }
  }, [ensureAudio]);

  const pause = useCallback(() => {
    audioRef.current?.pause();
  }, []);

  const toggle = useCallback(() => {
    const a = audioRef.current;
    if (a && !a.paused) pause();
    else void play();
  }, [play, pause]);

  const seek = useCallback((t: number) => {
    if (audioRef.current) audioRef.current.currentTime = t;
  }, []);

  return { playing, currentTime, duration, play, pause, toggle, seek };
}
