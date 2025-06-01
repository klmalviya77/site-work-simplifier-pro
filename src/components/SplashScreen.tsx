
import React, { useState, useEffect } from 'react';
import LogoImage from './LogoImage';
import { motion, AnimatePresence } from 'framer-motion';

interface SplashScreenProps {
  onComplete: () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  const [showTagline, setShowTagline] = useState<boolean>(false);
  const [showSecondTagline, setShowSecondTagline] = useState<boolean>(false);
  
  useEffect(() => {
    // Animation sequence
    const animationTimers = [
      setTimeout(() => setShowTagline(true), 800),
      setTimeout(() => setShowSecondTagline(true), 1600),
      setTimeout(() => onComplete(), 3000)
    ];
    
    return () => animationTimers.forEach(timer => clearTimeout(timer));
  }, [onComplete]);
  
  return (
    <div className="fixed inset-0 bg-mistryblue-500 flex flex-col items-center justify-center z-50 overflow-hidden">
      {/* Background animated elements */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-white bg-opacity-10"
            initial={{ 
              scale: 0,
              opacity: 0,
              x: Math.random() * 100 - 50,
              y: Math.random() * 100 - 50
            }}
            animate={{ 
              scale: [0, 1.5, 0],
              opacity: [0, 0.1, 0],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              delay: i * 0.3,
              ease: "easeInOut"
            }}
            style={{
              width: `${Math.random() * 200 + 100}px`,
              height: `${Math.random() * 200 + 100}px`,
            }}
          />
        ))}
      </div>

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center justify-center">
        {/* Logo with enhanced animation */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{
            type: "spring",
            damping: 10,
            stiffness: 100,
            mass: 1
          }}
          className="mb-8"
        >
          <LogoImage size="large" />
        </motion.div>

        <AnimatePresence>
          {showTagline && (
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              transition={{ duration: 0.6, ease: "backOut" }}
              className="text-white mt-4 text-xl font-medium"
            >
              Simplify Your Site Work
            </motion.p>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showSecondTagline && (
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              transition={{ 
                duration: 0.6, 
                ease: "backOut",
                delay: 0.2
              }}
              className="text-white mt-2 text-lg opacity-80"
            >
              Made with dedication by Kuldeep Malviya
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      {/* Loading bar */}
      <motion.div 
        className="absolute bottom-10 h-1 bg-white bg-opacity-30 rounded-full overflow-hidden"
        style={{ width: '200px' }}
      >
        <motion.div
          className="h-full bg-white"
          initial={{ width: 0 }}
          animate={{ width: "100%" }}
          transition={{ duration: 2.5, ease: "linear" }}
        />
      </motion.div>
    </div>
  );
};

export default SplashScreen;
