<script>
export default {
  name: "SliderTriangles"
}
</script>

<template>
  <div :class="$style.wrapper" class="wrapper">
  <div>
      <span :class="$style.triangle"></span>
      <span :class="$style.triangle"></span>
      <span :class="$style.triangle"></span>
    </div>

    <div>
      <span :class="$style.triangle"></span>
      <span :class="$style.triangle"></span>
      <span :class="$style.triangle"></span>
    </div>
  </div>
</template>

<style lang="scss" module>
$ease: cubic-bezier(.2, 1, .3, 1);

.triangle {
  background-image: url("/static/arrow-down.svg");
  background-repeat: no-repeat;
  background-size: 100% 100%;
  background-position: center center;
  height: 30px;
  width: 30px;
  display: inline-flex;
  transition: all 0.5s $ease;
  animation: arrow-anim 2s $ease infinite;

  //&:first-child {
  //  animation-delay: 400ms;
  //}
  //
  //&:nth-child(2) {
  //  animation-delay: 200ms;
  //}
  //
  //&:nth-child(3) {
  //  animation-delay: 200ms;
  //}
}

.wrapper {
  display: none;
  position: absolute;
  justify-content: space-between;
  align-items: center;
  inset: 0;
  flex-direction: column;

  & div {
    display: inline-flex;
    flex-direction: column;
    position: absolute;
    margin: auto;
    align-self: center;
    align-items: center;

    &:first-child {
      top: 10%;
      transform: rotate(180DEG);
    }

    &:last-child {
      bottom: 10%;
    }
  }
}

@keyframes arrow-anim {
  0% {
    opacity: 1;
    transform: scale(1.1) translateY(0);
  }
  5% {
    transform: translateY(-0.1rem);
  }
  100% {
    transform: scale(1) translateY(1rem);
    opacity: 0;
  }
}

</style>