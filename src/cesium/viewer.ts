import * as Cesium from 'cesium'

// 可选：通过 VITE_CESIUM_TOKEN 注入 Cesium Ion token，启用真实高程地形
const cesiumToken = import.meta.env.VITE_CESIUM_TOKEN
if (cesiumToken) Cesium.Ion.defaultAccessToken = cesiumToken

/**
 * 免 token 卫星影像底图：Esri World Imagery。
 * 不依赖 Cesium Ion，长期公开链接稳定。
 */
function createBaseImagery(): Cesium.ImageryLayer {
  const provider = new Cesium.UrlTemplateImageryProvider({
    url:
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    maximumLevel: 19,
    credit: 'Esri, Maxar, Earthstar Geographics',
  })
  return new Cesium.ImageryLayer(provider)
}

/**
 * 创建 Cesium Viewer。
 * - 影像：Esri World Imagery（免 token）
 * - 地形：默认椭球（平面）；真实地形由 terrain.ts 在后台尝试覆盖
 * - 界面：关闭多余控件，保留缩放/平移/旋转交互
 */
export function createCesiumViewer(container: string | HTMLElement): Cesium.Viewer {
  const viewer = new Cesium.Viewer(container, {
    baseLayer: createBaseImagery(),
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
