import * as three from 'three'
import Ola from 'ola'
import UIElement from '../../lib/UIElement'
import UISprite from '../../lib/UISprite'
import UIText from '../../lib/UIText'
import boldFont from '../../../../../assets/fonts/Gramatika-Bold.otf'
import { down, up } from '../../../../utils/breakpoints'
import { NO_TEAR_EFFECT_LAYER, TEAR_EFFECT_LAYER } from '../../../layers'
import { lerp } from '../../../../utils/math'
import { inOutSine } from '../../../../utils/easings'
import { isTouch } from '../../../../plugins/isTouchScreen'

export default class UILanguageMenuItem extends UIElement {
  constructor(languages, selectedLanguage, backgroundTexture) {
    super()

    this.hoveredElements = []

    this.hoverPadding = new three.Vector4(20, 20, 0, 10)

    this.background = new UISprite(backgroundTexture)
    this.background.sprite.layers.set(NO_TEAR_EFFECT_LAYER)
    this.background.material.uniforms.uColor.value = new three.Color('#990000')
    this.background.height = 20

    this.selectedLanguageText = new UIText(languages.find(l => l.id === selectedLanguage).text.toUpperCase(), boldFont, 18)
    this.selectedLanguageText.troikaText.layers.set(TEAR_EFFECT_LAYER)

    this.dotText = new UIText('.', boldFont, 18)
    this.dotText.troikaText.layers.set(TEAR_EFFECT_LAYER)
    this.add(this.dotText)

    this.add(this.background)
    this.add(this.selectedLanguageText)

    this.languageTexts = []

    for (const language of languages.filter(l => l.id !== selectedLanguage)) {
      const text = new UIText(language.text.toUpperCase(), boldFont, 18)
      text.troikaText.layers.set(TEAR_EFFECT_LAYER)
      text.hoverPadding = new three.Vector4(12, 12, 12, 12)
      text.troikaText.material.opacity = 0
      text.ignoreInHover = true
      text.onClick(() => {
        this.dispatchEvent({ type: 'selectLanguage', language: language.id })
      })
      text.onHoverEnter(() => {
        this.hoveredElements.push(text)
        if (!isTouch) {
          this.setOpen(true)
        }
      })
      text.onHoverExit(() => {
        this.hoveredElements = this.hoveredElements.filter(e => e !== text)
        if (!isTouch && this.hoveredElements.length === 0) {
          this.setOpen(false)
        }
      })
      this.languageTexts.push(text)
      this.add(text)
    }

    this.open = false
    this.openOla = Ola(0, 300)

    this.onHoverEnter(() => {
      this.hoveredElements.push(this)
      if (!isTouch) {
        this.setOpen(true)
      }
    })
    this.onHoverExit(() => {
      this.hoveredElements = this.hoveredElements.filter(e => e !== this)
      if (!isTouch && this.hoveredElements.length === 0) {
        this.setOpen(false)
      }
    })

    this.onClick(() => {
      if (isTouch) {
        this.setOpen(!this.open)
      }
    })
    this.onClickOutside(() => {
      if (isTouch) {
        this.setOpen(false)
      }
    })

    this.onResize()
  }

  setOpen(open) {
    this.open = open
    this.openOla.value = this.open ? 1 : 0

    setTimeout(() => {
      for (const text of this.languageTexts) {
        text.ignoreInHover = !this.open
      }
    }, 0)
  }

  onResize() {
    this.selectedLanguageText.textSize = down('xl') ? 15 : down('xxl') ? 18 : 20
    const backgroundRepeat = Math.round(this.selectedLanguageText.text.length * (down('xl') ? 1 : 2))
    this.background.material.uniforms.uRepeat.value = new three.Vector2(backgroundRepeat, 1)
    this.background.visible = up('xl')
    this.background.width = 8 * backgroundRepeat

    for (const text of this.languageTexts) {
      text.textSize = down('xl') ? 15 : down('xxl') ? 18 : 20
    }

    if (down('xl')) {
      this.selectedLanguageText.setAnchors(0, 0, 0, 0)
      this.selectedLanguageText.pixelY = 0
      this.dotText.pixelY = 3
    } else {
      this.selectedLanguageText.setAnchors(0.5, 0, 0.5, 0)
      this.selectedLanguageText.pixelY = 8
      this.dotText.pixelY = 12
    }
  }

  layout() {
    this.width = down('xl') ? this.selectedLanguageText.width : this.background.width
    this.height = down('xl') ? this.selectedLanguageText.height : this.background.height


    const spacing = 12
    const openProgress = inOutSine(this.openOla.value)
    let maxX = this.selectedLanguageText.maxX + 24

    for (const text of this.languageTexts) {
      text.pixelX = lerp(this.selectedLanguageText.minX, maxX + spacing, openProgress)
      text.pixelY = this.selectedLanguageText.pixelY
      text.troikaText.material.opacity = this.openOla.value
      maxX = text.maxX
    }

    this.dotText.pixelX = lerp(this.selectedLanguageText.minX, this.selectedLanguageText.maxX + 18, openProgress)
    this.dotText.troikaText.material.opacity = openProgress

    super.layout()
  }
}
