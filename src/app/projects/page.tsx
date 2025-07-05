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
    type: 'Web',
    technologies: ['Flutter', 'Firebase', 'Razorpay'],
    liveUrl: 'https://kalpavruksha-hardware.atomsinnovation.com/',
    githubUrl: 'https://github.com/yourusername/project'
  },
  // Add more projects...
]

export default function Projects() {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-[#0a192f] via-[#101a2f] to-[#1a223f]">
      {/* Futuristic background glows */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-pulse-slow z-0"></div>
      <div className="absolute bottom-0 right-0 w-[32vw] h-[32vw] bg-secondary/20 rounded-full blur-3xl animate-pulse-slow z-0"></div>
      <div className="container mx-auto px-4 py-16 relative z-10">
        {/* Header Section */}
        <div className="text-center mb-16 mt-16">
          <h1 className="text-5xl md:text-6xl font-bold pb-4 bg-gradient-to-r from-[#64ffda] via-blue-400 to-purple-500 text-transparent bg-clip-text animate-gradient drop-shadow-[0_2px_24px_rgba(100,255,218,0.25)]">
            My Projects
          </h1>
          <p className="text-xl md:text-2xl max-w-3xl mx-auto bg-gradient-to-r from-blue-200 via-[#64ffda]/90 to-blue-200 text-transparent bg-clip-text animate-gradient">
            Here&apos;s a showcase of my recent work in web and mobile app development.
          </p>
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {projects.map((project) => (
            <div
              key={project.id}
              className="group relative overflow-hidden rounded-2xl transition-all duration-500 transform hover:scale-[1.03] shadow-2xl border border-accent/20 bg-[#101a2f]/80 backdrop-blur-lg"
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
        {projects.length === 0 && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4 animate-bounce">📂</div>
            <h3 className="text-xl text-[#64ffda] mb-2">No projects found</h3>
            <p className="text-gray-400">Try adjusting your filter criteria</p>
          </div>
        )}

        {/* Project Modal */}
        {selectedProject && (
          <div 
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 md:p-8"
            onClick={() => setSelectedProject(null)}
          >
            <div 
              className="bg-gradient-to-br from-[#112240] via-[#112240] to-[#0a192f] rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto relative shadow-2xl border border-[#233554]/30"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Content */}
              <div className="p-6 md:p-8 lg:p-10">
                {/* Close Button */}
                <button 
                  onClick={() => setSelectedProject(null)}
                  className="absolute top-4 right-4 z-10 text-gray-400 hover:text-[#64ffda] transition-colors bg-[#0a192f]/50 hover:bg-[#0a192f]/80 rounded-full p-2"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>

                {/* Desktop Layout */}
                <div className="hidden md:grid md:grid-cols-2 md:gap-8 lg:gap-12">
                  {/* Left Column - Image */}
                  <div className="relative aspect-video rounded-xl overflow-hidden">
                    <Image
                      src={selectedProject.image}
                      alt={selectedProject.title}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0a192f]/50 via-transparent to-transparent"></div>
                  </div>

                  {/* Right Column - Content */}
                  <div className="flex flex-col justify-center">
                    <h2 className="text-3xl lg:text-4xl font-bold mb-4 bg-gradient-to-r from-[#64ffda] via-blue-400 to-purple-500 text-transparent bg-clip-text animate-gradient">
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

                    <p className="text-gray-300 mb-6 leading-relaxed text-lg">
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
                            className="px-3 py-2 rounded-lg text-sm bg-[#233554] text-[#64ffda] font-medium"
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
                        className="flex-1 bg-gradient-to-r from-[#64ffda] to-blue-400 text-[#0a192f] hover:from-blue-400 hover:to-[#64ffda] transition-all duration-500 text-center py-3 rounded-lg font-medium inline-flex items-center justify-center"
                      >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                        View Live Demo
                      </a>
                      <a
                        href={selectedProject.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 bg-[#233554] text-[#64ffda] hover:bg-[#233554]/80 transition-all duration-500 text-center py-3 rounded-lg font-medium inline-flex items-center justify-center"
                      >
                        <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                        </svg>
                        View Source Code
                      </a>
                    </div>
                  </div>
                </div>

                {/* Mobile Layout */}
                <div className="md:hidden">
                  {/* Project Image */}
                  <div className="relative aspect-video mb-6 rounded-xl overflow-hidden">
                    <Image
                      src={selectedProject.image}
                      alt={selectedProject.title}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0a192f]/50 via-transparent to-transparent"></div>
                  </div>

                  {/* Project Info */}
                  <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-[#64ffda] via-blue-400 to-purple-500 text-transparent bg-clip-text animate-gradient">
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
          </div>
        )}
      </div>
    </div>
  )
} 