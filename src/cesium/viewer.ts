import * as Cesium from 'cesium'
import { createBaseImagery } from './imagery'

// 可选：通过 VITE_CESIUM_TOKEN 注入 Cesium Ion token，启用真实高程地形
const cesiumToken = import.meta.env.VITE_CESIUM_TOKEN
if (cesiumToken) Cesium.Ion.defaultAccessToken = cesiumToken

/**
 * 创建 Cesium Viewer。
 * - 影像：天地图（国内快，见 imagery.ts）或 Esri 回退
 * - 地形：默认椭球（平面）；真实地形由 terrain.ts 在后台尝试覆盖
 * - 界面：关闭多余控件，保留缩放/平移/旋转交互
 */
export function createCesiumViewer(container: string | HTMLElement): Cesium.Viewer {
  const { baseLayer, overlayProviders } = createBaseImagery()
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
    // 按 devicePixelRatio 全分辨率渲染，避免 HiDPI 屏（如 150% 缩放）画面发糊
    // ⚠️ 此属性属于 Viewer/CesiumWidget，不是 Scene！
    useBrowserRecommendedResolution: false,
    // 按需渲染（仅交互/数据变化时重绘），大幅降低 GPU 功耗，避免卡顿
    requestRenderMode: true,
    maximumRenderTimeChange: Infinity,
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
