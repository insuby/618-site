import * as three from 'three'

export const positivePHI = ((1 + Math.sqrt(5)) / 2)
export const negativePHI = ((1 - Math.sqrt(5)) / 2)

export function clamp(min, max, value, easing) {
  if (easing) {
    return remap(min, max, min, max, value, true, easing)
  }

  if (value < min) {
    return min
  }
  if (value > max) {
    return max
  }

  return value
}

export function clamp01(value) {
  if (value < 0) {
    return 0
  }
  if (value > 1) {
    return 1
  }
  return value
}

export function inverseLerp(a, b, v, clamp = false) {
  const result = (v - a) / (b - a)
  if (clamp) {
    if (result <= 0) {
      return 0
    }
    if (result >= 1) {
      return 1
    }
  }
  if (Number.isNaN(result)) {
    return 0
  }
  return result
}

export function lerp(a, b, t, clamp = false) {
  if (clamp) {
    if (t < 0) {
      t = 0
    } else if (t > 1) {
      t = 1
    }
  }
  return (a * (1 - t)) + (b * t)
}

export function remap(start, end, startFinal, endFinal, value, clamp = true, easing = t => t) {
  return lerp(startFinal, endFinal, easing(inverseLerp(start, end, value, clamp)))
}

export function applyEasing(min, max, value, easing = t => t, clamp = true) {
  return lerp(min, max, easing(inverseLerp(min, max, value, clamp)))
}

export function smoothclamp(min, max, t) {
  const factor = inverseLerp(min, max, t, true)

  function inOutSine(t) {
    return -(Math.cos(Math.PI * t) - 1) / 2
  }

  return lerp(min, max, inOutSine(factor))
}

export function stagger(i, total, t, easing = v => v) {
  const one = 1 / total
  return easing(inverseLerp(i * one, (i + 1) * one, t, true))
}

export function approximately(a, b, epsilon = 0.001) {
  return Math.abs(a - b) <= epsilon
}

export function approximatelyQuats(a, b, angle) {
  const aPos = new three.Vector3(0, 1, 0).applyQuaternion(a)
  const bPos = new three.Vector3(0, 1, 0).applyQuaternion(b)

  return Math.abs(aPos.angleTo(bPos)) < degToRad(angle)
}

export function subVec(a, b) {
  return {
    x: a.x - b.x,
    y: a.y - b.y,
  }
}

export function mulVec(a, b) {
  if (typeof b === 'number') {
    return {
      x: a.x * b,
      y: a.y * b,
    }
  }

  return {
    x: a.x * b.x,
    y: a.y * b.y,
  }
}

export function vecLengthSquared(vec) {
  return vec.x ** 2 + vec.y ** 2
}

export function vecLength(vec) {
  return Math.sqrt(vec.x ** 2 + vec.y ** 2)
}

export function lerpVec(a, b, t) {
  return {
    x: lerp(a.x, b.x, t),
    y: lerp(a.y, b.y, t),
  }
}

export function vecDotProduct(a, b) {
  return a.x * b.x + a.y * b.y
}

export function vecDistance(vec1, vec2) {
  return Math.sqrt((vec1.x - vec2.x) ** 2 + (vec1.y - vec2.y) ** 2)
}

export function radToDeg(rad) {
  return rad * 180 / Math.PI
}

export function degToRad(deg) {
  return deg * (Math.PI / 180)
}

export function roundFraction(num, digits = 3) {
  return parseFloat(num.toFixed(digits))
}

export function shortenVecLength(a, length) {
  return mulVec(a, clamp(0, 1, 1 - length / vecLength(a)))
}

export function shortenLineLength(a, b, length) {
  const lineLength = vecLength(subVec(a, b))
  const p1Factor = clamp(0, 1, (length / 2) / lineLength)
  const p2Factor = clamp(0, 1, 1 - (length / 2) / lineLength)

  const p1 = lerpVec(a, b, p1Factor)
  const p2 = lerpVec(a, b, p2Factor)

  return [p1, p2]
}

export function angleBetweenPoints(a, b) {
  return radToDeg(Math.atan2(b.y - a.y, b.x - a.x))
}

export function isPointInsideRect(point, rect) {
  return point.x >= rect.x
    && point.x <= rect.x + rect.width
    && point.y >= rect.y
    && point.y <= rect.y + rect.height
}

// https://stackoverflow.com/questions/2752349/fast-rectangle-to-rectangle-intersection
export function isRectIntersectsRect(r1, r2) {
  return !(r2.left > r1.right ||
    r2.right < r1.left ||
    r2.top > r1.bottom ||
    r2.bottom < r1.top)
}

// https://stackoverflow.com/questions/3120357/get-closest-point-to-a-line
export function closestPointOnLine(a, b, p) {
  const ap = subVec(p, a)
  const ab = subVec(b, a)
  const abMagnitudeSquared = vecLengthSquared(ab)
  const dotProduct = vecDotProduct(ap, ab)
  const distance = dotProduct / abMagnitudeSquared

  if (distance < 0) {
    return a
  }

  if (distance > 1) {
    return b
  }

  return {
    x: a.x + ab.x * distance,
    y: a.y + ab.y * distance,
  }
}


export function normalDist(mu = 0, sigma = 1, samplesCount = 6) {
  let total = 0
  for (let i = 0; i < samplesCount; i++) {
    total += Math.random()
  }

  return sigma * (total - samplesCount / 2) / (samplesCount / 2) + mu
}

export function randomNormalDist(min = 0, max = 1, center = 0.5, stretch = 1) {
  let factor = -1
  const sigma = Math.max(center, 1 - center) / 3.6 * stretch
  while (factor < 0 || factor > 1) {
    factor = normalDist(center, sigma)
  }

  return lerp(min, max, factor)
}

// Port of smoothDamp from unity: https://github.com/Unity-Technologies/UnityCsReference/blob/master/Runtime/Export/Math/Mathf.cs
export function smoothDamp(current, target, currentVelocity, smoothTime, deltaTime, maxSpeed = Infinity) {
  smoothTime = Math.max(0.0001, smoothTime)
  const omega = 2 / smoothTime

  const x = omega * deltaTime
  const exp = 1 / (1 + x + 0.48 * x * x + 0.235 * x * x * x)
  let change = current - target
  const originalTo = target

  const maxChange = maxSpeed * smoothTime
  change = clamp(-maxChange, maxChange, change)
  target = current - change

  const temp = (currentVelocity + omega * change) * deltaTime
  currentVelocity = (currentVelocity - omega * temp) * exp
  let output = target + (change + temp) * exp

  if (originalTo - current > 0.0 === output > originalTo) {
    output = originalTo
    currentVelocity = (output - originalTo) / deltaTime
  }

  return [output, currentVelocity]
}
