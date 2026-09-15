import * as THREE from 'three';
import { createStars } from './stars.js';

// シーンを作成
const scene = new THREE.Scene();

// カメラを作成
const camera = new THREE.PerspectiveCamera(
  75,
  innerWidth / innerHeight,
  0.1,
  1000
);
camera.position.z = 10;

// レンダラーを作成
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(innerWidth, innerHeight);
renderer.setClearColor(0x000000);
document.body.appendChild(renderer.domElement);

// --------------------
// ライト
// --------------------
const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1.5);
directionalLight.position.set(5, 3, 5);
scene.add(directionalLight);

// --------------------
// 星を追加
// --------------------
createStars(scene);

// --------------------
// 地球の模様をCanvasで作る
// --------------------
const earthCanvas = document.createElement('canvas');
earthCanvas.width = 1024;
earthCanvas.height = 512;

const ctx = earthCanvas.getContext('2d');

// 海
ctx.fillStyle = '#1e5eff';
ctx.fillRect(0, 0, earthCanvas.width, earthCanvas.height);

// // 大陸っぽい模様
// ctx.fillStyle = '#2fa84f';
// ctx.beginPath();
// ctx.ellipse(250, 220, 120, 80, 0.3, 0, Math.PI * 2);
// ctx.fill();

// ctx.beginPath();
// ctx.ellipse(330, 300, 70, 50, -0.5, 0, Math.PI * 2);
// ctx.fill();

// ctx.beginPath();
// ctx.ellipse(700, 180, 140, 90, -0.2, 0, Math.PI * 2);
// ctx.fill();

// ctx.beginPath();
// ctx.ellipse(780, 280, 60, 100, 0.4, 0, Math.PI * 2);
// ctx.fill();

// // 雲っぽい線
// ctx.strokeStyle = 'rgba(255,255,255,0.35)';
// ctx.lineWidth = 8;
// ctx.beginPath();
// ctx.moveTo(100, 120);
// ctx.bezierCurveTo(220, 80, 280, 140, 420, 110);
// ctx.stroke();

// ctx.beginPath();
// ctx.moveTo(600, 350);
// ctx.bezierCurveTo(720, 300, 820, 390, 930, 330);
// ctx.stroke();

// // 回転が分かりやすい赤い印
// ctx.fillStyle = 'red';
// ctx.beginPath();
// ctx.arc(850, 140, 25, 0, Math.PI * 2);
// ctx.fill();

const earthTexture = new THREE.CanvasTexture(earthCanvas);

// --------------------
// 地球
// --------------------
const earthGeometry = new THREE.SphereGeometry(1, 64, 64);
const earthMaterial = new THREE.MeshPhongMaterial({
  map: earthTexture
});
const earth = new THREE.Mesh(earthGeometry, earthMaterial);
earth.rotation.z = 0.4;
scene.add(earth);

// --------------------
// 月
// --------------------
const moonGeometry = new THREE.SphereGeometry(0.3, 32, 32);
const moonMaterial = new THREE.MeshPhongMaterial({
  color: 0xcccccc
});
const moon = new THREE.Mesh(moonGeometry, moonMaterial);
moon.position.x = 3;

const moonGroup = new THREE.Group();
moonGroup.add(moon);
scene.add(moonGroup);

// --------------------
// アニメーション
// --------------------
function animate() {
  requestAnimationFrame(animate);

  earth.rotation.y += 0.01;
  // moonGroup.rotation.y += 0.02;
  // moon.rotation.y += 0.01;

  renderer.render(scene, camera);
}

animate();

// --------------------
// リサイズ対応
// --------------------
// window.addEventListener('resize', () => {
//   camera.aspect = innerWidth / innerHeight;
//   camera.updateProjectionMatrix();
//   renderer.setSize(innerWidth, innerHeight);
// });