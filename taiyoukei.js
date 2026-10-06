// // =====================================
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
    new THREE.Color(0x07152f);


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
        2.2,
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
// 別銀河風ネオン星空
// =====================================

const galaxyStarfield = new THREE.Group();
const galaxyStarLayers = [];

const createGalaxyStarLayer = (count, color, size, opacity) => {
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
    galaxyStarLayers.push(layer);
    galaxyStarfield.add(layer);
};

createGalaxyStarLayer(460, 0x25d9ff, 0.65, 0.82);
createGalaxyStarLayer(320, 0xff4dcf, 0.5, 0.66);
createGalaxyStarLayer(180, 0x8d6bff, 0.42, 0.62);
createGalaxyStarLayer(100, 0xffc857, 0.34, 0.76);

scene.add(galaxyStarfield);

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

const wormholeDisk = new THREE.Mesh(
    new THREE.TorusGeometry(4.7, 0.72, 32, 160),
    new THREE.MeshBasicMaterial({
        color: 0xff7138,
        transparent: true,
        opacity: 0.78,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide,
        depthWrite: false
    })
);
wormholeDisk.rotation.x = Math.PI / 2;
wormhole.add(wormholeDisk);

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

// =====================================
// 離れた座標にある異星銀河
// =====================================

const alienGalaxy = new THREE.Group();
alienGalaxy.position.set(220, 28, -170);

const alienGalaxyLayers = [];
const createAlienGalaxyLayer = (count, color, size, opacity) => {
    const positions = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
        const index = i * 3;
        const angle = Math.random() * Math.PI * 2;
        const radius = Math.sqrt(Math.random()) * 30;
        const spiralOffset = radius * 0.04;

        positions[index] = Math.cos(angle + spiralOffset) * radius;
        positions[index + 1] = (Math.random() - 0.5) * 8;
        positions[index + 2] = Math.sin(angle + spiralOffset) * radius;
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
    alienGalaxyLayers.push(layer);
    alienGalaxy.add(layer);
};

createAlienGalaxyLayer(520, 0x00f6ff, 0.72, 0.86);
createAlienGalaxyLayer(360, 0xff28d7, 0.58, 0.72);
createAlienGalaxyLayer(220, 0xa855ff, 0.48, 0.68);
createAlienGalaxyLayer(120, 0xffe066, 0.38, 0.82);

const alienGalaxyCore = new THREE.Mesh(
    new THREE.SphereGeometry(3.2, 48, 48),
    new THREE.MeshBasicMaterial({ color: 0xffd166 })
);
alienGalaxy.add(alienGalaxyCore);

const alienBinaryOrbit = new THREE.Mesh(
    new THREE.TorusGeometry(7, 0.04, 12, 128),
    new THREE.MeshBasicMaterial({
        color: 0x9beaff,
        transparent: true,
        opacity: 0.55
    })
);
alienBinaryOrbit.rotation.x = Math.PI / 2;
alienGalaxy.add(alienBinaryOrbit);

const alienCompanionStar = new THREE.Mesh(
    new THREE.SphereGeometry(1.35, 32, 32),
    new THREE.MeshBasicMaterial({ color: 0x8feaff })
);
alienCompanionStar.position.x = 7;
alienGalaxy.add(alienCompanionStar);

const alienGalaxyLight = new THREE.PointLight(
    0x35dfff,
    160,
    80
);
alienGalaxy.add(alienGalaxyLight);

const alienPlanets = [];
const alienPlanetData = [
    { name: "ネオン-01", radius: 0.55, orbit: 7, period: 0.7, color: 0x22e6ff, type: "発光岩石惑星" },
    { name: "ネオン-02", radius: 0.8, orbit: 11, period: 1.2, color: 0xff42d0, type: "鉱物惑星" },
    { name: "ネオン-03", radius: 1.05, orbit: 15, period: 1.8, color: 0x9d6bff, type: "ガス惑星" },
    { name: "ネオン-04", radius: 0.7, orbit: 19, period: 2.5, color: 0xffd166, type: "砂漠惑星" },
    { name: "ネオン-05", radius: 1.35, orbit: 23, period: 3.4, color: 0x38f5b5, type: "海洋惑星" },
    { name: "ネオン-06", radius: 0.9, orbit: 27, period: 4.6, color: 0xff6b4d, type: "氷惑星" },
    { name: "ネオン-07", radius: 1.15, orbit: 32, period: 5.8, color: 0xff4d8d, type: "雷惑星" },
    { name: "ネオン-08", radius: 0.75, orbit: 37, period: 7.1, color: 0x4dffca, type: "森林惑星" },
    { name: "ネオン-09", radius: 1.5, orbit: 42, period: 8.6, color: 0xd66bff, type: "巨大ガス惑星" },
    { name: "ネオン-10", radius: 1.0, orbit: 47, period: 10.2, color: 0xff8c42, type: "火山惑星" }
];

alienPlanetData.forEach((data, index) => {
    const orbitLine = new THREE.Mesh(
        new THREE.TorusGeometry(data.orbit, 0.035, 12, 128),
        new THREE.MeshBasicMaterial({
            color: data.color,
            transparent: true,
            opacity: 0.35,
            blending: THREE.AdditiveBlending
        })
    );
    orbitLine.rotation.x = Math.PI / 2;
    alienGalaxy.add(orbitLine);

    const planet = new THREE.Mesh(
        new THREE.SphereGeometry(data.radius, 24, 24),
        new THREE.MeshBasicMaterial({
            color: data.color,
            transparent: true,
            opacity: 0.95
        })
    );

    planet.userData = {
        name: data.name,
        type: data.type,
        description: "siranai.jsの銀河にあるネオン色の惑星です。",
        distanceAU: data.orbit,
        period: data.period,
        radiusEarth: data.radius,
        alienOrbit: data.orbit,
        alienAngle: (index / alienPlanetData.length) * Math.PI * 2
    };

    planet.position.x = data.orbit;
    alienGalaxy.add(planet);
    alienPlanets.push(planet);
});

const returnWormhole = new THREE.Group();
const returnWormholeRings = [];
returnWormhole.userData = {
    name: "太陽系へ戻るワームホール",
    isGalaxyWormhole: true
};

returnWormhole.add(
    new THREE.Mesh(
        new THREE.SphereGeometry(2.8, 48, 48),
        new THREE.MeshBasicMaterial({ color: 0x010006 })
    )
);

const createReturnRing = (radius, color, tube) => {
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
    returnWormholeRings.push(ring);
    returnWormhole.add(ring);
};

createReturnRing(3.6, 0xffa45c, 0.18);
createReturnRing(4.7, 0x4edbff, 0.11);
returnWormhole.position.set(0, 5, 13);
alienGalaxy.add(returnWormhole);
scene.add(alienGalaxy);

// =====================================
// 未来都市銀河（mirai.js）
// =====================================

const futureGalaxy = new THREE.Group();
futureGalaxy.position.set(-220, -28, -150);
const futureGalaxyLayers = [];

const createFutureGalaxyLayer = (count, color, size, opacity) => {
    const positions = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
        const index = i * 3;
        positions[index] = (Math.random() - 0.5) * 150;
        positions[index + 1] = Math.random() * 90 - 10;
        positions[index + 2] = (Math.random() - 0.5) * 150;
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
    futureGalaxyLayers.push(layer);
    futureGalaxy.add(layer);
};

createFutureGalaxyLayer(600, 0xff65ea, 0.62, 0.8);
createFutureGalaxyLayer(420, 0x00eaff, 0.5, 0.72);
createFutureGalaxyLayer(240, 0x9d5cff, 0.42, 0.68);

const futureCity = new THREE.Group();
const futureCityMaterials = [
    new THREE.MeshBasicMaterial({ color: 0x00eaff, wireframe: true }),
    new THREE.MeshBasicMaterial({ color: 0xff2bd6, wireframe: true }),
    new THREE.MeshBasicMaterial({ color: 0x9d5cff, wireframe: true })
];

for (let i = 0; i < 26; i++) {
    const width = 0.8 + Math.random() * 2.4;
    const height = 2 + Math.random() * 12;
    const building = new THREE.Mesh(
        new THREE.BoxGeometry(width, height, width),
        futureCityMaterials[i % futureCityMaterials.length]
    );
    const angle = (i / 26) * Math.PI * 2;
    const distance = 12 + Math.random() * 13;
    building.position.set(
        Math.cos(angle) * distance,
        height / 2 - 6,
        Math.sin(angle) * distance - 5
    );
    futureCity.add(building);
}

const aquariumBillboards = [];

const createAquariumPoster = (animalIndex) => {
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 320;
    const context = canvas.getContext("2d");
    const texture = new THREE.CanvasTexture(canvas);

    const background = context.createLinearGradient(0, 0, 512, 320);
    background.addColorStop(0, "#061b3d");
    background.addColorStop(1, "#260047");
    context.fillStyle = background;
    context.fillRect(0, 0, 512, 320);

    context.strokeStyle = "#00eaff";
    context.lineWidth = 5;
    context.strokeRect(12, 12, 488, 296);
    context.fillStyle = "#ff2bd6";
    context.font = "bold 30px sans-serif";
    context.fillText("AQUA // LIVE", 30, 52);

    context.strokeStyle = "#00eaff";
    context.fillStyle = animalIndex % 3 === 0 ? "#ff4fcf" : "#32f0ff";
    context.lineWidth = 8;

    if (animalIndex % 3 === 0) {
        context.beginPath();
        context.ellipse(260, 165, 82, 48, 0, 0, Math.PI * 2);
        context.fill();
        context.beginPath();
        context.moveTo(178, 165);
        context.lineTo(125, 125);
        context.lineTo(125, 205);
        context.closePath();
        context.fill();
        context.stroke();
        context.fillStyle = "#061b3d";
        context.beginPath();
        context.arc(295, 150, 8, 0, Math.PI * 2);
        context.fill();
    } else if (animalIndex % 3 === 1) {
        context.beginPath();
        context.arc(260, 145, 58, Math.PI, 0);
        context.lineTo(318, 230);
        context.lineTo(290, 210);
        context.lineTo(260, 245);
        context.lineTo(230, 210);
        context.lineTo(202, 230);
        context.closePath();
        context.fill();
        for (let tentacle = 0; tentacle < 5; tentacle++) {
            context.beginPath();
            context.moveTo(215 + tentacle * 23, 205);
            context.quadraticCurveTo(
                205 + tentacle * 26,
                250,
                220 + tentacle * 23,
                275
            );
            context.stroke();
        }
    } else {
        context.beginPath();
        context.arc(260, 170, 55, 0, Math.PI * 2);
        context.fill();
        for (let arm = 0; arm < 8; arm++) {
            const angle = (arm / 8) * Math.PI * 2;
            context.beginPath();
            context.moveTo(260, 170);
            context.lineTo(
                260 + Math.cos(angle) * 105,
                170 + Math.sin(angle) * 70
            );
            context.stroke();
        }
    }

    context.fillStyle = "#ffe066";
    context.font = "bold 18px sans-serif";
    context.fillText(
        animalIndex % 3 === 0 ? "NEON FISH" : animalIndex % 3 === 1 ? "JELLY ZONE" : "OCTO LAB",
        30,
        285
    );
    texture.colorSpace = THREE.SRGBColorSpace;

    const billboard = new THREE.Mesh(
        new THREE.PlaneGeometry(5.5, 3.45),
        new THREE.MeshBasicMaterial({
            map: texture,
            transparent: true,
            opacity: 0.92,
            side: THREE.DoubleSide,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
            depthTest: false
        })
    );
    billboard.renderOrder = 20;
    aquariumBillboards.push(billboard);
    return billboard;
};

for (let i = 0; i < 7; i++) {
    const angle = (i / 7) * Math.PI * 2;
    const billboard = createAquariumPoster(i);
    billboard.position.set(
        Math.cos(angle) * 18,
        10 + (i % 3) * 3.5,
        Math.sin(angle) * 18 - 5
    );
    futureCity.add(billboard);
}

for (let i = 0; i < 12; i++) {
    const angle = (i / 12) * Math.PI * 2 + 0.18;
    const sideBillboard = createAquariumPoster(i + 7);
    sideBillboard.scale.set(0.62, 0.62, 0.62);
    sideBillboard.position.set(
        Math.cos(angle) * (13 + (i % 3) * 2.5),
        1.5 + (i % 4) * 2.1,
        Math.sin(angle) * (13 + (i % 3) * 2.5) - 5
    );
    futureCity.add(sideBillboard);
}
futureGalaxy.add(futureCity);

const futureGrid = new THREE.GridHelper(
    80,
    40,
    0x00eaff,
    0x4d1d80
);
futureGrid.position.y = -6;
futureGrid.material.transparent = true;
futureGrid.material.opacity = 0.45;
futureGalaxy.add(futureGrid);

const futureGalaxyCore = new THREE.Mesh(
    new THREE.SphereGeometry(3.2, 48, 48),
    new THREE.MeshBasicMaterial({ color: 0xff29d9 })
);
futureGalaxy.add(futureGalaxyCore);

const futureGalaxyLight = new THREE.PointLight(
    0xff29d9,
    140,
    80
);
futureGalaxy.add(futureGalaxyLight);

const futureReturnWormhole = new THREE.Group();
const futureReturnRings = [];
futureReturnWormhole.userData = {
    name: "太陽系へ戻る未来ワームホール",
    isGalaxyWormhole: true
};
futureReturnWormhole.add(
    new THREE.Mesh(
        new THREE.SphereGeometry(2.8, 48, 48),
        new THREE.MeshBasicMaterial({ color: 0x010006 })
    )
);

const createFutureReturnRing = (radius, color, tube) => {
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
    futureReturnRings.push(ring);
    futureReturnWormhole.add(ring);
};

createFutureReturnRing(3.6, 0xff2bd6, 0.18);
createFutureReturnRing(4.7, 0x19f9ff, 0.11);
futureReturnWormhole.position.set(0, 5, 13);
futureGalaxy.add(futureReturnWormhole);
scene.add(futureGalaxy);

const futureWormhole = new THREE.Group();
const futureWormholeRings = [];
futureWormhole.userData = {
    name: "未来銀河へのワームホール",
    isFutureWormhole: true
};
futureWormhole.add(
    new THREE.Mesh(
        new THREE.SphereGeometry(3.1, 48, 48),
        new THREE.MeshBasicMaterial({ color: 0x020006 })
    )
);

const createFutureWormholeRing = (radius, color, tube) => {
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
    futureWormholeRings.push(ring);
    futureWormhole.add(ring);
};

createFutureWormholeRing(4.0, 0xff2bd6, 0.2);
createFutureWormholeRing(5.2, 0x7d5cff, 0.12);
createFutureWormholeRing(6.2, 0x19f9ff, 0.06);
futureWormhole.position.set(34, -8, -42);
scene.add(futureWormhole);


// =====================================
// プログラム言語組み合わせ銀河
// =====================================
const programGalaxy = new THREE.Group();
programGalaxy.position.set(920, 90, 620);
scene.add(programGalaxy);

const programGalaxyCore = new THREE.Mesh(
    new THREE.IcosahedronGeometry(4.5, 2),
    new THREE.MeshBasicMaterial({ color: 0x45ff9a, wireframe: true })
);
programGalaxyCore.userData = { name: "選択確認コア", isProgramGalaxyCore: true };
programGalaxy.add(programGalaxyCore);
programGalaxy.add(new THREE.PointLight(0x45ff9a, 180, 120));

const languageCatalog = {
    TypeScript:{color:0x3178c6,next:["JavaScript","Python","Go","C#"],items:["Webサイト","Webサービス","デスクトップアプリ"]},
    Python:{color:0xffd343,next:["TypeScript","C++","Go","Rust"],items:["AIサービス","データ分析","Web API"]},
    JavaScript:{color:0xf7df1e,next:["TypeScript","Python","PHP","Java"],items:["Webサイト","Webサービス","ブラウザアプリ"]},
    Java:{color:0xf89820,next:["Kotlin","TypeScript","Python","Go"],items:["業務システム","Web API","Androidアプリ"]},
    "C#":{color:0x9b4f96,next:["TypeScript","Python","C++","Go"],items:["ゲーム","業務システム","Webサービス"]},
    "C++":{color:0x659ad2,next:["Python","Rust","C#","Java"],items:["ゲームエンジン","組み込みシステム","高速処理アプリ"]},
    Go:{color:0x00add8,next:["TypeScript","Python","Rust","Java"],items:["クラウドサービス","Web API","ネットワークツール"]},
    Rust:{color:0xe86f36,next:["TypeScript","Python","C++","Go"],items:["システムツール","WebAssembly","高速バックエンド"]},
    Kotlin:{color:0xa97bff,next:["Java","TypeScript","Python","Go"],items:["Androidアプリ","Web API","業務システム"]},
    Swift:{color:0xfa7343,next:["TypeScript","Python","C++","Go"],items:["iPhoneアプリ","iPadアプリ","macOSアプリ"]},
    PHP:{color:0x777bb4,next:["JavaScript","TypeScript","Python","Go"],items:["Webサイト","ECサイト","CMS"]},
    Dart:{color:0x42a5f5,next:["TypeScript","Python","Go","Java"],items:["スマホアプリ","Webアプリ","デスクトップアプリ"]}
};
const initialLanguageNames = Object.keys(languageCatalog);
const languageStars = [], languageLabels = [], productCards = [];
let firstSelectedLanguage = null, secondSelectedLanguage = null, programTransition = null;

const languageWindow = document.createElement("div");
languageWindow.style.cssText = "position:fixed;top:12%;left:50%;transform:translateX(-50%);width:min(470px,calc(100vw - 40px));padding:18px;color:white;background:rgba(3,21,13,.94);border:2px solid #45ff9a;border-radius:12px;z-index:30;display:none;font-family:sans-serif";
document.body.appendChild(languageWindow);

const makeProgramSprite = (text, border, width, height) => {
    const canvas = document.createElement("canvas");
    canvas.width = 800; canvas.height = 220;
    const context = canvas.getContext("2d");
    context.fillStyle = "rgba(3,21,13,.94)"; context.fillRect(0,0,800,220);
    context.strokeStyle = border; context.lineWidth = 8; context.strokeRect(5,5,790,210);
    context.fillStyle = "white"; context.font = "bold 76px sans-serif";
    context.textAlign = "center"; context.textBaseline = "middle"; context.fillText(text,400,110);
    const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map:new THREE.CanvasTexture(canvas), transparent:true, depthWrite:false }));
    sprite.scale.set(width,height,1);
    sprite.userData.targetScale = new THREE.Vector3(width,height,1);
    return sprite;
};
const clearProgramObjects = () => {
    [...languageStars,...languageLabels,...productCards].forEach(object => programGalaxy.remove(object));
    languageStars.length=0; languageLabels.length=0; productCards.length=0;
};
const safeProgramPositions = count => {
    const result=[], blocked=[new THREE.Vector3(0,0,0),new THREE.Vector3(-35,8,-22)];
    for(let index=0; index<count; index++){
        let point, attempts=0;
        do {
            const angle=Math.random()*Math.PI*2, radius=18+Math.random()*35;
            point=new THREE.Vector3(Math.cos(angle)*radius,-5+Math.random()*18,Math.sin(angle)*radius);
            attempts++;
        } while(attempts<250 && [...blocked,...result].some(other => other.distanceTo(point)<10));
        result.push(point);
    }
    return result;
};
const beginProgramTransition = build => {
    programTransition={ outgoing:[...languageStars,...languageLabels,...productCards], elapsed:0, duration:.8, build, built:false };
};
const applyEntryState = object => {
    object.scale.copy(object.userData.targetScale || new THREE.Vector3(1,1,1)).multiplyScalar(.06);
    if(object.material) object.material.opacity=0;
};
const createLanguageStars = (names, selectionStep, animate=false) => {
    const build=()=>{
        clearProgramObjects();
        const positions=safeProgramPositions(names.length);
        names.forEach((name,index)=>{
            const star=new THREE.Mesh(new THREE.SphereGeometry(1.7,28,28),new THREE.MeshBasicMaterial({color:languageCatalog[name].color,transparent:true}));
            star.position.copy(positions[index]); star.userData={isLanguageStar:true,languageName:name,selectionStep,targetScale:new THREE.Vector3(1,1,1)};
            const label=makeProgramSprite(name,"#35f2ff",13.5,3.8);
            label.position.copy(positions[index]).add(new THREE.Vector3(0,4.2,0));
            if(animate){applyEntryState(star);applyEntryState(label)}
            programGalaxy.add(star,label); languageStars.push(star); languageLabels.push(label);
        });
    };
    animate ? beginProgramTransition(build) : build();
};
const getProgramProducts=()=>{
    const first=languageCatalog[firstSelectedLanguage].items, second=languageCatalog[secondSelectedLanguage].items;
    const common=first.filter(item=>second.includes(item));
    return common.length ? common : [...new Set([first[0],second[0],"Webサービス"])];
};
const productDetails={
    "Webサイト":["企業サイト・作品紹介サイト","ブラウザで情報を閲覧するページです。"],
    "Webサービス":["予約・投稿・共有サービス","画面とサーバー側の処理を組み合わせて機能を提供します。"],
    "AIサービス":["画像判定・文章生成支援","学習済みモデルを利用して判定や生成を行います。"],
    "データ分析":["売上分析・予測","蓄積データを集計して可視化します。"],
    "Web API":["データ連携API","複数のサービス間でデータを受け渡します。"]
};
const showProductDetail=product=>{
    const detail=productDetails[product]||[`${product}の具体例`,`${firstSelectedLanguage}と${secondSelectedLanguage}を組み合わせて制作できます。`];
    languageWindow.innerHTML=`<h3>${product}</h3><p><b>具体例：</b>${detail[0]}</p><p>${detail[1]}</p><button id="closeProgramWindow">閉じる</button>`;
    languageWindow.style.display="block"; document.getElementById("closeProgramWindow").onclick=()=>languageWindow.style.display="none";
};
const showProductCards=(animate=true)=>{
    const build=()=>{
        clearProgramObjects();
        const names=getProgramProducts(), positions=safeProgramPositions(names.length);
        names.forEach((name,index)=>{
            const card=makeProgramSprite(name,"#ffd84d",17,4.8);
            card.position.copy(positions[index]); card.userData.isProductCard=true; card.userData.productName=name;
            if(animate) applyEntryState(card);
            programGalaxy.add(card); productCards.push(card);
        });
    };
    animate ? beginProgramTransition(build) : build();
};
const resetProgramSelection=()=>{firstSelectedLanguage=null;secondSelectedLanguage=null;createLanguageStars(initialLanguageNames,1,true);languageWindow.style.display="none"};
const showProgramStatus=()=>{
    languageWindow.innerHTML=`<h3>選択内容</h3><p>1つ目：<b>${firstSelectedLanguage||"未選択"}</b></p><p>2つ目：<b>${secondSelectedLanguage||"未選択"}</b></p><button id="resetProgramSelection">選択内容をリセット</button>`;
    languageWindow.style.display="block"; document.getElementById("resetProgramSelection").onclick=resetProgramSelection;
};
const selectLanguageStar=object=>{
    if(object.userData.selectionStep===1){firstSelectedLanguage=object.userData.languageName;secondSelectedLanguage=null;createLanguageStars(languageCatalog[firstSelectedLanguage].next,2,true)}
    else {
        secondSelectedLanguage=object.userData.languageName;
        showProductCards(true);
        showProgramStatus();
    }
};
createLanguageStars(initialLanguageNames,1,false);

const programWormhole=new THREE.Group();
programWormhole.userData={isProgramWormhole:true};
programWormhole.add(new THREE.Mesh(new THREE.OctahedronGeometry(3.5,2),new THREE.MeshBasicMaterial({color:0x45ff9a,wireframe:true})));
programWormhole.position.set(-35,8,-22);programGalaxy.add(programWormhole);
const futureProgramWormhole=new THREE.Group();futureProgramWormhole.userData={isFutureProgramWormhole:true};
[7,9,11].forEach((size,index)=>futureProgramWormhole.add(new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(size,size,1+index)),new THREE.LineBasicMaterial({color:[0x45ff9a,0x35f2ff,0xffd84d][index]}))));
futureProgramWormhole.position.set(30,6,-22);futureGalaxy.add(futureProgramWormhole);

const portalTunnels = [];

const createPortalTunnel = (startPortal, endPortal, colors) => {
    const start = new THREE.Vector3();
    const end = new THREE.Vector3();
    startPortal.getWorldPosition(start);
    endPortal.getWorldPosition(end);

    const midpoint = start.clone().lerp(end, 0.5);
    midpoint.y += 18;
    midpoint.x += Math.sin(start.x + end.z) * 24;

    const curve = new THREE.CatmullRomCurve3([
        start,
        midpoint,
        end
    ]);
    const tunnelMesh = new THREE.Mesh(
        new THREE.TubeGeometry(curve, 96, 0.8, 10, false),
        new THREE.MeshBasicMaterial({
            color: colors[1],
            transparent: true,
            opacity: 0.32,
            blending: THREE.AdditiveBlending,
            side: THREE.DoubleSide,
            depthWrite: false
        })
    );
    scene.add(tunnelMesh);

    const segments = 48;
    const lanes = colors.map((color, laneIndex) => {
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array((segments + 1) * 3);
        geometry.setAttribute(
            "position",
            new THREE.BufferAttribute(positions, 3)
        );

        const material = new THREE.LineBasicMaterial({
            color,
            transparent: true,
            opacity: laneIndex === 1 ? 0.95 : 0.6,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });

        const line = new THREE.Line(geometry, material);
        scene.add(line);
        return { line, offset: (laneIndex - 1) * 1.8 };
    });

    const tunnel = {
        startPortal,
        endPortal,
        tunnelMesh,
        lanes,
        segments
    };
    portalTunnels.push(tunnel);
    return tunnel;
};

createPortalTunnel(
    wormhole,
    returnWormhole,
    [0xff2bd6, 0x19f9ff, 0x9d5cff]
);
createPortalTunnel(
    futureWormhole,
    futureReturnWormhole,
    [0xff8c42, 0xff2bd6, 0x19f9ff]
);
createPortalTunnel(futureProgramWormhole,programWormhole,[0x45ff9a,0x35f2ff,0xffd84d]);

const galaxyConnections = [];

const createGalaxyConnection = (startObject, endObject, color) => {
    const start = new THREE.Vector3();
    const end = new THREE.Vector3();
    startObject.getWorldPosition(start);
    endObject.getWorldPosition(end);

    const segments = 32;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array((segments + 1) * 3);
    geometry.setAttribute(
        "position",
        new THREE.BufferAttribute(positions, 3)
    );

    const line = new THREE.Line(
        geometry,
        new THREE.LineBasicMaterial({
            color,
            transparent: true,
            opacity: 0.9,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
            depthTest: false
        })
    );
    line.frustumCulled = false;
    scene.add(line);

    const midpoint = start.clone().lerp(end, 0.5);
    midpoint.y += 18;
    const beam = new THREE.Mesh(
        new THREE.TubeGeometry(
            new THREE.CatmullRomCurve3([start, midpoint, end]),
            96,
            0.6,
            8,
            false
        ),
        new THREE.MeshBasicMaterial({
            color,
            transparent: true,
            opacity: 0.42,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
            depthTest: false,
            side: THREE.DoubleSide
        })
    );
    beam.renderOrder = 10;
    scene.add(beam);

    const connection = {
        startObject,
        endObject,
        line,
        beam,
        segments,
        phase: Math.random() * Math.PI * 2
    };
    galaxyConnections.push(connection);
    return connection;
};

createGalaxyConnection(sun, alienGalaxyCore, 0x20eaff);
createGalaxyConnection(sun, futureGalaxyCore, 0xff32d8);
createGalaxyConnection(alienGalaxyCore, futureGalaxyCore, 0xa66bff);

const updatePortalTunnel = (tunnel, elapsedSeconds) => {
    const start = new THREE.Vector3();
    const end = new THREE.Vector3();
    tunnel.startPortal.getWorldPosition(start);
    tunnel.endPortal.getWorldPosition(end);

    const direction = end.clone().sub(start).normalize();
    const side = new THREE.Vector3(0, 1, 0)
        .cross(direction)
        .normalize();
    if (side.lengthSq() === 0) {
        side.set(1, 0, 0);
    }

    tunnel.lanes.forEach(({ line, offset }, laneIndex) => {
        const positions = line.geometry.attributes.position.array;
        for (let i = 0; i <= tunnel.segments; i++) {
            const progress = i / tunnel.segments;
            const center = start.clone().lerp(end, progress);
            const wave = Math.sin(progress * Math.PI * 6 - elapsedSeconds * 3) * 2.5;
            const point = center
                .add(side.clone().multiplyScalar(offset + wave))
                .add(new THREE.Vector3(
                    0,
                    Math.sin(progress * Math.PI) * 8,
                    0
                ));
            const index = i * 3;
            positions[index] = point.x;
            positions[index + 1] = point.y;
            positions[index + 2] = point.z;
        }
        line.geometry.attributes.position.needsUpdate = true;
        line.material.opacity =
            0.55 + Math.sin(elapsedSeconds * 2 + laneIndex) * 0.2;
    });
};

const updateGalaxyConnection = (connection, elapsedSeconds) => {
    const start = new THREE.Vector3();
    const end = new THREE.Vector3();
    connection.startObject.getWorldPosition(start);
    connection.endObject.getWorldPosition(end);

    const direction = end.clone().sub(start).normalize();
    const side = new THREE.Vector3(0, 1, 0)
        .cross(direction)
        .normalize();
    if (side.lengthSq() === 0) {
        side.set(1, 0, 0);
    }

    const positions = connection.line.geometry.attributes.position.array;
    for (let i = 0; i <= connection.segments; i++) {
        const progress = i / connection.segments;
        const point = start.clone().lerp(end, progress);
        const wave = Math.sin(
            progress * Math.PI * 4 - elapsedSeconds * 1.5 + connection.phase
        ) * 4;
        point.add(side.clone().multiplyScalar(wave));
        point.y += Math.sin(progress * Math.PI) * 12;

        const index = i * 3;
        positions[index] = point.x;
        positions[index + 1] = point.y;
        positions[index + 2] = point.z;
    }
    connection.line.geometry.attributes.position.needsUpdate = true;
    connection.line.material.opacity =
        0.65 + Math.sin(elapsedSeconds * 2 + connection.phase) * 0.2;
};

// 

// =====================================
// 惑星データ
// =====================================

const planets = [];
const selectableBodies = [sun];
const clickableBodies = [
    sun,
    wormhole,
    returnWormhole,
    futureWormhole,
    futureReturnWormhole,
    ...alienPlanets
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
const planetRadiusScale = 0.28;
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
            Math.max(data.radius * planetRadiusScale, 0.22),
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
let wormholeTravel = null;

function focusBody(body) {
    const bodyPosition = new THREE.Vector3();
    body.getWorldPosition(bodyPosition);

    focusOffset.copy(camera.position).sub(controls.target);
    controls.target.copy(bodyPosition);
    camera.position.copy(bodyPosition).add(focusOffset);
    controls.update();
}

function travelThroughWormhole(destinationObject, viewDistance, entryPortal) {
    const destination = new THREE.Vector3();
    const direction = camera.position.clone().sub(controls.target);
    destinationObject.getWorldPosition(destination);
    direction.normalize();

    const connection = portalTunnels.find((tunnel) =>
        tunnel.startPortal === entryPortal ||
        tunnel.endPortal === entryPortal
    );
    const entryPosition = new THREE.Vector3();
    entryPortal.getWorldPosition(entryPosition);

    const exitPortal = connection
        ? connection.startPortal === entryPortal
            ? connection.endPortal
            : connection.startPortal
        : destinationObject;
    const exitPosition = new THREE.Vector3();
    exitPortal.getWorldPosition(exitPosition);

    const tunnelMidpoint = entryPosition
        .clone()
        .lerp(exitPosition, 0.5);
    tunnelMidpoint.y += 18;

    const finalPosition = destination
        .clone()
        .add(direction.multiplyScalar(viewDistance));
    const startPosition = camera.position.clone();
    const tunnelCurve = new THREE.CatmullRomCurve3([
        entryPosition,
        tunnelMidpoint,
        exitPosition
    ]);
    const path = {
        getPointAt: (progress) => {
            if (progress < 0.1) {
                return startPosition.clone().lerp(
                    entryPosition,
                    progress / 0.1
                );
            }

            if (progress < 0.9) {
                return tunnelCurve.getPointAt(
                    (progress - 0.1) / 0.8
                );
            }

            return exitPosition.clone().lerp(
                finalPosition,
                (progress - 0.9) / 0.1
            );
        }
    };

    wormholeTravel = {
        elapsed: 0,
        duration: 2.8,
        path,
        endTarget: destination
    };

    selectedBody = null;
    controls.enabled = false;
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
                [...clickableBodies,...languageStars,...productCards,programGalaxyCore,programWormhole,futureProgramWormhole],
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
                !selectedObject.userData.isGalaxyWormhole &&
                !selectedObject.userData.isFutureWormhole &&
                !selectedObject.userData.isProgramWormhole &&
                !selectedObject.userData.isFutureProgramWormhole &&
                !selectedObject.userData.isProgramGalaxyCore &&
                !selectedObject.userData.isLanguageStar &&
                !selectedObject.userData.isProductCard
            ) {
                selectedObject =
                    selectedObject.parent;
            }

            // 惑星が取得できなかった場合は処理を終了
            if (!selectedObject) {
                return;
            }

            if (selectedObject.userData.isWormhole) {
                travelThroughWormhole(alienGalaxy, 130, selectedObject);
                return;
            }

            if (selectedObject.userData.isGalaxyWormhole) {
                travelThroughWormhole(sun, 135, selectedObject);
                return;
            }

            if (selectedObject.userData.isFutureWormhole) {
                travelThroughWormhole(futureGalaxy, 105, selectedObject);
                return;
            }

            if(selectedObject.userData.isFutureProgramWormhole){travelThroughWormhole(programGalaxy,115,selectedObject);return;}
            if(selectedObject.userData.isProgramWormhole){travelThroughWormhole(futureGalaxy,105,selectedObject);return;}
            if(selectedObject.userData.isLanguageStar){selectLanguageStar(selectedObject);return;}
            if(selectedObject.userData.isProductCard){showProductDetail(selectedObject.userData.productName);return;}
            if(selectedObject.userData.isProgramGalaxyCore){showProgramStatus();return;}
            const selectedPlanet =
                selectedObject;

            // 情報ウィンドウを表示
            displayBodyInfo(selectedPlanet);

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

    portalTunnels.forEach((tunnel) => {
        updatePortalTunnel(tunnel, elapsedSeconds);
    });
    galaxyConnections.forEach((connection) => {
        updateGalaxyConnection(connection, elapsedSeconds);
    });

    galaxyStarfield.rotation.y += deltaSeconds * 0.003;
    galaxyStarfield.rotation.z -= deltaSeconds * 0.0015;
    galaxyStarLayers.forEach((layer, index) => {
        layer.material.opacity =
            (0.55 + index * 0.07) +
            Math.sin(elapsedSeconds * (1.2 + index * 0.3) + index) * 0.1;
    });

    if (wormholeTravel) {
        wormholeTravel.elapsed += deltaSeconds;
        const progress = Math.min(
            wormholeTravel.elapsed / wormholeTravel.duration,
            1
        );
        const easedProgress = 1 - Math.pow(1 - progress, 3);
        const cameraPosition =
            wormholeTravel.path.getPointAt(easedProgress);
        const lookProgress = Math.min(easedProgress + 0.015, 1);
        const pathLookTarget =
            wormholeTravel.path.getPointAt(lookProgress);
        const focusProgress = Math.max(
            0,
            Math.min((easedProgress - 0.7) / 0.3, 1)
        );
        const focusBlend =
            focusProgress * focusProgress * (3 - 2 * focusProgress);
        const lookTarget = pathLookTarget.lerp(
            wormholeTravel.endTarget,
            focusBlend
        );

        camera.position.copy(cameraPosition);
        controls.target.copy(lookTarget);
        controls.update();

        if (progress >= 1) {
            const endTarget = wormholeTravel.endTarget.clone();
            wormholeTravel = null;
            controls.enabled = true;
            controls.target.copy(endTarget);
            return;
        }
    }

    alienGalaxy.rotation.y += deltaSeconds * 0.012;
    alienGalaxyLayers.forEach((layer, index) => {
        layer.rotation.z += deltaSeconds * (0.006 + index * 0.002);
        layer.material.opacity =
            (0.58 + index * 0.08) +
            Math.sin(elapsedSeconds * (1.1 + index * 0.2) + index) * 0.1;
    });
    returnWormhole.rotation.y -= deltaSeconds * 0.18;
        alienPlanets.forEach((planet) => {
            planet.userData.alienAngle +=
                (deltaSeconds * 2 * Math.PI * 2) /
                planet.userData.period;
            planet.position.x =
                Math.cos(planet.userData.alienAngle) *
                planet.userData.alienOrbit;
            planet.position.z =
                Math.sin(planet.userData.alienAngle) *
                planet.userData.alienOrbit;
            planet.rotation.y += deltaSeconds * 0.7;
        });
    returnWormholeRings.forEach((ring, index) => {
        ring.rotation.z += deltaSeconds * (0.3 + index * 0.1);
        ring.material.opacity =
            0.65 + Math.sin(elapsedSeconds * 2 + index) * 0.18;
    });

    futureGalaxy.rotation.y -= deltaSeconds * 0.01;
    futureGalaxyLayers.forEach((layer, index) => {
        layer.rotation.z += deltaSeconds * (0.004 + index * 0.0015);
        layer.material.opacity =
            (0.58 + index * 0.06) +
            Math.sin(elapsedSeconds * (1.1 + index * 0.2) + index) * 0.1;
    });
    futureCity.rotation.y += deltaSeconds * 0.025;
    aquariumBillboards.forEach((billboard, index) => {
        billboard.lookAt(camera.position);
        billboard.material.opacity =
            0.68 + Math.sin(elapsedSeconds * 2.4 + index) * 0.2;
    });
    futureReturnWormhole.rotation.y += deltaSeconds * 0.16;
    futureReturnRings.forEach((ring, index) => {
        ring.rotation.z += deltaSeconds * (0.3 + index * 0.1);
        ring.material.opacity =
            0.65 + Math.sin(elapsedSeconds * 2 + index) * 0.18;
    });
    futureWormhole.rotation.y -= deltaSeconds * 0.14;
    futureWormholeRings.forEach((ring, index) => {
        ring.rotation.z -= deltaSeconds * (0.3 + index * 0.1);
        ring.material.opacity =
            0.65 + Math.sin(elapsedSeconds * 2.2 + index) * 0.2;
    });

    languageLabels.forEach(label=>label.quaternion.copy(camera.quaternion));
    productCards.forEach(card=>card.quaternion.copy(camera.quaternion));
    if(programTransition){
        programTransition.elapsed+=deltaSeconds;
        const progress=Math.min(programTransition.elapsed/programTransition.duration,1);
        if(progress<.45){
            const fade=1-progress/.45;
            programTransition.outgoing.forEach(object=>{const target=object.userData.targetScale||new THREE.Vector3(1,1,1);object.scale.copy(target).multiplyScalar(Math.max(.06,fade));if(object.material)object.material.opacity=fade});
        }else{
            if(!programTransition.built){programTransition.build();programTransition.built=true}
            const appear=Math.min((progress-.45)/.55,1);
            [...languageStars,...languageLabels,...productCards].forEach(object=>{const target=object.userData.targetScale||new THREE.Vector3(1,1,1);object.scale.copy(target).multiplyScalar(.06+.94*appear);if(object.material)object.material.opacity=appear});
        }
        if(progress>=1)programTransition=null;
    }
    wormhole.rotation.y += deltaSeconds * 0.08;
    wormhole.rotation.z -= deltaSeconds * 0.04;
    wormholeDisk.rotation.z += deltaSeconds * 0.6;
    wormholeRings.forEach((ring, index) => {
        ring.rotation.z += deltaSeconds * (0.35 + index * 0.12);
        ring.material.opacity =
            (0.45 + index * 0.16) +
            Math.sin(elapsedSeconds * 2.5 + index) * 0.12;
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