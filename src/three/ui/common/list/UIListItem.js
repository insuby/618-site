import * as three from 'three'
import Ola from 'ola'
import UIElement from '../../lib/UIElement'
import UIIndicator from './UIIndicator'
import UIText from '../../lib/UIText'
import boldFont from '../../../../../assets/fonts/Gramatika-Bold.otf'
import { isTouch } from '../../../../plugins/isTouchScreen'

export default class UIListItem extends UIElement {
  constructor(layer, text) {
    super()

    this.isSelected = false
    this.isHovered = false

    this.uiIndicator = new UIIndicator(layer)
    this.uiText = new UIText(text, boldFont, 12)
    this.uiText.setAnchors(0, 0.5, 0, 0.5)
    this.uiText.pixelPerfect = true
    this.uiText.troikaText.layers.set(layer)
    this.uiText.troikaText.outlineColor = new three.Color('red')

    this.add(this.uiIndicator)
    this.add(this.uiText)

    this.height = this.uiIndicator.height
    this.width = 140

    this.onHoverEnter(() => {
      this.uiIndicator.isHovered = !isTouch
      this.isHovered = !isTouch
    })
    this.onHoverExit(() => {
      this.uiIndicator.isHovered = false
      this.isHovered = false
    })

    this.shadowOla = Ola(0, 150)
  }

  setSelected(isSelected) {
    if (this.isSelected !== isSelected) {
      this.isSelected = isSelected
      this.uiIndicator.setActive(isSelected)
      this.ignoreInHover = isSelected
    }
  }

  layout() {
    const dirty = this._dirty

    super.layout()

    if (dirty) {
      this.uiText.pixelX = this.uiIndicator.width + 9
    }

    this.shadowOla.value = this.isHovered || this.isSelected ? 1 : 0

    this.uiText.troikaText.outlineOffsetX = this.shadowOla.value * (1 / this._root.height)
    this.uiText.troikaText.outlineOffsetY = this.shadowOla.value * (1 / this._root.height)
  }
}
