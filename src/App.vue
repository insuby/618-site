<template>
  <div id="app" :style="appStyle">
    <MainPage/>
  </div>
</template>
<script>
import MainPage from './pages/MainPage'

export default {
  name: 'App',
  components: {MainPage},
  data() {
    return {
      viewportHeight: window.innerHeight,
    }
  },
  computed: {
    appStyle() {
      return {
        '--vh': `${this.viewportHeight / 100}px`,
      }
    },
  },
  mounted() {
    window.addEventListener('resize', this.onResize)
  },
  methods: {
    onResize() {
      this.viewportHeight = window.innerHeight
    },
  },
}
</script>
<style lang="scss" module></style>
