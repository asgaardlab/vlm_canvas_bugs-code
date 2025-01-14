const vertexSourceBugLayout = `precision highp float;
#define SHADER_NAME pixi-shader-bug-layout
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
    gl_Position = vec4((projectionMatrix * translationMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 2.0);

    vTextureCoord = aTextureCoord;
    vTextureId = aTextureId;
    vColor = aColor * tint;
}`

const fragmentSourceBugLayout = `precision mediump float;
#define SHADER_NAME pixi-shader-bug-layout
varying vec2 vTextureCoord;
varying vec4 vColor;
varying float vTextureId;
uniform sampler2D uSamplers[16];

void main(void){
    vec4 color;


    if(vTextureId < 0.5)
    {
        color = texture2D(uSamplers[0], vTextureCoord);
    }
    else if(vTextureId < 1.5)
    {
        color = texture2D(uSamplers[1], vTextureCoord);
    }
    else if(vTextureId < 2.5)
    {
        color = texture2D(uSamplers[2], vTextureCoord);
    }
    else if(vTextureId < 3.5)
    {
        color = texture2D(uSamplers[3], vTextureCoord);
    }
    else if(vTextureId < 4.5)
    {
        color = texture2D(uSamplers[4], vTextureCoord);
    }
    else if(vTextureId < 5.5)
    {
        color = texture2D(uSamplers[5], vTextureCoord);
    }
    else if(vTextureId < 6.5)
    {
        color = texture2D(uSamplers[6], vTextureCoord);
    }
    else if(vTextureId < 7.5)
    {
        color = texture2D(uSamplers[7], vTextureCoord);
    }   
    else if(vTextureId < 8.5)
    {
        color = texture2D(uSamplers[8], vTextureCoord);
    }
    else if(vTextureId < 9.5)
    {
        color = texture2D(uSamplers[9], vTextureCoord);
    }
    else if(vTextureId < 10.5)
    {
        color = texture2D(uSamplers[10], vTextureCoord);
    }
    else if(vTextureId < 11.5)
    {
        color = texture2D(uSamplers[11], vTextureCoord);
    }
    else if(vTextureId < 12.5)
    {
        color = texture2D(uSamplers[12], vTextureCoord);
    }
    else if(vTextureId < 13.5)
    {
        color = texture2D(uSamplers[13], vTextureCoord);
    }
    else if(vTextureId < 14.5)
    {
        color = texture2D(uSamplers[14], vTextureCoord);
    }
    else 
    {
        color = texture2D(uSamplers[15], vTextureCoord);
    }


    gl_FragColor = color * vColor;
}`

window.vertexSourceBugLayout = vertexSourceBugLayout;
window.fragmentSourceBugLayout = fragmentSourceBugLayout;
