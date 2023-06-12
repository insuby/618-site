<script>
import Battery from "../components/Battery.vue";

export default {
  name: 'Modal',
  components: {Battery},
  methods: {
    close() {
      this.$emit('close');
    },
  },
};
</script>

<template>
  <transition name="modal-fade">
    <div class="modal-backdrop">
      <div class="modal"
           role="dialog"
           aria-labelledby="modalTitle"
           aria-describedby="modalDescription"
      >
        <p>turn off <br> power saving mode <br>for correct site work</p>
        <battery/>
        <button class="btn" onclick="location.reload()">
          done!
        </button>
      </div>
    </div>
  </transition>
</template>

<style>
.modal-backdrop {
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: rgba(0, 0, 0, 0.3);
  display: flex;
  justify-content: center;
  align-items: center;
  backdrop-filter: blur(10px);
}

.modal {
  background-color: #ffffff07;
  border: 1px solid #e6e6e6;
  border-radius: 3rem;
  padding: 0 1rem;
  overflow-x: auto;
  display: flex;
  flex-direction: column;
  height: 400px;
  align-items: center;
  justify-content: space-evenly;

  border-top-left-radius: 0;
  border-bottom-left-radius: 0;

  text-transform: uppercase;
  text-align: center;
  letter-spacing: 5px;
  line-height: 40px;
}

.modal button {
  text-transform: uppercase;
  text-align: center;
  letter-spacing: 5px;
  line-height: 40px;
  background: transparent;
  border: 1px solid #ffffff50;
  padding: 0 2rem;
  cursor: pointer;
  border-radius: 7px;
}

.modal button:hover {
  transition: box-shadow .3s ease;
  box-shadow: 0 0 #ffffff50, 0 0 50px #ffffff50
}

</style>