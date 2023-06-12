import each from 'lodash/each'
import eachRight from 'lodash/eachRight'
import UIElement from './UIElement'

export default class UIStack extends UIElement {
  constructor(direction = 'h', spacing = 0) {
    super()

    this._direction = direction
    this._spacing = spacing
  }

  get direction() {
    return this._direction
  }

  set direction(direction) {
    if (this._direction !== direction) {
      this._direction = direction
      this.markDirty()
    }
  }

  set spacing(spacing) {
    if (this._spacing !== spacing) {
      this._spacing = spacing
      this.markDirty()
    }
  }

  get spacing() {
    return this._spacing
  }

  layout() {
    super.layout()

    let lastPos = 0
    let maxX = 0
    let maxY = 0

    const iteratorFunc = this._direction === 'h' ? each : eachRight

    iteratorFunc(this.children, child => {
      if (!child.visible) {
        return
      }

      child.pixelX = 0
      child.pixelY = 0
      child.setAnchors(0, 0, 0, 0)

      if (this._direction === 'h') {
        child.pixelX = lastPos
        lastPos += child.width + (child.stackSpacing ?? this._spacing)
        maxX = lastPos
        maxY = Math.max(maxY, child.height)
      } else {
        child.pixelY = lastPos
        lastPos += child.height + (child.stackSpacing ?? this._spacing)
        maxX = Math.max(maxX, child.width)
        maxY = lastPos
      }
    })

    this.width = maxX
    this.height = maxY

    super.layout()
  }
}
