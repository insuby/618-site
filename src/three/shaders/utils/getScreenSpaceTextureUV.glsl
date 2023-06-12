vec2 getScreenSpaceTextureUV(vec2 uv, vec2 screenResolution, vec2 textureResolution) {
  float screenAspect = screenResolution.x / screenResolution.y;
  float textureAspect = textureResolution.x / textureResolution.y;

  if (textureAspect > screenAspect) {
    uv.x *= (screenAspect / textureAspect);

    // Center horizontally
    uv.x -= (screenAspect / textureAspect) / 2.0;
    uv.x += 0.5;
  } else {
    uv.y *= (textureAspect / screenAspect);

    // Center vertically
    uv.y -= (textureAspect / screenAspect) / 2.0;
    uv.y += 0.5;
  }

  return uv;
}

#pragma glslify: export(getScreenSpaceTextureUV)
