"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { MotionValue, useTransform } from "framer-motion";

const FRAME_COUNT = 192;

interface Props {
  scrollYProgress: MotionValue<number>;
}

export default function ScrollytellingCanvas({ scrollYProgress }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [loadedCount, setLoadedCount] = useState(0);

  const imagesRef = useRef<HTMLImageElement[]>([]);
  const currentFrameRef = useRef(0);
  const targetFrameRef = useRef(0);
  const rafRef = useRef<number | null>(null);
  const loadedCountRef = useRef(0);
  const lastDrawnRef = useRef(-1);

  const frameIndex = useTransform(scrollYProgress, [0, 1], [0, FRAME_COUNT - 1]);

  const getFramePath = (index: number) => {
    const paddedIndex = (index + 1).toString().padStart(4, "0");
    return `/sequence/IMAGE${paddedIndex}.png`;
  };

  // ─── Parallel preload ────────────────────────────────────────────────────────
  useEffect(() => {
    imagesRef.current = new Array(FRAME_COUNT).fill(null);

    // Prioritize first 20 frames so the hero loads fast
    const loadBatch = (indices: number[]) =>
      indices.map(
        (i) =>
          new Promise<void>((resolve) => {
            const img = new Image();
            img.src = getFramePath(i);
            img.onload = () => {
              imagesRef.current[i] = img;
              loadedCountRef.current += 1;
              setLoadedCount(loadedCountRef.current);
              resolve();
            };
            img.onerror = () => {
              loadedCountRef.current += 1;
              setLoadedCount(loadedCountRef.current);
              resolve();
            };
          })
      );

    const priority = Array.from({ length: 20 }, (_, i) => i);
    const rest = Array.from({ length: FRAME_COUNT - 20 }, (_, i) => i + 20);

    Promise.all(loadBatch(priority)).then(() => {
      Promise.all(loadBatch(rest));
    });
  }, []);

  // ─── Draw a single frame (cover-mode with cross-fade blend) ─────────────────
  const drawFrame = useCallback((frameFloat: number) => {
    const canvas = canvasRef.current;
    const imgs = imagesRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    const cw = canvas.width;
    const ch = canvas.height;

    const drawOne = (img: HTMLImageElement, alpha = 1) => {
      if (!img?.complete || img.naturalWidth === 0) return false;

      const canvasRatio = cw / ch;
      const imgRatio = img.naturalWidth / img.naturalHeight;

      let drawWidth: number, drawHeight: number;
      let sx = 0, sy = 0;

      if (canvasRatio > imgRatio) {
        drawWidth = cw;
        drawHeight = cw / imgRatio;
        sy = (drawHeight - ch) / 2;
      } else {
        drawHeight = ch;
        drawWidth = ch * imgRatio;
        sx = (drawWidth - cw) / 2;
      }

      ctx.globalAlpha = alpha;
      ctx.drawImage(
        img,
        sx * (img.naturalWidth / drawWidth),
        sy * (img.naturalHeight / drawHeight),
        img.naturalWidth * (cw / drawWidth),
        img.naturalHeight * (ch / drawHeight),
        0, 0, cw, ch
      );
      ctx.globalAlpha = 1;
      return true;
    };

    ctx.fillStyle = "#050505";
    ctx.fillRect(0, 0, cw, ch);

    const lo = Math.floor(frameFloat);
    const hi = Math.min(lo + 1, FRAME_COUNT - 1);
    const t = frameFloat - lo;

    const imgLo = imgs[lo];
    const imgHi = imgs[hi];

    if (imgLo) {
      drawOne(imgLo, 1);
      if (t > 0.01 && imgHi) drawOne(imgHi, t);
    } else if (imgHi) {
      drawOne(imgHi, 1);
    }
  }, []);

  // ─── Smooth lerp animation loop ──────────────────────────────────────────────
  // Uses adaptive easing: snappy when far away, silky when close
  useEffect(() => {
    let running = true;

    const loop = () => {
      if (!running) return;

      const current = currentFrameRef.current;
      const target = targetFrameRef.current;
      const delta = target - current;
      const absDelta = Math.abs(delta);

      if (absDelta > 0.008) {
        // Adaptive lerp factor — fast catch-up, smooth finish
        const factor =
          absDelta > 15 ? 0.25 :
          absDelta > 6  ? 0.20 :
          absDelta > 2  ? 0.16 :
                          0.12;

        const next = current + delta * factor;
        currentFrameRef.current = next;

        // Only redraw if frame visually changed (avoids wasted GPU work)
        const roundedNext = Math.round(next * 10) / 10;
        if (Math.abs(roundedNext - lastDrawnRef.current) > 0.05) {
          lastDrawnRef.current = roundedNext;
          drawFrame(next);
        }
      }

      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);
    return () => {
      running = false;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [drawFrame]);

  // ─── Subscribe to scroll progress ────────────────────────────────────────────
  useEffect(() => {
    return frameIndex.on("change", (latest) => {
      targetFrameRef.current = latest;
    });
  }, [frameIndex]);

  // ─── Canvas resize ───────────────────────────────────────────────────────────
  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    drawFrame(currentFrameRef.current);
  }, [drawFrame]);

  useEffect(() => {
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);
    return () => window.removeEventListener("resize", resizeCanvas);
  }, [resizeCanvas]);

  const isLoading = loadedCount < FRAME_COUNT;
  const loadPercent = Math.round((loadedCount / FRAME_COUNT) * 100);
  const isReady = loadedCount >= 20; // show canvas once priority frames are in

  return (
    <div style={{ height: "700vh" }}>
      <div className="sticky top-0 w-full h-screen bg-[#050505] overflow-hidden">
        <canvas
          ref={canvasRef}
          className="block w-full h-full"
          style={{ willChange: "transform", opacity: isReady ? 1 : 0, transition: "opacity 0.4s ease" }}
        />

        {/* Loading overlay — fades out once first frames are ready */}
        {!isReady && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#050505] z-10">
            <div className="text-white/50 text-xs font-mono mb-4 tracking-[0.3em] uppercase">
              Loading
            </div>
            <div className="w-48 h-px bg-white/10 relative overflow-hidden rounded-full">
              <div
                className="absolute inset-y-0 left-0 bg-white transition-all duration-150 rounded-full"
                style={{ width: `${loadPercent}%` }}
              />
            </div>
            <div className="text-white/25 text-xs font-mono mt-3">
              {loadedCount} / {FRAME_COUNT}
            </div>
          </div>
        )}

        {/* Subtle progress bar while rest of frames load in background */}
        {isReady && isLoading && (
          <div className="absolute bottom-0 left-0 h-px bg-white/10 w-full">
            <div
              className="h-full bg-white/30 transition-all duration-300"
              style={{ width: `${loadPercent}%` }}
            />
          </div>
        )}
      </div>
    </div>
  );
}