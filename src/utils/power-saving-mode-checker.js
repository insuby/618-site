function isIos() {
  // Половина “красоты” сайта, не работает при включенном на телефоне - режиме энергосбережения. Надо как то об этом предупреждать пользователя, и призвать его выключить этот режим.
  return /(iPhone|iPod|iPad).*AppleWebKit.*Safari/i.test(navigator.userAgent);
}

function measureFPS(callback) {
  let frames = 0;
  let fps = 0;
  const startTime = performance.now();

  if (fps) return

  function countFrames() {
    frames++;
    const elapsedTime = performance.now() - startTime;
    if (elapsedTime >= 2000) { // 2 секунды прошло
      fps = Math.round(frames / (elapsedTime / 1000));
      if (fps <= 130) {
        callback()
        return
      }
      return
    }
    requestAnimationFrame(countFrames);
  }

  requestAnimationFrame(countFrames);
}

export const isPowerSavingMode = (callback) => {
  if (isIos()) {
    measureFPS(callback)
  }
}
