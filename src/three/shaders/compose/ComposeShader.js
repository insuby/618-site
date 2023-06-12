import vertexShader from './vert.glsl'
import fragmentShader from './frag.glsl'

export default {
  uniforms: {
    uBackgroundMap: { value: null },
    uUIMap: { value: null },
  },
  vertexShader,
  fragmentShader,
}
