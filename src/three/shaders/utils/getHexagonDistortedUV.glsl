#pragma glslify: getHexagonVector = require(./getHexagonVector.glsl)
#pragma glslify: inverseLerp = require(./inverseLerp.glsl)

vec2 getHexagonDistortedUV(vec2 uv, vec2 mousePos, float aspectRatio, float mouseInfluence, float mouseInfluenceRadius, float hexagonSize, vec2 intensity, vec2 globalIntensity) {
  float distToMouse = distance(vec2(mousePos.x * aspectRatio, 1.0 - mousePos.y), vec2(uv.x * aspectRatio, uv.y));
  float localMask = inverseLerp(mouseInfluenceRadius, 0.0, distToMouse, true);
  vec2 localDistortionVec = getHexagonVector(uv + mousePos * mouseInfluence, aspectRatio, hexagonSize);
  localDistortionVec = max(localDistortionVec, vec2(0.0));
  vec2 localDistortion = localDistortionVec * intensity * localMask;

  vec2 globalDistortionVec = getHexagonVector(uv + globalIntensity * 2.0, aspectRatio, hexagonSize);
  vec2 globalDistortion = globalDistortionVec * globalIntensity;

  return uv + localDistortion + globalDistortion;
}

#pragma glslify: export(getHexagonDistortedUV)
