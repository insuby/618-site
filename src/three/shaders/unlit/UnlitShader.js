import * as three from 'three'

export default {
  uniforms: {
    uMap: new three.Uniform(null),
  },
  transparent: true,
  vertexShader: `
    varying vec2 vUv;
    
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform sampler2D uMap;

    varying vec2 vUv;

    void main() {
      gl_FragColor = texture2D(uMap, vUv);
    }
  `,
}
