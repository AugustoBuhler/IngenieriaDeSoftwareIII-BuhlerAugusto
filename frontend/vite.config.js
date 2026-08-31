import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    // En DESARROLLO, quien traduce /api hacia el backend es este proxy de Vite.
    // En el contenedor Vite ya no existe: ahi lo hace nginx (frontend/nginx.conf).
    // Por eso el codigo del front nunca escribe un host: siempre pide a /api/...
    proxy: {
      '/api': {
        target: process.env.VITE_API_TARGET ?? 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
});
