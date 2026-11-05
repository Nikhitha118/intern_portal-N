"use client"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
export default function InstPage() {
  const router = useRouter()
  useEffect(() => { router.replace("/institution/dashboard?tab=completion") }, [router])
  return <div style={{width:"100vw",height:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:"#050816",color:"white"}}>Loading…</div>
}
