import { useParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { blogPosts } from '../data'
import type { BlogPost } from '../data'
import SocialShare from '../../components/SocialShare'
import RelatedPosts from '../../components/RelatedPosts'
import BlogPostClient from '../../components/BlogPostClient'

export function generateStaticParams() {
  return blogPosts.map(post => ({ id: post.id.toString() }))
}

export default async function BlogPost({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const post = blogPosts.find(post => post.id.toString() === resolvedParams.id)
  
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
  return <BlogPostClient post={post} />
} 