import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue';
import { quasar, transformAssetUrls } from '@quasar/vite-plugin';
import * as process from 'process';
import * as path from 'path';

let apiUrl = 'http://';
apiUrl += (process.env.BACK_IP) ? process.env.BACK_IP : '127.0.0.1';
apiUrl += ':';
apiUrl += (process.env.BACK_PORT) ? process.env.BACK_PORT : '8080';
apiUrl += '/api/';

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    host: process.env.VITE_IP,
    port: parseInt(process.env.VITE_PORT, 10) | 3000
  },
  define: {
    __api: JSON.stringify(apiUrl),
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  plugins: [
    vue({
      template: { transformAssetUrls },
    }),
    quasar({
      sassVariables: 'src/quasar-variables.sass',
    }),
  ],
});
