import * as three from 'three'
import * as backgroundVertices from '../../../../assets/models/backgroundVertices'
import { degToRad, negativePHI, positivePHI } from '../../../utils/math'
import { seededRandom } from '../../../utils/seededRandom'

const RND = positivePHI * Math.random() //  random geo every time

const RED_COLOR = new three.Color(0x990000)
const BLUE_COLOR = new three.Color(0xaaaaaa)

export default class GoldenRatioGeometry extends three.Group {
  constructor(layer) {
    super()

    const geometry = new three.BufferGeometry()
    geometry.setAttribute('position', new three.BufferAttribute(backgroundVertices.vertices, 3))

    const material = new three.LineBasicMaterial({
      color: 0xffffff,
      linewidth: 0.5,
      depthTest: false,
    })

    // Create lines boxes
    const line = new three.LineSegments(geometry, material)
    line.layers.set(layer)

    this.generate(line, 10, RND)

    // Create dashed boxes
    const geometry2 = new three.BufferGeometry()
    geometry2.setAttribute('position', new three.BufferAttribute(backgroundVertices.vertices2, 3))

    const material2 = new three.LineBasicMaterial({
      color: 0xffffff,
      linewidth: 0.5,
      depthTest: false,
    })

    // Generate crosses
    const line2 = new three.LineSegments(geometry2, material2)
    line2.layers.set(layer)

    line2.rotation.set(degToRad(90), 0, 0)

    this.generate(line2, 10, RND)
    this.generate(line2, 10, RND * RND)

    const geometry3 = new three.BufferGeometry()

    geometry3.setAttribute('position', new three.BufferAttribute(backgroundVertices.vertices3, 3))

    const material3 = new three.LineBasicMaterial({
      color: 0xffffff,
      linewidth: 0.5,
      depthTest: false,
    })

    const line3 = new three.LineSegments(geometry3, material3)
    line3.layers.set(layer)

    this.generate(line3, 10, RND)
    this.generate(line3, 10, RND * RND)
  }


  generate(mesh, count, seed) {
    const red = mesh.material.clone()
    const blue = mesh.material.clone()

    red.color = RED_COLOR
    blue.color = BLUE_COLOR

    mesh.scale.multiplyScalar(3)

    for (let i = 0; i < count; i++) {
      const shape = mesh.clone()

      if (i % 2 === 0) {
        shape.material = red
      } else {
        shape.material = blue
      }

      mesh.scale.multiplyScalar(negativePHI)

      if (seededRandom(i + seed) >= 0.5) {
        shape.scale.x = mesh.scale.x * negativePHI
        shape.scale.y = mesh.scale.x * negativePHI
        shape.scale.z = mesh.scale.x * negativePHI
      } else {
        shape.scale.x = mesh.scale.x * positivePHI
        shape.scale.y = mesh.scale.x * positivePHI
        shape.scale.z = mesh.scale.x * positivePHI
      }

      this.add(shape)
    }
  }
}
