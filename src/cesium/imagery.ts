import * as Cesium from 'cesium'

/**
 * 天地图 token（https://console.tianditu.gov.cn 免费申请）。
 * 注：天地图国内加载快，但**海外（尼罗河所在）影像分辨率偏低**，故默认用 Esri 高分影像；
 * 仅当设置环境变量 VITE_USE_TIANDITU=1 时启用天地图（含中文地名注记）。
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
 * 底图：默认 Esri World Imagery（全球高分，含尼罗河高分辨率）；
 * VITE_USE_TIANDITU=1 时改用天地图（国内快 + 中文注记，但海外分辨率较低）。
 */
export function createBaseImagery(): BaseImageryResult {
  if (USE_TIANDITU && TIANDITU_TK) {
    return {
      baseLayer: new Cesium.ImageryLayer(tianditu('img_w')),
      overlayProviders: [tianditu('cia_w')],
    }
  }
  const esri = new Cesium.UrlTemplateImageryProvider({
    url:
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    maximumLevel: 19,
    credit: 'Esri, Maxar, Earthstar Geographics',
  })
  return { baseLayer: new Cesium.ImageryLayer(esri), overlayProviders: [] }
}
