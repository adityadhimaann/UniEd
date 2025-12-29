import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import lisaVideo from "@/assets/lisa.mp4";

interface LisaIntroProps {
  onComplete: () => void;
}

export function LisaIntro({ onComplete }: LisaIntroProps) {
  const [videoEnded, setVideoEnded] = useState(false);

  useEffect(() => {
    // Auto-complete after video duration (adjust based on your video length)
    const timer = setTimeout(() => {
      setVideoEnded(true);
      setTimeout(onComplete, 800); // Wait for fade out animation
    }, 8000); // Fallback timeout if video doesn't trigger onEnded

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <AnimatePresence>
      {!videoEnded && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
          className="fixed inset-0 z-[9999] bg-black flex items-center justify-center overflow-hidden"
        >
          {/* Background gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-900/20 via-blue-900/20 to-purple-900/20" />
          
          {/* Animated particles */}
          <div className="absolute inset-0">
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-cyan-400 rounded-full"
                initial={{
                  x: Math.random() * window.innerWidth,
                  y: Math.random() * window.innerHeight,
                  opacity: 0,
                }}
                animate={{
                  y: [null, Math.random() * window.innerHeight],
                  opacity: [0, 1, 0],
                }}
                transition={{
                  duration: 3 + Math.random() * 2,
                  repeat: Infinity,
                  delay: Math.random() * 2,
                }}
              />
            ))}
          </div>

          {/* Video container */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="relative z-10 w-full max-w-2xl px-8"
          >
            {/* Glowing border effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 rounded-3xl blur-2xl opacity-50 animate-pulse" />
            
            {/* Video */}
            <div className="relative rounded-3xl overflow-hidden shadow-2xl border-2 border-cyan-500/30">
              <video
                autoPlay
                muted
                playsInline
                className="w-full h-auto"
                onEnded={() => {
                  setVideoEnded(true);
                  setTimeout(onComplete, 800);
                }}
              >
                <source src={lisaVideo} type="video/mp4" />
              </video>
            </div>

            {/* Animated text below video */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="text-center mt-8"
            >
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent mb-3">
                Welcome to Lisa AI
              </h1>
              <p className="text-cyan-300/80 text-lg">
                Your intelligent assessment companion
              </p>
            </motion.div>
          </motion.div>

          {/* Skip button */}
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2 }}
            onClick={() => {
              setVideoEnded(true);
              onComplete();
            }}
            className="absolute bottom-8 right-8 px-6 py-3 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20 transition-all duration-300 text-sm font-medium"
          >
            Skip Intro →
          </motion.button>

          {/* Animated corner accents */}
          <motion.div
            className="absolute top-0 left-0 w-32 h-32 border-t-2 border-l-2 border-cyan-500/50 rounded-tl-3xl"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
          />
          <motion.div
            className="absolute top-0 right-0 w-32 h-32 border-t-2 border-r-2 border-blue-500/50 rounded-tr-3xl"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, duration: 0.8 }}
          />
          <motion.div
            className="absolute bottom-0 left-0 w-32 h-32 border-b-2 border-l-2 border-purple-500/50 rounded-bl-3xl"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          />
          <motion.div
            className="absolute bottom-0 right-0 w-32 h-32 border-b-2 border-r-2 border-cyan-500/50 rounded-br-3xl"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6, duration: 0.8 }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
