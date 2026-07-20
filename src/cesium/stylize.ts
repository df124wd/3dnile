import * as Cesium from 'cesium'

/**
 * 场景风格化（轻量级，不使用自定义后处理着色器以保证帧率）。
 * - FXAA 抗锯齿（Cesium 内置，GPU 开销极低）
 * - 大气散射 + 雾效（内置效果，不影响帧率）
 *
 * 注：自定义 colorGrade 着色器和 bloom 后处理已移除，
 * 因为在 HiDPI（DPR=1.5）下全屏后处理会显著增加 GPU 负担导致掉帧。
 */
export function applyStylization(viewer: Cesium.Viewer): void {
  const scene = viewer.scene
  scene.fxaa = true
  scene.fog.enabled = true
  scene.fog.density = 2.0e-4
  scene.skyAtmosphere.show = true
  scene.skyAtmosphere.saturationShift = 0.08
  scene.skyAtmosphere.brightnessShift = -0.02
}
