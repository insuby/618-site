#pragma glslify: getScreenSpaceTextureUV = require(../utils/getScreenSpaceTextureUV.glsl)

uniform sampler2D uMap;
uniform vec2 uMapResolution;
uniform vec2 uScreenResolution;
uniform float uOpacity;

void main() {
  vec2 uv = getScreenSpaceTextureUV(gl_FragCoord.xy / uScreenResolution, uScreenResolution, uMapResolution);
  vec4 color = texture2D(uMap, uv);
  color.a *= uOpacity;
  gl_FragColor = color;
}
