import * as three from 'three'

function addSetterAndGetter(theClass, propertyName, defaultValue) {
  Object.defineProperty(theClass.prototype, propertyName, {
    get() {
      return this['_' + propertyName]
    },
    set(value) {
      if (value !== this['_' + propertyName]) {
        this['_' + propertyName] = value
        this.markDirty()
      }
    },
  })
  Object.defineProperty(theClass.prototype, '_' + propertyName, {
    value: defaultValue,
    configurable: true,
    writable: true,
  })
}

class UIElement extends three.Group {
  hoverPadding = new three.Vector4(0, 0, 0, 0)
  hoverCursor = 'pointer'
  _url = null
  _dirty = true
  _layoutCallbacks = []
  _hoverEnterCallbacks = []
  _hoverExitCallbacks = []
  _clickCallbacks = []
  _clickOutsideCallbacks = []
  _isHovered = false

  _isUIElement = true

  _absPixelX = 0
  _absPixelY = 0

  _sceneX = 0
  _sceneY = 0
  _sceneWidth = 1
  _sceneHeight = 1

  _worldX = 0
  _worldY = 0

  add(obj) {
    super.add(obj)

    if (obj._isUIElement && this._root) {
      obj.traverse(o => {
        if (o._isHoverable) {
          this._root._addHoverableGroup(o)
        }
      })

      obj.root = this._root
    }
  }

  remove(obj) {
    super.remove(obj)

    if (obj._isUIElement && this._root) {
      obj.root = undefined
      obj.traverse(o => {
        if (o._isHoverable) {
          this._root._removeHoverableGroup(o)
        }
      })
    }
  }

  get root() {
    return this._root
  }

  set root(root) {
    this._root = root
    for (const child of this.children) {
      child.root = root
    }
  }

  get url() {
    return this._url
  }

  set url(url) {
    if (this._url !== url) {
      this._url = url
      this._recalculateIsHoverable()
    }
  }

  get minX() {
    return this.pixelX - this._width * this._anchorX + (this._layoutParent?.width ?? 0) * this._parentAnchorX
  }

  get maxX() {
    return this.pixelX - this._width * this._anchorX + this.width + (this._layoutParent?.width ?? 0) * this._parentAnchorX
  }

  get minY() {
    return this.pixelY - this._height * this._anchorY + (this._layoutParent?.height ?? 0) * this._parentAnchorY
  }

  get maxY() {
    return this.pixelY - this._height * this._anchorY + this._height + (this._layoutParent?.height ?? 0) * this._parentAnchorY
  }

  get absPixelX() {
    return this._absPixelX
  }

  get absPixelY() {
    return this._absPixelY
  }

  setAnchors(anchorX, anchorY, parentAnchorX, parentAnchorY) {
    let dirty = false

    if (anchorX != null && anchorX !== this._anchorX) {
      this._anchorX = anchorX
      dirty = true
    }
    if (anchorY != null && anchorY !== this._anchorY) {
      this._anchorY = anchorY
      dirty = true
    }
    if (parentAnchorX != null && parentAnchorX !== this._parentAnchorX) {
      this._parentAnchorX = parentAnchorX
      dirty = true
    }
    if (parentAnchorY != null && parentAnchorY !== this._parentAnchorY) {
      this._parentAnchorY = parentAnchorY
      dirty = true
    }

    if (dirty) {
      this.markDirty()
    }
  }

  onBeforeLayout(callback) {
    this._layoutCallbacks.push(callback)
  }

  clearHoverEnterCallbacks() {
    this._hoverEnterCallbacks = []
    this._recalculateIsHoverable()
  }

  clearHoverExitCallbacks() {
    this._hoverExitCallbacks = []
    this._recalculateIsHoverable()
  }

  clearClickCallbacks() {
    this._clickCallbacks = []
    this._recalculateIsHoverable()
  }

  onClickOutside(callback) {
    this._clickOutsideCallbacks.push(callback)
    this._recalculateIsHoverable()
    return () => {
      this._clickOutsideCallbacks = this._clickOutsideCallbacks.filter(c => c !== callback)
      this._recalculateIsHoverable()
    }
  }

  onHoverEnter(callback) {
    this._hoverEnterCallbacks.push(callback)
    this._recalculateIsHoverable()
    return () => {
      this._hoverEnterCallbacks = this._hoverEnterCallbacks.filter(c => c !== callback)
      this._recalculateIsHoverable()
    }
  }

  onHoverExit(callback) {
    this._hoverExitCallbacks.push(callback)
    this._recalculateIsHoverable()
    return () => {
      this._hoverExitCallbacks = this._hoverExitCallbacks.filter(c => c !== callback)
      this._recalculateIsHoverable()
    }
  }

  onClick(callback) {
    this._clickCallbacks.push(callback)
    this._recalculateIsHoverable()
    return () => {
      this._clickCallbacks = this._clickCallbacks.filter(c => c !== callback)
      this._recalculateIsHoverable()
    }
  }

  _handleHoverEnter() {
    if (!this._isHovered) {
      for (const callback of this._hoverEnterCallbacks) {
        callback()
      }
      this._isHovered = true
    }
  }

  _handleHoverExit() {
    if (this._isHovered) {
      for (const callback of this._hoverExitCallbacks) {
        callback()
      }
      this._isHovered = false
    }
  }

  _handleClick() {
    for (const callback of this._clickCallbacks) {
      callback()
    }
  }

  _handleClickOutside() {
    for (const callback of this._clickOutsideCallbacks) {
      callback()
    }
  }

  _recalculateIsHoverable() {
    const isHoverable =
      this.url != null ||
      this._hoverEnterCallbacks.length !== 0 ||
      this._clickCallbacks.length !== 0 ||
      this._clickOutsideCallbacks.length !== 0 ||
      this._hoverExitCallbacks !== 0

    if (isHoverable === this._isHoverable) {
      return
    }
    this._isHoverable = isHoverable
    if (isHoverable) {
      this._root?._addHoverableGroup(this)
    } else {
      this._root?._removeHoverableGroup(this)
    }
  }

  layout() {
    for (const callback of this._layoutCallbacks) {
      callback({ dirty: this._dirty, group: this })
    }

    let parent = this
    do {
      if (parent.parent === null) {
        break
      }
      parent = parent.parent
    } while (parent.ignoreInLayout)

    if (parent === this) {
      throw new Error()
    }

    this._layoutParent = parent

    if (!this._isUIRoot && this._dirty) {
      const pr = this._root.pixelRatio

      // x
      let x = this._pixelX * pr

      x -= this._width * this._anchorX * pr
      x += parent.width * this._parentAnchorX * pr


      if (this.pixelPerfect) {
        x = Math.round(x)
        x += 0.5
      }

      this._absPixelX = (x + (parent._absPixelX * pr)) / pr
      if (this.pixelPerfect) {
        this._absPixelX = Math.round(this._absPixelX)
      }


      // y
      let y = this._pixelY * pr

      y -= this._height * this._anchorY * pr
      y += parent.height * this._parentAnchorY * pr

      if (this.pixelPerfect) {
        y = Math.round(y)
        y += 0.5
      }

      this._absPixelY = Math.floor((y + (parent._absPixelY * pr)) / pr)
      if (this.pixelPerfect) {
        this._absPixelY = Math.round(this._absPixelY)
      }

      this._sceneX = x / (this._root.height * pr)
      this._sceneY = y / (this._root.height * pr)


      if (this.pixelPerfect) {
        // One pixel is always one pixel
        let screenWidth = this._width === 1 ? 1 : Math.floor(this._width * pr)
        let screenHeight = this._height === 1 ? 1 : Math.floor(this._height * pr)

        // Make sure even numbers stay even
        if (this._width % 2 !== screenWidth % 2) {
          screenWidth--
        }

        // Make sure even numbers stay even
        if (this._height % 2 !== screenHeight % 2) {
          screenHeight--
        }

        this._sceneWidth = screenWidth / (this._root.height * pr)
        this._sceneHeight = screenHeight / (this._root.height * pr)
      } else {
        this._sceneWidth = this._width / this._root.height
        this._sceneHeight = this._height / this._root.height
      }

      this._worldX = this._sceneX + parent._worldX
      this._worldY = this._sceneY + parent._worldY

      this.position.x = this._sceneX
      this.position.y = this._sceneY
    }

    for (const child of this.children) {
      if (child.visible && child._isUIElement) {
        child.layout()
      }
    }

    this.markClean()
  }

  updateMatrixWorld() {
    if (!this.visible) {
      return
    }
    super.updateMatrixWorld()
  }

  markDirty() {
    if (this._dirty) {
      return
    }

    this._dirty = true
    for (const child of this.children) {
      if (child._isUIElement) {
        child.markDirty()
      }
    }
  }

  markClean() {
    this._dirty = false
  }
}


addSetterAndGetter(UIElement, 'width', 0)
addSetterAndGetter(UIElement, 'height', 0)
addSetterAndGetter(UIElement, 'anchorX', 0)
addSetterAndGetter(UIElement, 'anchorY', 0)
addSetterAndGetter(UIElement, 'parentAnchorX', 0)
addSetterAndGetter(UIElement, 'parentAnchorY', 0)
addSetterAndGetter(UIElement, 'pixelX', 0)
addSetterAndGetter(UIElement, 'pixelY', 0)
addSetterAndGetter(UIElement, 'pixelPerfect', false)
addSetterAndGetter(UIElement, 'ignoreInLayout', false)
addSetterAndGetter(UIElement, 'ignoreInHover', false)


export default UIElement
