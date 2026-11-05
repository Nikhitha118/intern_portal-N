/** Lucide icon maps — use instead of emoji across portals */
import {
  Briefcase, FileText, Star, Calendar, Trophy, Settings, Megaphone, Bell,
  Building2, BarChart3, CheckCircle, Users, Shield, User, Lock, ClipboardList,
  Code2, Monitor, Database, Cog, FlaskConical, GraduationCap, UserCheck,
} from "lucide-react"

export const NOTIF_TYPE_ICONS = {
  internship: Briefcase,
  document: FileText,
  evaluation: Star,
  calendar: Calendar,
  certificate: Trophy,
  system: Settings,
  announcement: Megaphone,
}

export const ACTIVITY_MODULE_ICONS = {
  Authentication: Lock,
  Internships: Briefcase,
  Documents: FileText,
  Departments: Building2,
  Reports: BarChart3,
  Settings: Settings,
  "User Management": Users,
}

export const TASK_CAT_ICONS = {
  Backend: Code2,
  Frontend: Monitor,
  Database: Database,
  Documentation: FileText,
  DevOps: Cog,
  Testing: FlaskConical,
  "Full Stack": Code2,
  "Data Structures": Database,
  Algorithms: Code2,
  Security: Shield,
}

export function renderNotifIcon(type, color = "#6366F1", size = 16) {
  const Icon = NOTIF_TYPE_ICONS[type] || Bell
  return <Icon size={size} color={color} strokeWidth={2} />
}

export function renderActivityIcon(module, size = 14) {
  const Icon = ACTIVITY_MODULE_ICONS[module] || ClipboardList
  return <Icon size={size} color="#a5b4fc" strokeWidth={2} />
}

export function renderCatIcon(cat, size = 14, color) {
  const Icon = TASK_CAT_ICONS[cat]
  if (!Icon) return <ClipboardList size={size} color={color || "#94a3b8"} strokeWidth={2} />
  return <Icon size={size} color={color || "#94a3b8"} strokeWidth={2} />
}
