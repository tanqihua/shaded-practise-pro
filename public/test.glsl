let scene,
  camera,
  controls,
  fieldOfView,
  aspectRatio,
  nearPlane,
  farPlane,
  renderer,
  container,
  hdrCubeRenderTarget,
  HEIGHT,
  WIDTH,
  hdrEquirect,
  tinky,
  particles,
  raycaster;

const params = {
  color: 0x21024f,
  transmission: 0.9,
  envMapIntensity: 10,
  lightIntensity: 1,
  exposure: 0.5
};

const spheres = [];

const meshes = {};

const generateTexture = () => {
  const canvas = document.createElement("canvas");
  canvas.width = 2;
  canvas.height = 2;

  const context = canvas.getContext("2d");
  context.fillStyle = "white";
  context.fillRect(0, 1, 2, 1);

  return canvas;
};

const createScene = () => {
  HEIGHT = window.innerHeight;
  WIDTH = window.innerWidth;

  raycaster = new THREE.Raycaster();

  scene = new THREE.Scene();

  aspectRatio = WIDTH / HEIGHT;
  fieldOfView = 60;
  nearPlane = 1;
  farPlane = 10000;
  camera = new THREE.PerspectiveCamera(
    fieldOfView,
    aspectRatio,
    nearPlane,
    farPlane
  );

  camera.position.x = 0;
  camera.position.z = 500;
  camera.position.y = -10;

  renderer = new THREE.WebGLRenderer({
    alpha: true,
    antialias: true
  });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(WIDTH, HEIGHT);

  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 2;

  container = document.getElementById("canvas");
  container.appendChild(renderer.domElement);

  window.addEventListener("resize", handleWindowResize, false);

  scene.add(tinky);

  controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.maxDistance = 1000;
  controls.maxAzimuthAngle = 1;
  controls.minAzimuthAngle = -1;
};

const positionElements = () => {
  meshes.bigStar.position.y = -1.7;
  meshes.bigStar.position.x = -2.2;
  meshes.bigStar.position.z = 0.8;
  meshes.bigStar.rotation.z = -0.5;

  meshes.littleStar.position.y = -1.75;
  meshes.littleStar.position.x = 1.75;
  meshes.littleStar.position.z = 0.6;
  meshes.littleStar.rotation.z = 0.5;

  meshes.planet.position.y = 1.3;
  meshes.planet.position.x = 2.6;
  meshes.planet.position.z = 1;

  meshes.ClosedLeftEye.visible = false;
  meshes.ClosedRightEye.visible = false;
};

const handleWindowResize = () => {
  HEIGHT = window.innerHeight;
  WIDTH = window.innerWidth;
  renderer.setSize(WIDTH, HEIGHT);
  camera.aspect = WIDTH / HEIGHT;
  camera.updateProjectionMatrix();
};

const createLights = () => {
  const ambientLight = new THREE.AmbientLight(0xaa54f0, 1);

  const directionalLight1 = new THREE.DirectionalLight(0xffffff, 1);
  directionalLight1.position.set(-2, 2, 5);

  const directionalLight2 = new THREE.DirectionalLight(0xfff000, 1);
  directionalLight2.position.set(-2, 4, 4);
  directionalLight2.castShadow = true;

  scene.add(ambientLight, directionalLight1, directionalLight2);
};

const createBubbles = () => {
  const pmremGenerator = new THREE.PMREMGenerator(renderer);
  hdrCubeRenderTarget = pmremGenerator.fromEquirectangular(hdrEquirect);
  hdrEquirect.dispose();
  pmremGenerator.dispose();

  const bubbleTexture = new THREE.CanvasTexture(generateTexture());
  bubbleTexture.repeat.set(1);

  const bubbleMaterial = new THREE.MeshPhysicalMaterial({
    color: params.color,
    metalness: 0,
    roughness: 0,
    alphaMap: bubbleTexture,
    alphaTest: 0.5,
    envMap: hdrCubeRenderTarget.texture,
    envMapIntensity: params.envMapIntensity,
    depthWrite: false,
    transmission: params.transmission,
    opacity: 1,
    transparent: true
  });

  const bubbleMaterial1b = new THREE.MeshPhysicalMaterial().copy(
    bubbleMaterial
  );
  bubbleMaterial1b.side = THREE.BackSide;

  const bubbleGeometry1 = new THREE.SphereBufferGeometry(170, 64, 32);
  const bubbleGeometry2 = new THREE.SphereBufferGeometry(55, 64, 32);
  const bubbleGeometry3 = new THREE.SphereBufferGeometry(30, 64, 32);
  const bubbleGeometry4 = new THREE.SphereBufferGeometry(70, 64, 32);

  let bubble1 = new THREE.Mesh(bubbleGeometry1, bubbleMaterial1b);
  bubble1.position.z = 15;

  let bubble2 = new THREE.Mesh(bubbleGeometry2, bubbleMaterial1b);
  bubble2.position.y = -135;
  bubble2.position.x = -175;
  bubble2.position.z = 75;

  let bubble3 = new THREE.Mesh(bubbleGeometry3, bubbleMaterial1b);
  bubble3.position.y = -136;
  bubble3.position.x = 137;
  bubble3.position.z = 50;

  let bubble4 = new THREE.Mesh(bubbleGeometry4, bubbleMaterial1b);
  bubble4.position.y = 100;
  bubble4.position.x = 210;
  bubble4.position.z = 70;

  scene.add(bubble1, bubble2, bubble3, bubble4);
};

const createParticles = () => {
  const particlesGeometry = new THREE.BufferGeometry();

  const color = new THREE.Color();
  let components = [];

  const count = 400;
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);

  for (let i = 0; i < count; i++) {
    if (i % 3 === 0) {
      color.setHSL(Math.random(), 1, 0.5);
      components = [color.r, color.g, color.b];
    }
    positions[i] = (Math.random() - 0.5) * 1000;
    colors[i] = components[i % 3];
  }

  particlesGeometry.setAttribute(
    "position",
    new THREE.BufferAttribute(positions, 3)
  );

  particlesGeometry.setAttribute(
    "color",
    new THREE.BufferAttribute(colors, 3, true)
  );

  const textureLoader = new THREE.TextureLoader();
  const particlesTexture = textureLoader.load(
    "https://mrp.vercel.app/magic_05.png"
  );
  const particlesMaterial = new THREE.PointsMaterial({
    size: 17,
    alphaMap: particlesTexture,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    vertexColors: true
  });

  particles = new THREE.Points(particlesGeometry, particlesMaterial);

  scene.add(particles);
};

window.addEventListener("click", (event) => {
  raycaster.setFromCamera(
    new THREE.Vector2(
      (event.clientX / window.innerWidth) * 2 - 1,
      -(event.clientY / window.innerHeight) * 2 + 1
    ),
    camera
  );

  const intersects = raycaster.intersectObjects(spheres);

  for (let i = 0; i < intersects.length; i++) {
    const sphere = intersects[i].object;
    scene.remove(sphere);
    spheres.splice(spheres.indexOf(sphere), 1);
  }
});

const time = new THREE.Clock();

const loop = () => {
  const elapsedTime = time.getElapsedTime();
  const elapsedTimeInMs = Math.round(elapsedTime * 1000);

  controls.update();

  particles.rotation.y = elapsedTime * 0.02;

  for (const sphere of spheres) {
    const radius = 350;
    const speed = 0.02 + 0.01 * sphere.randomness;
    const heightAngle = elapsedTime * speed + sphere.randomness;
    const thetaAngle = elapsedTime * -speed + sphere.randomness * 0.5;

    sphere.position.x = radius * Math.cos(thetaAngle) * Math.sin(heightAngle);
    sphere.position.y = radius * Math.sin(thetaAngle) * Math.sin(heightAngle);
    sphere.position.z = radius * Math.cos(heightAngle);
  }

  if (meshes.planet) {
    meshes.planet.rotation.y += 0.002;
    meshes.planet.rotation.z += 0.002;
  }

  if (elapsedTimeInMs % 3000 > 2750) {
    meshes.RightEye.visible = false;
    meshes.LeftEye.visible = false;
    meshes.ClosedLeftEye.visible = true;
    meshes.ClosedRightEye.visible = true;
  } else {
    meshes.ClosedLeftEye.visible = false;
    meshes.ClosedRightEye.visible = false;
    meshes.RightEye.visible = true;
    meshes.LeftEye.visible = true;
  }

  renderer.render(scene, camera);

  requestAnimationFrame(loop);
};

const main = async () => {
  hdrEquirect = await new THREE.RGBELoader()
    .setDataType(THREE.UnsignedByteType)
    .load("https://stivs-assets.s3.us-east-2.amazonaws.com/mrp/env.hdr");

  await new Promise((resolve) => {
    new THREE.GLTFLoader().load("https://stivs-assets.s3.us-east-2.amazonaws.com/mrp/model.gltf", (gltf) => {
      tinky = gltf.scene;
      tinky.castShadow = true;
      tinky.receiveShadow = true;
      tinky.scale.set(80, 80, 80);

      tinky.children.forEach((el) => {
        el.receiveShadow = true;
        meshes[el.name] = el;
      });

      resolve();
    });
  });

  positionElements();
  createScene();
  createLights();
  createBubbles();
  createParticles();

  const bubbleGeometry5 = new THREE.SphereBufferGeometry(10, 64, 32);
  const pmremGenerator = new THREE.PMREMGenerator(renderer);
  hdrCubeRenderTarget = pmremGenerator.fromEquirectangular(hdrEquirect);
  hdrEquirect.dispose();
  pmremGenerator.dispose();

  const bubbleTexture = new THREE.CanvasTexture(generateTexture());
  bubbleTexture.repeat.set(1);

  const bubbleMaterial = new THREE.MeshPhysicalMaterial({
    color: params.color,
    metalness: 0,
    roughness: 0,
    alphaMap: bubbleTexture,
    alphaTest: 0.5,
    envMap: hdrCubeRenderTarget.texture,
    envMapIntensity: params.envMapIntensity,
    depthWrite: false,
    transmission: params.transmission,
    opacity: 1,
    transparent: true
  });

  const bubbleMaterial1b = new THREE.MeshPhysicalMaterial().copy(
    bubbleMaterial
  );
  bubbleMaterial1b.side = THREE.BackSide;

  setInterval(() => {
    if (spheres.length > 20) return;

    const mesh = new THREE.Mesh(bubbleGeometry5, bubbleMaterial1b);

    mesh.position.x = Math.random() * 1350 - 725;
    mesh.position.y = Math.random() * 1350 - 725;
    mesh.position.z = Math.random() * 1350 - 725;

    mesh.scale.x = mesh.scale.y = mesh.scale.z = Math.random() * 3 + 1;

    mesh.randomness = Math.random() * 50;

    spheres.push(mesh);

    scene.add(mesh);
  }, 2000);

  renderer.render(scene, camera);
  loop();
};

main();
