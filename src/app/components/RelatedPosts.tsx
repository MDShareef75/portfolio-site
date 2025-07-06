'use client'

import Link from 'next/link'
import Image from 'next/image'
import { blogPosts, BlogPost } from '../blog/data'

interface RelatedPostsProps {
  currentPost: BlogPost
  maxPosts?: number
}

export default function RelatedPosts({ currentPost, maxPosts = 3 }: RelatedPostsProps) {
  // Find related posts based on category and tags
  const relatedPosts = blogPosts
    .filter(post => post.id !== currentPost.id) // Exclude current post
    .filter(post => {
      // Check if posts share the same category
      const sameCategory = post.category === currentPost.category
      
      // Check if posts share any tags
      const sharedTags = post.tags.some(tag => 
        currentPost.tags.includes(tag)
      )
      
      return sameCategory || sharedTags
    })
    .sort((a, b) => {
      // Prioritize posts with same category
      const aSameCategory = a.category === currentPost.category
      const bSameCategory = b.category === currentPost.category
      
      if (aSameCategory && !bSameCategory) return -1
      if (!aSameCategory && bSameCategory) return 1
      
      // Then prioritize by number of shared tags
      const aSharedTags = a.tags.filter(tag => currentPost.tags.includes(tag)).length
      const bSharedTags = b.tags.filter(tag => currentPost.tags.includes(tag)).length
      
      return bSharedTags - aSharedTags
    })
    .slice(0, maxPosts)

  if (relatedPosts.length === 0) {
    return null
  }

  return (
    <div className="mt-16 p-8 bg-[#101a2f]/80 backdrop-blur-lg rounded-2xl border border-accent/20">
      <h3 className="text-2xl font-bold text-white mb-6">Related Articles</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {relatedPosts.map((post) => (
          <Link
            key={post.id}
            href={`/blog/${post.id}`}
            className="group block bg-[#112240]/50 rounded-xl overflow-hidden hover:bg-[#112240]/70 transition-all duration-300 transform hover:scale-105"
          >
            <div className="aspect-video relative">
              <Image
                src={post.image}
                alt={post.title}
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a192f] via-transparent to-transparent"></div>
              <div className="absolute top-3 left-3">
                <span className="px-2 py-1 bg-[#64ffda] text-[#0a192f] text-xs rounded-full font-medium">
                  {post.category}
                </span>
              </div>
            </div>
            <div className="p-4">
              <h4 className="text-lg font-semibold text-white mb-2 group-hover:text-[#64ffda] transition-colors duration-300 line-clamp-2">
                {post.title}
              </h4>
              <p className="text-gray-400 text-sm mb-3 line-clamp-2">
                {post.excerpt}
              </p>
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>{post.date}</span>
                <span>{post.readTime}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
} 