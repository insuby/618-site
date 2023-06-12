import * as three from 'three'
import {EffectComposer} from 'three/examples/jsm/postprocessing/EffectComposer'
import {TAARenderPass} from 'three/examples/jsm/postprocessing/TAARenderPass'
import tween from '@tweenjs/tween.js'
import {RenderPass} from 'three/examples/jsm/postprocessing/RenderPass'
import Ola from 'ola'
import UpdatableScene from '../../UpdatableScene'
import {approximately, approximatelyQuats, positivePHI} from '../../../utils/math'
import ShatteredRectangles from './ShatteredRectangles'
import {inOutPower2} from '../../../utils/easings'
import GoldenRatioGeometry from './GoldenRatioGeometry'
import FeedbackPass from '../../passes/FeedbackPass'
import CallbackPass from '../../passes/CallbackPass'
import {down} from '../../../utils/breakpoints'
import {debounce} from "lodash/function";
import gsap from 'gsap/all'
import { TrackballControls } from '../../lib/TrackballControls';
import {INACTIVE_CLASS, INACTIVITY_TIME} from "../../../constants";

const GOLDEN_RATIO_GEOMETRY_LAYER = 1
const SHATTERED_RECTANGLES_LAYER = 2
const pos = new three.Quaternion().setFromUnitVectors(new three.Vector3(0, 1, 0), new three.Vector3(-positivePHI, -positivePHI, positivePHI).normalize())

export default class BackgroundScene extends UpdatableScene {
  async init(engine) {
    this.engine = engine
    this.renderer = engine.renderer
    this.cameraSnappingOla = Ola(0, 150)
    this.cameraUpSnappingOla = Ola(0, 3000)
    this.lastSnappingQuat = null
    this.isRotating = false
    this.rotations = {
      about: pos,
      agencyDescription: new three.Quaternion().setFromUnitVectors(new three.Vector3(0, 1, 0), new three.Vector3(0, 0, -positivePHI).normalize()),
      agency: new three.Quaternion().setFromUnitVectors(new three.Vector3(0, .8, 0), new three.Vector3(0, 0, -positivePHI).normalize()),
      video: new three.Quaternion().setFromUnitVectors(new three.Vector3(0, 1, 0), new three.Vector3(0, 0, positivePHI).normalize()),
      works: pos,
    }

    this.initCameras()
    this.initComposer()
    await this.initObjects()
    this.trackInactivity()
    this.onResize()
  }

  initCameras() {
    this.camera = new three.OrthographicCamera(-1, 1, 1, -1, -100, 100)
    this.camera.position.set(-0.618, -0.618, 0.618)

    this.add(this.camera)
    this.controls = new TrackballControls(this.camera, this.renderer.domElement)
    this.controls.enableDamping = true
    this.controls.noPan = true
    this.controls.enableZoom = false
    this.controls.noZoom = true
    this.controls.dynamicDampingFactor = 0.2

    this.controls.addEventListener('change', debounce(event => {
      this.dispatchEvent({type: 'cameraRotated', event})
    }), 1000)

    this.controls.addEventListener('end', debounce(event => {
      setTimeout(() => {
        if (this.controls.dynamicDampingFactor === 0.6) {
          //Задача по UX. Когда пользователь на первоначальном экране или на экране, который появляется при нажатии на логотип, собрал видео из кубиков, происходит переход на вкладку - Work.
          this.dispatchEvent({type: 'videoBuilt'})
        }
      }, 1000)
    }), 1000)
  }

  trackInactivity() {
    const camera = this.camera
    const now = performance.now()

    let time;
    let animation;

    function tweenCamera(bool = true) {
      animation = gsap.to(camera.position, {
        duration:18,
        x: -camera.position.x*1.5,
        ease: 'easeInOutBack',
        onComplete: () => {
          document.querySelector('body').classList.contains(INACTIVE_CLASS) && setTimeout(tweenCamera, 100, !bool)
        },
      });
    }

    function resetTimer() {
      document.querySelector('body').classList.remove(INACTIVE_CLASS)
      animation?.pause()

      clearTimeout(time);
      time = setTimeout(logout, INACTIVITY_TIME);
    }

    function logout() {
      document.querySelector('body').classList.add(INACTIVE_CLASS)
      // ваш код для выполнения операции после бездействия
      console.log("Выход пользователя");
      tweenCamera()
    }

    document.onmousemove = resetTimer;
    document.onkeypress = resetTimer;
    document.onkeyup = resetTimer;
    document.ontouchstart = resetTimer;
    document.ontouchmove = resetTimer;
    document.onwheel = resetTimer;

    resetTimer();
  }

  initComposer() {
    this.feedbackNumbersRT = new three.WebGLRenderTarget(this.engine.renderWidth, this.engine.renderHeight)

    this.composer = new EffectComposer(this.renderer)
    this.composer.renderToScreen = false

    this.taaRenderPass = new TAARenderPass(this, this.camera, null, new three.Color('#000'), 1)
    this.taaRenderPass.sampleLevel = 2
    this.composer.addPass(new CallbackPass(() => {
      this.camera.layers.set(GOLDEN_RATIO_GEOMETRY_LAYER)
    }))
    this.composer.addPass(this.taaRenderPass)

    const renderPass = new RenderPass(this, this.camera)
    renderPass.clear = false
    this.composer.addPass(new CallbackPass(() => {
      this.camera.layers.set(SHATTERED_RECTANGLES_LAYER)
    }))
    this.composer.addPass(renderPass)

    this.feedbackPass = new FeedbackPass(this.engine)
    this.composer.addPass(this.feedbackPass)
  }

  setFeedbackEffectDisplayed(displayed) {
    this.feedbackPass.displayed = displayed
    this.taaRenderPass.sampleLevel = displayed ? 0 : 2
  }

  async initObjects() {
    this.goldenRatioGeometry = new GoldenRatioGeometry(GOLDEN_RATIO_GEOMETRY_LAYER)
    this.add(this.goldenRatioGeometry)

    this.shatteredRectangles = new ShatteredRectangles()
    this.add(this.shatteredRectangles)
    await this.shatteredRectangles.init(this.engine, SHATTERED_RECTANGLES_LAYER)
  }

  onResize() {
    super.onResize()

    const scale = 0.75

    this.camera.left = -(this.engine.aspect / 2) * scale
    this.camera.right = (this.engine.aspect / 2) * scale
    this.camera.top = 0.5 * scale
    this.camera.bottom = -0.5 * scale
    this.controls.rotateSpeed = down('lg') ? 2.2 : 1.6
    this.camera.updateProjectionMatrix()

    this.composer.setPixelRatio(this.engine.pixelRatio)
    this.composer.setSize(this.engine.width, this.engine.height)

    this.feedbackPass.onResize()
  }

  onUpdate(frameInfo) {
    // console.log(frameInfo)
    super.onUpdate(frameInfo)
    this.controls.update()
    this.feedbackPass.onUpdate(frameInfo)
    // this.camera.position.x = Math.sin(performance.now() / 10000) * 2
    // this.camera.rotation.x = Math.cos(performance.now() / 10000) * 2
    // console.log(this.camera.position.z === -1)
    // console.log(this.camera.position.z > 0.995)
    // if (this.camera.position.x === 0 && this.camera.position.z === 0 || this.camera.position.x === 0 && this.camera.position.z === 1) {
    //   console.log(event)
    // }
    // console.log(this.camera.position)
  }

  render(frameInfo) {
    const originalControlsEnabled = this.controls.enabled
    const originalCameraPos = this.camera.position.clone()
    const originalCameraRotation = this.camera.rotation.clone()

    const cameraQuat = new three.Quaternion().setFromUnitVectors(new three.Vector3(0, 1, 0), this.camera.position.clone().normalize())

    const snappingQuats = [
      this.rotations.video,
    ]

    if (this.shatteredRectangles.descriptionMaterial.opacity > 0) {
      snappingQuats.push(this.rotations.agencyDescription)
    }

    let snappingQuat = null
    for (const quat of snappingQuats) {
      if (approximatelyQuats(quat, cameraQuat, 5)) {
        snappingQuat = quat

      }
    }

    if (approximately(this.cameraSnappingOla.value, 0.001)) {
      this.lastSnappingQuat = snappingQuat ?? this.lastSnappingQuat

    }
    this.cameraSnappingOla.value = snappingQuat == null || this.lastSnappingQuat == null || !approximatelyQuats(this.lastSnappingQuat, snappingQuat, 1) ? 0 : 1
    const snapUp = !(snappingQuat == null || this.lastSnappingQuat == null || !approximatelyQuats(this.lastSnappingQuat, snappingQuat, 1))
    this.cameraUpSnappingOla.set({value: snapUp ? 1 : 0}, snapUp ? 3000 : 450)

    if (this.cameraUpSnappingOla.value !== 0 && this.lastSnappingQuat != null) {
      this.controls.enabled = false

      const resultQuat = cameraQuat.slerp(this.lastSnappingQuat, this.cameraSnappingOla.value)

      this.camera.up = this.camera.up.clone().lerp(new three.Vector3(0, 1, 0), snapUp * frameInfo.deltaTime * 3)
      this.camera.position.copy(new three.Vector3(0, 1, 0).applyQuaternion(resultQuat))
      this.camera.lookAt(new three.Vector3())
    }

    this.controls.dynamicDampingFactor = snappingQuat != null ? 0.6 : 0.2

    this.composer.render(frameInfo.deltaTime)

    this.camera.position.copy(originalCameraPos)
    this.camera.rotation.copy(originalCameraRotation)
    this.controls.enabled = originalControlsEnabled

    return this.composer.writeBuffer.texture
  }

  rotate(name, duration) {
    const cameraQuat = new three.Quaternion().setFromUnitVectors(new three.Vector3(0, 1, 0), this.camera.position.clone().normalize())
    const quat = this.rotations[name].clone()

    const progress = {value: 0}

    const cameraUp = this.camera.up.clone()

    new tween.Tween(progress)
      .to({value: 1}, duration)
      .easing(inOutPower2)
      .onUpdate(() => {
        const resultQuat = cameraQuat.clone().slerp(quat, progress.value)

        this.camera.up = cameraUp.clone().lerp(new three.Vector3(0, 1, 0), progress.value)
        this.camera.position.copy(new three.Vector3(0, 1, 0).applyQuaternion(resultQuat))
        this.camera.lookAt(new three.Vector3())
      })
      .onStart(() => this.isRotating = true)
      .onComplete(() => {
        this.isRotating = false

      })
      .start()
  }
}
