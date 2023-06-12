import * as three from 'three'
import cloneDeep from 'lodash/cloneDeep'
import tween from '@tweenjs/tween.js'
import loadAssets from '../../utils/loadAssets'
import { loadModel, loadTexture, loadResponsiveVideoTexture } from '../../utils/loaders'
import { negativePHI, positivePHI } from '../../../utils/math'
import ScreenspaceTextureShader from '../../shaders/screenspaceTexture/ScreenspaceTextureShader'
import { inOutPower2 } from '../../../utils/easings'
import store from '../../../store'

export default class ShatteredRectangles extends three.Group {
  async init(engine, layer) {
    this.engine = engine

    const video = store.state.pagesData.find(p => p.slug === '/').video?.uploads

    this.assets = await loadAssets({
      videoTexture: loadResponsiveVideoTexture(video, { autoplay: true }),
      descriptionTexture: loadTexture('common/agencyDescription.basis'),
      plane: loadModel('descriptionPlane.glb'),
    })


    // Video
    this.videoMaterial = new three.ShaderMaterial({
      ...cloneDeep(ScreenspaceTextureShader),
      depthTest: false,
      depthWrite: false,
      transparent: true,
    })

    this.videoMaterial.uniforms.uMap.value = this.assets.videoTexture

    this.videoMesh = this.assets.plane.scene.children[0].clone()
    this.videoMesh.material = this.videoMaterial
    this.videoMesh.layers.set(layer)

    this.add(this.videoMesh)

    // Description
    this.descriptionMaterial = new three.MeshBasicMaterial({
      map: this.assets.descriptionTexture,
      transparent: true,
      side: three.BackSide,
      depthTest: false,
      depthWrite: false,
    })
    this.descriptionMaterial.opacity = 0

    this.descriptionMesh = this.assets.plane.scene.children[0].clone()
    this.descriptionMesh.material = this.descriptionMaterial
    this.descriptionMesh.layers.set(layer)

    this.add(this.descriptionMesh)

    this.onResize()
  }

  onUpdate() {
    this.videoMaterial.uniforms.uMapResolution.value.x = this.assets.videoTexture.width
    this.videoMaterial.uniforms.uMapResolution.value.y = this.assets.videoTexture.height
  }

  setDescriptionVisible(visible) {
    new tween.Tween(this.descriptionMaterial)
      .to({ opacity: visible ? 1 : 0 }, 600)
      .easing(inOutPower2)
      .start()
  }

  setVideoVisible(visible) {
    new tween.Tween(this.videoMaterial.uniforms.uOpacity)
      .to({ value: visible ? 1 : 0 }, 600)
      .easing(inOutPower2)
      .start()
  }

  onResize() {
    this.videoMaterial.uniforms.uScreenResolution.value.x = this.engine.renderWidth
    this.videoMaterial.uniforms.uScreenResolution.value.y = this.engine.renderHeight

    let scale = 1
    if (this.engine.aspect < 0.9) {
      scale = -negativePHI
    }
    if (this.engine.aspect < 0.5) {
      scale *= 0.75
    }

    this.descriptionMesh.scale.set(negativePHI, -negativePHI, positivePHI)
    this.descriptionMesh.scale.multiplyScalar(scale)

    this.videoMesh.scale.set(-negativePHI, -negativePHI, Math.pow(positivePHI, 2))
    this.videoMesh.scale.multiplyScalar(scale)
  }
}
