import { create } from "zustand"

interface UiStore {
  search: string
  setSearch: (v: string) => void
  mobileMenuOpen: boolean
  setMobileMenuOpen: (v: boolean) => void
}

export const useUi = create<UiStore>((set) => ({
  search: "",
  setSearch: (v) => set({ search: v }),
  mobileMenuOpen: false,
  setMobileMenuOpen: (v) => set({ mobileMenuOpen: v }),
}))
