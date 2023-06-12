import * as three from 'three'

export default class UniversalVideoTexture extends three.Texture {
  constructor(video, options = {}) {
    super(video, options.mapping, options.wrapS, options.wrapT, options.magFilter, options.minFilter, options.format, options.type, options.anisotropy)

    this.src = video.src

    this.format = options.format ?? three.RGBFormat

    this.minFilter = options.minFilter ?? three.LinearFilter
    this.magFilter = options.magFilter ?? three.LinearFilter

    this.generateMipmaps = false

    this.video = video
    this.paused = true
    this.width = this.video.videoWidth
    this.height = this.video.videoHeight
    this.promise = null

    if (options.autoplay) {
      this.play()
    }
  }


  async play() {
    if (!this.paused) {
      return
    }
    if (this.promise) {
      await this.promise
    }
    this.paused = false
    this.promise = this.video.play()
    await this.promise
    this.promise = null
  }

  async pause() {
    if (this.paused) {
      return
    }
    if (this.promise) {
      await this.promise
    }
    this.paused = true
    this.promise = this.video.pause()
    await this.promise
    this.promise = null
  }

  async update() {
    this.width = this.video.videoWidth
    this.height = this.video.videoHeight

    if (this.video.readyState >= this.video.HAVE_CURRENT_DATA) {
      const currentTime = this.video.currentTime

      this.needsUpdate = (currentTime > 0.05) && (currentTime < (this.video.duration - 0.05))
    }
  }

  dispose() {
    this.video.remove()

    super.dispose()
  }
}

UniversalVideoTexture.prototype.isVideoTexture = true
