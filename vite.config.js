import { defineConfig } from 'vite'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import vue from '@vitejs/plugin-vue'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    AutoImport({
      resolvers: [ElementPlusResolver()],
    }),
    Components({
      resolvers: [ElementPlusResolver()],
    }),
  ],
  css: {
    preprocessorOptions: {
        less: {
            modifyVars: {
                hack: `true; @import (reference) "${path.resolve("src/base.less")}";`,
            },
            javascriptEnabled: true,
        },
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://47.94.94.135:8080',
        changeOrigin: true, // 允许跨域
        rewrite: (path) => path.replace(/^\/api/,'')
      }
    }
  }
})
