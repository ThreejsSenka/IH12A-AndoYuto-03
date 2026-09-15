// =====================================
// Three.js 読み込み
// =====================================

import * as THREE from "three";
import { OrbitControls }
    from "three/addons/controls/OrbitControls.js";


// =====================================
// Scene
// =====================================

const scene = new THREE.Scene();

scene.background =
    new THREE.Color(0x000000);


// =====================================
// Camera
// =====================================

const camera =
    new THREE.PerspectiveCamera(
        60,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );

camera.position.set(
    0,
    25,
    40
);


// =====================================
// Renderer
// =====================================

const renderer =
    new THREE.WebGLRenderer({
        antialias: true
    });

renderer.setSize(
    window.innerWidth,
    window.innerHeight
);

renderer.setPixelRatio(
    window.devicePixelRatio
);

document.body.appendChild(
    renderer.domElement
);


// =====================================
// OrbitControls
// =====================================

const controls =
    new OrbitControls(
        camera,
        renderer.domElement
    );

controls.enableDamping = true;
controls.dampingFactor = 0.05;


// =====================================
// 太陽
// =====================================

const sunGeometry =
    new THREE.SphereGeometry(
        3,
        32,
        32
    );

const sunMaterial =
    new THREE.MeshBasicMaterial({
        color: 0xffff00
    });

const sun =
    new THREE.Mesh(
        sunGeometry,
        sunMaterial
    );

scene.add(sun);


// =====================================
// 太陽の光
// =====================================

const sunlight =
    new THREE.PointLight(
        0xffffff,
        10,
        1000
    );

sunlight.position.set(
    0,
    0,
    0
);

scene.add(
    sunlight
);


// =====================================
// 環境光
// =====================================

const ambientLight =
    new THREE.AmbientLight(
        0xffffff,
        1.5
    );

scene.add(
    ambientLight
);
// =====================================
// 星空
// =====================================

for (let i = 0; i < 1000; i++) {

    const starGeometry =
        new THREE.SphereGeometry(
            0.05,
            6,
            6
        );

    const starMaterial =
        new THREE.MeshBasicMaterial({
            color: 0xffffff
        });

    const star =
        new THREE.Mesh(
            starGeometry,
            starMaterial
        );

    star.position.set(
        (Math.random() - 0.5) * 400,
        (Math.random() - 0.5) * 400,
        (Math.random() - 0.5) * 400
    );

    scene.add(star);
}

// =====================================
// 惑星データ
// =====================================

const planets = [];

/*
    名前
    軌道半径
    色
    公転速度
    半径
*/
const planetData = [
    ["水星", 5, 0x999999, 0.030],
    ["金星", 8, 0xffcc66, 0.020],
    ["地球", 11, 0x3366ff, 0.015],
    ["火星", 14, 0xcc3300, 0.012],
    ["木星", 18, 0xcc9966, 0.010],
    ["土星", 23, 0xd8c28a, 0.008],
    ["天王星", 28, 0x66ffff, 0.006],
    ["海王星", 33, 0x3333ff, 0.005]
];


// =====================================
// 軌道を表示
// =====================================

planetData.forEach((data) => {

    const orbitRadius = data[1];

    const orbitGeometry =
        new THREE.RingGeometry(
            orbitRadius - 0.05,
            orbitRadius + 0.05,
            128
        );

    const orbitMaterial =
        new THREE.MeshBasicMaterial({
            color: 0x444444,
            side: THREE.DoubleSide
        });

    const orbit =
        new THREE.Mesh(
            orbitGeometry,
            orbitMaterial
        );

    orbit.rotation.x =
        -Math.PI / 2;

    scene.add(orbit);

});


// =====================================
// 惑星を作成
// =====================================

planetData.forEach((data) => {

    const planetName = data[0];
    const distance = data[1];
    const color = data[2];
    const speed = data[3];

    const radius = data[4];


    const geometry =
        new THREE.SphereGeometry(
            radius,
            32,
            32
        );


    const material =
        new THREE.MeshStandardMaterial({
            color: color
        });

    const planet =
        new THREE.Mesh(
            geometry,
            material
        );

    // 惑星情報を保存
    planet.userData = {
        name: planetName,
        distance: distance,
        speed: speed,
        angle: Math.random() * Math.PI * 2
    };

    // 土星のリング
    if (planetName === "土星") {

        const ringGeometry =
            new THREE.TorusGeometry(
                1.8,
                0.2,
                16,
                100
            );

        const ringMaterial =
            new THREE.MeshStandardMaterial({
                color: 0xc2b280
            });

        const ring =
            new THREE.Mesh(
                ringGeometry,
                ringMaterial
            );

        ring.rotation.x =
            Math.PI / 2;

        planet.add(ring);
    }
    planet.position.x = distance;
    scene.add(planet);

    planets.push(planet);

});


// =====================================
// Raycaster
// =====================================

const raycaster =
    new THREE.Raycaster();

const mouse =
    new THREE.Vector2();


const planetDescriptions = {

    "水星":
        "太陽に最も近い惑星です。",

    "金星":
        "地球に最も近づくことの多い惑星です。",

    "地球":
        "生命が存在する唯一の惑星です。",

    "火星":
        "赤い惑星として有名です。",

    "木星":
        "太陽系最大の惑星です。",

    "土星":
        "美しいリングを持つ惑星です。",

    "天王星":
        "横倒しに自転する惑星です。",

    "海王星":
        "太陽系で最も外側にある惑星です。"
};


const infoText =
    document.getElementById(
        "planetInfo"
    );


// =====================================
// 惑星クリック
// =====================================

window.addEventListener(
    "click",
    (event) => {

        mouse.x =
            (event.clientX / window.innerWidth) * 2 - 1;

        mouse.y =
            -(event.clientY / window.innerHeight) * 2 + 1;

        raycaster.setFromCamera(
            mouse,
            camera
        );

        const intersects =
            raycaster.intersectObjects(
                planets
            );

        if (intersects.length > 0) {

            const planet =
                intersects[0].object;

            infoText.textContent =
                `惑星名: ${planet.userData.name}, 軌道半径: ${planet.userData.distance}, 公転速度: ${planet.userData.speed}`;

        } else {

            infoText.textContent = "";

        }

    }
);

// =====================================
// 画面サイズ変更対応
// =====================================

window.addEventListener(
    "resize",
    () => {

        camera.aspect =
            window.innerWidth /
            window.innerHeight;

        camera.updateProjectionMatrix();

        renderer.setSize(
            window.innerWidth,
            window.innerHeight
        );

    }
);


// =====================================
// アニメーション処理
// =====================================

function animate() {

    requestAnimationFrame(
        animate
    );

    // -----------------------------
    // OrbitControls 更新
    // -----------------------------

    controls.update();


    // -----------------------------
    // 惑星の公転・自転
    // -----------------------------

    planets.forEach((planet) => {

        // 公転角度を更新
        planet.userData.angle +=
            planet.userData.speed;

        // X座標
        planet.position.x =
            Math.cos(
                planet.userData.angle
            ) *
            planet.userData.distance;

        // Z座標
        planet.position.z =
            Math.sin(
                planet.userData.angle
            ) *
            planet.userData.distance;

        // 自転
        planet.rotation.y +=
            0.01;

    });


    // -----------------------------
    // レンダリング
    // -----------------------------

    renderer.render(
        scene,
        camera
    );

}


// =====================================
// アニメーション開始
// =====================================

animate();