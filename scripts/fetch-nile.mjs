// 获取尼罗河水系真实河道几何，写成静态 GeoJSON。
// 策略：OSM Overpass 按 6 个小区域分块查询(避免大响应超时)，合并去重；
//       全部失败时回退 Natural Earth 10m（jsDelivr CDN，国内可达）。
// 运行：node scripts/fetch-nile.mjs
import { writeFileSync, mkdirSync } from 'node:fs'

// 已验证国内可达且返回数据的端点优先
const OVERPASS_ENDPOINTS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.openstreetmap.fr/api/interpreter',
  'https://maps.mail.ru/osm/tools/overpass/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
  'https://overpass.private.coffee/api/interpreter',
]
const NE_CANDIDATES = [
  'https://cdn.jsdelivr.net/gh/nvkelso/natural-earth-vector@master/geojson/ne_10m_rivers_lake_centerlines.geojson',
]

const NAME_RE =
  'Nile|White Nile|Blue Nile|Main Nile|Atbara|Atbarah|Sobat|Bahr|Victoria Nile|Albert Nile|Kagera|Abay|Jabal|النيل'
const UA = 'nile-3d/0.1 (https://github.com/df124wd/3dnile)'

// 分块(南,西,北,东)：覆盖源头/湖泊/苏德/青尼罗/苏丹主流/埃及/三角洲
const REGIONS = [
  [-5, 29, 4, 35],
  [3, 29, 12, 34],
  [9, 36, 14, 40],
  [12, 30, 22, 34],
  [21, 29, 32, 33],
  [29, 29, 32, 32],
]

async function fetchJson(url, { timeout = 60000, post } = {}) {
  const controller = new AbortController()
  const t = setTimeout(() => controller.abort(), timeout)
  try {
    const res = await fetch(url, {
      method: post ? 'POST' : 'GET',
      headers: post
        ? { 'Content-Type': 'application/x-www-form-urlencoded', 'User-Agent': UA }
        : { Accept: 'application/json', 'User-Agent': UA },
      body: post ? 'data=' + encodeURIComponent(post) : undefined,
      signal: controller.signal,
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    return await res.json()
  } finally {
    clearTimeout(t)
  }
}

async function queryRegion(bbox) {
  const [s, w, n, e] = bbox
  const q = `
[out:json][timeout:60];
(
  way["waterway"~"river|stream"]["name"~"(${NAME_RE})",i](${s},${w},${n},${e});
  way["waterway"~"river|stream"]["name:en"~"(${NAME_RE})",i](${s},${w},${n},${e});
);
out geom;`
  for (const url of OVERPASS_ENDPOINTS) {
    try {
      const json = await fetchJson(url, { post: q, timeout: 60000 })
      return (json.elements ?? []).filter(
        (x) => x.type === 'way' && Array.isArray(x.geometry) && x.geometry.length > 1,
      )
    } catch {
      // 下一个端点
    }
  }
  return []
}

async function fromOverpass() {
  const seen = new Map()
  let okRegions = 0
  for (const bbox of REGIONS) {
    const ways = await queryRegion(bbox)
    console.log(`→ 分块 [${bbox.join(',')}]  命中 ${ways.length} 条`)
    if (ways.length) okRegions++
    for (const el of ways) {
      if (seen.has(el.id)) continue
      seen.set(el.id, {
        type: 'Feature',
        properties: { name: el.tags?.['name:en'] ?? el.tags?.name ?? 'Nile', source: 'osm' },
        geometry: { type: 'LineString', coordinates: el.geometry.map((p) => [p.lon, p.lat]) },
      })
    }
  }
  if (seen.size === 0) return null
  console.log(`OSM 合计 ${seen.size} 条 way（${okRegions}/${REGIONS.length} 区域成功）`)
  return { features: [...seen.values()], source: 'OpenStreetMap' }
}

async function fromNaturalEarth() {
  for (const url of NE_CANDIDATES) {
    try {
      console.log('→ Natural Earth:', url)
      const fc = await fetchJson(url, { timeout: 90000 })
      const features = (fc.features ?? [])
        .filter((f) => {
          const p = f.properties ?? {}
          const nm = [p.name, p.name_en, p.name_alt].filter(Boolean).join(' | ')
          return /nile|white nile|blue nile|atbara|sobat|bahr|abay|victoria nile|albert nile|kagera/i.test(nm)
        })
        .map((f) => ({
          type: 'Feature',
          properties: { name: f.properties?.name_en || f.properties?.name || 'Nile', source: 'natural-earth' },
          geometry: f.geometry,
        }))
      if (features.length) return { features, source: 'Natural Earth' }
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
writeFileSync('public/data/nile.geojson', JSON.stringify({ type: 'FeatureCollection', features }, null, 2))

const names = {}
let points = 0
for (const f of features) {
  names[f.properties.name] = (names[f.properties.name] ?? 0) + 1
  const c = f.geometry.coordinates
  if (f.geometry.type === 'MultiLineString') points += c.reduce((n, l) => n + l.length, 0)
  else if (f.geometry.type === 'LineString') points += c.length
}
console.log(`\n✅ 数据源：${source}`)
console.log(`✅ 写入 ${features.length} 条 → public/data/nile.geojson，共 ${points} 个点`)
console.log('名称分布:', JSON.stringify(names))
