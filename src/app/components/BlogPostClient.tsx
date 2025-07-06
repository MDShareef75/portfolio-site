'use client'
import Image from 'next/image'
import Link from 'next/link'
import { useTheme } from '../context/ThemeContext'
import SocialShare from './SocialShare'
import RelatedPosts from './RelatedPosts'
import type { BlogPost } from '../blog/data'

export default function BlogPostClient({ post }: { post: BlogPost }) {
  const { theme } = useTheme();
  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="container mx-auto px-4 py-16 relative">
        <article className="max-w-4xl mx-auto">
          {/* Header */}
          <header className="mb-12">
            <h1 className={`text-3xl md:text-5xl font-bold mb-6 text-center transition-colors duration-500 ${theme === 'light' ? 'text-[#1e293b]' : 'text-[#e2e8f0]'}`}>{post.title}</h1>
            <div className="flex flex-wrap items-center gap-4 text-gray-400 mb-8">
              <div className="flex items-center">
                <span className="text-[#64ffda]">{post.author}</span>
              </div>
              <span>•</span>
              <div>{post.date}</div>
              <span>•</span>
              <div>{post.readTime}</div>
            </div>
            {/* Featured Image */}
            <div className="relative aspect-[2/1] rounded-2xl overflow-hidden mb-8">
              <Image
                src={post.image}
                alt={post.title}
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a192f] via-transparent to-transparent"></div>
            </div>
            {/* Tags */}
            <div className={`mb-6 flex flex-wrap gap-2 justify-center`}>
              {post.tags.map((tag: string, index: number) => (
                <span
                  key={index}
                  className={`px-3 py-1 rounded-full text-sm font-medium ${theme === 'light' ? 'bg-[var(--accent)] text-[var(--background)]' : 'bg-[#64ffda] text-[#0a192f]'}`}
                >
                  {tag}
                </span>
              ))}
            </div>
          </header>
          {/* Content */}
          <div className={`rounded-2xl shadow-xl p-8 md:p-12 mb-12 max-w-3xl mx-auto relative z-10 bg-[var(--surface)]/80 border border-[var(--accent)]/10 backdrop-blur-lg transition-colors duration-500`}>
            <div className={`prose prose-lg max-w-none transition-colors duration-500 ${theme === 'light' ? 'text-[#1e293b]' : 'text-[#cbd5e1]'}`}>
              {post.content.split('\n').map((paragraph: string, index: number) => (
                paragraph.trim() && (
                  <p 
                    key={index}
                    className="mb-4 leading-relaxed last:mb-0"
                  >
                    {paragraph.trim()}
                  </p>
                )
              ))}
            </div>
          </div>
          {/* Social Sharing */}
          <div className="mt-12 p-6 bg-[#101a2f]/80 backdrop-blur-lg rounded-2xl border border-accent/20">
            <SocialShare
              url={`${process.env.NEXT_PUBLIC_SITE_URL || 'https://atomsinnovation.com'}/blog/${post.id}`}
              title={post.title}
              description={post.excerpt}
              hashtags={post.tags}
            />
          </div>
          {/* Related Posts */}
          <RelatedPosts currentPost={post} />
          {/* Navigation */}
          <div className="mt-12 flex justify-between items-center">
            <Link
              href="/blog"
              className="inline-flex items-center text-[#64ffda] hover:text-blue-400 transition-colors duration-300"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Blog
            </Link>
          </div>
        </article>
      </div>
    </div>
  )
} 