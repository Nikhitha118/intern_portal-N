"use client"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
export default function MentorSubPage() {
  const router = useRouter()
  useEffect(() => { router.replace("/mentor/dashboard?tab=submissions") }, [router])
  return <div style={{width:"100vw",height:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:"#050816",color:"white",fontSize:"14px"}}>Loading…</div>
}
