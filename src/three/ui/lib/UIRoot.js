import * as three from 'three'
import UIElement from './UIElement'
import { frameInfo } from '../../../utils/raf'

export default class UIRoot extends UIElement {
  _isUIRoot = true
  _hoverableGroups = []
  _hoveredGroups = []
  _wasClicked = false
  _wasMouseDownTriggered = false
  _isTouched = false
  _clickMouseX = 0
  _clickMouseY = 0
  _mouseX = 0
  _mouseY = 0
  _lastHoverCursor = null
  _lastUrl = null
  _worldSpace = false
  clickTolerance = 8

  constructor(engine, camera) {
    super()

    this.engine = engine
    this.canvas = this.engine.renderer.domElement
    this.camera = camera
    this._worldSpace = camera != null

    this.canvas.addEventListener('touchstart', this._onTouchStart.bind(this), { passive: true })
    this.canvas.addEventListener('touchend', this._onTouchEnd.bind(this), { passive: true })

    window.addEventListener('mousemove', this._onMouseMove.bind(this), { passive: true })

    this.canvas.addEventListener('mousedown', this._onMouseDown.bind(this), { passive: true })
    this.canvas.addEventListener('touchstart', this._onMouseDown.bind(this), { passive: true })
    this.canvas.addEventListener('mouseup', this._onMouseUp.bind(this), { passive: true })
    this.canvas.addEventListener('touchend', this._onMouseUp.bind(this), { passive: true })

    this.raycasterTarget = new three.Mesh(new three.PlaneBufferGeometry(1, 1), new three.MeshBasicMaterial())
    this.raycaster = new three.Raycaster()

    this.onResize()
  }

  get worldSpace() {
    return this._worldSpace
  }

  set worldSpace(worldSpace) {
    this._worldSpace = worldSpace
    this.onResize()
  }

  _onMouseDown(e) {
    this._clickMouseX = e.clientX / window.innerWidth
    this._clickMouseY = 1 - (e.clientY / window.innerHeight)

    this._wasMouseDownTriggered = true
  }

  _onMouseUp(e) {
    this._mouseX = e.clientX / window.innerWidth
    this._mouseY = 1 - (e.clientY / window.innerHeight)

    const pixelMousePos = new three.Vector2(this._mouseX, this._mouseY)
      .multiply(new three.Vector2(window.innerWidth, window.innerHeight))
    const pixelClickedMousePos = new three.Vector2(this._clickMouseX, this._clickMouseY)
      .multiply(new three.Vector2(window.innerWidth, window.innerHeight))

    if (pixelMousePos.distanceTo(pixelClickedMousePos) < this.clickTolerance) {
      this._wasClicked = true
      this.onUpdate(frameInfo)
    }
  }

  _onTouchStart() {
    this._isTouched = true
  }

  _onTouchEnd() {
    setTimeout(() => {
      this._isTouched = false
    }, 0)
  }

  _onMouseMove(e) {
    this._isTouch = this._isTouched
    this._isTouched = false
    if (this._isTouch) {
      return
    }
    this._mouseX = e.clientX / window.innerWidth
    this._mouseY = 1 - (e.clientY / window.innerHeight)
  }

  onUpdate() {
    this.layout()

    function hasIntersection(x, y, minX, minY, maxX, maxY) {
      return x >= minX && x <= maxX && y >= minY && y <= maxY
    }

    let hoverCursor = null
    let url = null

    let clickMouseX = this._clickMouseX
    let clickMouseY = this._clickMouseY
    let mouseX = this._mouseX
    let mouseY = this._mouseY

    if (this.worldSpace) {
      super.add(this.raycasterTarget)
      this.raycasterTarget.updateMatrixWorld()
      this.raycaster.setFromCamera(new three.Vector2(this._mouseX * 2 - 1, -(1 - this._mouseY) * 2 + 1), this.camera)

      this.raycasterTarget.scale.x = this.engine.aspect
      this.raycasterTarget.position.x = this.engine.aspect / 2
      this.raycasterTarget.position.y = 0.5

      const r = this.raycaster.intersectObject(this.raycasterTarget)
      const uv = r?.[0]?.uv

      mouseX = uv ? uv.x : -1
      mouseY = uv ? uv.y : -1
      clickMouseX = uv ? uv.x : -1
      clickMouseY = uv ? uv.y : -1

      super.remove(this.raycasterTarget)
    }

    const enterCallbacks = []
    const exitCallbacks = []

    for (const group of this._hoverableGroups) {
      let hoverable = group.visible && !group.ignoreInHover
      let parent = group

      do {
        parent = parent.parent
        if (parent != null) {
          hoverable = hoverable && parent.visible && !parent.ignoreInHover
        }
      } while (parent != null && hoverable)

      if (!hoverable) {
        continue
      }

      const minX = (group._absPixelX - group.hoverPadding.w) / this.width
      const maxX = (group._absPixelX + group.width + group.hoverPadding.y) / this.width

      const minY = (group._absPixelY - group.hoverPadding.z) / this.height
      const maxY = (group._absPixelY + group.height + group.hoverPadding.x) / this.height

      if (this._wasClicked || this._wasMouseDownTriggered) {
        const intersection = hasIntersection(clickMouseX, clickMouseY, minX, minY, maxX, maxY)
        if (intersection && this._wasClicked) {
          group._handleClick()
          url = group.url
        } else {
          group._handleClickOutside()
        }
      }

      // Hover
      {
        const intersection = hasIntersection(mouseX, mouseY, minX, minY, maxX, maxY)

        if (intersection) {
          hoverCursor = group.hoverCursor
          url = group.url
        }

        if (intersection && !this._hoveredGroups.includes(group)) {
          this._hoveredGroups.push(group)
          enterCallbacks.push(() => group._handleHoverEnter())
        } else if (!intersection && this._hoveredGroups.includes(group)) {
          this._hoveredGroups = this._hoveredGroups.filter(g => g !== group)
          exitCallbacks.push(() => group._handleHoverExit())
        }
      }
    }

    for (const callback of enterCallbacks) {
      callback()
    }

    for (const callback of exitCallbacks) {
      callback()
    }

    if (hoverCursor !== this._lastHoverCursor || this._lastUrl !== url) {
      this.dispatchEvent({ type: 'hoverCursor', cursorType: hoverCursor, url })
      this._lastHoverCursor = hoverCursor
      this._lastUrl = url
    }

    this._wasClicked = false
    this._wasMouseDownTriggered = false
  }

  add(obj) {
    super.add(obj)

    if (obj._isUIElement) {
      obj.traverse(o => {
        if (o._isHoverable) {
          this._addHoverableGroup(o)
        }
      })

      obj.root = this
    }
  }

  remove(obj) {
    super.remove(obj)

    if (obj._isUIElement) {
      obj.root = undefined
      obj.traverse(o => {
        if (o._isHoverable) {
          this._removeHoverableGroup(o)
        }
      })
    }
  }

  _addHoverableGroup(group) {
    this._hoverableGroups.push(group)
  }

  _removeHoverableGroup(group) {
    this._hoverableGroups = this._hoverableGroups.filter(g => g !== group)
  }

  onResize() {
    this.width = this.engine.width
    this.height = this.engine.height
    this.pixelRatio = this.engine.pixelRatio
    this.renderWidth = this.width * this.pixelRatio
    this.renderHeight = this.height * this.pixelRatio
    this.aspect = this.width / this.height
    this.isLandscale = this.aspect > 1
    this.isPortrait = !this.isLandscale

    if (this.worldSpace) {
      this._sceneWidth = this.engine.aspect
      this._sceneHeight = 1
      this._sceneX = 0
      this._sceneY = 0
    } else {
      this._sceneWidth = this.engine.aspect
      this._sceneHeight = 1
      this._sceneX = -this.engine.aspect / 2
      this._sceneY = -0.5
    }

    if (!this.worldSpace) {
      this.position.x = this._sceneX
      this.position.y = this._sceneY
    }

    this._worldX = this._sceneX
    this._worldY = this._sceneY

    this.markDirty()
  }
}
