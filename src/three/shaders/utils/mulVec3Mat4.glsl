vec3 mulVec3Mat4(mat4 mat, vec3 vec, bool isPos) {
    return (mat * vec4(vec, isPos ? 1.0 : 0.0)).xyz;
  }

#pragma glslify: export(mulVec3Mat4)
