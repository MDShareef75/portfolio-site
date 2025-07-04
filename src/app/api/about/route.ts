import { NextResponse } from 'next/server'

const skills = [
  { name: 'React', level: 'Advanced', category: 'Frontend', icon: '⚛️' },
  { name: 'Next.js', level: 'Advanced', category: 'Frontend', icon: '▲' },
  { name: 'TypeScript', level: 'Advanced', category: 'Frontend', icon: '📘' },
  { name: 'Node.js', level: 'Advanced', category: 'Backend', icon: '🟢' },
  { name: 'Python', level: 'Advanced', category: 'Backend', icon: '🐍' },
  { name: 'Java', level: 'Advanced', category: 'Backend', icon: '☕' },
  { name: 'Spring Boot', level: 'Advanced', category: 'Backend', icon: '🌱' },
  { name: 'React Native', level: 'Advanced', category: 'Mobile', icon: '📱' },
  { name: 'Flutter', level: 'Intermediate', category: 'Mobile', icon: '💙' },
  { name: 'Docker', level: 'Intermediate', category: 'DevOps', icon: '🐳' },
  { name: 'AWS', level: 'Intermediate', category: 'DevOps', icon: '☁️' },
  { name: 'Git', level: 'Advanced', category: 'Tools', icon: '📚' },
  { name: 'MongoDB', level: 'Advanced', category: 'Backend', icon: '🍃' },
  { name: 'PostgreSQL', level: 'Advanced', category: 'Backend', icon: '🐘' },
]

const timeline = [
  {
    year: '2024',
    title: 'Full Stack Developer',
    company: 'Appreciate Platforms Private Limited',
    description: 'Currently working on modern web applications using cutting-edge technologies.',
    type: 'work'
  },
  {
    year: '2020-2024',
    title: 'Full Stack Developer',
    company: 'Pace Wisdom Solutions PVT LTD',
    description: 'Led development of enterprise applications, specializing in Java/Spring Boot backend and React frontend.',
    type: 'work'
  }
]

const interests = [
  { icon: '🤖', text: 'Passionate about Artificial Intelligence and Machine Learning' },
  { icon: '🔌', text: 'Interested in Embedded Systems and IoT' },
  { icon: '📱', text: 'Full Stack Development with modern technologies' },
  { icon: '🎯', text: 'Problem Solving and Algorithm Design' },
  { icon: '🔄', text: 'Continuous Learning and Technology Exploration' },
  { icon: '🌱', text: 'Open Source Contribution and Community Building' }
]

const funFacts = [
  { icon: '☕', text: 'Fueled by coffee and creativity' },
  { icon: '🌙', text: 'Night owl - best code happens after 10 PM' },
  { icon: '🎮', text: 'Gaming enthusiast - strategy games are my favorite' },
  { icon: '📚', text: 'Continuous learner - always exploring new technologies' },
  { icon: '🎵', text: 'Code better with lo-fi music' },
  { icon: '🌱', text: 'Passionate about sustainable tech solutions' }
]

export async function GET() {
  return NextResponse.json({ skills, timeline, interests, funFacts })
} 