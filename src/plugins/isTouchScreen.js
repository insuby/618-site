import Vue from 'vue'
import { down } from '../utils/breakpoints'

const vm = new Vue({
  data() {
    return {
      isTouch: down('md'),
    }
  },
})

window.addEventListener('mousemove', onMouseMove)
window.addEventListener('touchstart', onTouchStart)
window.addEventListener('touchend', onTouchEnd)

let isTouched = false
export let isTouch = down('md')

function onTouchStart() {
  isTouched = true
  vm.isTouch = true
  isTouch = true
}

function onTouchEnd() {
  setTimeout(() => {
    isTouched = false
  }, 0)
}

function onMouseMove() {
  vm.isTouch = isTouched
  isTouch = isTouched
  isTouched = false
}


Vue.mixin({
  computed: {
    $isTouch() {
      return vm.isTouch
    },
  },
})
