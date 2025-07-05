export interface BlogPost {
  id: number
  title: string
  excerpt: string
  content: string
  image: string
  category: string
  tags: string[]
  author: string
  date: string
  readTime: string
}

export const blogPosts: BlogPost[] = [
  {
    id: 1,
    title: 'Getting Started with Next.js 13 App Router',
    excerpt: 'A beginner-friendly guide to building modern web apps with the new Next.js 13 App Router.',
    content: `Next.js 13 introduces the new App Router, a powerful way to structure your application with nested layouts, server components, and more. In this article, we'll walk through setting up a new project, creating pages, and leveraging the latest features for a scalable, maintainable codebase.

Key topics:
- Project setup
- File-based routing
- Layouts and templates
- Server vs. client components
- Data fetching strategies

By the end, you'll have a solid foundation for building with Next.js 13!`,
    image: '/images/nextjs_blog.png',
    category: 'Web Dev',
    tags: ['Next.js', 'React', 'Web Development'],
    author: 'Mohammed Shareef',
    date: '2024-06-01',
    readTime: '7 min read',
  },
  {
    id: 2,
    title: 'Flutter vs React Native: Which Should You Choose?',
    excerpt: 'A deep dive into the pros and cons of Flutter and React Native for cross-platform mobile development.',
    content: `Choosing between Flutter and React Native can be tough. Both frameworks offer fast development, hot reload, and a large ecosystem. In this post, we'll compare:

- Performance
- Developer experience
- Community support
- Platform capabilities

We'll also look at real-world use cases to help you decide which is best for your next mobile app project.`,
    image: '/images/fluttervsreactnative_blog.png',
    category: 'Mobile Dev',
    tags: ['Flutter', 'React Native', 'Mobile'],
    author: 'Mohammed Shareef',
    date: '2024-05-20',
    readTime: '6 min read',
  },
  {
    id: 3,
    title: 'Integrating AI into Your Web Apps',
    excerpt: 'How to add AI-powered features to your web applications using modern APIs and frameworks.',
    content: `AI is transforming the web! In this article, we'll explore:

- Using OpenAI and Hugging Face APIs
- Building chatbots and recommendation engines
- Ethical considerations
- Deployment best practices

You'll learn how to bring intelligent features to your apps with minimal effort.`,
    image: '/images/aiwebapps_blog.png',
    category: 'AI/ML',
    tags: ['AI', 'Machine Learning', 'Web'],
    author: 'Mohammed Shareef',
    date: '2024-05-10',
    readTime: '8 min read',
  },
  {
    id: 4,
    title: 'DevOps for Developers: CI/CD Made Easy',
    excerpt: 'A practical guide to setting up continuous integration and deployment pipelines for your projects.',
    content: `DevOps isn't just for ops engineers! Learn how to:

- Set up GitHub Actions
- Automate testing and deployment
- Monitor your apps in production

We'll cover tools and workflows that help you ship faster and with confidence.`,
    image: '/images/devopscicd_blog.png',
    category: 'DevOps',
    tags: ['DevOps', 'CI/CD', 'Automation'],
    author: 'Mohammed Shareef',
    date: '2024-04-28',
    readTime: '5 min read',
  },
  {
    id: 5,
    title: 'Node.js Best Practices for Modern Apps',
    excerpt: 'Tips and tricks for writing clean, efficient, and scalable Node.js code.',
    content: `Node.js powers millions of apps. In this post, we'll share best practices for:

- Project structure
- Error handling
- Performance optimization
- Security

Whether you're a beginner or a seasoned dev, these tips will help you build better Node.js applications.`,
    image: '/images/nodejsbestpractices_blog.png',
    category: 'Web Dev',
    tags: ['Node.js', 'JavaScript', 'Backend'],
    author: 'Mohammed Shareef',
    date: '2024-04-15',
    readTime: '6 min read',
  },
] 