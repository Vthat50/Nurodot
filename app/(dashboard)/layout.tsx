import { MainNav } from "@/components/layout/MainNav"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-screen overflow-hidden">
      <MainNav />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}