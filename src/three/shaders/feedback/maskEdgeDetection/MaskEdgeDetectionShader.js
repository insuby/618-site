import * as three from 'three'
import vertexShader from './vert.glsl'
import fragmentShader from './frag.glsl'

export default {
  uniforms: {
    uMap: { value: null },
    uMapResolution: { value: new three.Vector2(1, 1) },
  },
  vertexShader,
  fragmentShader,
}
