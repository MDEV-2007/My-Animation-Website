'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

const ROLES = [
  'Software Engineer',
  'AI Engineer',
  'Backend Developer',
  'Full Stack Developer',
  'Problem Solver',
  'Builder',
  'Dreamer',
];

export default function RoleCycler() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setI((v) => (v + 1) % ROLES.length), 2200);
    return () => clearInterval(id);
  }, []);
  return (
    <span className="relative inline-block h-[1.2em] align-bottom">
      <AnimatePresence mode="wait">
        <motion.span
          key={i}
          initial={{ opacity: 0, y: '0.4em', filter: 'blur(6px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          exit={{ opacity: 0, y: '-0.4em', filter: 'blur(6px)' }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="bg-gradient-to-r from-[#7cf6ff] via-[#a78bfa] to-[#ff8a5c] bg-clip-text text-transparent"
        >
          {ROLES[i]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}
