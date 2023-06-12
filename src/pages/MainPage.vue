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
      this.loadThree()
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

$ease: cubic-bezier(.2, 1, .3, 1);

.А {
  display: none;
  position: absolute;
  justify-content: space-between;
  align-items: center;
  inset: 0;
  flex-direction: column;

  svg {
    width: 100px;
    height: auto;
    overflow: visible;
    transform: rotate(90DEG);
    fill: white;

    polygon, path {
      transition: all 0.5s $ease;
    }

    .arrow {
      animation: arrow-anim 2.5s $ease infinite;
    }

    .fixed {
      animation: arrow-fixed-anim 2.5s $ease infinite;
    }
  }
}

@keyframes arrow-anim {
  0% {
    opacity: 1;
    transform: translateX(0);
  }
  5% {
    transform: translateX(-0.1rem);
  }
  100% {
    transform: translateX(1rem);
    opacity: 0;
  }
}

@keyframes arrow-fixed-anim {
  5% {
    opacity: 0;
  }
  20% {
    opacity: 0.4;
  }
  100% {
    opacity: 1;
  }
}

</style>

