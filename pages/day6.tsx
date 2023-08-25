import React, { useEffect, useLayoutEffect, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  Environment,
  OrbitControls,
  shaderMaterial,
  useGLTF,
  useTexture,
} from "@react-three/drei";
import THREE, { Color, PlaneGeometry } from "three";
import { Sky, PointerLockControls, KeyboardControls } from "@react-three/drei";

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
      <Environment preset={"city"} />
      <Sky />
    </Canvas>
  );
};
const params = {
  color: 0x21024f,
  transmission: 0.9,
  envMapIntensity: 10,
  lightIntensity: 1,
  exposure: 0.5,
};

const generateTexture = () => {
  const canvas = document.createElement("canvas");
  canvas.width = 2;
  canvas.height = 2;
  const context = canvas.getContext("2d") as CanvasRenderingContext2D;
  context.fillStyle = "white";
  context.fillRect(0, 1, 2, 1);

  return canvas;
};

const fragmentShader = ``;
const vertexShader = ``;

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
      <meshPhysicalMaterial
        metalness={0}
        roughness={0}
        alphaTest={0.5}
        depthWrite={false}
        transmission={0.9}
        opacity={0.8}
        transparent={true}
      ></meshPhysicalMaterial>
      <sphereGeometry args={[2, 32, 32]} />
    </mesh>
  );
}

export default day1;
