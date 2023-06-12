uniform sampler2D uMap;
uniform vec3 uColor;
uniform float uOpacity;

varying vec2 vUv;

void main() {
  #if defined(USE_TEXTURE)
    vec4 color = texture2D(uMap, vUv) * vec4(uColor, 1.0);
  #else
    vec4 color = vec4(uColor, 1.0);
  #endif

  color.a *= uOpacity;

  gl_FragColor = color;
}
