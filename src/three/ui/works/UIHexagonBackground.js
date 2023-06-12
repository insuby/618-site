import * as three from 'three'
import cloneDeep from 'lodash/cloneDeep'
import Ola from 'ola'
import UIElement from '../lib/UIElement'
import {createHexagonPartGeometry} from '../../utils/geometry'
import {degToRad, negativePHI, positivePHI} from '../../../utils/math'
import HexagonBackgroundShader from '../../shaders/hexagonBackground/HexagonBackgroundShader'


export default class UIHexagonBackground extends UIElement {
  _displayed = true
  _opened = false
  transitionDuration = 600
  openingDuration = 900
  parts = []
  mouseX = 0.5
  mouseY = 0.5

  constructor(layer, partsCount = 9) {
    super()

    this.progressOla = Ola(this._displayed ? 1 : 0)
    this.openedOla = Ola(this._opened ? 1 : 0)

    const part = createHexagonPartGeometry()

    const calcOdds = v => Math.floor(v / 2) + (v % 2 !== 0 ? 1 : 0)
    const calcEvens = v => (v + 1) - calcOdds(v)

    for (let i = 0; i < partsCount; i++) {
      const scale = (i % 2 === 0 ? positivePHI : Math.abs(negativePHI)) * 0.365
      const angle = 90 + 60 * i


      const scaleMatrix = new three.Matrix4().makeScale(scale, scale, scale)
      const rotationMatrix = new three.Matrix4().makeRotationAxis(new three.Vector3(0, 0, -1), degToRad(angle))
      const geometry = part.clone().applyMatrix4(rotationMatrix).applyMatrix4(scaleMatrix)

      const material = new three.ShaderMaterial(cloneDeep(HexagonBackgroundShader))
      material.uniforms.uIndex.value = i
      material.uniforms.uCount.value = partsCount

      const mesh = new three.Mesh(geometry, material)

      const odd = calcOdds(i)
      const even = calcEvens(i)

      mesh.userData = {
        globalScale: 1,
        // First small, then large
        // (i % 2 === 0 ? calcOdds(partsCount) + even - 1 : odd) - 1,
        transitionIndex: i,
        // First large, then small
        openingIndex: (i % 2 === 0 ? even : calcEvens(partsCount) + odd) - 1,
      }
      mesh.visible = false
      mesh.layers.set(layer)

      this.parts.push(mesh)
      this.add(mesh)
    }

    window.addEventListener('mousemove', this.onMouseMove.bind(this))
  }

  onMouseMove(e) {
    this.mouseX = e.clientX / window.innerWidth
    this.mouseY = e.clientY / window.innerHeight
  }

  get backgroundScale() {
    return this.parts[0].userData.globalScale
  }

  set backgroundScale(scale) {
    for (const part of this.parts) {
      part.userData.globalScale = scale
    }
  }

  get texture() {
    return this._texture
  }

  set texture(texture) {
    if (texture !== this._texture) {
      for (const part of this.parts) {
        part.material.uniforms.uMap.value = texture
      }
      this._texture = texture
    }
  }

  get displayed() {
    return this._displayed
  }

  set displayed(displayed) {
    this._displayed = displayed
    this.progressOla.set({ value: displayed ? 1 : 0 }, this.transitionDuration)
    this.position.z = displayed ? 0 : -30
  }

  get opened() {
    return this._opened
  }

  set opened(opened) {
    this._opened = opened
    this.openedOla.set({ value: opened ? 1 : 0 }, this.openingDuration)
  }

  onUpdate({ time }) {
    if (!this._texture) return setTimeout( () => {
      return this.onUpdate({time})
    })
    for (let i = 0; i < this.parts.length; i++) {
      const part = this.parts[i]

      part.visible = (part.userData.transitionIndex / (this.parts.length - 1)) < this.progressOla.value
      const isScaledUp = (part.userData.openingIndex / (this.parts.length - 1)) < this.openedOla.value
      if (isScaledUp) {
        part.scale.x = i % 2 === 0 ? positivePHI : 100
      } else {
        part.scale.x = 1
      }
      part.scale.x *= part.userData.globalScale
      // noinspection JSSuspiciousNameCombination
      part.scale.y = part.scale.x

      part.material.uniforms.uMapResolution.value.x = this._texture.image.videoWidth ?? this._texture.image.width
      part.material.uniforms.uMapResolution.value.y = this._texture.image.videoHeight ?? this._texture.image.height
      part.material.uniforms.uTime.value = time
    }
  }

  onResize() {
    for (const part of this.parts) {
      part.material.uniforms.uScreenResolution.value.x = Math.floor(this._root.renderWidth)
      part.material.uniforms.uScreenResolution.value.y = Math.floor(this._root.renderHeight)
    }
  }
}
