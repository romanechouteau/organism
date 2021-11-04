uniform float uTime;

void main() {
  vec3 color = vec3(1., 1., 1.);
  float strength = distance(gl_PointCoord, vec2(0.5));
  float stepColor = smoothstep(0.1, 0.5, strength);

  float opacity = clamp(uTime * 0.3 - 0.1, 0., 0.3);

  gl_FragColor = mix(vec4(color, opacity), vec4(color, 0.), stepColor);
}