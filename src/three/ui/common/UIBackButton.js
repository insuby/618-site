import * as three from 'three'
import Ola from 'ola'
import fontBold from '../../../../assets/fonts/Gramatika-Bold.otf'
import UIText from '../lib/UIText'
import UIElement from '../lib/UIElement'
import UISprite from '../lib/UISprite'
import { loadTexture } from '../../utils/loaders'
import { down } from '../../../utils/breakpoints'
import { isTouch } from '../../../plugins/isTouchScreen'

let texture = null
const texturePromise = loadTexture('common/backArrow.basis').then(t => {
  texture = t
  return t
})

export default class UIBackButton extends UIElement {
  constructor(layer, text = 'Back') {
    super()

    this.shadowArrow = new UISprite(texture ?? texturePromise, null, new three.Color('red'))
    this.shadowArrow.setAnchors(0, 0.5, 0, 0.5)
    this.shadowArrow.sprite.layers.set(layer)

    this.arrow = new UISprite(texture ?? texturePromise, null, new three.Color('white'))
    this.arrow.setAnchors(0, 0.5, 0, 0.5)
    this.arrow.sprite.layers.set(layer)

    this.text = new UIText(text.toUpperCase(), fontBold, 16)
    this.text.troikaText.layers.set(layer)
    this.text.troikaText.outlineColor = new three.Color('red')
    this.text.setAnchors(0, 0.5, 0, 0.5)
    this.text.onBeforeLayout(() => {
      this.text.pixelX = this.arrow.pixelX + this.arrow.width + 8
    })

    this.add(this.text)
    this.add(this.shadowArrow)
    this.add(this.arrow)

    this.hoverOla = Ola(0, 150)

    this.onHoverEnter(() => this.hoverOla.value = isTouch ? 0 : 1)
    this.onHoverExit(() => this.hoverOla.value = 0)
  }

  onResize() {
    this.text.textSize = down('xl') ? 16 : 20
    const scaling = (down('xl') ? 1.6 : 2) / 1.6
    this.arrow.width = 64 * scaling
    this.arrow.height = 16 * scaling
    this.shadowArrow.width = this.arrow.width
    this.shadowArrow.height = this.arrow.height
  }

  layout() {
    super.layout()

    this.width = this.text.pixelX + this.text.width
    this.height = 24

    this.text.troikaText.outlineOffsetX = this.hoverOla.value * (1.5 / this._root.height)
    this.text.troikaText.outlineOffsetY = this.hoverOla.value * (1.5 / this._root.height)
    this.shadowArrow.pixelX = this.hoverOla.value * 1.5
    this.shadowArrow.pixelY = this.hoverOla.value * -1.5
  }
}
