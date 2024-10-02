import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { BrowserRouter } from "react-router-dom";
import { QueryProvider } from "./lib/TanStack/QueryProvider.tsx";
import { AuthProvider } from "./context/AuthProvider.tsx";

import App from "./App.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <QueryProvider>
        <AuthProvider>
          <App />
        </AuthProvider>
      </QueryProvider>
    </BrowserRouter>
  </StrictMode>
);
