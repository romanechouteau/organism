varying float vNoise;

void main() {
  vec3 color = vec3(0, 0.047, 0.18);
  vec3 lightColor= vec3(0.51, 0.576, 0.745);
  vec3 finalColor = mix(color, lightColor, vNoise);

  gl_FragColor = vec4(finalColor, 1.);
}