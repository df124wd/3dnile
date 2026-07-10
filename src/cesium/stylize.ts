import * as Cesium from 'cesium'

// 电影感色调（GLSL ES 3.00，Cesium WebGL2）：暗部偏青、亮部偏暖 + 暗角
const GRADE_FRAGMENT_SHADER = `
uniform sampler2D colorTexture;
in vec2 v_textureCoordinates;
out vec4 fragColor;
void main() {
  vec4 c = texture(colorTexture, v_textureCoordinates);
  float l = (c.r + c.g + c.g + c.b) * 0.25;
  vec3 shadows = vec3(0.12, 0.18, 0.22);
  vec3 highlights = vec3(1.06, 1.01, 0.90);
  vec3 tint = mix(shadows, highlights, smoothstep(0.0, 1.0, l));
  c.rgb = mix(c.rgb, c.rgb * tint, 0.40);
  float vig = smoothstep(1.15, 0.40, distance(v_textureCoordinates, vec2(0.5)));
  c.rgb *= mix(0.80, 1.0, vig);
  fragColor = c;
}
`

/**
 * 风格化后处理（真实地理 + 风格化外观）：
 * - 电影感色调（青-暖）与暗角，统一画面氛围
 * - 辉光(bloom)：让青色河流与高亮发光
 * - 增强 FXAA / 大气 / 雾
 * 每个 stage 单独 try/catch，避免某项缺失/重复导致整体初始化失败。
 */
export function applyStylization(viewer: Cesium.Viewer): void {
  const scene = viewer.scene
  scene.fxaa = true
  scene.fog.enabled = true
  scene.fog.density = 2.0e-4
  scene.skyAtmosphere.show = true
  scene.skyAtmosphere.saturationShift = 0.08
  scene.skyAtmosphere.brightnessShift = -0.02

  const stages = scene.postProcessStages

  try {
    stages.add(
      new Cesium.PostProcessStage({
        name: 'nile_colorGrade',
        fragmentShader: GRADE_FRAGMENT_SHADER,
      }),
    )
  } catch (e) {
    console.warn('[Nile3D] colorGrade 已存在或不可用，跳过', e)
  }

  try {
    const bloom = stages.add(Cesium.PostProcessStageLibrary.createBloomStage())
    // contrast 合理范围 1-10，120 会导致画面严重柔化发糊
    bloom.uniforms.contrast = 4
    bloom.uniforms.brightness = -0.05
    bloom.uniforms.glowOnly = false
    bloom.uniforms.delta = 1.0
    bloom.uniforms.sigma = 1.5
    bloom.uniforms.stepSize = 2
  } catch (e) {
    console.warn('[Nile3D] bloom 已存在或不可用，跳过', e)
  }
}
