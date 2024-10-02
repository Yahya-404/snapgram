import path from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],

  // ~~~ ShadCN ui ~~~
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // ~~~ // ShadCN ui // ~~~
});
