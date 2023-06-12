import isPrerender from './isPrerender'

let lastTickDate = performance.now()
let callbacks = []
let frame = 0

if (!isPrerender) {
  requestAnimationFrame(tick)
}

export const frameInfo = {
  deltaTime: 0,
  time: 0,
  frame: 0,
}

function tick() {
  frame++
  const now = performance.now()
  let deltaTime = (now - lastTickDate) / 1000
  if (deltaTime > 1 / 5) {
    deltaTime = 0
  }

  frameInfo.deltaTime = deltaTime
  frameInfo.time = performance.now() / 1000
  frameInfo.frame = frame

  for (const callback of callbacks) {
    const data = {
      deltaTime,
      elapsedTime: (now - callback.startTime) / 1000,
      startTime: callback.startTime,
      time: performance.now() / 1000,
      frame,
    }

    try {
      callback(data)
    } catch (e) {
      console.error(e)
    }
  }

  requestAnimationFrame(tick)
  lastTickDate = now
}


export function addTickCallback(callback) {
  callback.startTime = performance.now()
  callbacks.push(callback)
}

export function removeTickCallback(callback) {
  callbacks = callbacks.filter(c => c !== callback)
}
