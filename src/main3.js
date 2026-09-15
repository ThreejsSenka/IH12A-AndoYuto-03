import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { createStars } from './stars.js'

const canvas = document.querySelector('#c')

// シーン
const scene = new THREE.Scene()

// 背景色
// scene.background = new THREE.Color(0xffffff)

// 星背景
createStars(scene)

// カメラ
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
camera.position.set(0, 2, 5)

// レンダラー
const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true
})

renderer.setSize(window.innerWidth, window.innerHeight)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.outputColorSpace = THREE.SRGBColorSpace

// コントロール
const controls = new OrbitControls(camera, renderer.domElement)
controls.enableDamping = true

// ライト
const ambientLight = new THREE.AmbientLight(0xffffff, 3)
scene.add(ambientLight)

const directionalLight = new THREE.DirectionalLight(0xffffff, 5)
directionalLight.position.set(5, 10, 5)
scene.add(directionalLight)

// GLB読み込み
const loader = new GLTFLoader()

loader.load(
  '/models/GodBastet_Art.glb',
  (gltf) => {
    const model = gltf.scene

    scene.add(model)

      // 胴体用の球
  const bodyGeometry = new THREE.SphereGeometry(0.8, 64, 64)

  const bodyMaterial = new THREE.MeshStandardMaterial({
    color: 0x888888,
    metalness: 0.3,
    roughness: 0.7
  })

  

const body = new THREE.Mesh(bodyGeometry, bodyMaterial)

// 頭の下に配置
body.position.set(0, -1.2, -0.5)
const robot = new THREE.Group()

robot.add(model)
robot.add(body)

scene.add(robot)
scene.add(body)

    const box = new THREE.Box3().setFromObject(model)
    const center = box.getCenter(new THREE.Vector3())
    const size = box.getSize(new THREE.Vector3())


    // モデルを中央へ移動
    model.position.sub(center)

    const maxDim = Math.max(size.x, size.y, size.z)

    camera.position.set(0, maxDim * 0.6, maxDim * 2)

    controls.target.set(0, 0, 0)
    controls.update()

  }
)
const earthGeometry = new THREE.SphereGeometry(1, 64, 64)
const earths = []
const createEarth = (x, z, materialIndex) => {
  const material = baseMaterials[materialIndex % baseMaterials.length].clone()
  const earth = new THREE.Mesh(earthGeometry, material)
  earth.position.set(x, 0, z)
  scene.add(earth)
  earths.push(earth)
  return earth
}

// リサイズ対応
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
})

// アニメーション
function animate() {
  requestAnimationFrame(animate)

  controls.update()

  renderer.render(scene, camera)
}

animate()