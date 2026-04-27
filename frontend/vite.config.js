import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [
    react({
      include: /\.(jsx|js|tsx|ts)$/
    })
  ],
  esbuild: {
    loader: "jsx",
    include: /src\/.*\.(jsx?|tsx?)$/,
    exclude: []
  },
  optimizeDeps: {
    esbuildOptions: {
      loader: {
        ".js": "jsx",
        ".jsx": "jsx"
      }
    }
  }
});
