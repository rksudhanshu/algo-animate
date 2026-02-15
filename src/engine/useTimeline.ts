import { useEffect, useRef } from "react";
import { useAppStore } from "../store/useAppStore";

export function useTimeline() {
  const playing = useAppStore((s) => s.playing);
  const speedMs = useAppStore((s) => s.speedMs);
  const framesLen = useAppStore((s) => s.frames.length);
  const index = useAppStore((s) => s.index);
  const setIndex = useAppStore((s) => s.setIndex);
  const setPlaying = useAppStore((s) => s.setPlaying);

  const last = useRef<number>(0);
  const raf = useRef<number | null>(null);

  useEffect(() => {
    if (!playing || framesLen <= 1) return;

    const loop = (t: number) => {
      if (t - last.current >= speedMs) {
        if (index >= framesLen - 1) {
          setPlaying(false);
          return;
        }
        setIndex(index + 1);
        last.current = t;
      }
      raf.current = requestAnimationFrame(loop);
    };

    raf.current = requestAnimationFrame(loop);

    return () => {
      if (raf.current) cancelAnimationFrame(raf.current);
      raf.current = null;
    };
  }, [playing, speedMs, framesLen, index, setIndex, setPlaying]);
}
