import * as Cesium from 'cesium'
import type { Segment } from '../types/data'

/** 加载分段定义（public/data/segments.json） */
export async function loadSegments(): Promise<Segment[]> {
  const url = `${import.meta.env.BASE_URL}data/segments.json`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`segments.json 加载失败: ${res.status}`)
  return (await res.json()) as Segment[]
}

/** 平滑飞行到某段的矩形视角 */
export function flyToSegment(
  viewer: Cesium.Viewer,
  seg: Segment,
  duration = 1.6,
): void {
  const { west, south, east, north } = seg.view
  viewer.camera.flyTo({
    destination: Cesium.Rectangle.fromDegrees(west, south, east, north),
    duration,
    easingFunction: Cesium.EasingFunction.CUBIC_IN_OUT,
  })
}
