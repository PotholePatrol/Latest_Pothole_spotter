
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import * as path from "path"
import Unocss from 'unocss/vite'
import tailwindcss from '@tailwindcss/vite'


export default defineConfig({
  plugins: [
    vue(),
    tailwindcss(),
    Unocss(),
  ],

  server: {
    allowedHosts: ["patholespotter.tera-in.top", "codetarmac.tera-in.top"],
  },
  base: '/',
  build: {
    outDir: 'dist',
    assetsDir: 'static',
    emptyOutDir: true,
    rollupOptions: {
      output: {
        entryFileNames: `static/[name]-[hash].js`,
        chunkFileNames: `static/[name]-[hash].js`,
        assetFileNames: `static/[name]-[hash][extname]`,
      },
    },
  },

  resolve: {
    alias: {
      '~': path.resolve(__dirname, '.'),
      '@': path.resolve(__dirname, 'src'),
    },
        extensions: ['.ts', '.js', '.vue', '.json']

  },

  // Add this to handle .js imports in TypeScript
  optimizeDeps: {
    include: ['**/*.js']
  }
})
