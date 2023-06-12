import { Pass } from 'three/examples/jsm/postprocessing/Pass'

export default class CallbackPass extends Pass {
  constructor(callback) {
    super()

    this.needsSwap = false
    this.callback = callback
  }
  render(renderer, writeBuffer, readBuffer, deltaTime) {
    this.callback(renderer, writeBuffer, readBuffer, deltaTime)
  }
}
