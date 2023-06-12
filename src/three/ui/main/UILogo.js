import * as three from 'three'
import UIElement from '../lib/UIElement'
import UISprite from '../lib/UISprite'
import UIText from '../lib/UIText'
import font from '../../../../assets/fonts/CoFo-Kak-Regular.woff'
import {getTroikaTextCharRect} from '../../utils/troikaText'
import {down, up} from '../../../utils/breakpoints'

export default class UILogo extends UIElement {
  constructor(tearEffectLayer, noTearEffectLayer, backgroundTexture) {
    super()

    this.background = new UISprite(backgroundTexture)
    this.background.sprite.layers.set(noTearEffectLayer)
    this.background.material.uniforms.uColor.value = new three.Color('#900')
    this.background.height = 20

    this.blackText = new UIText('-.6180339', font, 48)
    this.whiteText = new UIText('-.618', font, 48)
    this.blackText.troikaText.layers.set(noTearEffectLayer)
    this.whiteText.troikaText.layers.set(tearEffectLayer)

    for (const text of [this.blackText, this.whiteText]) {
      text.parentAnchorY = 1
      text.anchorY = 1
      text.pixelX = -8
      text.pixelY = 4
    }

    this.blackText.troikaText.color = new three.Color('black')

    // this.add(this.background)
    // this.add(this.blackText)
    this.add(this.whiteText)

    this.onResize()
  }

  layout() {
    if (this._dirty) {
      this.width = down('xl') ? this.whiteText.width : this.background.width
      this.height = down('xl') ? this.whiteText.height : this.background.height
    }

    let markDirty = false

    const rect = getTroikaTextCharRect(this.whiteText.troikaText, 4)
    if (rect) {
      if (this.whiteText.troikaText.clipRect?.[2] !== rect.minX + rect.width / 2) {
        this.whiteText.troikaText.clipRect = [0, 0, rect.minX + rect.width / 2, 999]
        markDirty = true
      }
    } else {
      markDirty = true
    }

    super.layout()

    if (markDirty) {
      this.markDirty()
    }
  }

  onResize() {
    const backgroundRepeat = 7.2

    this.blackText.textSize = down('xl') ? 36 : 48
    this.whiteText.textSize = down('xl') ? 36 : 48

    this.background.material.uniforms.uRepeat.value = new three.Vector2(backgroundRepeat, 1)
    this.background.width = 8 * backgroundRepeat
    this.background.visible = up('xl')
    this.blackText.visible = up('xl')

    this.blackText.pixelX = down('md') ? 5 : -8
    this.whiteText.pixelX = down('md') ? 5 : -8
  }
}
