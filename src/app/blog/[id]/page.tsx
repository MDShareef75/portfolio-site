import { useParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { blogPosts } from '../data'
import type { BlogPost } from '../data'

export function generateStaticParams() {
  return blogPosts.map(post => ({ id: post.id.toString() }))
}

export default function BlogPost({ params }: { params: { id: string } }) {
  const post = blogPosts.find(post => post.id.toString() === params.id)

  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-[#64ffda] mb-4">Post Not Found</h1>
          <Link 
            href="/blog"
            className="text-gray-300 hover:text-[#64ffda] transition-colors duration-300"
          >
            Back to Blog
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="container mx-auto px-4 py-16 relative">
        <article className="max-w-4xl mx-auto">
          {/* Header */}
          <header className="mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-[#64ffda] via-blue-400 to-purple-500 text-transparent bg-clip-text animate-gradient">
              {post.title}
            </h1>
            
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
            <div className="flex flex-wrap gap-2 mb-8">
              {post.tags.map((tag: string, index: number) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-[#233554]/50 text-[#64ffda] rounded-full text-sm"
                >
                  {tag}
                </span>
              ))}
            </div>
          </header>

          {/* Content */}
          <div className="prose prose-invert prose-lg max-w-none">
            <div className="glassmorphism-card p-8 rounded-2xl">
              {post.content.split('\n').map((paragraph: string, index: number) => (
                paragraph.trim() && (
                  <p 
                    key={index}
                    className="text-gray-300 mb-4 leading-relaxed last:mb-0"
                  >
                    {paragraph.trim()}
                  </p>
                )
              ))}
            </div>
          </div>

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