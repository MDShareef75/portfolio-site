'use client'

import useSWR from 'swr'

const VISITOR_COUNT_URL = 'https://us-central1-atoms-portfolio.cloudfunctions.net/visitorCount';
const fetcher = (url: string) => fetch(url).then(res => res.json())

export default function VisitorCounter() {
  const { data, error, isLoading } = useSWR(VISITOR_COUNT_URL, fetcher, { revalidateOnFocus: false })
  if (isLoading) return <span>Loading visitors...</span>
  if (error) return <span>Could not load visitor count.</span>
  return <span>👁️ {data?.count ?? 0} visitors</span>
} 