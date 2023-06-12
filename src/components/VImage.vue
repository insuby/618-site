<template>
  <img ref="image" :srcset="image.srcSet" :alt="alt" decoding="async" />
</template>
<script>
  export default {
    name: 'VImage',
    props: {
      src: {
        type: String,
        required: true,
      },
      alt: {
        type: String,
        default: '',
      },
    },
    computed: {
      image() {
        return require('../../assets/images/' + this.src + '?responsive')
      },
    },
    mounted() {
      this.$refs.image?.decode().catch(() => {})
    },
  }
</script>
<style lang="scss" module></style>
