import * as three from 'three'
import vertexShader from './vert.glsl'
import fragmentShader from './frag.glsl'

export default {
  uniforms: {
    uMap: { value: null },
    uHexagonSize: { value: 6 },
    uDistortionIntensity: { value: new three.Vector2(0.1, 0.1) },
    uMousePos: { value: new three.Vector2(0.5, 0.5) },
    uMouseInfluence: { value: 0.5 },
    uMouseInfluenceRadius: { value: 0.1 },
    uAspectRatio: { value: 16 / 9 },
  },
  vertexShader,
  fragmentShader,
  transparent: true,
  depthTest: false,
  depthWrite: false,
}
