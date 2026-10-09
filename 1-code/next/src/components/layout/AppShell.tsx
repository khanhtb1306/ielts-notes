import { useRef, type ReactNode } from "react"
import { Sidebar } from "./Sidebar"
import { TopBar } from "./TopBar"
import { MobilePageTitle } from "./MobilePageTitle"
import { MobileMenu } from "./MobileMenu"
import { BottomNav } from "./BottomNav"
import { TableOfContents } from "./TableOfContents"
import { useUi } from "@/stores/ui"
import { cn } from "@/lib/utils"

export function AppShell({ children }: { children: ReactNode }) {
  const contentRef = useRef<HTMLDivElement>(null)
  const collapsed = useUi((s) => s.sidebarCollapsed)

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className={cn("grid min-h-screen", collapsed ? "md:grid-cols-[72px_1fr]" : "md:grid-cols-[280px_1fr]")}>
        <div className="hidden md:block sticky top-0 h-screen overflow-y-auto sidebar-scope">
          <Sidebar className="h-full" collapsible />
        </div>
        <main className="min-w-0 overflow-x-clip px-4 py-4 pb-[calc(5.5rem+env(safe-area-inset-bottom))] sm:px-8 sm:py-6 md:pb-20 lg:px-12">
          <div className="mx-auto max-w-7xl">
            <TopBar />
            <div className="flex gap-8 md:mt-6">
              <div ref={contentRef} className="min-w-0 flex-1">
                <MobilePageTitle />
                {children}
              </div>
              <TableOfContents containerRef={contentRef} />
            </div>
          </div>
        </main>
      </div>
      <MobileMenu />
      <BottomNav />
    </div>
  )
}
