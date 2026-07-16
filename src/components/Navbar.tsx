"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import Link from "next/link";

export default function Navbar() {
  const { scrollY } = useScroll();
  
  // Fade in the navbar background after zooming a bit (e.g. 50px)
  const navBackgroundOpacity = useTransform(scrollY, [0, 50], [0, 1]);
  
  return (
    <motion.nav
      style={{ opacity: navBackgroundOpacity }}
      className="fixed top-0 inset-x-0 z-50 flex items-center justify-between h-14 px-8 glass-nav transition-all duration-300"
    >
     <div className="flex items-center h-full">
  <img
    src="/sony-logo.svg"
    alt="Sony Logo"
    width={90}
    height={24}
    className="object-contain"
  />
</div>
      
      <div className="hidden md:flex items-center gap-8 text-sm text-white/60 font-medium">
        <Link href="#overview" className="hover:text-white transition-colors">Overview</Link>
        <Link href="#technology" className="hover:text-white transition-colors">Technology</Link>
        <Link href="#noise-cancelling" className="hover:text-white transition-colors">Noise Cancelling</Link>
        <Link href="#specs" className="hover:text-white transition-colors">Specs</Link>
      </div>

      <div className="flex items-center gap-4">
        <button className="button-gradient-border px-5 py-1.5 text-sm font-semibold text-white">
          Experience WH-1000XM6
        </button>
      </div>
    </motion.nav>
  );
}
