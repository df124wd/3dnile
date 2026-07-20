import * as Cesium from 'cesium'
import { createBaseImagery } from './imagery'

// 可选：通过 VITE_CESIUM_TOKEN 注入 Cesium Ion token，启用真实高程地形
const cesiumToken = import.meta.env.VITE_CESIUM_TOKEN
if (cesiumToken) Cesium.Ion.defaultAccessToken = cesiumToken

/**
 * 创建 Cesium Viewer（异步，因影像加载需要 await）。
 * - 影像：Esri World Imagery（CORS 友好） → 天地图 → OSM 多级回退
 * - 地形：默认椭球（平面）；真实地形由 terrain.ts 在后台尝试覆盖
 * - 界面：关闭多余控件，保留缩放/平移/旋转交互
 */
export async function createCesiumViewer(
  container: string | HTMLElement,
): Promise<Cesium.Viewer> {
  const { baseLayer, overlayProviders } = await createBaseImagery()
  const viewer = new Cesium.Viewer(container, {
    baseLayer,
    baseLayerPicker: false,
    geocoder: false,
    homeButton: false,
    sceneModePicker: false,
    navigationHelpButton: false,
    animation: false,
    timeline: false,
    fullscreenButton: false,
    infoBox: false,
    selectionIndicator: false,
  })

  // 叠加中文地名注记层（仅天地图）
  for (const provider of overlayProviders) {
    viewer.imageryLayers.addImageryProvider(provider)
  }

  const scene = viewer.scene
  scene.globe.enableLighting = false
  scene.skyAtmosphere.show = true
  scene.fog.enabled = true

  // 初始视角：尼罗河全流域（分段切换会覆盖此视角）
  viewer.camera.setView({
    destination: Cesium.Rectangle.fromDegrees(28, -3, 39, 32),
  })

  return viewer
}
