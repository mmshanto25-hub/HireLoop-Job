import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { AppProviders } from "@/app/providers";
import { App } from "@/App";
import "@/styles/index.css";

const root = document.getElementById("root");
if (!root) {
  throw new Error("Root element #root was not found in index.html");
}

createRoot(root).render(
  <StrictMode>
    <AppProviders>
      <App />
    </AppProviders>
  </StrictMode>,
);
