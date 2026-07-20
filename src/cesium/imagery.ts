import * as Cesium from 'cesium'

/**
 * 天地图 token（https://console.tianditu.gov.cn 免费申请）。
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

/**
 * 探测瓦片 URL 是否可达（通过 Image 标签测试，绕过 CORS）。
 * 超时 6 秒返回 false。
 */
function probeTile(url: string, timeoutMs = 6000): Promise<boolean> {
  return new Promise((resolve) => {
    const img = new Image()
    const timer = setTimeout(() => {
      img.src = ''
      resolve(false)
    }, timeoutMs)
    img.onload = () => {
      clearTimeout(timer)
      resolve(true)
    }
    img.onerror = () => {
      clearTimeout(timer)
      resolve(false)
    }
    img.src = url
  })
}

/**
 * 异步创建底图影像，带瓦片可达性探测。
 *
 * 优先级：
 *  1. Esri UrlTemplateImageryProvider（探测瓦片可达 → 使用）
 *  2. 天地图（探测瓦片可达 → 使用）
 *  3. OpenStreetMap（兜底，全球可达，无需探测）
 */
export async function createBaseImagery(): Promise<BaseImageryResult> {
  // ── 天地图（显式指定） ──
  if (USE_TIANDITU && TIANDITU_TK) {
    return {
      baseLayer: new Cesium.ImageryLayer(tianditu('img_w')),
      overlayProviders: [tianditu('cia_w')],
    }
  }

  // ── 方式 1：探测 Esri 瓦片是否可达 ──
  const esriTileTest =
    'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/2/1/1'
  const esriOk = await probeTile(esriTileTest)
  if (esriOk) {
    console.log('[Nile3D] ✓ Esri 瓦片可达，使用 UrlTemplateImageryProvider')
    const esri = new Cesium.UrlTemplateImageryProvider({
      url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      maximumLevel: 19,
      credit: 'Esri, Maxar, Earthstar Geographics',
    })
    return { baseLayer: new Cesium.ImageryLayer(esri), overlayProviders: [] }
  }
  console.warn('[Nile3D] Esri 瓦片不可达，尝试天地图…')

  // ── 方式 2：探测天地图瓦片是否可达 ──
  if (TIANDITU_TK) {
    const tdTileTest = `https://t0.tianditu.gov.cn/DataServer?T=img_w&x=1&y=1&l=2&tk=${TIANDITU_TK}`
    const tdOk = await probeTile(tdTileTest)
    if (tdOk) {
      console.log('[Nile3D] ✓ 天地图瓦片可达')
      return {
        baseLayer: new Cesium.ImageryLayer(tianditu('img_w')),
        overlayProviders: [tianditu('cia_w')],
      }
    }
    console.warn('[Nile3D] 天地图瓦片不可达，回退 OSM…')
  }

  // ── 方式 3：OpenStreetMap 兜底 ──
  console.log('[Nile3D] ✓ 使用 OpenStreetMap 兜底影像')
  const osm = new Cesium.OpenStreetMapImageryProvider({
    url: 'https://tile.openstreetmap.org/',
  })
  return { baseLayer: new Cesium.ImageryLayer(osm), overlayProviders: [] }
}
