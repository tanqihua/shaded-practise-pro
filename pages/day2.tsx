import React, { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  OrbitControls,
  shaderMaterial,
  useGLTF,
  useTexture,
} from "@react-three/drei";
import { Color, PlaneGeometry } from "three";

type Props = {};

const day1 = (props: Props) => {
  return (
    <Canvas
      style={{
        width: "100vw",
        height: "100svh",
      }}
    >
      <Model />
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
uniform vec2 u_tex0Resolution;
#define PI 3.1415926535897932384626433832795
// Based on Morgan
// https://www.shadertoy.com/view/4dS3Wd



void main() {
    vec2 uv = vUv;
    uv -= vec2(0.5);
    uv *= 2.0;
    vec3 color = vec3(1.0);

    vec3 direction = normalize(vec3(cameraPosition) - vPosition);
    float dotProduct = dot(direction, vec3(uv, 1.0));
  
    gl_FragColor = vec4(vec3(dotProduct) , 1.0);
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

function Model(props: any) {
  const uniforms = useMemo(
    () => ({
      u_time: {
        value: 0.0,
      },
    }),
    []
  );

  useFrame(({ clock }) => {
    uniforms.u_time.value = clock.getElapsedTime();
  });

  return (
    <mesh position={[0, 0, 0]}>
      <shaderMaterial
        fragmentShader={fragmentShader}
        vertexShader={vertexShader}
        attach="material"
        uniforms={uniforms}
      />
      <planeGeometry args={[1, 1]} />
    </mesh>
  );
}

export default day1;
