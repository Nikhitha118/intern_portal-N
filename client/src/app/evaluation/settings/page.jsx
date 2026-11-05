"use client"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
export default function EvalPage() {
  const router = useRouter()
  useEffect(() => { router.replace("/admin/dashboard?tab=settings") }, [router])
  return <div style={{width:"100vw",height:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:"#050816",color:"white"}}>Loading…</div>
}
