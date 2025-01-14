const vertexSourceBugRendering = `#define SHADER_NAME pixi-shader-bug-rendering
precision highp float;

attribute vec2 aVertexPosition;
attribute vec2 aTextureCoord;
attribute vec4 aColor;
attribute float aTextureId;

uniform mat3 projectionMatrix;
uniform mat3 translationMatrix;
uniform vec4 tint;

varying vec2 vTextureCoord;
varying vec4 vColor;
varying float vTextureId;

void main(void){
    gl_Position = vec4((projectionMatrix * translationMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);

    vTextureCoord = aTextureCoord;
    vTextureId = aTextureId;
    vColor = aColor * tint;
}`

const fragmentSourceBugRendering = `#define SHADER_NAME pixi-shader-bug-rendering
precision mediump float;

uniform sampler2D uSamplers[16];

varying vec2 vTextureCoord;
varying vec4 vColor;
varying float vTextureId;

void main(void){
    vec4 color = vec4(0.0);
    float i_float, luminance;

    // Calculate the base value for intervals of 0.05
    float intervalHeight = 0.05;
    float rangeOffset = 0.01; // Range offset for finer control

    // Check if the current texture coordinate is within a "bank" or "range"
    float baseCoordinate = floor(vTextureCoord.y / intervalHeight) * intervalHeight;

    for (int i=0; i<16; i++)
    {
        i_float = float(i);

        if (vTextureId < (i_float+0.5))
        {
            color = texture2D(uSamplers[i], vTextureCoord);
            // Check for the specific range around the base coordinate
            if (vTextureCoord.y > baseCoordinate && vTextureCoord.y < (baseCoordinate + rangeOffset)) 
            {
                // Calculate luminance
                luminance = dot(color.rgb, vec3(0.299, 0.587, 0.114));

                // Invert luminance of output color based on calculated luminance of texture color
                if (luminance < 0.6) 
                {
                    // Lighten this line to introduce artifact
                    color *= vec4(1.0, 1.0, 1.0, 0.8);
                } 
                else
                {
                    // Darken this line to introduce artifact
                    color *= vec4(0.0, 0.0, 0.0, 0.8);
                }
            } 
            break;
        }
    } 

    gl_FragColor = color * vColor;
}`

window.vertexSourceBugRendering = vertexSourceBugRendering;
window.fragmentSourceBugRendering = fragmentSourceBugRendering;
