import './style.css'

import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import gsap from 'gsap'

import { createStars } from './stars.js'

import earthTextureImage1 from './assets/Marble006.png'
import earthTextureImage2 from './assets/Rock035.png'
import earthTextureImage3 from './assets/Onyx013.png'
import earthTextureImage4 from './assets/NightSkyHDRI008-2.png'
import tuki from './assets/tuki.jpg'
import taiyou from './assets/taiyou.jpg'

// ==================================================
// Canvas
// ==================================================

const canvas = document.querySelector('#c')

if (!canvas) {
  throw new Error('id="c"のcanvas要素が見つかりません')
}

// ==================================================
// シーン
// ==================================================

const scene = new THREE.Scene()

// 黒に近い背景色
scene.background = new THREE.Color(0x02030a)

// 星空を作成
createStars(scene)

// ==================================================
// カメラ
// ==================================================

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
)

// GSAPで移動する前の位置
camera.position.set(0, 15, 25)

// ==================================================
// レンダラー
// ==================================================

const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  antialias: true
})

renderer.setSize(
  window.innerWidth,
  window.innerHeight
)

renderer.setPixelRatio(
  Math.min(window.devicePixelRatio, 2)
)

renderer.outputColorSpace = THREE.SRGBColorSpace

// ==================================================
// OrbitControls
// ==================================================

const controls = new OrbitControls(
  camera,
  renderer.domElement
)

controls.enableDamping = true
controls.dampingFactor = 0.05

controls.enableZoom = false
controls.enablePan = false

controls.target.set(0, 0, 0)
controls.update()

// ==================================================
// テクスチャ
// ==================================================

const textureLoader = new THREE.TextureLoader()

const textureImages = [
  earthTextureImage1,
  earthTextureImage2,
  earthTextureImage3,
  earthTextureImage4,
  tuki
]

const baseMaterials = textureImages.map((image) => {
  const texture = textureLoader.load(image)

  texture.colorSpace = THREE.SRGBColorSpace

  return new THREE.MeshStandardMaterial({
    map: texture,
    roughness: 0.7,
    metalness: 0.1,
    emissive: 0x000000,
    emissiveIntensity: 1
  })
})

// ==================================================
// ライト
// ==================================================

// 全体をうっすら照らす
const ambientLight = new THREE.AmbientLight(
  0xffffff,
  2.5
)

scene.add(ambientLight)

// 太陽から光が出ているように見せるライト
const sunLight = new THREE.PointLight(
  0xffdd99,
  // 80,
  // 100
  250,
  300
)

sunLight.position.set(0, 0, 0)
scene.add(sunLight)

// 補助ライト
const directionalLight = new THREE.DirectionalLight(
  0x7799ff,
  1
)

directionalLight.position.set(5, 8, 6)
scene.add(directionalLight)

// ==================================================
// 太陽
// ==================================================
const sunTexture = textureLoader.load(taiyou)
sunTexture.colorSpace = THREE.SRGBColorSpace
const sunGeometry = new THREE.SphereGeometry(
  2.5,
  128,
  128
)

const sunMaterial = new THREE.MeshStandardMaterial({
  map: sunTexture,
  color: 0xffaa00,
  emissive: 0xff5500,
  emissiveIntensity: 3,
  roughness: 0.6,
  metalness: 0
})

const sun = new THREE.Mesh(
  sunGeometry,
  sunMaterial
)

sun.position.set(0, 0, 0)

// 最初は小さくしておく
sun.scale.set(0, 0, 0)

scene.add(sun)

// ==================================================
// 太陽の登場アニメーション
// ==================================================

gsap.to(sun.scale, {
  x: 1,
  y: 1,
  z: 1,
  duration: 1.5,
  ease: 'back.out(1.7)'
})

// 太陽を自転
gsap.to(sun.rotation, {
  y: Math.PI * 2,
  duration: 15,
  repeat: -1,
  ease: 'none'
})

// 太陽を少し脈動させる
// gsap.to(sun.scale, {
//   x: 1.08,
//   y: 1.08,
//   z: 1.08,
//   duration: 1.5,
//   delay: 1.5,
//   repeat: -1,
//   yoyo: true,
//   ease: 'sine.inOut'
// })

// 太陽の明るさを変化させる
gsap.to(sunMaterial, {
  emissiveIntensity: 4.5,
  duration: 1.5,
  repeat: -1,
  yoyo: true,
  ease: 'sine.inOut'
})

// ライトの明るさも変化させる
gsap.to(sunLight, {
  intensity: 110,
  duration: 1.5,
  repeat: -1,
  yoyo: true,
  ease: 'sine.inOut'
})

// ==================================================
// 惑星と公転グループ
// ==================================================

const earthGeometry = new THREE.SphereGeometry(
  1,
  64,
  64
)

// クリック判定に使用する惑星
const earths = []

// 公転用グループ
const orbitGroups = []

// 惑星ごとの公転半径
const orbitRadii = [
  4,
  5.5,
  7,
  8.5,
  10,
  11.5,
  13,
  14.5
]

// 惑星ごとの大きさ
const planetSizes = [
  0.45,
  0.6,
  0.7,
  0.55,
  0.85,
  0.65,
  0.75,
  0.5
]

// 惑星ごとの公転時間
// 数字が小さいほど速く公転する
const orbitDurations = [
  10,
  14,
  18,
  22,
  27,
  32,
  38,
  44
]

// ==================================================
// 惑星の浮遊アニメーション
// ==================================================

const startFloating = (
  earth,
  index
) => {
  const floatingHeight =
    index % 2 === 0 ? 0.3 : -0.3

  earth.userData.floatTween =
    gsap.to(earth.position, {
      y: floatingHeight,
      duration: 1.5 + index * 0.1,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut'
    })
}

// ==================================================
// 惑星を作成
// ==================================================

const createEarth = (
  radius,
  materialIndex
) => {
  // 公転の中心となるグループ
  const orbitGroup = new THREE.Group()

  orbitGroup.rotation.y =
    materialIndex * (Math.PI / 4)

  // 軌道を少し傾ける
  orbitGroup.rotation.x =
    THREE.MathUtils.degToRad(
      -8 + materialIndex * 2
    )

  scene.add(orbitGroup)
  orbitGroups.push(orbitGroup)

  // マテリアルを複製
  const material =
    baseMaterials[
      materialIndex % baseMaterials.length
    ].clone()

  // 惑星を作成
  const earth = new THREE.Mesh(
    earthGeometry,
    material
  )

  const size =
    planetSizes[materialIndex]

  // 太陽からradius分だけ離す
  earth.position.set(
    radius,
    0,
    0
  )

  // 元の大きさを保存
  earth.userData.baseScale = size

  // 配列番号を保存
  earth.userData.index = materialIndex

  // 最初は小さくする
  earth.scale.set(0, 0, 0)

  // 公転グループの子にする
  orbitGroup.add(earth)

  earths.push(earth)

  // -----------------------------------------------
  // 惑星の登場アニメーション
  // -----------------------------------------------

  gsap.to(earth.scale, {
    x: size,
    y: size,
    z: size,
    delay: 0.7 + materialIndex * 0.15,
    duration: 1,
    ease: 'back.out(1.7)'
  })

  // -----------------------------------------------
  // 公転アニメーション
  // -----------------------------------------------

  gsap.to(orbitGroup.rotation, {
    y:
      orbitGroup.rotation.y +
      Math.PI * 2,

    duration:
      orbitDurations[materialIndex],

    repeat: -1,
    ease: 'none'
  })

  // -----------------------------------------------
  // 惑星の自転アニメーション
  // -----------------------------------------------

  gsap.to(earth.rotation, {
    y: Math.PI * 2,
    duration: 5 + materialIndex,
    repeat: -1,
    ease: 'none'
  })

  // -----------------------------------------------
  // 登場後に上下移動を開始
  // -----------------------------------------------

  gsap.delayedCall(
    1.7 + materialIndex * 0.15,
    () => {
      startFloating(
        earth,
        materialIndex
      )
    }
  )

  return earth
}

// ==================================================
// 公転軌道を表示
// ==================================================

const createOrbitLine = (
  radius,
  index
) => {
  const points = []

  const segments = 128
  // 軌道を構成する点を生成
  for (let i = 0; i <= segments; i++) {
    const angle =
      (i / segments) *
      Math.PI *
      2

    points.push(
      new THREE.Vector3(
        Math.cos(angle) * radius,
        0,
        Math.sin(angle) * radius
      )
    )
  }

  const orbitGeometry =
    new THREE.BufferGeometry().setFromPoints(
      points
    )

  const orbitMaterial =
    new THREE.LineBasicMaterial({
      color: 0x446688,
      transparent: true,
      opacity: 0.6
    })

  const orbitLine = new THREE.Line(
    orbitGeometry,
    orbitMaterial
  )

  // 惑星の軌道と同じ角度にする
  orbitLine.rotation.x =
    THREE.MathUtils.degToRad(
      -8 + index * 2
    )

  scene.add(orbitLine)

  // 軌道線をゆっくり表示
  orbitMaterial.opacity = 0

  gsap.to(orbitMaterial, {
    opacity: 0.6,
    delay: 1 + index * 0.1,
    duration: 1
  })
}

// ==================================================
// 惑星と軌道を8個作成
// ==================================================

for (let i = 0; i < 8; i++) {
  createOrbitLine(
    orbitRadii[i],
    i
  )

  createEarth(
    orbitRadii[i],
    i
  )
}

// ==================================================
// カメラ登場アニメーション
// ==================================================

gsap.to(camera.position, {
  x: 0,
  y: 10,
  z: 22,
  duration: 2.5,
  ease: 'power3.out',

  onUpdate: () => {
    controls.update()
  }
})

// ==================================================
// Raycaster
// ==================================================

const raycaster = new THREE.Raycaster()

const pointer = new THREE.Vector2()

let hovered = null
let selected = null

// ==================================================
// ポインター位置を取得
// ==================================================

const setPointerFromEvent = (event) => {
  const rect =
    renderer.domElement.getBoundingClientRect()

  pointer.x =
    ((event.clientX - rect.left) /
      rect.width) *
      2 -
    1

  pointer.y =
    -(
      (event.clientY - rect.top) /
      rect.height
    ) *
      2 +
    1
}

// ==================================================
// ポインター上の惑星を取得
// ==================================================

const pick = () => {
  raycaster.setFromCamera(
    pointer,
    camera
  )

  const intersects =
    raycaster.intersectObjects(
      earths,
      false
    )

  if (intersects.length > 0) {
    return intersects[0].object
  }

  return null
}

// ==================================================
// 惑星を通常状態に戻す
// ==================================================

const resetEarth = (earth) => {
  if (!earth) {
    return
  }

  const baseScale =
    earth.userData.baseScale

  gsap.killTweensOf(earth.scale)

  gsap.to(earth.scale, {
    x: baseScale,
    y: baseScale,
    z: baseScale,
    duration: 0.3,
    ease: 'power2.out',
    overwrite: true
  })

  earth.material.emissive.setHex(
    0x000000
  )

  earth.material.emissiveIntensity = 1
}

// ==================================================
// ホバー状態
// ==================================================

const applyHover = (earth) => {
  if (!earth) {
    return
  }

  const baseScale =
    earth.userData.baseScale

  const hoverScale =
    baseScale * 1.25

  gsap.killTweensOf(earth.scale)

  gsap.to(earth.scale, {
    x: hoverScale,
    y: hoverScale,
    z: hoverScale,
    duration: 0.3,
    ease: 'power2.out',
    overwrite: true
  })

  earth.material.emissive.setHex(
    0x224466
  )

  earth.material.emissiveIntensity = 1
}

// ==================================================
// 選択状態
// ==================================================

const applySelection = (earth) => {
  if (!earth) {
    return
  }

  const baseScale =
    earth.userData.baseScale

  const selectedScale =
    baseScale * 1.5

  gsap.killTweensOf(earth.scale)

  gsap.to(earth.scale, {
    x: selectedScale,
    y: selectedScale,
    z: selectedScale,
    duration: 0.5,
    ease: 'back.out(1.7)',
    overwrite: true
  })

  earth.material.emissive.setHex(
    0x22d3ee
  )

  earth.material.emissiveIntensity = 1.3

  // 選択時に縦方向へ一回転
  gsap.to(earth.rotation, {
    x: earth.rotation.x + Math.PI * 2,
    duration: 1,
    ease: 'power2.inOut'
  })
}

// ==================================================
// ポインター移動
// ==================================================

renderer.domElement.addEventListener(
  'pointermove',
  (event) => {
    setPointerFromEvent(event)

    const hit = pick()

    if (hit === hovered) {
      return
    }

    if (
      hovered &&
      hovered !== selected
    ) {
      resetEarth(hovered)
    }

    hovered = hit

    if (
      hovered &&
      hovered !== selected
    ) {
      applyHover(hovered)
    }

    renderer.domElement.style.cursor =
      hovered ? 'pointer' : 'default'
  }
)

// ==================================================
// クリック選択
// ==================================================

renderer.domElement.addEventListener(
  'pointerdown',
  (event) => {
    setPointerFromEvent(event)

    const hit = pick()

    // 惑星以外をクリックした場合
    if (!hit) {
      if (selected) {
        resetEarth(selected)
      }

      selected = null
      return
    }

    // 同じ惑星をもう一度クリック
    if (selected === hit) {
      resetEarth(selected)

      selected = null

      if (hovered === hit) {
        applyHover(hit)
      }

      return
    }

    // 前の選択を解除
    if (selected) {
      resetEarth(selected)
    }

    selected = hit

    applySelection(selected)
  }
)

// ==================================================
// ポインターがCanvasの外へ出た場合
// ==================================================

renderer.domElement.addEventListener(
  'pointerleave',
  () => {
    if (
      hovered &&
      hovered !== selected
    ) {
      resetEarth(hovered)
    }

    hovered = null

    renderer.domElement.style.cursor =
      'default'
  }
)

// ==================================================
// リサイズ
// ==================================================

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

    renderer.setPixelRatio(
      Math.min(
        window.devicePixelRatio,
        2
      )
    )
  }
)

// ==================================================
// 描画
// ==================================================

function animate() {
  requestAnimationFrame(animate)

  controls.update()

  renderer.render(
    scene,
    camera
  )
}

animate()