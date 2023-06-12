import * as three from 'three'
import Ola from 'ola'
import UIElement from '../lib/UIElement'
import UISprite from '../lib/UISprite'
import UIText from '../lib/UIText'
import boldFont from '../../../../assets/fonts/Gramatika-Bold.woff'
import { down, up } from '../../../utils/breakpoints'

export default class UIMenuItem extends UIElement {
  constructor(tearEffectLayer, noTearEffectLayer, text, backgroundTexture) {
    super()

    this.showShadow = false

    this.background = new UISprite(backgroundTexture)
    this.background.sprite.layers.set(noTearEffectLayer)
    this.background.material.uniforms.uColor.value = new three.Color('#990000')
    this.background.height = 20

    this.itemText = new UIText(text, boldFont, 18)
    this.itemText.troikaText.outlineColor = new three.Color('red')
    this.itemText.troikaText.layers.set(tearEffectLayer)

    this.add(this.background)
    this.add(this.itemText)

    this.height = this.background.height

    this.shadowVisibilityProgressOla = Ola(this.showShadow ? 1 : 0, 150)

    this.onResize()
  }

  onResize() {
    this.itemText.textSize = down('xl') ? 15 : down('xxl') ? 18 : 20

    const backgroundRepeat = Math.round(this.itemText.text.length * 2)
    this.background.material.uniforms.uRepeat.value = new three.Vector2(backgroundRepeat, 1)
    this.background.visible = up('xl')
    this.background.width = 8 * backgroundRepeat

    this.itemText.pixelY = down('xl') ? 0 : 8

    if (down('xl')) {
      this.itemText.setAnchors(0, 0, 0, 0)
    } else {
      this.itemText.setAnchors(0.5, 0, 0.5, 0)
    }
  }

  layout() {
    this.width = down('xl') ? this.itemText.width : this.background.width
    this.height = down('xl') ? this.itemText.height : this.background.height

    this.shadowVisibilityProgressOla.value = this.showShadow ? 1 : 0

    this.itemText.troikaText.outlineOffsetX = this.shadowVisibilityProgressOla.value * (2 / this._root.height)
    this.itemText.troikaText.outlineOffsetY = this.shadowVisibilityProgressOla.value * (2 / this._root.height)

    super.layout()
  }
}
