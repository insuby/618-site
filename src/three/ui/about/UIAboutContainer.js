import * as three from 'three'
import Ola from 'ola'
import UIElement from '../lib/UIElement'
import UIBackButton from '../common/UIBackButton'
import {NO_TEAR_EFFECT_LAYER, TEAR_EFFECT_LAYER} from '../../layers'
import i18n from '../../../plugins/i18n'
import UIText from '../lib/UIText'
import boldFont from '../../../../assets/fonts/Gramatika-Bold.woff'
import font from '../../../../assets/fonts/Gramatika-Regular.woff'
import shiftedFont from '../../../../assets/fonts/Gramatika-Shifted.woff'
import UIStack from '../lib/UIStack'
import UISprite from '../lib/UISprite'
import {loadTexture} from '../../utils/loaders'
import {down, downHeight} from '../../../utils/breakpoints'
import {isTouch} from '../../../plugins/isTouchScreen'

export default class UIAboutContainer extends UIElement {
  ignoreInLayout = true
  ignoreInHover = true
  visible = false
  _displayed = false

   init() {
    this.stack = new UIStack('v')
    this.stack.setAnchors(0, 1, 0, 1)

    this.backButton = new UIBackButton(TEAR_EFFECT_LAYER, i18n.t('common.back'))
    this.backButton.hoverPadding = new three.Vector4(24, 64, 24, 64)
    this.backButton.onClick(() => this.dispatchEvent({ type: 'back' }))

    this.titleText = new UIText(i18n.t('about.title').toUpperCase(), boldFont, 58)
    this.titleText.troikaText.layers.set(TEAR_EFFECT_LAYER)

    this.descriptionText = new UIText(i18n.t('about.description'), font, 20)
    this.descriptionText.troikaText.lineHeight = 1.2
    this.descriptionText.troikaText.layers.set(TEAR_EFFECT_LAYER)
    this.descriptionText.troikaText.outlineWidth = '0.5%'
    this.descriptionText.troikaText.outlineColor = new three.Color('white')


    this.phoneNumber = new UIText(i18n.t('about.phoneNumber'), shiftedFont, 20)
    this.phoneNumber.url = i18n.t('about.phoneNumberUrl')
    this.phoneNumber.hoverPadding = new three.Vector4(16, 16, 0, 16)
    this.phoneNumber.troikaText.layers.set(TEAR_EFFECT_LAYER)
    this.phoneNumber.troikaText.outlineWidth = '0.5%'
    this.phoneNumber.hoverOla = Ola(0, 150)
    this.phoneNumber.onHoverEnter(() => this.phoneNumber.hoverOla.value = isTouch ? 0 : 1)
    this.phoneNumber.onHoverExit(() => this.phoneNumber.hoverOla.value = 0)

    this.email = new UIText(i18n.t('about.email'), shiftedFont, 20)
    this.email.url = 'mailto:' + i18n.t('about.email')
    this.email.hoverPadding = new three.Vector4(0, 16, 16, 16)
    this.email.troikaText.layers.set(TEAR_EFFECT_LAYER)
    this.email.troikaText.outlineWidth = '0.5%'
    this.email.hoverOla = Ola(0, 150)
    this.email.onHoverEnter(() => this.email.hoverOla.value = isTouch ? 0 : 1)
    this.email.onHoverExit(() => this.email.hoverOla.value = 0)

    this.backgroundTexture =  loadTexture('about/background.basis')
    this.background = new UISprite(this.backgroundTexture, null, new three.Color('black'))
    this.background.sprite.layers.set(NO_TEAR_EFFECT_LAYER)
    this.background.material.uniforms.uOpacity.value = 0

    this.stack.add(this.backButton)
    this.stack.add(this.titleText)
    this.stack.add(this.descriptionText)
    this.stack.add(this.phoneNumber)
    this.stack.add(this.email)

    this.add(this.stack)
    this.add(this.background)

    this.backgroundOpacityOla = Ola(0, 600)
  }

  set displayed(displayed) {
    this._displayed = displayed
    this.ignoreInHover = !displayed
    this.backgroundOpacityOla.value = displayed ? 1 : 0
  }

  get displayed() {
    return this._displayed
  }

  onResize() {
    const compactLandscape = this._root.isLandscale && down('lg') && downHeight(700)

    const paddingX = down('xxs') ? 16 : 28

    this.stack.pixelX = paddingX
    this.stack.pixelY = compactLandscape ? -48 : down('xxl') ? -70 : -86

    this.titleText.textSize = compactLandscape || down('xxs') ? 28 : down('md') ? 36 : down('xxl') ? 55 : 90
    this.descriptionText.textSize = compactLandscape || downHeight(700) ? 16 : down('md') ? 18 : 24
    this.descriptionText.troikaText.lineHeight = compactLandscape || down('md') ? 1 : 1.25

    this.titleText.troikaText.maxWidth = Math.min(this._root.width - paddingX - paddingX, compactLandscape ? 99999 : down('xl') ? 360 : 550) / this._root.height
    this.descriptionText.troikaText.maxWidth = Math.min(this._root.width - paddingX - paddingX, down('md') || compactLandscape ? 320 : 550) / this._root.height

    this.phoneNumber.textSize = compactLandscape || down('xxs') ? 15 : down('md') ? 18 : 20
    this.email.textSize = compactLandscape || down('xxs') ? 15 : down('md') ? 18 : 20

    this.titleText.stackSpacing = compactLandscape ? 16 : down('xl') ? 24 : 32
    this.descriptionText.stackSpacing = compactLandscape ? 16 : down('xl') ? 24 : 32
    this.phoneNumber.stackSpacing = compactLandscape ? 16 : down('xl') ? 24 : 32
    this.email.stackSpacing = compactLandscape ? 4 : 8
  }

  onUpdate() {
    this.background.material.uniforms.uOpacity.value = this.backgroundOpacityOla.value * 0.75
  }

  layout() {
    this.background.pixelX = this.stack.minX - 64
    this.background.pixelY = this.stack.minY - 128
    this.background.width = this.stack.width + 64
    this.background.height = this.stack.height + 256


    this.phoneNumber.troikaText.outlineColor = new three.Color('white').lerp(new three.Color('red'), this.phoneNumber.hoverOla.value)
    this.phoneNumber.troikaText.outlineOffsetX = this.phoneNumber.hoverOla.value * (1 / this._root.height)
    this.phoneNumber.troikaText.outlineOffsetY = this.phoneNumber.hoverOla.value * (1 / this._root.height)

    this.email.troikaText.outlineColor = new three.Color('white').lerp(new three.Color('red'), this.email.hoverOla.value)
    this.email.troikaText.outlineOffsetX = this.email.hoverOla.value * (1 / this._root.height)
    this.email.troikaText.outlineOffsetY = this.email.hoverOla.value * (1 / this._root.height)

    super.layout()
  }
}
