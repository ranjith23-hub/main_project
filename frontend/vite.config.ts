import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

declare const process: { cwd: () => string };

export default defineConfig(({ mode }) => {
  const API_URL = loadEnv(mode, process.cwd()).VITE_API_URL;

  return {
    plugins: [react()],
    server: {
      port: 3000,
      proxy: {
        '/api': {
          target: API_URL,
          changeOrigin: true,
        },
        '/health': {
          target: API_URL,
          changeOrigin: true,
        },
      },
    },
    preview: {
      port: 3000,
      proxy: {
        '/api': {
          target: API_URL,
          changeOrigin: true,
        },
        '/health': {
          target: API_URL,
          changeOrigin: true,
        },
      },
    },
  };
});

