import * as three from 'three'
import mean from 'lodash/mean'
import { median, removeOutliers } from '../../utils/array'
import { SeededRandomGenerator } from '../../utils/seededRandom'
import { degToRad } from '../../utils/math'

export default function benchmarkGPU(options) {
  const {
    benchmarkDuration = 1250,
  } = options ?? {}

  return new Promise(resolve => {
    const canvas = document.createElement('canvas')
    canvas.width = 2048
    canvas.height = 2048
    const renderer = new three.WebGLRenderer({ powerPreference: 'high-performance', canvas: canvas, antialias: false })
    const scene = new three.Scene()

    const randomGen = new SeededRandomGenerator(1337)


    const geometry = new three.TorusKnotGeometry()
    const material = new three.MeshStandardMaterial()

    for (let i = 0; i < 3000; i++) {
      const x = randomGen.get(-50, 50)
      const y = randomGen.get(-50, 50)
      const z = randomGen.get(0, 50)

      const rotX = degToRad(randomGen.get(0, 360))
      const rotY = degToRad(randomGen.get(0, 360))
      const rotZ = degToRad(randomGen.get(0, 360))

      const mesh = new three.Mesh(geometry, material)
      mesh.position.set(x, y, z)
      mesh.rotation.set(rotX, rotY, rotZ)
      scene.add(mesh)
    }

    const camera = new three.PerspectiveCamera(90, 1, 0.001, 1000)
    camera.position.set(0, 0, -10)
    camera.lookAt(0, 0, 0)
    scene.add(camera)


    const light = new three.DirectionalLight()
    scene.add(light)


    const start = performance.now()
    let frameTimes = []
    let last = null

    while ((last - start) < benchmarkDuration) {
      renderer.render(scene, camera)

      const now = performance.now()
      const frameTime = now - last

      frameTimes.push(frameTime)
      last = now
    }

    frameTimes = removeOutliers(frameTimes, 5).result


    geometry.dispose()
    material.dispose()
    renderer.dispose()


    const averageFps = 1000 / mean(frameTimes)
    const medianFps = 1000 / median(frameTimes)

    resolve({
      averageFps,
      medianFps,
      tier: medianFps < 60 ? 'slow' : 'fast',
    })
  })
}
