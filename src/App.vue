<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, shallowRef } from 'vue'
import * as Cesium from 'cesium'
import { createCesiumViewer } from './cesium/viewer'
import { applyRealTerrain } from './cesium/terrain'
import { loadNile } from './cesium/nile'
import { loadPois } from './cesium/pois'
import { flyToSegment, loadSegments } from './cesium/segments'
import type { Segment } from './types/data'
import SegmentRail from './components/SegmentRail.vue'

const containerRef = ref<HTMLDivElement | null>(null)
const ready = ref(false)
const errorMsg = ref<string | null>(null)
const segments = ref<Segment[]>([])
const activeId = ref<string | null>(null)
const terrainOn = ref(false)

const viewerRef = shallowRef<Cesium.Viewer | null>(null)
const segmentMap = new Map<string, Segment>()

onMounted(async () => {
  try {
    if (!containerRef.value) throw new Error('地图容器未找到')
    const viewer = createCesiumViewer(containerRef.value)
    viewerRef.value = viewer

    await loadNile(viewer)
    await loadPois(viewer)

    const segs = await loadSegments()
    segments.value = segs
    for (const s of segs) segmentMap.set(s.id, s)
    if (segs[0]) selectSegment(segs[0].id, 0)

    ready.value = true

    // 真实地形后台尝试，不阻塞界面就绪
    void applyRealTerrain(viewer).then((on) => {
      terrainOn.value = on
    })

    if (import.meta.env.DEV) {
      // 开发期调试钩子：window.__flyTo(lon, lat, height)
      ;(window as unknown as { __flyTo?: (lon: number, lat: number, h?: number) => void }).__flyTo = (
        lon,
        lat,
        h = 150000,
      ) =>
        viewer.camera.flyTo({
          destination: Cesium.Cartesian3.fromDegrees(lon, lat, h),
          duration: 0,
        })
    }
  } catch (e) {
    errorMsg.value = e instanceof Error ? e.message : String(e)
    // eslint-disable-next-line no-console
    console.error('[Nile3D] 初始化失败', e)
  }
})

function selectSegment(id: string, duration = 1.6): void {
  const seg = segmentMap.get(id)
  const viewer = viewerRef.value
  if (!seg || !viewer) return
  activeId.value = id
  flyToSegment(viewer, seg, duration)
}

onBeforeUnmount(() => {
  const viewer = viewerRef.value
  if (viewer && !viewer.isDestroyed()) viewer.destroy()
  viewerRef.value = null
})
</script>

<template>
  <div class="app">
    <div id="cesium-container" ref="containerRef"></div>

    <SegmentRail
      :segments="segments"
      :active-id="activeId"
      @select="(id: string) => selectSegment(id)"
    />

    <div v-if="errorMsg" class="error">加载失败：{{ errorMsg }}</div>

    <div v-else class="hud">
      <h1>尼罗河 · 3D 模型</h1>
      <p class="hint">左键旋转 · 右键平移 · 滚轮缩放</p>
      <p class="status">
        {{ ready ? '● 已就绪' : '○ 加载中…' }} · 地形：{{ terrainOn ? '真实高程' : '平面' }}
      </p>
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
  right: 16px;
  z-index: 10;
  color: #e6f7ff;
  pointer-events: none;
  text-align: right;
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
  z-index: 11;
  background: #2a0d12;
  color: #ffb4bd;
  padding: 10px 14px;
  border: 1px solid #5a1a24;
  border-radius: 6px;
  max-width: 360px;
}
</style>
