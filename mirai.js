import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x090018);
scene.fog = new THREE.FogExp2(0x090018, 0.004);

const camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);
camera.position.set(0, 28, 48);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.4;
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;

const ambientLight = new THREE.AmbientLight(0x7744aa, 2.2);
scene.add(ambientLight);

const futureCore = new THREE.Mesh(
    new THREE.SphereGeometry(3.2, 48, 48),
    new THREE.MeshBasicMaterial({ color: 0x020006 })
);

const futureGate = new THREE.Group();
futureGate.userData = { name: "帰還ワームホール", isReturnGate: true };
futureGate.add(futureCore);

const gateRings = [];
const createGateRing = (radius, color, tube) => {
    const ring = new THREE.Mesh(
        new THREE.TorusGeometry(radius, tube, 20, 128),
        new THREE.MeshBasicMaterial({
            color,
            transparent: true,
            opacity: 0.85,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        })
    );
    ring.rotation.x = Math.PI / 2;
    gateRings.push(ring);
    futureGate.add(ring);
};

createGateRing(4.2, 0xff2bd6, 0.2);
createGateRing(5.3, 0x7d5cff, 0.12);
createGateRing(6.3, 0x19f9ff, 0.06);
futureGate.position.set(0, 5, -10);
scene.add(futureGate);

const gateLight = new THREE.PointLight(0xff29d9, 120, 45);
gateLight.position.copy(futureGate.position);
scene.add(gateLight);

const city = new THREE.Group();
const cityMaterials = [
    new THREE.MeshBasicMaterial({ color: 0x00eaff, wireframe: true }),
    new THREE.MeshBasicMaterial({ color: 0xff2bd6, wireframe: true }),
    new THREE.MeshBasicMaterial({ color: 0x9d5cff, wireframe: true })
];

for (let i = 0; i < 26; i++) {
    const width = 0.8 + Math.random() * 2.4;
    const height = 2 + Math.random() * 12;
    const building = new THREE.Mesh(
        new THREE.BoxGeometry(width, height, width),
        cityMaterials[i % cityMaterials.length]
    );
    const angle = (i / 26) * Math.PI * 2;
    const distance = 12 + Math.random() * 13;
    building.position.set(
        Math.cos(angle) * distance,
        height / 2 - 6,
        Math.sin(angle) * distance - 5
    );
    city.add(building);
}
scene.add(city);

const grid = new THREE.GridHelper(80, 40, 0x00eaff, 0x4d1d80);
grid.position.y = -6;
grid.material.transparent = true;
grid.material.opacity = 0.45;
scene.add(grid);

const neonStars = new THREE.Points(
    new THREE.BufferGeometry(),
    new THREE.PointsMaterial({
        color: 0xff65ea,
        size: 0.5,
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending,
        depthWrite: false
    })
);
const starPositions = new Float32Array(900);
const starVelocities = new Float32Array(900);
for (let i = 0; i < starPositions.length; i += 3) {
    starPositions[i] = (Math.random() - 0.5) * 180;
    starPositions[i + 1] = Math.random() * 100 - 10;
    starPositions[i + 2] = (Math.random() - 0.5) * 180;
    starVelocities[i] = (Math.random() - 0.5) * 2.4;
    starVelocities[i + 1] = (Math.random() - 0.5) * 0.8;
    starVelocities[i + 2] = (Math.random() - 0.5) * 2.4;
}
neonStars.geometry.setAttribute(
    "position",
    new THREE.BufferAttribute(starPositions, 3)
);
scene.add(neonStars);

const infoText = document.getElementById("planetInfo");
const navigation = document.getElementById("planet-navigation");
if (infoText) {
    infoText.innerHTML = `
        <h3>未来都市</h3>
        <p>ワームホールの先にある、ネオンに包まれた異世界です。</p>
        <hr>
        <p>帰還ゲートをクリックすると異星系へ戻ります。</p>
    `;
}
if (navigation) {
    navigation.hidden = true;
}

const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();

renderer.domElement.addEventListener("click", (event) => {
    const rect = renderer.domElement.getBoundingClientRect();
    pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    raycaster.setFromCamera(pointer, camera);

    if (raycaster.intersectObject(futureGate, true).length > 0) {
        window.location.search = "?scene=siranai";
    }
});

const clock = new THREE.Clock();
function animate() {
    requestAnimationFrame(animate);
    const deltaSeconds = clock.getDelta();
    const elapsedSeconds = clock.elapsedTime;

    const positions = neonStars.geometry.attributes.position.array;
    for (let i = 0; i < positions.length; i += 3) {
        positions[i] += starVelocities[i] * deltaSeconds;
        positions[i + 1] += starVelocities[i + 1] * deltaSeconds;
        positions[i + 2] += starVelocities[i + 2] * deltaSeconds;

        if (positions[i] > 90) positions[i] = -90;
        if (positions[i] < -90) positions[i] = 90;
        if (positions[i + 1] > 90) positions[i + 1] = -10;
        if (positions[i + 1] < -10) positions[i + 1] = 90;
        if (positions[i + 2] > 90) positions[i + 2] = -90;
        if (positions[i + 2] < -90) positions[i + 2] = 90;
    }
    neonStars.geometry.attributes.position.needsUpdate = true;

    futureGate.rotation.y += deltaSeconds * 0.2;
    futureGate.rotation.z -= deltaSeconds * 0.08;
    gateRings.forEach((ring, index) => {
        ring.rotation.z += deltaSeconds * (0.35 + index * 0.12);
        ring.material.opacity =
            0.6 + Math.sin(elapsedSeconds * 2 + index) * 0.2;
    });
    city.rotation.y += deltaSeconds * 0.025;
    neonStars.rotation.y += deltaSeconds * 0.003;
    controls.update();
    renderer.render(scene, camera);
}

window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

animate();
