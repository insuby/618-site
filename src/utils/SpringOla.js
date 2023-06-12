/* eslint-disable max-classes-per-file */

//
// Author: Semenov Svyatoslav
// Year: 2020
// License: MIT
// Email: svyasem@gmail.com
// Upwork: https://www.upwork.com/fl/svyasem
//
// Based on https://github.com/franciscop/ola
//

import { clamp } from './math'

export class Spring {
  constructor(value, { mass = 1, damping = 3, stiffness = 10, clamp = false, min = -99999, max = 99999, springTargetValue = false } = {}) {
    this.mass = mass
    this.damping = damping
    this.stiffness = stiffness
    this.springTargetValue = springTargetValue
    this.clamp = clamp
    this.min = min
    this.max = max
    this.minFrameTime = 1 / 60

    this._value = value
    this.targetValue = this.springTargetValue ? new Spring(value, { mass, damping, stiffness }) : value
    this.velocity = 0

    this.lastTime = performance.now()
  }

  set value(value) {
    if (this.springTargetValue) {
      this.targetValue.value = value
    } else {
      this.targetValue = value
    }
  }

  get value() {
    if (this.clamp) {
      return clamp(this.min, this.max, this._value)
    }
    return this._value
  }

  update(deltaTime) {
    const now = performance.now()

    if (this.springTargetValue) {
      this.targetValue.update(deltaTime)
    }

    if (deltaTime == null) {
      deltaTime = (now - this.lastTime) / 1000
    }

    let deltaTimeToUse = deltaTime

    const iteratations = Math.max(1, Math.floor(deltaTime / this.minFrameTime))

    for (let i = 0; i < iteratations; i++) {
      const targetValue = this.springTargetValue ? this.targetValue.value : this.targetValue

      const springForce = -this.stiffness * (this._value - targetValue)
      const dampingForce = -this.damping * this.velocity

      const acceleration = (springForce + dampingForce) / this.mass
      this.velocity += acceleration * deltaTimeToUse
      this._value += this.velocity * deltaTimeToUse

      deltaTimeToUse = i === iteratations - 1 ? deltaTime - (iteratations * this.minFrameTime) : this.minFrameTime
    }

    this.lastTime = now
  }
}

export default class SpringOla {
  constructor(value,
    {
      mass = 1, damping = 3, stiffness = 10, clamp = false, min = -99999, max = 99999, springTargetValue = false,
      ...valuesSettings
    } = {}) {
    this._springs = []

    for (const [key, v] of Object.entries(typeof value === 'object' ? value : { value })) {
      const settings = valuesSettings[key] ?? {}
      const spring = new Spring(v, { mass, damping, stiffness, clamp, min, max, springTargetValue, ...settings })

      Object.defineProperty(this, key, {
        get: () => spring.value,
        set: val => spring.value = val,
        enumerable: true,
      })

      this._springs.push({ key, spring })
    }
  }

  update(deltaTime) {
    for (const { spring } of this._springs) {
      spring.update(deltaTime)
    }
  }
}

