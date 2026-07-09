import * as Cesium from 'cesium'

/**
 * 尝试接入 Cesium Ion 世界真实高程地形（含水面掩膜、法线，便于着色）。
 * - 成功：返回 true，viewer 启用真实地形（尼罗河谷、埃塞俄比亚高原等起伏可见）
 * - 失败（无 Ion token / ion.cesium.com 不可达 / 8s 超时）：保持平面椭球，返回 false
 * 可通过 .env 的 VITE_CESIUM_TOKEN 提供免费 Ion token 以提高成功率（见 viewer.ts）。
 */
export async function applyRealTerrain(viewer: Cesium.Viewer): Promise<boolean> {
  const load = Cesium.createWorldTerrainAsync({
    requestVertexNormals: true,
    requestWaterMask: true,
  })
  const timeout = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error('terrain load timeout')), 8000),
  )
  try {
    const provider = await Promise.race([load, timeout])
    viewer.terrainProvider = provider
    return true
  } catch (e) {
    console.warn('[Nile3D] 真实地形不可用，回退平面椭球。', e)
    return false
  }
}
