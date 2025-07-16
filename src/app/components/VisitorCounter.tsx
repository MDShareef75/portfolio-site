'use client'

import useSWR from 'swr'
import { useTheme } from '../context/ThemeContext'
import { useRef, useEffect, useState } from 'react'

const VISITOR_COUNT_URL = 'https://us-central1-atoms-portfolio.cloudfunctions.net/visitorCount';
const fetcher = (url: string) => fetch(url).then(res => res.json())

// Rolling number component for smooth digit animation
function RollingDigit({ digit, isAnimating }: { digit: string, isAnimating: boolean }) {
  const [displayDigit, setDisplayDigit] = useState(digit);
  const [isRolling, setIsRolling] = useState(false);

  useEffect(() => {
    if (digit !== displayDigit && isAnimating) {
      setIsRolling(true);
      // Small delay to show rolling animation
      setTimeout(() => {
        setDisplayDigit(digit);
        setTimeout(() => setIsRolling(false), 150);
      }, 100);
    } else {
      setDisplayDigit(digit);
    }
  }, [digit, displayDigit, isAnimating]);

  return (
    <span 
      className={`inline-block transition-all duration-300 ${
        isRolling ? 'animate-roll-up scale-110' : ''
      }`}
      style={{ minWidth: '0.6em', textAlign: 'center' }}
    >
      {displayDigit}
    </span>
  );
}

// Animated number display component
function AnimatedNumber({ number, isAnimating }: { number: number, isAnimating: boolean }) {
  const numberString = number.toString();
  
  return (
    <span className="inline-flex">
      {numberString.split('').map((digit, index) => (
        <RollingDigit 
          key={`${index}-${numberString.length}`} 
          digit={digit} 
          isAnimating={isAnimating}
        />
      ))}
    </span>
  );
}

export default function VisitorCounter() {
  const { theme } = useTheme();
  const { data, error, isLoading } = useSWR(VISITOR_COUNT_URL, fetcher, { 
    revalidateOnFocus: false, 
    refreshInterval: 5000 
  });
  
  const [animate, setAnimate] = useState(false);
  const [showPlusOne, setShowPlusOne] = useState(false);
  const [showPulse, setShowPulse] = useState(false);
  const prevCount = useRef<number>(0);

  useEffect(() => {
    if (data?.count > prevCount.current) {
      setAnimate(true);
      setShowPlusOne(true);
      setShowPulse(true);
      
      const timeout1 = setTimeout(() => setAnimate(false), 800);
      const timeout2 = setTimeout(() => setShowPlusOne(false), 1200);
      const timeout3 = setTimeout(() => setShowPulse(false), 1500);
      
      prevCount.current = data.count;
      
      return () => {
        clearTimeout(timeout1);
        clearTimeout(timeout2);
        clearTimeout(timeout3);
      };
    } else if (data?.count !== prevCount.current) {
      prevCount.current = data?.count;
    }
  }, [data?.count]);

  if (isLoading) {
    return (
      <div className="flex items-center gap-2">
        <div className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full opacity-60"></div>
        <span className="text-sm opacity-75">Loading visitors...</span>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="flex items-center gap-2 text-red-400">
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
        <span className="text-sm">Could not load visitors</span>
      </div>
    );
  }

  return (
    <div className="relative inline-flex items-center gap-2 group">
      {/* Background glow effect */}
      <div className={`absolute -inset-2 rounded-full transition-all duration-500 ${
        showPulse 
          ? 'bg-gradient-to-r from-cyan-500/20 via-blue-500/20 to-purple-500/20 blur-sm scale-110' 
          : 'bg-gradient-to-r from-cyan-500/10 via-blue-500/10 to-purple-500/10 blur-sm opacity-0 group-hover:opacity-100'
      }`}></div>
      
      {/* Main counter container */}
      <div className={`relative flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all duration-300 ${
        'bg-slate-900/80 backdrop-blur-sm border-slate-700/50 shadow-lg'
      } ${showPulse ? 'scale-105 shadow-xl' : 'group-hover:scale-102'}`}>
        
        {/* Eye icon with animation */}
        <div className={`relative transition-all duration-300 ${
          animate ? 'animate-bounce' : 'group-hover:scale-110'
        }`}>
          <svg 
            className={`w-5 h-5 text-cyan-400 ${showPulse ? 'text-cyan-300' : ''}`} 
            fill="currentColor" 
            viewBox="0 0 20 20"
          >
            <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/>
            <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd"/>
          </svg>
          
          {/* Pulse ring on count increase */}
          {showPulse && (
            <div className="absolute inset-0 animate-ping">
              <svg className="w-5 h-5 text-cyan-400 opacity-60" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/>
                <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd"/>
              </svg>
            </div>
          )}
        </div>

        {/* Animated number display */}
        <div className="flex items-center gap-1">
          <span className={`font-bold text-lg leading-none ${
            animate ? 'text-green-400' : 'text-cyan-400'
          } ${showPulse ? 'text-cyan-300' : ''}`}>
            <AnimatedNumber number={data?.count ?? 0} isAnimating={animate} />
          </span>
          
          <span className="text-sm font-medium text-slate-400">
            visitor{(data?.count ?? 0) !== 1 ? 's' : ''}
          </span>
        </div>

        {/* +1 popup animation */}
        {showPlusOne && (
          <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 animate-float-up pointer-events-none">
            <div className="flex items-center gap-1 px-2 py-1 bg-green-500 text-white text-xs font-bold rounded-full shadow-lg">
              <span>+1</span>
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3.293 9.707a1 1 0 010-1.414l6-6a1 1 0 011.414 0l6 6a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L4.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd"/>
              </svg>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 