import * as THREE from 'three';
import { now } from 'three/examples/jsm/libs/tween.module.js';

// シーン
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xffffff);

// カメラ
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.z = 8;

// レンダラー
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// リサイズ対応
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

// ライト
const ambientLight = new THREE.AmbientLight(0xffffff, 2);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 2);
directionalLight.position.set(0, 3, 5);
scene.add(directionalLight);

// 蝶々全体
const butterfly = new THREE.Group();
scene.add(butterfly);

// =======================
// 色
// =======================
const wingBlue = 0x8fa8ff;
const bodyColor = 0x00001e;
const tentenColor = 0x1361f1;
const antennaColor = 0x000000;
const antennaTipColor = 0x1a8ff1;

// =======================
// 胴体
// =======================
const bodyGeometry = new THREE.SphereGeometry(0.35, 32, 32);
const bodyMaterial = new THREE.MeshPhongMaterial({
  color: bodyColor,
  shininess: 20,
});

const head = new THREE.Mesh(bodyGeometry, bodyMaterial);
head.scale.set(1, 1, 1);
head.position.set(0, 0.45, 0.08);
butterfly.add(head);

const lowerBody = new THREE.Mesh(bodyGeometry, bodyMaterial);
lowerBody.scale.set(0.75, 1.8, 0.6);
lowerBody.position.set(0, -0.45, 0.08);
// lowerBody.rotation.z = -0.25;
butterfly.add(lowerBody);

// =======================
// 羽の形
// =======================
function createUpperWingShape(side = 1) {
  const shape = new THREE.Shape();

  shape.moveTo(0, 0.3);

  shape.bezierCurveTo(
    side * 0.4, 1.2,
    side * 1.4, 1.9,
    side * 2.3, 1.55
  );

  shape.bezierCurveTo(
    side * 3.0, 1.25,
    side * 3.2, 0.2,
    side * 2.45, -0.2
  );

  shape.bezierCurveTo(
    side * 1.5, -0.7,
    side * 0.6, -0.2,
    0,
    0.3
  );

  return shape;
}

function createLowerWingShape(side = 1) {
  const shape = new THREE.Shape();

  shape.moveTo(0, -0.1);

  shape.bezierCurveTo(
    side * 0.6, -0.45,
    side * 1.75, -0.95,
    side * 1.8, -1.85
  );

  shape.bezierCurveTo(
    side * 1.95, -2.55,
    side * 1.15, -3.0,
    side * 0.35, -2.6
  );

  shape.bezierCurveTo(
    side * -0.15, -2.25,
    side * -0.1, -0.8,
    0,
    -0.1
  );

  return shape;
}

// =======================
// 羽
// =======================
const wingMaterial = new THREE.MeshPhongMaterial({
  color: wingBlue,
  side: THREE.DoubleSide,
  transparent: true,
  opacity: 0.95,
  shininess: 15,
});

const leftUpperWing = new THREE.Mesh(
  new THREE.ShapeGeometry(createUpperWingShape(-1)),
  wingMaterial
);

const rightUpperWing = new THREE.Mesh(
  new THREE.ShapeGeometry(createUpperWingShape(1)),
  wingMaterial
);

const leftLowerWing = new THREE.Mesh(
  new THREE.ShapeGeometry(createLowerWingShape(-1)),
  wingMaterial
);

const rightLowerWing = new THREE.Mesh(
  new THREE.ShapeGeometry(createLowerWingShape(1)),
  wingMaterial
);

leftUpperWing.position.set(0, -0.4, 0);
rightUpperWing.position.set(0, -0.4, 0);
leftLowerWing.position.set(0, 0, 0);
rightLowerWing.position.set(0, 0, 0);

butterfly.add(leftUpperWing);
butterfly.add(rightUpperWing);
butterfly.add(leftLowerWing);
butterfly.add(rightLowerWing);

// =======================
// 丸模様
// =======================
function createCircleSpot(x, y, radius = 0.18) {
  const spotGeometry = new THREE.CircleGeometry(radius, 32);
  const spotMaterial = new THREE.MeshBasicMaterial({
    color: tentenColor,
    side: THREE.DoubleSide,
  });

  const spot = new THREE.Mesh(spotGeometry, spotMaterial);
  spot.position.set(x, y, 0.04);
  return spot;
}

// 左上羽
leftUpperWing.add(createCircleSpot(-1.45, 1.15, 0.23));
leftUpperWing.add(createCircleSpot(-1.85, 0.45, 0.18));
leftUpperWing.add(createCircleSpot(-1.65, -0.15, 0.13));

// 右上羽
rightUpperWing.add(createCircleSpot(1.55, 1.15, 0.25));
rightUpperWing.add(createCircleSpot(1.85, 0.45, 0.18));
rightUpperWing.add(createCircleSpot(1.65, -0.15, 0.14));

// =======================
// 花っぽい模様
// =======================
function createFlowerSpot(x, y, scale = 1) {
  const flower = new THREE.Group();

  const petalGeometry = new THREE.CircleGeometry(0.16 * scale, 32);
  const petalMaterial = new THREE.MeshBasicMaterial({
    color: tentenColor,
    side: THREE.DoubleSide,
  });

  const positions = [
    [0, 0.13],
    [0.13, 0],
    [0, -0.13],
    [-0.13, 0],
  ];

  positions.forEach(([px, py]) => {
    const petal = new THREE.Mesh(petalGeometry, petalMaterial);
    petal.position.set(px, py, 0);
    flower.add(petal);
  });

  flower.position.set(x, y, 0.05);
  return flower;
}

// 左下羽と右下羽に花模様
leftLowerWing.add(createFlowerSpot(-0.95, -1.75, 0.75));
rightLowerWing.add(createFlowerSpot(0.95, -1.75, 0.75));

// =======================
// 触角
// =======================
function createAntenna(side = 1) {
  const curve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0.12 * side, 0.75, 0.08),
    new THREE.Vector3(0.37 * side, 1.2, 0.08),
    new THREE.Vector3(0.55 * side, 1.4, 0.08),
    new THREE.Vector3(0.92 * side, 1.7, 0.08),
  ]);

  const antennaGeometry = new THREE.TubeGeometry(curve, 40, 0.035, 12, false);
  const antennaMaterial = new THREE.MeshBasicMaterial({
    color: antennaColor,
  });

  const antenna = new THREE.Mesh(antennaGeometry, antennaMaterial);
  butterfly.add(antenna);

  // const tipGeometry = new THREE.SphereGeometry(0.13, 32, 32);
  // const tipMaterial = new THREE.MeshBasicMaterial({
  //   color: antennaTipColor,
  // });

  // const tip = new THREE.Mesh(tipGeometry, tipMaterial);
  // tip.position.set(0.92 * side, 1.7, 0.08);
  // butterfly.add(tip);
}

createAntenna(1);
createAntenna(-1);

// =======================
// 全体調整
// =======================
butterfly.scale.set(1.25, 1.25, 1.25);
butterfly.position.set(-0.3, -0.2, 0);

// =======================
// アニメーション
// =======================
function animate() {
  requestAnimationFrame(animate);

  const time = performance.now() * 0.004;
  const flap = Math.sin(time) * 0.18;

  leftUpperWing.rotation.y = flap;
  leftLowerWing.rotation.y = flap;

  rightUpperWing.rotation.y = -flap;
  rightLowerWing.rotation.y = -flap;

  // butterfly.rotation.y = performance.now() * 0.0008;
  // butterfly.rotation.x = 18

  // butterfly.position.y = Math.sin(time * 0.7) * 0.08;
  
  renderer.render(scene, camera);
}

animate();