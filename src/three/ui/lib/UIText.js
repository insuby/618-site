import { Text } from 'troika-three-text'
import UIElement from './UIElement'
import { getTroikaTextRect } from '../../utils/troikaText'

export default class UIText extends UIElement {
  constructor(text, font, textSize) {
    super()
    this._font = font
    this._text = text
    this._textSize = textSize

    this.troikaText = new Text()
    this.troikaText.text = text
    this.troikaText.font = font
    this.troikaText.anchorY = 'bottom'
    this.troikaText.fontSize = textSize / window.innerHeight
    this.troikaText.lineHeight = 1
    this.troikaText.material.depthTest = false
    this.troikaText.material.depthWrite = false
    this.add(this.troikaText)

    this.markDirty()
  }

  get text() {
    return this._text
  }

  get font() {
    return this._font
  }

  get textSize() {
    return this._textSize
  }

  set text(text) {
    this._text = text
    this.troikaText.text = text
    this.markDirty()
  }

  set font(font) {
    this._font = font
    this.troikaText.font = font
    this.markDirty()
  }

  set textSize(textSize) {
    if (this._textSize !== textSize) {
      this._textSize = textSize
      this.markDirty()
    }
  }

  markDirty() {
    super.markDirty()
    this.troikaText.sync()
  }

  layout() {
    super.layout()

    const rect = getTroikaTextRect(this.troikaText)

    if (!rect) {
      this.markDirty()
      return
    }

    this.width = rect.width * this._root.height
    this.height = rect.height * this._root.height

    if (this.troikaText.fontSize !== this._textSize / this._root.height) {
      this.troikaText.fontSize = this._textSize / this._root.height
      this.troikaText.sync()
      this.markDirty()
    }
  }
}
