"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { MotionValue, useTransform } from "framer-motion";

const FRAME_COUNT = 192; // image000.png → image191.png

interface Props {
  scrollYProgress: MotionValue<number>;
}

export default function HeadphonesCanvas({ scrollYProgress }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [loadedCount, setLoadedCount] = useState(0);

  const imagesRef = useRef<HTMLImageElement[]>([]);
  const currentFrameRef = useRef(0);
  const targetFrameRef = useRef(0);
  const rafRef = useRef<number | null>(null);
  const loadedCountRef = useRef(0);
  const lastDrawnRef = useRef(-1);
  const dprRef = useRef(1);

  const frameIndex = useTransform(scrollYProgress, [0, 1], [0, FRAME_COUNT - 1]);

  const getFramePath = (index: number) => {
    const paddedIndex = index.toString().padStart(3, "0");
    return `/headphones/image${paddedIndex}.png`;
  };

  // ─── Preload ─────────────────────────────────────────────────────────────────
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
    Promise.all(loadBatch(priority)).then(() => Promise.all(loadBatch(rest)));
  }, []);

  // ─── Draw frame ──────────────────────────────────────────────────────────────
  const drawFrame = useCallback((frameFloat: number) => {
    const canvas = canvasRef.current;
    const imgs = imagesRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    // Work in CSS pixels; canvas backing store is scaled by DPR via resizeCanvas + ctx.scale
    const cw = canvas.clientWidth;
    const ch = canvas.clientHeight;
    if (cw === 0 || ch === 0) return;

    const drawOne = (img: HTMLImageElement, alpha = 1) => {
      if (!img?.complete || img.naturalWidth === 0) return false;

      const canvasRatio = cw / ch;
      const imgRatio = img.naturalWidth / img.naturalHeight;
      let drawWidth: number, drawHeight: number;
      let sx = 0, sy = 0;

      if (canvasRatio > imgRatio) {
        drawWidth = cw; drawHeight = cw / imgRatio; sy = (drawHeight - ch) / 2;
      } else {
        drawHeight = ch; drawWidth = ch * imgRatio; sx = (drawWidth - cw) / 2;
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

  // ─── RAF lerp loop ───────────────────────────────────────────────────────────
  useEffect(() => {
    let running = true;
    const loop = () => {
      if (!running) return;
      const current = currentFrameRef.current;
      const target = targetFrameRef.current;
      const delta = target - current;
      const absDelta = Math.abs(delta);

      if (absDelta > 0.008) {
        // Higher factor = snappier on both forward and reverse scroll
        const factor =
          absDelta > 15 ? 0.35 :
          absDelta > 6  ? 0.28 :
          absDelta > 2  ? 0.22 :
                          0.16;
        const next = current + delta * factor;
        currentFrameRef.current = next;
        const rn = Math.round(next * 10) / 10;
        if (Math.abs(rn - lastDrawnRef.current) > 0.05) {
          lastDrawnRef.current = rn;
          drawFrame(next);
        }
      }
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => { running = false; if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [drawFrame]);

  // ─── Scroll listener ─────────────────────────────────────────────────────────
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

    // Cap DPR to avoid huge backing stores on high-density mobile screens
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    dprRef.current = dpr;

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

    // ResizeObserver catches container size changes (orientation change,
    // mobile browser chrome show/hide, sidebar toggles, etc.) that a plain
    // window "resize" listener can miss.
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

  // ── NO internal height div — parent section in page.tsx owns the height ──
  return (
    <div className="sticky top-0 w-full h-[100svh] overflow-hidden flex items-center justify-center md:justify-end bg-[#010101] px-4 md:px-0">
      <div
        ref={wrapperRef}
        className="w-full md:w-auto"
        style={{
          width: "min(100%, clamp(280px, 90vw, 880px))",
          maxWidth: "min(90vw, 880px)",
          aspectRatio: "16 / 9",
          position: "relative",
          marginRight: "0",
        }}
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
            <div className="text-white/40 text-xs font-mono mb-3 tracking-[0.3em] uppercase">Loading</div>
            <div className="w-32 h-px bg-white/10 relative overflow-hidden rounded-full">
              <div
                className="absolute inset-y-0 left-0 bg-white/60 transition-all duration-150 rounded-full"
                style={{ width: `${loadPercent}%` }}
              />
            </div>
            <div className="text-white/20 text-xs font-mono mt-2">{loadedCount} / {FRAME_COUNT}</div>
          </div>
        )}

        {isReady && isLoading && (
          <div className="absolute bottom-0 left-0 h-px bg-white/10 w-full">
            <div className="h-full bg-white/30 transition-all duration-300" style={{ width: `${loadPercent}%` }} />
          </div>
        )}
      </div>
    </div>
  );
}