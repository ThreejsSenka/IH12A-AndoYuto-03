// =====================================
// Three.js 読み込み
// =====================================

import * as THREE from "three";
import { OrbitControls }
    from "three/addons/controls/OrbitControls.js";
// import marbleTextureUrl from "./src/assets/Marble006.png";
// import onyxTextureUrl from "./src/assets/Onyx013.png";
// import rockTextureUrl from "./src/assets/Rock035.png";
// import nightSkyTextureUrl from "./src/assets/NightSkyHDRI008.png";

const marbleTextureUrl = "./src/assets/Marble006.png";
const onyxTextureUrl = "./src/assets/Onyx013.png";
const rockTextureUrl = "./src/assets/Rock035.png";
const nightSkyTextureUrl = "./src/assets/NightSkyHDRI008.png";

// =====================================
// Scene
// =====================================

const scene = new THREE.Scene();

scene.background =
    new THREE.Color(0x2186c4);


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
    65,
    125
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

renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.35;

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

sun.userData = {
    name: "太陽",
    type: "恒星",
    description: "太陽系の中心にある恒星です。太陽系全体の質量の約99.86%を占めます。",
    distanceAU: 0,
    period: 0,
    radiusEarth: 109
};

scene.add(sun);


// =====================================
// 太陽の光
// =====================================

const sunlight =
    new THREE.PointLight(
        0xffffff,
        180,
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
        2.4
    );

scene.add(
    ambientLight
);
// =====================================
// サイバーパンク風ネオン星空
// =====================================

const cyberStarfield = new THREE.Group();
const cyberStarLayers = [];

const createCyberStarLayer = (count, color, size, opacity) => {
    const positions = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
        const index = i * 3;
        positions[index] = (Math.random() - 0.5) * 420;
        positions[index + 1] = (Math.random() - 0.5) * 420;
        positions[index + 2] = (Math.random() - 0.5) * 420;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute(
        "position",
        new THREE.BufferAttribute(positions, 3)
    );

    const material = new THREE.PointsMaterial({
        color,
        size,
        transparent: true,
        opacity,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        sizeAttenuation: true
    });

    const layer = new THREE.Points(geometry, material);
    cyberStarLayers.push(layer);
    cyberStarfield.add(layer);
};

createCyberStarLayer(520, 0x00f6ff, 0.72, 0.86);
createCyberStarLayer(360, 0xff28d7, 0.58, 0.72);
createCyberStarLayer(220, 0xa855ff, 0.48, 0.68);
createCyberStarLayer(120, 0xffe066, 0.38, 0.82);

scene.add(cyberStarfield);

// =====================================
// ワームホール
// =====================================

const wormhole = new THREE.Group();
const wormholeRings = [];

wormhole.userData = {
    name: "ワームホール",
    isWormhole: true
};

const wormholeCore = new THREE.Mesh(
    new THREE.SphereGeometry(3.4, 64, 64),
    new THREE.MeshBasicMaterial({
        color: 0x000005,
        transparent: true,
        opacity: 0.98
    })
);

const diskMaterial = new THREE.MeshBasicMaterial({
    color: 0xff7138,
    transparent: true,
    opacity: 0.78,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
    depthWrite: false
});

const disk = new THREE.Mesh(
    new THREE.TorusGeometry(4.7, 0.72, 32, 160),
    diskMaterial
);
disk.rotation.x = Math.PI / 2;
wormhole.add(disk);

const createWormholeRing = (radius, tube, color, opacity) => {
    const ring = new THREE.Mesh(
        new THREE.TorusGeometry(radius, tube, 24, 160),
        new THREE.MeshBasicMaterial({
            color,
            transparent: true,
            opacity,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        })
    );

    ring.rotation.x = Math.PI / 2;
    wormholeRings.push(ring);
    wormhole.add(ring);
};

createWormholeRing(4.1, 0.18, 0xffa45c, 0.9);
createWormholeRing(5.5, 0.12, 0x4edbff, 0.72);
createWormholeRing(6.4, 0.06, 0xb68cff, 0.55);

wormhole.add(wormholeCore);
wormhole.position.set(-40, 10, -35);
scene.add(wormhole);

const wormholeLight = new THREE.PointLight(
    0xff8844,
    90,
    45
);
wormholeLight.position.copy(wormhole.position);
scene.add(wormholeLight);

const specialWormhole = new THREE.Group();
const specialWormholeRings = [];
specialWormhole.userData = {
    name: "特殊ワームホール",
    isSpecialWormhole: true
};

specialWormhole.add(
    new THREE.Mesh(
        new THREE.SphereGeometry(3.1, 48, 48),
        new THREE.MeshBasicMaterial({ color: 0x020006 })
    )
);

const createSpecialRing = (radius, color, tube) => {
    const ring = new THREE.Mesh(
        new THREE.TorusGeometry(radius, tube, 20, 128),
        new THREE.MeshBasicMaterial({
            color,
            transparent: true,
            opacity: 0.9,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        })
    );
    ring.rotation.x = Math.PI / 2;
    specialWormholeRings.push(ring);
    specialWormhole.add(ring);
};

createSpecialRing(4.0, 0xff24d6, 0.2);
createSpecialRing(5.2, 0x8b5cff, 0.12);
createSpecialRing(6.2, 0x18f5ff, 0.06);
specialWormhole.position.set(36, -2, -28);
scene.add(specialWormhole);

const specialWormholeLight = new THREE.PointLight(
    0xff24d6,
    110,
    45
);
specialWormholeLight.position.copy(specialWormhole.position);
scene.add(specialWormholeLight);

// =====================================
// 異星系の伴星
// =====================================

const binarySystem = new THREE.Group();
const companionStar = new THREE.Mesh(
    new THREE.SphereGeometry(1.35, 32, 32),
    new THREE.MeshBasicMaterial({
        color: 0x8feaff
    })
);

companionStar.userData = {
    name: "青い伴星",
    type: "青色恒星",
    description: "太陽とは異なる青白い光を放つ、異星系の伴星です。",
    distanceAU: 0.04,
    period: 0.12,
    radiusEarth: 12
};

const binaryOrbit = new THREE.Mesh(
    new THREE.TorusGeometry(7, 0.04, 12, 128),
    new THREE.MeshBasicMaterial({
        color: 0x9beaff,
        transparent: true,
        opacity: 0.55
    })
);
binaryOrbit.rotation.x = Math.PI / 2;

companionStar.position.x = 7;
binarySystem.add(binaryOrbit);
binarySystem.add(companionStar);
scene.add(binarySystem);

const companionLight = new THREE.PointLight(
    0x66ccff,
    70,
    45
);
companionStar.add(companionLight);

// =====================================
// 惑星データ
// =====================================

const planets = [];
const selectableBodies = [sun];
const clickableBodies = [
    sun,
    wormhole,
    companionStar,
    specialWormhole
];

/*
    名前
    軌道半径
    色
    公転速度
    半径
*/
const planetData = [
    { name: "水星", distance: 0.387, radius: 0.38, period: 0.241, inclination: 7.0, type: "岩石惑星", color: 0x999999, texture: rockTextureUrl, description: "太陽に最も近く、太陽系で最小の惑星です。" },
    { name: "金星", distance: 0.723, radius: 0.95, period: 0.615, inclination: 3.4, type: "岩石惑星", color: 0xffcc66, texture: marbleTextureUrl, description: "厚い二酸化炭素の大気に覆われた、太陽系で最も高温の惑星です。" },
    { name: "地球", distance: 1, radius: 1, period: 1, inclination: 0, type: "岩石惑星", color: 0x3366ff, texture: nightSkyTextureUrl, description: "液体の水と生命が存在する、私たちの故郷です。" },
    { name: "火星", distance: 1.524, radius: 0.53, period: 1.881, inclination: 1.85, type: "岩石惑星", color: 0xcc3300, texture: rockTextureUrl, description: "酸化鉄によって赤く見える、探査が進められている惑星です。" },
    { name: "木星", distance: 5.203, radius: 11.2, period: 11.862, inclination: 1.3, type: "ガス惑星", color: 0xcc9966, texture: marbleTextureUrl, description: "太陽系最大の惑星で、大赤斑という巨大な嵐があります。" },
    { name: "土星", distance: 9.537, radius: 9.45, period: 29.457, inclination: 2.5, type: "ガス惑星", color: 0xd8c28a, texture: marbleTextureUrl, description: "氷と岩の粒からなる、太陽系で最も目立つ環を持つ惑星です。" },
    { name: "天王星", distance: 19.19, radius: 4.01, period: 84.017, inclination: 0.8, type: "氷惑星", color: 0x66ffff, texture: onyxTextureUrl, description: "自転軸が大きく傾き、横倒しのように自転する氷惑星です。" },
    { name: "海王星", distance: 30.07, radius: 3.88, period: 164.8, inclination: 1.8, type: "氷惑星", color: 0x3333ff, texture: onyxTextureUrl, description: "太陽から最も遠い、強い風が吹く青い氷惑星です。" }
];

const distanceScale = 2.8;
const planetRadiusScale = 0.12;
let simulationYearsPerSecond = 2;

const textureLoader = new THREE.TextureLoader();


// =====================================
// 軌道を表示
// =====================================

planetData.forEach((data) => {

    const orbitRadius = data.distance * distanceScale;

    const orbitGeometry =
        new THREE.RingGeometry(
            orbitRadius - 0.05,
            orbitRadius + 0.05,
            128
        );

    const orbitMaterial =
        new THREE.MeshBasicMaterial({
                color: 0x7192c4,
            side: THREE.DoubleSide
        });

    const orbit =
        new THREE.Mesh(
            orbitGeometry,
            orbitMaterial
        );

    orbit.rotation.x =
        -Math.PI / 2;
    orbit.rotation.z =
        THREE.MathUtils.degToRad(data.inclination);

    scene.add(orbit);

});


// =====================================
// 惑星を作成
// =====================================

planetData.forEach((data) => {

    const planetName = data.name;
    const distance = data.distance * distanceScale;
    const texture = textureLoader.load(data.texture);
    texture.colorSpace = THREE.SRGBColorSpace;


    const geometry =
        new THREE.SphereGeometry(
            Math.max(data.radius * planetRadiusScale, 0.16),
            32,
            32
        );


    const material =
        new THREE.MeshStandardMaterial({
            map: texture,
            color: data.color,
            roughness: 0.8,
            metalness: 0
        });

    const planet =
        new THREE.Mesh(
            geometry,
            material
        );

    // 惑星情報を保存
    planet.userData = {
        name: planetName,
        type: data.type,
        description: data.description,
        distanceAU: data.distance,
        period: data.period,
        inclination: data.inclination,
        radiusEarth: data.radius,
        distance: distance,
        angle: Math.random() * Math.PI * 2
    };

    // 土星のリング
    if (planetName === "土星") {

        const ringRadius = data.radius * planetRadiusScale * 1.8;

        const ringGeometry =
            new THREE.TorusGeometry(
                ringRadius,
                0.12,
                16,
                100
            );

        const ringMaterial =
            new THREE.MeshStandardMaterial({
                map: texture,
                color: 0xffffff,
                roughness: 0.9
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
    selectableBodies.push(planet);
    clickableBodies.push(planet);

});


// =====================================
// Raycaster
// =====================================

const raycaster =
    new THREE.Raycaster();

const mouse =
    new THREE.Vector2();


const infoText =
    document.getElementById(
        "planetInfo"
    );

const planetNavigation =
    document.getElementById(
        "planet-navigation"
    );

const previousButton =
    document.getElementById(
        "planet-previous"
    );

const nextButton =
    document.getElementById(
        "planet-next"
    );

const speedSlider =
    document.getElementById(
        "speed-slider"
    );

const speedValue =
    document.getElementById(
        "speed-value"
    );

let selectedBody = null;
const focusOffset = new THREE.Vector3();

function focusBody(body) {
    const bodyPosition = new THREE.Vector3();
    body.getWorldPosition(bodyPosition);

    focusOffset.copy(camera.position).sub(controls.target);
    controls.target.copy(bodyPosition);
    camera.position.copy(bodyPosition).add(focusOffset);
    controls.update();
}

speedSlider.addEventListener("input", () => {
    simulationYearsPerSecond = Number(speedSlider.value);
    speedValue.textContent =
        `${simulationYearsPerSecond.toFixed(1)} 年/秒`;
});

// =====================================
// 惑星クリック
// =====================================


function displayBodyInfo(body) {
    selectedBody = body;
    focusBody(body);

    infoText.innerHTML = `
        <h3>${body.userData.name}</h3>
        <p>${body.userData.description}</p>
        <hr>
        <p>種類：${body.userData.type}</p>
        <p>軌道半径：${body.userData.distanceAU} AU</p>
        <p>公転周期：${body.userData.period || "-"} 年</p>
        <p>地球に対する半径：${body.userData.radiusEarth} 倍</p>
    `;

    planetNavigation.hidden = false;
}

function moveToBody(step) {
    if (!selectedBody) {
        return;
    }

    const currentIndex = selectableBodies.indexOf(selectedBody);
    const nextIndex =
        (currentIndex + step + selectableBodies.length) % selectableBodies.length;

    displayBodyInfo(selectableBodies[nextIndex]);
}

previousButton.addEventListener("click", () => {
    moveToBody(-1);
});

nextButton.addEventListener("click", () => {
    moveToBody(1);
});

renderer.domElement.addEventListener(
    "click",
    async (event) => {

        // Canvasの位置と大きさを取得
        const rect =
            renderer.domElement.getBoundingClientRect();

        // マウス座標を正規化デバイス座標へ変換
        mouse.x =
            ((event.clientX - rect.left) /
                rect.width) *
                2 - 1;

        mouse.y =
            -((event.clientY - rect.top) /
                rect.height) *
                2 + 1;

        raycaster.setFromCamera(
            mouse,
            camera
        );

        // true にすることで土星のリングなども判定対象にする
        const intersects =
            raycaster.intersectObjects(
                clickableBodies,
                true
            );


        if (intersects.length > 0) {
            // 最初に交差したオブジェクトを取得
            let selectedObject =
                intersects[0].object;

            /*
                土星のリングをクリックした場合、
                userData.nameを持つ親オブジェクトまでさかのぼる
            */
            while (
                selectedObject &&
                !selectedObject.userData.name &&
                !selectedObject.userData.isWormhole &&
                !selectedObject.userData.isSpecialWormhole
            ) {
                selectedObject =
                    selectedObject.parent;
            }

            // 惑星が取得できなかった場合は処理を終了
            if (!selectedObject) {
                return;
            }

            if (selectedObject.userData.isWormhole) {
                window.location.search = "?scene=taiyoukei";
                return;
            }

            if (selectedObject.userData.isSpecialWormhole) {
                window.location.search = "?scene=mirai";
                return;
            }

            // 情報ウィンドウを表示
            displayBodyInfo(selectedObject);

        } else {

            // 惑星以外をクリックした場合
            infoText.textContent =
                "惑星をクリックしてください";
            selectedBody = null;
            planetNavigation.hidden = true;
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

const clock = new THREE.Clock();

function animate() {

    requestAnimationFrame(
        animate
    );

    // -----------------------------
    // OrbitControls 更新
    // -----------------------------

    controls.update();

    const deltaSeconds = clock.getDelta();
    const elapsedSeconds = clock.elapsedTime;

    cyberStarfield.rotation.y += deltaSeconds * 0.004;
    cyberStarfield.rotation.z -= deltaSeconds * 0.002;
    cyberStarLayers.forEach((layer, index) => {
        layer.material.opacity =
            (0.58 + index * 0.07) +
            Math.sin(elapsedSeconds * (1.4 + index * 0.35) + index) * 0.12;
    });

    wormhole.rotation.y += deltaSeconds * 0.08;
    wormhole.rotation.z -= deltaSeconds * 0.04;
    binarySystem.rotation.y += deltaSeconds * 0.12;
    binarySystem.rotation.z =
        Math.sin(elapsedSeconds * 0.4) * 0.08;
    disk.rotation.z += deltaSeconds * 0.6;
    wormholeRings.forEach((ring, index) => {
        ring.rotation.z += deltaSeconds * (0.35 + index * 0.12);
        ring.material.opacity =
            (0.45 + index * 0.16) +
            Math.sin(elapsedSeconds * 2.5 + index) * 0.12;
    });
    specialWormhole.rotation.y -= deltaSeconds * 0.14;
    specialWormhole.rotation.z += deltaSeconds * 0.06;
    specialWormholeRings.forEach((ring, index) => {
        ring.rotation.z -= deltaSeconds * (0.3 + index * 0.1);
        ring.material.opacity =
            0.65 + Math.sin(elapsedSeconds * 2.2 + index) * 0.2;
    });


    // -----------------------------
    // 惑星の公転・自転
    // -----------------------------

    planets.forEach((planet) => {

        // 公転周期（年）から角速度を計算
        planet.userData.angle +=
            (deltaSeconds * simulationYearsPerSecond * Math.PI * 2) /
            planet.userData.period;

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

        planet.position.y =
            Math.sin(planet.userData.angle) *
            planet.userData.distance *
            Math.sin(THREE.MathUtils.degToRad(planet.userData.inclination));

        // 自転
        planet.rotation.y +=
            deltaSeconds * 0.5;

    });

    if (selectedBody) {
        const bodyPosition = new THREE.Vector3();
        selectedBody.getWorldPosition(bodyPosition);

        focusOffset.copy(camera.position).sub(controls.target);
        controls.target.copy(bodyPosition);
        camera.position.copy(bodyPosition).add(focusOffset);
    }


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