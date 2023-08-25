import React, { useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  Environment,
  OrbitControls,
  shaderMaterial,
  useGLTF,
  useTexture,
} from "@react-three/drei";
import THREE, {
  Color,
  Object3D,
  PlaneGeometry,
  Quaternion,
  Raycaster,
  Vector3,
} from "three";
import { Sky, PointerLockControls, KeyboardControls } from "@react-three/drei";
import { useKeyboardControls } from "@react-three/drei";

type Props = {};

const day1 = (props: Props) => {
  let value = 0;
  const setValue = (_value: number) => {
    value = _value;
  };

  const getValue = () => {
    return value;
  };
  return (
    <KeyboardControls
      map={[
        { name: "forward", keys: ["ArrowUp", "w", "W"] },
        { name: "backward", keys: ["ArrowDown", "s", "S"] },
        { name: "left", keys: ["ArrowLeft", "a", "A"] },
        { name: "right", keys: ["ArrowRight", "d", "D"] },
        { name: "jump", keys: ["Space"] },
      ]}
    >
      <Canvas
        style={{
          width: "100vw",
          height: "100svh",
        }}
        camera={{
          position: [
            0.09253966673620662, -14.602508358990477, -5.059118186583929,
          ],
        }}
      >
        <Sky />
        <Model setValue={setValue} />
        <Ship getValue={getValue} />

        <Environment preset={"city"} />
        <OrbitControls />
      </Canvas>
    </KeyboardControls>
  );
};

const fragmentShader = `
#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;

varying vec2 vUv;
varying vec3 vPosition;
varying vec3 vNormal;
varying float vDisplacement;


uniform sampler2D u_tex0;
uniform vec2 u_tex0Resolution;
#define PI 3.1415926535897932384626433832795

void main() {
    vec2 uv = vUv;
    uv = uv * 10.0;
    vec3 color = texture2D(u_tex0, fract(uv)).rgb;


    if(color.r < 0.1 && color.g < 0.1 && color.b < 0.1){
      color = vec3(0.0039, 0.4353, 0.7451);
    }
    else{
      color = vec3(0.7843, 1.0, 1.0);
    }
    gl_FragColor = vec4(color ,1.0);
}`;

const vertexShader = `
varying vec3 vPosition;
varying vec3 vNormal;
varying vec2 vUv;
varying vec2 vmodelViewMatrix;
varying float vDisplacement;

uniform float u_time;
uniform sampler2D u_tex0;
uniform vec2 u_tex0Resolution;
#define PI 3.1415926535897932384626433832795

float calculateSurface(float x) {
  float y = (sin(x * 1.0 + u_time * 1.0)*5.0 + sin(x * 2.3 + u_time * 1.5)+ sin(x * 3.3 + u_time * 1.5) + sin(x * 3.3 + u_time * 0.4)) / 3.0;
  return y;
}

void main(){
    vPosition = position;
    vNormal = normal;
    vUv = uv;

    vec3 newPosition = position;
    newPosition.z += calculateSurface(position.x * 0.7);
    newPosition.z += calculateSurface(position.y * 0.3);
    newPosition.z -= calculateSurface(0.0);


    vec4 modelViewPosition = modelViewMatrix * vec4(newPosition, 1.0);
    vec4 projectedPosition = projectionMatrix * modelViewPosition;
   	gl_Position = projectedPosition;
}`;

function Model(props: any) {
  const texture = useTexture("/watertexture.jpg");
  const uniforms = useMemo(
    () => ({
      u_time: {
        value: 0.0,
      },
      u_tex0: {
        value: texture,
      },
    }),
    [texture]
  );

  useFrame(({ clock, camera }) => {
    uniforms.u_time.value = clock.getElapsedTime();
  });

  return (
    <mesh
      position={[0, -6, 0]}
      rotation={[-Math.PI, 0, 0]}
      onClick={(e) => {
        console.log(e.uv);
      }}
    >
      <shaderMaterial
        fragmentShader={fragmentShader}
        vertexShader={vertexShader}
        attach="material"
        uniforms={uniforms}
      />
      <planeGeometry args={[250, 250, 20, 20]} />
    </mesh>
  );
}

function calculateSurface(x: any, u_time: any) {
  const y =
    (Math.sin(x * 1.0 + u_time * 1.0) * 4 +
      Math.sin(x * 2.3 + u_time * 1.5) +
      Math.sin(x * 3.3 + u_time * 1.5) +
      Math.sin(x * 3.3 + u_time * 0.4)) /
    3.0;
  return y;
}

export const useForwardRaycast = (obj: { current: Object3D | null }) => {
  const raycaster = useMemo(() => new Raycaster(), []);
  const pos = useMemo(() => new Vector3(), []);
  const dir = useMemo(() => new Vector3(), []);
  const scene = useThree((state) => state.scene);

  return () => {
    if (!obj.current) return [];
    let _pos = obj.current.getWorldPosition(pos);
    _pos.z -= 10;
    raycaster.set(_pos, obj.current.getWorldDirection(dir));
    return raycaster.intersectObjects(scene.children);
  };
};

function Ship(props: any) {
  const ref = useRef(null) as any;
  const raycast = useForwardRaycast(ref);
  const [, get] = useKeyboardControls();

  useFrame(({ clock, camera }) => {
    const { forward, backward, left, right, jump } = get();

    if (ref.current) {
      let _y = 0;
      const intersections = raycast();
      if (intersections.length > 0) {
        intersections.forEach((intersection) => {
          if (intersection.object.uuid !== ref.current.uuid) {
            let _intersection = intersection as any;
            let _x = _intersection.uv.x;
            _y = calculateSurface(_x, clock.elapsedTime);
            ref.current.position.z = -0.5 + _y * 1.2;
          }
        });
      }

      //...do something here
    }
  });
  return (
    <>
      <mesh ref={ref}>
        <boxGeometry args={[8, 8, 4]} />
        <meshStandardMaterial color={new Color(0x00ff00)} />
      </mesh>
    </>
  );
}

export default day1;
