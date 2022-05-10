import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import * as process from 'process';

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    host: process.env.VITE_IP,
    port: parseInt(process.env.VITE_PORT, 10)
  },
  plugins: [vue()]
})
