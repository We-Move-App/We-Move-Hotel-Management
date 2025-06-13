import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    extensions: ['.js', '.jsx'], // Add .jsx extension
  },
  server: {
    fs: {
      strict: false
    },
    middlewareMode: false,
    watch: {
      usePolling: true
    },
    historyApiFallback: {
      index: '/index.html',
    }
  }
  
})
