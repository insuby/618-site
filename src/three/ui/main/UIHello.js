import * as three from 'three'
import tween from '@tweenjs/tween.js'
import UIElement from '../lib/UIElement'
import UIText from '../lib/UIText'
import titleFont from '../../../../assets/fonts/CoFo-Kak-Regular.woff'
import shiftedFont from '../../../../assets/fonts/Gramatika-Shifted.woff'
import {getTroikaTextCharRect} from '../../utils/troikaText'
import i18n from '../../../plugins/i18n'
import {down} from '../../../utils/breakpoints'

const ANIMATION_DELAY = 500

export default class UIHello extends UIElement {
  constructor(tearEffectLayer, noTearEffectLayer) {
    super()

    this.ignoreInLayout = true

    this.blackTitleText = new UIText('-.618033988', titleFont, 256)
    this.blackTitleText.troikaText.color = new three.Color('black')
    this.blackTitleText.troikaText.layers.set(noTearEffectLayer)

    this.whiteTitleText = new UIText('-.618', titleFont, 256)
    this.whiteTitleText.troikaText.layers.set(tearEffectLayer)
    this.whiteTitleText.pixelX = -40
    this.whiteTitleText.setAnchors(0.5, 0.5, 0.5, 0.5)

    this.blackTitleText.onBeforeLayout(() => {
      this.blackTitleText.pixelX = this.whiteTitleText.minX
      this.blackTitleText.pixelY = this.whiteTitleText.minY
    })

    this.holdAndDragText = new UIText(i18n.t('common.holdAndDrag'), shiftedFont, 24)
    this.holdAndDragText.troikaText.layers.set(tearEffectLayer)
    this.holdAndDragText.setAnchors(0.5, 0, 0.5, 0)
    this.holdAndDragText.onBeforeLayout(() => {
      this.holdAndDragText.pixelY = Math.max(this.whiteTitleText.minY - this.holdAndDragText.height - (down('md') ? 0 : 64), 64)
    })
    this.holdAndDragText.troikaText.outlineWidth = '1%'
    this.holdAndDragText.troikaText.outlineColor = new three.Color('white')

    this.add(this.blackTitleText)
    this.add(this.whiteTitleText)
    this.add(this.holdAndDragText)

    this.tweenOpacity = 1

    // requestAnimationFrame(this.toggleOpacity)
    this.onResize()
  }

  hide() {
    if (this.tweenOpacity !== 1) {
      return
    }

    new tween.Tween(this)
      .to({ tweenOpacity: 0 }, ANIMATION_DELAY)
      .onUpdate(() => {
        this.blackTitleText.troikaText.material.opacity = this.tweenOpacity
        this.whiteTitleText.troikaText.material.opacity = this.tweenOpacity
        this.holdAndDragText.troikaText.material[0].opacity = this.tweenOpacity
        this.holdAndDragText.troikaText.material[1].opacity = this.tweenOpacity
      })
      .start()
  }

  show() {
    new tween.Tween(this)
      .to({ tweenOpacity: 1 }, ANIMATION_DELAY)
      .onUpdate(() => {
        this.blackTitleText.troikaText.material.opacity = this.tweenOpacity
        this.whiteTitleText.troikaText.material.opacity = this.tweenOpacity
        this.holdAndDragText.troikaText.material[0].opacity = this.tweenOpacity
        this.holdAndDragText.troikaText.material[1].opacity = this.tweenOpacity
      })
      .start()
      .onComplete(this.toggleOpacity)
  }

  toggleOpacity() {
    new tween.Tween(this)
      .to({ tweenOpacity: this.tweenOpacity ? 1 : 0 }, ANIMATION_DELAY)
      .onUpdate(() => {
        this.holdAndDragText.troikaText.material[0].opacity = this.tweenOpacity
        this.holdAndDragText.troikaText.material[1].opacity = this.tweenOpacity
      })
      .start()
  }

  layout() {
    super.layout()

    const rect = getTroikaTextCharRect(this.whiteTitleText.troikaText, 4)
    if (rect) {
      const x = rect.maxX - rect.width * 0.4
      this.blackTitleText.troikaText.clipRect = [x, 0, 999, 999]
      this.whiteTitleText.troikaText.clipRect = [0, 0, x, 999]
    }
  }

  onResize() {
    this.blackTitleText.textSize = down('md') ? 128 : 256
    this.whiteTitleText.textSize = down('md') ? 128 : 256
    this.holdAndDragText.textSize = down('md') ? 16 : 24
    this.whiteTitleText.pixelX = down('md') ? -20 : -40
  }
}
