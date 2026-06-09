/* =========================================================
   标贝官网 · PC 端百度统计 / 爱番番在线咨询 / OCPC 转化跟踪
   参考原官网源码 nuxtGw-master：src/plugins/baidu.js 与移动端 mobile/js/baidu.js
   爱番番（商桥）在线咨询通过「百度统计 hm.js」加载，
   消息轮询(site/poll) / 沟通结束后“继续对话” / 客服离线“在线留言” 均由 SDK 原生提供。
   ⚠️ 需在爱番番后台「网站域名白名单」加入本页所在正式域名，否则不会接通真人客服。
   ========================================================= */
(function () {
  'use strict';

  // 存储百度 SEM bd_vid，供留言表单上报转化（参考 baidu.js router.afterEach）
  try {
    var bdVid = new URL(window.location.href).searchParams.get('bd_vid');
    if (bdVid) sessionStorage.setItem('biaobei_bd_vid', bdVid);
  } catch (e) {}

  // 仅在正式域名加载第三方脚本（localhost / 内网预览不加载，避免无效请求与控制台报错）
  var host = location.hostname;
  var isProd = /(^|\.)data-baker\.com$/.test(host);
  if (!isProd) return;

  // 百度统计 + 爱番番在线咨询（hm.js 的 siteToken 与官网一致）
  window._hmt = window._hmt || [];
  (function () {
    var hm = document.createElement('script');
    hm.src = 'https://hm.baidu.com/hm.js?a7d02161dca6e88e2a515aa026b89035';
    var s = document.getElementsByTagName('script')[0];
    s.parentNode.insertBefore(hm, s);
  })();

  // OCPC 百度转化跟踪（参考 baidu.js）
  window._agl = window._agl || [];
  (function () {
    window._agl.push(['production', '_f7L2XwGXjyszb4d1e2oxPybgD']);
    var agl = document.createElement('script');
    agl.type = 'text/javascript';
    agl.async = true;
    agl.src = 'https://fxgate.baidu.com/angelia/fcagl.js?production=_f7L2XwGXjyszb4d1e2oxPybgD';
    var s = document.getElementsByTagName('script')[0];
    s.parentNode.insertBefore(agl, s);
  })();
})();
