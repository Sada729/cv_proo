import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "sonner";
import "./styles.css";
import App from "./App";
import { AdminAuthProvider } from "./context/AdminAuthContext";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <AdminAuthProvider>
        <App />
        <Toaster richColors position="top-center" />
      </AdminAuthProvider>
    </BrowserRouter>
  </StrictMode>,
);
