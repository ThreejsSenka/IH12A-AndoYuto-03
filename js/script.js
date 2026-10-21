/**
 * RE:CREATION 2026 - Main Interaction & 3D Arena Script
 * 【ボタン以外は静的・高品位】＆【3Dアリーナ光柱 Canvas】
 */

$(function () {
  // ========================================================
  // 1. Mobile Drawer Navigation (Vanilla JS + jQuery Hybrid for 100% Reliability)
  // ========================================================
  function setupMobileDrawer() {
    const drawer = document.querySelector(".mobile-nav-drawer");
    if (!drawer || drawer.dataset.drawerBound) return;
    drawer.dataset.drawerBound = "true";

    const hamburgerBoxes = document.querySelectorAll(".hamburger-box");
    const hamburgerIcons = document.querySelectorAll(".hamburger");

    function toggleDrawer(e) {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }
      const willOpen = !drawer.classList.contains("active");
      hamburgerIcons.forEach(function (icon) {
        if (willOpen) icon.classList.add("active");
        else icon.classList.remove("active");
      });
      if (willOpen) drawer.classList.add("active");
      else drawer.classList.remove("active");
    }

    hamburgerBoxes.forEach(function (btn) {
      btn.addEventListener("click", toggleDrawer);
      btn.addEventListener("touchend", function (e) {
        toggleDrawer(e);
      }, { passive: false });
    });

    // Close drawer when clicking a link
    const drawerLinks = drawer.querySelectorAll("a");
    drawerLinks.forEach(function (link) {
      link.addEventListener("click", function () {
        hamburgerIcons.forEach(function (icon) { icon.classList.remove("active"); });
        drawer.classList.remove("active");
      });
    });

    // Close drawer when clicking outside
    document.addEventListener("click", function (e) {
      if (!e.target.closest("#header, .mobile-nav-drawer, .hamburger-box, .hamburger")) {
        hamburgerIcons.forEach(function (icon) { icon.classList.remove("active"); });
        drawer.classList.remove("active");
      }
    });
  }
  setupMobileDrawer();

  // ========================================================
  // 2. Smooth Scroll for Navigation and Action Buttons
  // ========================================================
  $('a[href^="#"]').on("click", function (e) {
    var href = $(this).attr("href");
    if (href === "#" || href === "") return;
    var $target = $(href);
    if ($target.length) {
      e.preventDefault();
      var headerOffset = 64;
      var targetPosition = $target.offset().top - headerOffset;
      window.scrollTo({
        top: targetPosition,
        behavior: "smooth"
      });
    }
  });

  // ========================================================
  // 3. Back to Top Button
  // ========================================================
  var $backToTop = $("#backToTop");
  $(window).on("scroll", function () {
    if ($(this).scrollTop() > 300) {
      $backToTop.addClass("show");
    } else {
      $backToTop.removeClass("show");
    }
  });

  $backToTop.on("click", function () {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  // ========================================================
  // 4. Copy Address to Clipboard
  // ========================================================
  $(".copy-address-btn").on("click", function () {
    var addressText = "〒460-0032 愛知県名古屋市中区二の丸1-1 愛知県体育館";
    if (navigator.clipboard) {
      navigator.clipboard.writeText(addressText).then(function () {
        var $btn = $(".copy-address-btn");
        var originalHtml = $btn.html();
        $btn.html('<i data-lucide="check" style="width:16px;height:16px;vertical-align:-2px;margin-right:4px;"></i> コピーしました！');
        if (window.lucide) lucide.createIcons();
        $btn.css({ background: "var(--color-accent)", color: "#0B1736" });
        setTimeout(function () {
          $btn.html(originalHtml);
          if (window.lucide) lucide.createIcons();
          $btn.css({ background: "", color: "" });
        }, 2500);
      });
    }
  });

  // ========================================================
  // 5. Active Tab Highlight
  // ========================================================
  var currentPath = window.location.pathname.split("/").pop() || "index.html";
  $(".desktop-nav a").each(function () {
    var href = $(this).attr("href");
    if (href === currentPath || (currentPath === "" && href === "index.html")) {
      $(this).addClass("active");
    }
  });

  // ========================================================
  // 6. Lucide Icons Initial Call
  // ========================================================
  if (window.lucide) {
    lucide.createIcons();
  }
});

// ==========================================================
// 7. 3Dアリーナ・アイソメトリック・カメラエンジン ＆ リアルタイムCanvas
// （C:\Users\user\Downloads\レク再現\modern_rec\シアンブルー2\02_3Dアリーナ_アイソメトリック 原作準拠）
// マウス移動・スクロール連動・リアルタイム3Dスポーツコート・光柱・フォトン
// ==========================================================
(function () {
  const gridCanvas = document.getElementById("arena-grid-canvas");
  const raysCanvas = document.getElementById("god-rays-canvas");

  if (!gridCanvas || !raysCanvas) return;

  const gridCtx = gridCanvas.getContext("2d");
  const raysCtx = raysCanvas.getContext("2d");

  let mouseX = window.innerWidth * 0.5;
  let mouseY = window.innerHeight * 0.3;
  let targetMouseX = mouseX;
  let targetMouseY = mouseY;

  const isInitMob = typeof window !== "undefined" && window.innerWidth < 768;
  const initPitch = isInitMob ? 0.44 : 0.48;
  const initYaw = 0.00; // 完全正面・左右均整の美しいシンメトリー（見切れ防止）
  const initHorizon = isInitMob ? 0.40 : 0.42;
  const initZoom = isInitMob ? 1.02 : 1.15; // スマホ画面内にアリーナ全体がすっぽり収まる広角設計

  const arenaCamera = {
    pitch: initPitch,
    yaw: initYaw,
    horizon: initHorizon,
    zoom: initZoom,

    targetPitch: initPitch,
    targetYaw: initYaw,
    targetHorizon: initHorizon,
    targetZoom: initZoom,

    gridBoost: 1.0,
    raysBoost: 1.0,
    autoOrbit: true,
    orbitAngle: 0
  };

  // 各種インタラクション入力のターゲット値（ジャイロ覗き見・スクロール・マウス・スワイプ）
  let inputMouseYaw = 0;
  let inputMousePitch = 0;
  let inputGyroYaw = 0;
  let inputGyroPitch = 0;
  let inputGyroHorizon = 0;
  let inputSwipeYaw = 0;
  let scrollProgress = 0;

  function updateCameraTargets() {
    const isMob = window.innerWidth < 768;
    // スクロール連動のダイナミック・カメラワーク
    // 最上部: ローアングル仰ぎ見（天井トラス梁・ハイベイ照明・交差スポットライトが降り注ぐ）
    // 中間: スタンド席がカード両脇に収まる安定構図
    // 最下部: ハイアングル俯瞰（フロア全体・センターサークル・着弾光輪を見渡す）
    const baseHorizonTop = isMob ? 0.44 : 0.46;
    const baseHorizonBtm = isMob ? 0.28 : 0.32;
    const basePitchTop   = isMob ? 0.38 : 0.40;
    const basePitchBtm   = isMob ? 0.54 : 0.56;
    const baseZoomTop    = isMob ? 1.06 : 1.18;
    const baseZoomBtm    = isMob ? 0.94 : 1.04;

    const curBaseHorizon = baseHorizonTop + scrollProgress * (baseHorizonBtm - baseHorizonTop);
    const curBasePitch   = basePitchTop   + scrollProgress * (basePitchBtm   - basePitchTop);
    const curBaseZoom    = baseZoomTop    + scrollProgress * (baseZoomBtm    - baseZoomTop);

    // ジャイロ覗き見（Yaw ±0.38 rad） ＆ マウス連動 ＆ スワイプの物理合成
    arenaCamera.targetYaw = initYaw + inputGyroYaw + inputMouseYaw + inputSwipeYaw;
    arenaCamera.targetPitch = curBasePitch + inputGyroPitch + inputMousePitch;
    arenaCamera.targetHorizon = curBaseHorizon + inputGyroHorizon;
    arenaCamera.targetZoom = curBaseZoom;
  }

  // マウス移動で3D視点＆光柱がダイナミックに追従（スクロール中はスキップして60fps維持）
  window.addEventListener("mousemove", (e) => {
    if (isScrolling) return;
    targetMouseX = e.clientX;
    targetMouseY = e.clientY;
    const w = window.innerWidth;
    const h = window.innerHeight;
    inputMouseYaw = ((e.clientX - w * 0.5) / (w * 0.5)) * (w < 768 ? 0.20 : 0.30);
    inputMousePitch = ((e.clientY - h * 0.5) / (h * 0.5)) * 0.10;
  }, { passive: true });

  window.addEventListener("touchmove", (e) => {
    if (e.touches && e.touches[0]) {
      targetMouseX = e.touches[0].clientX;
      targetMouseY = e.touches[0].clientY;
    }
  }, { passive: true });

  // スクロール連動（同期Reflow解消 ＆ スクロール中Jank-Freeフラグ ＆ シネマティックカメラワーク）
  let cachedDocHeight = 1000;
  function updateScrollMetrics() {
    cachedDocHeight = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
  }
  window.addEventListener("resize", updateScrollMetrics, { passive: true });
  window.addEventListener("load", updateScrollMetrics, { passive: true });
  setTimeout(updateScrollMetrics, 300);

  let isScrolling = false;
  let scrollStopTimer = null;

  window.addEventListener("scroll", () => {
    isScrolling = true;
    clearTimeout(scrollStopTimer);
    scrollStopTimer = setTimeout(() => {
      isScrolling = false;
    }, 100);

    const scrollY = window.scrollY;
    scrollProgress = Math.min(1, Math.max(0, scrollY / cachedDocHeight));
  }, { passive: true });

  // ========================================================
  // 低スペック端末・低環境向けアダプティブ・パフォーマンス制御
  // ========================================================
  let isLowPerfMode = false;
  let frameCount = 0;
  let lastFpsCheckTime = performance.now ? performance.now() : Date.now();
  const prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // シャドウブラー最適化ヘルパー（モバイル/スクロール中/低FPS時は完全0にして常時60fps維持）
  function setShadowBlur(val) {
    const isMob = window.innerWidth < 768;
    if (isMob || isScrolling || isLowPerfMode) {
      gridCtx.shadowBlur = 0;
      gridCtx.shadowColor = "transparent";
    } else {
      gridCtx.shadowBlur = val;
    }
  }

  // スマホスワイプ対応
  let touchStartX = 0;
  let touchStartY = 0;
  let isSwipingArena = false;

  window.addEventListener("touchstart", (e) => {
    if (e.touches.length === 1 && e.target.tagName !== "BUTTON" && e.target.tagName !== "A" && e.target.tagName !== "INPUT") {
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
      isSwipingArena = true;
    }
  }, { passive: true });

  window.addEventListener("touchmove", (e) => {
    if (!isSwipingArena || e.touches.length !== 1) return;
    const dx = e.touches[0].clientX - touchStartX;
    const dy = e.touches[0].clientY - touchStartY;
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 8) {
      inputSwipeYaw += (dx > 0 ? 0.02 : -0.02);
      inputSwipeYaw = Math.max(-0.45, Math.min(0.45, inputSwipeYaw));
      touchStartX = e.touches[0].clientX;
    }
  }, { passive: true });

  window.addEventListener("touchend", () => {
    isSwipingArena = false;
  });

  // ジャイロ（傾き）連動の覗き見エフェクト（描画ループで一括反映するためイベント内では値保存のみ）
  function handleDeviceOrientation(e) {
    if (e.gamma !== null && window.innerWidth < 768) {
      const tiltX = Math.max(-40, Math.min(40, e.gamma));
      inputGyroYaw = (tiltX / 40) * 0.38;

      if (e.beta !== null) {
        const tiltY = Math.max(-25, Math.min(25, e.beta - 45));
        inputGyroPitch = (tiltY / 25) * 0.12;
        inputGyroHorizon = -(tiltY / 25) * 0.08;
      }
    }
  }

  if (typeof window !== "undefined" && window.DeviceOrientationEvent) {
    window.addEventListener("deviceorientation", handleDeviceOrientation, { passive: true });
    // iOS 13+ でのパーミッション要求対応（初回タップで自動有効化）
    if (typeof DeviceOrientationEvent.requestPermission === "function") {
      const enableGyroOnTouch = () => {
        DeviceOrientationEvent.requestPermission().then((permission) => {
          if (permission === "granted") {
            window.addEventListener("deviceorientation", handleDeviceOrientation, { passive: true });
          }
        }).catch(() => {});
        window.removeEventListener("touchstart", enableGyroOnTouch);
        window.removeEventListener("click", enableGyroOnTouch);
      };
      window.addEventListener("touchstart", enableGyroOnTouch, { once: true, passive: true });
      window.addEventListener("click", enableGyroOnTouch, { once: true, passive: true });
    }
  }

  // 高DPI対応リサイズ（モバイル表示時は1.0にしてGPU描画負荷を最小化）
  let dpr = window.innerWidth < 768 ? 1.0 : Math.min(window.devicePixelRatio || 1, 2);
  function resizeCanvases() {
    dpr = window.innerWidth < 768 ? 1.0 : Math.min(window.devicePixelRatio || 1, 2);
    const w = window.innerWidth;
    const h = window.innerHeight;
    gridCanvas.width = w * dpr;
    gridCanvas.height = h * dpr;
    raysCanvas.width = w * dpr;
    raysCanvas.height = h * dpr;
    gridCanvas.style.width = w + "px";
    gridCanvas.style.height = h + "px";
    raysCanvas.style.width = w + "px";
    raysCanvas.style.height = h + "px";
    gridCtx.setTransform(1, 0, 0, 1, 0, 0);
    raysCtx.setTransform(1, 0, 0, 1, 0, 0);
    gridCtx.scale(dpr, dpr);
    raysCtx.scale(dpr, dpr);
  }
  window.addEventListener("resize", resizeCanvases);
  resizeCanvases();

  // 3D透視投影関数
  function projectArena3D(x, y, z, w, h) {
    const cosY = Math.cos(arenaCamera.yaw);
    const sinY = Math.sin(arenaCamera.yaw);
    const rx = x * cosY - z * sinY;
    const rz = x * sinY + z * cosY;

    const dist = 1450 / arenaCamera.zoom;
    const eyeZ = dist + rz;
    if (eyeZ <= 60) return null;

    const eyeY = y * Math.cos(arenaCamera.pitch * 1.3) - rz * Math.sin(arenaCamera.pitch * 0.75);

    const vpX = w * 0.5 + (mouseX - w * 0.5) * 0.06;
    const vpY = h * arenaCamera.horizon;

    const scale = dist / eyeZ;
    const screenX = vpX + rx * scale;
    const screenY = vpY + eyeY * scale + (h * 0.52 * (1 - arenaCamera.pitch));

    return { x: screenX, y: screenY, scale };
  }

  let gridAnimTime = 0;

  function renderArenaGrid() {
    // 低環境向け動的FPSチェック
    const nowTime = performance.now ? performance.now() : Date.now();
    frameCount++;
    if (nowTime - lastFpsCheckTime >= 1000) {
      const currentFps = (frameCount * 1000) / (nowTime - lastFpsCheckTime);
      frameCount = 0;
      lastFpsCheckTime = nowTime;
      if (currentFps < 32 && !isLowPerfMode) {
        isLowPerfMode = true; // 32fps未満が継続した場合、自動軽量モードへ移行
      }
    }

    updateCameraTargets();
    mouseX += (targetMouseX - mouseX) * 0.05;
    mouseY += (targetMouseY - mouseY) * 0.05;

    if (arenaCamera.autoOrbit && !prefersReducedMotion) {
      arenaCamera.orbitAngle += 0.008;
      const ambientYaw = Math.sin(arenaCamera.orbitAngle) * (window.innerWidth < 768 ? 0.015 : 0.05);
      arenaCamera.yaw += (arenaCamera.targetYaw + ambientYaw - arenaCamera.yaw) * 0.07;
    } else {
      arenaCamera.yaw += (arenaCamera.targetYaw - arenaCamera.yaw) * 0.07;
    }

    arenaCamera.pitch += (arenaCamera.targetPitch - arenaCamera.pitch) * 0.07;
    arenaCamera.horizon += (arenaCamera.targetHorizon - arenaCamera.horizon) * 0.07;
    arenaCamera.zoom += (arenaCamera.targetZoom - arenaCamera.zoom) * 0.07;

    const w = window.innerWidth;
    const h = window.innerHeight;
    gridCtx.clearRect(0, 0, w, h);

    gridAnimTime += 0.014;
    const wavePhase = (gridAnimTime * 0.35) % 1.0;
    const boost = arenaCamera.gridBoost;

    // ページ判定: ランキングとコスプレ画面は中央クリーン＆左右両端ウィング特化（案C: アリーナ立体スタンド＆トラス梁）
    const isRanking = document.body.classList.contains("page-ranking") || window.location.pathname.includes("ranking");
    const isCosplay = document.body.classList.contains("page-cosplay") || window.location.pathname.includes("cosplay");
    const isCleanCenterPage = isRanking || isCosplay;

    if (!isCleanCenterPage) {
      // 1. ホーム画面等通常ページ用: 広大なアリーナ床面グリッド
      const gridSpan = 1400;
      const gridStep = 100;

      gridCtx.lineWidth = 1.0;
      for (let gx = -gridSpan; gx <= gridSpan; gx += gridStep) {
        const p1 = projectArena3D(gx, 0, -gridSpan, w, h);
        const p2 = projectArena3D(gx, 0, gridSpan, w, h);
        if (p1 && p2) {
          const alpha = (Math.abs(gx) === gridSpan ? 0.35 : 0.12) * boost;
          gridCtx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
          gridCtx.beginPath();
          gridCtx.moveTo(p1.x, p1.y);
          gridCtx.lineTo(p2.x, p2.y);
          gridCtx.stroke();
        }
      }

      for (let gz = -gridSpan; gz <= gridSpan; gz += gridStep) {
        const p1 = projectArena3D(-gridSpan, 0, gz, w, h);
        const p2 = projectArena3D(gridSpan, 0, gz, w, h);
        if (p1 && p2) {
          const normZ = (gz + gridSpan) / (gridSpan * 2);
          const alpha = (0.08 + normZ * 0.28) * boost;
          gridCtx.strokeStyle = `rgba(44, 159, 216, ${alpha})`;
          gridCtx.beginPath();
          gridCtx.moveTo(p1.x, p1.y);
          gridCtx.lineTo(p2.x, p2.y);
          gridCtx.stroke();
        }
      }

      // 2. 3Dスポーツコート完全描画（NBA級 見切れゼロ）
      const isMobile = w < 768;
      const courtW = isMobile ? 180 : 540;
      const courtL = isMobile ? 360 : 840;
      const circleR = isMobile ? 65 : 170;
      const keyW = isMobile ? 55 : 160;
      const keyL = isMobile ? 90 : 220;

      const c1 = projectArena3D(-courtW, 0, -courtL, w, h);
      const c2 = projectArena3D(courtW, 0, -courtL, w, h);
      const c3 = projectArena3D(courtW, 0, courtL, w, h);
      const c4 = projectArena3D(-courtW, 0, courtL, w, h);

      if (c1 && c2 && c3 && c4) {
        gridCtx.save();
        gridCtx.beginPath();
        gridCtx.moveTo(c1.x, c1.y);
        gridCtx.lineTo(c2.x, c2.y);
        gridCtx.lineTo(c3.x, c3.y);
        gridCtx.lineTo(c4.x, c4.y);
        gridCtx.closePath();
        gridCtx.fillStyle = isMobile ? "rgba(2, 136, 209, 0.18)" : "rgba(44, 159, 216, 0.10)";
        gridCtx.fill();

        gridCtx.lineWidth = (isMobile ? 2.8 : 2.4) * boost;
        gridCtx.strokeStyle = "rgba(255, 255, 255, 0.95)";
        gridCtx.shadowColor = "rgba(0, 210, 255, 0.9)";
        setShadowBlur((isMobile ? 16 : 12) * boost);
        gridCtx.stroke();
        gridCtx.restore();

        // センターライン
        const midL = projectArena3D(-courtW, 0, 0, w, h);
        const midR = projectArena3D(courtW, 0, 0, w, h);
        if (midL && midR) {
          gridCtx.save();
          gridCtx.lineWidth = isMobile ? 2.2 : 2.0;
          gridCtx.strokeStyle = "rgba(255, 255, 255, 0.85)";
          gridCtx.beginPath();
          gridCtx.moveTo(midL.x, midL.y);
          gridCtx.lineTo(midR.x, midR.y);
          gridCtx.stroke();
          gridCtx.restore();
        }

        // ゴール下キーエリア
        [-courtL, courtL].forEach((endZ) => {
          const isTop = endZ < 0;
          const kZ1 = endZ;
          const kZ2 = isTop ? endZ + keyL : endZ - keyL;
          const kp1 = projectArena3D(-keyW, 0, kZ1, w, h);
          const kp2 = projectArena3D(keyW, 0, kZ1, w, h);
          const kp3 = projectArena3D(keyW, 0, kZ2, w, h);
          const kp4 = projectArena3D(-keyW, 0, kZ2, w, h);
          if (kp1 && kp2 && kp3 && kp4) {
            gridCtx.save();
            gridCtx.beginPath();
            gridCtx.moveTo(kp1.x, kp1.y);
            gridCtx.lineTo(kp2.x, kp2.y);
            gridCtx.lineTo(kp3.x, kp3.y);
            gridCtx.lineTo(kp4.x, kp4.y);
            gridCtx.closePath();
            gridCtx.fillStyle = "rgba(0, 180, 255, 0.15)";
            gridCtx.fill();
            gridCtx.lineWidth = 1.6;
            gridCtx.strokeStyle = "rgba(255, 255, 255, 0.75)";
            gridCtx.stroke();
            gridCtx.restore();

            // フリースローサークル
            const ftCircleR = keyW;
            gridCtx.save();
            gridCtx.lineWidth = 1.5;
            gridCtx.strokeStyle = "rgba(255, 255, 255, 0.65)";
            gridCtx.beginPath();
            let ftFirst = null;
            for (let a = 0; a <= Math.PI * 2 + 0.1; a += Math.PI / 12) {
              const ftx = Math.cos(a) * ftCircleR;
              const ftz = kZ2 + Math.sin(a) * ftCircleR * (isTop ? 0.6 : -0.6);
              const ftp = projectArena3D(ftx, 0, ftz, w, h);
              if (ftp) {
                if (!ftFirst) { ftFirst = ftp; gridCtx.moveTo(ftp.x, ftp.y); }
                else { gridCtx.lineTo(ftp.x, ftp.y); }
              }
            }
            gridCtx.stroke();
            gridCtx.restore();

            // バスケットゴール
            const poleBase = projectArena3D(0, 0, kZ1, w, h);
            const poleTop = projectArena3D(0, -90, kZ1, w, h);
            const rim = projectArena3D(0, -75, isTop ? kZ1 + 25 : kZ1 - 25, w, h);
            if (poleBase && poleTop && rim) {
              gridCtx.save();
              gridCtx.lineWidth = 2.0;
              gridCtx.strokeStyle = "rgba(255, 255, 255, 0.85)";
              gridCtx.beginPath();
              gridCtx.moveTo(poleBase.x, poleBase.y);
              gridCtx.lineTo(poleTop.x, poleTop.y);
              gridCtx.lineTo(rim.x, rim.y);
              gridCtx.stroke();

              gridCtx.fillStyle = "#ff9800";
              gridCtx.shadowColor = "#ff9800";
              setShadowBlur(8);
              gridCtx.beginPath();
              gridCtx.arc(rim.x, rim.y, isMobile ? 3 : 5, 0, Math.PI * 2);
              gridCtx.fill();
              gridCtx.restore();
            }
          }
        });
      }

      // センターサークル
      gridCtx.save();
      gridCtx.lineWidth = (isMobile ? 2.6 : 2.2) * boost;
      gridCtx.strokeStyle = "rgba(255, 255, 255, 0.9)";
      gridCtx.shadowColor = "rgba(0, 210, 255, 0.9)";
      setShadowBlur(14);
      gridCtx.beginPath();
      let firstPt = null;
      for (let a = 0; a <= Math.PI * 2 + 0.1; a += Math.PI / 16) {
        const cx = Math.cos(a) * circleR;
        const cz = Math.sin(a) * circleR;
        const cp = projectArena3D(cx, 0, cz, w, h);
        if (cp) {
          if (!firstPt) {
            firstPt = cp;
            gridCtx.moveTo(cp.x, cp.y);
          } else {
            gridCtx.lineTo(cp.x, cp.y);
          }
        }
      }
      gridCtx.stroke();
      gridCtx.fillStyle = "rgba(2, 136, 209, 0.22)";
      gridCtx.fill();
      gridCtx.restore();

      // パルスウェーブ
      const pulseZ = -gridSpan + wavePhase * (gridSpan * 2);
      const pw1 = projectArena3D(-courtW * 1.3, 0, pulseZ, w, h);
      const pw2 = projectArena3D(courtW * 1.3, 0, pulseZ, w, h);
      if (pw1 && pw2) {
        gridCtx.save();
        gridCtx.lineWidth = isMobile ? 3.5 : 3.0;
        gridCtx.strokeStyle = `rgba(0, 210, 255, ${(1 - wavePhase) * 0.85 * boost})`;
        gridCtx.shadowColor = "rgba(0, 210, 255, 0.95)";
        setShadowBlur(16);
        gridCtx.beginPath();
        gridCtx.moveTo(pw1.x, pw1.y);
        gridCtx.lineTo(pw2.x, pw2.y);
        gridCtx.stroke();
        gridCtx.restore();
      }
    } else if (isCosplay) {
      // =========================================================
      // 【コスプレ大会専用背景：3Dアリーナ・ステージ＆シネマティックスポットライト】
      // 他ページと100%統一された開放感ある3Dアリーナ空間に、
      // 左右上空から優雅に交差するステージ・スポットライト光芒と、
      // 舞い上がる星屑スパークル、控えめなカメラフラッシュ閃光を上品に調和。
      // 画面に綺麗に収まり、中央のコンテンツを邪魔しない最高峰のステージ背景。
      // =========================================================
      const isMobile = w < 768;
      const boost = arenaCamera.gridBoost;

      // 1. 広大なアリーナ床面3Dグリッド（見切れゼロで奥へと広がる）
      const gridSpan = 1400;
      const gridStep = isMobile ? 140 : 100;

      gridCtx.lineWidth = 1.0;
      for (let gx = -gridSpan; gx <= gridSpan; gx += gridStep) {
        const p1 = projectArena3D(gx, 0, -gridSpan, w, h);
        const p2 = projectArena3D(gx, 0, gridSpan, w, h);
        if (p1 && p2) {
          const normX = Math.abs(gx) / gridSpan;
          const alpha = (0.08 + normX * 0.28) * boost;
          gridCtx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
          gridCtx.beginPath();
          gridCtx.moveTo(p1.x, p1.y);
          gridCtx.lineTo(p2.x, p2.y);
          gridCtx.stroke();
        }
      }

      for (let gz = -gridSpan; gz <= gridSpan; gz += gridStep) {
        const p1 = projectArena3D(-gridSpan, 0, gz, w, h);
        const p2 = projectArena3D(gridSpan, 0, gz, w, h);
        if (p1 && p2) {
          const normZ = (gz + gridSpan) / (gridSpan * 2);
          const alpha = (0.10 + normZ * 0.32) * boost;
          gridCtx.strokeStyle = `rgba(44, 159, 216, ${alpha})`;
          gridCtx.beginPath();
          gridCtx.moveTo(p1.x, p1.y);
          gridCtx.lineTo(p2.x, p2.y);
          gridCtx.stroke();
        }
      }

      // 2. ステージ・スポットライト光芒（左右上空から中央へ優雅に交差する高輝度シネマティックスポットライト）
      gridCtx.save();
      gridCtx.globalCompositeOperation = 'screen';

      [-1, 1].forEach((side) => {
        const isLeft = side === -1;
        const srcX = isLeft ? w * 0.08 : w * 0.92;
        const srcY = -20;

        // 優雅にゆったりスイングする目標点
        const sweepAngle = Math.sin(gridAnimTime * 0.5 + (isLeft ? 0 : Math.PI)) * (w * 0.12);
        const targetX = (w * 0.5) + (isLeft ? -w * 0.08 : w * 0.08) + sweepAngle;
        const targetY = h * 0.85;
        const beamSpread = isMobile ? w * 0.28 : w * 0.22;

        const beamGrad = gridCtx.createLinearGradient(srcX, srcY, targetX, targetY);
        const rgbColor = isLeft ? '0, 210, 255' : '254, 200, 56';

        beamGrad.addColorStop(0, `rgba(255, 255, 255, ${isMobile ? 0.70 : 0.80})`);
        beamGrad.addColorStop(0.25, `rgba(${rgbColor}, ${isMobile ? 0.42 : 0.50})`);
        beamGrad.addColorStop(0.65, `rgba(${rgbColor}, ${isMobile ? 0.18 : 0.22})`);
        beamGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

        gridCtx.fillStyle = beamGrad;
        gridCtx.beginPath();
        gridCtx.moveTo(srcX - (isMobile ? 20 : 30), srcY);
        gridCtx.lineTo(srcX + (isMobile ? 20 : 30), srcY);
        gridCtx.lineTo(targetX + beamSpread, targetY);
        gridCtx.lineTo(targetX - beamSpread, targetY);
        gridCtx.closePath();
        gridCtx.fill();

        // 床面の柔らかなアンビエント光輪（ステージ着弾点）
        const groundGrad = gridCtx.createRadialGradient(targetX, targetY, 0, targetX, targetY, beamSpread * 0.9);
        groundGrad.addColorStop(0, `rgba(${rgbColor}, 0.35)`);
        groundGrad.addColorStop(0.5, `rgba(${rgbColor}, 0.14)`);
        groundGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        gridCtx.fillStyle = groundGrad;
        gridCtx.beginPath();
        gridCtx.ellipse(targetX, targetY, beamSpread * 0.9, beamSpread * 0.28, 0, 0, Math.PI * 2);
        gridCtx.fill();
      });
      gridCtx.restore();

      // 3. 舞い上がるステージスパークル（上品な星屑パーティクル：モバイル超軽量化）
      if (!window.cosplaySparkles) {
        window.cosplaySparkles = [];
        const count = isMobile ? 18 : 60;
        for (let sp = 0; sp < count; sp++) {
          window.cosplaySparkles.push({
            x: Math.random() * w,
            y: Math.random() * h,
            speedY: Math.random() * 0.7 + 0.25,
            speedX: (Math.random() - 0.5) * 0.4,
            size: Math.random() * 3.2 + 1.4,
            phase: Math.random() * Math.PI * 2,
            twinkleSpeed: Math.random() * 0.05 + 0.02,
            isGold: Math.random() < 0.45
          });
        }
      }

      gridCtx.save();
      gridCtx.globalCompositeOperation = 'screen';
      window.cosplaySparkles.forEach((sp) => {
        sp.y -= sp.speedY;
        sp.x += sp.speedX;
        if (sp.y < -10) {
          sp.y = h + 10;
          sp.x = Math.random() * w;
        }
        if (sp.x < 0) sp.x = w;
        if (sp.x > w) sp.x = 0;

        sp.phase += sp.twinkleSpeed;
        const alpha = 0.35 + Math.sin(sp.phase) * 0.35;
        const color = sp.isGold ? '#FEC838' : '#00D2FF';

        gridCtx.fillStyle = color;
        if (!isMobile) {
          gridCtx.shadowColor = color;
          setShadowBlur(10 * alpha);
        }
        gridCtx.beginPath();
        gridCtx.arc(sp.x, sp.y, sp.size * (0.8 + alpha * 0.4), 0, Math.PI * 2);
        gridCtx.fill();
      });
      gridCtx.restore();

      // 4. 観客席カメラフラッシュ（控えめで上品なシャッター閃光：モバイル負荷抑制）
      if (!window.cosplayFlashes) {
        window.cosplayFlashes = [];
      }
      const flashes = window.cosplayFlashes;

      // ランダムにたまにピカッと光る
      if (Math.random() < (isMobile ? 0.03 : 0.08)) {
        const isLeftFlash = Math.random() < 0.5;
        const fx = isLeftFlash
          ? Math.random() * (w * 0.35) + 20
          : w - (Math.random() * (w * 0.35) + 20);
        const fy = Math.random() * (h * 0.70) + h * 0.15;
        flashes.push({
          x: fx,
          y: fy,
          size: Math.random() * 10 + 7,
          alpha: 1.0,
          decay: Math.random() * 0.07 + 0.04,
          color: Math.random() < 0.3 ? '#D8F4FF' : '#FFFFFF'
        });
      }

      for (let i = flashes.length - 1; i >= 0; i--) {
        const f = flashes[i];
        f.alpha -= f.decay;
        if (f.alpha <= 0) {
          flashes.splice(i, 1);
        } else {
          gridCtx.save();
          gridCtx.globalCompositeOperation = 'screen';

          // 中心ホワイトコア
          gridCtx.fillStyle = f.color;
          gridCtx.shadowColor = '#FFFFFF';
          setShadowBlur(18 * f.alpha);
          gridCtx.beginPath();
          gridCtx.arc(f.x, f.y, f.size * f.alpha, 0, Math.PI * 2);
          gridCtx.fill();

          // 繊細なレンズフレア光芒
          const flareLen = f.size * 4.5 * f.alpha;
          gridCtx.lineWidth = 1.4 * f.alpha;
          gridCtx.strokeStyle = `rgba(255, 255, 255, ${f.alpha * 0.8})`;
          gridCtx.beginPath();
          gridCtx.moveTo(f.x - flareLen, f.y); gridCtx.lineTo(f.x + flareLen, f.y);
          gridCtx.moveTo(f.x, f.y - flareLen); gridCtx.lineTo(f.x, f.y + flareLen);
          gridCtx.stroke();

          gridCtx.restore();
        }
      }
    } else if (isRanking) {
      const isMobile = w < 768;
      // スマホ時は画面幅（390px等）にすっぽり収まるアリーナフロア幅を設定（左右スタンド席がウィング余白に美しく収まる）
      const wingBaseX = isMobile ? Math.min(w * 0.25, 82) : Math.max(w * 0.34, 490);
      const standZStart = isMobile ? -380 : -650;
      const standZEnd = isMobile ? 380 : 650;
      const zStep = isMobile ? 95 : 60;

      // 本格立体ステップ（スマホ時は3段に最適化して超高速60fps、PC時は6段フルボリューム）
      const numSteps = isMobile ? 3 : 6;
      const stepRise = isMobile ? 18 : 34;
      const stepDepth = isMobile ? 22 : 52;

      // ---------------------------------------------------------
      // 0-A. 中央のアリーナ床（体育館の磨き上げられたポリッシュフロア ＆ センターサークル）
      // スマホでは画面幅にぴったり収まるセンターコートを主役に美しく描画
      // ---------------------------------------------------------
      const cFloorL = projectArena3D(-wingBaseX, 0, standZStart, w, h);
      const cFloorR = projectArena3D(wingBaseX, 0, standZStart, w, h);
      const cFloorNearR = projectArena3D(wingBaseX, 0, standZEnd, w, h);
      const cFloorNearL = projectArena3D(-wingBaseX, 0, standZEnd, w, h);

      if (cFloorL && cFloorR && cFloorNearR && cFloorNearL) {
        gridCtx.save();
        // 体育館フロアの光沢ポリゴン面
        gridCtx.beginPath();
        gridCtx.moveTo(cFloorL.x, cFloorL.y);
        gridCtx.lineTo(cFloorR.x, cFloorR.y);
        gridCtx.lineTo(cFloorNearR.x, cFloorNearR.y);
        gridCtx.lineTo(cFloorNearL.x, cFloorNearL.y);
        gridCtx.closePath();
        gridCtx.fillStyle = "rgba(16, 90, 140, 0.28)";
        gridCtx.fill();

        // アリーナフロアの縦方向プランクライン（木目調フローリング分割線）
        gridCtx.lineWidth = 1.0;
        gridCtx.strokeStyle = "rgba(255, 255, 255, 0.14)";
        const plankStep = isMobile ? 35 : 110;
        for (let px = -wingBaseX + plankStep; px < wingBaseX; px += plankStep) {
          const plFar = projectArena3D(px, 0, standZStart, w, h);
          const plNear = projectArena3D(px, 0, standZEnd, w, h);
          if (plFar && plNear) {
            gridCtx.beginPath();
            gridCtx.moveTo(plFar.x, plFar.y);
            gridCtx.lineTo(plNear.x, plNear.y);
            gridCtx.stroke();
          }
        }

        // センターコートのサークル（32ポリゴン真正3D円形）
        const centerR = isMobile ? 55 : 160;
        gridCtx.lineWidth = isMobile ? 2.0 : 2.6;
        gridCtx.strokeStyle = "rgba(56, 182, 240, 0.85)";
        gridCtx.shadowColor = "#38B6F0";
        setShadowBlur(isMobile ? 8 : 14);
        gridCtx.beginPath();
        let cpFirst = null;
        for (let a = 0; a <= Math.PI * 2 + 0.1; a += Math.PI / 16) {
          const cx = Math.cos(a) * centerR;
          const cz = Math.sin(a) * centerR;
          const cp = projectArena3D(cx, 0, cz, w, h);
          if (cp) {
            if (!cpFirst) { cpFirst = cp; gridCtx.moveTo(cp.x, cp.y); }
            else { gridCtx.lineTo(cp.x, cp.y); }
          }
        }
        gridCtx.stroke();
        gridCtx.fillStyle = "rgba(56, 182, 240, 0.14)";
        gridCtx.fill();

        // センターライン（左右横断）
        const cl1 = projectArena3D(-wingBaseX, 0, 0, w, h);
        const cl2 = projectArena3D(wingBaseX, 0, 0, w, h);
        if (cl1 && cl2) {
          gridCtx.lineWidth = 1.2;
          gridCtx.strokeStyle = "rgba(255, 255, 255, 0.25)";
          gridCtx.beginPath();
          gridCtx.moveTo(cl1.x, cl1.y);
          gridCtx.lineTo(cl2.x, cl2.y);
          gridCtx.stroke();
        }
        gridCtx.restore();
      }

      // ---------------------------------------------------------
      // 0-B. 中央の天井照明設備（アリーナ・ハイベイ天井照明 ＆ 梁 ＆ 光条）
      // タイトル上やヘッダーの下に、アリーナの天井照明設備と光の筋が明確に見える
      // ---------------------------------------------------------
      const ceilingY = isMobile ? -230 : -370;
      const ceilingZ = -100;
      const ceilTrussL = projectArena3D(-wingBaseX - (isMobile ? 25 : 40), ceilingY, ceilingZ, w, h);
      const ceilTrussR = projectArena3D(wingBaseX + (isMobile ? 25 : 40), ceilingY, ceilingZ, w, h);

      if (ceilTrussL && ceilTrussR) {
        gridCtx.save();
        // 天井キャットウォーク梁（横一文字の鉄骨トラス）
        gridCtx.lineWidth = 2.0;
        gridCtx.strokeStyle = "rgba(255, 255, 255, 0.55)";
        gridCtx.shadowColor = "#38B6F0";
        setShadowBlur(8);
        gridCtx.beginPath();
        gridCtx.moveTo(ceilTrussL.x, ceilTrussL.y);
        gridCtx.lineTo(ceilTrussR.x, ceilTrussR.y);
        gridCtx.stroke();

        // 下弦ビーム
        const ceilBotL = projectArena3D(-wingBaseX - (isMobile ? 25 : 40), ceilingY + 16, ceilingZ, w, h);
        const ceilBotR = projectArena3D(wingBaseX + (isMobile ? 25 : 40), ceilingY + 16, ceilingZ, w, h);
        if (ceilBotL && ceilBotR) {
          gridCtx.lineWidth = 1.4;
          gridCtx.strokeStyle = "rgba(56, 182, 240, 0.4)";
          gridCtx.beginPath();
          gridCtx.moveTo(ceilBotL.x, ceilBotL.y);
          gridCtx.lineTo(ceilBotR.x, ceilBotR.y);
          gridCtx.stroke();
        }

        // 吊り下げ型ハイベイLED照明器具
        const lightPositions = isMobile ? [-60, 0, 60] : [-340, -170, 0, 170, 340];
        lightPositions.forEach((lx, idx) => {
          const lBase = projectArena3D(lx, ceilingY + 16, ceilingZ, w, h);
          const lFixture = projectArena3D(lx, ceilingY + (isMobile ? 28 : 36), ceilingZ, w, h);
          if (lBase && lFixture) {
            // 吊り下げワイヤー
            gridCtx.lineWidth = 1.2;
            gridCtx.strokeStyle = "rgba(255, 255, 255, 0.7)";
            gridCtx.beginPath();
            gridCtx.moveTo(lBase.x, lBase.y);
            gridCtx.lineTo(lFixture.x, lFixture.y);
            gridCtx.stroke();

            // ドーム型ハイベイ照明フード（ランプシェード）
            const lampW = isMobile ? 18 : 30;
            const lampH = isMobile ? 9 : 14;
            gridCtx.fillStyle = "rgba(7, 30, 48, 0.95)";
            gridCtx.strokeStyle = "#FFFFFF";
            gridCtx.lineWidth = 1.4;
            gridCtx.beginPath();
            gridCtx.ellipse(lFixture.x, lFixture.y, lampW * 0.5, lampH * 0.5, 0, 0, Math.PI * 2);
            gridCtx.fill();
            gridCtx.stroke();

            // 強力発光LEDコア
            const isCenterSpot = idx === Math.floor(lightPositions.length / 2);
            const lampColor = isCenterSpot ? "#FFFFFF" : (idx % 2 === 0 ? "#38B6F0" : "#FEC838");
            gridCtx.fillStyle = lampColor;
            gridCtx.shadowColor = lampColor;
            setShadowBlur(16);
            gridCtx.beginPath();
            gridCtx.arc(lFixture.x, lFixture.y + 2, isMobile ? 3 : 5, 0, Math.PI * 2);
            gridCtx.fill();

            // 下向きのドラマチックな天井照明コーン光条（God Rays）
            gridCtx.save();
            gridCtx.globalCompositeOperation = "screen";
            const coneSpread = isMobile ? 45 : 85;
            const coneDepth = isMobile ? 210 : 320;
            const coneGrad = gridCtx.createLinearGradient(lFixture.x, lFixture.y, lFixture.x, lFixture.y + coneDepth);
            coneGrad.addColorStop(0, "rgba(255, 255, 255, 0.75)");
            coneGrad.addColorStop(0.3, isCenterSpot ? "rgba(200, 240, 255, 0.38)" : "rgba(56, 182, 240, 0.32)");
            coneGrad.addColorStop(0.7, isCenterSpot ? "rgba(200, 240, 255, 0.15)" : "rgba(56, 182, 240, 0.12)");
            coneGrad.addColorStop(1, "rgba(255, 255, 255, 0.0)");

            gridCtx.fillStyle = coneGrad;
            gridCtx.beginPath();
            gridCtx.moveTo(lFixture.x - 4, lFixture.y);
            gridCtx.lineTo(lFixture.x + 4, lFixture.y);
            gridCtx.lineTo(lFixture.x + coneSpread, lFixture.y + coneDepth);
            gridCtx.lineTo(lFixture.x - coneSpread, lFixture.y + coneDepth);
            gridCtx.closePath();
            gridCtx.fill();
            gridCtx.restore();
          }
        });
        gridCtx.restore();
      }

      // ---------------------------------------------------------
      // 1〜6. 左右両翼の観客席スタンド（PC・スマホ両対応で美しく展開）
      // ---------------------------------------------------------
      [-1, 1].forEach((side) => {
        const isLeft = side === -1;
        const mainColor = isLeft ? "#00D2FF" : "#FEC838";
        const themeRgb = isLeft ? "0, 210, 255" : "254, 200, 56";
        const seatBaseRgb = isLeft ? "16, 120, 180" : "220, 140, 20";
        const signText = isMobile ? (isLeft ? "STAND A" : "STAND B") : (isLeft ? "STAND 2F // SECTION-A" : "STAND 2F // SECTION-B");

        // -------------------------------------------------------
        // 1. 各段のステップ面塗り（踏み面＋蹴込み面）で階段状の厚みを完全表現
        // -------------------------------------------------------
        for (let s = 0; s < numSteps; s++) {
          const xFront = side * (wingBaseX + s * stepDepth);
          const xBack = side * (wingBaseX + (s + 1) * stepDepth);
          const yFloor = -10 - s * stepRise;
          const yPrevFloor = s === 0 ? 0 : -10 - (s - 1) * stepRise;

          // 1-A. 蹴込み面（垂直の立ち上がり壁：深い陰影）
          for (let z = standZStart; z < standZEnd; z += zStep) {
            const zNext = Math.min(standZEnd, z + zStep);
            const p1 = projectArena3D(xFront, yPrevFloor, z, w, h);
            const p2 = projectArena3D(xFront, yPrevFloor, zNext, w, h);
            const p3 = projectArena3D(xFront, yFloor, zNext, w, h);
            const p4 = projectArena3D(xFront, yFloor, z, w, h);

            if (p1 && p2 && p3 && p4) {
              gridCtx.save();
              gridCtx.beginPath();
              gridCtx.moveTo(p1.x, p1.y);
              gridCtx.lineTo(p2.x, p2.y);
              gridCtx.lineTo(p3.x, p3.y);
              gridCtx.lineTo(p4.x, p4.y);
              gridCtx.closePath();
              gridCtx.fillStyle = `rgba(5, 30, 50, 0.65)`;
              gridCtx.fill();
              gridCtx.lineWidth = 1.0;
              gridCtx.strokeStyle = `rgba(${themeRgb}, 0.35)`;
              gridCtx.stroke();
              gridCtx.restore();
            }

            // 1-B. 踏み面（水平の座席設置フロア：青みを帯びたコンクリートフロア）
            const pf1 = projectArena3D(xFront, yFloor, z, w, h);
            const pf2 = projectArena3D(xFront, yFloor, zNext, w, h);
            const pf3 = projectArena3D(xBack, yFloor, zNext, w, h);
            const pf4 = projectArena3D(xBack, yFloor, z, w, h);

            if (pf1 && pf2 && pf3 && pf4) {
              gridCtx.save();
              gridCtx.beginPath();
              gridCtx.moveTo(pf1.x, pf1.y);
              gridCtx.lineTo(pf2.x, pf2.y);
              gridCtx.lineTo(pf3.x, pf3.y);
              gridCtx.lineTo(pf4.x, pf4.y);
              gridCtx.closePath();
              gridCtx.fillStyle = isLeft ? "rgba(16, 95, 145, 0.65)" : "rgba(105, 80, 20, 0.65)";
              gridCtx.fill();

              // 段鼻（エッジ）の強力なノンスリップハイライトライン
              gridCtx.lineWidth = isMobile ? 1.5 : 2.0;
              gridCtx.strokeStyle = `rgba(255, 255, 255, 0.95)`;
              gridCtx.shadowColor = mainColor;
              setShadowBlur(isMobile ? 3 : 6);
              gridCtx.stroke();
              gridCtx.restore();
            }
          }

          // -------------------------------------------------------
          // 2. スタジアムシート（客席椅子）
          // モバイル時は軽量直方体ブロック（60fps）、PC時はフルディテール3Dチェア
          // -------------------------------------------------------
          if (isMobile) {
            // モバイル超軽量・高速描画: 1段あたり4〜5席のミニマルブロック（3,600回→50回の98%計算削減）
            const mSeatInterval = 90;
            for (let z = standZStart + 30; z <= standZEnd - 30; z += mSeatInterval) {
              if (Math.abs(z) < 40) continue;
              const seatCenterX = (xFront + xBack) * 0.5;
              const sp1 = projectArena3D(seatCenterX - 6 * side, yFloor - 4, z - 7, w, h);
              const sp2 = projectArena3D(seatCenterX + 6 * side, yFloor - 4, z - 7, w, h);
              const sp3 = projectArena3D(seatCenterX + 6 * side, yFloor - 14, z + 7, w, h);
              const sp4 = projectArena3D(seatCenterX - 6 * side, yFloor - 14, z + 7, w, h);
              if (sp1 && sp2 && sp3 && sp4) {
                gridCtx.fillStyle = `rgba(${themeRgb}, 0.85)`;
                gridCtx.beginPath();
                gridCtx.moveTo(sp1.x, sp1.y);
                gridCtx.lineTo(sp2.x, sp2.y);
                gridCtx.lineTo(sp3.x, sp3.y);
                gridCtx.lineTo(sp4.x, sp4.y);
                gridCtx.closePath();
                gridCtx.fill();
              }
            }
          } else {
            // PC用: フルディテール3Dハイエンドチェア（金属脚＋座面＋立体背もたれ＋ステッチ）
            const seatWidth = 30;
            const seatDepth = 32;
            const seatBackH = 26;
            const seatInterval = 54;

            for (let z = standZStart + 20; z <= standZEnd - 20; z += seatInterval) {
              if (Math.abs(z) < 50) continue;

              const seatCenterX = (xFront + xBack) * 0.5;
              const seatX1 = seatCenterX - (seatWidth * 0.5 * side);
              const seatX2 = seatCenterX + (seatWidth * 0.5 * side);
              const seatZ1 = z - seatDepth * 0.5;
              const seatZ2 = z + seatDepth * 0.5;
              const seatFloorY = yFloor;
              const seatTopY = yFloor - 8;

              // 脚
              const legBase = projectArena3D(seatCenterX, seatFloorY, z, w, h);
              const legTop = projectArena3D(seatCenterX, seatTopY, z, w, h);
              if (legBase && legTop) {
                gridCtx.save();
                gridCtx.lineWidth = 2.0;
                gridCtx.strokeStyle = "rgba(220, 240, 255, 0.85)";
                gridCtx.beginPath();
                gridCtx.moveTo(legBase.x, legBase.y);
                gridCtx.lineTo(legTop.x, legTop.y);
                gridCtx.stroke();
                gridCtx.restore();
              }

              // 座面
              const sp1 = projectArena3D(seatX1, seatTopY, seatZ1, w, h);
              const sp2 = projectArena3D(seatX2, seatTopY, seatZ1, w, h);
              const sp3 = projectArena3D(seatX2, seatTopY, seatZ2, w, h);
              const sp4 = projectArena3D(seatX1, seatTopY, seatZ2, w, h);

              // 背もたれ
              const sBackTopY = seatTopY - seatBackH;
              const sBackX = xBack - (4 * side);
              const sbp1 = projectArena3D(sBackX, seatTopY, seatZ1, w, h);
              const sbp2 = projectArena3D(sBackX, seatTopY, seatZ2, w, h);
              const sbp3 = projectArena3D(sBackX, sBackTopY, seatZ2, w, h);
              const sbp4 = projectArena3D(sBackX, sBackTopY, seatZ1, w, h);

              if (sp1 && sp2 && sp3 && sp4) {
                gridCtx.save();
                gridCtx.beginPath();
                gridCtx.moveTo(sp1.x, sp1.y);
                gridCtx.lineTo(sp2.x, sp2.y);
                gridCtx.lineTo(sp3.x, sp3.y);
                gridCtx.lineTo(sp4.x, sp4.y);
                gridCtx.closePath();
                gridCtx.fillStyle = `rgba(${seatBaseRgb}, 0.75)`;
                gridCtx.fill();
                gridCtx.lineWidth = 1.0;
                gridCtx.strokeStyle = isLeft ? "#A0E8FF" : "#FFF0A0";
                gridCtx.stroke();

                if (sbp1 && sbp2 && sbp3 && sbp4) {
                  gridCtx.beginPath();
                  gridCtx.moveTo(sbp1.x, sbp1.y);
                  gridCtx.lineTo(sbp2.x, sbp2.y);
                  gridCtx.lineTo(sbp3.x, sbp3.y);
                  gridCtx.lineTo(sbp4.x, sbp4.y);
                  gridCtx.closePath();
                  gridCtx.fillStyle = `rgba(${themeRgb}, 0.90)`;
                  gridCtx.fill();
                  gridCtx.lineWidth = 1.0;
                  gridCtx.strokeStyle = "#FFFFFF";
                  gridCtx.stroke();

                  const midTop = { x: (sbp3.x + sbp4.x) * 0.5, y: (sbp3.y + sbp4.y) * 0.5 };
                  const midBot = { x: (sbp1.x + sbp2.x) * 0.5, y: (sbp1.y + sbp2.y) * 0.5 };
                  gridCtx.beginPath();
                  gridCtx.moveTo(midTop.x, midTop.y);
                  gridCtx.lineTo(midBot.x, midBot.y);
                  gridCtx.strokeStyle = "rgba(255, 255, 255, 0.4)";
                  gridCtx.stroke();
                }
                gridCtx.restore();
              }
            }
          }

          // -------------------------------------------------------
          // 3. 各段の前面安全手すり（ハンドレール ＆ 支柱）
          // -------------------------------------------------------
          const railY = yFloor - (isMobile ? 11 : 22);
          const rPFront = projectArena3D(xFront, railY, standZStart, w, h);
          const rPBack = projectArena3D(xFront, railY, standZEnd, w, h);
          if (rPFront && rPBack) {
            gridCtx.save();
            gridCtx.lineWidth = isMobile ? 1.2 : 1.6;
            gridCtx.strokeStyle = "rgba(255, 255, 255, 0.85)";
            if (!isMobile) {
              gridCtx.shadowColor = "rgba(0, 0, 0, 0.5)";
              setShadowBlur(4);
            }
            gridCtx.beginPath();
            gridCtx.moveTo(rPFront.x, rPFront.y);
            gridCtx.lineTo(rPBack.x, rPBack.y);
            gridCtx.stroke();

            // 手すり支柱
            const railPillarStep = isMobile ? 180 : 110;
            for (let z = standZStart; z <= standZEnd; z += railPillarStep) {
              const bP = projectArena3D(xFront, yFloor, z, w, h);
              const tP = projectArena3D(xFront, railY, z, w, h);
              if (bP && tP) {
                gridCtx.beginPath();
                gridCtx.moveTo(bP.x, bP.y);
                gridCtx.lineTo(tP.x, tP.y);
                gridCtx.stroke();
              }
            }
            gridCtx.restore();
          }
        }

        // -------------------------------------------------------
        // 4. スタジアム案内サインプレート（一目でアリーナ客席とわかる決定打）
        // -------------------------------------------------------
        const signX = side * (wingBaseX + numSteps * stepDepth * 0.65);
        const signY = -10 - numSteps * stepRise - (isMobile ? 14 : 25);
        const signZ = 0;
        const signW = isMobile ? 85 : 180;
        const signH = isMobile ? 20 : 40;

        const spL = projectArena3D(signX - (signW * 0.5 * side), signY, signZ - (isMobile ? 18 : 30), w, h);
        const spR = projectArena3D(signX + (signW * 0.5 * side), signY, signZ + (isMobile ? 18 : 30), w, h);
        const spBotL = projectArena3D(signX - (signW * 0.5 * side), signY + signH, signZ - (isMobile ? 18 : 30), w, h);
        const spBotR = projectArena3D(signX + (signW * 0.5 * side), signY + signH, signZ + (isMobile ? 18 : 30), w, h);

        if (spL && spR && spBotL && spBotR) {
          gridCtx.save();
          gridCtx.beginPath();
          gridCtx.moveTo(spL.x, spL.y);
          gridCtx.lineTo(spR.x, spR.y);
          gridCtx.lineTo(spBotR.x, spBotR.y);
          gridCtx.lineTo(spBotL.x, spBotL.y);
          gridCtx.closePath();
          gridCtx.fillStyle = "rgba(7, 43, 66, 0.95)";
          gridCtx.fill();
          gridCtx.lineWidth = isMobile ? 1.4 : 2.0;
          gridCtx.strokeStyle = mainColor;
          gridCtx.shadowColor = mainColor;
          setShadowBlur(10);
          gridCtx.stroke();

          // 看板テキスト
          const signMidX = (spL.x + spR.x + spBotL.x + spBotR.x) * 0.25;
          const signMidY = (spL.y + spR.y + spBotL.y + spBotR.y) * 0.25;
          gridCtx.textAlign = "center";
          gridCtx.textBaseline = "middle";
          gridCtx.font = `900 ${isMobile ? 7.5 : 12}px monospace`;
          gridCtx.fillStyle = "#FFFFFF";
          gridCtx.fillText(signText, signMidX, signMidY);
          gridCtx.restore();
        }

        // -------------------------------------------------------
        // 5. アリーナ大型6連LED投光器バンク（スタジアムフラッドライト）
        // -------------------------------------------------------
        const floodX = side * (wingBaseX + numSteps * stepDepth + (isMobile ? 35 : 70));
        const floodY = isMobile ? -200 : -330;
        const floodZ = isMobile ? 80 : 120;
        const fOrigin = projectArena3D(floodX, floodY, floodZ, w, h);

        if (fOrigin) {
          gridCtx.save();
          // 投光器フレーム
          const fBoxW = isMobile ? 28 : 54;
          const fBoxH = isMobile ? 18 : 34;
          gridCtx.fillStyle = "rgba(10, 40, 65, 0.95)";
          gridCtx.strokeStyle = mainColor;
          gridCtx.lineWidth = isMobile ? 1.4 : 2.0;
          gridCtx.shadowColor = mainColor;
          setShadowBlur(isMobile ? 6 : 10);
          gridCtx.fillRect(fOrigin.x - fBoxW * 0.5, fOrigin.y - fBoxH * 0.5, fBoxW, fBoxH);
          gridCtx.strokeRect(fOrigin.x - fBoxW * 0.5, fOrigin.y - fBoxH * 0.5, fBoxW, fBoxH);

          // 6連LEDレンズ
          const cols = 3;
          const rows = 2;
          const rW = fBoxW / (cols + 1);
          const rH = fBoxH / (rows + 1);

          for (let r = 1; r <= rows; r++) {
            for (let c = 1; c <= cols; c++) {
              const lx = fOrigin.x - fBoxW * 0.5 + c * rW;
              const ly = fOrigin.y - fBoxH * 0.5 + r * rH;
              gridCtx.fillStyle = "#FFFFFF";
              gridCtx.shadowColor = mainColor;
              setShadowBlur(6);
              gridCtx.beginPath();
              gridCtx.arc(lx, ly, isMobile ? 1.8 : 3.5, 0, Math.PI * 2);
              gridCtx.fill();
            }
          }

          // 投光器からのドラマチックな照明コーン光
          gridCtx.globalCompositeOperation = "screen";
          const spotTargetX = fOrigin.x + (isLeft ? (isMobile ? -90 : -160) : (isMobile ? 90 : 160));
          const spotGrad = gridCtx.createLinearGradient(fOrigin.x, fOrigin.y, spotTargetX, fOrigin.y + (isMobile ? 180 : 250));
          spotGrad.addColorStop(0, `rgba(${themeRgb}, 0.85)`);
          spotGrad.addColorStop(0.35, `rgba(${themeRgb}, 0.38)`);
          spotGrad.addColorStop(0.7, `rgba(${themeRgb}, 0.12)`);
          spotGrad.addColorStop(1, `rgba(${themeRgb}, 0.0)`);

          gridCtx.fillStyle = spotGrad;
          gridCtx.beginPath();
          gridCtx.moveTo(fOrigin.x - (isMobile ? 12 : 16), fOrigin.y);
          gridCtx.lineTo(fOrigin.x + (isMobile ? 12 : 16), fOrigin.y);
          gridCtx.lineTo(spotTargetX + (isLeft ? (isMobile ? -75 : -130) : (isMobile ? 75 : 130)), fOrigin.y + (isMobile ? 220 : 320));
          gridCtx.lineTo(spotTargetX + (isLeft ? (isMobile ? 35 : 60) : (isMobile ? -35 : -60)), fOrigin.y + (isMobile ? 220 : 320));
          gridCtx.closePath();
          gridCtx.fill();
          gridCtx.restore();
        }

        // -------------------------------------------------------
        // 6. 天井立体鉄骨トラス梁（スタジアムルーフの重厚な梁構造）
        // -------------------------------------------------------
        const trussTopY = isMobile ? -230 : -380;
        const trussBotY = isMobile ? -180 : -300;
        const trussRootX = side * (wingBaseX + numSteps * stepDepth + (isMobile ? 45 : 90));
        const trussTipX = side * (wingBaseX - (isMobile ? 10 : 20));

        gridCtx.save();
        gridCtx.lineWidth = isMobile ? 1.2 : 1.6;
        gridCtx.strokeStyle = `rgba(${themeRgb}, 0.55)`;
        gridCtx.shadowColor = mainColor;
        setShadowBlur(6);

        const trussStep = isMobile ? 360 : 240;
        for (let tz = standZStart; tz <= standZEnd; tz += trussStep) {
          const pUpperRoot = projectArena3D(trussRootX, trussTopY, tz, w, h);
          const pUpperTip = projectArena3D(trussTipX, trussTopY + (isMobile ? 30 : 45), tz, w, h);
          const pLowerRoot = projectArena3D(trussRootX, trussBotY, tz, w, h);
          const pLowerTip = projectArena3D(trussTipX, trussBotY + (isMobile ? 30 : 45), tz, w, h);

          if (pUpperRoot && pUpperTip && pLowerRoot && pLowerTip) {
            gridCtx.beginPath();
            gridCtx.moveTo(pUpperRoot.x, pUpperRoot.y);
            gridCtx.lineTo(pUpperTip.x, pUpperTip.y);
            gridCtx.stroke();

            gridCtx.beginPath();
            gridCtx.moveTo(pLowerRoot.x, pLowerRoot.y);
            gridCtx.lineTo(pLowerTip.x, pLowerTip.y);
            gridCtx.stroke();

            gridCtx.beginPath();
            gridCtx.moveTo(pUpperRoot.x, pUpperRoot.y);
            gridCtx.lineTo(pLowerRoot.x, pLowerRoot.y);
            gridCtx.lineTo(pUpperTip.x, pUpperTip.y);
            gridCtx.lineTo(pLowerTip.x, pLowerTip.y);
            gridCtx.stroke();
          }
        }
        gridCtx.restore();
      });
    }

    if (!document.hidden) {
      gridAnimId = requestAnimationFrame(renderArenaGrid);
    }
  }
  let gridAnimId = requestAnimationFrame(renderArenaGrid);

  // -------------------------------------------------------------
  // Volumetric God Rays 光柱 & サンシャインフォトン微粒子
  // -------------------------------------------------------------
  const photons = [];
  const numPhotons = window.innerWidth < 768 ? 14 : 50;

  for (let i = 0; i < numPhotons; i++) {
    photons.push({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      vx: (Math.random() - 0.3) * 0.6,
      vy: -(Math.random() * 0.7 + 0.3),
      size: Math.random() * 2.8 + 1.2,
      baseAlpha: Math.random() * 0.45 + 0.25,
      twinkle: Math.random() * Math.PI * 2
    });
  }

  let raysTime = 0;

  function renderGodRays() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    raysCtx.clearRect(0, 0, w, h);

    raysTime += 0.015;
    const boost = arenaCamera.raysBoost;
    const isMobile = w < 768;

    const yawOffset = arenaCamera.yaw * (w * 0.4);
    const skylightSourceX = w * 0.22 + (mouseX - w * 0.5) * 0.12 + yawOffset;
    const skylightSourceY = -60;

    raysCtx.save();
    raysCtx.globalCompositeOperation = "screen";

    const rayDefinitions = isMobile
      ? [
          { angleDeg: 54 + arenaCamera.yaw * 16, spread: 280, baseAlpha: 0.30, speed: 0.7, offset: 0 },
          { angleDeg: 64 + arenaCamera.yaw * 20, spread: 380, baseAlpha: 0.35, speed: 0.6, offset: 2.5 },
          { angleDeg: 46 + arenaCamera.yaw * 12, spread: 220, baseAlpha: 0.24, speed: 1.0, offset: 4.2 }
        ]
      : [
          { angleDeg: 52 + arenaCamera.yaw * 15, spread: 260, baseAlpha: 0.28, speed: 0.7, offset: 0 },
          { angleDeg: 58 + arenaCamera.yaw * 18, spread: 340, baseAlpha: 0.34, speed: 0.9, offset: 1.2 },
          { angleDeg: 65 + arenaCamera.yaw * 22, spread: 420, baseAlpha: 0.38, speed: 0.6, offset: 2.5 },
          { angleDeg: 72 + arenaCamera.yaw * 16, spread: 310, baseAlpha: 0.26, speed: 0.8, offset: 3.8 },
          { angleDeg: 46 + arenaCamera.yaw * 12, spread: 220, baseAlpha: 0.22, speed: 1.1, offset: 4.7 }
        ];

    const mobDamp = isMobile ? 0.45 : 1.0;
    rayDefinitions.forEach((ray) => {
      const dynamicAlpha = ray.baseAlpha * (0.8 + Math.sin(raysTime * ray.speed + ray.offset) * 0.2) * boost * mobDamp;
      const rad = (ray.angleDeg * Math.PI) / 180;
      const beamLength = Math.max(w, h) * 1.6;

      const endCenterX = skylightSourceX + Math.cos(rad) * beamLength;
      const endCenterY = skylightSourceY + Math.sin(rad) * beamLength;

      const perpRad = rad + Math.PI / 2;
      const halfSpread = ray.spread * 0.5;

      const x1 = skylightSourceX - Math.cos(perpRad) * 20;
      const y1 = skylightSourceY - Math.sin(perpRad) * 20;
      const x2 = skylightSourceX + Math.cos(perpRad) * 20;
      const y2 = skylightSourceY + Math.sin(perpRad) * 20;

      const x3 = endCenterX + Math.cos(perpRad) * halfSpread;
      const y3 = endCenterY + Math.sin(perpRad) * halfSpread;
      const x4 = endCenterX - Math.cos(perpRad) * halfSpread;
      const y4 = endCenterY - Math.sin(perpRad) * halfSpread;

      const rayGrad = raysCtx.createLinearGradient(skylightSourceX, skylightSourceY, endCenterX, endCenterY);
      rayGrad.addColorStop(0, `rgba(255, 255, 255, ${dynamicAlpha * 0.95})`);
      rayGrad.addColorStop(0.25, `rgba(179, 229, 252, ${dynamicAlpha * 0.65})`);
      rayGrad.addColorStop(0.65, `rgba(44, 159, 216, ${dynamicAlpha * 0.35})`);
      rayGrad.addColorStop(1, "rgba(44, 159, 216, 0)");

      raysCtx.fillStyle = rayGrad;
      raysCtx.beginPath();
      raysCtx.moveTo(x1, y1);
      raysCtx.lineTo(x2, y2);
      raysCtx.lineTo(x3, y3);
      raysCtx.lineTo(x4, y4);
      raysCtx.closePath();
      raysCtx.fill();
    });

    // 浮遊するサンシャインフォトン微粒子
    photons.forEach((p) => {
      p.x += p.vx;
      p.y += p.vy;
      p.twinkle += 0.04;

      if (p.y < -20) { p.y = h + 20; p.x = Math.random() * w; }
      if (p.x < -20) p.x = w + 20;
      if (p.x > w + 20) p.x = -20;

      const photonAlpha = (p.baseAlpha * (0.6 + Math.sin(p.twinkle) * 0.4)) * boost;
      const photonGrad = raysCtx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 2.5);
      photonGrad.addColorStop(0, `rgba(255, 255, 255, ${photonAlpha})`);
      photonGrad.addColorStop(0.4, `rgba(129, 212, 250, ${photonAlpha * 0.6})`);
      photonGrad.addColorStop(1, "rgba(44, 159, 216, 0)");

      raysCtx.fillStyle = photonGrad;
      raysCtx.beginPath();
      raysCtx.arc(p.x, p.y, p.size * 2.5, 0, Math.PI * 2);
      raysCtx.fill();
    });

    raysCtx.restore();

    if (!document.hidden) {
      raysAnimId = requestAnimationFrame(renderGodRays);
    }
  }
  let raysAnimId = requestAnimationFrame(renderGodRays);

  // 省電力＆バックグラウンド時自動停止（Page Visibility API）
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) {
      if (!gridAnimId) gridAnimId = requestAnimationFrame(renderArenaGrid);
      if (!raysAnimId) raysAnimId = requestAnimationFrame(renderGodRays);
    } else {
      if (gridAnimId) cancelAnimationFrame(gridAnimId);
      if (raysAnimId) cancelAnimationFrame(raysAnimId);
      gridAnimId = null;
      raysAnimId = null;
    }
  });
})();

// ========================================================
// 12. アリーナ特設 3Dジャイアントビジョン（大型LEDジャンボトロン制御）
// 【完全汎用設計】後から動画ファイルを差し替えても自動適応
// ========================================================
(function initArenaJumbotron() {
  const video = document.getElementById("arenaVideoPlayer");
  const screenWrap = document.getElementById("jumbotronScreen");
  const centerPlayBtn = document.getElementById("centerPlayBtn");
  const playPauseBtn = document.getElementById("playPauseBtn");
  const timelineWrap = document.getElementById("timelineWrap");
  const timelineBar = document.getElementById("timelineBar");
  const timelineProgress = document.getElementById("timelineProgress");
  const timelineBuffered = document.getElementById("timelineBuffered");
  const currentTimeEl = document.getElementById("currentTime");
  const durationTimeEl = document.getElementById("durationTime");
  const volumeBtn = document.getElementById("volumeBtn");
  const volumeSlider = document.getElementById("volumeSlider");
  const fullscreenBtn = document.getElementById("fullscreenBtn");

  if (!video || !screenWrap) return;

  let isSeeking = false;
  let hideControlsTimeout = null;
  let lastVolume = 1;

  // 時間フォーマット（秒 -> MM:SS または HH:MM:SS）
  function formatTime(seconds) {
    if (isNaN(seconds) || !isFinite(seconds) || seconds < 0) return "0:00";
    const totalSecs = Math.floor(seconds);
    const hrs = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;
    const formattedSecs = secs < 10 ? `0${secs}` : `${secs}`;

    if (hrs > 0) {
      const formattedMins = mins < 10 ? `0${mins}` : `${mins}`;
      return `${hrs}:${formattedMins}:${formattedSecs}`;
    }
    return `${mins}:${formattedSecs}`;
  }

  // アイコン更新ヘルパー
  function updateIcon(elId, iconName) {
    const el = document.getElementById(elId);
    if (!el) return;
    el.setAttribute("data-lucide", iconName);
    if (window.lucide && typeof window.lucide.createIcons === "function") {
      window.lucide.createIcons();
    }
  }

  // 再生 / 一時停止トグル
  function togglePlay() {
    if (video.paused || video.ended) {
      video.play().catch(function (e) {
        console.warn("Video playback prevented:", e);
      });
    } else {
      video.pause();
    }
  }

  // メタデータロード（動画差し替え時にも自動発火）
  function onMetadataLoaded() {
    if (durationTimeEl) {
      durationTimeEl.textContent = formatTime(video.duration);
    }
    if (currentTimeEl) {
      currentTimeEl.textContent = formatTime(video.currentTime);
    }
    updateProgress();
    updateBuffer();
  }

  // 進捗更新
  function updateProgress() {
    if (isSeeking || !video.duration) return;
    const percent = (video.currentTime / video.duration) * 100;
    if (timelineProgress) {
      timelineProgress.style.width = `${percent}%`;
    }
    if (currentTimeEl) {
      currentTimeEl.textContent = formatTime(video.currentTime);
    }
  }

  // バッファ更新
  function updateBuffer() {
    if (!video.duration || !video.buffered.length || !timelineBuffered) return;
    try {
      const bufferedEnd = video.buffered.end(video.buffered.length - 1);
      const percent = (bufferedEnd / video.duration) * 100;
      timelineBuffered.style.width = `${Math.min(100, Math.max(0, percent))}%`;
    } catch (e) {}
  }

  // コントロール表示管理
  function resetControlsTimeout() {
    screenWrap.classList.remove("controls-hidden");
    clearTimeout(hideControlsTimeout);
    if (!video.paused && !video.ended) {
      hideControlsTimeout = setTimeout(function () {
        screenWrap.classList.add("controls-hidden");
      }, 2500);
    }
  }

  // シーク位置計算
  function seekToPosition(clientX) {
    if (!timelineBar || !video.duration) return;
    const rect = timelineBar.getBoundingClientRect();
    const pos = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    video.currentTime = pos * video.duration;
    if (timelineProgress) {
      timelineProgress.style.width = `${pos * 100}%`;
    }
    if (currentTimeEl) {
      currentTimeEl.textContent = formatTime(video.currentTime);
    }
  }

  // イベント登録: 再生状態
  video.addEventListener("play", function () {
    screenWrap.classList.add("is-playing");
    updateIcon("playIcon", "pause");
    resetControlsTimeout();
  });

  video.addEventListener("pause", function () {
    screenWrap.classList.remove("is-playing");
    screenWrap.classList.remove("controls-hidden");
    clearTimeout(hideControlsTimeout);
    updateIcon("playIcon", "play");
  });

  video.addEventListener("ended", function () {
    screenWrap.classList.remove("is-playing");
    screenWrap.classList.remove("controls-hidden");
    clearTimeout(hideControlsTimeout);
    updateIcon("playIcon", "play");
    if (timelineProgress) timelineProgress.style.width = "100%";
  });

  video.addEventListener("timeupdate", updateProgress);
  video.addEventListener("progress", updateBuffer);
  video.addEventListener("loadedmetadata", onMetadataLoaded);
  video.addEventListener("durationchange", onMetadataLoaded);

  // 初期メタデータ確認（すでにロード済みの場合へのケア）
  if (video.readyState >= 1) {
    onMetadataLoaded();
  }

  // 再生ボタンクリック
  if (centerPlayBtn) {
    centerPlayBtn.addEventListener("click", togglePlay);
  }
  if (playPauseBtn) {
    playPauseBtn.addEventListener("click", togglePlay);
  }

  // 動画エリアクリックで再生/一時停止
  video.addEventListener("click", function (e) {
    e.stopPropagation();
    togglePlay();
  });

  // マウスの動きでコントロール表示制御
  screenWrap.addEventListener("mousemove", resetControlsTimeout);
  screenWrap.addEventListener("touchstart", resetControlsTimeout, { passive: true });
  screenWrap.addEventListener("mouseleave", function () {
    if (!video.paused && !video.ended) {
      screenWrap.classList.add("controls-hidden");
    }
  });

  // シークバー操作（マウス ＆ タッチ完全対応）
  if (timelineWrap) {
    timelineWrap.addEventListener("mousedown", function (e) {
      isSeeking = true;
      seekToPosition(e.clientX);
    });

    window.addEventListener("mousemove", function (e) {
      if (isSeeking) {
        seekToPosition(e.clientX);
      }
    });

    window.addEventListener("mouseup", function () {
      if (isSeeking) {
        isSeeking = false;
      }
    });

    // タッチ操作
    timelineWrap.addEventListener("touchstart", function (e) {
      isSeeking = true;
      if (e.touches && e.touches[0]) {
        seekToPosition(e.touches[0].clientX);
      }
    }, { passive: true });

    window.addEventListener("touchmove", function (e) {
      if (isSeeking && e.touches && e.touches[0]) {
        seekToPosition(e.touches[0].clientX);
      }
    }, { passive: true });

    window.addEventListener("touchend", function () {
      if (isSeeking) {
        isSeeking = false;
      }
    });
  }

  // 音量スライダー
  if (volumeSlider) {
    volumeSlider.addEventListener("input", function () {
      const val = parseFloat(this.value);
      video.volume = val;
      video.muted = (val === 0);
      updateIcon("volumeIcon", val === 0 ? "volume-x" : val < 0.5 ? "volume-1" : "volume-2");
    });
  }

  // 音量ミュートトグル
  if (volumeBtn) {
    volumeBtn.addEventListener("click", function () {
      if (video.muted || video.volume === 0) {
        video.muted = false;
        video.volume = lastVolume > 0 ? lastVolume : 1;
        if (volumeSlider) volumeSlider.value = video.volume;
        updateIcon("volumeIcon", video.volume < 0.5 ? "volume-1" : "volume-2");
      } else {
        lastVolume = video.volume;
        video.muted = true;
        video.volume = 0;
        if (volumeSlider) volumeSlider.value = 0;
        updateIcon("volumeIcon", "volume-x");
      }
    });
  }

  // フルスクリーン切り替え
  if (fullscreenBtn) {
    fullscreenBtn.addEventListener("click", function () {
      const isFullscreen = document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement;
      if (!isFullscreen) {
        if (screenWrap.requestFullscreen) {
          screenWrap.requestFullscreen();
        } else if (screenWrap.webkitRequestFullscreen) {
          screenWrap.webkitRequestFullscreen();
        } else if (screenWrap.mozRequestFullScreen) {
          screenWrap.mozRequestFullScreen();
        } else if (screenWrap.msRequestFullscreen) {
          screenWrap.msRequestFullscreen();
        } else if (video.webkitEnterFullscreen) {
          video.webkitEnterFullscreen(); // iOS Safari fallback
        }
      } else {
        if (document.exitFullscreen) {
          document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
          document.webkitExitFullscreen();
        } else if (document.mozCancelFullScreen) {
          document.mozCancelFullScreen();
        } else if (document.msExitFullscreen) {
          document.msExitFullscreen();
        }
      }
    });

    document.addEventListener("fullscreenchange", function () {
      const isFs = !!(document.fullscreenElement || document.webkitFullscreenElement);
      updateIcon("fullscreenIcon", isFs ? "minimize" : "maximize");
    });
  }

  // キーボードショートカット（アクセシビリティ対応）
  window.addEventListener("keydown", function (e) {
    if (!document.body.classList.contains("page-movie")) return;
    if (["input", "textarea"].includes(document.activeElement.tagName.toLowerCase())) return;

    if (e.code === "Space") {
      e.preventDefault();
      togglePlay();
    } else if (e.code === "ArrowRight") {
      e.preventDefault();
      video.currentTime = Math.min(video.duration || 0, video.currentTime + 5);
      resetControlsTimeout();
    } else if (e.code === "ArrowLeft") {
      e.preventDefault();
      video.currentTime = Math.max(0, video.currentTime - 5);
      resetControlsTimeout();
    } else if (e.code === "KeyM") {
      e.preventDefault();
      if (volumeBtn) volumeBtn.click();
    } else if (e.code === "KeyF") {
      e.preventDefault();
      if (fullscreenBtn) fullscreenBtn.click();
    }
  });
})();

