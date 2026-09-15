import './style.css'

import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import gsap from 'gsap'


//==================================================
// シーン
//==================================================

const canvas = document.querySelector('#c')

const scene = new THREE.Scene()


//==================================================
// カメラ
//==================================================

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
)

camera.position.set(3, 3, 6)

//==================================================
// レンダラー
//==================================================

const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true
})

renderer.setSize(window.innerWidth, window.innerHeight)

renderer.setPixelRatio(
  Math.min(window.devicePixelRatio, 2)
)

renderer.outputColorSpace = THREE.SRGBColorSpace

//==================================================
// コントロール
//==================================================

const controls = new OrbitControls(
  camera,
  renderer.domElement
)

controls.enableDamping = true

//==================================================
// ライト
//==================================================

const ambientLight =
  new THREE.AmbientLight(0xffffff, 3)

scene.add(ambientLight)

const directionalLight =
  new THREE.DirectionalLight(0xffffff, 5)

directionalLight.position.set(5, 10, 5)

scene.add(directionalLight)

//==================================================
// モデル
//==================================================

const loader = new GLTFLoader()

const modelRoot = new THREE.Group()

scene.add(modelRoot)

//==================================================
// バステト
//==================================================

loader.load(
  '/models/GodBastet_Art.glb',

  (gltf) => {
    const head = gltf.scene

    // 頭

    head.position.set(0, 1.0, 0)

    // 胴体

    const bodyGeometry =
      new THREE.SphereGeometry(0.8, 64, 64)

    const bodyMaterial =
      new THREE.MeshStandardMaterial({
        color: 0x888888,
        metalness: 0.3,
        roughness: 0.7
      })

    const body =
      new THREE.Mesh(
        bodyGeometry,
        bodyMaterial
      )

    body.position.set(0, 0, 0)

    body.scale.set(
      1,
      1.3,
      0.8
    )

    // ロボット

    const robot = new THREE.Group()

    robot.add(head)
    robot.add(body)

    robot.scale.set(
      0.01,
      0.01,
      0.01
    )

    robot.position.y = -2

    modelRoot.add(robot)

    //------------------------------------------------
    // 登場アニメーション
    //------------------------------------------------

    gsap.to(robot.scale, {
      x: 1,
      y: 1,
      z: 1,
      duration: 1.5,
      ease: 'back.out(1.7)'
    })

    gsap.to(robot.position, {
      y: 0,
      duration: 1.5,
      ease: 'power3.out'
    })

    //------------------------------------------------
    // 浮遊
    //------------------------------------------------

    // gsap.to(robot.position, {
    //   y: 0.3,
    //   duration: 2,
    //   repeat: -1,
    //   yoyo: true,
    //   ease: 'sine.inOut'
    // })

    //------------------------------------------------
    // 回転
    //------------------------------------------------

    // gsap.to(robot.rotation, {
    //   y: Math.PI * 2,
    //   duration: 15,
    //   repeat: -1,
    //   ease: 'none'
    // })

    //------------------------------------------------
    // 胴体を脈動
    //------------------------------------------------

    gsap.to(body.scale, {
      x: 1.05,
      y: 1.35,
      z: 0.85,
      duration: 1,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut'
    })
  }
)


//==================================================
// カメラ登場
//==================================================

// gsap.fromTo(
//   camera.position,
//   {
//     x: 1,
//     y: 1,
//     z: 2
//   },
//   {
//     x: 3,
//     y: 3,
//     z: 6,
//     duration: 2,
//     ease: 'power2.out',
//     onUpdate: () => {
//       controls.update()
//     }
//   }
// )

//==================================================
// リサイズ
//==================================================

window.addEventListener(
  'resize',
  () => {
    camera.aspect =
      window.innerWidth /
      window.innerHeight

    camera.updateProjectionMatrix()

    renderer.setSize(
      window.innerWidth,
      window.innerHeight
    )
  }
)

//==================================================
// 描画
//==================================================

function animate() {
  requestAnimationFrame(animate)

  controls.update()

  renderer.render(
    scene,
    camera
  )
}

animate()