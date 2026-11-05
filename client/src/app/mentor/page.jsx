"use client"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
export default function MentorRedirect() {
  const router = useRouter()
  useEffect(() => { router.replace("/mentor/dashboard") }, [router])
  return <div style={{ width:"100vw", height:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background:"#050816", color:"white" }}>Loading…</div>
}
