import "./globals.css"
import Providers from "./providers"

export const metadata = {
  title: "InternPortal",
  description: "Smart Internship Workflow and Evaluation Portal",
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          padding: 0,
          overflowX: "hidden",
        }}
      >
        {/* Video Background */}
        <video
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            objectFit: "cover",
            zIndex: -2,
            pointerEvents: "none",
          }}
        >
          <source src="/bg.mp4" type="video/mp4" />
        </video>

        {/* Overlay */}
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(2, 6, 23, 0.15)",
            zIndex: -1,
            pointerEvents: "none",
          }}
        />

        {/* App Content */}
        <Providers>
          <div
            id="app-root"
            style={{
              position: "relative",
              zIndex: 1,
              width: "100%",
              minHeight: "100vh",
            }}
          >
            {children}
          </div>
        </Providers>
      </body>
    </html>
  )
}