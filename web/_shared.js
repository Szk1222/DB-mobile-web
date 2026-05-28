/* =========================================================
   标贝 Cyber · 共享行为（Header / Footer / Cursor / Reveal）
   ========================================================= */
(function () {

  /* ── 数据源 ─────────────────────────────────────── */
  const DATASETS = [
    { href: 'dataset_speech_asr.html',  name: '语音识别数据集', en: 'ASR Dataset',   icon: 'M12 2a3 3 0 0 1 3 3v7a3 3 0 0 1-6 0V5a3 3 0 0 1 3-3zm-7 9a7 7 0 0 0 14 0M12 19v3' },
    { href: 'dataset_speech_tts.html',  name: '语音合成数据集', en: 'TTS Dataset',   icon: 'M9 18V5l12-2v13M6 15a3 3 0 1 1 0 6 3 3 0 0 1 0-6zm12-2a3 3 0 1 1 0 6 3 3 0 0 1 0-6z' },
    { href: 'dataset_image.html',       name: '图像数据集',     en: 'Image Dataset', icon: 'M3 5h18M3 12h18M3 19h12' },
    { href: 'dataset_video.html',       name: '视频数据集',     en: 'Video Dataset', icon: 'M15 10l4.553-2.277A1 1 0 0 1 21 8.649v6.702a1 1 0 0 1-1.447.894L15 14M3 8a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8z' },
    { href: 'dataset_text.html',        name: '文本数据集',     en: 'Text Dataset',  icon: 'M4 6h16M4 10h16M4 14h10M4 18h6' },
    { href: 'dataset_llm.html',         name: '大模型数据集',   en: 'LLM Dataset',   icon: 'M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5' },
  ];

  const TOOLS_ANNOTATION = [
    { href: 'tool_annotation_3d.html',  name: '3D 点云标注',   en: '3D Point Cloud' },
    { href: 'tool_annotation_2d.html',  name: '2D 图像标注',   en: '2D Image' },
    { href: 'tool_annotation_tts.html', name: '语音合成标注',   en: 'TTS Annotation' },
    { href: 'tool_annotation_asr.html', name: '语音识别标注',   en: 'ASR Annotation' },
  ];
  const TOOLS_COLLECTION = [
    { href: 'tool_collection.html', name: '标贝易采', en: 'EasyColl' },
  ];
  const TOOLS_OPENPLATFORM = [
    { href: 'tool_openplatform.html', name: '开放平台', en: 'Open Platform' },
  ];
  const TOOLS_READER = [
    { href: 'tool_reader.html', name: '标贝悦读', en: 'YueReader' },
  ];

  const SOL_DATA_PRODUCT = [
    { href: 'solution_tts.html',  name: '语音合成',      en: 'TTS' },
    { href: 'solution_asr.html',  name: '语音识别',      en: 'ASR' },
    { href: 'solution_cv.html',   name: '计算机视觉',    en: 'CV' },
    { href: 'solution_nlp.html',  name: '自然语言处理',  en: 'NLP' },
    { href: 'solution_open.html', name: '开放数据',      en: 'Open Data' },
  ];
  const SOL_DATA_SERVICE = [
    { href: 'data_service_collection.html', name: '数据采集服务', en: 'Collection' },
    { href: 'data_service_annotation.html', name: '数据标注服务', en: 'Annotation' },
    { href: 'datasets_overview.html',       name: '成品数据集',   en: 'Datasets' },
    { href: 'solutions_overview.html',      name: '业务全览',     en: 'Overview' },
  ];
  const SOL_VOICE = [
    { href: 'voice_ai.html#asr',  name: 'ASR 语音识别', en: 'Speech Recognition', badge: '' },
    { href: 'voice_ai.html#tts',  name: 'TTS 语音合成', en: 'Text-to-Speech',     badge: '' },
    { href: 'voice_ai.html#ext',  name: '语音拓展',     en: 'Voice Extension',    badge: '' },
  ];

  /* ── 小工具 ─────────────────────────────────────── */
  const IC = `<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7h16M4 12h16M4 17h10"/></svg>`;

  function icPath(d) {
    return `<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="${d}"/></svg>`;
  }

  function badge(type) {
    if (!type) return '';
    const labels = { hot: 'HOT', new: 'NEW', free: '免费' };
    return `<span class="mega-badge badge-${type}">${labels[type] || type.toUpperCase()}</span>`;
  }

  /* 普通小下拉（数据集用） */
  function simpleMenu(items) {
    return `<div class="nav-menu">
      ${items.map(it => `
        <a href="${it.href}">
          <div class="mega-ds-icon">${icPath(it.icon)}</div>
          <span class="col"><span>${it.name}</span><small>${it.en}</small></span>
        </a>`).join('')}
    </div>`;
  }

  /* 二级标题箭头 */
  const MST_ARROW = `<svg class="mst-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>`;

  /* 二级标题：传入 href 时渲染为指向该栏总览的链接 */
  function sectionTitle(name, href) {
    return href
      ? `<a class="mega-section-title" href="${href}">${name}${MST_ARROW}</a>`
      : `<div class="mega-section-title">${name}</div>`;
  }

  /* Mega 列 */
  function megaCol(head, subhead, items, headHref) {
    const rows = items.map(it =>
      `<a href="${it.href}">${IC}<span>${it.name}</span>${it.badge ? badge(it.badge) : ''}</a>`
    ).join('');
    return `<div class="mega-col">
      ${head ? sectionTitle(head, headHref) : ''}
      ${subhead ? `<div class="mega-subhead">${subhead}</div>` : ''}
      ${rows}
    </div>`;
  }

  /* ── 当前页高亮 ──────────────────────────────────── */
  const cur = (location.pathname.split('/').pop() || 'homepage.html');

  function isActive(group) {
    if (group === 'home')      return cur === '' || cur === 'homepage.html' || cur === 'index.html';
    if (group === 'datasets')  return cur.startsWith('dataset_') || cur === 'datasets_overview.html';
    if (group === 'tools')     return cur.startsWith('tool_') || cur === 'tools_overview.html';
    if (group === 'solutions') return cur.startsWith('solution_') || cur === 'solutions_overview.html'
                                   || cur === 'voice_ai.html'
                                   || cur.startsWith('data_service_');
    if (group === 'about')     return cur === 'about.html';
    return false;
  }

  /* ── renderHeader ───────────────────────────────── */
  function renderHeader() {
    const el = document.getElementById('nav-placeholder');
    if (!el) return;

    /* 数据集 mega */
    const datasetsMega = `<div class="nav-mega" style="min-width:420px;">
      ${megaCol('语音数据', '', [DATASETS[0], DATASETS[1]], 'datasets_overview.html')}
      ${megaCol('视觉数据', '', [DATASETS[2], DATASETS[3]], 'datasets_overview.html')}
      ${megaCol('文本 & 大模型', '', [DATASETS[4], DATASETS[5]], 'datasets_overview.html')}
    </div>`;

    /* 工具平台 mega */
    const toolsMega = `<div class="nav-mega" style="min-width:520px;">
      <div class="mega-col" style="min-width:140px;">
        ${sectionTitle('标注平台', 'tools_overview.html')}
        ${TOOLS_ANNOTATION.map(it => `<a href="${it.href}">${IC}<span>${it.name}</span></a>`).join('')}
      </div>
      <div class="mega-col" style="min-width:120px;">
        ${sectionTitle('采集平台', 'tools_overview.html')}
        ${TOOLS_COLLECTION.map(it => `<a href="${it.href}">${IC}<span>${it.name}</span></a>`).join('')}
      </div>
      <div class="mega-col" style="min-width:120px;">
        ${sectionTitle('标贝悦读', 'tools_overview.html')}
        ${TOOLS_READER.map(it => `<a href="${it.href}">${IC}<span>${it.name}</span></a>`).join('')}
      </div>
      <div class="mega-col" style="min-width:120px;">
        ${sectionTitle('开放平台', 'tools_overview.html')}
        ${TOOLS_OPENPLATFORM.map(it => `<a href="${it.href}">${IC}<span>${it.name}</span></a>`).join('')}
      </div>
    </div>`;

    /* 解决方案 mega */
    const solMega = `<div class="nav-mega" style="min-width:520px;">
      <div class="mega-col" style="min-width:148px;">
        ${sectionTitle('数据产品', 'solutions_overview.html')}
        ${SOL_DATA_PRODUCT.map(it => `<a href="${it.href}">${IC}<span>${it.name}</span></a>`).join('')}
      </div>
      <div class="mega-col" style="min-width:148px;">
        ${sectionTitle('数据服务', 'solutions_overview.html')}
        ${SOL_DATA_SERVICE.map(it => `<a href="${it.href}">${IC}<span>${it.name}</span></a>`).join('')}
      </div>
      <div class="mega-col" style="min-width:160px;">
        ${sectionTitle('智能语音', 'voice_ai.html')}
        ${SOL_VOICE.map(it => `<a href="${it.href}">${IC}<span>${it.name}</span>${it.badge ? badge(it.badge) : ''}</a>`).join('')}
      </div>
    </div>`;

    el.innerHTML = `
      <header class="header" id="header">
        <div class="header-inner">
          <a href="homepage.html" class="logo" aria-label="标贝科技首页">
            <span class="logo-mark" aria-hidden="true">
              <span></span><span></span><span></span><span></span><span></span><span></span>
            </span>
            <span class="logo-text">
              <strong class="logo-name">标贝科技</strong>
              <span class="logo-en">DataBaker · AI Data</span>
            </span>
          </a>

          <nav class="nav" aria-label="主导航">
            <div class="nav-item">
              <a class="nav-link ${isActive('home') ? 'active' : ''}" href="homepage.html">首页</a>
            </div>

            <div class="nav-item">
              <a class="nav-link ${isActive('datasets') ? 'active' : ''}" href="datasets_overview.html">
                数据集
                <svg class="nav-caret" viewBox="0 0 10 10" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M2 4l3 3 3-3"/></svg>
              </a>
              ${datasetsMega}
            </div>

            <div class="nav-item">
              <a class="nav-link ${isActive('tools') ? 'active' : ''}" href="tools_overview.html">
                工具平台
                <svg class="nav-caret" viewBox="0 0 10 10" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M2 4l3 3 3-3"/></svg>
              </a>
              ${toolsMega}
            </div>

            <div class="nav-item">
              <a class="nav-link ${isActive('solutions') ? 'active' : ''}" href="solutions_overview.html">
                解决方案
                <svg class="nav-caret" viewBox="0 0 10 10" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M2 4l3 3 3-3"/></svg>
              </a>
              ${solMega}
            </div>

            <div class="nav-item">
              <a class="nav-link ${isActive('about') ? 'active' : ''}" href="about.html">关于我们</a>
            </div>
          </nav>

          <div class="header-cta">
            <a class="nav-tel" href="tel:4008982016">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.45 2 2 0 0 1 3.59 1.27h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7a2 2 0 0 1 1.72 2z"/></svg>
              400 898 2016
            </a>
            <a class="btn btn-primary btn-sm" onclick="openTrialModal()" href="javascript:void(0)">
              预约试用
              <svg class="btn-arrow" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </a>
          </div>
        </div>
      </header>`;
  }

  /* ── renderFooter ───────────────────────────────── */
  function renderFooter() {
    const el = document.getElementById('footer-placeholder');
    if (!el) return;
    el.innerHTML = `
      <footer class="footer">
        <div class="container">
          <div class="footer-main">
            <div class="footer-col">
              <h4>智能语音</h4>
              <a href="voice_ai.html#asr">ASR 语音识别</a>
              <a href="voice_ai.html#tts">TTS 语音合成</a>
              <a href="voice_ai.html#ext">语音拓展</a>
            </div>
            <div class="footer-col">
              <h4>AI 数据服务</h4>
              <div class="fc-group-head">数据产品</div>
              ${SOL_DATA_PRODUCT.map(s => `<a href="${s.href}">${s.name}</a>`).join('')}
              <div class="fc-group-head">数据服务</div>
              <a href="data_service_collection.html">数据采集服务</a>
              <a href="data_service_annotation.html">数据标注服务</a>
              <a href="tools_overview.html">工具平台</a>
            </div>
            <div class="footer-col">
              <h4>场景解决方案</h4>
              ${SOL_DATA_PRODUCT.map(s => `<a href="${s.href}">${s.name}解决方案</a>`).join('')}
              <a href="solutions_overview.html">解决方案总览</a>
            </div>
            <div class="footer-col">
              <h4>关于我们</h4>
              <a href="about.html">公司介绍</a>
              <a href="about.html">荣誉资质</a>
              <a href="homepage.html#news">最新动态</a>
              <a href="about.html#contact">联系我们</a>
              <a href="#">数据供应商加盟</a>
              <a href="#">技术产品销售渠道</a>
            </div>
            <div class="footer-info-col">
              <div class="fi-name">标贝科技有限公司</div>
              <div class="fi-row">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                <span>北京：北京市海淀区西小口路66号中关村东升科技园·北领地B-1楼4层</span>
              </div>
              <div class="fi-row">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                <span>青岛：山东省青岛市崂山区科苑纬一路一号创新园C座12层</span>
              </div>
              <div class="fi-row">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.45 2 2 0 0 1 3.59 1.27h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7a2 2 0 0 1 1.72 2z"/></svg>
                <a href="tel:4008982016">400 898 2016</a>
              </div>
              <div class="fi-row">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><path d="M22 6l-10 7L2 6"/></svg>
                <span>marketing@data-baker.com</span>
              </div>
              <div class="footer-qr-row">
                <div class="footer-qr-item">
                  <div class="fqr-box">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><path d="M14 14h3v3M17 17v3M14 17h.01M20 14v.01"/></svg>
                  </div>
                  <span>微信公众号</span>
                </div>
                <div class="footer-qr-item">
                  <div class="fqr-box">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                  </div>
                  <span>服务顾问</span>
                </div>
              </div>
            </div>
          </div>
          <div class="footer-subbar">
            <span><strong>数据供应商</strong><a href="https://distribute.ebiaoge.com/sp/formreport/distribute/TY0D2TKKVP/4748489893055628723" target="_blank" rel="noopener">入驻申请 &rsaquo;</a></span>
            <span class="fs-sep">|</span>
            <span><strong>技术产品销售渠道</strong><a href="https://distribute.ebiaoge.com/sp/formreport/distribute/ty0d2tkkvp/1476002722365784915" target="_blank" rel="noopener">联系销售 &rsaquo;</a></span>
          </div>
          <div class="footer-bottom">
            <div class="fb-links">
              <a href="#">标贝科技服务声明</a>
              <a href="#">个人信息保护政策</a>
              <a href="#">意见反馈</a>
              <span>鲁ICP备2023038621号</span>
            </div>
            <span>© 2025 DataBaker Technology · All rights reserved.</span>
          </div>
        </div>
      </footer>`;
  }

  /* ── renderSidebar（全局右侧侧栏 + 试用弹窗 + 在线咨询）── */
  function renderSidebar() {
    /* 侧栏 HTML */
    const sidebar = document.createElement('div');
    sidebar.className = 'sidebar-right';
    sidebar.id = 'sidebarRight';
    sidebar.innerHTML = `
      <button class="sidebar-btn" onclick="openChatPopup()" title="在线咨询">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
        <span class="sb-label">咨询</span>
      </button>
      <button class="sidebar-btn" onclick="openMessageModal()" title="留言">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v10c0 1.1-.9 2-2 2H8l-4 4V6c0-1.1.9-2 2-2z"/><path d="M8 9h8M8 13h5"/></svg>
        <span class="sb-label">留言</span>
      </button>
      <button class="sidebar-btn" title="客服二维码">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.45 2 2 0 0 1 3.59 1.27h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7a2 2 0 0 1 1.72 2z"/></svg>
        <span class="sb-label">客服</span>
        <div class="sb-qr-pop">
          <div class="qr-img">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><path d="M14 14h3v3M17 17v3M14 17h.01M20 14v.01"/></svg>
          </div>
          <p>扫码添加企业微信</p>
        </div>
      </button>
      <button class="sidebar-btn" onclick="openTrialModal()" title="预约试用">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><path d="M8 21h8M12 17v4"/></svg>
        <span class="sb-label">试用</span>
      </button>
      <button class="sb-collapse" onclick="document.getElementById('sidebarRight').classList.toggle('collapsed')" title="收起">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18l6-6-6-6"/></svg>
      </button>`;

    /* 试用弹窗 */
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.id = 'trialModal';
    modal.innerHTML = `
      <div class="modal-box">
        <div class="modal-left">
          <div class="modal-logo">
            <div class="modal-bars"><span></span><span></span><span></span><span></span><span></span><span></span></div>
            <h3>标贝科技</h3>
            <small>DataBaker Technology</small>
          </div>
          <div class="modal-tel">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.45 2 2 0 0 1 3.59 1.27h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7a2 2 0 0 1 1.72 2z"/></svg>
            400 898 2016
          </div>
        </div>
        <div class="modal-right">
          <button class="modal-close" onclick="closeTrialModal()">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
          <h2>联系我们</h2>
          <div class="mf-row">
            <div class="mf-field has-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              <input type="text" placeholder="* 请填写您的姓名" />
            </div>
          </div>
          <div class="mf-row">
            <div class="mf-gender">
              <label><input type="radio" name="gender" value="m" checked /> 男</label>
              <label><input type="radio" name="gender" value="f" /> 女</label>
            </div>
          </div>
          <div class="mf-row">
            <div class="mf-field has-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.45 2 2 0 0 1 3.59 1.27h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7a2 2 0 0 1 1.72 2z"/></svg>
              <input type="tel" placeholder="* 请填写您的手机号" />
            </div>
          </div>
          <div class="mf-row">
            <div class="mf-field has-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 2H8L2 7h20z"/></svg>
              <input type="text" placeholder="* 请填写您的公司名称" />
            </div>
          </div>
          <div class="mf-row">
            <div class="mf-field has-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><path d="M22 6l-10 7L2 6"/></svg>
              <input type="email" placeholder="请填写您的企业邮箱" />
            </div>
          </div>
          <div class="mf-row">
            <div class="mf-field">
              <input type="text" placeholder="请填写您的职位" />
            </div>
          </div>
          <div class="mf-row">
            <div class="mf-field">
              <textarea placeholder="请详细填写您的需求、数据规模、预留信息等，我们会反馈更快哦"></textarea>
            </div>
          </div>
          <button class="mf-submit">提 交</button>
        </div>
      </div>`;

    /* 在线咨询气泡 */
    const chat = document.createElement('div');
    chat.className = 'chat-popup';
    chat.id = 'chatPopup';
    chat.innerHTML = `
      <div class="cp-head">
        <span>在线咨询</span>
        <button class="cp-close" onclick="closeChatPopup()">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
        </button>
      </div>
      <div class="cp-body">
        <div class="cp-avatar">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
        </div>
        <p>您好！欢迎咨询标贝科技，我们的专属顾问将在工作时间内尽快回复。</p>
        <div class="cp-tel">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.45 2 2 0 0 1 3.59 1.27h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7a2 2 0 0 1 1.72 2z"/></svg>
          400 898 2016
        </div>
      </div>`;

    /* 留言弹窗 */
    const msgModal = document.createElement('div');
    msgModal.className = 'msg-modal';
    msgModal.id = 'messageModal';
    msgModal.innerHTML = `
      <div class="msg-box" role="dialog" aria-labelledby="msgModalTitle" aria-modal="true">
        <div class="msg-head">
          <span id="msgModalTitle">请您留言</span>
          <button class="msg-min" onclick="closeMessageModal()" aria-label="关闭" title="关闭">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M5 12h14"/></svg>
          </button>
        </div>
        <form class="msg-body" onsubmit="return submitMessageForm(event)" novalidate>
          <div class="msg-corp">
            <p class="msg-corp-name">北京标贝科技股份有限公司</p>
            <p class="msg-corp-tel">400-898-2016、010-8260-3083</p>
          </div>
          <div class="msg-field">
            <textarea name="content" rows="3" required placeholder="请在此输入留言内容，我们会尽快与您联系。（必填）"></textarea>
          </div>
          <div class="msg-field">
            <span class="msg-pre">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            </span>
            <input type="text" name="name" required placeholder="姓名（必填）" />
          </div>
          <div class="msg-field">
            <span class="msg-pre">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.45 2 2 0 0 1 3.59 1.27h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7a2 2 0 0 1 1.72 2z"/></svg>
            </span>
            <input type="tel" name="phone" required pattern="^[0-9+\\-\\s()]{6,20}$" placeholder="电话（必填）" />
          </div>
          <div class="msg-field">
            <span class="msg-pre">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
            </span>
            <input type="text" name="org" required placeholder="学校/企业（必填）" />
          </div>
          <div class="msg-field">
            <span class="msg-pre">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M22 6l-10 7L2 6"/></svg>
            </span>
            <input type="email" name="email" placeholder="邮箱" />
          </div>
          <div class="msg-actions">
            <button type="submit" class="msg-submit">提交</button>
          </div>
        </form>
      </div>`;

    document.body.appendChild(sidebar);
    document.body.appendChild(modal);
    document.body.appendChild(chat);
    document.body.appendChild(msgModal);

    /* 点击背景关闭弹窗 */
    modal.addEventListener('click', e => { if (e.target === modal) closeTrialModal(); });
    msgModal.addEventListener('click', e => { if (e.target === msgModal) closeMessageModal(); });
  }

  /* 全局暴露弹窗方法 */
  window.openTrialModal  = () => document.getElementById('trialModal').classList.add('is-open');
  window.closeTrialModal = () => document.getElementById('trialModal').classList.remove('is-open');
  window.openChatPopup   = () => document.getElementById('chatPopup').classList.add('is-open');
  window.closeChatPopup  = () => document.getElementById('chatPopup').classList.remove('is-open');
  window.openMessageModal = () => {
    const m = document.getElementById('messageModal');
    if (!m) return;
    m.classList.add('is-open');
    setTimeout(() => { const t = m.querySelector('textarea'); if (t) t.focus(); }, 80);
  };
  window.closeMessageModal = () => {
    const m = document.getElementById('messageModal');
    if (m) m.classList.remove('is-open');
  };
  window.submitMessageForm = (ev) => {
    ev.preventDefault();
    const form = ev.target;
    const fields = ['content','name','phone','org'];
    let firstInvalid = null;
    fields.forEach(n => {
      const el = form.elements[n];
      if (!el) return;
      const v = (el.value || '').trim();
      const ok = v && (n !== 'phone' || /^[0-9+\-\s()]{6,20}$/.test(v));
      el.closest('.msg-field').classList.toggle('is-invalid', !ok);
      if (!ok && !firstInvalid) firstInvalid = el;
    });
    if (firstInvalid) { firstInvalid.focus(); return false; }
    /* 模拟提交：实际项目可在此处替换为接口调用 */
    const btn = form.querySelector('.msg-submit');
    const old = btn.textContent;
    btn.disabled = true; btn.textContent = '提交中…';
    setTimeout(() => {
      btn.textContent = '✓ 提交成功';
      setTimeout(() => {
        form.reset();
        btn.disabled = false; btn.textContent = old;
        window.closeMessageModal();
      }, 900);
    }, 500);
    return false;
  };
  /* ESC 关闭留言弹窗 */
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      const m = document.getElementById('messageModal');
      if (m && m.classList.contains('is-open')) window.closeMessageModal();
    }
  });

  /* ── Cursor ─────────────────────────────────────── */
  function cursor() {
    if (!matchMedia('(hover: hover)').matches) return;
    if (document.querySelector('.cursor')) return;
    const wrap = document.createElement('div'); wrap.innerHTML = `
      <div class="cursor-glow" id="cursorGlow"></div>
      <div class="cursor" id="cursor">
        <svg viewBox="0 0 28 28" fill="none">
          <circle cx="14" cy="14" r="13" stroke-width="1" stroke-dasharray="3 3"/>
          <line x1="14" y1="3" x2="14" y2="9" stroke-width="1.2"/>
          <line x1="14" y1="19" x2="14" y2="25" stroke-width="1.2"/>
          <line x1="3" y1="14" x2="9" y2="14" stroke-width="1.2"/>
          <line x1="19" y1="14" x2="25" y2="14" stroke-width="1.2"/>
        </svg>
      </div>
      <div class="cursor-dot" id="cursorDot" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
          <path d="M4 3l9 18 2.6-6 5.4-2.1L4 3z"/>
        </svg>
      </div>`;
    [...wrap.children].forEach(c => document.body.appendChild(c));
    const c  = document.getElementById('cursor');
    const cd = document.getElementById('cursorDot');
    const cg = document.getElementById('cursorGlow');
    let tx=0, ty=0, dx=0, dy=0;
    addEventListener('mousemove', e => {
      tx = e.clientX; ty = e.clientY;
      cd.style.left = tx + 'px'; cd.style.top = ty + 'px';
      cg.style.left = tx + 'px'; cg.style.top = ty + 'px';
    });
    (function loop(){ dx += (tx - dx) * 0.18; dy += (ty - dy) * 0.18; c.style.left = dx + 'px'; c.style.top = dy + 'px'; requestAnimationFrame(loop); })();
    document.addEventListener('mouseover', e => { if (e.target.closest('a,button')) c.classList.add('is-link'); });
    document.addEventListener('mouseout',  e => { if (e.target.closest('a,button')) c.classList.remove('is-link'); });
  }

  function scrollProgress() {
    if (document.getElementById('scrollProgress')) return;
    const sp = document.createElement('div'); sp.className = 'scroll-progress'; sp.id = 'scrollProgress';
    document.body.prepend(sp);
    addEventListener('scroll', () => {
      const max = document.documentElement.scrollHeight - innerHeight;
      sp.style.transform = `scaleX(${Math.min(1, scrollY / Math.max(1, max))})`;
    });
  }

  function headerScroll() {
    const h = document.getElementById('header');
    if (!h) return;
    const sync = () => h.classList.toggle('is-scrolled', scrollY > 24);
    sync(); addEventListener('scroll', sync, { passive: true });
  }

  function reveal() {
    const io = new IntersectionObserver(es => es.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('is-visible'); io.unobserve(e.target); }
    }), { threshold: 0.08 });
    document.querySelectorAll('[data-reveal]').forEach(el => io.observe(el));
  }

  function init() {
    renderHeader();
    renderFooter();
    renderSidebar();
    cursor();
    scrollProgress();
    headerScroll();
    reveal();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
