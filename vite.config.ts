import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import cesium from 'vite-plugin-cesium'

// 生产用相对 base ('./')：所有资源 URL 相对解析，
// 兼容 GitHub Pages 子路径 (df124wd.github.io/3dnile/) 与根域名部署，
// 并避免 vite-plugin-cesium 在子路径下 Cesium 资源路径错位。
// 开发用 '/' 保持简单。
export default defineConfig(({ mode }) => ({
  base: mode === 'production' ? './' : '/',
  plugins: [vue(), cesium()],
  server: {
    host: true,
    port: 5173,
  },
}))
