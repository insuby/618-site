import * as three from 'three'
import vertexShader from './vert.glsl'
import fragmentShader from './frag.glsl'

export default {
  uniforms: {
    uMap: { value: null },
    uRepeat: { value: new three.Vector2(1, 1) },
    uOpacity: { value: 1 },
    uColor: { value: new three.Color('white') },
  },
  vertexShader,
  fragmentShader,
  transparent: true,
}
