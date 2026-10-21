/**
 * RE:CREATION 2026 - Centralized Web Components
 * <site-header> & <site-footer>
 * 
 * 全16ページ共通のヘッダー・モバイルドロワー・3DアリーナCanvas・フッター・戻るボタンを一元管理。
 * file:/// 直接起動、ローカルサーバー、Cloudflare Pages のどこでもCORSエラーなく即座に稼働。
 */

(function () {
  'use strict';

  // 現在のページ名を判定
  function getCurrentPage() {
    const path = window.location.pathname;
    const page = path.substring(path.lastIndexOf('/') + 1) || 'index.html';
    return page.toLowerCase();
  }

  // 競技詳細サブページかどうか
  function isSubKyougiPage(page) {
    return ['relay.html', 'dojji.html', 'tunahiki.html', 'kamihikouki.html', 'ninnkyaku.html'].includes(page);
  }

  // ========================================================
  // <site-header> Web Component
  // ========================================================
  class SiteHeader extends HTMLElement {
    connectedCallback() {
      this.render();
      this.initEvents();
    }

    render() {
      const curPage = getCurrentPage();
      const isSub = isSubKyougiPage(curPage);

      // 1. 3DアリーナCanvas 4要素が未存在の場合は自動注入（sennsyu.htmlはurokoパターンのため除外）
      if (curPage !== 'sennsyu.html' && !document.getElementById('arena-grid-canvas')) {
        const bgFrag = document.createDocumentFragment();
        
        const canvasGrid = document.createElement('canvas');
        canvasGrid.id = 'arena-grid-canvas';
        
        const canvasRays = document.createElement('canvas');
        canvasRays.id = 'god-rays-canvas';
        
        const glow = document.createElement('div');
        glow.className = 'skylight-ambient-glow';
        
        const strip = document.createElement('div');
        strip.className = 'skylight-roof-strip';
        
        bgFrag.appendChild(canvasGrid);
        bgFrag.appendChild(canvasRays);
        bgFrag.appendChild(glow);
        bgFrag.appendChild(strip);
        
        document.body.insertBefore(bgFrag, document.body.firstChild);
      }

      // デスクトップナビのリンク定義
      const desktopLinks = [
        { href: 'index.html', label: 'ホーム', key: 'index.html' },
        { href: 'sennsyu.html', label: '出場選手', key: 'sennsyu.html' },
        { href: 'kyougi.html', label: '競技一覧', key: 'kyougi.html', matchSub: true },
        { href: 'basyo.html', label: '集合場所', key: 'basyo.html' },
        { href: 'cosplay.html', label: 'コスプレ大会', key: 'cosplay.html' },
        { href: 'photospot.html', label: 'フォトスポット', key: 'photospot.html' },
        { href: 'ranking.html', label: 'ランキング', key: 'ranking.html' }
      ];

      const desktopNavHtml = desktopLinks.map(link => {
        const isActive = (curPage === link.key) || (link.matchSub && isSub);
        return `<li><a href="${link.href}"${isActive ? ' class="active"' : ''}>${link.label}</a></li>`;
      }).join('\n            ');

      // モバイルドロワーのリンク定義
      const drawerLinks = [
        { href: 'index.html', label: 'トップ', icon: 'home', key: 'index.html' },
        { href: 'sennsyu.html', label: '出場選手', icon: 'users', key: 'sennsyu.html' },
        { href: 'kyougi.html', label: '競技一覧', icon: 'trophy', key: 'kyougi.html', matchSub: true },
        { href: 'basyo.html', label: '集合場所・座席', icon: 'map-pin', key: 'basyo.html' },
        { href: 'cosplay.html', label: 'コスプレ大会', icon: 'sparkles', key: 'cosplay.html' },
        { href: 'photospot.html', label: 'フォトスポット', icon: 'camera', key: 'photospot.html' },
        { href: 'ranking.html', label: 'ランキング', icon: 'medal', key: 'ranking.html' },
        { href: 'appli.html', label: '呼び出しアプリ', icon: 'bell', key: 'appli.html' },
        { href: 'cyuui.html', label: '注意事項', icon: 'shield-alert', key: 'cyuui.html' },
        { href: 'situmonn.html', label: 'Q&A (よくある質問)', icon: 'help-circle', key: 'situmonn.html' },
        { href: 'movie.html', label: 'ムービー紹介', icon: 'film', key: 'movie.html' }
      ];

      const drawerNavHtml = drawerLinks.map(link => {
        const isActive = (curPage === link.key) || (link.matchSub && isSub);
        return `<li><a href="${link.href}"${isActive ? ' class="active"' : ''}><span><i data-lucide="${link.icon}"></i> ${link.label}</span> <i data-lucide="chevron-right"></i></a></li>`;
      }).join('\n        ');

      this.innerHTML = `
    <!-- GLOBAL FLOATING HEADER -->
    <header id="header">
      <div class="header-container">
        
        <div class="header-brand">
          <a href="index.html">
            <img src="images/title-text1.png" alt="RE:CREATION">
            <span class="brand-badge">2026</span>
          </a>
        </div>

        <nav class="desktop-nav">
          <ul>
            ${desktopNavHtml}
          </ul>
        </nav>

        <div class="header-actions">
          <div class="hamburger-box">
            <div class="hamburger">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        </div>

      </div>
    </header>

    <!-- Mobile Navigation Drawer -->
    <nav class="mobile-nav-drawer">
      <ul>
        ${drawerNavHtml}
      </ul>
    </nav>
      `;

      if (window.lucide) {
        lucide.createIcons();
      }
    }

    initEvents() {
      const drawer = this.querySelector('.mobile-nav-drawer');
      const hamburgerBoxes = this.querySelectorAll('.hamburger-box');
      const hamburgerIcons = this.querySelectorAll('.hamburger');

      if (!drawer || drawer.dataset.drawerBound) return;
      drawer.dataset.drawerBound = 'true';

      function toggleDrawer(e) {
        if (e) {
          e.preventDefault();
          e.stopPropagation();
        }
        const willOpen = !drawer.classList.contains('active');
        hamburgerIcons.forEach(icon => {
          if (willOpen) icon.classList.add('active');
          else icon.classList.remove('active');
        });
        if (willOpen) drawer.classList.add('active');
        else drawer.classList.remove('active');
      }

      hamburgerBoxes.forEach(btn => {
        btn.addEventListener('click', toggleDrawer);
        btn.addEventListener('touchend', function (e) {
          toggleDrawer(e);
        }, { passive: false });
      });

      // リンククリック時に閉じる
      const links = drawer.querySelectorAll('a');
      links.forEach(link => {
        link.addEventListener('click', () => {
          hamburgerIcons.forEach(icon => icon.classList.remove('active'));
          drawer.classList.remove('active');
        });
      });

      // 外側クリックで閉じる
      document.addEventListener('click', e => {
        if (!e.target.closest('#header, .mobile-nav-drawer, .hamburger-box, .hamburger')) {
          hamburgerIcons.forEach(icon => icon.classList.remove('active'));
          drawer.classList.remove('active');
        }
      });
    }
  }

  // ========================================================
  // <site-footer> Web Component
  // ========================================================
  class SiteFooter extends HTMLElement {
    connectedCallback() {
      this.render();
      this.initEvents();
    }

    render() {
      this.innerHTML = `
    <!-- Floating Back to Top Button -->
    <button id="backToTop" class="back-to-top" title="トップへ戻る">▲</button>

    <!-- Footer -->
    <footer id="footer">
      <div class="footer-inner">
        <div class="header-brand">
          <img src="images/title-text1.png" alt="RE:CREATION">
        </div>
        <nav class="footer-nav">
          <a href="index.html">ホーム</a>
          <a href="sennsyu.html">出場選手</a>
          <a href="kyougi.html">競技一覧</a>
          <a href="basyo.html">集合場所</a>
          <a href="cosplay.html">コスプレ大会</a>
          <a href="photospot.html">フォトスポット</a>
          <a href="ranking.html">ランキング</a>
          <a href="appli.html">呼び出しアプリ</a>
          <a href="cyuui.html">注意事項</a>
          <a href="situmonn.html">Q&A</a>
          <a href="movie.html">ムービー</a>
        </nav>
        <p class="footer-copy">©2026 RE:CREATION STAFF. ALL RIGHTS RESERVED.</p>
      </div>
    </footer>
      `;

      if (window.lucide) {
        lucide.createIcons();
      }
    }

    initEvents() {
      const btn = this.querySelector('#backToTop');
      if (!btn) return;

      window.addEventListener('scroll', () => {
        if (window.scrollY > 300) {
          btn.classList.add('show');
        } else {
          btn.classList.remove('show');
        }
      }, { passive: true });

      btn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }
  }

  // Web Components 登録
  if (!customElements.get('site-header')) {
    customElements.define('site-header', SiteHeader);
  }
  if (!customElements.get('site-footer')) {
    customElements.define('site-footer', SiteFooter);
  }

})();
