"use client"

export default function MentorLayout({ children }) {
  return (
    <div className="relative min-h-screen">

      {/* Background Video */}
      <video
        autoPlay
        muted
        loop
        playsInline
        className="fixed inset-0 w-full h-full object-cover -z-20"
      >
        <source src="/videos/mentor-bg.mp4" type="video/mp4" />
      </video>

      {/* Overlay */}
      <div className="fixed inset-0 bg-black/30 -z-10"></div>

      {/* Content */}
      <main className="relative z-10 min-h-screen">
        {children}
      </main>

    </div>
  )
}