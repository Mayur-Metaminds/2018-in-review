#version 300 es
precision highp float;

in vec2 vUv;
out vec4 fragColor;

uniform float time;
uniform vec3 fogColor;
uniform float fogNear;
uniform float fogFar;
uniform sampler2D texture;

void main() {
	vec2 uv = vUv;
	// vec4 color = texture2D( texture, vUv );

	vec4 origColor = texture(texture, vUv);

	// remove green
	if ( origColor.r < 0.4 && origColor.b < 0.4 && origColor.g > 0.4 ) {
		origColor.a = 0.;
	}

	if ( origColor.r < 0.9 && origColor.b < 0.9 && origColor.g > 0.9 ) {
		origColor.a = 0.;
	}

	// vec4 gradientImage = mix(vec4( gradientColor, 1.0), vec4(1.0, 1.0, 1.0, 1.0), grayscaleValue);

	// if ( gradientImage.b < 0.9 ) discard;

	// gl_FragColor = origColor * opacity;
	fragColor = origColor;

	#ifdef USE_FOG
		float depth = gl_FragCoord.z / gl_FragCoord.w;
		float fogFactor = smoothstep( fogNear, fogFar, depth );
		fragColor.rgb = mix( fragColor.rgb, fogColor, fogFactor );
	#endif

}