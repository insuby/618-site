import * as three from 'three'
import promisifyLoader from './promisifyLoader'
import UniversalVideoTexture from './UniversalVideoTexture'

const videoBlobLoader = promisifyLoader(new three.FileLoader())
videoBlobLoader.loader.setResponseType('blob')

function loadVideoBlob(url) {
  videoBlobLoader.loader.setMimeType(url.endsWith('.webm') ? 'video/webm' : 'video/mp4')
  return videoBlobLoader.load(url).then(blob => URL.createObjectURL(blob))
}

export default class UniversalVideoTextureLoader {
  async load(src, options) {
    const video = document.createElement('video')
    video.classList.add('threeVideo')
    video.loop = true
    video.muted = true
    video.setAttribute('playsinline', 'playsinline')

    return loadVideoBlob(src).then(blobUrl => {
      return new Promise(resolve => {
        video.src = blobUrl
        document.body.append(video)

        video.addEventListener('error', () => {
          console.log('Failed to load video. Error: ' + video.error.code + '; details: ' + video.error.message)
          resolve(new UniversalVideoTexture(video, options))
        })

        video.addEventListener('loadedmetadata', () => {
          resolve(new UniversalVideoTexture(video, options))
        })

      })
    })
  }
}
