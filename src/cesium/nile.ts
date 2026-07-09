import * as Cesium from 'cesium'

/**
 * 加载尼罗河水系真实河道几何（来源：Natural Earth 10m / OpenStreetMap，
 * 由 scripts/fetch-nile.mjs 生成到 public/data/nile.geojson）。
 * 使用 import.meta.env.BASE_URL 前缀，兼容根域名与 GitHub Pages 子路径部署。
 * clampToGround: 贴地渲染；青色描边便于与卫星影像区分。
 */
export async function loadNile(
  viewer: Cesium.Viewer,
): Promise<Cesium.GeoJsonDataSource> {
  const url = `${import.meta.env.BASE_URL}data/nile.geojson`
  const dataSource = await Cesium.GeoJsonDataSource.load(url, {
    stroke: Cesium.Color.fromCssColorString('#22d3ee'),
    strokeWidth: 4,
    fill: Cesium.Color.fromCssColorString('#22d3ee').withAlpha(0.25),
    clampToGround: true,
  })
  dataSource.name = 'nile'
  await viewer.dataSources.add(dataSource)
  return dataSource
}
