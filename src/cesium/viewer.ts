import * as Cesium from 'cesium'

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
 * - 地形：默认椭球（平面，免 token）；真实高程地形留待阶段 1 接入
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
    // 不指定 terrain → 默认 EllipsoidTerrainProvider（免 token）
  })

  const scene = viewer.scene
  scene.globe.enableLighting = false
  scene.skyAtmosphere.show = true
  scene.fog.enabled = true

  // 初始视角：埃及尼罗河段（开罗 → 阿斯旺）
  viewer.camera.setView({
    destination: Cesium.Rectangle.fromDegrees(29.0, 22.0, 34.0, 32.5),
  })

  return viewer
}
