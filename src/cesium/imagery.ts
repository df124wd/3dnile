import * as Cesium from 'cesium'

/**
 * 天地图 token（https://console.tianditu.gov.cn 免费申请）。
 * 注：天地图国内加载快，但**海外（尼罗河所在）影像分辨率偏低**。
 */
export const TIANDITU_TK = '6af9e984f1e2b09622602a35069fe326'
const USE_TIANDITU = import.meta.env.VITE_USE_TIANDITU === '1'

export interface BaseImageryResult {
  baseLayer: Cesium.ImageryLayer
  overlayProviders: Cesium.ImageryProvider[]
}

function tianditu(layer: string): Cesium.UrlTemplateImageryProvider {
  return new Cesium.UrlTemplateImageryProvider({
    url: `https://t{s}.tianditu.gov.cn/DataServer?T=${layer}&x={x}&y={y}&l={z}&tk=${TIANDITU_TK}`,
    subdomains: ['0', '1', '2', '3', '4', '5', '6', '7'],
    maximumLevel: 18,
    credit: '天地图 TIANDITU',
  })
}

function tiandituImagery(): BaseImageryResult {
  return {
    baseLayer: new Cesium.ImageryLayer(tianditu('img_w')),
    overlayProviders: [tianditu('cia_w')],
  }
}

function osmImagery(): BaseImageryResult {
  const osm = new Cesium.OpenStreetMapImageryProvider({
    url: 'https://tile.openstreetmap.org/',
  })
  return { baseLayer: new Cesium.ImageryLayer(osm), overlayProviders: [] }
}

/**
 * 异步创建底图影像（Cesium 1.143 推荐方式）。
 *
 * 优先级：
 *  1. ArcGisMapServerImageryProvider（官方 API，CORS 友好）
 *  2. UrlTemplateImageryProvider（旧式 tile URL，可能被 CORS 拦截）
 *  3. OpenStreetMap（兜底，全球可达）
 *
 * VITE_USE_TIANDITU=1 时改用天地图（国内快 + 中文注记，但海外分辨率较低）。
 */
export async function createBaseImagery(): Promise<BaseImageryResult> {
  // ── 天地图（显式指定） ──
  if (USE_TIANDITU && TIANDITU_TK) {
    return tiandituImagery()
  }

  // ── 方式 1：ArcGisMapServerImageryProvider（Cesium 1.143 推荐） ──
  try {
    const provider = await Cesium.ArcGisMapServerImageryProvider.fromUrl(
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer',
    )
    console.log('[Nile3D] ✓ Esri ArcGisMapServer 影像加载成功')
    return { baseLayer: new Cesium.ImageryLayer(provider), overlayProviders: [] }
  } catch (e) {
    console.warn('[Nile3D] Esri ArcGisMapServer 不可用，尝试旧式 UrlTemplate…', e)
  }

  // ── 方式 2：UrlTemplateImageryProvider（旧式 tile URL） ──
  try {
    const esri = new Cesium.UrlTemplateImageryProvider({
      url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      maximumLevel: 19,
      credit: 'Esri, Maxar, Earthstar Geographics',
    })
    console.log('[Nile3D] ✓ Esri UrlTemplate 影像加载成功')
    return { baseLayer: new Cesium.ImageryLayer(esri), overlayProviders: [] }
  } catch (e) {
    console.warn('[Nile3D] Esri UrlTemplate 不可用，回退 OSM…', e)
  }

  // ── 方式 3：OpenStreetMap 兜底 ──
  console.log('[Nile3D] ✓ 回退到 OpenStreetMap 影像')
  return osmImagery()
}
