/* eslint-disable max-len */

export let isJp2Supported = null
export let isWebPSupported = null
export let isAvifSupported = null

export async function checkJp2Support() {
  if (isJp2Supported != null) {
    return isJp2Supported
  }

  return new Promise(resolve => {
    const image = new Image()

    image.addEventListener('load', () => {
      isJp2Supported = true
      resolve(true)
    })

    image.addEventListener('error', () => {
      isJp2Supported = false
      resolve(false)
    })

    image.src = 'data:image/jp2;base64,/0//UQAyAAAAAAABAAAAAgAAAAAAAAAAAAAABAAAAAQAAAAAAAAAAAAEBwEBBwEBBwEBBwEB/1IADAAAAAEAAAQEAAH/XAAEQED/ZAAlAAFDcmVhdGVkIGJ5IE9wZW5KUEVHIHZlcnNpb24gMi4wLjD/kAAKAAAAAABYAAH/UwAJAQAABAQAAf9dAAUBQED/UwAJAgAABAQAAf9dAAUCQED/UwAJAwAABAQAAf9dAAUDQED/k8+kEAGvz6QQAa/PpBABr994EAk//9k='
  })
}

export async function checkAvifSupport() {
  if (isAvifSupported != null) {
    return isAvifSupported
  }

  const image = new Image()

  return new Promise(resolve => {
    image.addEventListener('load', () => {
      isAvifSupported = true
      resolve(true)
    })

    image.addEventListener('error', () => {
      isAvifSupported = false
      resolve(false)
    })

    image.src = 'data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAAB0AAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABhdjAxQ29sb3IAAAAAamlwcnAAAABLaXBjbwAAABRpc3BlAAAAAAAAAAIAAAACAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgQ0MAAAAABNjb2xybmNseAACAAIAAYAAAAAXaXBtYQAAAAAAAAABAAEEAQKDBAAAACVtZGF0EgAKCBgANogQEAwgMg8f8D///8WfhwB8+ErK42A='
  })
}

export async function checkWebPSupport() {
  if (isWebPSupported != null) {
    return isWebPSupported
  }

  return new Promise(resolve => {
    const image = new Image()

    image.addEventListener('load', () => {
      isWebPSupported = true
      resolve(true)
    })

    image.addEventListener('error', () => {
      isWebPSupported = false
      resolve(false)
    })

    image.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA'
  })
}
