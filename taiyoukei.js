import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

// ============================================================
// 名古屋金城ふ頭アリーナ 館内3Dモデル（連続観客席・改訂版）
// 添付館内図を基にしたWeb表示用の簡易立体モデル
// 寸法と高さは館内図の形状比率から調整した表示用近似値です。
// ============================================================

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xb9d6ee);
scene.fog = new THREE.Fog(0xb9d6ee, 150, 360);

const camera = new THREE.PerspectiveCamera(
	55,
	window.innerWidth / window.innerHeight,
	0.1,
	1000
);
camera.position.set(95, 92, 125);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;
document.body.style.margin = "0";
document.body.style.overflow = "hidden";
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.target.set(0, 8, 0);
controls.maxPolarAngle = Math.PI * 0.49;
controls.minDistance = 25;
controls.maxDistance = 280;

scene.add(new THREE.HemisphereLight(0xffffff, 0x506070, 2.1));
const sunLight = new THREE.DirectionalLight(0xffffff, 3.6);
sunLight.position.set(70, 120, 45);
sunLight.castShadow = true;
sunLight.shadow.mapSize.set(2048, 2048);
sunLight.shadow.camera.left = -120;
sunLight.shadow.camera.right = 120;
sunLight.shadow.camera.top = 120;
sunLight.shadow.camera.bottom = -120;
scene.add(sunLight);

const COLORS = {
	floor: 0xd9d9d4,
	court: 0xcaa66d,
	courtLine: 0xf7f7f7,
	wall: 0xe8e8e5,
	wallEdge: 0x565d63,
	seat: 0x315f83,
	seatAlt: 0x7896ad,
	step: 0x7d858b,
	glass: 0x8fd2eb,
	room: 0xcfd2d0,
	door: 0x9b7953,
	accent: 0x1d607d,
	arenaDark: 0x22272c
};

const arena = new THREE.Group();
scene.add(arena);

const floors = [];
const floorGroups = [];
const clickable = [];
let selectedFloor = 0;

function material(color, roughness = 0.78) {
	return new THREE.MeshStandardMaterial({ color, roughness, metalness: 0.04 });
}

function box(parent, name, width, height, depth, x, y, z, color, options = {}) {
	const mesh = new THREE.Mesh(
		new THREE.BoxGeometry(width, height, depth),
		new THREE.MeshStandardMaterial({
			color,
			roughness: options.roughness ?? 0.78,
			metalness: options.metalness ?? 0.03,
			transparent: options.transparent ?? false,
			opacity: options.opacity ?? 1
		})
	);
	mesh.position.set(x, y, z);
	mesh.castShadow = options.castShadow ?? true;
	mesh.receiveShadow = options.receiveShadow ?? true;
	mesh.userData = { name, floor: options.floor ?? null, type: options.type ?? "structure" };
	parent.add(mesh);
	if (options.clickable) clickable.push(mesh);
	return mesh;
}

function lineLoop(parent, points, y, color = COLORS.courtLine) {
	const geometry = new THREE.BufferGeometry().setFromPoints(
		points.map(([x, z]) => new THREE.Vector3(x, y, z))
	);
	const line = new THREE.LineLoop(
		geometry,
		new THREE.LineBasicMaterial({ color })
	);
	parent.add(line);
	return line;
}

function line(parent, points, y, color = COLORS.courtLine) {
	const geometry = new THREE.BufferGeometry().setFromPoints(
		points.map(([x, z]) => new THREE.Vector3(x, y, z))
	);
	const object = new THREE.Line(
		geometry,
		new THREE.LineBasicMaterial({ color })
	);
	parent.add(object);
	return object;
}

function addTextSprite(parent, text, position, scale = [14, 3.5]) {
	const canvas = document.createElement("canvas");
	canvas.width = 1024;
	canvas.height = 256;
	const context = canvas.getContext("2d");
	context.fillStyle = "rgba(8, 29, 43, 0.86)";
	context.fillRect(0, 0, canvas.width, canvas.height);
	context.strokeStyle = "#77d7ff";
	context.lineWidth = 10;
	context.strokeRect(8, 8, canvas.width - 16, canvas.height - 16);
	context.fillStyle = "white";
	context.font = "bold 76px sans-serif";
	context.textAlign = "center";
	context.textBaseline = "middle";
	context.fillText(text, canvas.width / 2, canvas.height / 2);
	const texture = new THREE.CanvasTexture(canvas);
	texture.colorSpace = THREE.SRGBColorSpace;
	const sprite = new THREE.Sprite(
		new THREE.SpriteMaterial({ map: texture, transparent: true, depthWrite: false })
	);
	sprite.position.set(...position);
	sprite.scale.set(scale[0], scale[1], 1);
	parent.add(sprite);
	return sprite;
}

function addOuterShell(parent, baseY) {
	const h = 3.2;
	box(parent, "北外壁", 120, h, 1.1, 0, baseY + h / 2, -69, COLORS.wall);
	box(parent, "南外壁", 120, h, 1.1, 0, baseY + h / 2, 69, COLORS.wall);
	box(parent, "西外壁", 1.1, h, 138, -60, baseY + h / 2, 0, COLORS.wall);
	box(parent, "東外壁", 1.1, h, 138, 60, baseY + h / 2, 0, COLORS.wall);
	for (let x = -54; x <= 54; x += 12) {
		box(parent, "外周柱", 1.5, 4.2, 1.5, x, baseY + 2.1, -68.6, COLORS.wallEdge);
		box(parent, "外周柱", 1.5, 4.2, 1.5, x, baseY + 2.1, 68.6, COLORS.wallEdge);
	}
	for (let z = -56; z <= 56; z += 14) {
		box(parent, "外周柱", 1.5, 4.2, 1.5, -59.6, baseY + 2.1, z, COLORS.wallEdge);
		box(parent, "外周柱", 1.5, 4.2, 1.5, 59.6, baseY + 2.1, z, COLORS.wallEdge);
	}
}

function addBasketballCourt(parent, y, centerX = 8, centerZ = 0, width = 50, depth = 32) {
	box(parent, "メインアリーナ床", width, 0.35, depth, centerX, y, centerZ, COLORS.court, {
		floor: 1,
		type: "court",
		clickable: true
	});
	const yy = y + 0.2;
	lineLoop(parent, [
		[centerX - width / 2, centerZ - depth / 2],
		[centerX + width / 2, centerZ - depth / 2],
		[centerX + width / 2, centerZ + depth / 2],
		[centerX - width / 2, centerZ + depth / 2]
	], yy);
	line(parent, [[centerX, centerZ - depth / 2], [centerX, centerZ + depth / 2]], yy);
	const circle = new THREE.Mesh(
		new THREE.RingGeometry(4.7, 4.82, 64),
		new THREE.MeshBasicMaterial({ color: COLORS.courtLine, side: THREE.DoubleSide })
	);
	circle.rotation.x = -Math.PI / 2;
	circle.position.set(centerX, yy + 0.01, centerZ);
	parent.add(circle);
	for (const side of [-1, 1]) {
		const x = centerX + side * (width / 2 - 4.5);
		const arc = new THREE.Mesh(
			new THREE.RingGeometry(5.7, 5.82, 32, 1, -Math.PI / 2, Math.PI),
			new THREE.MeshBasicMaterial({ color: COLORS.courtLine, side: THREE.DoubleSide })
		);
		arc.rotation.x = -Math.PI / 2;
		arc.rotation.z = side < 0 ? Math.PI : 0;
		arc.position.set(x, yy + 0.01, centerZ);
		parent.add(arc);
		box(parent, "ゴール支柱", 0.5, 3.8, 0.5, centerX + side * (width / 2 - 1.5), y + 1.9, centerZ, 0x333333);
		box(parent, "バックボード", 0.25, 2.0, 3.4, centerX + side * (width / 2 - 2.3), y + 3.5, centerZ, 0xf3f3f3);
	}
}

function addSeatBlockLegacy(parent, name, x, y, z, rows, columns, direction, floorNo, color = COLORS.seat) {
	const group = new THREE.Group();
	group.name = name;
	for (let row = 0; row < rows; row++) {
		const rise = row * 0.72;
		const run = row * 1.05;
		for (let column = 0; column < columns; column++) {
			let px = x;
			let pz = z;
			const across = (column - (columns - 1) / 2) * 1.28;
			if (direction === "north") {
				px += across;
				pz -= run;
			} else if (direction === "south") {
				px += across;
				pz += run;
			} else if (direction === "west") {
				px -= run;
				pz += across;
			} else {
				px += run;
				pz += across;
			}
			const seat = box(group, name, 0.92, 0.5, 0.92, px, y + rise + 0.25, pz,
				(row + column) % 7 === 0 ? COLORS.seatAlt : color,
				{ floor: floorNo, type: "seat", clickable: true, castShadow: false });
			seat.rotation.y = direction === "west" || direction === "east" ? Math.PI / 2 : 0;
		}
		const stepWidth = direction === "north" || direction === "south" ? columns * 1.28 + 1.0 : 1.0;
		const stepDepth = direction === "north" || direction === "south" ? 0.95 : columns * 1.28 + 1.0;
		let sx = x;
		let sz = z;
		if (direction === "north") sz -= run;
		if (direction === "south") sz += run;
		if (direction === "west") sx -= run;
		if (direction === "east") sx += run;
		box(group, `${name}段床`, stepWidth, 0.14, stepDepth, sx, y + rise, sz, COLORS.step, {
			castShadow: false
		});
	}
	parent.add(group);
	return group;
}


// ============================================================
// 連続観客席
// 3F平面図のように、中央アリーナを囲む一体形の観客席を生成します。
// 直線4辺と四隅を同じ段高・同じピッチで連結しています。
// ============================================================
function addContinuousArenaSeats(parent, floorNo, baseY, options = {}) {
	const group = new THREE.Group();
	group.name = `${floorNo}F連続観客席`;
	const rows = options.rows ?? 8;
	const innerHalfX = options.innerHalfX ?? 32;
	const innerHalfZ = options.innerHalfZ ?? 24;
	const seatPitch = options.seatPitch ?? 1.28;
	const rowDepth = options.rowDepth ?? 1.08;
	const rowRise = options.rowRise ?? 0.66;
	const cornerRadius = options.cornerRadius ?? 5.2;
	const seatColor = options.color ?? COLORS.seat;

	const seatGeometry = new THREE.BoxGeometry(0.92, 0.5, 0.92);
	const seatMaterials = [
		new THREE.MeshStandardMaterial({ color: seatColor, roughness: 0.78 }),
		new THREE.MeshStandardMaterial({ color: COLORS.seatAlt, roughness: 0.78 })
	];

	function createSeat(x, y, z, rotationY, index) {
		const seat = new THREE.Mesh(seatGeometry, seatMaterials[index % 13 === 0 ? 1 : 0]);
		seat.position.set(x, y, z);
		seat.rotation.y = rotationY;
		seat.castShadow = false;
		seat.receiveShadow = true;
		seat.userData = {
			name: `${floorNo}F連続観客席`,
			floor: floorNo,
			type: "seat"
		};
		group.add(seat);
		clickable.push(seat);
	}

	let seatIndex = 0;
	for (let row = 0; row < rows; row++) {
		const offset = row * rowDepth;
		const y = baseY + row * rowRise + 0.28;
		const halfX = innerHalfX + offset;
		const halfZ = innerHalfZ + offset;

		// 北側と南側を端まで連続配置
		const horizontalCount = Math.floor((halfX * 2 - cornerRadius * 2) / seatPitch);
		for (let i = 0; i <= horizontalCount; i++) {
			const x = -halfX + cornerRadius + i * ((halfX * 2 - cornerRadius * 2) / horizontalCount);
			createSeat(x, y, -halfZ, 0, seatIndex++);
			createSeat(x, y, halfZ, Math.PI, seatIndex++);
		}

		// 西側と東側を端まで連続配置
		const verticalCount = Math.floor((halfZ * 2 - cornerRadius * 2) / seatPitch);
		for (let i = 0; i <= verticalCount; i++) {
			const z = -halfZ + cornerRadius + i * ((halfZ * 2 - cornerRadius * 2) / verticalCount);
			createSeat(-halfX, y, z, Math.PI / 2, seatIndex++);
			createSeat(halfX, y, z, -Math.PI / 2, seatIndex++);
		}

		// 四隅。角にも切れ目ができないよう円弧状に接続
		const corners = [
			{ cx: -halfX + cornerRadius, cz: -halfZ + cornerRadius, start: Math.PI, end: Math.PI * 1.5 },
			{ cx: halfX - cornerRadius, cz: -halfZ + cornerRadius, start: Math.PI * 1.5, end: Math.PI * 2 },
			{ cx: halfX - cornerRadius, cz: halfZ - cornerRadius, start: 0, end: Math.PI * 0.5 },
			{ cx: -halfX + cornerRadius, cz: halfZ - cornerRadius, start: Math.PI * 0.5, end: Math.PI }
		];
		const arcCount = Math.max(5, Math.ceil((Math.PI * cornerRadius / 2) / seatPitch));
		corners.forEach((corner) => {
			for (let i = 0; i <= arcCount; i++) {
				const angle = corner.start + (corner.end - corner.start) * (i / arcCount);
				const x = corner.cx + Math.cos(angle) * cornerRadius;
				const z = corner.cz + Math.sin(angle) * cornerRadius;
				const faceAngle = Math.atan2(-x, -z);
				createSeat(x, y, z, faceAngle, seatIndex++);
			}
		});

		// 各段を一体に見せる連続段床
		const outerShape = new THREE.Shape();
		outerShape.moveTo(-halfX - 0.55, -halfZ - 0.55);
		outerShape.lineTo(halfX + 0.55, -halfZ - 0.55);
		outerShape.lineTo(halfX + 0.55, halfZ + 0.55);
		outerShape.lineTo(-halfX - 0.55, halfZ + 0.55);
		outerShape.closePath();
		const hole = new THREE.Path();
		hole.moveTo(-halfX + 0.55, -halfZ + 0.55);
		hole.lineTo(-halfX + 0.55, halfZ - 0.55);
		hole.lineTo(halfX - 0.55, halfZ - 0.55);
		hole.lineTo(halfX - 0.55, -halfZ + 0.55);
		hole.closePath();
		outerShape.holes.push(hole);
		const step = new THREE.Mesh(
			new THREE.ExtrudeGeometry(outerShape, { depth: 0.14, bevelEnabled: false }),
			new THREE.MeshStandardMaterial({ color: COLORS.step, roughness: 0.85 })
		);
		step.rotation.x = Math.PI / 2;
		step.position.y = baseY + row * rowRise;
		step.receiveShadow = true;
		group.add(step);
	}
	parent.add(group);
	return group;
}

function addRoom(parent, name, x, z, width, depth, y, floorNo) {
	box(parent, name, width, 0.22, depth, x, y, z, COLORS.room, {
		floor: floorNo,
		type: "room",
		clickable: true
	});
	const h = 3.0;
	box(parent, `${name}北壁`, width, h, 0.28, x, y + h / 2, z - depth / 2, COLORS.wall);
	box(parent, `${name}南壁`, width, h, 0.28, x, y + h / 2, z + depth / 2, COLORS.wall);
	box(parent, `${name}西壁`, 0.28, h, depth, x - width / 2, y + h / 2, z, COLORS.wall);
	box(parent, `${name}東壁`, 0.28, h, depth, x + width / 2, y + h / 2, z, COLORS.wall);
}

function addStairs(parent, x, y, z, width, depth, rotation = 0) {
	const group = new THREE.Group();
	const steps = 11;
	for (let i = 0; i < steps; i++) {
		box(group, "階段", width, 0.22 + i * 0.25, depth / steps,
			0, (0.22 + i * 0.25) / 2, -depth / 2 + (i + 0.5) * depth / steps,
			COLORS.step);
	}
	group.position.set(x, y, z);
	group.rotation.y = rotation;
	parent.add(group);
}

function buildFirstFloor() {
	const group = new THREE.Group();
	group.name = "1F";
	const y = 0;
	box(group, "1F床", 120, 0.5, 138, 0, y - 0.25, 0, COLORS.floor, { receiveShadow: true });
	addOuterShell(group, y);
	addBasketballCourt(group, y + 0.15, 12, -4, 54, 34);
	box(group, "サブアリーナ", 36, 0.32, 66, -39, y + 0.16, -17, 0xd7b27b, {
		floor: 1, type: "court", clickable: true
	});
	lineLoop(group, [[-57, -50], [-21, -50], [-21, 16], [-57, 16]], y + 0.34);
	addContinuousArenaSeats(group, 1, y + 0.4, {
		rows: 4, innerHalfX: 29, innerHalfZ: 20, cornerRadius: 4.6
	});
	addRoom(group, "会議室・控室群", -6, -58, 47, 16, y + 0.12, 1);
	addRoom(group, "受水槽室", 39, -59, 15, 14, y + 0.12, 1);
	addRoom(group, "電気室・管理諸室", 51, 23, 15, 82, y + 0.12, 1);
	addRoom(group, "ミーティング・更衣室群", 10, 58, 66, 17, y + 0.12, 1);
	addRoom(group, "器材庫", -15, 31, 18, 11, y + 0.12, 1);
	addStairs(group, -49, y, 52, 10, 14, 0);
	addStairs(group, 54, y, -56, 7, 13, 0);
	addTextSprite(group, "1F メインアリーナ", [12, 7.5, -4], [22, 4.2]);
	addTextSprite(group, "サブアリーナ", [-39, 5.5, -17], [18, 3.5]);
	return group;
}

function buildSecondFloor() {
	const group = new THREE.Group();
	group.name = "2F";
	const y = 8;
	box(group, "2F回廊床", 120, 0.38, 138, 0, y, 0, 0xc7cbcb, { transparent: true, opacity: 0.92 });
	box(group, "メインアリーナ吹抜", 62, 0.5, 48, 11, y + 0.05, -2, 0x15191c, { transparent: true, opacity: 0.12 });
	box(group, "サブアリーナ吹抜", 38, 0.5, 70, -39, y + 0.05, -16, 0x15191c, { transparent: true, opacity: 0.12 });
	addOuterShell(group, y);
	addContinuousArenaSeats(group, 2, y + 0.25, {
		rows: 7, innerHalfX: 32, innerHalfZ: 24, cornerRadius: 5.2
	});
	addRoom(group, "2F会議室・放送関係室", 3, -59, 45, 15, y + 0.15, 2);
	addRoom(group, "2Fロビー・共用部", 43, 28, 16, 64, y + 0.15, 2);
	addRoom(group, "2F更衣室・便所群", 7, 58, 58, 16, y + 0.15, 2);
	addStairs(group, -48, y, 53, 10, 14, 0);
	addStairs(group, 54, y, -55, 7, 13, 0);
	addTextSprite(group, "2F 観客席・回廊", [10, 16, -2], [23, 4.2]);
	return group;
}

function buildThirdFloor() {
	const group = new THREE.Group();
	group.name = "3F";
	const y = 16;
	box(group, "3F床", 120, 0.38, 138, 0, y, 0, 0xc4c8c7, { transparent: true, opacity: 0.94 });
	box(group, "アリーナ上部吹抜", 62, 0.45, 49, 11, y + 0.05, -2, 0x101315, { transparent: true, opacity: 0.12 });
	addOuterShell(group, y);
	addContinuousArenaSeats(group, 3, y + 0.25, {
		rows: 10, innerHalfX: 32, innerHalfZ: 24, cornerRadius: 5.4, color: 0x274d70
	});
	addRoom(group, "3F吹抜・展示上部", -42, -12, 31, 76, y + 0.12, 3);
	addRoom(group, "3F空調機械室", 52, -39, 13, 36, y + 0.12, 3);
	addRoom(group, "3F空調機械室", 52, 42, 13, 35, y + 0.12, 3);
	addStairs(group, -48, y, 53, 10, 14, 0);
	addStairs(group, 54, y, -55, 7, 13, 0);
	addTextSprite(group, "3F 上段観客席", [10, 25, -2], [23, 4.2]);
	return group;
}

floorGroups.push(buildFirstFloor(), buildSecondFloor(), buildThirdFloor());
floorGroups.forEach((group, index) => {
	arena.add(group);
	floors.push({ name: `${index + 1}F`, group });
});

// 建物外周のガラス表現
const glassMaterial = new THREE.MeshPhysicalMaterial({
	color: COLORS.glass,
	transparent: true,
	opacity: 0.17,
	roughness: 0.22,
	metalness: 0.02,
	side: THREE.DoubleSide,
	depthWrite: false
});
const glassShell = new THREE.Mesh(new THREE.BoxGeometry(122, 27, 140), glassMaterial);
glassShell.position.y = 13;
scene.add(glassShell);

// 敷地
box(scene, "敷地", 190, 0.6, 190, 0, -0.65, 0, 0x93a38d, { receiveShadow: true });
const grid = new THREE.GridHelper(190, 38, 0x60737d, 0x91a4ad);
grid.position.y = -0.32;
scene.add(grid);

// ============================================================
// UI
// ============================================================
const ui = document.createElement("div");
ui.style.cssText = `
	position:fixed;top:16px;left:16px;z-index:10;
	padding:14px 16px;background:rgba(8,24,35,.90);color:white;
	font-family:sans-serif;border:1px solid #77d7ff;border-radius:10px;
	box-shadow:0 8px 30px rgba(0,0,0,.28);max-width:330px;
`;
ui.innerHTML = `
	<div style="font-weight:bold;font-size:18px;margin-bottom:10px;">名古屋金城ふ頭アリーナ</div>
	<div style="font-size:13px;line-height:1.6;margin-bottom:10px;">ドラッグ：回転　ホイール：拡大縮小<br>座席・部屋・コート：クリックで情報表示</div>
	<div style="display:flex;gap:6px;flex-wrap:wrap;">
		<button data-floor="0">全階表示</button>
		<button data-floor="1">1F</button>
		<button data-floor="2">2F</button>
		<button data-floor="3">3F</button>
		<button id="explode">階層分解</button>
	</div>
	<div id="arenaInfo" style="margin-top:10px;min-height:42px;font-size:13px;color:#dff5ff;">館内要素をクリックしてください。</div>
`;
document.body.appendChild(ui);

ui.querySelectorAll("button").forEach((button) => {
	button.style.cssText = "padding:7px 10px;border:1px solid #77d7ff;border-radius:6px;background:#15384d;color:white;cursor:pointer;";
});

function showFloor(mode) {
	selectedFloor = mode;
	camera.up.set(0, 1, 0);
	floorGroups.forEach((group, index) => {
		group.visible = mode === 0 || mode === index + 1;
	});
	glassShell.visible = mode === 0;
	if (mode === 1) {
		camera.position.set(88, 62, 105);
		controls.target.set(0, 2, 0);
	} else if (mode === 2) {
		camera.position.set(88, 70, 105);
		controls.target.set(0, 10, 0);
	} else if (mode === 3) {
		camera.position.set(0, 155, 0.01);
		camera.up.set(0, 0, -1);
		controls.target.set(0, 18, 0);
	} else {
		camera.position.set(95, 92, 125);
		controls.target.set(0, 8, 0);
	}
}

ui.querySelectorAll("[data-floor]").forEach((button) => {
	button.addEventListener("click", () => showFloor(Number(button.dataset.floor)));
});

let exploded = false;
document.getElementById("explode").addEventListener("click", () => {
	exploded = !exploded;
	floorGroups[0].position.x = exploded ? -46 : 0;
	floorGroups[1].position.x = 0;
	floorGroups[2].position.x = exploded ? 46 : 0;
	glassShell.visible = !exploded && selectedFloor === 0;
	document.getElementById("explode").textContent = exploded ? "通常配置" : "階層分解";
});

const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
const info = document.getElementById("arenaInfo");
let highlight = null;
let oldColor = null;

renderer.domElement.addEventListener("click", (event) => {
	if (event.target !== renderer.domElement) return;
	const rect = renderer.domElement.getBoundingClientRect();
	pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
	pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
	raycaster.setFromCamera(pointer, camera);
	const visibleObjects = clickable.filter((object) => object.visible && object.parent?.visible !== false);
	const hit = raycaster.intersectObjects(visibleObjects, false)[0];
	if (highlight && oldColor !== null) {
		highlight.material.color.setHex(oldColor);
	}
	if (!hit) {
		highlight = null;
		oldColor = null;
		info.textContent = "館内要素をクリックしてください。";
		return;
	}
	highlight = hit.object;
	oldColor = highlight.material.color.getHex();
	highlight.material.color.setHex(0xffb340);
	const floorText = highlight.userData.floor ? `${highlight.userData.floor}F / ` : "";
	info.innerHTML = `<b>${floorText}${highlight.userData.name}</b><br>種別：${highlight.userData.type}`;
});

window.addEventListener("resize", () => {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize(window.innerWidth, window.innerHeight);
});

const clock = new THREE.Clock();
function animate() {
	requestAnimationFrame(animate);
	controls.update(clock.getDelta());
	renderer.render(scene, camera);
}
animate();
