"use client";
import React from "react";
import { motion } from "framer-motion";

const VideoDemo = () => {
  return (
    <section className="py-24 relative overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="instrument-serif text-3xl md:text-5xl text-secondary-foreground dark:text-white mb-4">
            See it in Action
          </h2>
          <p className="text-muted-foreground jetbrains-mono text-sm max-w-lg mx-auto">
            Watch how we parse complexity into clarity in seconds.
          </p>
        </div>

        {/* Video Container */}
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="relative max-w-5xl mx-auto z-10"
        >
          {/* 1. Background Glow Effect */}
          <div className="absolute -inset-4 bg-gradient-to-r from-indigo-500/30 via-purple-500/30 to-blue-500/30 blur-3xl rounded-[3rem] opacity-50 dark:opacity-40 -z-10" />

          {/* 2. Window Frame (Glassmorphism) */}
          <div className="relative rounded-2xl border border-black/5 dark:border-white/10 bg-white/50 dark:bg-[#121212]/80 backdrop-blur-xl shadow-2xl overflow-hidden">
            
            {/* Window Header / Toolbar */}
            <div className="flex items-center px-4 py-3 border-b border-black/5 dark:border-white/5 bg-white/50 dark:bg-white/5">
              {/* Mac-style dots */}
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-[#FF5F56] border border-black/10" />
                <div className="w-3 h-3 rounded-full bg-[#FFBD2E] border border-black/10" />
                <div className="w-3 h-3 rounded-full bg-[#27C93F] border border-black/10" />
              </div>
              
              {/* Fake URL Bar */}
              <div className="mx-auto bg-black/5 dark:bg-white/10 rounded-md px-3 py-1 text-[10px] sm:text-xs text-muted-foreground jetbrains-mono flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500/50 animate-pulse" />
                repo-analyzer.com/demo
              </div>
            </div>

            {/* 3. The Video Player */}
            <div className="relative aspect-video bg-black/5 dark:bg-black">
              <video
                className="w-full h-full object-cover"
                autoPlay
                muted
                loop
                playsInline
                controls={false} // Clean look, no default controls
                poster="/video-poster.jpg" // Optional: Add a poster image if video loads slow
              >
                <source src="/demo-video.mp4" type="video/mp4" />
                Your browser does not support the video tag.
              </video>

              {/* Optional: Overlay gradient at bottom to fade into potential content */}
              <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_40px_rgba(0,0,0,0.1)]" />
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default VideoDemo;
