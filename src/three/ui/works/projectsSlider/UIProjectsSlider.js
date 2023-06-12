import * as three from 'three'
import UIElement from '../../lib/UIElement'
import UIProjectTitle from './UIProjectTitle'
import SpringOla from '../../../../utils/SpringOla'
import { down, downHeight } from '../../../../utils/breakpoints'

export default class UIProjectsSlider extends UIElement {
  constructor(tearEffectLayer, noTearEffectLayer, projects) {
    super()

    this.titles = []

    for (const { id, title } of projects) {
      const uiTitle = new UIProjectTitle(tearEffectLayer, noTearEffectLayer, title)
      uiTitle.setAnchors(0.5, 1, 0, 0)
      uiTitle.onClick(() => this.dispatchEvent({ type: 'select', id }))
      uiTitle.userData = { id, title, yOla: new SpringOla(0, { stiffness: 150, damping: 30 }) }
      this.titles.push(uiTitle)
      this.add(uiTitle)
    }

    this.selectProject(projects[0].id)

    this.onResize()
  }

  onUpdate({ deltaTime }) {
    for (const uiTitle of this.titles) {
      uiTitle.userData.yOla.update(deltaTime)
    }
  }

  selectProject(id) {
    if (this.selectedProject != null) {
      const lastTitle = this.titles.find(t => t.userData.id === this.selectedProject)
      lastTitle.selected = false
    }

    this.selectedProject = id
    this.selectedProjectIndex = this.titles.findIndex(t => t.userData.id === id)
    const title = this.titles[this.selectedProjectIndex]
    title.selected = true

    this.markDirty()

    this.updateTitlesVisibility()
  }

  onResize() {
    const padding = down('lg') ? 24 : 64

    for (const uiTitle of this.titles) {
      uiTitle.hoverPadding = new three.Vector4(padding, padding, padding, padding)
    }

    this.updateTitlesVisibility()
  }

  updateTitlesVisibility() {
    for (let i = 0; i < this.titles.length; i++) {
      const uiTitle = this.titles[i]
      if (down('md')) {
        const indexDistance = Math.abs(i - this.selectedProjectIndex)
        uiTitle.displayed = indexDistance <= (downHeight(700) ? 1 : 2)
      } else {
        uiTitle.displayed = true
      }
    }
  }

  layout() {
    super.layout()

    const spacing = downHeight(700) && this._root.isPortrait || down('lg') ? 32 : 64

    const selectedIndex = this.titles.findIndex(t => t.selected)
    const selectedUiTitle = this.titles[selectedIndex]
    selectedUiTitle.userData.yOla.value = selectedUiTitle.selectedHeight / 2
    let nIndex = selectedIndex
    let pIndex = selectedIndex
    let nY = -selectedUiTitle.selectedHeight / 2
    let pY = selectedUiTitle.selectedHeight / 2

    do {
      nIndex--
      pIndex++

      if (nIndex >= 0) {
        const uiTitle = this.titles[nIndex]
        pY += uiTitle.unselectedHeight
        pY += spacing
        uiTitle.userData.yOla.value = pY
      }
      if (pIndex <= this.titles.length - 1) {
        const uiTitle = this.titles[pIndex]
        nY -= spacing
        uiTitle.userData.yOla.value = nY
        nY -= uiTitle.unselectedHeight
      }
    } while (nIndex >= 0 || pIndex <= this.titles.length - 1)

    for (const uiTitle of this.titles) {
      if (uiTitle.userData.yOla.value === 0) {
        const spring = uiTitle.userData.yOla._springs[0].spring
        spring._value = spring.targetValue
      }
      uiTitle.pixelY = uiTitle.userData.yOla.value
    }
  }
}
