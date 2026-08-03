import { create } from "zustand"

const SIDEBAR_KEY = "ielts-sidebar-collapsed"

function readCollapsed(): boolean {
  try {
    return localStorage.getItem(SIDEBAR_KEY) === "1"
  } catch {
    return false
  }
}

interface UiStore {
  search: string
  setSearch: (v: string) => void
  mobileMenuOpen: boolean
  setMobileMenuOpen: (v: boolean) => void
  sidebarCollapsed: boolean
  toggleSidebar: () => void
}

export const useUi = create<UiStore>((set) => ({
  search: "",
  setSearch: (v) => set({ search: v }),
  mobileMenuOpen: false,
  setMobileMenuOpen: (v) => set({ mobileMenuOpen: v }),
  sidebarCollapsed: readCollapsed(),
  toggleSidebar: () =>
    set((s) => {
      const next = !s.sidebarCollapsed
      try {
        localStorage.setItem(SIDEBAR_KEY, next ? "1" : "0")
      } catch {
        /* ignore */
      }
      return { sidebarCollapsed: next }
    }),
}))
