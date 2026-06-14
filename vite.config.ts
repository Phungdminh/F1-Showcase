import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5174,
    strictPort: true,
  },
  build: {
    rollupOptions: {
      output: {
        // Name the three.js vendor bundle explicitly so it reads as `three`
        // instead of an incidental module, and keep it isolated from the
        // landing/index chunk (it loads only when a lazy 3D scene mounts).
        manualChunks(id) {
          if (
            id.includes('node_modules/three') ||
            id.includes('node_modules/@react-three')
          ) {
            return 'three-vendor';
          }
          return undefined;
        },
      },
    },
  },
});
