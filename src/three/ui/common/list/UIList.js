import * as three from 'three'
import UIElement from '../../lib/UIElement'
import UIListItem from './UIListItem'
import { down } from '../../../../utils/breakpoints'

export default class UIList extends UIElement {
  constructor(tearEffectLayer, noTearEffectLayer, items) {
    super()

    this.uiItems = items.map(({ id, title }) => {
      const uiItem = new UIListItem(tearEffectLayer, title ? title.toUpperCase() : '')

      uiItem.onClick(() => this.dispatchEvent({ type: 'select', id }))

      uiItem.userData = { id, title: title ? title.toUpperCase() : '' }

      this.add(uiItem)

      return uiItem
    })

    this.uiItems[0].setSelected(true)

    this.onResize()
  }

  select(id) {
    for (const uiItem of this.uiItems) {
      uiItem.setSelected(uiItem.userData.id === id)
    }
  }

  onResize() {
    this.verticalSpacing = down('xl') ? 6 : 8

    for (let i = 0; i < this.uiItems.length; i++) {
      const uiItem = this.uiItems[i]

      uiItem.hoverPadding = new three.Vector4(
        this.verticalSpacing / (i === 0 ? 1 : 2),
        10,
        this.verticalSpacing / (i === this.uiItems.length - 1 ? 1 : 2),
        10,
      )
    }
  }

  layout() {
    const dirty = this._dirty

    super.layout()

    if (dirty) {
      let previousY = 0

      for (let i = this.uiItems.length - 1; i >= 0; i--) {
        const uiItem = this.uiItems[i]
        uiItem.pixelY = previousY

        previousY += uiItem.height + this.verticalSpacing
      }

      const lastUIItem = this.uiItems[0]
      this.height = lastUIItem.pixelY + lastUIItem.height
    }
  }
}
