<template>
  <div :class="$style.page" draggable="false">
    <seo-dom/>
    <component :is="threeComponent" @loading-progress="loadingProgress = $event" @loaded="loaded = true"/>
    <v-preloader :progress="loadingProgress" :visible="!loaded"/>
    <modal v-show="isModalVisible"/>
    <slider-triangles/>
  </div>
</template>
<script>
import VPreloader from './VPreloader'
import SeoDom from './SeoDom'
import Modal from './Modal'
import {isPowerSavingMode} from "../utils/power-saving-mode-checker";
import SliderTriangles from "../components/SliderTriangles.vue";

export default {
  name: 'LandingPage',
  components: {SliderTriangles, SeoDom, VPreloader, Modal},
  data() {
    return {
      isModalVisible: false,
      loadingProgress: 0,
      loaded: false,
      threeComponent: null,
    }
  },
  async mounted() {
    isPowerSavingMode(this.showModal.bind(this))
    await new Promise(resolve => setTimeout(resolve, 400))
    if (!this.isModalVisible) {
      this.isProgressLost()
      await this.loadThree()
    }
  },
  methods: {
    async loadThree() {
      this.threeComponent = (await import('./VThree')).default
    },
    showModal() {
      this.isModalVisible = true;
    },
    isProgressLost() {
      setTimeout(() => {
        if (this.loadingProgress < 1) {
          window.location.reload()
        }
      }, 20000)
    },
  },
}
</script>
<style lang="scss" module>
.page {
  height: vh(100);
  user-select: none;
  justify-content: space-around;
}
</style>

