import * as three from 'three'

export function createHexagonPartGeometry() {
  const length = 0.5
  const height = (length * Math.sqrt(3)) / 2

  const vertices = new Float32Array([
    0, 0, 0,
    length, 0, 0,
    length / 2, height, 0,
    -length / 2, height, 0,
  ])

  const indices = [
    2, 3, 0,
    1, 2, 0,
  ]

  const geometry = new three.BufferGeometry()
  geometry.setAttribute('position', new three.BufferAttribute(vertices, 3, false))
  geometry.setIndex(indices)

  geometry.computeBoundingBox()
  geometry.computeBoundingSphere()

  return geometry
}
