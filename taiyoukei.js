import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xb9d6ee);

const camera = new THREE.PerspectiveCamera(50, innerWidth / innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(innerWidth, innerHeight);
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
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
controls.dampingFactor = 0.06;
controls.minDistance = 28;
controls.maxDistance = 320;
controls.minPolarAngle = 0.08;
controls.maxPolarAngle = Math.PI * 0.49;
controls.screenSpacePanning = false;

scene.add(new THREE.HemisphereLight(0xffffff, 0x52636d, 2.2));
const sun = new THREE.DirectionalLight(0xffffff, 3.1);
sun.position.set(80, 120, 55);
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
sun.shadow.camera.left = -150;
sun.shadow.camera.right = 150;
sun.shadow.camera.top = 120;
sun.shadow.camera.bottom = -120;
scene.add(sun);

const C = {
	floor: 0xd9dcdb,
	court: 0x0b8cad,
	apron: 0xe77e18,
	line: 0xffffff,
	seat: 0x195c93,
	seatAlt: 0x2873aa,
	concrete: 0xaeb4b5,
	stair: 0xc6c9c8,
	wall: 0xe6e8e7,
	wallDark: 0x535b60,
	room: 0xcbd0cf,
	storage: 0xc5b79d,
	service: 0xaebbc1,
	locker: 0xb8c7d8,
	toilet: 0xd4c3d8,
	medical: 0xd8b8b8,
	hall: 0xbfc8c5,
	rail: 0xb8c0c4
};

const model = new THREE.Group();
const clickable = [];
const wallGroup = new THREE.Group();
const roomGroup = new THREE.Group();
const concourseGroup = new THREE.Group();
model.add(roomGroup, concourseGroup, wallGroup);
scene.add(model);

function material(color, options = {}) {
	return new THREE.MeshStandardMaterial({
		color,
		roughness: options.roughness ?? 0.76,
		metalness: options.metalness ?? 0.02,
		transparent: options.transparent ?? false,
		opacity: options.opacity ?? 1
	});
}

function box(parent, name, width, height, depth, x, y, z, color, options = {}) {
	const mesh = new THREE.Mesh(new THREE.BoxGeometry(width, height, depth), material(color, options));
	mesh.position.set(x, y, z);
	mesh.castShadow = options.castShadow ?? true;
	mesh.receiveShadow = options.receiveShadow ?? true;
	mesh.userData = { name, type: options.type ?? "structure" };
	parent.add(mesh);
	if (options.clickable) clickable.push(mesh);
	return mesh;
}

function addLine(points, y, loop = false) {
	const geometry = new THREE.BufferGeometry().setFromPoints(points.map(([x, z]) => new THREE.Vector3(x, y, z)));
	const line = loop
		? new THREE.LineLoop(geometry, new THREE.LineBasicMaterial({ color: C.line }))
		: new THREE.Line(geometry, new THREE.LineBasicMaterial({ color: C.line }));
	model.add(line);
}

function addLabel(text, x, y, z, width = 19) {
	const canvas = document.createElement("canvas");
	canvas.width = 1024;
	canvas.height = 220;
	const context = canvas.getContext("2d");
	context.fillStyle = "rgba(10,35,49,.86)";
	context.fillRect(0, 0, 1024, 220);
	context.strokeStyle = "#60c9ee";
	context.lineWidth = 8;
	context.strokeRect(5, 5, 1014, 210);
	context.fillStyle = "white";
	context.font = "bold 68px sans-serif";
	context.textAlign = "center";
	context.textBaseline = "middle";
	context.fillText(text, 512, 110);
	const texture = new THREE.CanvasTexture(canvas);
	texture.colorSpace = THREE.SRGBColorSpace;
	const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: texture, transparent: true, depthWrite: false }));
	sprite.position.set(x, y, z);
	sprite.scale.set(width, width * 0.215, 1);
	model.add(sprite);
}

function addCourt(name, cx, cz, width, depth) {
	box(model, `${name}外周床`, width + 14, 0.28, depth + 14, cx, 0.14, cz, C.apron, {
		type: "court-apron", clickable: true, roughness: 0.3
	});
	box(model, name, width, 0.31, depth, cx, 0.31, cz, C.court, {
		type: "court", clickable: true, roughness: 0.25
	});
	addLine([[cx-width/2,cz-depth/2],[cx+width/2,cz-depth/2],[cx+width/2,cz+depth/2],[cx-width/2,cz+depth/2]], 0.48, true);
	addLine([[cx,cz-depth/2],[cx,cz+depth/2]], 0.49);
	const ring = new THREE.Mesh(new THREE.RingGeometry(4.1, 4.23, 64), new THREE.MeshBasicMaterial({ color: C.line, side: THREE.DoubleSide }));
	ring.rotation.x = -Math.PI / 2;
	ring.position.set(cx, 0.5, cz);
	model.add(ring);
}

function addSeat(parent, name, x, y, z, rotationY, alternate = false) {
	const group = new THREE.Group();
	const seatColor = alternate ? C.seatAlt : C.seat;
	box(group, name, 0.68, 0.13, 0.62, 0, 0.2, 0.08, seatColor, { type: "seat", clickable: true, castShadow: false });
	box(group, `${name}背もたれ`, 0.68, 0.64, 0.12, 0, 0.5, 0.33, seatColor, { castShadow: false });
	group.position.set(x, y, z);
	group.rotation.y = rotationY;
	parent.add(group);
}

function addStairRail(parent, x, baseY, z, rows, direction, rowDepth, rise) {
	const alongX = direction === "north" || direction === "south";
	for (const side of [-0.56, 0.56]) {
		for (let row = 0; row <= rows; row += 2) {
			const run = row * rowDepth;
			let px = x;
			let pz = z;
			if (alongX) px += side;
			else pz += side;
			if (direction === "north") pz -= run;
			if (direction === "south") pz += run;
			if (direction === "west") px -= run;
			if (direction === "east") px += run;
			box(parent, "階段手すり", 0.07, 1.0, 0.07, px, baseY + row * rise + 0.5, pz, C.rail, { castShadow: false });
		}
	}
}

function addVisibleStand(parent, name, cx, cz, length, rows, direction, options = {}) {
	const group = new THREE.Group();
	group.name = name;
	const pitch = options.pitch ?? 0.91;
	const rowDepth = options.rowDepth ?? 0.92;
	const rise = options.rise ?? 0.5;
	const baseY = options.baseY ?? 0.48;
	const aisleEvery = 12;
	const seatsPerRow = Math.floor(length / pitch);
	const aisleWidth = 1.2;
	const alongX = direction === "north" || direction === "south";

	// 先にコンクリートのスタンドを作る。座席より幅広く、前面が見える形にする。
	for (let row = 0; row < rows; row++) {
		const run = row * rowDepth;
		const tierHeight = 0.22 + row * rise;
		let x = cx;
		let z = cz;
		if (direction === "north") z -= run;
		if (direction === "south") z += run;
		if (direction === "west") x -= run;
		if (direction === "east") x += run;

		const width = alongX ? length + 1.2 : rowDepth + 0.08;
		const depth = alongX ? rowDepth + 0.08 : length + 1.2;
		box(group, `${name}コンクリート段床`, width, tierHeight, depth, x, tierHeight / 2, z, C.concrete, {
			type: "stand", clickable: true, castShadow: false
		});
	}

	// 12席ごとに階段用の明確な空白を取り、段床の上へ階段を重ねる。
	for (let aisle = 1; aisle <= Math.floor(seatsPerRow / aisleEvery); aisle++) {
		const across = (aisle * aisleEvery - (seatsPerRow - 1) / 2) * pitch;
		for (let row = 0; row < rows; row++) {
			const run = row * rowDepth;
			const stepHeight = 0.24 + row * rise;
			let x = cx;
			let z = cz;
			let width = aisleWidth;
			let depth = rowDepth;
			if (alongX) x += across;
			else z += across;
			if (direction === "north") z -= run;
			if (direction === "south") z += run;
			if (direction === "west") { x -= run; width = rowDepth; depth = aisleWidth; }
			if (direction === "east") { x += run; width = rowDepth; depth = aisleWidth; }
			box(group, "12席ごとの観客席階段", width, stepHeight, depth, x, stepHeight / 2 + 0.02, z, C.stair, {
				type: "stairs", clickable: true, castShadow: false
			});
		}
		if (alongX) addStairRail(group, cx + across, baseY, cz, rows, direction, rowDepth, rise);
		else addStairRail(group, cx, baseY, cz + across, rows, direction, rowDepth, rise);
	}

	// 座席は段床の奥寄りに置き、段鼻と階段を隠さない。
	for (let row = 0; row < rows; row++) {
		const run = row * rowDepth;
		const seatY = baseY + row * rise;
		for (let index = 0; index < seatsPerRow; index++) {
			const inAisle = index > 0 && index % aisleEvery === 0;
			if (inAisle) continue;
			const across = (index - (seatsPerRow - 1) / 2) * pitch;
			let x = cx;
			let z = cz;
			let rotation = 0;
			if (direction === "north") { x += across; z -= run; rotation = 0; }
			if (direction === "south") { x += across; z += run; rotation = Math.PI; }
			if (direction === "west") { x -= run; z += across; rotation = Math.PI / 2; }
			if (direction === "east") { x += run; z += across; rotation = -Math.PI / 2; }
			addSeat(group, name, x, seatY, z, rotation, (index + row) % 23 === 0);
		}
	}
	parent.add(group);
	return group;
}

function addRailing(parent, x, y, z, length, direction) {
	const count = Math.max(2, Math.floor(length / 2));
	for (let i = 0; i <= count; i++) {
		const offset = -length / 2 + i * length / count;
		if (direction === "x") box(parent, "手すり", 0.08, 1.1, 0.08, x + offset, y + 0.55, z, C.rail, { castShadow: false });
		else box(parent, "手すり", 0.08, 1.1, 0.08, x, y + 0.55, z + offset, C.rail, { castShadow: false });
	}
	if (direction === "x") box(parent, "手すり", length, 0.08, 0.08, x, y + 1.06, z, C.rail, { castShadow: false });
	else box(parent, "手すり", 0.08, 0.08, length, x, y + 1.06, z, C.rail, { castShadow: false });
}


function addCorridor(name, x, z, width, depth, y = 0, color = C.hall) {
	box(roomGroup, name, width, 0.16, depth, x, y + 0.08, z, color, {
		type: "corridor", clickable: true, castShadow: false
	});
}

function addDoor(name, x, z, rotationY = 0, y = 0) {
	const door = box(roomGroup, name, 1.5, 2.25, 0.12, x, y + 1.125, z, 0x9d7b55, {
		type: "door", clickable: true, castShadow: false
	});
	door.rotation.y = rotationY;
	return door;
}

function addRoom(name, x, z, width, depth, color, y = 0) {
	const h = 3;
	box(roomGroup, name, width, 0.18, depth, x, y + 0.09, z, color, { type: "room", clickable: true });
	box(roomGroup, `${name}北壁`, width, h, 0.22, x, y + h/2, z-depth/2, C.wall);
	box(roomGroup, `${name}南壁`, width, h, 0.22, x, y + h/2, z+depth/2, C.wall);
	box(roomGroup, `${name}西壁`, 0.22, h, depth, x-width/2, y + h/2, z, C.wall);
	box(roomGroup, `${name}東壁`, 0.22, h, depth, x+width/2, y + h/2, z, C.wall);
	addDoor(`${name}出入口`, x, z + depth / 2 + 0.13, 0, y);
}

// 一つの館内空間
box(model, "館内床", 236, 0.5, 144, -8, -0.25, 0, C.floor, { receiveShadow: true });
box(model, "北外壁", 236, 15, 0.8, -8, 7.5, -72, C.wall);
box(model, "南外壁", 236, 15, 0.8, -8, 7.5, 72, C.wall);
box(model, "西外壁", 0.8, 15, 144, -126, 7.5, 0, C.wall);
box(model, "東外壁", 0.8, 15, 144, 110, 7.5, 0, C.wall);

addCourt("メインアリーナ競技面", 25, -1, 58, 36);
addCourt("サブアリーナ競技面", -84, -5, 34, 72);

// 写真の構成に合わせ、長辺側は段床を見せる大規模スタンド。
addVisibleStand(model, "北側メインスタンド", 25, -28, 88, 21, "north");
addVisibleStand(model, "南側メインスタンド", 25, 26, 88, 21, "south");
addVisibleStand(model, "西側メインスタンド", -15, -1, 38, 7, "west");
addVisibleStand(model, "東側メインスタンド", 65, -1, 38, 7, "east");
addVisibleStand(model, "サブアリーナ観覧席", -62, -5, 66, 7, "east");

// 中段通路と手すり
box(concourseGroup, "北側中段コンコース", 94, 0.3, 4.2, 25, 6.2, -50, C.floor, { type: "concourse", clickable: true });
box(concourseGroup, "南側中段コンコース", 94, 0.3, 4.2, 25, 6.2, 48, C.floor, { type: "concourse", clickable: true });
addRailing(concourseGroup, 25, 6.35, -47.8, 94, "x");
addRailing(concourseGroup, 25, 6.35, 45.8, 94, "x");

// 外周諸室と通路。館内図に記載された倉庫・設備室・控室・ロッカー室を細分化。
// 北側サービス帯
addCorridor("北側廊下(2)", 23, -56.5, 112, 4.2);
addRoom("倉庫D", -25, -64, 12, 11, C.storage);
addRoom("配管ヤード北西", -11, -64, 14, 11, C.service);
addRoom("倉庫C", 4, -64, 12, 11, C.storage);
addRoom("配管ヤード北東", 19, -64, 16, 11, C.service);
addRoom("倉庫(4)", 36, -64, 14, 11, C.storage);
addRoom("受水槽室", 53, -64, 18, 11, C.service);
addRoom("倉庫(3)", 69, -64, 12, 11, C.storage);
addRoom("搬入通路前室", 99, -64, 16, 11, C.hall);
addCorridor("搬入通路", 99, -51, 12, 14);
addRoom("ゴミ保管庫", 99, -39, 16, 10, C.storage);

// 東側設備・控室帯
addCorridor("東側廊下(4)", 84, 0, 5, 96);
addRoom("倉庫(2)", 99, -39, 16, 10, C.storage);
addRoom("発電機室", 99, -27, 16, 10, C.service);
addRoom("電気室", 99, -15, 16, 10, C.service);
addRoom("ブロアー室", 99, -3, 16, 10, C.service);
addRoom("制御盤室", 99, 9, 16, 10, C.service);
addRoom("控室(8)", 99, 21, 16, 10, C.room);
addRoom("控室(7)", 99, 33, 16, 10, C.room);
addRoom("控室(6)", 99, 45, 16, 10, C.room);
addCorridor("避難通路(2)", 99, 56, 16, 5);

// 南側選手・運営諸室帯
addCorridor("ロッカー室前通路", 28, 54.5, 94, 4.5);
addRoom("倉庫A", -13, 64, 13, 12, C.storage);
addRoom("配管ヤード南西", 2, 64, 15, 12, C.service);
addRoom("倉庫B", 18, 64, 13, 12, C.storage);
addRoom("配管ヤード南東", 34, 64, 15, 12, C.service);
addRoom("倉庫(1)", 49, 64, 12, 12, C.storage);
addRoom("ロッカールーム(ホーム)", 63, 64, 14, 12, C.locker);

// 玄関・受付・医療・ミックスゾーン
addCorridor("玄関ホール", -4, 66, 18, 10);
addRoom("受付", -15, 65, 8, 10, C.room);
addRoom("応接室", -25, 65, 10, 10, C.room);
addRoom("メディカルルーム", 5, 65, 12, 10, C.medical);
addRoom("ミックスゾーン", 20, 65, 14, 10, C.hall);
addRoom("控室(3)", 36, 65, 12, 10, C.room);
addRoom("控室(5)", 50, 65, 12, 10, C.room);

// 更衣・シャワー・便所
addRoom("女子更衣室", -9, 46, 14, 10, C.locker);
addRoom("男子更衣室", 7, 46, 14, 10, C.locker);
addRoom("シャワー室(1)(2)", 23, 46, 14, 10, C.locker);
addRoom("シャワー室(3)(4)", 39, 46, 14, 10, C.locker);
addRoom("女子便所", 55, 46, 12, 10, C.toilet);
addRoom("男子便所", 67, 46, 10, 10, C.toilet);

// メイン・サブ間のホール
// 壁で囲まれた部屋ではなく、両アリーナをつなぐ大きな連続空間として表現する。
addCorridor("メイン・サブ間大ホール", -40, -4, 26, 104, 0, 0xd3d7d5);

// ホール内には独立した壁・小部屋を置かない。
// 控室と倉庫は大ホールの南端外側へ移動する。
addRoom("控室(1)", -49, 58, 11, 11, C.room);
addRoom("控室(2)", -37, 58, 11, 11, C.room);
addRoom("観覧席身障者用下部倉庫(6)", -25, 58, 11, 11, C.storage);
addCorridor("避難通路(1)", -40, 50, 26, 5);

// サブアリーナ周囲
addRoom("サブアリーナ用具庫", -116, -48, 16, 16, C.storage);
addRoom("サブアリーナ倉庫", -116, 42, 16, 16, C.storage);
addCorridor("サブアリーナ避難通路", -60, -5, 4.5, 86);
addRoom("カーテンダウン室", -55, 48, 10, 8, C.service);

// アリーナと外周通路の壁
for (const z of [-55, 53]) {
	for (const x of [-5, 25, 55]) box(wallGroup, "アリーナと通路の間の壁", 25, 4, 0.35, x, 2, z, C.wallDark, { type: "arena-wall", clickable: true });
}
for (const x of [-28, 80]) {
	for (const z of [-28, -1, 26]) box(wallGroup, "アリーナと通路の間の壁", 0.35, 4, 20, x, 2, z, C.wallDark, { type: "arena-wall", clickable: true });
}

addLabel("メインアリーナ", 25, 12.5, -1, 22);
addLabel("サブアリーナ", -84, 8, -5, 18);

box(scene, "敷地", 300, 0.5, 194, -8, -0.75, 0, 0x98a78f, { receiveShadow: true });
const grid = new THREE.GridHelper(300, 60, 0x637984, 0x94a6ac);
grid.position.set(-8, -0.48, 0);
scene.add(grid);

function setPerspectiveCamera() {
	controls.enabled = false;
	camera.up.set(0, 1, 0);
	camera.position.set(165, 105, 195);
	controls.target.set(-5, 5, 0);
	camera.lookAt(controls.target);
	camera.updateProjectionMatrix();
	controls.update();
	controls.enabled = true;
}

function setTopCamera() {
	controls.enabled = false;
	camera.up.set(0, 1, 0);
	camera.position.set(-8, 240, 0.01);
	controls.target.set(-8, 0, 0);
	camera.lookAt(controls.target);
	camera.updateProjectionMatrix();
	controls.update();
	controls.enabled = true;
}

let wallsVisible = true;
const ui = document.createElement("div");
ui.style.cssText = "position:fixed;top:16px;left:16px;z-index:10;padding:14px 16px;background:rgba(8,24,35,.91);color:white;font-family:sans-serif;border:1px solid #77d7ff;border-radius:10px;max-width:360px";
ui.innerHTML = `<div style="font-size:18px;font-weight:bold;margin-bottom:8px">名古屋金城ふ頭アリーナ</div><div style="font-size:13px;line-height:1.55">東側領域を拡張し、アリーナ横壁・通路・小部屋の重なりを解消</div><div style="display:flex;gap:6px;margin-top:9px;flex-wrap:wrap"><button id="perspective">斜め視点</button><button id="top">真上</button><button id="toggleRooms">諸室を非表示</button><button id="toggleConcourse">通路を非表示</button><button id="toggleWalls">壁を非表示</button></div><div id="info" style="font-size:13px;margin-top:9px;min-height:36px;color:#dff5ff">要素をクリックしてください。</div>`;
document.body.appendChild(ui);
ui.querySelectorAll("button").forEach((button) => button.style.cssText = "padding:7px 11px;border:1px solid #77d7ff;border-radius:6px;background:#15384d;color:white;cursor:pointer");
document.getElementById("perspective").onclick = setPerspectiveCamera;
document.getElementById("top").onclick = setTopCamera;
document.getElementById("toggleRooms").onclick = (event) => { roomGroup.visible = !roomGroup.visible; event.currentTarget.textContent = roomGroup.visible ? "諸室を非表示" : "諸室を表示"; };
document.getElementById("toggleConcourse").onclick = (event) => { concourseGroup.visible = !concourseGroup.visible; event.currentTarget.textContent = concourseGroup.visible ? "通路を非表示" : "通路を表示"; };
document.getElementById("toggleWalls").onclick = (event) => { wallsVisible = !wallsVisible; wallGroup.visible = wallsVisible; event.currentTarget.textContent = wallsVisible ? "壁を非表示" : "壁を表示"; };

const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
const info = document.getElementById("info");
let selected = null;
let oldColor = null;
renderer.domElement.addEventListener("click", (event) => {
	const rect = renderer.domElement.getBoundingClientRect();
	pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
	pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
	raycaster.setFromCamera(pointer, camera);
	const hit = raycaster.intersectObjects(clickable, false)[0];
	if (selected && oldColor !== null) selected.material.color.setHex(oldColor);
	if (!hit) { selected = null; oldColor = null; info.textContent = "要素をクリックしてください。"; return; }
	selected = hit.object;
	oldColor = selected.material.color.getHex();
	selected.material.color.setHex(0xffad38);
	info.innerHTML = `<b>${selected.userData.name}</b><br>種別: ${selected.userData.type}`;
});

window.addEventListener("resize", () => {
	camera.aspect = innerWidth / innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize(innerWidth, innerHeight);
});

setPerspectiveCamera();
function animate() { requestAnimationFrame(animate); controls.update(); renderer.render(scene, camera); }
animate();
