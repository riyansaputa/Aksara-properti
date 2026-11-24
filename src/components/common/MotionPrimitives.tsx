import React, { useEffect, useState } from 'react';
import { ArrowUp } from 'lucide-react';
import { AnimatePresence, motion, useScroll, useSpring } from 'motion/react';

export const ArchitecturalScrollProgress: React.FC = () => {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 220,
    damping: 32,
    restDelta: 0.001,
  });

  return (
    <motion.div
      aria-hidden="true"
      style={{ scaleX }}
      className="fixed top-0 inset-x-0 h-[3px] bg-gradient-to-r from-[#8B1522] via-amber-400 to-[#8B1522] origin-left z-50 pointer-events-none"
    />
  );
};

interface ArchitecturalRevealProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}

export const ArchitecturalReveal: React.FC<ArchitecturalRevealProps> = ({
  children,
  className = '',
  delay = 0,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.08 }}
      transition={{
        duration: 0.45,
        delay,
        ease: [0.16, 1, 0.3, 1],
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

interface InteractiveCardMotionProps {
  children: React.ReactNode;
  className?: string;
  index?: number;
}

export const InteractiveCardMotion: React.FC<InteractiveCardMotionProps> = ({
  children,
  className = '',
  index = 0,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.06 }}
      whileHover={{ y: -4 }}
      transition={{
        duration: 0.35,
        delay: Math.min(index * 0.05, 0.2),
        ease: [0.16, 1, 0.3, 1],
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export const BackToTopButton: React.FC = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setVisible(window.scrollY > 560);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          type="button"
          initial={{ opacity: 0, y: 12, scale: 0.92 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 12, scale: 0.92 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          aria-label="Kembali ke atas halaman"
          title="Kembali ke atas"
          className="hidden md:inline-flex fixed bottom-6 left-6 z-30 w-11 h-11 rounded-xl bg-[#5D0C15]/95 backdrop-blur-md text-amber-300 border border-amber-400/35 shadow-xl items-center justify-center hover:bg-[#7A111D] hover:scale-105 transition-transform cursor-pointer"
        >
          <ArrowUp className="w-4 h-4" />
        </motion.button>
      )}
    </AnimatePresence>
  );
};
