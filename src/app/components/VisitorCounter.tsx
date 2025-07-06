'use client'

import useSWR from 'swr'
import { useTheme } from '../context/ThemeContext'
import { useRef, useEffect, useState } from 'react'

const VISITOR_COUNT_URL = 'https://us-central1-atoms-portfolio.cloudfunctions.net/visitorCount';
const fetcher = (url: string) => fetch(url).then(res => res.json())

export default function VisitorCounter() {
  const { theme } = useTheme();
  const { data, error, isLoading } = useSWR(VISITOR_COUNT_URL, fetcher, { revalidateOnFocus: false, refreshInterval: 5000 });
  const [animate, setAnimate] = useState(false);
  const [showPlusOne, setShowPlusOne] = useState(false);
  const prevCount = useRef<number>(0);

  useEffect(() => {
    if (data?.count > prevCount.current) {
      setAnimate(true);
      setShowPlusOne(true);
      const timeout1 = setTimeout(() => setAnimate(false), 600);
      const timeout2 = setTimeout(() => setShowPlusOne(false), 800);
      prevCount.current = data.count;
      return () => {
        clearTimeout(timeout1);
        clearTimeout(timeout2);
      };
    } else if (data?.count !== prevCount.current) {
      prevCount.current = data?.count;
    }
  }, [data?.count]);

  if (isLoading) return <span>Loading visitors...</span>
  if (error) return <span>Could not load visitor count.</span>
  return (
    <span className="relative inline-block" style={{ transition: 'color 0.3s' }}>
      <span
        className={
          `${theme === 'light' ? 'text-[#1e293b] font-semibold' : 'text-accent font-semibold'} ` +
          (animate ? ' animate-pop text-green-500' : '')
        }
      >
        👁️ {data?.count ?? 0} visitors
      </span>
      {showPlusOne && (
        <span className="plus-one-anim absolute -top-4 left-full ml-2 text-green-500 text-base font-bold select-none pointer-events-none">
          +1
        </span>
      )}
    </span>
  )
} 