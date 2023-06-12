export default function promisifyLoader(loader) {
  return {
    loader,
    load(url, onProgress) {
      return new Promise((resolve, reject) => {
        loader.load(url, resolve, onProgress, reject)
      })
    },
  }
}
