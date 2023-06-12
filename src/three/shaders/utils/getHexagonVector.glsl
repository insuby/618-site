const vec2 s = vec2(1.0, 1.7320508);

vec4 getHex(vec2 p) {
  vec4 hC = floor(vec4(p, p - vec2(0.5, 1)) / s.xyxy) + 0.5;
  vec4 h = vec4(p - hC.xy * s, p - (hC.zw + 0.5) * s);
  return dot(h.xy, h.xy) < dot(h.zw, h.zw) ? vec4(h.xy, hC.xy) : vec4(h.zw, hC.zw);
}

vec2 getHexagonVector(vec2 uv, float aspectRatio, float hexagonSize) {
  return getHex(vec2(uv.x * aspectRatio, uv.y) * hexagonSize).xy;
}

#pragma glslify: export(getHexagonVector)
