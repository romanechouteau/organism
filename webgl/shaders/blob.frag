varying float vNoise;
varying vec3 vColor;

#include <fog_pars_fragment>

float hue2rgb(float f1, float f2, float hue) {
    if (hue < 0.0)
        hue += 1.0;
    else if (hue > 1.0)
        hue -= 1.0;
    float res;
    if ((6.0 * hue) < 1.0)
        res = f1 + (f2 - f1) * 6.0 * hue;
    else if ((2.0 * hue) < 1.0)
        res = f2;
    else if ((3.0 * hue) < 2.0)
        res = f1 + (f2 - f1) * ((2.0 / 3.0) - hue) * 6.0;
    else
        res = f1;
    return res;
}

vec3 hsl2rgb(vec3 inputHsl) {
    vec3 hsl = vec3(inputHsl.x / 360., inputHsl.y / 100., inputHsl.z / 100.);
    vec3 rgb;

    if (hsl.y == 0.0) {
        rgb = vec3(hsl.z); // Luminance
    } else {
        float f2;

        if (hsl.z < 0.5)
            f2 = hsl.z * (1.0 + hsl.y);
        else
            f2 = hsl.z + hsl.y - hsl.y * hsl.z;

        float f1 = 2.0 * hsl.z - f2;

        rgb.r = hue2rgb(f1, f2, hsl.x + (1.0/3.0));
        rgb.g = hue2rgb(f1, f2, hsl.x);
        rgb.b = hue2rgb(f1, f2, hsl.x - (1.0/3.0));
    }
    return rgb;
}

float darken (float value) {
    return clamp(value - 0.15, 0., 1.);
}

void main() {
    vec3 color = hsl2rgb(vColor);
    vec3 shadowColor = vec3(darken(color.x), darken(color.y), darken(color.z));
    vec3 finalColor = mix(shadowColor, color, vNoise);
    gl_FragColor = vec4(finalColor, 0.95);

    #include <fog_fragment>
}