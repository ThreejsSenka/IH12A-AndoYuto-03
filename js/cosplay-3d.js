/**
 * RE:CREATION 2026 - WebGL Three.js Professional 3D Photo Studio & Lighting Rig
 * 【案2】プロ仕様 3Dスタジオ・フォトセッション ＆ 立体照明機材 ＆ 左右両端の色単色コスプレキャラクター
 *
 * 1. 背景は端寄り設計：中央はクリーンゾーンで文字可読性100%死守、要素はすべて画面左右両端へ配置
 * 2. 左端：シアン単色（#00D2FF）3D剣士ヒーロー（アーマー、なびくマント、突き立てた長剣、足元スポット）
 * 3. 右端：ゴールド単色（#FEC838）3Dヒロインアイドル（ツインテール、フレアドレス、掲げた星のステッキ、足元スポット）
 * 4. 左右外周：プロ仕様Cスタンド ＆ オクタゴン／角型ソフトボックス照明機材
 * 5. リアルタイム・カメラフラッシュ（PointLightの瞬間急激発光 ＋ 3Dキャラクター輪郭連動輝度ブースト）
 * 6. 簡素で上品なアニメーション（呼吸アイドリング、マントの風の揺らぎ、星の自転、滑らかなマウスパララックス）
 */

(function () {
  "use strict";

  if (typeof THREE === "undefined") {
    console.warn("Three.js is not loaded.");
    return;
  }

  const container = document.getElementById("cosplay-studio-container");
  const canvas = document.getElementById("cosplay-studio-canvas");
  if (!container || !canvas) return;

  // -------------------------------------------------------------
  // 1. Scene, Camera, WebGL Renderer
  // -------------------------------------------------------------
  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x061b2c, 0.024);

  let width = container.clientWidth || window.innerWidth;
  let height = container.clientHeight || window.innerHeight;

  const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 120);
  camera.position.set(0, 2.6, 14.2);

  const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true,
    alpha: true,
    powerPreference: "high-performance"
  });
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.25;

  // -------------------------------------------------------------
  // 2. Studio Lighting Environment (ベース照明)
  // -------------------------------------------------------------
  // 深みのあるシアンアンビエント
  const ambientLight = new THREE.AmbientLight(0x0e3554, 2.2);
  scene.add(ambientLight);

  // 天井トップライト（スカイライト）
  const topLight = new THREE.DirectionalLight(0xbde8ff, 1.4);
  topLight.position.set(0, 16, 4);
  scene.add(topLight);

  // -------------------------------------------------------------
  // 3. ホリゾント・サイクロラマ背景曲面（Cyclorama Studio Wall）
  // 端寄りの視界を支える、床から壁へ滑らかに立ち上がるシームレス曲面
  // -------------------------------------------------------------
  function createCycloramaMesh() {
    const segmentsX = 48;
    const segmentsY = 48;
    const w = 52;
    const floorDepth = 15;
    const wallHeight = 20;
    const curveRadius = 5.5;

    const geo = new THREE.PlaneGeometry(w, floorDepth + wallHeight, segmentsX, segmentsY);
    const pos = geo.attributes.position;

    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const v = pos.getY(i) + (floorDepth + wallHeight) * 0.5;

      let y = 0;
      let z = 0;

      if (v < floorDepth - curveRadius) {
        y = 0;
        z = -(v - (floorDepth * 0.5));
      } else if (v <= floorDepth) {
        const theta = ((v - (floorDepth - curveRadius)) / curveRadius) * (Math.PI * 0.5);
        y = curveRadius * (1 - Math.cos(theta));
        z = -((floorDepth - curveRadius) - (floorDepth * 0.5)) - curveRadius * Math.sin(theta);
      } else {
        const wallV = v - floorDepth;
        y = curveRadius + wallV;
        z = -((floorDepth - curveRadius) - (floorDepth * 0.5)) - curveRadius;
      }

      pos.setXYZ(i, x, y, z);
    }
    geo.computeVertexNormals();

    const mat = new THREE.MeshStandardMaterial({
      color: 0x071e33,
      roughness: 0.32,
      metalness: 0.55,
      side: THREE.DoubleSide
    });

    const mesh = new THREE.Mesh(geo, mat);
    mesh.receiveShadow = true;
    mesh.position.set(0, -0.2, 0);
    return mesh;
  }

  const cyclorama = createCycloramaMesh();
  scene.add(cyclorama);

  // -------------------------------------------------------------
  // 4. 端寄り配置用：左右の足元ステージング ＆ スポットライト
  // -------------------------------------------------------------
  function createCharPodium(colorHex) {
    const group = new THREE.Group();

    // アクリル円形ステージ
    const geo = new THREE.CylinderGeometry(1.6, 1.8, 0.12, 32);
    const mat = new THREE.MeshStandardMaterial({
      color: 0x092842,
      roughness: 0.15,
      metalness: 0.90
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.y = 0.06;
    mesh.receiveShadow = true;
    group.add(mesh);

    // 外周ネオンリング
    const ringGeo = new THREE.TorusGeometry(1.65, 0.025, 16, 48);
    const ringMat = new THREE.MeshBasicMaterial({ color: colorHex });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.PI / 2;
    ring.position.y = 0.125;
    group.add(ring);

    // 足元照射の小型スポットライト
    const spot = new THREE.SpotLight(colorHex, 5.0, 9, Math.PI / 5, 0.5, 1.8);
    spot.position.set(0, 4.5, 0.8);
    spot.target = mesh;
    spot.castShadow = true;
    group.add(spot);

    return group;
  }

  // -------------------------------------------------------------
  // 5. 【左端】：シアン単色 3D剣士ヒーロー（Cyan Knight Hero）
  // -------------------------------------------------------------
  const cyanCharGroup = new THREE.Group();
  scene.add(cyanCharGroup);

  const leftPodium = createCharPodium(0x00d2ff);
  cyanCharGroup.add(leftPodium);

  // シアン単色マテリアル群
  const cyanArmorMat = new THREE.MeshStandardMaterial({
    color: 0x00d2ff,
    emissive: 0x006688,
    emissiveIntensity: 0.35,
    roughness: 0.22,
    metalness: 0.85
  });
  const cyanGlowMat = new THREE.MeshStandardMaterial({
    color: 0xa8f2ff,
    emissive: 0x00d2ff,
    emissiveIntensity: 0.85,
    roughness: 0.1,
    metalness: 0.9
  });
  const cyanBladeMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    emissive: 0x00d2ff,
    emissiveIntensity: 0.75,
    roughness: 0.08,
    metalness: 0.95
  });

  // キャラクター本体アセンブリ
  const cyanBody = new THREE.Group();
  cyanCharGroup.add(cyanBody);

  // 脚部（Aスタンスで堂々と立つ）
  const legLGeo = new THREE.CylinderGeometry(0.14, 0.11, 1.3, 12);
  const legL = new THREE.Mesh(legLGeo, cyanArmorMat);
  legL.position.set(-0.35, 0.72, 0);
  legL.rotation.z = 0.08;
  legL.castShadow = true;
  cyanBody.add(legL);

  const legRGeo = new THREE.CylinderGeometry(0.14, 0.11, 1.3, 12);
  const legR = new THREE.Mesh(legRGeo, cyanArmorMat);
  legR.position.set(0.35, 0.72, 0);
  legR.rotation.z = -0.08;
  legR.castShadow = true;
  cyanBody.add(legR);

  // ブーツ・足先
  const footLGeo = new THREE.BoxGeometry(0.22, 0.16, 0.42);
  const footL = new THREE.Mesh(footLGeo, cyanArmorMat);
  footL.position.set(-0.41, 0.15, 0.08);
  cyanBody.add(footL);

  const footRGeo = new THREE.BoxGeometry(0.22, 0.16, 0.42);
  const footR = new THREE.Mesh(footRGeo, cyanArmorMat);
  footR.position.set(0.41, 0.15, 0.08);
  cyanBody.add(footR);

  // 腰・タセットアーマー
  const waistGeo = new THREE.CylinderGeometry(0.38, 0.32, 0.35, 8);
  const waist = new THREE.Mesh(waistGeo, cyanArmorMat);
  waist.position.set(0, 1.45, 0);
  waist.castShadow = true;
  cyanBody.add(waist);

  // 胸部チェストアーマー（逆三角形のヒーロートルソ）
  const chestGeo = new THREE.CylinderGeometry(0.55, 0.36, 0.75, 8);
  const chest = new THREE.Mesh(chestGeo, cyanArmorMat);
  chest.position.set(0, 1.95, 0);
  chest.castShadow = true;
  cyanBody.add(chest);

  // 胸部コアグロー
  const coreGeo = new THREE.OctahedronGeometry(0.14, 0);
  const core = new THREE.Mesh(coreGeo, cyanGlowMat);
  core.position.set(0, 1.98, 0.34);
  cyanBody.add(core);

  // 肩アーマー（ポールドロン）
  const paulLGeo = new THREE.BoxGeometry(0.38, 0.32, 0.38);
  const paulL = new THREE.Mesh(paulLGeo, cyanArmorMat);
  paulL.position.set(-0.68, 2.22, 0);
  paulL.rotation.z = 0.22;
  paulL.castShadow = true;
  cyanBody.add(paulL);

  const paulRGeo = new THREE.BoxGeometry(0.38, 0.32, 0.38);
  const paulR = new THREE.Mesh(paulRGeo, cyanArmorMat);
  paulR.position.set(0.68, 2.22, 0);
  paulR.rotation.z = -0.22;
  paulR.castShadow = true;
  cyanBody.add(paulR);

  // 頭部＆バイザーヘルメット
  const headGeo = new THREE.SphereGeometry(0.24, 16, 16);
  const head = new THREE.Mesh(headGeo, cyanArmorMat);
  head.position.set(0, 2.55, 0);
  head.castShadow = true;
  cyanBody.add(head);

  // ヘルメット角飾り（スタイリッシュクレスト）
  const crestGeo = new THREE.ConeGeometry(0.08, 0.45, 6);
  crestGeo.rotateX(Math.PI / 4.5);
  const crest = new THREE.Mesh(crestGeo, cyanGlowMat);
  crest.position.set(0, 2.78, -0.06);
  cyanBody.add(crest);

  // バイザー発光ライン
  const visorGeo = new THREE.BoxGeometry(0.32, 0.08, 0.16);
  const visor = new THREE.Mesh(visorGeo, cyanGlowMat);
  visor.position.set(0, 2.54, 0.18);
  cyanBody.add(visor);

  // 右腕（腰に手を当てて構える）
  const armR1 = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.09, 0.55, 8), cyanArmorMat);
  armR1.position.set(0.66, 1.88, 0.08);
  armR1.rotation.z = -0.55;
  cyanBody.add(armR1);

  const armR2 = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.08, 0.5, 8), cyanArmorMat);
  armR2.position.set(0.52, 1.52, 0.22);
  armR2.rotation.z = 0.75;
  cyanBody.add(armR2);

  // 左腕（前方に伸ばし、大剣の柄を握る）
  const armL1 = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.09, 0.55, 8), cyanArmorMat);
  armL1.position.set(-0.66, 1.92, 0.15);
  armL1.rotation.z = 0.45;
  armL1.rotation.x = -0.35;
  cyanBody.add(armL1);

  const armL2 = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.08, 0.5, 8), cyanArmorMat);
  armL2.position.set(-0.52, 1.55, 0.48);
  armL2.rotation.x = -0.75;
  cyanBody.add(armL2);

  // 構えた長剣（大剣: Greatsword）
  const swordGroup = new THREE.Group();
  swordGroup.position.set(-0.48, 1.42, 0.65);
  cyanBody.add(swordGroup);

  // 鍔（ガード）
  const guardGeo = new THREE.BoxGeometry(0.52, 0.08, 0.14);
  const guard = new THREE.Mesh(guardGeo, cyanGlowMat);
  swordGroup.add(guard);

  // グリップ ＆ ポンメル
  const gripGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.35, 8);
  const grip = new THREE.Mesh(gripGeo, cyanArmorMat);
  grip.position.y = 0.2;
  swordGroup.add(grip);

  const pommelGeo = new THREE.SphereGeometry(0.07, 8, 8);
  const pommel = new THREE.Mesh(pommelGeo, cyanGlowMat);
  pommel.position.y = 0.38;
  swordGroup.add(pommel);

  // 刃（地面に突き立てる）
  const bladeGeo = new THREE.BoxGeometry(0.16, 1.35, 0.04);
  const blade = new THREE.Mesh(bladeGeo, cyanBladeMat);
  blade.position.y = -0.7;
  blade.castShadow = true;
  swordGroup.add(blade);

  // 風になびく3Dマント（左外側へ大きく翻る）
  const capeGeo = new THREE.PlaneGeometry(1.2, 1.9, 12, 16);
  const capeMat = new THREE.MeshStandardMaterial({
    color: 0x00b4d8,
    emissive: 0x004866,
    emissiveIntensity: 0.3,
    roughness: 0.4,
    side: THREE.DoubleSide
  });
  const cape = new THREE.Mesh(capeGeo, capeMat);
  cape.position.set(-0.35, 1.35, -0.22);
  cape.rotation.y = 0.35;
  cape.rotation.z = -0.25;
  cape.castShadow = true;
  cyanBody.add(cape);

  // -------------------------------------------------------------
  // 6. 【右端】：ゴールド単色 3Dヒロインアイドル（Gold Heroine Idol）
  // -------------------------------------------------------------
  const goldCharGroup = new THREE.Group();
  scene.add(goldCharGroup);

  const rightPodium = createCharPodium(0xfec838);
  goldCharGroup.add(rightPodium);

  // ゴールド単色マテリアル群
  const goldArmorMat = new THREE.MeshStandardMaterial({
    color: 0xfec838,
    emissive: 0x805d00,
    emissiveIntensity: 0.35,
    roughness: 0.20,
    metalness: 0.88
  });
  const goldGlowMat = new THREE.MeshStandardMaterial({
    color: 0xfff0b3,
    emissive: 0xfec838,
    emissiveIntensity: 0.85,
    roughness: 0.1,
    metalness: 0.9
  });

  const goldBody = new THREE.Group();
  goldCharGroup.add(goldBody);

  // すらりと伸びた脚部
  const gLegL = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.08, 1.25, 12), goldArmorMat);
  gLegL.position.set(-0.25, 0.7, 0);
  gLegL.rotation.z = 0.05;
  gLegL.castShadow = true;
  goldBody.add(gLegL);

  const gLegR = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.08, 1.25, 12), goldArmorMat);
  gLegR.position.set(0.25, 0.7, 0);
  gLegR.rotation.z = -0.05;
  gLegR.castShadow = true;
  goldBody.add(gLegR);

  // ブーツ
  const gFootL = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.14, 0.35), goldArmorMat);
  gFootL.position.set(-0.28, 0.14, 0.06);
  goldBody.add(gFootL);

  const gFootR = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.14, 0.35), goldArmorMat);
  gFootR.position.set(0.28, 0.14, 0.06);
  goldBody.add(gFootR);

  // ふわりと広がるフレアドレススカート（優雅なプリーツ形状）
  const skirtGeo = new THREE.CylinderGeometry(0.3, 0.95, 0.7, 16, 1, true);
  const skirtMat = new THREE.MeshStandardMaterial({
    color: 0xfec838,
    emissive: 0x805d00,
    emissiveIntensity: 0.3,
    roughness: 0.25,
    metalness: 0.75,
    side: THREE.DoubleSide
  });
  const skirt = new THREE.Mesh(skirtGeo, skirtMat);
  skirt.position.set(0, 1.35, 0);
  skirt.castShadow = true;
  goldBody.add(skirt);

  // ウエスト・ビスチェ
  const corsetGeo = new THREE.CylinderGeometry(0.34, 0.28, 0.55, 12);
  const corset = new THREE.Mesh(corsetGeo, goldArmorMat);
  corset.position.set(0, 1.82, 0);
  corset.castShadow = true;
  goldBody.add(corset);

  // 胸部リボン＆星ブローチ
  const broochGeo = new THREE.OctahedronGeometry(0.12, 0);
  const brooch = new THREE.Mesh(broochGeo, goldGlowMat);
  brooch.position.set(0, 1.95, 0.32);
  goldBody.add(brooch);

  // 頭部
  const gHead = new THREE.Mesh(new THREE.SphereGeometry(0.22, 16, 16), goldArmorMat);
  gHead.position.set(0, 2.42, 0);
  gHead.castShadow = true;
  goldBody.add(gHead);

  // 可憐なツインテール（左右に大きく外側へと弧を描く）
  function createTwintail(isLeft) {
    const tailGroup = new THREE.Group();
    const count = 4;
    for (let i = 0; i < count; i++) {
      const segGeo = new THREE.CylinderGeometry(0.12 - i * 0.02, 0.08 - i * 0.02, 0.45, 8);
      const seg = new THREE.Mesh(segGeo, goldArmorMat);
      seg.position.y = -i * 0.35;
      seg.rotation.z = (isLeft ? -1 : 1) * (0.25 + i * 0.12);
      tailGroup.add(seg);
    }
    return tailGroup;
  }

  const tailL = createTwintail(true);
  tailL.position.set(-0.24, 2.45, -0.05);
  goldBody.add(tailL);

  const tailR = createTwintail(false);
  tailR.position.set(0.24, 2.45, -0.05);
  goldBody.add(tailR);

  // 左腕（腰に手を当てる）
  const gArmL1 = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.07, 0.45, 8), goldArmorMat);
  gArmL1.position.set(-0.46, 1.82, 0.05);
  gArmL1.rotation.z = 0.55;
  goldBody.add(gArmL1);

  const gArmL2 = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.06, 0.4, 8), goldArmorMat);
  gArmL2.position.set(-0.36, 1.5, 0.16);
  gArmL2.rotation.z = -0.75;
  goldBody.add(gArmL2);

  // 右腕（斜め上へ高く掲げる）
  const gArmR1 = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.07, 0.45, 8), goldArmorMat);
  gArmR1.position.set(0.48, 1.95, 0.1);
  gArmR1.rotation.z = -0.85;
  goldBody.add(gArmR1);

  const gArmR2 = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.06, 0.45, 8), goldArmorMat);
  gArmR2.position.set(0.72, 2.28, 0.2);
  gArmR2.rotation.z = -0.45;
  goldBody.add(gArmR2);

  // 掲げた星のステッキ（マジカルロッド）
  const wandGroup = new THREE.Group();
  wandGroup.position.set(0.85, 2.48, 0.28);
  wandGroup.rotation.z = -0.35;
  goldBody.add(wandGroup);

  // ステッキシャフト
  const wandPole = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.95, 8), goldArmorMat);
  wandGroup.add(wandPole);

  // 先端の回転する立体スター
  const starCore = new THREE.Mesh(new THREE.OctahedronGeometry(0.18, 0), goldGlowMat);
  starCore.position.y = 0.52;
  wandGroup.add(starCore);

  const starRing = new THREE.Mesh(new THREE.TorusGeometry(0.26, 0.02, 12, 24), goldGlowMat);
  starRing.position.y = 0.52;
  starRing.rotation.x = Math.PI / 3;
  wandGroup.add(starRing);

  // -------------------------------------------------------------
  // 7. 左右外周：プロ仕様Cスタンド ＆ ソフトボックス照明機材
  // -------------------------------------------------------------
  const chromeMat = new THREE.MeshStandardMaterial({ color: 0xd8e6f0, metalness: 0.95, roughness: 0.12 });
  const blackMetalMat = new THREE.MeshStandardMaterial({ color: 0x161c24, metalness: 0.65, roughness: 0.45 });

  function createCStand(heightScale) {
    const stand = new THREE.Group();
    for (let i = 0; i < 3; i++) {
      const angle = (i * Math.PI * 2) / 3;
      const legGeo = new THREE.CylinderGeometry(0.04, 0.04, 1.6, 12);
      legGeo.rotateZ(Math.PI / 4.5);
      legGeo.translate(0.55, 0.35, 0);
      const leg = new THREE.Mesh(legGeo, chromeMat);
      leg.rotation.y = angle;
      stand.add(leg);
    }
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.08, 3.8 * heightScale, 16), chromeMat);
    pole.position.y = 1.9 * heightScale;
    stand.add(pole);
    return { stand, topY: 3.8 * heightScale };
  }

  // 左外周：オクタゴンソフトボックス
  const leftRig = new THREE.Group();
  scene.add(leftRig);
  const leftStand = createCStand(1.1);
  leftRig.add(leftStand.stand);

  const octHood = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 1.45, 1.2, 8, 1, true), blackMetalMat);
  octHood.position.y = leftStand.topY;
  octHood.rotation.x = Math.PI / 2;
  leftRig.add(octHood);

  const octDiff = new THREE.Mesh(new THREE.CircleGeometry(1.45, 8), new THREE.MeshStandardMaterial({
    color: 0x00d2ff,
    emissive: 0x00a3cc,
    emissiveIntensity: 0.85,
    roughness: 0.2
  }));
  octDiff.position.set(0, leftStand.topY, 0.6);
  leftRig.add(octDiff);

  const cyanKeyLight = new THREE.PointLight(0x00d2ff, 4.5, 18, 1.6);
  cyanKeyLight.position.set(0, leftStand.topY, 0.8);
  leftRig.add(cyanKeyLight);

  // 右外周：角型ソフトボックス
  const rightRig = new THREE.Group();
  scene.add(rightRig);
  const rightStand = createCStand(1.0);
  rightRig.add(rightStand.stand);

  const rectHood = new THREE.Mesh(new THREE.BoxGeometry(1.6, 2.2, 0.9), blackMetalMat);
  rectHood.position.y = rightStand.topY;
  rightRig.add(rectHood);

  const rectDiff = new THREE.Mesh(new THREE.PlaneGeometry(1.56, 2.16), new THREE.MeshStandardMaterial({
    color: 0xfec838,
    emissive: 0xd49a15,
    emissiveIntensity: 0.8,
    roughness: 0.25
  }));
  rectDiff.position.set(0, rightStand.topY, 0.46);
  rightRig.add(rectDiff);

  const goldFillLight = new THREE.PointLight(0xfec838, 3.8, 16, 1.8);
  goldFillLight.position.set(0, rightStand.topY, 0.7);
  rightRig.add(goldFillLight);

  // -------------------------------------------------------------
  // 8. リアルタイム・カメラフラッシュ（シャッター閃光システム）
  // -------------------------------------------------------------
  const flashLight = new THREE.PointLight(0xffffff, 0, 35, 1.2);
  flashLight.position.set(0, 3.2, 9.0);
  scene.add(flashLight);

  let flashIntensity = 0;
  const flashDecay = 0.85;
  let nextFlashCooldown = 80;

  // -------------------------------------------------------------
  // 9. 浮遊するスタジオ・フォトン微粒子（Lens Dust Particles）
  // -------------------------------------------------------------
  const particleCount = 80;
  const particleGeo = new THREE.BufferGeometry();
  const particlePos = new Float32Array(particleCount * 3);
  const particleVels = [];

  for (let i = 0; i < particleCount; i++) {
    particlePos[i * 3 + 0] = (Math.random() - 0.5) * 26;
    particlePos[i * 3 + 1] = Math.random() * 8.0 + 0.2;
    particlePos[i * 3 + 2] = (Math.random() - 0.5) * 16;
    particleVels.push({
      y: Math.random() * 0.005 + 0.003,
      x: (Math.random() - 0.5) * 0.004,
      seed: Math.random() * Math.PI * 2
    });
  }
  particleGeo.setAttribute("position", new THREE.BufferAttribute(particlePos, 3));

  const particleMat = new THREE.PointsMaterial({
    size: 0.12,
    color: 0xd4f0ff,
    transparent: true,
    opacity: 0.65,
    blending: THREE.AdditiveBlending
  });
  const particleSystem = new THREE.Points(particleGeo, particleMat);
  scene.add(particleSystem);

  // -------------------------------------------------------------
  // 10. 【端寄り配置 ＆ レスポンシブ座標管理】
  // 中央960px（幅約9〜10ユニット）を完全に空け、左右の端に配置
  // -------------------------------------------------------------
  let mouseX = 0;
  let mouseY = 0;
  let targetCamX = 0;
  let targetCamY = 2.6;

  function onMouseMove(e) {
    const normX = (e.clientX / window.innerWidth) * 2 - 1;
    const normY = -(e.clientY / window.innerHeight) * 2 + 1;
    targetCamX = normX * 1.8;
    targetCamY = 2.6 + normY * 0.8;
  }
  window.addEventListener("mousemove", onMouseMove, { passive: true });

  function onResize() {
    width = container.clientWidth || window.innerWidth;
    height = container.clientHeight || window.innerHeight;

    camera.aspect = width / height;

    const isMob = width < 768;
    if (isMob) {
      camera.fov = 48;
      // モバイル：キャラクターを端ギリギリに小さめに配置
      cyanCharGroup.position.set(-4.5, 0, 0.5);
      cyanCharGroup.scale.set(0.72, 0.72, 0.72);
      cyanCharGroup.rotation.y = 0.25;

      goldCharGroup.position.set(4.5, 0, 0.5);
      goldCharGroup.scale.set(0.72, 0.72, 0.72);
      goldCharGroup.rotation.y = -0.25;

      leftRig.position.set(-6.8, 0, -0.5);
      rightRig.position.set(6.8, 0, -0.5);
    } else {
      camera.fov = 40;
      // PCデスクトップ：中央960pxの外側（画面端X: -7.5 / +7.5 付近）に堂々と直立！
      cyanCharGroup.position.set(-7.5, 0, 1.2);
      cyanCharGroup.scale.set(1.15, 1.15, 1.15);
      cyanCharGroup.rotation.y = 0.32; // 中央向き

      goldCharGroup.position.set(7.5, 0, 1.2);
      goldCharGroup.scale.set(1.10, 1.10, 1.10);
      goldCharGroup.rotation.y = -0.32; // 中央向き

      leftRig.position.set(-9.6, 0, 0.2);
      leftRig.rotation.y = 0.45;

      rightRig.position.set(9.6, 0, 0.2);
      rightRig.rotation.y = -0.45;
    }

    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
  }
  window.addEventListener("resize", onResize);
  onResize();

  // -------------------------------------------------------------
  // 11. アニメーションループ（簡素で上品な動きを維持）
  // -------------------------------------------------------------
  let clock = 0;

  function animate() {
    requestAnimationFrame(animate);
    clock += 0.016;

    // 1. カメラの滑らかなLerp補間
    camera.position.x += (targetCamX - camera.position.x) * 0.04;
    camera.position.y += (targetCamY - camera.position.y) * 0.04;
    camera.lookAt(0, 2.0, -1.0);

    // 2. キャラクターの上品な呼吸（簡素なアイドリング）
    const breathOffset = Math.sin(clock * 1.4) * 0.035;
    cyanBody.position.y = breathOffset;
    goldBody.position.y = Math.sin(clock * 1.4 + 0.8) * 0.035;

    // 剣士のマントの風（ウェーブ頂点変形）
    const cPos = capeGeo.attributes.position;
    for (let i = 0; i < cPos.count; i++) {
      const u = cPos.getX(i);
      const v = cPos.getY(i);
      const wave = Math.sin(clock * 2.2 + v * 2.0) * 0.06 * (1.0 - v * 0.5);
      cPos.setZ(i, wave);
    }
    capeGeo.attributes.position.needsUpdate = true;

    // ヒロインのステッキ先端の星のゆったりとした自転
    starCore.rotation.y += 0.025;
    starRing.rotation.y += 0.02;

    // 3. リアルタイム・カメラフラッシュトリガー
    nextFlashCooldown--;
    if (nextFlashCooldown <= 0) {
      flashIntensity = Math.random() * 8.0 + 14.0;
      flashLight.position.set(
        (Math.random() - 0.5) * 12,
        Math.random() * 2.5 + 2.0,
        Math.random() * 3.0 + 7.5
      );
      nextFlashCooldown = Math.floor(Math.random() * 100 + 160); // 2.6秒〜4.3秒おき
    }

    // フラッシュ減衰とマテリアル輝度連動
    if (flashIntensity > 0.01) {
      flashIntensity *= flashDecay;
      flashLight.intensity = flashIntensity;
      // フラッシュ瞬間にキャラクターの輪郭がパッと輝く
      cyanArmorMat.emissiveIntensity = 0.35 + flashIntensity * 0.08;
      goldArmorMat.emissiveIntensity = 0.35 + flashIntensity * 0.08;
    } else {
      flashLight.intensity = 0;
      cyanArmorMat.emissiveIntensity = 0.35;
      goldArmorMat.emissiveIntensity = 0.35;
    }

    // 4. フォトン微粒子の上品なスロー浮遊
    const pArr = particleGeo.attributes.position.array;
    for (let i = 0; i < particleCount; i++) {
      const idx = i * 3;
      pArr[idx + 1] += particleVels[i].y;
      pArr[idx + 0] += Math.sin(clock + particleVels[i].seed) * 0.005;

      if (pArr[idx + 1] > 8.5) {
        pArr[idx + 1] = 0.2;
        pArr[idx + 0] = (Math.random() - 0.5) * 26;
      }
    }
    particleGeo.attributes.position.needsUpdate = true;

    // 5. レンダリング
    renderer.render(scene, camera);
  }

  animate();
})();
