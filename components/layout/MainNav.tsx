"use client"

import { usePathname, useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { useStudy } from "@/contexts/study-context"
import { useCampaign } from "@/contexts/campaign-context"
import {
  Beaker,
  Users,
  Target,
  FileText,
  Home,
  Upload,
  Filter,
  PhoneCall,
  BarChart3,
  ChevronRight,
  ChevronDown,
  Check
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function MainNav() {
  const pathname = usePathname()
  const router = useRouter()
  const { currentStudy, studies, setCurrentStudy } = useStudy()
  const { campaigns } = useCampaign()

  const studyCampaigns = currentStudy
    ? campaigns.filter(c => c.studyId === currentStudy.id)
    : campaigns

  const navSections = [
    {
      title: "Overview",
      items: [
        {
          name: "Home",
          path: "/",
          icon: Home,
          match: (path: string) => path === "/"
        }
      ]
    },
    {
      title: "Study Setup",
      items: [
        {
          name: "Upload Protocol",
          path: "/ingest",
          icon: Upload,
          match: (path: string) => path === "/ingest" && !path.includes("/patients"),
          description: "Upload & extract protocols"
        },
        {
          name: "Manage Studies",
          path: "/ingest",
          icon: Beaker,
          badge: studies.length,
          match: (path: string) => path === "/ingest" && !path.includes("/patients"),
          description: "View all studies"
        }
      ]
    },
    {
      title: "Patient Recruitment",
      items: [
        {
          name: "Import Patients",
          path: "/ingest/patients",
          icon: Users,
          match: (path: string) => path === "/ingest/patients" && !pathname.includes("[patientId]"),
          description: "Epic or CSV import"
        },
        {
          name: "Pre-Screen",
          path: "/ingest/patients",
          icon: Filter,
          match: (path: string) => path === "/ingest/patients" && !pathname.includes("[patientId]"),
          description: "Screen against criteria"
        }
      ]
    },
    {
      title: "Outreach & Campaigns",
      items: [
        {
          name: "Screening Campaigns",
          path: "/campaigns",
          icon: Target,
          badge: studyCampaigns.length,
          match: (path: string) => path === "/campaigns" && !path.includes("[campaignId]"),
          description: "Manage patient outreach"
        }
      ]
    },
    {
      title: "Reporting",
      items: [
        {
          name: "Analytics",
          path: "/analytics",
          icon: BarChart3,
          match: (path: string) => path === "/analytics",
          description: "View recruitment metrics"
        }
      ]
    }
  ]

  return (
    <aside className="w-64 border-r bg-slate-50 flex flex-col h-screen">
      <div className="p-6 border-b bg-white">
        <div className="flex items-center gap-2 mb-4">
          <FileText className="h-6 w-6 text-blue-600" />
          <h1 className="text-lg font-bold text-slate-900">Nurodot</h1>
        </div>

        {studies.length > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="w-full p-3 bg-blue-50 rounded-lg border border-blue-200 hover:bg-blue-100 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex-1 text-left">
                    <p className="text-xs text-slate-600 mb-1">Current Study</p>
                    {currentStudy ? (
                      <>
                        <p className="text-sm font-semibold text-blue-900">{currentStudy.title}</p>
                        <p className="text-xs text-slate-600 mt-1">{currentStudy.phase}</p>
                      </>
                    ) : (
                      <p className="text-sm font-semibold text-slate-900">Select a study</p>
                    )}
                  </div>
                  <ChevronDown className="h-4 w-4 text-slate-600 flex-shrink-0" />
                </div>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="start">
              {studies.map((study) => (
                <DropdownMenuItem
                  key={study.id}
                  onClick={() => setCurrentStudy(study)}
                  className="flex items-center justify-between cursor-pointer"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{study.title}</p>
                    <p className="text-xs text-slate-600">{study.phase}</p>
                  </div>
                  {currentStudy?.id === study.id && (
                    <Check className="h-4 w-4 text-blue-600 flex-shrink-0 ml-2" />
                  )}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto p-4">
        {navSections.map((section) => (
          <div key={section.title} className="mb-6">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 px-2">
              {section.title}
            </h3>
            <div className="space-y-1">
              {section.items.map((item) => {
                const isActive = item.match(pathname)
                const Icon = item.icon

                return (
                  <button
                    key={`${section.title}-${item.name}`}
                    onClick={() => router.push(item.path)}
                    className={`
                      w-full flex items-start gap-3 px-3 py-2 rounded-lg transition-all
                      ${isActive
                        ? 'bg-blue-100 text-blue-900 font-medium'
                        : 'text-slate-700 hover:bg-slate-100'
                      }
                    `}
                  >
                    <Icon className={`h-5 w-5 mt-0.5 flex-shrink-0 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                    <div className="flex-1 text-left">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">{item.name}</span>
                        {item.badge !== undefined && item.badge > 0 && (
                          <Badge variant="secondary" className="text-xs" suppressHydrationWarning>
                            {item.badge}
                          </Badge>
                        )}
                      </div>
                      {item.description && (
                        <p className="text-xs text-slate-500 mt-0.5">{item.description}</p>
                      )}
                    </div>
                    {isActive && <ChevronRight className="h-4 w-4 text-blue-600 flex-shrink-0" />}
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="p-4 border-t bg-white">
        <div className="text-xs text-slate-500">
          <div className="flex items-center justify-between mb-1">
            <span>Total Studies</span>
            <span className="font-semibold text-slate-900">{studies.length}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Active Campaigns</span>
            <span className="font-semibold text-slate-900">{campaigns.length}</span>
          </div>
        </div>
      </div>
    </aside>
  )
}