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

void main() {
  vec2 distortedUv = getHexagonDistortedUV(vUv, uMousePos, uAspectRatio, uMouseInfluence, uMouseInfluenceRadius, uHexagonSize, uDistortionIntensity, vec2(0.0));

  vec4 inputColor = texture2D(uInputMap, distortedUv);
  vec4 storedColor = texture2D(uStoreMap, vUv - vec2(1.0 / uMapResolution.x, 0.0));

  gl_FragColor = inputColor + storedColor - vec4(vec3(1.5 / 255.0), 0.0);
}
