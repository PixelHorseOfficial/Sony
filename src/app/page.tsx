"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ScrollytellingCanvas from "@/components/ScrollytellingCanvas";
import HeadphonesCanvas from "@/components/HeadphonesCanvas";

export default function Home() {
  // ════════════════════════════════════════════
  // SCROLL TRACKING
  // Increased stiffness + damping = snappier on both forward AND reverse
  // ════════════════════════════════════════════
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 80,
    damping: 25,
    restDelta: 0.0005,
  });

  const headphonesRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: hpProgress } = useScroll({
    target: headphonesRef,
    offset: ["start start", "end end"],
  });
  // Higher stiffness = reverse scroll catches up instantly, no blinking
  const smoothHpProgress = useSpring(hpProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.0005,
  });

  const ctaRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: ctaProgress } = useScroll({
    target: ctaRef,
    offset: ["start start", "end end"],
  });
  const smoothCtaProgress = useSpring(ctaProgress, {
    stiffness: 80,
    damping: 25,
    restDelta: 0.0005,
  });

  // ── SECTION 1 MOTION VALUES ───────────────────────────────────────────────
  const heroOpacity = useTransform(smoothProgress, [0, 0.12], [1, 0]);
  const heroY = useTransform(smoothProgress, [0, 0.12], ["0vh", "-55vh"]);
  const heroScale = useTransform(smoothProgress, [0, 0.12], [1, 0.92]);
  const heroLetterSpacing = useTransform(smoothProgress, [0, 0.1], ["0em", "0.08em"]);

  const engOpacity = useTransform(smoothProgress, [0.15, 0.25, 0.35, 0.42], [0, 1, 1, 0]);
  const engX = useTransform(smoothProgress, [0.15, 0.27, 0.42], ["-60px", "0px", "0px"]);
  const engBlur = useTransform(smoothProgress, [0.15, 0.25, 0.42], [8, 0, 0]);

  const noiseOpacity = useTransform(smoothProgress, [0.42, 0.52, 0.62, 0.68], [0, 1, 1, 0]);
  const noiseX = useTransform(smoothProgress, [0.42, 0.54, 0.68], ["60px", "0px", "0px"]);
  const noiseBlur = useTransform(smoothProgress, [0.42, 0.52, 0.68], [8, 0, 0]);

  const soundOpacity = useTransform(smoothProgress, [0.68, 0.76, 0.84, 0.88], [0, 1, 1, 0]);
  const soundY = useTransform(smoothProgress, [0.68, 0.76, 0.88], ["40px", "0px", "0px"]);
  const soundBlur = useTransform(smoothProgress, [0.68, 0.76, 0.88], [8, 0, 0]);

  // ── SECTION 2 MOTION VALUES ───────────────────────────────────────────────
  const hpDesignOpacity = useTransform(smoothHpProgress, [0.1, 0.3, 0.8, 1.0], [0, 1, 1, 0]);
  const hpDesignX = useTransform(smoothHpProgress, [0.1, 0.3, 0.8], [-80, 0, 0]);
  const hpDesignBlur = useTransform(smoothHpProgress, [0.1, 0.3], [10, 0]);

  // ── SECTION 3 MOTION VALUES ───────────────────────────────────────────────
  const hpCtaOpacity = useTransform(smoothCtaProgress, [0, 0.2], [0, 1]);
  const hpCtaY = useTransform(smoothCtaProgress, [0, 0.2], ["20px", "0px"]);
  const hpCtaScale = useTransform(smoothCtaProgress, [0, 0.2], [0.98, 1]);

  // ── RESPONSIVE PANEL CLASSES ──────────────────────────────────────────────
  // Mobile: full-width caption pinned to the bottom, with a dark gradient
  // scrim behind it so the text stays legible over the moving image.
  // md+: original fixed side panel, vertically centered, no scrim.
  const leftPanelClass =
    "fixed inset-x-0 bottom-0 w-full px-6 pt-28 pb-10 pointer-events-none flex flex-col justify-end " +
    "bg-gradient-to-t from-black/90 via-black/55 to-transparent z-20 " +
    "md:bg-none md:inset-x-auto md:bottom-auto md:top-1/2 md:-translate-y-1/2 md:left-0 md:w-[45%] " +
    "md:pl-16 lg:pl-24 md:pr-0 md:pt-0 md:pb-0 md:justify-center";

  const rightPanelClass =
    "fixed inset-x-0 bottom-0 w-full px-6 pt-28 pb-10 pointer-events-none flex flex-col justify-end " +
    "bg-gradient-to-t from-black/90 via-black/55 to-transparent z-20 " +
    "md:bg-none md:inset-x-auto md:bottom-auto md:top-1/2 md:-translate-y-1/2 md:right-0 md:w-[45%] " +
    "md:pr-16 lg:pr-24 md:pl-0 md:pt-0 md:pb-0 md:items-end md:text-right md:justify-center";

  return (
    <main className="relative bg-[#050505]">
      <Navbar />

      <div className="fixed inset-0 pointer-events-none z-[-5] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#070d1f] via-[#050505] to-[#050505] opacity-90" />

      {/* ════════════════════════════════════════════════════════════
          SECTION 1 — Sony WH-1000XM6  (700vh)
      ════════════════════════════════════════════════════════════ */}
      <div ref={containerRef} className="relative w-full" style={{ height: "700vh" }}>
        <ScrollytellingCanvas scrollYProgress={smoothProgress} />

        <motion.div
          style={{ opacity: heroOpacity, y: heroY, scale: heroScale }}
          className="fixed top-20 left-0 w-full pointer-events-none z-20 flex flex-col items-center justify-start pt-[10vh] text-center px-4"
        >
          <motion.h1
            style={{ letterSpacing: heroLetterSpacing }}
            className="text-4xl sm:text-5xl md:text-7xl font-bold mb-4 text-white"
          >
            Sony WH-1000XM6
          </motion.h1>
          <p className="text-lg sm:text-xl md:text-3xl font-medium text-white/90 mb-4">Silence, perfected.</p>
          <p className="text-sm md:text-base text-white/60 max-w-lg mx-auto font-medium">
            Flagship wireless noise cancelling, re-engineered for a world that never stops.
          </p>
        </motion.div>

        <motion.section
          style={{ opacity: engOpacity, x: engX, filter: useTransform(engBlur, (v) => `blur(${v}px)`) }}
          className={leftPanelClass}
        >
          <div className="max-w-md mx-auto text-center md:mx-0 md:text-left pointer-events-auto">
            <p className="text-xs tracking-[0.3em] uppercase text-white/30 font-mono mb-4">Technology</p>
            <h2 className="text-2xl sm:text-3xl md:text-5xl font-bold tracking-tight mb-4 md:mb-6 leading-tight text-white">
              Precision-engineered{" "}
              <span className="bg-gradient-to-r from-white to-white/50 bg-clip-text text-transparent">
                for silence.
              </span>
            </h2>
            <div className="space-y-3 md:space-y-4 text-white/70 md:text-white/55 text-sm sm:text-base md:text-lg leading-relaxed">
              <p>Custom drivers, sealed acoustic chambers, and optimized airflow deliver studio-grade clarity.</p>
              <p>Every component is tuned for balance, power, and comfort—hour after hour.</p>
            </div>
            <div className="mt-6 md:mt-8 h-px w-16 bg-gradient-to-r from-white/40 to-transparent mx-auto md:mx-0" />
          </div>
        </motion.section>

        <motion.section
          style={{ opacity: noiseOpacity, x: noiseX, filter: useTransform(noiseBlur, (v) => `blur(${v}px)`) }}
          className={rightPanelClass}
        >
          <div className="max-w-md mx-auto text-center md:mx-0 md:text-right pointer-events-auto">
            <p className="text-xs tracking-[0.3em] uppercase text-white/30 font-mono mb-4">Noise Cancelling</p>
            <h2 className="text-2xl sm:text-3xl md:text-5xl font-bold tracking-tight mb-4 md:mb-6 leading-tight text-white">
              Adaptive noise{" "}
              <span className="bg-gradient-to-r from-white/50 to-white bg-clip-text text-transparent">
                cancelling, redefined.
              </span>
            </h2>
            <div className="space-y-3 md:space-y-4 text-white/70 md:text-white/55 text-sm sm:text-base md:text-lg leading-relaxed">
              <p>Multi-microphone array listens in every direction.</p>
              <p>Real-time noise analysis adjusts to your environment.</p>
              <p>Your music stays pure—planes, trains, and crowds fade away.</p>
            </div>
            <div className="mt-6 md:mt-8 h-px w-16 bg-gradient-to-l from-white/40 to-transparent mx-auto md:mx-0 md:ml-auto" />
          </div>
        </motion.section>

        <motion.section
          style={{ opacity: soundOpacity, y: soundY, filter: useTransform(soundBlur, (v) => `blur(${v}px)`) }}
          className={leftPanelClass}
        >
          <div className="max-w-md mx-auto text-center md:mx-0 md:text-left pointer-events-auto">
            <p className="text-xs tracking-[0.3em] uppercase text-white/30 font-mono mb-4">Sound</p>
            <h2 className="text-2xl sm:text-3xl md:text-5xl font-bold tracking-tight mb-4 md:mb-6 leading-tight text-white">
              Sound that{" "}
              <span className="bg-gradient-to-r from-white to-white/50 bg-clip-text text-transparent">
                moves you.
              </span>
            </h2>
            <div className="space-y-3 md:space-y-4 text-white/70 md:text-white/55 text-sm sm:text-base md:text-lg leading-relaxed">
              <p>40mm drivers tuned for a wide, natural soundstage.</p>
              <p>LDAC support streams at up to 990kbps — three times standard Bluetooth.</p>
              <p>360 Reality Audio puts you inside the music.</p>
            </div>
            <div className="mt-6 md:mt-8 h-px w-16 bg-gradient-to-r from-white/40 to-transparent mx-auto md:mx-0" />
          </div>
        </motion.section>
      </div>

      {/* ════════════════════════════════════════════════════════════
          SECTION 2 — Headphones sequence (350vh)
          HeadphonesCanvas has NO internal height — this div is the
          single source of scroll height. No double-stacking.
      ════════════════════════════════════════════════════════════ */}
      <div ref={headphonesRef} className="relative w-full" style={{ height: "350vh" }}>
        <HeadphonesCanvas scrollYProgress={smoothHpProgress} />

        <motion.section
          style={{
            opacity: hpDesignOpacity,
            x: hpDesignX,
            filter: useTransform(hpDesignBlur, (v) => `blur(${v}px)`),
            willChange: "transform",
          }}
          className={leftPanelClass}
        >
          <div className="max-w-md mx-auto text-center md:mx-0 md:text-left pointer-events-auto">
            <p className="text-xs tracking-[0.3em] uppercase text-white/30 font-mono mb-4">Design</p>
            <h2 className="text-2xl sm:text-3xl md:text-5xl font-bold tracking-tight mb-4 md:mb-6 leading-tight text-white">
              Sculpted for{" "}
              <span className="bg-gradient-to-r from-white to-white/50 bg-clip-text text-transparent">
                every ear.
              </span>
            </h2>
            <div className="space-y-3 md:space-y-4 text-white/70 md:text-white/55 text-sm sm:text-base md:text-lg leading-relaxed">
              <p>Ultra-slim headband. Soft-fit leather ear cushions. 250g of precision balance.</p>
              <p>Folds flat. Fits your life. Goes anywhere you do.</p>
            </div>
            <div className="mt-6 md:mt-8 h-px w-16 bg-gradient-to-r from-white/40 to-transparent mx-auto md:mx-0" />
          </div>
        </motion.section>
      </div>

      {/* ════════════════════════════════════════════════════════════
          SECTION 3 — CTA (200vh)
      ════════════════════════════════════════════════════════════ */}
      {/* ════════════════════════════════════════════════════════════
          SECTION 3 — CTA (200vh)
      ════════════════════════════════════════════════════════════ */}
      <div ref={ctaRef} className="relative w-full" style={{ height: "200vh" }}>
        <motion.div
          style={{ opacity: hpCtaOpacity, y: hpCtaY, scale: hpCtaScale }}
          className="sticky top-0 h-screen w-full flex items-center justify-center text-center px-4"
        >
          {/* Background product image — responsive size per breakpoint */}
          <div
            className="absolute inset-0 z-0 bg-[#010101] bg-no-repeat bg-center
                       bg-[length:150%] bg-bottom
                       sm:bg-[length:110%]
                       md:bg-[length:70%] md:bg-center"
            style={{ backgroundImage: "url('/image_start.png')" }}
          />

          {/* Scrim so text stays legible regardless of image size/position */}
          <div className="absolute inset-0 z-[1] bg-gradient-to-b from-black/70 via-black/20 to-black/70 md:bg-none pointer-events-none" />

          <div className="relative z-10 flex flex-col items-center px-4 pt-8 pb-24 md:py-0">
            <p className="text-xs tracking-[0.3em] uppercase text-white/30 font-mono mb-4 md:mb-6">
              Sony WH-1000XM5
            </p>
            <h2 className="text-3xl sm:text-4xl md:text-6xl font-bold tracking-tight mb-4 md:mb-6 leading-tight text-white">
              Your sound.{" "}
              <span className="bg-gradient-to-r from-white to-white/50 bg-clip-text text-transparent">
                Your world.
              </span>
            </h2>
            <p className="text-white/60 md:text-white/50 text-sm sm:text-base md:text-lg max-w-xs sm:max-w-sm mx-auto mb-8 md:mb-10">
              The headphones that defined a generation. Available now.
            </p>
            <div className="pointer-events-auto flex flex-col sm:flex-row gap-3 sm:gap-4">
              <button className="px-8 py-3 bg-white text-black font-semibold rounded-full text-sm hover:bg-white/90 transition-colors">
                Shop Now
              </button>
              <button className="px-8 py-3 border border-white/20 text-white font-semibold rounded-full text-sm hover:bg-white/10 transition-colors">
                Learn More
              </button>
            </div>
          </div>
        </motion.div>
      </div>
      <div className="relative z-30 bg-[#050505]">
        <Footer />
      </div>
    </main>
  );
}