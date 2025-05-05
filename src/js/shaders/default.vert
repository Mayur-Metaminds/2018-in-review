#version 300 es

in vec2 uv;
out vec2 vUv;

uniform float time;

void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}