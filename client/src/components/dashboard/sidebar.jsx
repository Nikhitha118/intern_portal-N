import {
  LayoutDashboard,
  Briefcase,
  FileText,
  Calendar,
  Bell,
  Settings,
} from "lucide-react"

const menu = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Internships",
    icon: Briefcase,
  },
  {
    title: "Reports",
    icon: FileText,
  },
  {
    title: "Schedule",
    icon: Calendar,
  },
  {
    title: "Notifications",
    icon: Bell,
  },
  {
    title: "Settings",
    icon: Settings,
  },
]

export function Sidebar() {
  return (
    <aside className="w-64 bg-[#0f172a] border-r border-gray-800 hidden lg:flex flex-col">

      <div className="p-6 border-b border-gray-800">
        <h1 className="text-2xl font-bold text-white">
          Intern Portal
        </h1>
      </div>

      <div className="flex-1 p-4 space-y-2">

        {menu.map((item, index) => {
          const Icon = item.icon

          return (
            <button
              key={index}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-300 hover:bg-[#1e293b] hover:text-white transition"
            >
              <Icon size={20} />

              <span>{item.title}</span>
            </button>
          )
        })}

      </div>
    </aside>
  )
}