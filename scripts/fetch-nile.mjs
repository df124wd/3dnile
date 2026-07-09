// 获取尼罗河水系真实河道几何，写成静态 GeoJSON。
// 数据源优先级：
//   1) OpenStreetMap Overpass（最精确，但国内常不通）
//   2) Natural Earth 10m 河流（经 jsDelivr CDN，国内可达，精度足够区域级展示）
// 运行：node scripts/fetch-nile.mjs
import { writeFileSync, mkdirSync } from 'node:fs'

const OVERPASS_ENDPOINTS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
  'https://overpass.openstreetmap.fr/api/interpreter',
]
const NE_CANDIDATES = [
  'https://cdn.jsdelivr.net/gh/nvkelso/natural-earth-vector@master/geojson/ne_10m_rivers_lake_centerlines.geojson',
  'https://cdn.jsdelivr.net/gh/nvkelso/natural-earth-vector@main/geojson/ne_10m_rivers_lake_centerlines.geojson',
  'https://cdn.jsdelivr.net/gh/nvkelso/natural-earth-vector@master/geojson/ne_10m_rivers_lake_centerline.geojson',
]

const NILE_RE =
  /nile|white nile|blue nile|atbara|sobat|bahr|abay|victoria nile|albert nile|kagera/i

async function fetchJson(url, { timeout = 60000, post } = {}) {
  const controller = new AbortController()
  const t = setTimeout(() => controller.abort(), timeout)
  try {
    const res = await fetch(url, {
      method: post ? 'POST' : 'GET',
      headers: post
        ? { 'Content-Type': 'application/x-www-form-urlencoded' }
        : { Accept: 'application/json' },
      body: post ? 'data=' + encodeURIComponent(post) : undefined,
      signal: controller.signal,
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    return await res.json()
  } finally {
    clearTimeout(t)
  }
}

async function fromOverpass() {
  const NAME_RE =
    'Nile|White Nile|Blue Nile|Abay|Atbara|Atbara River|Sobat|Bahr|Victoria Nile|Albert Nile|Main Nile'
  const query = `
[out:json][timeout:120];
(
  way["waterway"="river"]["name"~"^(${NAME_RE})$",i](0,28,33,40);
  way["waterway"="river"]["name:en"~"^(${NAME_RE})$",i](0,28,33,40);
);
out geom;`
  for (const url of OVERPASS_ENDPOINTS) {
    try {
      console.log('→ Overpass:', url)
      const json = await fetchJson(url, { post: query, timeout: 45000 })
      const features = (json.elements ?? [])
        .filter((e) => e.type === 'way' && Array.isArray(e.geometry) && e.geometry.length > 1)
        .map((e) => ({
          type: 'Feature',
          properties: { name: e.tags?.['name:en'] ?? e.tags?.name ?? 'Nile', source: 'osm' },
          geometry: { type: 'LineString', coordinates: e.geometry.map((p) => [p.lon, p.lat]) },
        }))
      if (features.length) {
        console.log(`  ✓ OSM 返回 ${features.length} 条`)
        return { features, source: 'OpenStreetMap' }
      }
    } catch (e) {
      console.log('  失败:', e.message)
    }
  }
  return null
}

async function fromNaturalEarth() {
  for (const url of NE_CANDIDATES) {
    try {
      console.log('→ Natural Earth:', url)
      const fc = await fetchJson(url, { timeout: 90000 })
      const all = fc.features ?? []
      const features = all
        .filter((f) => {
          const p = f.properties ?? {}
          const nm = [p.name, p.name_en, p.name_alt].filter(Boolean).join(' | ')
          return NILE_RE.test(nm)
        })
        .map((f) => ({
          type: 'Feature',
          properties: {
            name: f.properties?.name_en || f.properties?.name || 'Nile',
            source: 'natural-earth',
          },
          geometry: f.geometry,
        }))
      if (features.length) {
        console.log(`  ✓ Natural Earth 命中 ${features.length} / ${all.length} 条`)
        return { features, source: 'Natural Earth' }
      }
    } catch (e) {
      console.log('  失败:', e.message)
    }
  }
  return null
}

const result = (await fromOverpass()) || (await fromNaturalEarth())
if (!result) {
  console.error('\n❌ 所有数据源均失败。请检查网络后重试。')
  process.exit(1)
}

const { features, source } = result
mkdirSync('public/data', { recursive: true })
writeFileSync(
  'public/data/nile.geojson',
  JSON.stringify({ type: 'FeatureCollection', features }, null, 2),
)

// 统计
const names = {}
let minLat = 90, maxLat = -90, minLon = 180, maxLon = -180, points = 0
for (const f of features) {
  names[f.properties.name] = (names[f.properties.name] ?? 0) + 1
  for (const [lon, lat] of f.geometry.coordinates) {
    minLat = Math.min(minLat, lat); maxLat = Math.max(maxLat, lat)
    minLon = Math.min(minLon, lon); maxLon = Math.max(maxLon, lon)
    points++
  }
}
console.log(`\n✅ 数据源：${source}`)
console.log(`✅ 写入 ${features.length} 条 LineString，共 ${points} 个点 → public/data/nile.geojson`)
console.log('范围:', `[${minLon.toFixed(2)}, ${minLat.toFixed(2)}] → [${maxLon.toFixed(2)}, ${maxLat.toFixed(2)}]`)
console.log('名称分布:', JSON.stringify(names))
