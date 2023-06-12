float inverseLerp(float a, float b, float v, bool clampResult) {
  float result = (v - a) / (b - a);

  if (clampResult) {
    return clamp(result, 0.0, 1.0);
  }

  return result;
}

#pragma glslify: export(inverseLerp)
