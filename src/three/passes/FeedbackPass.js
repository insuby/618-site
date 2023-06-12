import { FullScreenQuad, Pass } from 'three/examples/jsm/postprocessing/Pass'
import * as three from 'three'
import cloneDeep from 'lodash/cloneDeep'
import { createDerivedMaterial } from 'troika-three-utils'
import Ola from 'ola'
import ColorFeedbackShader from '../shaders/feedback/colorFeedback/ColorFeedbackShader'
import MaskFeedbackShader from '../shaders/feedback/maskFeedback/MaskFeedbackShader'
import MaskEdgeDetectionShader from '../shaders/feedback/maskEdgeDetection/MaskEdgeDetectionShader'
import UIFeedbackNumbers from '../scenes/BackgroundScene/UIFeedbackNumbers'
import UpdatableScene from '../UpdatableScene'
import { frameInfo } from '../../utils/raf'
import UnlitShader from '../shaders/unlit/UnlitShader'
import { outPower3 } from '../../utils/easings'

export default class FeedbackPass extends Pass {
  needsSwap = false
  mouseX = 0.5
  mouseY = 0.5
  _displayed = false
  resetFeedbackBuffers = false

  constructor(engine) {
    super()

    this.engine = engine

    this.readColorFeedbackRT = new three.WebGLRenderTarget(engine.renderWidth, engine.renderHeight)
    this.writeColorFeedbackRT = new three.WebGLRenderTarget(engine.renderWidth, engine.renderHeight)
    this.readMaskFeedbackRT = new three.WebGLRenderTarget(engine.renderWidth, engine.renderHeight)
    this.writeMaskFeedbackRT = new three.WebGLRenderTarget(engine.renderWidth, engine.renderHeight)

    this.colorFeedbackMaterial = new three.ShaderMaterial(cloneDeep(ColorFeedbackShader))
    this.maskFeedbackMaterial = new three.ShaderMaterial(cloneDeep(MaskFeedbackShader))
    this.maskEdgeDetectionMaterial = new three.ShaderMaterial(cloneDeep(MaskEdgeDetectionShader))
    this.unlitMaterial = new three.ShaderMaterial(cloneDeep(UnlitShader))
    this.feedbackNumbersMaterial = createDerivedMaterial(new three.MeshBasicMaterial(), {
      uniforms: {
        uFeedbackMask: { value: null },
        uFeedbackColorMap: { value: null },
        uScreenResolution: { value: new three.Vector2(1, 1) },
        uOffset: { value: new three.Vector2(0, 0) },
        uOpacity: { value: 0 },
      },
      depthTest: false,
      depthWrite: false,
      transparent: true,
      fragmentDefs: `
        uniform sampler2D uFeedbackMask;
        uniform sampler2D uFeedbackColorMap;
        uniform vec2 uScreenResolution;
        uniform vec2 uOffset;
        uniform float uOpacity;
        
        vec4 FAST32_hash_2D(vec2 gridcell) {
          const vec2 OFFSET = vec2(26.0, 161.0);
          const float DOMAIN = 71.0;
          const float SOMELARGEFLOAT = 951.135664;
          vec4 P = vec4(gridcell.xy, gridcell.xy + 1.0);
          P = P - floor(P * (1.0 / DOMAIN)) * DOMAIN;
          P += OFFSET.xyxy;
          P *= P;
          return fract(P.xzxz * P.yyww * (1.0 / SOMELARGEFLOAT));
        }
        
        vec2 Interpolation_C2(vec2 x) { return x * x * x * (x * (x * 6.0 - 15.0) + 10.0); }
        
        float Value2D(vec2 P) {
          vec2 Pi = floor(P);
          vec2 Pf = P - Pi;
      
          vec4 hash = FAST32_hash_2D(Pi);
      
          vec2 blend = Interpolation_C2(Pf);
          vec4 blend2 = vec4(blend, vec2(1.0 - blend));
          return dot(hash, blend2.zxzx * blend2.wwyy);
        }
        
        float calcNoise(vec2 uv, float timeOffset) {
          vec3 scale = vec3(11.0);
          float amplitude = 2.0;
          
          vec2 inputRes = uScreenResolution;
          vec2 scaler = inputRes * 0.1 * scale.xy;
        
          vec2 P = uv * scaler + uOffset.xy + vec2(timeOffset, 0.0) * 7.3324;
          vec4 noiseColor = vec4(2.0 * Value2D(P) - 1.0);
          noiseColor = noiseColor * amplitude + vec4(0.0, 1.0, 1.0, 1.0);
          
          return noiseColor.r;
        }
        
        float cubicOut(float t) {
          float f = t - 1.0;
          return f * f * f + 1.0;
        }
        
        float inverseLerp(float a, float b, float v, bool clampResult) {
          float result = (v - a) / (b - a);
        
          if (clampResult) {
            return clamp(result, 0.0, 1.0);
          }
        
          return result;
        }

      `,
      fragmentMainOutro: `
        vec2 screenUv = gl_FragCoord.xy / uScreenResolution;
        vec4 feedbackColor = texture2D(uFeedbackColorMap, screenUv);
        vec4 feedbackMask = texture2D(uFeedbackMask, screenUv);
        
        if (feedbackMask.r <= (1.1 / 255.0)) {
          discard;
        }
        
        float noise = calcNoise(screenUv, 0.0);
        
        float maskValue = cubicOut(max(feedbackMask.r, inverseLerp(0.6, 1.0, feedbackMask.g, true)));
        
        gl_FragColor.rgb *= feedbackColor.rgb * 2.0;
        gl_FragColor.rgb *= maskValue * maskValue * maskValue;
        gl_FragColor.rgb *= 0.6;
        gl_FragColor.a *= maskValue;
        gl_FragColor.a = mix(gl_FragColor.a, gl_FragColor.a * noise, 0.25 * mix(0.5, 1.0, inverseLerp(1.0, 0.995, maskValue, true)));
        gl_FragColor.a = pow(gl_FragColor.a, 3.6) * 2.0;
        gl_FragColor.a *= uOpacity;
      `,
    })

    this.opacityMaterial = new three.MeshBasicMaterial({
      color: new three.Color('black'),
      transparent: true,
      depthTest: false,
      depthWrite: false,
    })

    this.fsQuad = new FullScreenQuad(this.colorFeedbackMaterial)

    this.uiCamera = new three.OrthographicCamera(-this.engine.aspect / 2, this.engine.aspect / 2, 0.5, -0.5, -100, 100)
    this.uiCamera.position.z = 10
    this.uiCamera.lookAt(new three.Vector3())

    this.uiScene = new UpdatableScene()
    this.feedbackNumbers = new UIFeedbackNumbers(this.engine)
    this.feedbackNumbers.numbersText.troikaText.material = this.feedbackNumbersMaterial
    this.feedbackNumbersMaterial = this.feedbackNumbers.numbersText.troikaText.material
    this.uiScene.add(this.feedbackNumbers)
    this.uiScene.add(this.uiCamera)

    window.addEventListener('mousemove', this.onMouseMove.bind(this))

    this.opacityOla = Ola(0, 600)
  }

  onMouseMove(e) {
    this.mouseX = e.clientX / window.innerWidth
    this.mouseY = e.clientY / window.innerHeight
  }

  swapColorFeedbackRTs() {
    const temp = this.writeColorFeedbackRT
    this.writeColorFeedbackRT = this.readColorFeedbackRT
    this.readColorFeedbackRT = temp
  }

  swapMaskFeedbackRTs() {
    const temp = this.writeMaskFeedbackRT
    this.writeMaskFeedbackRT = this.readMaskFeedbackRT
    this.readMaskFeedbackRT = temp
  }

  onUpdate(frameInfo) {
    this.uiScene.onUpdate(frameInfo)
  }

  get displayed() {
    return this._displayed
  }

  set displayed(displayed) {
    this._displayed = displayed
    this.opacityOla.value = displayed ? 1 : 0
    if (displayed) {
      this.resetFeedbackBuffers = true
    }
  }

  onResize() {
    this.readColorFeedbackRT.setSize(this.engine.renderWidth, this.engine.renderHeight)
    this.writeColorFeedbackRT.setSize(this.engine.renderWidth, this.engine.renderHeight)
    this.readMaskFeedbackRT.setSize(this.engine.renderWidth, this.engine.renderHeight)
    this.writeMaskFeedbackRT.setSize(this.engine.renderWidth, this.engine.renderHeight)

    this.uiCamera.left = -this.engine.aspect / 2
    this.uiCamera.right = this.engine.aspect / 2
    this.uiCamera.top = 0.5
    this.uiCamera.bottom = -0.5
    this.uiCamera.updateProjectionMatrix()

    this.uiScene.onResize()
  }

  // eslint-disable-next-line no-unused-vars
  render(renderer, writeBuffer, readBuffer, deltaTime) {
    const opacity = this.opacityOla.value

    if (opacity <= 0) {
      return
    }

    if (this.resetFeedbackBuffers) {
      renderer.setRenderTarget(this.writeMaskFeedbackRT)
      renderer.clear()
      renderer.setRenderTarget(this.writeColorFeedbackRT)
      renderer.clear()
      this.resetFeedbackBuffers = false
    }

    for (const mat of [this.maskFeedbackMaterial, this.colorFeedbackMaterial]) {
      mat.uniforms.uAspectRatio.value = this.engine.aspect
      mat.uniforms.uHexagonSize.value = this.engine.height / 175
      mat.uniforms.uMousePos.value.x = this.mouseX
      mat.uniforms.uMousePos.value.y = this.mouseY
      mat.uniforms.uMouseInfluenceRadius.value = 256 / this.engine.height
      mat.uniforms.uDistortionIntensity.value.y = 256 / this.engine.height
      mat.uniforms.uDistortionIntensity.value.x = mat.uniforms.uDistortionIntensity.value.y / this.engine.aspect
    }

    // Render color feedback
    this.swapColorFeedbackRTs()
    renderer.setRenderTarget(this.writeColorFeedbackRT)
    this.colorFeedbackMaterial.uniforms.uInputMap.value = readBuffer.texture
    this.colorFeedbackMaterial.uniforms.uStoreMap.value = this.readColorFeedbackRT.texture
    this.colorFeedbackMaterial.uniforms.uMapResolution.value.x = this.readColorFeedbackRT.width
    this.colorFeedbackMaterial.uniforms.uMapResolution.value.y = this.readColorFeedbackRT.height
    this.fsQuad.material = this.colorFeedbackMaterial
    this.fsQuad.render(renderer)


    // Render mask feedback
    this.swapMaskFeedbackRTs()
    renderer.setRenderTarget(this.writeMaskFeedbackRT)
    this.maskFeedbackMaterial.uniforms.uInputMap.value = readBuffer.texture
    this.maskFeedbackMaterial.uniforms.uStoreMap.value = this.readMaskFeedbackRT.texture
    this.maskFeedbackMaterial.uniforms.uMapResolution.value.x = this.readMaskFeedbackRT.width
    this.maskFeedbackMaterial.uniforms.uMapResolution.value.y = this.readMaskFeedbackRT.height
    this.fsQuad.material = this.maskFeedbackMaterial
    this.fsQuad.render(renderer)


    // Render mask edge detection
    this.swapMaskFeedbackRTs()
    renderer.setRenderTarget(this.writeMaskFeedbackRT)
    this.maskEdgeDetectionMaterial.uniforms.uMap.value = this.readMaskFeedbackRT.texture
    this.maskEdgeDetectionMaterial.uniforms.uMapResolution.value.x = writeBuffer.width
    this.maskEdgeDetectionMaterial.uniforms.uMapResolution.value.y = writeBuffer.height
    this.fsQuad.material = this.maskEdgeDetectionMaterial
    this.fsQuad.render(renderer)

    const debugRender = false

    if (debugRender) {
      renderer.setRenderTarget(writeBuffer)
      this.fsQuad.material = this.unlitMaterial
      this.fsQuad.material.uniforms.uMap.value = this.writeColorFeedbackRT
      this.fsQuad.render(renderer)
    } else {
      // Render final feedback effect
      renderer.setRenderTarget(writeBuffer)

      this.fsQuad.material = this.opacityMaterial
      this.fsQuad.material.opacity = opacity

      this.fsQuad.render(renderer)

      this.feedbackNumbersMaterial.uniforms.uFeedbackMask.value = this.writeMaskFeedbackRT.texture
      this.feedbackNumbersMaterial.uniforms.uFeedbackColorMap.value = this.writeColorFeedbackRT.texture
      this.feedbackNumbersMaterial.uniforms.uScreenResolution.value.x = this.writeColorFeedbackRT.width
      this.feedbackNumbersMaterial.uniforms.uScreenResolution.value.y = this.writeColorFeedbackRT.height
      this.feedbackNumbersMaterial.uniforms.uOffset.value.x = frameInfo.time * 10
      this.feedbackNumbersMaterial.uniforms.uOpacity.value = this._displayed ? outPower3(opacity) : opacity
      renderer.render(this.uiScene, this.uiCamera)
    }
  }
}
