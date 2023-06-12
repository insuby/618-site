uniform vec2 uRepeat;

varying vec2 vUv;

void main() {
  vUv = uv * uRepeat;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
