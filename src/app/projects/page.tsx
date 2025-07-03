'use client'

import { useState } from 'react'
import Image from 'next/image'

const categories = ['All', 'E-commerce', 'Web App', 'Mobile App', 'AI/ML']
const types = ['All', 'Web', 'Mobile', 'Desktop']

interface Project {
  id: number
  title: string
  description: string
  image: string
  category: string
  type: string
  technologies: string[]
  liveUrl: string
  githubUrl: string
}

const projects: Project[] = [
  {
    id: 1,
    title: 'Kalpavrksha Hardware',
    description: 'A comprehensive e-commerce platform for hardware products built with Flutter and Firebase. Features include secure payments via Razorpay, cloud storage, real-time inventory management, and an admin dashboard.',
    image: '/images/KHC.jpg',
    category: 'E-commerce',
    type: 'Mobile App',
    technologies: ['Flutter', 'Firebase', 'Razorpay'],
    liveUrl: 'https://play.google.com/store/apps/details?id=com.kalpavrksha.hardware',
    githubUrl: 'https://github.com/yourusername/project'
  },
  // Add more projects...
]

export default function Projects() {
  const [activeCategory, setActiveCategory] = useState('All')
  const [activeType, setActiveType] = useState('All')
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)

  const filteredProjects = projects.filter(project => {
    const matchesCategory = activeCategory === 'All' || project.category === activeCategory
    const matchesType = activeType === 'All' || project.type === activeType
    return matchesCategory && matchesType
  })

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="container mx-auto px-4 py-16 relative">
        {/* Header Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-[#64ffda] via-blue-400 to-purple-500 text-transparent bg-clip-text animate-gradient">
            My Projects
          </h1>
          <p className="text-xl md:text-2xl max-w-3xl mx-auto bg-gradient-to-r from-blue-200 via-[#64ffda]/90 to-blue-200 text-transparent bg-clip-text animate-gradient">
            Here&apos;s a showcase of my recent work in web and mobile app development.
          </p>
        </div>

        {/* Filters Section */}
        <div className="max-w-4xl mx-auto mb-12">
          {/* Category Filter */}
          <div className="mb-8">
            <h3 className="text-2xl font-semibold mb-4 text-center bg-gradient-to-r from-[#64ffda] to-blue-400 text-transparent bg-clip-text">
              Filter by Category
            </h3>
            <div className="flex flex-wrap justify-center gap-3">
              {categories.map(category => (
                <button
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  className={`px-6 py-2 rounded-full transition-all duration-500 transform hover:scale-105 ${
                    activeCategory === category
                      ? 'bg-gradient-to-r from-[#64ffda] to-blue-400 text-[#0a192f] font-semibold shadow-lg shadow-[#64ffda]/20'
                      : 'bg-[#112240]/30 text-gray-300 hover:bg-[#112240]/50 hover:text-[#64ffda] border border-[#233554]/50'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* Type Filter */}
          <div className="mb-8">
            <h3 className="text-2xl font-semibold mb-4 text-center bg-gradient-to-r from-blue-400 to-[#64ffda] text-transparent bg-clip-text">
              Filter by Type
            </h3>
            <div className="flex flex-wrap justify-center gap-3">
              {types.map(type => (
                <button
                  key={type}
                  onClick={() => setActiveType(type)}
                  className={`px-6 py-2 rounded-full transition-all duration-500 transform hover:scale-105 ${
                    activeType === type
                      ? 'bg-gradient-to-r from-blue-400 to-[#64ffda] text-[#0a192f] font-semibold shadow-lg shadow-[#64ffda]/20'
                      : 'bg-[#112240]/30 text-gray-300 hover:bg-[#112240]/50 hover:text-[#64ffda] border border-[#233554]/50'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {filteredProjects.map((project) => (
            <div
              key={project.id}
              className="group relative overflow-hidden rounded-2xl transition-all duration-500 transform hover:scale-[1.02]"
            >
              {/* Card Background with Gradient */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#112240]/90 via-[#112240] to-[#0a192f] opacity-90"></div>
              
              {/* Project Type Tags */}
              <div className="absolute top-4 left-4 flex gap-2 z-20">
                <span className="px-3 py-1 rounded-full text-sm bg-[#64ffda] text-[#0a192f] font-medium">
                  {project.type}
                </span>
                <span className="px-3 py-1 rounded-full text-sm bg-blue-400/90 text-[#0a192f] font-medium">
                  {project.category}
                </span>
              </div>

              {/* Project Image */}
              <div className="relative aspect-video">
                <Image
                  src={project.image}
                  alt={project.title}
                  fill
                  className="object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a192f] via-transparent to-transparent"></div>
              </div>

              {/* Project Info */}
              <div className="relative p-6 z-10">
                <h3 className="text-2xl font-bold mb-2 bg-gradient-to-r from-[#64ffda] via-blue-400 to-[#64ffda] text-transparent bg-clip-text group-hover:animate-gradient">
                  {project.title}
                </h3>
                <p className="text-gray-300 mb-4 line-clamp-3">
                  {project.description}
                </p>

                {/* Technologies */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {project.technologies.map((tech, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 rounded-md text-sm bg-[#233554]/50 text-[#64ffda]"
                    >
                      {tech}
                    </span>
                  ))}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <a
                    href={project.liveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 bg-gradient-to-r from-[#64ffda] to-blue-400 text-[#0a192f] hover:from-blue-400 hover:to-[#64ffda] transition-all duration-500 text-center group inline-flex items-center justify-center text-sm py-2 rounded-lg font-medium"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    Live Demo
                  </a>
                  <button
                    onClick={() => setSelectedProject(project)}
                    className="bg-[#233554] text-[#64ffda] hover:bg-[#233554]/80 transition-all duration-500 text-center group inline-flex items-center justify-center text-sm py-2 px-4 rounded-lg font-medium"
                  >
                    Details
                  </button>
                </div>
              </div>

              {/* Hover Gradient Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-[#64ffda]/10 via-blue-400/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
            </div>
          ))}
        </div>

        {/* No Projects Message */}
        {filteredProjects.length === 0 && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4 animate-bounce">📂</div>
            <h3 className="text-xl text-[#64ffda] mb-2">No projects found</h3>
            <p className="text-gray-400">Try adjusting your filter criteria</p>
          </div>
        )}

        {/* Project Modal */}
        {selectedProject && (
          <div 
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedProject(null)}
          >
            <div 
              className="bg-[#112240] rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto relative"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Content */}
              <div className="p-8">
                {/* Close Button */}
                <button 
                  onClick={() => setSelectedProject(null)}
                  className="absolute top-4 right-4 text-gray-400 hover:text-[#64ffda] transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>

                {/* Project Image */}
                <div className="relative aspect-video mb-6 rounded-xl overflow-hidden">
                  <Image
                    src={selectedProject.image}
                    alt={selectedProject.title}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0a192f] via-transparent to-transparent"></div>
                </div>

                {/* Project Info */}
                <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-[#64ffda] via-blue-400 to-purple-500 text-transparent bg-clip-text animate-gradient">
                  {selectedProject.title}
                </h2>

                <div className="flex flex-wrap gap-2 mb-6">
                  <span className="px-3 py-1 rounded-full text-sm bg-[#64ffda] text-[#0a192f] font-medium">
                    {selectedProject.type}
                  </span>
                  <span className="px-3 py-1 rounded-full text-sm bg-blue-400/90 text-[#0a192f] font-medium">
                    {selectedProject.category}
                  </span>
                </div>

                <p className="text-gray-300 mb-8 leading-relaxed">
                  {selectedProject.description}
                </p>

                <div className="mb-8">
                  <h3 className="text-xl font-semibold mb-4 bg-gradient-to-r from-[#64ffda] to-blue-400 text-transparent bg-clip-text">
                    Technologies Used
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedProject.technologies.map((tech, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 rounded-lg text-sm bg-[#233554] text-[#64ffda]"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex gap-4">
                  <a
                    href={selectedProject.liveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 bg-gradient-to-r from-[#64ffda] to-blue-400 text-[#0a192f] hover:from-blue-400 hover:to-[#64ffda] transition-all duration-500 text-center py-3 rounded-lg font-medium"
                  >
                    View Live Demo
                  </a>
                  <a
                    href={selectedProject.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 bg-[#233554] text-[#64ffda] hover:bg-[#233554]/80 transition-all duration-500 text-center py-3 rounded-lg font-medium"
                  >
                    View Source Code
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 