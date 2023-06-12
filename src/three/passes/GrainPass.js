import * as three from 'three'
import { FullScreenQuad, Pass } from 'three/examples/jsm/postprocessing/Pass'
import GrainShader from '../shaders/grain/GrainShader'

const GrainPass = function GrainPass(noiseIntensity) {
  Pass.call(this)

  const shader = GrainShader

  this.uniforms = three.UniformsUtils.clone(shader.uniforms)

  this.material = new three.ShaderMaterial({
    uniforms: this.uniforms,
    vertexShader: shader.vertexShader,
    fragmentShader: shader.fragmentShader,

  })

  if (noiseIntensity !== undefined) {
    this.uniforms.uIntensity.value = noiseIntensity
  }

  this.fsQuad = new FullScreenQuad(this.material)
}

GrainPass.prototype = Object.assign(Object.create(Pass.prototype), {
  constructor: GrainPass,
  render(renderer, writeBuffer, readBuffer, deltaTime) {
    this.uniforms.uMap.value = readBuffer.texture
    this.uniforms.uTime.value += deltaTime

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
  },
})

export { GrainPass }
