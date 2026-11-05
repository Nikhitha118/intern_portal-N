"use client"

export default function InstitutionLayout({ children }) {
  return (
    <div className="relative min-h-screen">
      <video
        autoPlay
        muted
        loop
        playsInline
        className="fixed inset-0 h-full w-full object-cover"
        style={{ zIndex: -20 }}
      >
        <source src="/videos/institution-bg.mp4" type="video/mp4" />
      </video>
      <div className="fixed inset-0 bg-black/55" style={{ zIndex: -10 }} />
      <main className="relative z-10 min-h-screen">{children}</main>
    </div>
  )
}
