import * as three from 'three'
import UIElement from './UIElement'

export default class UIMesh extends UIElement {
  constructor(mesh, worldSpace = false) {
    super()

    this.mesh = mesh

    this.container = new three.Group()
    this.container.add(mesh)
    this._worldSpace = worldSpace

    this._box = new three.Box3()

    this.add(this.container)

    this.width = 100
    this.height = 100
  }

  get worldSpace() {
    return this._worldSpace
  }

  set worldSpace(worldSpace) {
    if (this._worldSpace !== worldSpace) {
      this._worldSpace = worldSpace
      this.markDirty()
    }
  }

  layout() {
    const dirty = this._dirty

    super.layout()

    if (dirty) {
      // TODO: Implement
      if (this._worldSpace) {
        /* this.container.scale.set(1, 1, 1)
        this._box.copy(this.mesh.geometry.boundingBox).applyMatrix4(this.mesh.matrix) */
      } else {
        // TODO: Implement
      }
    }
  }
}
