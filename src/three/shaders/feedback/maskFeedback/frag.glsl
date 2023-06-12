#pragma glslify: getHexagonDistortedUV = require(../../utils/getHexagonDistortedUV.glsl)

uniform sampler2D uInputMap;
uniform sampler2D uStoreMap;
uniform float uAspectRatio;
uniform float uHexagonSize;
uniform vec2 uDistortionIntensity;
uniform vec2 uMousePos;
uniform float uMouseInfluence;
uniform float uMouseInfluenceRadius;
uniform vec2 uMapResolution;
varying vec2 vUv;

vec3 rgb2hsv(vec3 c) {
  vec4 K = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);
  vec4 p = mix(vec4(c.bg, K.wz), vec4(c.gb, K.xy), step(c.b, c.g));
  vec4 q = mix(vec4(p.xyw, c.r), vec4(c.r, p.yzx), step(p.x, c.r));

  float d = q.x - min(q.w, q.y);
  float e = 1.0e-10;
  return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + e)), d / (q.x + e), q.x);
}

vec3 hsv2rgb(vec3 c) {
  vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
  vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
  return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

vec4 adjustGamma(vec4 color, float gamma) {
  color.rgb = pow(color.rgb, vec3(1.0 / gamma));
  return color;
}

vec4 adjustBrightness(vec4 color, float brightness) {
  color.rgb *= brightness;
  return color;
}

vec4 adjustSaturation(vec4 color, float saturation) {
    const vec3 W = vec3(0.2125, 0.7154, 0.0721);
    vec3 intensity = vec3(dot(color.rgb, W));
    return vec4(mix(intensity, color.rgb, saturation), color.a);
}

vec4 adjustHue(vec4 color, float hue) {
  vec3 hsv = rgb2hsv(color.rgb);
  hsv.x += (hue / 360.0);
  color.rgb = hsv2rgb(hsv);
  return color;
}

void main() {
  vec2 distortedUv = getHexagonDistortedUV(vUv, uMousePos, uAspectRatio, uMouseInfluence, uMouseInfluenceRadius, uHexagonSize, uDistortionIntensity, vec2(0.0));

  vec4 inputColor = texture2D(uInputMap, distortedUv);
  inputColor.rgb = vec3(max(max(inputColor.r, inputColor.g), inputColor.b)) * vec3(0.5, 0.0, 0.0);
  vec4 storedColor = texture2D(uStoreMap, vUv - vec2(1.0 / uMapResolution.x, 0.0));

  storedColor = adjustGamma(storedColor, 0.99);
  storedColor = adjustHue(storedColor, 1.7);
  storedColor = adjustSaturation(storedColor, 1.01);

  gl_FragColor = inputColor + storedColor - vec4(vec3(1.0 / 255.0), 0.0);
}
