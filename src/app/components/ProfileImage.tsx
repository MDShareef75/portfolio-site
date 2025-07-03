'use client'

import Image from 'next/image'

export default function ProfileImage() {
  return (
    <div className="relative w-32 h-32 md:w-40 md:h-40 mx-auto animate-fade-in">
      <div className="absolute inset-[-15%] bg-gradient-to-br from-[#64ffda]/20 to-blue-500/20 rounded-2xl blur-xl opacity-75 animate-pulse"></div>
      <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-2xl transform hover:scale-105 transition-transform duration-300">
        <Image
          src="/images/IMG_0609.jpg"
          alt="Mohammed Shareef"
          fill
          className="object-cover object-center"
          sizes="(max-width: 768px) 128px, 160px"
          priority
        />
      </div>
    </div>
  )
} 