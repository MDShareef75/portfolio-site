import React, { useState, useEffect } from 'react';

const images = [
  '/images/carousel image 1.png',
  '/images/carousel image 2.png',
  '/images/carousel image 3.png',
  '/images/carousel image 4.png',
  '/images/carousel image 5.png',
  '/images/carousel image 6.png',
  '/images/carousel image 7.png',
];

export default function Carousel() {
  const [current, setCurrent] = useState(0);
  const length = images.length;

  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrent((prev) => (prev + 1) % length);
    }, 6000);
    return () => clearTimeout(timer);
  }, [current, length]);

  const goTo = (idx: number) => setCurrent(idx);
  const prev = () => setCurrent((current - 1 + length) % length);
  const next = () => setCurrent((current + 1) % length);

  return (
    <div className="relative w-3/4 mx-auto h-auto flex flex-col items-center justify-center overflow-hidden bg-surface/90 shadow-2xl rounded-3xl">
      {/* Carousel image and overlayed arrows for md+ screens */}
      <div className="relative w-full flex items-center justify-center">
        <button
          onClick={prev}
          className="hidden md:flex absolute left-2 top-1/2 -translate-y-1/2 z-10 p-2 bg-surface/70 rounded-full hover:bg-accent/30 transition"
          aria-label="Previous"
        >
          <svg className="w-6 h-6 text-accent" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
        </button>
        <img
          src={images[current]}
          alt={`Carousel ${current + 1}`}
          className="w-full max-h-[70vh] object-contain transition-all duration-2000 ease-[cubic-bezier(0.4,0,0.2,1)] shadow-2xl rounded-3xl"
          draggable={false}
        />
        <button
          onClick={next}
          className="hidden md:flex absolute right-2 top-1/2 -translate-y-1/2 z-10 p-2 bg-surface/70 rounded-full hover:bg-accent/30 transition"
          aria-label="Next"
        >
          <svg className="w-6 h-6 text-accent" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
        </button>
      </div>
      {/* Arrows below image for mobile */}
      <div className="flex md:hidden w-full justify-between mt-2 px-8">
        <button
          onClick={prev}
          className="p-2 bg-surface/70 rounded-full hover:bg-accent/30 transition"
          aria-label="Previous"
        >
          <svg className="w-6 h-6 text-accent" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
        </button>
        <button
          onClick={next}
          className="p-2 bg-surface/70 rounded-full hover:bg-accent/30 transition"
          aria-label="Next"
        >
          <svg className="w-6 h-6 text-accent" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
        </button>
      </div>
    </div>
  );
} 