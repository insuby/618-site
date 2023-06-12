import * as three from 'three'
import vertexShader from './vert.glsl'
import fragmentShader from './frag.glsl'

export default {
  uniforms: {
    uMap: { value: null },
    uMap2: { value: null },
    uTransitionProgress: { value: 0 },
    uTransitionSmoothness: { value: 0.1 },
    uHexagonSize: { value: 6 },
    uLocalTearIntensity: { value: new three.Vector2(0.1, 0.1) },
    uGlobalTearIntensity: { value: new three.Vector2(0.1, 0.1) },
    uMousePos: { value: new three.Vector2(0.5, 0.5) },
    uMouseInfluence: { value: 0.5 },
    uMouseInfluenceRadius: { value: 0.1 },
    uAspectRatio: { value: 16 / 9 },
  },
  vertexShader,
  fragmentShader,
  transparent: true,
}
