(function () {
  "use strict";
  const pages = [
    ["index.html", "ホーム", "home"],
    ["sennsyu.html", "出場選手", "users"],
    ["kyougi.html", "競技一覧", "trophy"],
    ["basyo.html", "集合場所", "map-pin"],
    ["cosplay.html", "コスプレ大会", "sparkles"],
    ["ranking.html", "ランキング", "medal"]
  ];
  const extraPages = [
    ["appli.html", "呼び出しアプリ", "bell"],
    ["cyuui.html", "注意事項", "shield-alert"],
    ["situmonn.html", "Q&A（よくある質問）", "help-circle"],
    ["movie.html", "ムービー紹介", "film"]
  ];
  const current = location.pathname.split("/").pop() || "index.html";
  const active = (href) => href === current ? ' class="active" aria-current="page"' : '';
  const link = ([href, label, icon], mobile) => mobile
    ? `<li><a href="${href}"${active(href)}><span><i data-lucide="${icon}"></i> ${label}</span><i data-lucide="chevron-right"></i></a></li>`
    : `<li><a href="${href}"${active(href)}>${label}</a></li>`;

  const headerHost = document.querySelector("[data-site-header]");
  if (headerHost) {
    headerHost.outerHTML = `<header id="header">
      <div class="header-container">
        <div class="header-brand"><a href="index.html"><img src="images/title-text1.png" alt="RE:CREATION"><span class="brand-badge">2026 FESTIVAL</span></a></div>
        <nav class="desktop-nav" aria-label="メインナビゲーション"><ul>${pages.map(p => link(p, false)).join("")}</ul></nav>
        <div class="header-actions"><button type="button" class="hamburger-box" aria-label="メニューを開く" aria-expanded="false" aria-controls="mobile-navigation"><span class="hamburger" aria-hidden="true"><span></span><span></span><span></span></span></button></div>
      </div>
    </header>`;
  }
  const mobileHost = document.querySelector("[data-site-mobile-nav]");
  if (mobileHost) {
    mobileHost.outerHTML = `<nav id="mobile-navigation" class="mobile-nav-drawer" aria-label="モバイルナビゲーション"><ul>${pages.concat(extraPages).map(p => link(p, true)).join("")}</ul></nav>`;
  }
  const footerHost = document.querySelector("[data-site-footer]");
  if (footerHost) {
    const footerPages = pages.concat(extraPages);
    footerHost.outerHTML = `<footer id="footer"><div class="footer-inner"><div class="header-brand"><a href="index.html"><img src="images/title-text1.png" alt="RE:CREATION"></a></div><nav class="footer-nav" aria-label="フッターナビゲーション">${footerPages.map(([href,label]) => `<a href="${href}">${label}</a>`).join("")}</nav><p class="footer-copy">©2026 RE:CREATION STAFF. ALL RIGHTS RESERVED.</p></div></footer>`;
  }
  if (window.lucide) window.lucide.createIcons();
})();
