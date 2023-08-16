import React, { useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, shaderMaterial, useTexture } from "@react-three/drei";
import { Color } from "three";

type Props = {};

const day1 = (props: Props) => {
  return (
    <Canvas
      style={{
        width: "100vw",
        height: "100svh",
      }}
    >
      <Box />
      <OrbitControls />
    </Canvas>
  );
};

const fragmentShader = `// Author @patriciogv - 2015
// http://patriciogonzalezvivo.com
#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform float u_time;

varying vec2 vUv;
varying vec3 vPosition;
uniform sampler2D u_tex0;
uniform vec2 u_tex0Resolution;
#define PI 3.1415926535897932384626433832795
// Based on Morgan
// https://www.shadertoy.com/view/4dS3Wd



void main() {
    vec2 uv = vUv;
    uv -= vec2(0.5);
    float index = sin(u_time) * 0.5 + 0.5;
    vec3 color = vec3(vec3(length(uv)));
    color = texture2D(u_tex0, vec2(length(uv)*(index))).rgb;
    

    gl_FragColor = vec4(color , 1.0);
}`;
const vertexShader = `
varying vec3 vPosition;
varying vec3 vNormal;
varying vec2 vUv;
varying vec2 vmodelViewMatrix;

void main(){
    vPosition = position;
    vNormal = normal;
    vUv = uv;

    vec4 modelViewPosition = modelViewMatrix * vec4(position, 1.0);
    vec4 projectedPosition = projectionMatrix * modelViewPosition;
   	gl_Position = projectedPosition;
}`;

const Box = () => {
  const texture = useTexture("/wall.jpg");

  const uniforms = useMemo(
    () => ({
      u_tex0: {
        value: texture,
      },
      u_time: {
        value: 0.0,
      },
    }),
    [texture]
  );

  useFrame(({ clock }) => {
    uniforms.u_time.value = clock.getElapsedTime();
  });
  return (
    <mesh>
      <boxGeometry attach="geometry" args={[2, 2, 2]} />
      <shaderMaterial
        fragmentShader={fragmentShader}
        vertexShader={vertexShader}
        attach="material"
        uniforms={uniforms}
      />
    </mesh>
  );
};

export default day1;
