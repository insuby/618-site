import * as three from 'three'
import UIElement from '../lib/UIElement'
import UIMenuItem from './UIMenuItem'
import {NO_TEAR_EFFECT_LAYER, TEAR_EFFECT_LAYER} from '../../layers'
import loadAssets from '../../utils/loadAssets'
import {loadTexture} from '../../utils/loaders'
import UILogo from './UILogo'
import UIHello from './UIHello'
import i18n from '../../../plugins/i18n'
import {down} from '../../../utils/breakpoints'
import UIStack from '../lib/UIStack'
import UILanguageMenuItem from './languageMenuItem/UILanguageMenuItem'
import store from '../../../store'

export default class UIMainContainer extends UIElement {
  async init() {
    this.ignoreInLayout = true

    this.assets = loadAssets({
      menuItemBackgroundTexture: loadTexture('common/menuItemBackground.basis'),
    })

    this.stack = new UIStack()
    this.stack.setAnchors(0, 1, 0, 1)
    this.stack.spacing = 20

    const worksMenuItemText = i18n.t('works.menuTitle').toUpperCase()
    this.worksMenuItem = new UIMenuItem(TEAR_EFFECT_LAYER, NO_TEAR_EFFECT_LAYER, worksMenuItemText, this.assets.menuItemBackgroundTexture)
    this.worksMenuItem.hoverPadding = new three.Vector4(20, 10, 0, 20)
    this.stack.add(this.worksMenuItem)

    const aboutMenuItemText = i18n.t('about.menuTitle').toUpperCase()
    this.aboutMenuItem = new UIMenuItem(TEAR_EFFECT_LAYER, NO_TEAR_EFFECT_LAYER, aboutMenuItemText, this.assets.menuItemBackgroundTexture)
    this.aboutMenuItem.hoverPadding = new three.Vector4(20, 20, 0, 10)
    this.stack.add(this.aboutMenuItem)

    const languages = store.state.languages.map(v => ({text: v.title, id: v.key}))
    const selectedLanguage = store.state.language

    this.languageMenuItem = new UILanguageMenuItem(languages, selectedLanguage, this.assets.menuItemBackgroundTexture)
    this.languageMenuItem.addEventListener('selectLanguage', ({language}) => {
      store.dispatch('selectLanguage', language)
    })

    this.logo = new UILogo(TEAR_EFFECT_LAYER, NO_TEAR_EFFECT_LAYER, this.assets.menuItemBackgroundTexture)
    this.logo.setAnchors(1, 1, 1, 1)
    this.logo.pixelY = -15
    this.logo.hoverPadding = new three.Vector4(20, 20, 40, 20)

    this.hello = new UIHello(TEAR_EFFECT_LAYER, NO_TEAR_EFFECT_LAYER)

    this.worksMenuItem.onClick(() => this.dispatchEvent({type: 'worksMenuItemClicked'}))
    this.aboutMenuItem.onClick(() => this.dispatchEvent({type: 'aboutMenuItemClicked'}))
    this.logo.onClick(() => this.dispatchEvent({type: 'logoClicked'}))

    this.add(this.stack)
    this.add(this.logo)
    this.add(this.hello)

    this.onResize()
  }

  setActivePage(page) {
    this.worksMenuItem.showShadow = page === 'works'
    this.aboutMenuItem.showShadow = page === 'about'
  }

  hideHello() {
    this.hello.hide()
  }

  onResize() {
    if (down('lg')) {
      this.add(this.languageMenuItem)
      this.languageMenuItem.pixelX = 30
      this.languageMenuItem.setAnchors(0, 0, 0, 0)
      this.languageMenuItem.pixelY = 12
    } else {
      this.stack.add(this.languageMenuItem)
    }
    this.logo.pixelX = down('xl') ? -15 : -15

    this.stack.pixelX = down('xl') ? 30 : 20
    this.stack.pixelY = down('xl') ? -14 : -20
  }
}
