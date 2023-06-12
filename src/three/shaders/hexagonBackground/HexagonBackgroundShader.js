import * as three from 'three'
import vertexShader from './vert.glsl'
import fragmentShader from './frag.glsl'

export default {
  uniforms: {
    uMap: { value: null },
    uMapResolution: { value: new three.Vector2(1000, 1000) },
    uScreenResolution: { value: new three.Vector2(window.innerWidth, window.innerHeight) },
    uIndex: { value: 0 },
    uCount: { value: 1 },
    uTime: { value: 0 },
  },
  vertexShader,
  fragmentShader,
  transparent: true,
  depthTest: false,
  depthWrite: false,
}
