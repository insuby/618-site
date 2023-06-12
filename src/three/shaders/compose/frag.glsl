uniform sampler2D uBackgroundMap;
uniform sampler2D uUIMap;

varying vec2 vUv;

void main() {
  vec4 backgroundColor = texture2D(uBackgroundMap, vUv);
  vec4 uiColor = texture2D(uUIMap, vUv);
  gl_FragColor = vec4(mix(backgroundColor.rgb, uiColor.rgb / max(uiColor.a * uiColor.a, 0.000001), uiColor.a), 1.0);
}
