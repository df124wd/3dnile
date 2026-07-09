import * as Cesium from 'cesium'

/**
 * 设置点击拾取：点击 POI 实体回调其 id，点击空白处回调 null（关闭面板）。
 * 返回销毁函数，组件卸载时调用。
 */
export function setupPoiPicking(
  viewer: Cesium.Viewer,
  onSelect: (entityId: string | null) => void,
): () => void {
  const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas)
  handler.setInputAction((evt: { position: Cesium.Cartesian2 }) => {
    const picked = viewer.scene.pick(evt.position)
    if (Cesium.defined(picked) && picked.id instanceof Cesium.Entity) {
      const id = picked.id.id
      onSelect(typeof id === 'string' ? id : null)
    } else {
      onSelect(null)
    }
  }, Cesium.ScreenSpaceEventType.LEFT_CLICK)
  return () => handler.destroy()
}
