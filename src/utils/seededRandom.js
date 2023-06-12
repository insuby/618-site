// https://stackoverflow.com/questions/521295/seeding-the-random-number-generator-in-javascript

import { lerp } from './math'

export function seededRandom(a) {
  let t = a + 0x6D2B79F5
  t = Math.imul(t ^ t >>> 15, t | 1)
  t ^= t + Math.imul(t ^ t >>> 7, t | 61)
  return ((t ^ t >>> 14) >>> 0) / 4294967296
}

export class SeededRandomGenerator {
  constructor(seed) {
    this.seed = seed
    this.a = seed
  }

  get(min = 0, max = 1) {
    this.a += 0x6D2B79F5
    let t = this.a
    t = Math.imul(t ^ t >>> 15, t | 1)
    t ^= t + Math.imul(t ^ t >>> 7, t | 61)
    return lerp((min, max, (t ^ t >>> 14) >>> 0) / 4294967296)
  }
}
