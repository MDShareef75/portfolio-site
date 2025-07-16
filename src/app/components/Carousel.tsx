import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useTheme } from '../context/ThemeContext';

const images = [
  { 
    src: '/images/carousel image 1.png', 
    alt: 'Modern web application dashboard showing clean interface design' 
  },
  { 
    src: '/images/carousel image 2.png', 
    alt: 'Mobile app development showcase featuring responsive design' 
  },
  { 
    src: '/images/carousel image 3.png', 
    alt: 'E-commerce platform with modern shopping cart interface' 
  },
  { 
    src: '/images/carousel image 4.png', 
    alt: 'Full-stack development project displaying backend integration' 
  },
  { 
    src: '/images/carousel image 5.png', 
    alt: 'AI-powered application with machine learning features' 
  },
  { 
    src: '/images/carousel image 6.png', 
    alt: 'Cross-platform mobile application built with Flutter' 
  },
];

// 3D Cube rotations
const boxRotations = [
  'rotateY(0deg)',      // Front
  'rotateY(-90deg)',    // Right
  'rotateY(-180deg)',   // Back
  'rotateY(-270deg)',   // Left
  'rotateX(-90deg)',    // Top
  'rotateX(90deg)',     // Bottom
];

export default function Carousel() {
  const { theme } = useTheme();
  const [current, setCurrent] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [faceSize, setFaceSize] = useState(500);
  const carouselRef = useRef<HTMLDivElement>(null);
  const length = images.length;

  // Responsive face size calculation
  useEffect(() => {
    const updateSize = () => {
      if (typeof window === 'undefined') return;
      
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      let newSize;
      if (width < 640) {
        // Mobile: smaller size, fits in viewport
        newSize = Math.min(width * 0.7, height * 0.4, 280);
      } else if (width < 1024) {
        // Tablet: medium size
        newSize = Math.min(width * 0.6, height * 0.5, 400);
      } else {
        // Desktop: large size
        newSize = Math.min(width * 0.4, height * 0.6, 500);
      }
      
      setFaceSize(Math.max(newSize, 200)); // Minimum size of 200px
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  const cubeDepth = faceSize / 2;

  const next = useCallback(() => {
    setCurrent((prev) => (prev + 1) % length);
  }, [length]);

  const prev = useCallback(() => {
    setCurrent((prev) => (prev - 1 + length) % length);
  }, [length]);

  const goTo = useCallback((idx: number) => {
    setCurrent(idx);
  }, []);

  // Auto-advance carousel
  useEffect(() => {
    if (!isPlaying) return;
    
    const timer = setTimeout(() => {
      next();
    }, 4000);
    
    return () => clearTimeout(timer);
  }, [current, isPlaying, next]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!carouselRef.current?.contains(document.activeElement)) return;
      
      switch (event.key) {
        case 'ArrowLeft':
          event.preventDefault();
          prev();
          break;
        case 'ArrowRight':
          event.preventDefault();
          next();
          break;
        case ' ':
        case 'Enter':
          event.preventDefault();
          setIsPlaying(!isPlaying);
          break;
        case 'Home':
          event.preventDefault();
          goTo(0);
          break;
        case 'End':
          event.preventDefault();
          goTo(length - 1);
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [prev, next, isPlaying, goTo, length]);

  return (
    <div 
      ref={carouselRef}
      className="relative w-full max-w-7xl mx-auto px-4 h-auto flex flex-col items-center justify-center"
      role="region"
      aria-label="3D Portfolio showcase carousel"
      onMouseEnter={() => setIsPlaying(false)}
      onMouseLeave={() => setIsPlaying(true)}
    >
      {/* 3D Scene Container */}
      <div 
        className="relative w-full flex items-center justify-center"
        style={{ 
          height: `${faceSize + 100}px`, // Dynamic height based on cube size
          perspective: `${faceSize * 2.5}px`, // Responsive perspective
          perspectiveOrigin: 'center center'
        }}
      >
        {/* 3D Cube Container */}
        <div 
          className="relative preserve-3d transition-transform duration-1000 ease-out"
          style={{
            width: `${faceSize}px`,
            height: `${faceSize}px`,
            transform: `translateZ(-${cubeDepth}px) ${boxRotations[current]}`,
            transformStyle: 'preserve-3d',
            transformOrigin: 'center center',
          }}
        >
          {/* Equal Size Cube Faces */}
          {images.map((image, index) => {
            let transform = '';
            
            // All faces same size - proper cube
            const faceStyle: React.CSSProperties = {
              width: `${faceSize}px`,
              height: `${faceSize}px`,
              left: '50%',
              top: '50%',
              marginLeft: `-${faceSize/2}px`,
              marginTop: `-${faceSize/2}px`,
            };
            
            switch (index) {
              case 0: // Front face
                transform = `rotateY(0deg) translateZ(${cubeDepth}px)`;
                break;
              case 1: // Right face
                transform = `rotateY(90deg) translateZ(${cubeDepth}px)`;
                break;
              case 2: // Back face
                transform = `rotateY(180deg) translateZ(${cubeDepth}px)`;
                break;
              case 3: // Left face
                transform = `rotateY(270deg) translateZ(${cubeDepth}px)`;
                break;
              case 4: // Top face
                transform = `rotateX(90deg) translateZ(${cubeDepth}px)`;
                break;
              case 5: // Bottom face
                transform = `rotateX(-90deg) translateZ(${cubeDepth}px)`;
                break;
              default:
                transform = `rotateY(${index * 60}deg) translateZ(${cubeDepth}px)`;
            }

            return (
              <div
                key={index}
                className="absolute backface-hidden overflow-hidden rounded-2xl water-glass-face"
                style={{
                  ...faceStyle,
                  transform,
                  transformOrigin: 'center center',
                  backfaceVisibility: 'hidden',
                  WebkitBackfaceVisibility: 'hidden',
                  background: theme === 'light' 
                    ? 'linear-gradient(135deg, rgba(200, 200, 200, 0.6) 0%, rgba(180, 180, 180, 0.4) 100%)'
                    : 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.03) 100%)',
                  backdropFilter: 'blur(12px)',
                  WebkitBackdropFilter: 'blur(12px)',
                  border: theme === 'light'
                    ? '1px solid rgba(160, 160, 160, 0.4)'
                    : '1px solid rgba(255, 255, 255, 0.18)',
                  boxShadow: theme === 'light'
                    ? `
                      0 8px 32px 0 rgba(0, 0, 0, 0.15),
                      inset 0 1px 0 rgba(255, 255, 255, 0.8),
                      0 0 20px rgba(8, 145, 178, 0.12)
                    `
                    : `
                      0 8px 32px 0 rgba(31, 38, 135, 0.37),
                      inset 0 1px 0 rgba(255, 255, 255, 0.3),
                      0 0 20px rgba(100, 255, 218, 0.2)
                    `,
                }}
              >
                {/* Water ripple effect overlay */}
                <div className="absolute inset-0 water-ripple-bg pointer-events-none" style={{ zIndex: 1 }}></div>
                
                {/* Glass highlight */}
                <div 
                  className="absolute top-0 left-0 w-full h-1/3 pointer-events-none rounded-t-2xl" 
                  style={{ 
                    zIndex: 3,
                    background: theme === 'light'
                      ? 'linear-gradient(to bottom, rgba(255, 255, 255, 0.6) 0%, rgba(255, 255, 255, 0.2) 50%, transparent 100%)'
                      : 'linear-gradient(to bottom, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0.05) 50%, transparent 100%)'
                  }}
                ></div>
                

                
                {/* Image */}
        <img
                  src={image.src}
                  alt={image.alt}
                  className={`w-full h-full object-contain transition-all duration-300 ${
                    faceSize < 300 ? 'p-4' : faceSize < 400 ? 'p-6' : 'p-8'
                  }`}
          draggable={false}
                  style={{ 
                    imageRendering: 'crisp-edges',
                    filter: 'contrast(1.1) brightness(1.1) saturate(1.2)',
                    mixBlendMode: 'normal',
                    position: 'relative',
                    zIndex: 2
                  }}
                />
                
                {/* Water surface effect */}
                <div 
                  className="absolute inset-0 pointer-events-none water-surface" 
                  style={{ 
                    zIndex: 1,
                    background: theme === 'light'
                      ? 'linear-gradient(to top, rgba(8, 145, 178, 0.05) 0%, transparent 50%, rgba(56, 189, 248, 0.02) 100%)'
                      : 'linear-gradient(to top, rgba(6, 182, 212, 0.1) 0%, transparent 50%, rgba(56, 189, 248, 0.05) 100%)'
                  }}
                ></div>
              </div>
            );
          })}
      </div>

        {/* Responsive Navigation Arrows */}
        <button
          onClick={prev}
          className={`absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-50 ${
            faceSize < 300 ? 'p-2' : 'p-3'
          } backdrop-blur-sm rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-accent shadow-lg`}
          style={{
            backgroundColor: theme === 'light' 
              ? 'rgba(200, 200, 200, 0.8)' 
              : 'rgba(17, 34, 64, 0.9)',
            border: theme === 'light'
              ? '1px solid rgba(160, 160, 160, 0.4)'
              : '1px solid rgba(100, 255, 218, 0.2)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = theme === 'light'
              ? 'rgba(8, 145, 178, 0.15)'
              : 'rgba(100, 255, 218, 0.2)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = theme === 'light'
              ? 'rgba(200, 200, 200, 0.8)'
              : 'rgba(17, 34, 64, 0.9)';
          }}
          aria-label={`Previous image. Currently showing image ${current + 1} of ${length}`}
          tabIndex={0}
        >
          <svg 
            className={`${faceSize < 300 ? 'w-4 h-4' : 'w-6 h-6'}`}
            style={{ 
              color: theme === 'light' ? '#0891b2' : '#64ffda'
            }}
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <button
          onClick={next}
          className={`absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-50 ${
            faceSize < 300 ? 'p-2' : 'p-3'
          } backdrop-blur-sm rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-accent shadow-lg`}
          style={{
            backgroundColor: theme === 'light' 
              ? 'rgba(200, 200, 200, 0.8)' 
              : 'rgba(17, 34, 64, 0.9)',
            border: theme === 'light'
              ? '1px solid rgba(160, 160, 160, 0.4)'
              : '1px solid rgba(100, 255, 218, 0.2)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = theme === 'light'
              ? 'rgba(8, 145, 178, 0.15)'
              : 'rgba(100, 255, 218, 0.2)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = theme === 'light'
              ? 'rgba(200, 200, 200, 0.8)'
              : 'rgba(17, 34, 64, 0.9)';
          }}
          aria-label={`Next image. Currently showing image ${current + 1} of ${length}`}
          tabIndex={0}
        >
          <svg 
            className={`${faceSize < 300 ? 'w-4 h-4' : 'w-6 h-6'}`}
            style={{ 
              color: theme === 'light' ? '#0891b2' : '#64ffda'
            }}
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>



      {/* Screen reader only live region for announcements */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        Currently viewing 3D cube face {current + 1} of {length}: {images[current].alt}
      </div>
    </div>
  );
} 