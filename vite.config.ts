import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
      react(),
      tailwindcss()
      ],
  build: {
      // Measured JS output is ~216KB raw at the time this was added. Set just
      // above that so a real regression still warns during the build, not just
      // in the postbuild gzip check (see scripts/check-bundle-size.mjs).
      chunkSizeWarningLimit: 260,
  },
})
