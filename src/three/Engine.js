import * as three from 'three'
import {EffectComposer} from 'three/examples/jsm/postprocessing/EffectComposer'
import Stats from 'stats.js'
import {SavePass} from 'three/examples/jsm/postprocessing/SavePass'
import tween from '@tweenjs/tween.js'
import {addTickCallback} from '../utils/raf'
import CallbackPass from './passes/CallbackPass'
import isDev from '../utils/isDev'
import RenderTexturePass from './passes/RenderTexturePass'
import BackgroundScene from './scenes/BackgroundScene/BackgroundScene'
import UIScene from './scenes/UIScene/UIScene'
import ComposeShader from './shaders/compose/ComposeShader'
import {debounce} from "lodash/function";

let worksOpen = false;
export default class Engine extends three.EventDispatcher {
  async init(canvas) {
    this.tick = this.tick.bind(this)

    this.canvas = canvas
    const canvasRect = this.canvas.getBoundingClientRect()
    this.width = canvasRect.width
    this.height = canvasRect.height

    if (isDev) {
      this.stats = new Stats()
      this.stats.showPanel(0)
      this.stats.dom.style.top = '50%'
      this.stats.dom.style.left = ''
      this.stats.dom.style.right = '0%'
      this.stats.dom.style.transform = 'translateY(-50%)'
      this.stats.dom.style.userSelect = 'none'
      document.body.appendChild(this.stats.dom)
    }

    this.initRenderer()
    await this.initScenes()
    this.initComposer()

    this.onResize()

    addTickCallback(this.tick)
  }

  initRenderer() {
    this.renderer = new three.WebGLRenderer({
      canvas: this.canvas,
    })
    this.renderer.autoClear = false
    this.renderer.setPixelRatio(window.devicePixelRatio ?? 1)

    this.pixelRatio = this.renderer.getPixelRatio()
    this.renderWidth = Math.floor(this.width * this.pixelRatio)
    this.renderHeight = Math.floor(this.height * this.pixelRatio)
    this.aspect = this.width / this.height
  }

  async initScenes() {
    this.backgroundScene = new BackgroundScene()
    this.backgroundScene.isMainRotation = true
    this.uiScene = new UIScene()

    await Promise.all([
      this.backgroundScene.init(this),
      this.uiScene.init(this),
    ])

    this.dispatchEvent({type: 'loaded'})

    let userRotationEnabled = true

    this.backgroundScene.addEventListener('cameraRotated', () => {
      this.uiScene.uiMainContainer.hideHello()
    })

    this.backgroundScene.addEventListener('videoBuilt', () => {
      //Задача по UX. Когда пользователь на первоначальном экране или на экране, который появляется при нажатии на логотип, собрал видео из кубиков, происходит переход на вкладку - Work.
      setTimeout(() => this.uiScene.uiMainContainer.dispatchEvent({type: 'worksMenuItemClicked'}))
    })

    this.uiScene.addEventListener('hoverCursor', t => {
      this.backgroundScene.controls.enabled = userRotationEnabled && t.cursorType == null
      this.dispatchEvent(t)
    })

    this.uiScene.addEventListener('closeAll', () => {
      userRotationEnabled = true
      this.backgroundScene.controls.enabled = true
      this.backgroundScene.shatteredRectangles.setVideoVisible(true)
      this.backgroundScene.shatteredRectangles.setDescriptionVisible(false)
      this.backgroundScene.setFeedbackEffectDisplayed(false)
    })

    this.uiScene.addEventListener('openWorks', debounce(() => {
      userRotationEnabled = false
      this.backgroundScene.controls.enabled = false
      this.backgroundScene.rotate('works', 900)
      this.backgroundScene.shatteredRectangles.setVideoVisible(false)
      this.backgroundScene.shatteredRectangles.setDescriptionVisible(false)
      this.backgroundScene.setFeedbackEffectDisplayed(false)
      this.uiScene.uiMainContainer.hideHello()
    }), 1000)

    this.uiScene.addEventListener('openAbout', () => {
      userRotationEnabled = false
      this.backgroundScene.controls.enabled = false
      this.backgroundScene.rotate('about', 900)
      this.backgroundScene.shatteredRectangles.setVideoVisible(false)
      this.backgroundScene.shatteredRectangles.setDescriptionVisible(false)
      this.backgroundScene.setFeedbackEffectDisplayed(true)
      this.uiScene.uiMainContainer.hideHello()
    })

    this.uiScene.addEventListener('logoClicked', () => {
      userRotationEnabled = true
      this.backgroundScene.controls.enabled = true
      this.backgroundScene.setFeedbackEffectDisplayed(false)
      this.backgroundScene.rotate('agencyDescription', 900)
      if (this.backgroundScene.isMainRotation) {
        this.backgroundScene.rotate('agency', 100)
      }
      this.backgroundScene.rotate(this.backgroundScene.isMainRotation ? 'agencyDescription' : 'works', 900)
      this.backgroundScene.isMainRotation = !this.backgroundScene.isMainRotation
      setTimeout(() => {
        this.backgroundScene.shatteredRectangles.setVideoVisible(true)
        this.backgroundScene.shatteredRectangles.setDescriptionVisible(true)
      }, 450)
      this.uiScene.uiMainContainer.hideHello()
    })

    this.scenes = [this.backgroundScene, this.uiScene]
  }

  initComposer() {
    this.composer = new EffectComposer(this.renderer)

    const renderPass = new RenderTexturePass(ComposeShader)

    this.composer.addPass(new CallbackPass(() => {
      renderPass.uniforms.uBackgroundMap.value = this.backgroundScene.render(this.frameInfo)
      renderPass.uniforms.uUIMap.value = this.uiScene.render(this.frameInfo)
    }))

    this.composer.addPass(renderPass)

    // FXAA
    /* const fxaaPass = new ShaderPass(FXAAShader)
    this.composer.addPass(new CallbackPass(() => {
      const width = this.width * this.pixelRatio
      const height = this.height * this.pixelRatio
      fxaaPass.uniforms.resolution.value.x = 1 / width
      fxaaPass.uniforms.resolution.value.y = 1 / height
    }))
    this.composer.addPass(fxaaPass) */

    this.composer.addPass(new SavePass(null))

    // Grain
    /* const grainPass = new GrainPass(0.25)
    grainPass.renderToScreen = true
    this.composer.addPass(grainPass) */
  }

  onResize() {
    this.renderWidth = this.width * this.pixelRatio
    this.renderHeight = this.height * this.pixelRatio
    this.aspect = this.width / this.height
    this.renderer.setPixelRatio(this.pixelRatio)

    for (const scene of this.scenes) {
      scene.onResize()
    }

    // Update renderer && composer
    this.composer.setPixelRatio(this.pixelRatio)
    this.composer.setSize(this.width, this.height)
    this.renderer.setSize(this.width, this.height)

    // Update canvas styles
    this.canvas.style.width = '100%'
    this.canvas.style.height = '100%'
  }

  tick(frameInfo) {
    tween.update()

    this.stats?.begin()

    this.frameInfo = frameInfo

    const {width, height} = this.canvas.getBoundingClientRect()
    const pixelRatio = window.devicePixelRatio ?? 1
    if (Math.floor(width) !== this.width || Math.floor(height) !== this.height || this.pixelRatio !== pixelRatio) {
      this.width = Math.floor(width)
      this.height = Math.floor(height)
      this.pixelRatio = pixelRatio
      this.onResize()
    }

    for (const scene of this.scenes) {
      scene.onUpdate(frameInfo)
    }

    this.composer.render(frameInfo.deltaTime)

    this.stats?.end()
  }
}
