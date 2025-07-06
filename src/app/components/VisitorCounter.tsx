'use client'

import useSWR from 'swr'
import { useTheme } from '../context/ThemeContext'

const VISITOR_COUNT_URL = 'https://us-central1-atoms-portfolio.cloudfunctions.net/visitorCount';
const fetcher = (url: string) => fetch(url).then(res => res.json())

export default function VisitorCounter() {
  const { theme } = useTheme();
  const { data, error, isLoading } = useSWR(VISITOR_COUNT_URL, fetcher, { revalidateOnFocus: false })
  if (isLoading) return <span>Loading visitors...</span>
  if (error) return <span>Could not load visitor count.</span>
  return <span className={theme === 'light' ? 'text-[#1e293b] font-semibold' : 'text-accent font-semibold'}>👁️ {data?.count ?? 0} visitors</span>
} 