"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { MotionValue, useTransform } from "framer-motion";

const FRAME_COUNT = 192;

interface Props {
  scrollYProgress: MotionValue<number>;
}

export default function ScrollytellingCanvas({ scrollYProgress }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
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
    loadedCountRef.current = 0;

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

  // ─── Draw frame — TRUE contain, no cropping ─────────────────────────────────
  const drawFrame = useCallback((frameFloat: number) => {
    const canvas = canvasRef.current;
    const imgs = imagesRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const cw = canvas.clientWidth;
    const ch = canvas.clientHeight;
    if (cw === 0 || ch === 0) return;

    const drawOne = (img: HTMLImageElement, alpha = 1) => {
      if (!img?.complete || img.naturalWidth === 0) return false;

      const canvasRatio = cw / ch;
      const imgRatio = img.naturalWidth / img.naturalHeight;

      let drawWidth: number, drawHeight: number, dx: number, dy: number;
      if (canvasRatio > imgRatio) {
        drawHeight = ch;
        drawWidth = ch * imgRatio;
        dx = (cw - drawWidth) / 2;
        dy = 0;
      } else {
        drawWidth = cw;
        drawHeight = cw / imgRatio;
        dx = 0;
        dy = (ch - drawHeight) / 2;
      }

      ctx.globalAlpha = alpha;
      ctx.drawImage(
        img,
        0, 0, img.naturalWidth, img.naturalHeight,
        dx, dy, drawWidth, drawHeight
      );
      ctx.globalAlpha = 1;
      return true;
    };

    ctx.clearRect(0, 0, cw, ch);

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
  useEffect(() => {
    let running = true;
    const loop = () => {
      if (!running) return;

      const current = currentFrameRef.current;
      const target = targetFrameRef.current;
      const delta = target - current;
      const absDelta = Math.abs(delta);

      if (absDelta > 0.008) {
        const factor =
          absDelta > 15 ? 0.25 :
          absDelta > 6  ? 0.20 :
          absDelta > 2  ? 0.16 :
                          0.12;

        const next = current + delta * factor;
        currentFrameRef.current = next;

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

  // ─── Resize canvas (DPR-aware, ResizeObserver-driven) ────────────────────────
  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const wrapper = wrapperRef.current;
    if (!canvas || !wrapper) return;

    const cssWidth = wrapper.clientWidth;
    const cssHeight = wrapper.clientHeight;
    if (cssWidth === 0 || cssHeight === 0) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const targetW = Math.round(cssWidth * dpr);
    const targetH = Math.round(cssHeight * dpr);

    if (canvas.width !== targetW || canvas.height !== targetH) {
      canvas.width = targetW;
      canvas.height = targetH;
      const ctx = canvas.getContext("2d");
      if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    drawFrame(currentFrameRef.current);
  }, [drawFrame]);

  useEffect(() => {
    resizeCanvas();

    const wrapper = wrapperRef.current;
    let ro: ResizeObserver | null = null;
    if (wrapper && "ResizeObserver" in window) {
      ro = new ResizeObserver(() => resizeCanvas());
      ro.observe(wrapper);
    }

    window.addEventListener("resize", resizeCanvas);
    window.addEventListener("orientationchange", resizeCanvas);

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      window.removeEventListener("orientationchange", resizeCanvas);
      if (ro && wrapper) ro.unobserve(wrapper);
    };
  }, [resizeCanvas]);

  const isLoading = loadedCount < FRAME_COUNT;
  const loadPercent = Math.round((loadedCount / FRAME_COUNT) * 100);
  const isReady = loadedCount >= 20;

  // ── NO internal height wrapper — page.tsx's 700vh div owns the scroll height ──
  return (
    <div className="sticky top-0 w-full h-[100svh] overflow-hidden flex items-center justify-center bg-[#050505]">
      <div
        ref={wrapperRef}
        className="relative w-full h-full"
      >
        <canvas
          ref={canvasRef}
          style={{
            display: "block",
            width: "100%",
            height: "100%",
            opacity: isReady ? 1 : 0,
            transition: "opacity 0.4s ease",
            willChange: "transform",
          }}
        />

        {!isReady && (
          <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
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