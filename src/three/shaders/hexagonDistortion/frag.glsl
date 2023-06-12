#pragma glslify: getHexagonDistortedUV = require(../utils/getHexagonDistortedUV.glsl)

varying vec2 vUv;

uniform sampler2D uMap;
uniform float uAspectRatio;
uniform float uHexagonSize;
uniform vec2 uDistortionIntensity;
uniform vec2 uMousePos;
uniform float uMouseInfluence;
uniform float uMouseInfluenceRadius;

void main() {
  vec2 distortedUv = getHexagonDistortedUV(vUv, uMousePos, uAspectRatio, uMouseInfluence, uMouseInfluenceRadius, uHexagonSize, uDistortionIntensity, vec2(0.0));
  gl_FragColor = texture2D(uMap, distortedUv);
}
