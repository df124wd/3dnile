import * as Cesium from 'cesium'

/**
 * 天地图 token：在 https://console.tianditu.gov.cn 免费申请（选"浏览器端"类型）。
 * 留空 → 回退 Esri World Imagery（全球覆盖好，但服务器在海外，国内冷启动较慢）。
 * 静态站点为客户端取瓦片，tk 会出现在前端，属天地图免费开发密钥的常规用法。
 */
export const TIANDITU_TK = ''

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
 * 构造底图：天地图优先（影像 img_w + 中文注记 cia_w）；无 token 回退 Esri。
 */
export function createBaseImagery(): BaseImageryResult {
  if (TIANDITU_TK) {
    return {
      baseLayer: new Cesium.ImageryLayer(tianditu('img_w')),
      overlayProviders: [tianditu('cia_w')], // 影像注记：中文地名
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
