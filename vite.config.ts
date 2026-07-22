import { fileURLToPath, URL } from 'node:url'

import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import vueDevTools from 'vite-plugin-vue-devtools'

import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'

import { cloudflare } from "@cloudflare/vite-plugin";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    base: env.VITE_BASE_PATH,
    plugins: [vue(), vueJsx(), vueDevTools(), AutoImport({
      imports: ['vue', 'vue-router', 'pinia'],
      resolvers: [ElementPlusResolver({ importStyle: false })],
    }), Components({
      dirs: [],
      resolvers: [ElementPlusResolver({ importStyle: false })],
    }), cloudflare()],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    server: env.VITE_API_PROXY_TARGET
      ? {
          proxy: {
            '/api': {
              changeOrigin: true,
              target: env.VITE_API_PROXY_TARGET,
              rewrite: (path) => path.replace(/^\/api/, '')
            },
          },
        }
      : undefined
  };
})
