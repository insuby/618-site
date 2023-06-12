vec4 convolve3x3(sampler2D sampler, vec2 uv, mat3 kernel, vec2 sampleStep) {
  vec4 result = vec4(0.0);

  result += texture2D(sampler, uv + vec2(-sampleStep.x, sampleStep.y)) * kernel[0][0];
  result += texture2D(sampler, uv + vec2(0.0, sampleStep.y)) * kernel[0][1];
  result += texture2D(sampler, uv + vec2(sampleStep.x, sampleStep.y)) * kernel[0][2];
  result += texture2D(sampler, uv + vec2(-sampleStep.x, 0.0)) * kernel[1][0];
  result += texture2D(sampler, uv + vec2(0.0, 0.0)) * kernel[1][1];
  result += texture2D(sampler, uv + vec2(sampleStep.x, 0.0)) * kernel[1][2];
  result += texture2D(sampler, uv + vec2(-sampleStep.x, -sampleStep.y)) * kernel[2][0];
  result += texture2D(sampler, uv + vec2(0.0, -sampleStep.y)) * kernel[2][1];
  result += texture2D(sampler, uv + vec2(sampleStep.x, -sampleStep.y)) * kernel[2][2];

  return result;
}

#pragma glslify: export(convolve3x3)
