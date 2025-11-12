import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: './',  // ✅ Needed for Render static hosting (relative asset paths)
  server: {
    port: 3000,
    host: true,
    allowedHosts: [
      '2ff9-103-130-91-141.ngrok-free.app'
    ]
  }
})
