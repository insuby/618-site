<template>
  <div
    :class="[$style.container, { [$style.visible]: visible, [$style.preloaderVisible]: visible && preloaderVisible }]">
    <div :class="$style.preloader">
      <svg width="262" height="302" viewBox="0 0 262 302" xmlns="http://www.w3.org/2000/svg">
        <g :class="$style.largeParts">
          <path :class="getClass('large', 0)"
                d="M260.671 76.0838L130.977 1.22327V64.2089L206.089 107.602L260.671 76.0838Z"/>
          <path :class="getClass('large', 1)"
                d="M260.671 225.861V76.0838L206.089 107.602L206.062 194.334L260.671 225.861Z"/>
          <path :class="getClass('large', 2)"
                d="M130.98 300.755L260.671 225.861L206.062 194.334L130.977 237.417V300.753L130.98 300.755Z"/>
          <path :class="getClass('large', 3)"
                d="M1.27651 225.868L130.977 300.753V237.417L55.9297 194.309L1.27651 225.868Z"/>
          <path :class="getClass('large', 4)" d="M1.27651 76.1052V225.868L55.9297 194.309V107.658L1.27651 76.1052Z"/>
          <path :class="getClass('large', 5)"
                d="M130.977 1.22327L1.27651 76.1052L55.9297 107.658C80.7473 93.1749 130.501 64.2089 130.977 64.2089V1.22327Z"/>
        </g>

        <g :class="$style.smallParts">
          <path :class="getClass('small', 0)" d="M130.977 64.2089V150.974L206.089 107.602L130.977 64.2089Z"/>
          <path :class="getClass('small', 1)"
                d="M206.062 194.334L206.089 107.602L130.977 150.974V150.985L206.062 194.334Z"/>
          <path :class="getClass('small', 2)" d="M130.977 237.417L206.062 194.334L130.977 150.985V237.417Z"/>
          <path :class="getClass('small', 3)"
                d="M55.9297 194.309L130.977 237.417V150.985L130.968 150.979L55.9297 194.309Z"/>
          <path :class="getClass('small', 4)" d="M55.9297 107.658V194.309L130.968 150.979L55.9297 107.658Z"/>
          <path :class="getClass('small', 5)"
                d="M55.9297 107.658L130.968 150.979L130.977 150.974V64.2089C130.501 64.2089 80.7473 93.1749 55.9297 107.658Z"/>
        </g>

        <path
          d="M130.977 1.22327L1.27651 76.1052M130.977 1.22327L260.671 76.0838M130.977 1.22327V64.2089M1.27651 76.1052V225.868M1.27651 76.1052L55.9297 107.658M1.27651 225.868L130.977 300.753M1.27651 225.868L55.9297 194.309M260.671 225.861L130.98 300.755L130.977 300.753M260.671 225.861V76.0838M260.671 225.861L206.062 194.334M260.671 76.0838L206.089 107.602M130.977 300.753V237.417M130.977 237.417L206.062 194.334M130.977 237.417L55.9297 194.309M130.977 237.417V150.985M206.062 194.334L206.089 107.602M206.062 194.334L130.977 150.985M206.089 107.602L130.977 64.2089M206.089 107.602L130.977 150.974M130.977 64.2089C130.501 64.2089 80.7473 93.1749 55.9297 107.658M130.977 64.2089V150.974M55.9297 107.658V194.309M55.9297 107.658L130.968 150.979M55.9297 194.309L130.968 150.979M130.977 150.974L130.968 150.979M130.977 150.974V150.985M130.968 150.979L130.977 150.985"
          stroke="#808080" :class="$style.outline"
        />
      </svg>
      <div :class="$style.fancyProgress">
        {{ fancyProgress }}
      </div>
    </div>
  </div>
</template>
<script>
import {getNextIndex} from '../utils/array'

export default {
  name: 'VPreloader',
  props: {
    progress: Number,
    visible: Boolean,
  },
  data() {
    return {
      activeSmallPartIndex: 1,
      semiactiveSmallPartIndex: 0,
      activeLargePartIndex: -1,
      semiactiveLargePartIndex: -1,
      preloaderVisible: false,
      actualProgress: 0,
    }
  },
  computed: {
    fancyProgress() {
      return `${Math.round(this.actualProgress * 100)}%`
    },
  },
  watch: {
    progress: {
      handler(progress, lastProgress) {
        if (progress > lastProgress) {
          this.actualProgress = progress * 0.95
        }
      },
      immediate: true,
    },
    actualProgress(actualProgress) {
      this.activeLargePartIndex = Math.floor(actualProgress * 6) - 1
      this.semiactiveLargePartIndex = this.activeLargePartIndex + 1
    },
    visible(visible) {
      if (!visible) {
        this.actualProgress = 1
        setTimeout(() => {
          clearInterval(this.intervalId)
        }, 150 * 12)
      }
    },
  },
  mounted() {
    this.intervalId = setInterval(this.nextSmallPart, 100)
    setTimeout(() => {
      this.preloaderVisible = true
    }, 150)
  },
  methods: {
    nextSmallPart() {
      this.activeSmallPartIndex = getNextIndex(this.activeSmallPartIndex, 6)
      this.semiactiveSmallPartIndex = getNextIndex(this.semiactiveSmallPartIndex, 6)
    },
    getClass(type, index) {
      if (type === 'small') {
        return index === this.activeSmallPartIndex ? this.$style.active
          : index === this.semiactiveSmallPartIndex ? this.$style.semiactive
            : null
      }
      if (type === 'large') {
        return index <= this.activeLargePartIndex ? this.$style.active
          : index === this.semiactiveLargePartIndex ? this.$style.semiactive
            : null
      }
      return null
    },
  },
}
</script>
<style lang="scss" module>
.container {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: black;
  opacity: 0;
  pointer-events: none;
  transition: opacity $td * 6 $td * 12;

  &.visible {
    pointer-events: all;
    opacity: 1;
  }

  &.preloaderVisible .preloader {
    opacity: 1;
  }
}

.preloader {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: grid;
  grid-gap: $spacer * 2;
  justify-items: center;
  opacity: 0;
  transition: opacity $td * 6 $td * 6;

  svg {
    width: calc(262px * 0.9);
    height: calc(302px * 0.9);
  }

  @include down-height(xs) {
    grid-gap: $spacer;

    svg {
      width: calc(262px * 0.6);
      height: calc(302px * 0.6);
    }
  }
}

.fancyProgress {
  font-size: 48px;
  font-family: $accent-font-family;
  font-variant-numeric: tabular-nums;

  @include down-height(xs) {
    font-size: 24px;
  }
}

.semiactive {
  fill: #B3B3B3;
}

.active {
  fill: white;
}
</style>
