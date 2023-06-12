<script>
import {defineComponent} from 'vue'

export default defineComponent({
  name: "battery"
})
</script>

<template>
  <div class="battery">
    <div class="energy"></div>
  </div>
</template>

<style scoped lang="scss">
.battery {
  position: relative;
  color: #fff;
  border: 5px solid currentColor;
  border-radius: 16px;
  min-width: 220px;
  height: 70px;
  animation-name: power-saving-mode-border;
  animation-duration: 3s;
  animation-iteration-count: infinite;
}

.battery::after {
  content: '';
  background: currentColor;
  height: 50%;
  width: 16px;
  position: absolute;
  border-top-right-radius: 16px;
  top: 0;
  right: -25px;
  bottom: 0;
  margin: auto;
  border-bottom-right-radius: 16px;
}

.energy {
  width: 50%;
  height: 100%;
  background: white;
  border-radius: 8px;
  animation-name: power-saving-mode;
  animation-duration: 3s;
  animation-iteration-count: infinite;
}

@keyframes power-saving-mode-border {
  0% {
    color: white;
  }

  50% {
    color: black;

  }

  100% {
    color: white;
  }
}

@keyframes power-saving-mode {
  0% {
    background: currentColor;
    width: 50%;
  }

  50% {
    background: orange;
    width: 100%;
  }

  100% {
    background: currentColor;
    width: 50%;
  }
}
</style>