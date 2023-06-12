import Ola from 'ola'
import UIElement from '../../lib/UIElement'
import UIText from '../../lib/UIText'
import boldFont from '../../../../../assets/fonts/Gramatika-Bold.otf'
import { lerp } from '../../../../utils/math'
import SpringOla from '../../../../utils/SpringOla'
import { down, downHeight } from '../../../../utils/breakpoints'

export default class UIProjectTitle extends UIElement {
  _displayed = true

  constructor(tearEffectLayer, noTearEffectLayer, text) {
    super()

    this.text = new UIText(text.toUpperCase(), boldFont, this.largeTextSize)
    this.text.setAnchors(0, 0, 0.5, 0.5)
    this.text.troikaText.layers.set(tearEffectLayer)
    this.text.troikaText.anchorX = 'center'
    this.text.troikaText.anchorY = 'middle'
    this.text.troikaText.textAlign = 'center'

    this.progressOla = new SpringOla(0, { stiffness: 175, damping: 30 })
    this.opacityOla = Ola(this._displayed ? 1 : 0, 300)

    this.add(this.text)
  }

  get displayed() {
    return this._displayed
  }

  set displayed(displayed) {
    this._displayed = displayed
    this.opacityOla.value = displayed ? 1 : 0
    this.ignoreInHover = !displayed
  }

  onResize() {
    this.largeTextSize = down('xxs') ? 28 : down('md') ? 36 : down('xxl') ? 55 : 90
    this.smallTextSize = down('lg') ? this.largeTextSize / 2 : this.largeTextSize / 3

    this.text.textSize = this.largeTextSize

    this.width = down('lg') ? 320 : 570

    const width = down('lg') && downHeight('sm') ? window.innerWidth - 256 : window.innerWidth - 64
    this.text.troikaText.maxWidth = Math.min(width, this.width) / this._root.height
  }

  onUpdate({ deltaTime }) {
    this.progressOla.update(deltaTime)
  }

  get selected() {
    return this._selected
  }

  set selected(value) {
    if (value !== this._selected) {
      this._selected = value
      this.progressOla.value = value ? 1 : 0
      this.markDirty()
    }
  }

  layout() {
    super.layout()

    const progress = this.progressOla.value

    const scale = lerp(this.smallTextSize / this.largeTextSize, 1, progress)

    this.text.troikaText.scale.setScalar(scale)
    this.text.troikaText.fillOpacity = this.opacityOla.value

    this.height = this.text.height * scale
    this.selectedHeight = this.text.height
    this.unselectedHeight = this.text.height * this.smallTextSize / this.largeTextSize
  }
}
