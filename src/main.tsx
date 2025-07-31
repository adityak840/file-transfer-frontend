import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { useThemeStore, applyTheme } from "./stores/themeStore";

const initialTheme = useThemeStore.getState().theme;
applyTheme(initialTheme);

useThemeStore.subscribe((state) => {
  applyTheme(state.theme);
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
