import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import "./styles/globals.css"
import App from "./App"
import { applyThemeClass, useTheme } from "./stores/theme"

// Apply persisted theme ASAP to avoid FOUC.
applyThemeClass(useTheme.getState().theme)

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
)
