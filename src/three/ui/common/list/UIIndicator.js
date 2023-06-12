import * as three from 'three'
import Ola from 'ola'
import UIElement from '../../lib/UIElement'
import UISprite from '../../lib/UISprite'
import { lerp } from '../../../../utils/math'

export default class UIIndicator extends UIElement {
  constructor(layer) {
    super()

    this.isActive = false
    this.isHovered = false


    this.shadowVerticalLine = new UISprite(null, null, new three.Color('red'))
    this.shadowHorizontalLine = new UISprite(null, null, new three.Color('red'))

    this.verticalLine = new UISprite()
    this.horizontalLine = new UISprite()


    this.verticalLine.pixelPerfect = true
    this.horizontalLine.pixelPerfect = true

    this.shadowVerticalLine.pixelPerfect = true
    this.shadowHorizontalLine.pixelPerfect = true


    this.verticalLine.setAnchors(0.5, 0.5, 0.5, 0.5)
    this.horizontalLine.setAnchors(0.5, 0.5, 0.5, 0.5)

    this.shadowVerticalLine.setAnchors(0.5, 0.5, 0.5, 0.5)
    this.shadowHorizontalLine.setAnchors(0.5, 0.5, 0.5, 0.5)


    this.verticalLine.sprite.layers.set(layer)
    this.horizontalLine.sprite.layers.set(layer)

    this.shadowVerticalLine.sprite.layers.set(layer)
    this.shadowHorizontalLine.sprite.layers.set(layer)


    this.add(this.shadowVerticalLine)
    this.add(this.shadowHorizontalLine)

    this.add(this.verticalLine)
    this.add(this.horizontalLine)


    this.progressOla = Ola(this.isActive ? 1 : 0, 150)
    this.hoverOla = Ola(this.isHovered ? 1 : 0, 150)


    this.onResize()
  }

  setActive(isActive) {
    if (this.isActive !== isActive) {
      this.isActive = isActive
      this.markDirty()
    }
  }

  onResize() {
    this.lineLength = 15
    this.inactiveLineLength = 2

    this.width = this.lineLength
    this.height = this.lineLength
  }

  layout() {
    super.layout()

    this.hoverOla.value = this.isHovered ? 1 : 0
    this.progressOla.value = this.isActive ? 1 : 0

    const hoverProgress = this.hoverOla.value
    const progress = this.progressOla.value

    const lineLength = Math.round(lerp(this.inactiveLineLength * lerp(1, 2, hoverProgress), this.lineLength, progress, true))

    this.verticalLine.height = lineLength
    this.horizontalLine.width = lineLength
    this.shadowVerticalLine.height = lineLength
    this.shadowHorizontalLine.width = lineLength

    this.verticalLine.width = Math.round(lerp(lerp(2, 4, hoverProgress), 1.5, progress, true))
    this.horizontalLine.height = Math.round(lerp(lerp(2, 4, hoverProgress), 1.5, progress, true))
    this.shadowVerticalLine.width = this.verticalLine.width
    this.shadowHorizontalLine.height = this.horizontalLine.height

    const shadowOffset = Math.round(lerp(hoverProgress, progress, progress))
    this.shadowVerticalLine.pixelX = shadowOffset
    this.shadowVerticalLine.pixelY = -shadowOffset
    this.shadowHorizontalLine.pixelX = shadowOffset
    this.shadowHorizontalLine.pixelY = -shadowOffset
  }
}
