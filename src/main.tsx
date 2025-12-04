import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
// registrar SW
import { registerSW } from "virtual:pwa-register";

const updateSW = registerSW({
  onNeedRefresh() { /* opcional: notificar usuário que há atualização */ },
  onOfflineReady() { /* opcional: notificar que está offline-ready */ }
});

createRoot(document.getElementById("root")!).render(<App />);
