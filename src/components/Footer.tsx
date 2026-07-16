"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";

const LINKS = {
  Product: ["Overview", "Technology", "Noise Cancelling", "Specs", "Compare"],
  Support: ["Setup Guide", "FAQs", "Warranty", "Contact Us", "Service Centers"],
  Company: ["About Sony", "Newsroom", "Careers", "Sustainability", "Investors"],
  Legal: ["Privacy Policy", "Terms of Use", "Cookie Settings", "Accessibility"],
};

const SOCIALS = [
  {
    label: "X",
    href: "#",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.742l7.735-8.835L1.254 2.25H8.08l4.253 5.622 5.911-5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
  {
    label: "Instagram",
    href: "#",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
      </svg>
    ),
  },
  {
    label: "YouTube",
    href: "#",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
      </svg>
    ),
  },
  {
    label: "LinkedIn",
    href: "#",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    ),
  },
];

export default function Footer() {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <footer
      ref={ref}
      className="relative bg-[#050505] border-t border-white/[0.06] overflow-hidden"
    >
      {/* ── Subtle top glow ── */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

      {/* ── Large background wordmark ── */}
      <div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 select-none pointer-events-none"
        aria-hidden
      >
        <span
          className="text-[18vw] font-black tracking-tighter text-white/[0.025] whitespace-nowrap leading-none"
          style={{ fontFamily: "Georgia, serif" }}
        >
          SONY
        </span>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-8 md:px-16 pt-20 pb-10">

        {/* ── Top row: brand + tagline ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16"
        >
          <div>
            <p className="text-3xl md:text-4xl font-bold text-white tracking-tight mb-2">
              Sony WH-1000XM6
            </p>
            <p className="text-white/30 text-sm font-mono tracking-[0.2em] uppercase">
              Silence, perfected.
            </p>
          </div>

          {/* CTA */}
          <div className="flex items-center gap-4">
            <button className="px-7 py-3 bg-white text-black text-sm font-semibold rounded-full hover:bg-white/90 transition-all duration-300 hover:scale-105 active:scale-95">
              Buy Now
            </button>
            <button className="px-7 py-3 border border-white/15 text-white text-sm font-medium rounded-full hover:border-white/40 transition-all duration-300 hover:scale-105 active:scale-95">
              Learn More
            </button>
          </div>
        </motion.div>

        {/* ── Divider ── */}
        <div className="h-px w-full bg-white/[0.06] mb-16" />

        {/* ── Nav columns ── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
          className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-16"
        >
          {Object.entries(LINKS).map(([category, items]) => (
            <div key={category}>
              <p className="text-[10px] tracking-[0.3em] uppercase text-white/25 font-mono mb-5">
                {category}
              </p>
              <ul className="space-y-3">
                {items.map((item) => (
                  <li key={item}>
                    <a
                      href="#"
                      className="text-white/45 text-sm hover:text-white transition-colors duration-200 hover:translate-x-1 inline-block"
                    >
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </motion.div>

        {/* ── Divider ── */}
        <div className="h-px w-full bg-white/[0.06] mb-10" />

        {/* ── Bottom row ── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex flex-col md:flex-row items-center justify-between gap-6"
        >
          {/* Copyright */}
          <p className="text-white/20 text-xs font-mono tracking-wide">
            © {new Date().getFullYear()} Sony Corporation. All rights reserved.
          </p>

          {/* Socials */}
          <div className="flex items-center gap-5">
            {SOCIALS.map((s) => (
              <a
                key={s.label}
                href={s.href}
                aria-label={s.label}
                className="text-white/25 hover:text-white transition-all duration-200 hover:scale-110"
              >
                {s.icon}
              </a>
            ))}
          </div>

          {/* Region */}
          <div className="flex items-center gap-2 text-white/20 text-xs font-mono">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="12" cy="12" r="10" />
              <path d="M2 12h20M12 2a15.3 15.3 0 010 20M12 2a15.3 15.3 0 000 20" />
            </svg>
            <span>Global / EN</span>
          </div>
        </motion.div>

      </div>
    </footer>
  );
}