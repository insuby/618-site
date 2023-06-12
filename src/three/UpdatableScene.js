import * as three from 'three'

export default class UpdatableScene extends three.Scene {
  updateCallbacks = []
  resizeCallbacks = []

  add(object) {
    object.traverse(o => {
      if (o.onUpdate) {
        const callback = o.onUpdate.bind(o)

        this.updateCallbacks.push({object: o, callback})
      }

      if (o.onResize) {
        const callback = o.onResize.bind(o)

        this.resizeCallbacks.push(callback)
      }

      // TODO: Add remove handling
    })

    super.add(object)
  }

  onUpdate(frameInfo) {
    const updateInfo = {
      ...frameInfo,
      scene: this,
    }

    for (const {callback, object} of this.updateCallbacks) {
      let visible = true
      let parent = object

      // eslint-disable-next-line no-constant-condition
      while (true) {
        parent = parent.parent
        if (parent == null) {
          break
        }
        if (!parent.visible) {
          visible = false
          break
        }
      }

      if (visible) {
        callback(updateInfo)
      }
    }
  }

  onResize() {
    for (const resizeCallback of this.resizeCallbacks) {
      resizeCallback()
    }
  }
}
