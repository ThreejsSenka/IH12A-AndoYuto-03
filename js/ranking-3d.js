/**
 * RE:CREATION 2026 - WebGL Three.js Interactive 3D Cyber Podium
 * 本格3Dメタリック表彰台 ＆ ホログラフィック・トロフィー
 */

(function () {
  if (typeof THREE === "undefined") return;

  const container = document.getElementById("ranking-3d-canvas-container");
  if (!container) return;

  // 1. Scene, Camera, Renderer
  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x0a263d, 0.035);

  const width = container.clientWidth || window.innerWidth;
  const height = container.clientHeight || 480;

  const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
  camera.position.set(0, 4.2, 13.5);

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.25;
  container.appendChild(renderer.domElement);

  // 2. Lighting System
  const ambientLight = new THREE.AmbientLight(0x0f3456, 2.2);
  scene.add(ambientLight);

  // Key Spotlight (Gold & White)
  const keyLight = new THREE.DirectionalLight(0xfff7e6, 2.8);
  keyLight.position.set(6, 12, 8);
  keyLight.castShadow = true;
  keyLight.shadow.mapSize.width = 1024;
  keyLight.shadow.mapSize.height = 1024;
  scene.add(keyLight);

  // Cyan Rim Light (from behind left)
  const rimLight = new THREE.DirectionalLight(0x2cd8ff, 3.5);
  rimLight.position.set(-8, 7, -6);
  scene.add(rimLight);

  // Point Lights directly illuminating each podium
  const goldLight = new THREE.PointLight(0xffd043, 3.5, 9, 2);
  goldLight.position.set(0, 4.8, 0);
  scene.add(goldLight);

  const silverLight = new THREE.PointLight(0xa5d8ff, 2.2, 7, 2);
  silverLight.position.set(-3.5, 3.5, 0);
  scene.add(silverLight);

  const bronzeLight = new THREE.PointLight(0xff9e79, 2.2, 7, 2);
  bronzeLight.position.set(3.5, 3.0, 0);
  scene.add(bronzeLight);

  // 3. Ground / Reflective Hex Arena Floor
  const floorGeo = new THREE.CylinderGeometry(11, 11, 0.2, 32);
  const floorMat = new THREE.MeshStandardMaterial({
    color: 0x071e33,
    roughness: 0.18,
    metalness: 0.85,
    wireframe: false
  });
  const floor = new THREE.Mesh(floorGeo, floorMat);
  floor.position.y = -0.1;
  floor.receiveShadow = true;
  scene.add(floor);

  // Concentric Neon Floor Rings
  const ringGeo = new THREE.RingGeometry(8.5, 8.7, 64);
  const ringMat = new THREE.MeshBasicMaterial({ color: 0x2cd8ff, side: THREE.DoubleSide });
  const floorRing = new THREE.Mesh(ringGeo, ringMat);
  floorRing.rotation.x = -Math.PI / 2;
  floorRing.position.y = 0.01;
  scene.add(floorRing);

  // 4. Podiums Group
  const podiumGroup = new THREE.Group();
  scene.add(podiumGroup);

  // Podium Base Materials
  const baseMat = new THREE.MeshStandardMaterial({
    color: 0x092d47,
    roughness: 0.2,
    metalness: 0.9
  });

  const goldTrimMat = new THREE.MeshStandardMaterial({
    color: 0xfec838,
    roughness: 0.15,
    metalness: 0.95,
    emissive: 0x4a3200
  });

  const silverTrimMat = new THREE.MeshStandardMaterial({
    color: 0xdcebfc,
    roughness: 0.12,
    metalness: 0.95,
    emissive: 0x122438
  });

  const bronzeTrimMat = new THREE.MeshStandardMaterial({
    color: 0xff8c42,
    roughness: 0.2,
    metalness: 0.9,
    emissive: 0x3d1500
  });

  // --- 1st Place Podium (Center: Tall) ---
  const p1Height = 3.2;
  const p1Radius = 1.45;
  const p1Geo = new THREE.CylinderGeometry(p1Radius, p1Radius * 1.08, p1Height, 8);
  const p1Mesh = new THREE.Mesh(p1Geo, baseMat);
  p1Mesh.position.set(0, p1Height / 2, 0);
  p1Mesh.castShadow = true;
  p1Mesh.receiveShadow = true;
  podiumGroup.add(p1Mesh);

  // Top Gold Ring
  const p1RingGeo = new THREE.TorusGeometry(p1Radius * 0.95, 0.08, 16, 8);
  const p1Ring = new THREE.Mesh(p1RingGeo, goldTrimMat);
  p1Ring.rotation.x = Math.PI / 2;
  p1Ring.position.set(0, p1Height, 0);
  podiumGroup.add(p1Ring);

  // --- 2nd Place Podium (Left: Medium) ---
  const p2Height = 2.3;
  const p2Radius = 1.25;
  const p2X = -3.5;
  const p2Geo = new THREE.CylinderGeometry(p2Radius, p2Radius * 1.08, p2Height, 8);
  const p2Mesh = new THREE.Mesh(p2Geo, baseMat);
  p2Mesh.position.set(p2X, p2Height / 2, 0);
  p2Mesh.castShadow = true;
  p2Mesh.receiveShadow = true;
  podiumGroup.add(p2Mesh);

  const p2RingGeo = new THREE.TorusGeometry(p2Radius * 0.95, 0.07, 16, 8);
  const p2Ring = new THREE.Mesh(p2RingGeo, silverTrimMat);
  p2Ring.rotation.x = Math.PI / 2;
  p2Ring.position.set(p2X, p2Height, 0);
  podiumGroup.add(p2Ring);

  // --- 3rd Place Podium (Right: Shorter) ---
  const p3Height = 1.6;
  const p3Radius = 1.25;
  const p3X = 3.5;
  const p3Geo = new THREE.CylinderGeometry(p3Radius, p3Radius * 1.08, p3Height, 8);
  const p3Mesh = new THREE.Mesh(p3Geo, baseMat);
  p3Mesh.position.set(p3X, p3Height / 2, 0);
  p3Mesh.castShadow = true;
  p3Mesh.receiveShadow = true;
  podiumGroup.add(p3Mesh);

  const p3RingGeo = new THREE.TorusGeometry(p3Radius * 0.95, 0.07, 16, 8);
  const p3Ring = new THREE.Mesh(p3RingGeo, bronzeTrimMat);
  p3Ring.rotation.x = Math.PI / 2;
  p3Ring.position.set(p3X, p3Height, 0);
  podiumGroup.add(p3Ring);

  // 5. Holographic 3D Floating Trophy above 1st Place
  const trophyGroup = new THREE.Group();
  trophyGroup.position.set(0, p1Height + 0.9, 0);
  scene.add(trophyGroup);

  // Inner Shimmering Gem
  const gemGeo = new THREE.OctahedronGeometry(0.55, 0);
  const gemMat = new THREE.MeshStandardMaterial({
    color: 0xffd54f,
    emissive: 0xff9800,
    emissiveIntensity: 0.6,
    roughness: 0.1,
    metalness: 0.95
  });
  const gemMesh = new THREE.Mesh(gemGeo, gemMat);
  trophyGroup.add(gemMesh);

  // Outer Holographic Wireframe Cage
  const cageGeo = new THREE.IcosahedronGeometry(0.85, 0);
  const cageMat = new THREE.MeshBasicMaterial({
    color: 0x38b6f0,
    wireframe: true,
    transparent: true,
    opacity: 0.85
  });
  const cageMesh = new THREE.Mesh(cageGeo, cageMat);
  trophyGroup.add(cageMesh);

  // Floating Halo Ring around Trophy
  const haloGeo = new THREE.TorusGeometry(1.05, 0.03, 16, 48);
  const haloMat = new THREE.MeshBasicMaterial({
    color: 0xfec838,
    transparent: true,
    opacity: 0.9
  });
  const haloMesh = new THREE.Mesh(haloGeo, haloMat);
  haloMesh.rotation.x = Math.PI / 3;
  trophyGroup.add(haloMesh);

  // 2nd Place Floating Silver Star
  const star2Geo = new THREE.OctahedronGeometry(0.38, 0);
  const star2Mat = new THREE.MeshStandardMaterial({
    color: 0xe2eefb,
    emissive: 0x38b6f0,
    emissiveIntensity: 0.4,
    roughness: 0.15,
    metalness: 0.95
  });
  const star2 = new THREE.Mesh(star2Geo, star2Mat);
  star2.position.set(p2X, p2Height + 0.6, 0);
  scene.add(star2);

  // 3rd Place Floating Bronze Star
  const star3Geo = new THREE.OctahedronGeometry(0.34, 0);
  const star3Mat = new THREE.MeshStandardMaterial({
    color: 0xff9e79,
    emissive: 0xff5722,
    emissiveIntensity: 0.4,
    roughness: 0.2,
    metalness: 0.9
  });
  const star3 = new THREE.Mesh(star3Geo, star3Mat);
  star3.position.set(p3X, p3Height + 0.55, 0);
  scene.add(star3);

  // 6. Upward Drifting Sparkle Particles
  const particleCount = 140;
  const particleGeo = new THREE.BufferGeometry();
  const particlePositions = new Float32Array(particleCount * 3);
  const particleVelocities = [];

  for (let i = 0; i < particleCount; i++) {
    particlePositions[i * 3 + 0] = (Math.random() - 0.5) * 14;
    particlePositions[i * 3 + 1] = Math.random() * 8;
    particlePositions[i * 3 + 2] = (Math.random() - 0.5) * 8;

    particleVelocities.push({
      y: Math.random() * 0.015 + 0.008,
      wobble: Math.random() * Math.PI * 2,
      wobbleSpeed: Math.random() * 0.03 + 0.01
    });
  }

  particleGeo.setAttribute("position", new THREE.BufferAttribute(particlePositions, 3));

  const particleMat = new THREE.PointsMaterial({
    size: 0.12,
    color: 0x38b6f0,
    transparent: true,
    opacity: 0.8,
    blending: THREE.AdditiveBlending
  });

  const particleSystem = new THREE.Points(particleGeo, particleMat);
  scene.add(particleSystem);

  // 7. Interactive Mouse Camera Controls
  let mouseNormX = 0;
  let mouseNormY = 0;
  let targetCamX = 0;
  let targetCamY = 4.2;

  function onMouseMove(e) {
    const rect = container.getBoundingClientRect();
    if (e.clientY < rect.top - 200 || e.clientY > rect.bottom + 200) return;

    mouseNormX = (e.clientX / window.innerWidth) * 2 - 1;
    mouseNormY = -(e.clientY / window.innerHeight) * 2 + 1;

    targetCamX = mouseNormX * 3.8;
    targetCamY = 4.2 + mouseNormY * 1.5;
  }
  window.addEventListener("mousemove", onMouseMove, { passive: true });

  // Touch support for mobile
  window.addEventListener("touchmove", (e) => {
    if (e.touches && e.touches[0]) {
      const touch = e.touches[0];
      mouseNormX = (touch.clientX / window.innerWidth) * 2 - 1;
      targetCamX = mouseNormX * 3.0;
    }
  }, { passive: true });

  // Window Resize
  function onWindowResize() {
    const w = container.clientWidth || window.innerWidth;
    const h = container.clientHeight || 480;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  }
  window.addEventListener("resize", onWindowResize);

  // 8. 3D Coordinates to 2D Screen Overlay Sync
  function toScreenPosition(objPosition, cam) {
    const vector = new THREE.Vector3().copy(objPosition);
    vector.project(cam);
    const w = container.clientWidth || window.innerWidth;
    const h = container.clientHeight || 480;
    return {
      x: (vector.x * 0.5 + 0.5) * w,
      y: -(vector.y * 0.5 - 0.5) * h
    };
  }

  const p1Badge = document.getElementById("podium-badge-1");
  const p2Badge = document.getElementById("podium-badge-2");
  const p3Badge = document.getElementById("podium-badge-3");

  // 9. Animation Loop
  let time = 0;
  function animate() {
    requestAnimationFrame(animate);
    time += 0.016;

    // Smooth Camera Lerp
    camera.position.x += (targetCamX - camera.position.x) * 0.05;
    camera.position.y += (targetCamY - camera.position.y) * 0.05;
    camera.lookAt(0, 1.4, 0);

    // Trophy Rotation & Float
    trophyGroup.rotation.y += 0.018;
    trophyGroup.position.y = p1Height + 0.9 + Math.sin(time * 2.2) * 0.14;
    cageMesh.rotation.x += 0.012;
    haloMesh.rotation.z += 0.02;

    // Stars Float
    star2.rotation.y -= 0.02;
    star2.position.y = p2Height + 0.6 + Math.sin(time * 2.5 + 1) * 0.1;

    star3.rotation.y += 0.022;
    star3.position.y = p3Height + 0.55 + Math.sin(time * 2.0 + 2) * 0.08;

    // Subtle Base Floor Ring Rotation
    floorRing.rotation.z += 0.003;

    // Animate Particles
    const pos = particleGeo.attributes.position.array;
    for (let i = 0; i < particleCount; i++) {
      const idx = i * 3;
      pos[idx + 1] += particleVelocities[i].y;
      pos[idx + 0] += Math.sin(time + particleVelocities[i].wobble) * 0.005;

      if (pos[idx + 1] > 8.5) {
        pos[idx + 1] = 0.1;
        pos[idx + 0] = (Math.random() - 0.5) * 14;
        pos[idx + 2] = (Math.random() - 0.5) * 8;
      }
    }
    particleGeo.attributes.position.needsUpdate = true;

    // Sync HTML Badge Overlays to 3D Coordinates
    if (p1Badge) {
      const pos1 = toScreenPosition(new THREE.Vector3(0, p1Height + 1.85, 0), camera);
      p1Badge.style.transform = `translate(-50%, -50%) translate(${pos1.x}px, ${pos1.y}px)`;
    }
    if (p2Badge) {
      const pos2 = toScreenPosition(new THREE.Vector3(p2X, p2Height + 1.45, 0), camera);
      p2Badge.style.transform = `translate(-50%, -50%) translate(${pos2.x}px, ${pos2.y}px)`;
    }
    if (p3Badge) {
      const pos3 = toScreenPosition(new THREE.Vector3(p3X, p3Height + 1.35, 0), camera);
      p3Badge.style.transform = `translate(-50%, -50%) translate(${pos3.x}px, ${pos3.y}px)`;
    }

    renderer.render(scene, camera);
  }

  animate();
})();
