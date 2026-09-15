import * as THREE from 'three';

export function createStars(scene) {
  const starGeometry = new THREE.BufferGeometry();
  const starCount = 1000;

  const positions = [];

  for (let i = 0; i < starCount; i++) {
    const x = (Math.random() - 0.5) * 200;
    const y = (Math.random() - 0.5) * 200;
    const z = (Math.random() - 0.5) * 200;

    positions.push(x, y, z);
  }

  starGeometry.setAttribute(
    'position',
    new THREE.Float32BufferAttribute(positions, 3)
  );

  const starMaterial = new THREE.PointsMaterial({
    color: 0xffffff,
    size: 0.5
  });

  const stars = new THREE.Points(starGeometry, starMaterial);
  scene.add(stars);

  return stars;
}