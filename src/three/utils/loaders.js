import * as three from 'three'
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader'
import {DRACOLoader} from 'three/examples/jsm/loaders/DRACOLoader'
import {BasisTextureLoader} from 'three/examples/jsm/loaders/BasisTextureLoader'
import promisifyLoader from './promisifyLoader'
import {isWebMSupported} from '../../utils/isWebMSupported'
import UniversalVideoTextureLoader from './UniversalVideoTextureLoader'

// Texture loading
const textureLoader = promisifyLoader(new three.TextureLoader())

let basisLoader = new BasisTextureLoader()
basisLoader.setTranscoderPath('/static/basis/')
let testCanvas = document.createElement('canvas')
let testRenderer = new three.WebGLRenderer({canvas: testCanvas})
basisLoader.detectSupport(testRenderer)
testRenderer.dispose()
testCanvas = null
testRenderer = null
basisLoader = promisifyLoader(basisLoader)

export async function loadTexture(path) {
  const url = require('../../../assets/textures/' + path).default
  const texture = await (path.endsWith('basis') ? basisLoader.load(url) : textureLoader.load(url))
  texture.wrapS = three.RepeatWrapping
  texture.wrapT = three.RepeatWrapping
  return texture
}
// 3D models loading
const gltfLoader = promisifyLoader(new GLTFLoader())

const dracoLoader = new DRACOLoader()
dracoLoader.setDecoderPath('https://www.gstatic.com/draco/v1/decoders/')

gltfLoader.loader.setDRACOLoader(dracoLoader)

export function loadModel(path) {
  const url = require('../../../assets/models/' + path).default
  return gltfLoader.load(url)
}
// Video textures loading
const universalVideoTextureLoader = new UniversalVideoTextureLoader()

export async function loadResponsiveVideoTexture(options, loaderOptions) {
  if (!options) {
    return null
  }
  const format = options.webm && isWebMSupported ? 'webm' : 'mp4'

  const variants = options[format]

  const availableResolutions = Object
    .keys(variants)
    .filter(r => r === '1080x1920')
    .map(r => r.split('x'))
    .map(([width, height]) => ({
      width: parseInt(width, 10),
      height: parseInt(height, 10),
      src: variants[`${width}x${height}`].src,
    }))

  return universalVideoTextureLoader.load(availableResolutions[0].src, loaderOptions)
}
