/* eslint-disable max-len */
import * as three from 'three'
import {WebGLRenderTarget} from 'three'
import {EffectComposer} from 'three/examples/jsm/postprocessing/EffectComposer'
import {RenderPass} from 'three/examples/jsm/postprocessing/RenderPass'
import {SavePass} from 'three/examples/jsm/postprocessing/SavePass'
import {ShaderPass} from 'three/examples/jsm/postprocessing/ShaderPass'
import cloneDeep from 'lodash/cloneDeep'
import Ola from 'ola'
import throttle from 'lodash/throttle'
import UpdatableScene from '../../UpdatableScene'
import UIRoot from '../../ui/lib/UIRoot'
import CallbackPass from '../../passes/CallbackPass'
import RenderTexturePass from '../../passes/RenderTexturePass'
import TearShader from '../../shaders/tear/TearShader'
import UIMainContainer from '../../ui/main/UIMainContainer'
import {HEXAGON_BACKGROUND_LAYER, NO_TEAR_EFFECT_LAYER, TEAR_EFFECT_LAYER} from '../../layers'
import UIWorksContainer from '../../ui/works/UIWorksContainer'
import HexagonDistortionShader from '../../shaders/hexagonDistortion/HexagonDistortionShader'
import {outPower4} from '../../../utils/easings'
import UIAboutContainer from '../../ui/about/UIAboutContainer'
import {isTouch} from '../../../plugins/isTouchScreen'
import UnlitShader from '../../shaders/unlit/UnlitShader'
import {down} from '../../../utils/breakpoints'
import store from '../../../store'
import {WORK_OPEN_CLASS} from "../../../constants";

let xDown = null;
let yDown = null;


export default class UIScene extends UpdatableScene {
  async init(engine) {
    this.engine = engine
    this.renderer = engine.renderer

    this.transitionFromElements = []
    this.transitionToElements = []
    this.transitionDuration = 1500
    this.transitionOla = Ola(1, this.transitionDuration)

    this.initCamera()
    this.initComposer()
    await this.loadData()
    await this.initObjects()

    this.mouseX = -1
    this.mouseY = -1

    const onKeyDown = throttle(this.onKeyDownThrottled.bind(this), 300, {leading: true, trailing: false})

    const onWheel = throttle(e => this.onWheel(e), 750, {leading: true, trailing: false})

    window.addEventListener('mousemove', this.onMouseMove.bind(this))
    window.addEventListener('keydown', this.onKeyDown.bind(this))
    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('wheel', e => {
      if (Math.abs(e.deltaY) > 50) {
        onWheel(e)
      }
    })
    window.addEventListener('swipeup', () => onWheel({deltaY: 100}))
    window.addEventListener('swipedown', () => onWheel({deltaY: -100}))

    window.addEventListener('touchstart', this.handleTouchStart.bind(this), false);
    window.addEventListener('touchmove', this.handleTouchMove.bind(this), false);

    this.onResize()
    this.onMouseMove({clientX: -1000, clientY: -1000})
    
    window._UIScene = this
  }

  async loadData() {
    this.categories = cloneDeep(store.state.categories).filter(c => c.projects.length !== 0)
    this.projects = cloneDeep(store.state.projects)

    for (const category of this.categories) {
      category.projects = category.projects.map(id => this.projects.find(p => id === p.id))
    }

    for (let i = 0; i < this.projects.length; i++) {
      this.projects[i].video = this.projects[i].video.uploads
    }
  }

  handleTouchStart(evt) {
    xDown = evt.touches[0].clientX;
    yDown = evt.touches[0].clientY;
  };

  handleTouchMove(evt) {
    if (!xDown || !yDown) {
      return;
    }

    let xUp = evt.touches[0].clientX;
    let yUp = evt.touches[0].clientY;

    let xDiff = xDown - xUp;
    let yDiff = yDown - yUp;

    if (Math.abs(xDiff) > Math.abs(yDiff)) {
      if (xDiff > 0) {
        console.log('left')
        /* свайп влево */
      } else {
        console.log('right')
        /* свайп вправо */
        this.uiWorksContainer.closeProject()
      }
    }

    xDown = null;
    yDown = null;
  }

  onMouseMove(e) {
    this.mouseX = e.clientX / window.innerWidth
    this.mouseY = e.clientY / window.innerHeight

    this.tearEffectUIPass.uniforms.uMousePos.value.x = this.mouseX
    this.tearEffectUIPass.uniforms.uMousePos.value.y = this.mouseY
    this.hexagonBackgroundDistortionPass.uniforms.uMousePos.value.x = this.mouseX
    this.hexagonBackgroundDistortionPass.uniforms.uMousePos.value.y = this.mouseY
  }

  onKeyDown({code}) {
    if (this.transitionOla.value < 0.35) {
      return
    }

    if (code === 'Space' || code === 'Enter') {
      if (this.uiWorksContainer.displayed) {
        this.uiWorksContainer.openProject()
      }
    }
    if (code === 'Escape' || code === 'Backspace') {
      if (this.uiWorksContainer.displayed && this.uiWorksContainer.opened) {
        this.uiWorksContainer.closeProject()
      } else {
        this.closeAll()
      }
    }
    if (code === 'Digit1') {
      this.openWorks()
    }
    if (code === 'Digit2') {
      this.openAbout()
    }
  }

  onKeyDownThrottled({code}) {
    if (this.transitionOla.value < 0.35) {
      return
    }

    if (this.uiWorksContainer.displayed) {
      if (['KeyS', 'ArrowDown'].includes(code)) {
        this.uiWorksContainer.selectNextProject()
      } else if (['KeyW', 'ArrowUp'].includes(code)) {
        this.uiWorksContainer.selectPreviousProject()
      }
      if (['KeyD', 'ArrowRight'].includes(code)) {
        // На внутренней странице проекта - сделать свайпом (вправо наверное) тоже самое что делает кнопка back.
        this.uiWorksContainer.closeProject()
      } else if (['KeyA', 'ArrowLeft'].includes(code)) {
        this.uiWorksContainer.selectPreviousCategory()
      }
    }
  }

  onWheel({deltaY}) {
    if (!this.uiWorksContainer.displayed || this.transitionOla.value < 0.35) {
      return
    }

    if (deltaY > 0) {
      this.uiWorksContainer.selectNextProject()
    } else {
      this.uiWorksContainer.selectPreviousProject()
    }
  }

  initCamera() {
    this.camera = new three.OrthographicCamera(-1, 1, 1, -1, -100, 100)
    this.camera.position.z = 10
    this.camera.lookAt(new three.Vector3())

    // this.add(this.camera)
  }

  initComposer() {
    // Setup
    this.previousTearEffectRT = new WebGLRenderTarget(this.engine.renderWidth, this.engine.renderHeight)
    this.currentTearEffectRT = new WebGLRenderTarget(this.engine.renderWidth, this.engine.renderHeight)
    this.composer = new EffectComposer(this.renderer)
    this.composer.renderToScreen = false

    // Render ui with tear effect and save it to a texture
    this.composer.addPass(new CallbackPass(() => {
      this.camera.layers.set(TEAR_EFFECT_LAYER)
    }))
    const renderTearEffectPass = new RenderPass(this, this.camera, null, new three.Color('black'), 0)
    renderTearEffectPass.needsSwap = false
    const saveToPreviousTearEffectRTPass = new SavePass(this.previousTearEffectRT)

    this.composer.addPass(new CallbackPass(() => {
      renderTearEffectPass.enabled = !isTouch || (this.transitionOla.value >= 0 && this.transitionOla.value < 1)
      saveToPreviousTearEffectRTPass.enabled = renderTearEffectPass.enabled
      this.transitionFromElements.forEach(e => e.visible = true)
      this.transitionToElements.forEach(e => e.visible = false)
    }))
    this.composer.addPass(renderTearEffectPass)
    this.composer.addPass(saveToPreviousTearEffectRTPass)

    this.composer.addPass(new CallbackPass(() => {
      renderTearEffectPass.enabled = true
      this.transitionFromElements.forEach(e => e.visible = false)
      this.transitionToElements.forEach(e => e.visible = true)
    }))
    this.composer.addPass(renderTearEffectPass)
    this.composer.addPass(new SavePass(this.currentTearEffectRT))
    this.composer.addPass(new CallbackPass(() => {
      this.transitionFromElements.forEach(e => e.visible = true)
      this.transitionToElements.forEach(e => e.visible = true)
    }))

    // Render hexagon background
    this.composer.addPass(new CallbackPass(() => {
      this.camera.layers.set(HEXAGON_BACKGROUND_LAYER)
    }))
    const renderHexagonBackgroundPass = new RenderPass(this, this.camera, null, new three.Color('black'), 0)
    renderHexagonBackgroundPass.needsSwap = false
    this.composer.addPass(renderHexagonBackgroundPass)

    // Apply hexagon background distortion
    this.hexagonBackgroundDistortionPass = new ShaderPass(cloneDeep(HexagonDistortionShader), 'uMap')
    this.hexagonBackgroundDistortionPass.needsSwap = true
    this.composer.addPass(new CallbackPass(() => {
      this.hexagonBackgroundDistortionPass.enabled = !isTouch
    }))
    this.composer.addPass(this.hexagonBackgroundDistortionPass)


    // Render ui without tear effect on top on hexagon background
    this.composer.addPass(new CallbackPass(() => {
      this.camera.layers.set(NO_TEAR_EFFECT_LAYER)
    }))
    const noTearRenderPass = new RenderPass(this, this.camera)
    noTearRenderPass.needsSwap = true
    noTearRenderPass.clear = false
    this.composer.addPass(noTearRenderPass)


    // Render tear effect ui on top of everything else
    this.tearEffectUIPass = new RenderTexturePass(TearShader)
    this.tearEffectUIPass.uniforms.uMap.value = this.previousTearEffectRT.texture
    this.tearEffectUIPass.uniforms.uMap2.value = this.currentTearEffectRT.texture
    this.composer.addPass(new CallbackPass(() => {
      this.tearEffectUIPass.enabled = !isTouch || (this.transitionOla.value > 0 && this.transitionOla.value < 1)
      this.tearEffectUIPass.uniforms.uTransitionProgress.value = outPower4(this.transitionOla.value)
      this.tearEffectUIPass.uniforms.uLocalTearIntensity.value.y = isTouch ? 0 : (64 / this.engine.height)
      this.tearEffectUIPass.uniforms.uLocalTearIntensity.value.x = isTouch ? 0 :
        this.tearEffectUIPass.uniforms.uLocalTearIntensity.value.y / this.engine.aspect
    }))
    this.composer.addPass(this.tearEffectUIPass)


    // Render tear effect ui on top of everything else without tear effect for touch screens
    this.touchTearEffectUIPass = new RenderTexturePass(UnlitShader)
    this.touchTearEffectUIPass.uniforms.uMap.value = this.currentTearEffectRT.texture
    this.composer.addPass(new CallbackPass(() => {
      this.touchTearEffectUIPass.enabled = !this.tearEffectUIPass.enabled
    }))
    this.composer.addPass(this.touchTearEffectUIPass)
  }


  async initObjects() {
    this.uiRoot = new UIRoot(this.engine)
    this.uiRoot.addEventListener('hoverCursor', t => this.dispatchEvent(t))


    this.uiWorksContainer = await new UIWorksContainer()
    this.uiMainContainer = new UIMainContainer()
    this.uiAboutContainer = new UIAboutContainer()

    this.uiRoot.add(this.uiMainContainer)
    this.uiRoot.add(this.uiWorksContainer)
    this.uiRoot.add(this.uiAboutContainer)

    this.uiMainContainer.init()
    this.uiAboutContainer.init()

    await this.uiWorksContainer.init(this.categories, this.projects)
    this.uiWorksContainer.visible = false
    this.uiWorksContainer.displayed = false


    this.uiMainContainer.addEventListener('worksMenuItemClicked', this.openWorks.bind(this))
    this.uiMainContainer.addEventListener('aboutMenuItemClicked', this.openAbout.bind(this))
    this.uiMainContainer.addEventListener('logoClicked', this.onLogoClicked.bind(this))

    this.uiWorksContainer.addEventListener('transition', e => {
      let fromElements = e.fromElements ?? e.fromElement
      fromElements = Array.isArray(fromElements) ? fromElements : [fromElements]
      let toElements = e.toElements ?? e.toElement
      toElements = Array.isArray(toElements) ? toElements : [toElements]

      if (e.event === 'openProject' && down('xl')) {
        fromElements.push(this.uiMainContainer.languageMenuItem)
        this.uiMainContainer.languageMenuItem.ignoreInHover = true
      } else if (e.event === 'closeProject' && (down('xl') || this.uiMainContainer.languageMenuItem.ignoreInHover)) {
        toElements.push(this.uiMainContainer.languageMenuItem)
        this.uiMainContainer.languageMenuItem.ignoreInHover = false
      }

      this.doTransition(fromElements, toElements)
    })


    this.uiAboutContainer.addEventListener('back', () => {
      if (this.wasWorksContainerDisplayed) {
        this.openWorks()
        if (this.wasWorksContainerOpened) {
          this.uiWorksContainer.hideCategorySpecificUI()
          setTimeout(() => {
            this.uiWorksContainer.openProject(this.uiAboutContainer)
          }, 50)
        }
      } else {
        this.closeAll()
      }
    })

    this.add(this.uiRoot)
  }

    onLogoClicked() {
    this.closeAll(true)
    this.dispatchEvent({type: 'logoClicked'})
  }

  closeAll(dispatchEvent = true) {
    if (this.uiWorksContainer.displayed) {
      this.doTransition(this.uiWorksContainer, null)
      this.uiWorksContainer.displayed = false
    }
    if (this.uiAboutContainer.displayed) {
      this.doTransition(this.uiAboutContainer, null)
      this.uiAboutContainer.displayed = false
    }
    if (dispatchEvent) {
      this.dispatchEvent({type: 'closeAll'})
    }

    this.uiMainContainer.setActivePage(null)
    document.querySelector('body').classList.remove(WORK_OPEN_CLASS)
  }

  openWorks() {
    if (this.uiWorksContainer.displayed) {
      this.closeAll()
    } else {
      this.dispatchEvent({type: 'openWorks'})
      this.doTransition(this.uiAboutContainer.displayed ? this.uiAboutContainer : null, this.uiWorksContainer)
      this.uiAboutContainer.displayed = false
      this.uiWorksContainer.displayed = true
      this.uiMainContainer.setActivePage('works')
      document.querySelector('body').classList.add(WORK_OPEN_CLASS)
    }
  }

  openAbout() {
    if (this.uiAboutContainer.displayed) {
      this.closeAll()
    } else {
      this.dispatchEvent({type: 'openAbout'})
      this.doTransition(this.uiWorksContainer.displayed ? this.uiWorksContainer : null, this.uiAboutContainer)
      this.wasWorksContainerDisplayed = this.uiWorksContainer.displayed
      this.wasWorksContainerOpened = this.uiWorksContainer.opened
      this.uiWorksContainer.displayed = false
      this.uiAboutContainer.displayed = true
      this.uiMainContainer.setActivePage('about')
      document.querySelector('body').classList.remove(WORK_OPEN_CLASS)
    }
  }

  doTransition(fromElements, toElements) {
    fromElements = fromElements ?? []
    toElements = toElements ?? []
    fromElements = Array.isArray(fromElements) ? fromElements : [fromElements]
    toElements = Array.isArray(toElements) ? toElements : [toElements]

    this.transitionFromElements.forEach(e => e.visible = false)

    this.transitionFromElements = fromElements
    this.transitionToElements = toElements
    this.transitionOla._value.current = 0
    this.transitionOla._value.from = 0
    this.transitionOla._value.to = 0
    this.transitionOla.value = 1
  }

  onResize() {
    super.onResize()

    this.camera.left = -this.engine.aspect / 2
    this.camera.right = this.engine.aspect / 2
    this.camera.top = 0.5
    this.camera.bottom = -0.5
    this.camera.updateProjectionMatrix()

    this.composer.setPixelRatio(this.engine.pixelRatio)
    this.composer.setSize(this.engine.width, this.engine.height)

    this.previousTearEffectRT.setSize(this.engine.renderWidth, this.engine.renderHeight)
    this.currentTearEffectRT.setSize(this.engine.renderWidth, this.engine.renderHeight)

    this.tearEffectUIPass.uniforms.uAspectRatio.value = this.engine.aspect
    this.tearEffectUIPass.uniforms.uHexagonSize.value = this.engine.height / 175

    this.tearEffectUIPass.uniforms.uMouseInfluenceRadius.value = 150 / this.engine.height

    this.tearEffectUIPass.uniforms.uGlobalTearIntensity.value.y = 64 / this.engine.height
    this.tearEffectUIPass.uniforms.uGlobalTearIntensity.value.x =
      this.tearEffectUIPass.uniforms.uGlobalTearIntensity.value.y / this.engine.aspect

    this.hexagonBackgroundDistortionPass.uniforms.uAspectRatio.value = this.engine.aspect
    this.hexagonBackgroundDistortionPass.uniforms.uHexagonSize.value = this.engine.height / 175

    this.hexagonBackgroundDistortionPass.uniforms.uMouseInfluenceRadius.value = 150 / this.engine.height

    this.hexagonBackgroundDistortionPass.uniforms.uDistortionIntensity.value.y = 32 / this.engine.height
    this.hexagonBackgroundDistortionPass.uniforms.uDistortionIntensity.value.x =
      this.hexagonBackgroundDistortionPass.uniforms.uDistortionIntensity.value.y / this.engine.aspect
  }

  onUpdate(frameInfo) {
    this.uiRoot.ignoreInHover = this.transitionOla.value < 0.5

    super.onUpdate(frameInfo)
  }

  render(frameInfo) {
    this.composer.render(frameInfo.deltaTime)
    return this.composer.readBuffer.texture
  }
}
