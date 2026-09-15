import * as THREE from "three";

import {
  OrbitControls
} from "three/addons/controls/OrbitControls.js";

/* ==================================================
   シーン
================================================== */

const scene = new THREE.Scene();

scene.background = new THREE.Color(0x87ceeb);


/* ==================================================
   カメラ
================================================== */

const camera = new THREE.PerspectiveCamera(
  55,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

camera.position.set(4, 3, 7);


/* ==================================================
   レンダラー
================================================== */

const renderer = new THREE.WebGLRenderer({
  antialias: true,
  alpha: false
});

renderer.setSize(
  window.innerWidth,
  window.innerHeight
);

renderer.setPixelRatio(
  Math.min(window.devicePixelRatio, 2)
);

renderer.shadowMap.enabled = true;

renderer.shadowMap.type =
  THREE.PCFSoftShadowMap;

document.body.appendChild(
  renderer.domElement
);


/* ==================================================
   OrbitControls
================================================== */

const controls = new OrbitControls(
  camera,
  renderer.domElement
);

controls.enableDamping = true;
controls.enableZoom = true;
controls.enablePan = true;
controls.enableRotate = true;

controls.dampingFactor = 0.05;
controls.zoomSpeed = 1;
controls.rotateSpeed = 1;
controls.panSpeed = 1;

controls.minDistance = 3;
controls.maxDistance = 20;

controls.target.set(0, 0.7, 0);

controls.update();


/* ==================================================
   ライト
================================================== */

const ambientLight =
  new THREE.AmbientLight(
    0xffffff,
    1.3
  );

scene.add(ambientLight);


const directionalLight =
  new THREE.DirectionalLight(
    0xffffff,
    2.5
  );

directionalLight.position.set(
  5,
  10,
  8
);

directionalLight.castShadow = true;

directionalLight.shadow.mapSize.set(
  2048,
  2048
);

scene.add(directionalLight);


/* 後ろ側から当てる青いライト */

const backLight =
  new THREE.DirectionalLight(
    0xaacfff,
    1
  );

backLight.position.set(
  -5,
  3,
  -5
);

scene.add(backLight);


/* ==================================================
   3Dマップピン
================================================== */

const pinGroup = new THREE.Group();

scene.add(pinGroup);


/* --------------------------------------------------
   ピンの輪郭を作成

   Shapeの正面はXY平面
   ExtrudeGeometryでZ方向に厚さを付ける
-------------------------------------------------- */

const pinShape = new THREE.Shape();


/*
   ピン先端から輪郭を作る
*/

pinShape.moveTo(
  0,
  -2.3
);


/*
   左下から左上へ
*/

pinShape.bezierCurveTo(
  -0.25,
  -1.65,
  -1.35,
  -0.65,
  -1.35,
  0.55
);


/*
   左上から上中央へ
*/

pinShape.bezierCurveTo(
  -1.35,
  1.55,
  -0.75,
  2.2,
  0,
  2.2
);


/*
   上中央から右上へ
*/

pinShape.bezierCurveTo(
  0.75,
  2.2,
  1.35,
  1.55,
  1.35,
  0.55
);


/*
   右上からピン先端へ
*/

pinShape.bezierCurveTo(
  1.35,
  -0.65,
  0.25,
  -1.65,
  0,
  -2.3
);


/* --------------------------------------------------
   中央の丸い穴
-------------------------------------------------- */

const centerHole = new THREE.Path();

centerHole.absarc(
  0,
  0.62,
  0.52,
  0,
  Math.PI * 2,
  true
);

pinShape.holes.push(
  centerHole
);


/* --------------------------------------------------
   押し出して3D化
-------------------------------------------------- */

const pinGeometry =
  new THREE.ExtrudeGeometry(
    pinShape,
    {
      depth: 0.55,

      bevelEnabled: true,
      bevelThickness: 0.12,
      bevelSize: 0.1,
      bevelOffset: 0,
      bevelSegments: 5,

      curveSegments: 48,
      steps: 1
    }
  );


/*
   形状の中心を揃える
*/

pinGeometry.center();


/* --------------------------------------------------
   ピンの材質
-------------------------------------------------- */

const pinMaterial =
  new THREE.MeshStandardMaterial({
    color: 0xe63946,
    metalness: 0.22,
    roughness: 0.3
  });


const pin = new THREE.Mesh(
  pinGeometry,
  pinMaterial
);

pin.castShadow = true;
pin.receiveShadow = true;


/*
   ピンを少し上に置く
*/

pin.position.y = 1.45;


/*
   正面を少し斜めに向ける
*/

pin.rotation.x = -0.08;
pin.rotation.y = 0;


/*
   ピンの大きさ
*/

pin.scale.set(
  0.9,
  0.9,
  0.9
);

pinGroup.add(pin);


/* ==================================================
   中央穴の内側リング
================================================== */

const ringGeometry =
  new THREE.TorusGeometry(
    0.52,
    0.07,
    20,
    64
  );

const ringMaterial =
  new THREE.MeshStandardMaterial({
    color: 0xffffff,
    metalness: 0.1,
    roughness: 0.2
  });

const centerRing =
  new THREE.Mesh(
    ringGeometry,
    ringMaterial
  );


/*
   ExtrudeGeometryの正面より少し手前に出す
*/

centerRing.position.set(
  0,
  2.02,
  0.36
);

centerRing.castShadow = true;

pinGroup.add(centerRing);


/* ==================================================
   地面の影
================================================== */

const shadowGeometry =
  new THREE.CircleGeometry(
    0.85,
    64
  );

const shadowMaterial =
  new THREE.MeshBasicMaterial({
    color: 0x000000,
    transparent: true,
    opacity: 0.22,
    depthWrite: false
  });

const pinShadow =
  new THREE.Mesh(
    shadowGeometry,
    shadowMaterial
  );

pinShadow.rotation.x =
  -Math.PI / 2;

pinShadow.position.set(
  0,
  -0.96,
  0
);

pinShadow.scale.set(
  1,
  0.42,
  1
);

scene.add(pinShadow);


/* ==================================================
   ピンを照らす発光ライト
================================================== */

const glow =
  new THREE.PointLight(
    0xff3344,
    0,
    8
  );

glow.position.set(
  0,
  1.5,
  1
);

scene.add(glow);


/* ==================================================
   床
================================================== */

const floor =
  new THREE.Mesh(
    new THREE.PlaneGeometry(
      30,
      30
    ),

    new THREE.MeshPhongMaterial({
      color: 0x77b95b,
      shininess: 10
    })
  );

floor.rotation.x =
  -Math.PI / 2;

floor.position.y = -1;

floor.receiveShadow = true;

scene.add(floor);


/* ==================================================
   床の円形スポット
================================================== */

const spotGeometry =
  new THREE.CircleGeometry(
    1.45,
    64
  );

const spotMaterial =
  new THREE.MeshBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.18
  });

const groundSpot =
  new THREE.Mesh(
    spotGeometry,
    spotMaterial
  );

groundSpot.rotation.x =
  -Math.PI / 2;

groundSpot.position.set(
  0,
  -0.99,
  0
);

scene.add(groundSpot);


/* ==================================================
   Raycaster
================================================== */

const raycaster =
  new THREE.Raycaster();

const mouse =
  new THREE.Vector2();

let isSelected = false;


/* ==================================================
   ピンクリック
================================================== */

renderer.domElement.addEventListener(
  "click",
  function (event) {
    const rect =
      renderer.domElement.getBoundingClientRect();

    mouse.x =
      (
        (event.clientX - rect.left) /
        rect.width
      ) * 2 - 1;

    mouse.y =
      -(
        (event.clientY - rect.top) /
        rect.height
      ) * 2 + 1;

    raycaster.setFromCamera(
      mouse,
      camera
    );

    const intersects =
      raycaster.intersectObjects(
        [
          pin,
          centerRing
        ],
        true
      );

    if (intersects.length > 0) {
      isSelected = !isSelected;
    }
  }
);


/* ==================================================
   マウスカーソル変更
================================================== */

renderer.domElement.addEventListener(
  "pointermove",
  function (event) {
    const rect =
      renderer.domElement.getBoundingClientRect();

    mouse.x =
      (
        (event.clientX - rect.left) /
        rect.width
      ) * 2 - 1;

    mouse.y =
      -(
        (event.clientY - rect.top) /
        rect.height
      ) * 2 + 1;

    raycaster.setFromCamera(
      mouse,
      camera
    );

    const intersects =
      raycaster.intersectObjects(
        [
          pin,
          centerRing
        ],
        true
      );

    if (intersects.length > 0) {
      renderer.domElement.style.cursor =
        "pointer";
    } else {
      renderer.domElement.style.cursor =
        "grab";
    }
  }
);


/* ==================================================
   リサイズ対応
================================================== */

window.addEventListener(
  "resize",
  function () {
    camera.aspect =
      window.innerWidth /
      window.innerHeight;

    camera.updateProjectionMatrix();

    renderer.setSize(
      window.innerWidth,
      window.innerHeight
    );

    renderer.setPixelRatio(
      Math.min(
        window.devicePixelRatio,
        2
      )
    );
  }
);


/* ==================================================
   アニメーション用変数
================================================== */

const clock = new THREE.Clock();

let targetScale = 0.9;
let currentScale = 0.9;

let targetGlow = 0;


/* ==================================================
   アニメーション
================================================== */

function animate() {
  requestAnimationFrame(animate);

  const time =
    clock.getElapsedTime();


  /* ピンをゆっくり左右に回転 */

  pinGroup.rotation.y =
    Math.sin(time * 0.7) * 0.32;


  /*
     選択中は跳ねる
  */

  if (isSelected) {
    targetScale = 1.05;
    targetGlow = 4;

    pinGroup.position.y =
      Math.abs(
        Math.sin(time * 2.8)
      ) * 0.25;
  } else {
    targetScale = 0.9;
    targetGlow = 0;

    pinGroup.position.y +=
      (
        0 -
        pinGroup.position.y
      ) * 0.1;
  }


  /* 大きさを滑らかに変える */

  currentScale +=
    (
      targetScale -
      currentScale
    ) * 0.08;

  pinGroup.scale.set(
    currentScale,
    currentScale,
    currentScale
  );


  /* 発光を滑らかに変える */

  glow.intensity +=
    (
      targetGlow -
      glow.intensity
    ) * 0.08;


  /*
     影をピンの高さに合わせて変える
  */

  const heightRatio =
    Math.min(
      pinGroup.position.y / 0.25,
      1
    );

  pinShadow.material.opacity =
    0.22 -
    heightRatio * 0.1;

  const shadowScale =
    1 -
    heightRatio * 0.18;

  pinShadow.scale.set(
    shadowScale,
    shadowScale * 0.42,
    shadowScale
  );


  controls.update();

  renderer.render(
    scene,
    camera
  );
}

animate();