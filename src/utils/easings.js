import { inverseLerp, lerp, remap } from './math'

/* Linear */

export function linear(t) {
  return t
}


/* Power1/Quad */

export function inPower1(t) {
  return t * t
}

export function outPower1(t) {
  return t * (2 - t)
}

export function inOutPower1(t) {
  return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t
}

export function outInPower1(t) {
  const t2 = t < 0.5 ? t * 2 : (t - 0.5) * 2
  return t < 0.5 ? outPower1(t2) * 0.5 : inPower1(t2) * 0.5 + 0.5
}

/* Power2/Cubic */

export function inPower2(t) {
  return t * t * t
}

export function outPower2(t) {
  return (--t) * t * t + 1
}

export function inOutPower2(t) {
  return t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1
}

export function outInPower2(t) {
  const t2 = t < 0.5 ? t * 2 : (t - 0.5) * 2
  return t < 0.5 ? outPower2(t2) * 0.5 : inPower2(t2) * 0.5 + 0.5
}

/* Power3/Quart */

export function inPower3(t) {
  return t * t * t * t
}

export function outPower3(t) {
  return 1 - (--t) * t * t * t
}

export function inOutPower3(t) {
  return t < 0.5 ? 8 * t * t * t * t : 1 - 8 * (--t) * t * t * t
}

export function outInPower3(t) {
  const t2 = t < 0.5 ? t * 2 : (t - 0.5) * 2
  return t < 0.5 ? outPower3(t2) * 0.5 : inPower3(t2) * 0.5 + 0.5
}

/* Power4/Quint */

export function inPower4(t) {
  return t * t * t * t * t
}

export function outPower4(t) {
  return 1 + (--t) * t * t * t * t
}

export function inOutPower4(t) {
  return t < 0.5 ? 16 * t * t * t * t * t : 1 + 16 * (--t) * t * t * t * t
}

export function outInPower4(t) {
  const t2 = t < 0.5 ? t * 2 : (t - 0.5) * 2
  return t < 0.5 ? outPower4(t2) * 0.5 : inPower4(t2) * 0.5 + 0.5
}

/* Sine */

export function inSine(t) {
  return 1 - Math.cos((t * Math.PI) / 2)
}

export function outSine(t) {
  return Math.sin((t * Math.PI) / 2)
}

export function inOutSine(t) {
  return -(Math.cos(Math.PI * t) - 1) / 2
}

export function outInSine(t) {
  const t2 = t < 0.5 ? t * 2 : (t - 0.5) * 2
  return t < 0.5 ? outSine(t2) * 0.5 : inSine(t2) * 0.5 + 0.5
}

/* Exponential */

export function inExp(t) {
  return Math.pow(2, 10 * t - 10)
}

export function outExp(t) {
  return 1 - Math.pow(2, -10 * t)
}

export function inOutExp(t) {
  // eslint-disable-next-line no-cond-assign
  return ((t *= 2) <= 1 ? Math.pow(2, 10 * t - 10) : 2 - Math.pow(2, 10 - 10 * t)) / 2
}

export function outInExp(t) {
  const t2 = t < 0.5 ? t * 2 : (t - 0.5) * 2
  return t < 0.5 ? outExp(t2) * 0.5 : inExp(t2) * 0.5 + 0.5
}

/* Circ */

export function inCirc(t) {
  return 1 - Math.sqrt(1 - t * t)
}

export function outCirc(t) {
  return Math.sqrt(1 - (t - 1) * (t - 1))
}

export function inOutCirc(t) {
  return t < 0.5
    ? (1 - Math.sqrt(1 - Math.pow(2 * t, 2))) / 2
    : (Math.sqrt(1 - Math.pow(-2 * t + 2, 2)) + 1) / 2
}

export function outInCirc(t) {
  const t2 = t < 0.5 ? t * 2 : (t - 0.5) * 2
  return t < 0.5 ? outCirc(t2) * 0.5 : inCirc(t2) * 0.5 + 0.5
}

/* Back */

export function inBack(t) {
  const s = 1.70158
  return t * t * ((s + 1) * t - s)
}

export function outBack(t) {
  const s = 1.70158
  return --t * t * ((s + 1) * t + s) + 1
}

export function inOutBack(t) {
  const c1 = 1.70158
  const c2 = c1 * 1.525

  return t < 0.5
    ? (Math.pow(2 * t, 2) * ((c2 + 1) * 2 * t - c2)) / 2
    : (Math.pow(2 * t - 2, 2) * ((c2 + 1) * (t * 2 - 2) + c2) + 2) / 2
}

export function outInBack(t) {
  const t2 = t < 0.5 ? t * 2 : (t - 0.5) * 2
  return t < 0.5 ? outBack(t2) * 0.5 : inBack(t2) * 0.5 + 0.5
}


/* Elastic */

export function inElastic(t) {
  const c4 = (2 * Math.PI) / 3

  return t === 0
    ? 0
    : t === 1
      ? 1
      : -Math.pow(2, 10 * t - 10) * Math.sin((t * 10 - 10.75) * c4)
}


export function outElastic(t) {
  const c4 = (2 * Math.PI) / 3

  return t === 0
    ? 0
    : t === 1
      ? 1
      : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1
}


export function inOutElastic(t) {
  const c5 = (2 * Math.PI) / 4.5

  return t === 0
    ? 0
    : t === 1
      ? 1
      : t < 0.5
        ? -(Math.pow(2, 20 * t - 10) * Math.sin((20 * t - 11.125) * c5)) / 2
        : (Math.pow(2, -20 * t + 10) * Math.sin((20 * t - 11.125) * c5)) / 2 + 1
}

export function outInElastic(t) {
  const t2 = t < 0.5 ? t * 2 : (t - 0.5) * 2
  return t < 0.5 ? outElastic(t2) * 0.5 : inElastic(t2) * 0.5 + 0.5
}


/* Bounce */

export function inBounce(t) {
  return 1 - outBounce(1 - t)
}

export function outBounce(t) {
  const n1 = 7.5625
  const d1 = 2.75

  if (t < 1 / d1) {
    return n1 * t * t
  } if (t < 2 / d1) {
    return n1 * (t -= 1.5 / d1) * t + 0.75
  } if (t < 2.5 / d1) {
    return n1 * (t -= 2.25 / d1) * t + 0.9375
  }
  return n1 * (t -= 2.625 / d1) * t + 0.984375
}

export function inOutBounce(t) {
  return t < 0.5
    ? (1 - outBounce(1 - 2 * t)) / 2
    : (1 + outBounce(2 * t - 1)) / 2
}

export function outInBounce(t) {
  const t2 = t < 0.5 ? t * 2 : (t - 0.5) * 2
  return t < 0.5 ? outBounce(t2) * 0.5 : inBounce(t2) * 0.5 + 0.5
}


/* Combined */

export function combineFlat(inEasing, outEasing, flatRatio = 0.5) {
  const start = (1 - flatRatio) / 2
  const end = 1 - start
  return t => {
    if (t <= start) {
      return inEasing(remap(0, start, 0, 1, t))
    }

    if (t >= end) {
      return inEasing(remap(end, 1, 0, 1, t))
    }

    return 1
  }
}

export function combineEasing(inEasing, outEasing, noChangeRatio = 0.5) {
  const start = (1 - noChangeRatio) / 2
  const end = 1 - start
  return t => {
    if (t <= start) {
      const progress = inverseLerp(0, start, t)
      const easingValue01 = inEasing(progress)
      const easingValueActual = easingValue01 * start

      return lerp(easingValueActual, t, progress)
    }

    if (t >= end) {
      const progress = inverseLerp(end, 1, t)
      const easingValue01 = outEasing(progress)
      const easingValueActual = lerp(end, 1, easingValue01)

      return lerp(t, easingValueActual, progress)
    }

    return t
  }
}
