<template>
  <component :is="tag" v-if="wrapper" v-bind="$attrs">
    <svg
      v-if="icon"
      :width="width || icon.width"
      :height="height || icon.height"
      :viewBox="icon.viewBox"
      :preserveAspectRatio="preserveAspectRatio"
      v-html="icon.data"
    />
  </component>
  <svg
    v-else-if="icon"
    :width="width || icon.width"
    :height="height || icon.height"
    :viewBox="icon.viewBox"
    :preserveAspectRatio="preserveAspectRatio"
    v-html="icon.data"
  />
</template>
<script>
  import { icons } from '../svgicon'

  export default {
    name: 'VIcon',
    props: {
      name: {
        type: String,
        required: true,
      },
      width: String,
      height: String,
      wrapper: Boolean,
      tag: {
        type: String,
        default: 'span',
      },
      preserveAspectRatio: String,
    },
    computed: {
      icon() {
        return icons[this.name]
      },
    },
    created() {
      if (!Object.keys(icons).includes(this.name)) {
        console.error(`Icon with name ${this.name} not found`)
      }
    },
  }
</script>
<style lang="scss" module></style>
