import * as three from 'three'
import cloneDeep from 'lodash/cloneDeep'
import UIElement from './UIElement'
import UISpriteShader from '../../shaders/uiSprite/UISpriteShader'

export default class UISprite extends UIElement {
  constructor(texture, material, color = new three.Color('white')) {
    super()

    const geometry = new three.PlaneBufferGeometry(1, 1)
    geometry.applyMatrix4(new three.Matrix4().makeTranslation(0.5, 0.5, 0))
    this.material = material ?? new three.ShaderMaterial({
      ...cloneDeep(UISpriteShader),
      depthTest: false,
      depthWrite: false,
      defines: {
        USE_TEXTURE: texture != null,
      },
    })

    if (material == null) {
      if (texture?.then) {
        texture.then(t => {
          this.material.uniforms.uMap.value = t
        })
      } else {
        this.material.uniforms.uMap.value = texture
      }
    }

    if (material == null) {
      this.material.uniforms.uColor.value = color
    }

    this.sprite = new three.Mesh(geometry, this.material)
    this.add(this.sprite)

    this.width = 100
    this.height = 100
  }

  layout() {
    const dirty = this._dirty

    super.layout()

    if (dirty) {
      this.sprite.scale.x = this._sceneWidth
      this.sprite.scale.y = this._sceneHeight
    }
  }
}
