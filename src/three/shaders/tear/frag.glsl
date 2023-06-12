#pragma glslify: getHexagonDistortedUV = require(../utils/getHexagonDistortedUV.glsl)
#pragma glslify: getHexagonVector = require(../utils/getHexagonVector.glsl)
#pragma glslify: remap = require(../utils/remap.glsl)
#pragma glslify: inOutSin = require(glsl-easings/sine-in-out)
#pragma glslify: inSin = require(glsl-easings/sine-in)
#pragma glslify: outSin = require(glsl-easings/sine-out)

uniform float uAspectRatio;
uniform float uHexagonSize;
uniform vec2 uLocalTearIntensity;
uniform vec2 uGlobalTearIntensity;
uniform vec2 uMousePos;
uniform float uMouseInfluence;
uniform float uMouseInfluenceRadius;
uniform sampler2D uMap;
uniform sampler2D uMap2;
uniform float uTransitionProgress;
uniform float uTransitionSmoothness;

varying vec2 vUv;


float distanceToLine(vec2 v, vec2 p1, vec2 p2) {
   vec2 v1 = p2 - p1;
   vec2 v2 = p1 - v;
   vec2 v3 = vec2(v1.y, -v1.x);
   return abs(dot(v2, normalize(v3)));
}

float getTransitionProgress(vec2 offset, float progress) {
  vec2 hexagonVector = getHexagonVector(vUv + offset, uAspectRatio, uHexagonSize) + 0.5;
  float lineDistance = remap(0.0, 0.68, 1.0, 0.0, distanceToLine(vUv, vec2(0.0, 1.0), vec2(1.0, 0.0)), true);
  float threshold = ((hexagonVector.r / 0.95 + lineDistance * 0.95) * 0.5);

  float p = mix(-uTransitionSmoothness, 1.0 + uTransitionSmoothness, progress);
  float lower = p - uTransitionSmoothness;
  float higher = p + uTransitionSmoothness;
  return 1.0 - smoothstep(lower, higher, threshold);
}

void main() {
  float colorMixFactor = getTransitionProgress(vec2(5.0), uTransitionProgress);
  float distortedColorMixFactor = getTransitionProgress(vec2(0.0), uTransitionProgress);


  float globalTearIntensity = uTransitionProgress < 0.5
    ? inSin(remap(0.0, 0.5, 0.0, 1.0, uTransitionProgress, false))
    : outSin(remap(0.5, 1.0, 1.0, 0.0, uTransitionProgress, false));


  vec2 distortedUv = getHexagonDistortedUV(vUv, uMousePos, uAspectRatio, uMouseInfluence, uMouseInfluenceRadius, uHexagonSize, uLocalTearIntensity, uGlobalTearIntensity * inOutSin(globalTearIntensity) * 0.75);
  distortedUv.y = vUv.y;


  vec4 color1 = texture2D(uMap, vUv);
  vec4 color2 = texture2D(uMap2, vUv);
  vec4 distortedColor1 = texture2D(uMap, distortedUv);
  vec4 distortedColor2 = texture2D(uMap2, distortedUv);


  vec4 finalColor = mix(color1, color2, colorMixFactor);
  vec4 finalDistortedColor = mix(distortedColor1, distortedColor2, distortedColorMixFactor);

  gl_FragColor = vec4(mix(finalDistortedColor.r, finalColor.r, finalColor.a), finalColor.g, finalColor.b, max(finalDistortedColor.a, finalColor.a));
}
