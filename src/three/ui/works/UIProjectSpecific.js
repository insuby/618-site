import * as three from 'three'
import Ola from 'ola'
import UIElement from '../lib/UIElement'
import UIBackButton from '../common/UIBackButton'
import { NO_TEAR_EFFECT_LAYER, TEAR_EFFECT_LAYER } from '../../layers'
import UIText from '../lib/UIText'
import font from '../../../../assets/fonts/Gramatika-Regular.otf'
import boldFont from '../../../../assets/fonts/Gramatika-Bold.otf'
import shiftedFont from '../../../../assets/fonts/Gramatika-Shifted.otf'
import UIStack from '../lib/UIStack'
import UIList from '../common/list/UIList'
import i18n from '../../../plugins/i18n'
import { down, downHeight } from '../../../utils/breakpoints'
import { isTouch } from '../../../plugins/isTouchScreen'

export default class UIProjectSpecific extends UIElement {
  constructor(projects, project) {
    super()

    this.ignoreInLayout = true
    this.project = project

    this.stack = new UIStack('v', 32)

    this.backButton = new UIBackButton(TEAR_EFFECT_LAYER, i18n.t('common.back'))
    this.backButton.hoverPadding = new three.Vector4(32, 64, 32, 64)
    this.backButton.onClick(() => this.dispatchEvent({ type: 'back' }))


    this.titleText = new UIText(project.title.toUpperCase(), boldFont, 58)
    this.titleText.troikaText.layers.set(TEAR_EFFECT_LAYER)


    this.descriptionText = new UIText(project.description, font, 20)
    this.descriptionText.troikaText.layers.set(TEAR_EFFECT_LAYER)
    this.descriptionText.troikaText.outlineWidth = '0.00000001%'
    this.descriptionText.troikaText.outlineColor = new three.Color('white')


    this.links = new UIStack('h', 16)
    for (const { title, link: url } of project.links ?? []) {
      const link = new UIText(title, shiftedFont, 20)
      link.troikaText.outlineWidth = '1%'
      link.troikaText.layers.set(TEAR_EFFECT_LAYER)
      link.url = url
      link.hoverOla = Ola(0, 150)
      link.onHoverEnter(() => link.hoverOla.value = isTouch ? 0 : 1)
      link.onHoverExit(() => link.hoverOla.value = 0)
      this.links.add(link)
    }


    this.list = new UIList(TEAR_EFFECT_LAYER, NO_TEAR_EFFECT_LAYER, projects.map(p => ({ id: p.id })))
    this.list.addEventListener('select', project => {
      this.list.select(project.id)
      this.dispatchEvent({ type: 'selectProject', project })
    })
    this.list.setAnchors(1, 0, 1, 0)


    this.stack.add(this.backButton)
    this.stack.add(this.titleText)
    this.stack.add(this.descriptionText)
    this.stack.add(this.links)


    this.add(this.stack)
    this.add(this.list)
  }

  onResize() {
    const compactLandscape = this._root.isLandscale && down('lg') && downHeight(700)

    this.descriptionText.visible = !compactLandscape

    const paddingX = down('xxs') ? 15 : 30
    const paddingY = 15

    this.stack.pixelX = paddingX
    this.stack.pixelY = paddingY

    this.titleText.textSize = compactLandscape || down('xxs') ? 28 : down('md') ? 36 : down('xxl') ? 55 : 90
    this.descriptionText.textSize = compactLandscape || downHeight(700) ? 16 : down('md') ? 18 : 24
    this.descriptionText.troikaText.lineHeight = down('md') ? 1 : 1.25
    for (const link of this.links.children) {
      link.textSize = down('xxs') ? 15 : down('md') ? 18 : 20
      const padding = down('xxs') ? 6 : 12
      link.hoverPadding = new three.Vector4(padding, padding, padding, padding)
    }

    this.titleText.stackSpacing = compactLandscape || down('md') ? 12 : down('xl') ? 24 : 32
    this.descriptionText.stackSpacing = compactLandscape || down('md') ? 12 : down('xl') ? 24 : 32
    this.links.stackSpacing = this.links.children.length === 0 ? 0 : ((compactLandscape || down('md') ? 12 : down('xl') ? 24 : 32) * 1.2)

    this.list.pixelX = -15 - 15
    this.list.pixelY = 15

    this.titleText.troikaText.maxWidth = (down('xl') ? Math.min(400, this._root.width - paddingX * 3) : 700) / this._root.height
    this.descriptionText.troikaText.maxWidth = (down('lg') ? Math.min(400, this._root.width - paddingX * 3) : 700) / this._root.height
  }

  layout() {
    super.layout()
    for (const link of this.links.children) {
      link.troikaText.outlineColor = new three.Color('white').lerp(new three.Color('red'), link.hoverOla.value)
      link.troikaText.outlineOffsetX = link.hoverOla.value * (1 / this._root.height)
      link.troikaText.outlineOffsetY = link.hoverOla.value * (1 / this._root.height)
    }
  }
}
