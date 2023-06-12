import * as three from 'three'
import { FullScreenQuad, Pass } from 'three/examples/jsm/postprocessing/Pass'
import UnlitShader from '../shaders/unlit/UnlitShader'

export default class RenderTexturePass extends Pass {
  constructor(shader = UnlitShader) {
    super()

    this.needsSwap = true

    this.uniforms = three.UniformsUtils.clone(shader.uniforms)

    this.material = new three.ShaderMaterial({
      ...shader,
      uniforms: this.uniforms,
      depthTest: false,
      depthWrite: false,
    })

    this.fsQuad = new FullScreenQuad(this.material)
  }

  set texture(texture) {
    this.uniforms.uMap.value = texture
  }

  render(renderer, writeBuffer) {
    if (this.renderToScreen) {
      renderer.setRenderTarget(null)
      this.fsQuad.render(renderer)
    } else {
      renderer.setRenderTarget(writeBuffer)
      if (this.clear) {
        renderer.clear()
      }
      this.fsQuad.render(renderer)
    }
  }
}
