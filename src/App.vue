<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import * as Cesium from 'cesium'
import { createCesiumViewer } from './cesium/viewer'
import { loadNile } from './cesium/nile'

const containerRef = ref<HTMLDivElement | null>(null)
const ready = ref(false)
const errorMsg = ref<string | null>(null)
let viewer: Cesium.Viewer | null = null

onMounted(async () => {
  try {
    if (!containerRef.value) throw new Error('地图容器未找到')
    viewer = createCesiumViewer(containerRef.value)
    await loadNile(viewer)

    if (import.meta.env.DEV) {
      // 开发期调试钩子：浏览器控制台可调用 window.__flyTo(lon, lat, height)
      ;(window as unknown as { __flyTo?: (lon: number, lat: number, h?: number) => void }).__flyTo = (
        lon,
        lat,
        h = 150000,
      ) => {
        viewer?.camera.flyTo({
          destination: Cesium.Cartesian3.fromDegrees(lon, lat, h),
          duration: 0,
        })
      }
    }

    ready.value = true
  } catch (e) {
    errorMsg.value = e instanceof Error ? e.message : String(e)
    // eslint-disable-next-line no-console
    console.error('[Nile3D] 初始化失败', e)
  }
})

onBeforeUnmount(() => {
  if (viewer && !viewer.isDestroyed()) viewer.destroy()
  viewer = null
})
</script>

<template>
  <div class="app">
    <div id="cesium-container" ref="containerRef"></div>

    <div v-if="errorMsg" class="error">
      加载失败：{{ errorMsg }}
    </div>

    <div v-else class="hud">
      <h1>尼罗河 · 3D 模型</h1>
      <p class="hint">左键拖拽旋转 · 右键拖拽平移 · 滚轮缩放</p>
      <p class="status">{{ ready ? '● 已就绪' : '○ 加载中…' }}</p>
    </div>
  </div>
</template>

<style scoped>
.app {
  position: fixed;
  inset: 0;
}

#cesium-container {
  position: absolute;
  inset: 0;
}

.hud {
  position: absolute;
  top: 14px;
  left: 14px;
  z-index: 10;
  color: #e6f7ff;
  pointer-events: none;
  text-shadow: 0 1px 4px rgba(0, 0, 0, 0.85);
}

.hud h1 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  letter-spacing: 0.5px;
}

.hud .hint {
  margin: 4px 0 0;
  font-size: 12px;
  opacity: 0.85;
}

.hud .status {
  margin: 2px 0 0;
  font-size: 11px;
  opacity: 0.6;
}

.error {
  position: absolute;
  top: 14px;
  left: 14px;
  z-index: 10;
  background: #2a0d12;
  color: #ffb4bd;
  padding: 10px 14px;
  border: 1px solid #5a1a24;
  border-radius: 6px;
  max-width: 360px;
}
</style>
