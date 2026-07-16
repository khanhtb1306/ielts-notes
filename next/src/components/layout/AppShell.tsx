import { useRef, type ReactNode } from "react"
import { Sidebar } from "./Sidebar"
import { TopBar } from "./TopBar"
import { MobileMenu } from "./MobileMenu"
import { TableOfContents } from "./TableOfContents"

export function AppShell({ children }: { children: ReactNode }) {
  const contentRef = useRef<HTMLDivElement>(null)

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="grid min-h-screen md:grid-cols-[280px_1fr]">
        <div className="hidden md:block sticky top-0 h-screen overflow-y-auto sidebar-scope">
          <Sidebar className="h-full" />
        </div>
        <main className="px-4 py-6 sm:px-8 lg:px-12 pb-20">
          <div className="mx-auto max-w-7xl">
            <TopBar />
            <div className="mt-6 flex gap-8">
              <div ref={contentRef} className="min-w-0 flex-1">
                {children}
              </div>
              <TableOfContents containerRef={contentRef} />
            </div>
          </div>
        </main>
      </div>
      <MobileMenu />
    </div>
  )
}
