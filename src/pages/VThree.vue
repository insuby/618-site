<template>
  <div>
    <canvas ref="canvas" :class="$style.canvas" />
    <a v-show="url != null" ref="link" target="_blank" :href="url" rel="noopener noreferrer" :class="$style.link" />
  </div>
</template>
<script>
import * as three from 'three'
import Engine from '../three/Engine'
import {isTouch} from '../plugins/isTouchScreen'

export default {
    name: 'VThree',
    data() {
      return {
        url: null,
      }
    },
    async mounted() {
      three.DefaultLoadingManager.onProgress = (url, itemsLoaded, itemsTotal) => {
        this.$emit('loading-progress', itemsLoaded / itemsTotal)
      }

      this.engine = new Engine()
      this.engine.addEventListener('hoverCursor', this.onHoverCursor)
      this.engine.addEventListener('loaded', () => this.$emit('loaded'))

      await this.engine.init(this.$refs.canvas)
    },
    methods: {
      onHoverCursor({ cursorType, url }) {
        if (this.$refs.canvas != null) {
          this.$refs.canvas.style.cursor = isTouch ? null : cursorType
        }
        this.url = url

        if (isTouch) {
          this.$refs.link.click()
        }
      },
    },
  }
</script>
<style lang="scss" module>
  .canvas {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    width: 100%;
    height: 100%;
    pointer-events: auto;
  }

  .link {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
  }
</style>
