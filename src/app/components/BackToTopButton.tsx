'use client'

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

export default function BackToTopButton() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const onScroll = () => {
      setVisible(window.scrollY > 300);
    };
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleClick = () => {
    if (typeof window === 'undefined') return;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (typeof window === 'undefined') return null;

  return createPortal(
    <button
      onClick={handleClick}
      className={`fixed bottom-8 right-8 z-[100000] p-3 rounded-full shadow-lg bg-gradient-to-r from-[#64ffda] to-blue-400 text-[#0a192f] hover:from-blue-400 hover:to-[#64ffda] transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#64ffda] ${visible ? 'opacity-100' : 'opacity-0 pointer-events-none'} animate-fade-in`}
      aria-label="Back to Top"
    >
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
      </svg>
    </button>,
    document.body
  );
} 