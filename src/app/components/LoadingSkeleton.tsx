export default function LoadingSkeleton() {
  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-[#0a192f] via-[#101a2f] to-[#1a223f]">
      {/* Background glows */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-pulse-slow z-0"></div>
      <div className="absolute bottom-0 right-0 w-[32vw] h-[32vw] bg-secondary/20 rounded-full blur-3xl animate-pulse-slow z-0"></div>
      
      <div className="container mx-auto px-4 py-16 relative z-10">
        {/* Header skeleton */}
        <div className="text-center mb-16 mt-16">
          <div className="h-16 bg-gradient-to-r from-accent/20 to-secondary/20 rounded-lg animate-pulse mb-4 max-w-md mx-auto"></div>
          <div className="h-8 bg-gradient-to-r from-gray-600/20 to-gray-500/20 rounded-lg animate-pulse max-w-2xl mx-auto"></div>
        </div>

        {/* Content skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-[#101a2f]/80 backdrop-blur-lg rounded-2xl p-6 border border-accent/20">
              <div className="h-48 bg-gradient-to-r from-accent/10 to-secondary/10 rounded-lg animate-pulse mb-4"></div>
              <div className="h-6 bg-gradient-to-r from-accent/20 to-secondary/20 rounded animate-pulse mb-3"></div>
              <div className="h-4 bg-gradient-to-r from-gray-600/20 to-gray-500/20 rounded animate-pulse mb-2"></div>
              <div className="h-4 bg-gradient-to-r from-gray-600/20 to-gray-500/20 rounded animate-pulse mb-4 w-3/4"></div>
              <div className="flex gap-2 mb-4">
                <div className="h-6 w-16 bg-gradient-to-r from-accent/20 to-secondary/20 rounded animate-pulse"></div>
                <div className="h-6 w-20 bg-gradient-to-r from-accent/20 to-secondary/20 rounded animate-pulse"></div>
              </div>
              <div className="h-10 bg-gradient-to-r from-accent/20 to-secondary/20 rounded-lg animate-pulse"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
} 