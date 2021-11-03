varying float vNoise;

void main() {
    vec3 finalColor = mix(vec3(0.8, 0.588, 0.772), vec3(1., 0.788, 0.972), vNoise);
    gl_FragColor = vec4(finalColor, 1.);
}