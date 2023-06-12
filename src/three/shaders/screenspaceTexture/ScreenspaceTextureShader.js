import * as three from 'three'
import vertexShader from './vert.glsl'
import fragmentShader from './frag.glsl'

export default {
  uniforms: {
    uMap: { value: null },
    uOpacity: { value: 1 },
    uMapResolution: { value: new three.Vector2(1000, 1000) },
    uScreenResolution: { value: new three.Vector2(window.innerWidth, window.innerHeight) },
  },
  vertexShader,
  fragmentShader,
}
