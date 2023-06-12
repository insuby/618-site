import Vue from 'vue'
import mapValues from 'lodash/mapValues'
import isNumber from 'lodash/isNumber'
import parseScssMap from './parseScssMap'
import variables from '../../assets/styles/_variables.scss'

const vm = new Vue({
  data() {
    return {
      windowWidth: window.innerWidth,
      windowHeight: window.innerHeight,
    }
  },
})

window.addEventListener('resize', () => {
  vm.windowWidth = window.innerWidth
  vm.windowHeight = window.innerHeight
})

export const breakpoints = mapValues(parseScssMap(variables.breakpoints), parseFloat)

export function up(breakpoint) {
  if (isNumber(breakpoint)) {
    return vm.windowWidth > breakpoint
  }
  return vm.windowWidth > breakpoints[breakpoint]
}

export function down(breakpoint) {
  if (isNumber(breakpoint)) {
    return vm.windowWidth <= breakpoint
  }
  return vm.windowWidth <= breakpoints[breakpoint]
}

export function upHeight(breakpoint) {
  if (isNumber(breakpoint)) {
    return vm.windowHeight > breakpoint
  }
  return vm.windowHeight > breakpoints[breakpoint]
}

export function downHeight(breakpoint) {
  if (isNumber(breakpoint)) {
    return vm.windowHeight <= breakpoint
  }
  return vm.windowHeight <= breakpoints[breakpoint]
}
