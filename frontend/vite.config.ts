import { defineConfig, loadEnv, Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

declare const process: { cwd: () => string };

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const rawApiUrl = env.API_URL || env.VITE_API_URL || 'http://localhost:8000';
  const API_URL = rawApiUrl.replace(/\/$/, '');

  // Auto-generate _redirects for Netlify from .env
  const publicDir = path.resolve(__dirname, 'public');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }
  const redirectsContent = `/api/*  ${API_URL}/api/:splat  200!\n/health/*  ${API_URL}/health/:splat  200!\n/*  /index.html  200\n`;
  fs.writeFileSync(path.resolve(publicDir, '_redirects'), redirectsContent, 'utf-8');

  // Auto-generate vercel.json for Vercel from .env
  const vercelConfig = {
    rewrites: [
      { source: '/api/:path*', destination: `${API_URL}/api/:path*` },
      { source: '/health/:path*', destination: `${API_URL}/health/:path*` }
    ]
  };
  fs.writeFileSync(path.resolve(__dirname, 'vercel.json'), JSON.stringify(vercelConfig, null, 2), 'utf-8');

  const dynamicRedirectsPlugin: Plugin = {
    name: 'dynamic-redirects',
    closeBundle() {
      const distDir = path.resolve(__dirname, 'dist');
      if (fs.existsSync(distDir)) {
        fs.writeFileSync(path.resolve(distDir, '_redirects'), redirectsContent, 'utf-8');
      }
    }
  };

  return {
    plugins: [react(), dynamicRedirectsPlugin],
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

