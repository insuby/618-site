float remap(float min1, float max1, float min2, float max2, float value, bool clampResult) {
  float result = min2 + (value - min1) * (max2 - min2) / (max1 - min1);

  if (clampResult) {
    return clamp(min2, max2, result);
  }

  return result;
}

#pragma glslify: export(remap)
