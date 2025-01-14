# Injecting Visual Bugs by Overwriting PixiJS WebGL Shader Source Codes

## Code structure of this folder

```
.
├── README.md
├── default.js 									// default PixiJS shader
└── bug{Appearance,Layout,Rendering,State}.js	// custom bug-injected shaders
```

### Notes

#### Appearance bugs
Can inject appearance bug by adding a vector like follows:
**Fragment shader:**
- Makes textures redder
```
-- 	gl_FragColor = color * vColor;
++ 	gl_FragColor = vec4(0.5, 0.0, 0.0, 0.0) + (color * vColor)
```
*(OR)*
**Vertex shader:**
```
++ 	if (color[0] > 0.5) 
++ 	{
++     color = vec4(0.5, 0.0, 0.0, 0.0) + color;
++ 	}
```
*(OR)*
**Vertex shader:**
```
-- 	vColor = aColor * tint;
++ 	vColor = aColor * tint * 0.5;
```

#### Rendering bugs
To inject a rendering bug:
**Fragment shader:**
```
   	else if(vTextureId < 4.5)
	{
++   	vec2 onePixel = vec2(1.0, 1.0) / vec2(190.0, 190.0);
     	color = texture2D(uSamplers[4], vTextureCoord);
++   	color = color + texture2D(uSamplers[4], vTextureCoord + vec2(0.0, onePixel.y));
++   	color = color + texture2D(uSamplers[4], vTextureCoord + vec2(onePixel.x, 0.0));
++   	color = color + texture2D(uSamplers[4], vTextureCoord + vec2(onePixel.x, onePixel.y));
++   	color = color / 4.0;
   	}
```

#### State bugs
For a state bug:
**Vertex shader:**
```
-- 	vColor = aColor * tint;
++ 	vColor = aColor * tint * 0.001;
```

#### Layout bugs
For a layout bug:
**Vertex shader:**
```
-- 	gl_Position = vec4((projectionMatrix * translationMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);
++ 	gl_Position = vec4((projectionMatrix * translationMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 2.0);
```

#### Other notes

- *Tried adding a piece of code to optionally use higher precision float*
	- `precision highp float` in vertex shader
	- `#ifdef GL_FRAGMENT_PRECISION_HIGH
	   precision highp float;
	   #else
	   precision mediump float;
	   #endif` in fragment shader
	-  *Removed these ^ for bug injection, was just checking out how it works*
