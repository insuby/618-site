export default {
  uniforms: {
    uMap: { value: null },
    uTime: { value: 0.0 },
    uIntensity: { value: 0.5 },
  },
  vertexShader: `
    varying vec2 vUv;
    
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    #include <common>
    
    uniform float uTime;
    uniform float uIntensity;
    uniform sampler2D uMap;
    
    varying vec2 vUv;
    
    void main() {
      vec4 color = texture2D(uMap, vUv);
      float noise = rand(vUv + mod(uTime, 10.0));
      vec3 result = color.rgb + color.rgb * (clamp(noise, 0.0, 1.0) * 2.0 - 1.0) * uIntensity;
      gl_FragColor =  vec4(result, color.a);
    }
  `,
}
