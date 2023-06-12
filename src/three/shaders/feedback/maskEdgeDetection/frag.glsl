#pragma glslify: convolve3x3 = require(../../utils/convolve3x3.glsl)
#pragma glslify: blend = require(glsl-blend/screen)

uniform sampler2D uMap;
uniform vec2 uMapResolution;
varying vec2 vUv;

const mat3 kernel = mat3(
  0.0, 2.0, 0.0,
  2.0, -8.0, 2.0,
  0.0, 2.0, 0.0
);

vec4 adjustGamma(vec4 color, float gamma) {
  color.rgb = pow(color.rgb, vec3(1.0 / gamma));
  return color;
}

void main() {
  vec2 sampleStep = vec2(1.8 / uMapResolution.x, 0.2 / uMapResolution.y);
  vec4 color = texture2D(uMap, vUv);

  vec4 edgeColor = convolve3x3(uMap, vUv, kernel, sampleStep);
  edgeColor.rgb = vec3(max(max(edgeColor.r, edgeColor.g), edgeColor.b) * 0.243, 0.0, 0.0);

  gl_FragColor = vec4(blend(color.rgb,edgeColor.rgb, 1.0), 1.0);
}
