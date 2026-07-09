import * as Cesium from 'cesium'
import type { Poi, PoiCategory } from '../types/data'

/** 各类别的标记颜色 */
const CATEGORY_COLOR: Record<PoiCategory, Cesium.Color> = {
  city: Cesium.Color.fromCssColorString('#f1f5f9'), // 城市 白
  landmark: Cesium.Color.fromCssColorString('#fbbf24'), // 历史/地标 金
  engineering: Cesium.Color.fromCssColorString('#fb923c'), // 水利工程 橙
  water: Cesium.Color.fromCssColorString('#22d3ee'), // 支流/湖泊 青
}

/**
 * 加载 POI 目录（public/data/pois.json），渲染彩色圆点 + 标签。
 * 标签在远距离自动隐藏（distanceDisplayCondition）以避免杂乱。
 */
export async function loadPois(viewer: Cesium.Viewer): Promise<Cesium.CustomDataSource> {
  const url = `${import.meta.env.BASE_URL}data/pois.json`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`pois.json 加载失败: ${res.status}`)
  const pois: Poi[] = await res.json()

  const ds = new Cesium.CustomDataSource('pois')
  for (const p of pois) {
    const color = CATEGORY_COLOR[p.category] ?? Cesium.Color.WHITE
    ds.entities.add({
      id: p.id,
      name: p.name,
      position: Cesium.Cartesian3.fromDegrees(p.lon, p.lat),
      point: {
        pixelSize: 9,
        color,
        outlineColor: Cesium.Color.fromCssColorString('#08111c'),
        outlineWidth: 2,
        disableDepthTestDistance: Number.POSITIVE_INFINITY,
        scaleByDistance: new Cesium.NearFarScalar(1e5, 1.2, 2e6, 0.75),
      },
      label: {
        text: p.name,
        font: '13px system-ui, "PingFang SC", "Microsoft YaHei", sans-serif',
        fillColor: Cesium.Color.fromCssColorString('#eaf6ff'),
        outlineColor: Cesium.Color.fromCssColorString('#06121f'),
        outlineWidth: 3,
        style: Cesium.LabelStyle.FILL_AND_OUTLINE,
        pixelOffset: new Cesium.Cartesian2(0, -16),
        showBackground: true,
        backgroundColor: Cesium.Color.fromCssColorString('#0b1622').withAlpha(0.72),
        backgroundPadding: new Cesium.Cartesian2(7, 5),
        distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 1.2e6),
        disableDepthTestDistance: Number.POSITIVE_INFINITY,
      },
    })
  }
  viewer.dataSources.add(ds)
  return ds
}
