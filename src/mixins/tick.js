import { addTickCallback, removeTickCallback } from '../utils/raf'

export default () => ({
  mounted() {
    addTickCallback(this.tick)
  },
  beforeDestroy() {
    removeTickCallback(this.tick)
  },
})

