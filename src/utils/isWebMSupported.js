const video = document.createElement('video')

export const isWebMSupported = video.canPlayType('video/webm; codecs="vp8, vorbis"') !== ''

video.remove()
