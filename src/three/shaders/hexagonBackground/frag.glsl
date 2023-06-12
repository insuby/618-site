#pragma glslify: getScreenSpaceTextureUV = require(../utils/getScreenSpaceTextureUV.glsl)
#pragma glslify: remap = require(../utils/remap.glsl)
#pragma glslify: snoise2 = require(glsl-noise/simplex/2d)

uniform sampler2D uMap;
uniform vec2 uMapResolution;
uniform vec2 uScreenResolution;
uniform float uIndex;
uniform float uCount;
uniform float uTime;

void main() {
  vec2 uv = gl_FragCoord.xy / uScreenResolution;
  vec2 textureUv = getScreenSpaceTextureUV(gl_FragCoord.xy / uScreenResolution, uScreenResolution, uMapResolution);

  float opacity = (uIndex + 1.0) / uCount + (snoise2(vec2(uIndex * 100.0 + mod(uTime * 0.25, 500.0), uIndex * 100.0 + mod(uTime * 0.25, 500.0))) * 0.5 + 0.5) * 0.5 - 0.25;
  opacity = remap(0.0, 1.0, 0.6, 0.92, opacity, true);
  vec4 color = texture2D(uMap, textureUv);
  color.a *= opacity;

  gl_FragColor = color;
}
