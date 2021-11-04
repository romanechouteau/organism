varying float vNoise;

void main() {
  vec3 color = vec3(0.09, 0.173, 0.38);
  vec3 lightColor= vec3(0.51, 0.576, 0.745);
  vec3 finalColor = mix(color, lightColor, vNoise);

  gl_FragColor = vec4(finalColor, 1.);
}