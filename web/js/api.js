/* =========================================================
   标贝官网 · PC 端接口封装
   参考原官网源码 nuxtGw-master 与移动端 mobile/js/api.js：
     - src/api/index.js   → submitForm(/customer/demand/uploadV2)
     - src/plugins/api.js → axios 拦截器（code === "0" 视为成功）
     - src/components/Dialog/footerForm.vue → 留言 payload 构造 + 校验
   纯前端 fetch 实现，无框架依赖。
   ========================================================= */
(function (global) {
  'use strict';

  // 接口基址（对应 env.js 的 VUE_APP_BASE_API）
  var BASE_API = 'https://www.data-baker.com/official-website/v1/';

  // 读取百度 SEM bd_vid（参考 plugins/baidu.js 存储 + footerForm.vue 读取）
  function getBdVid() {
    var fromSession = '';
    try { fromSession = sessionStorage.getItem('biaobei_bd_vid') || ''; } catch (e) {}
    var fromUrl = '';
    try { fromUrl = new URL(window.location.href).searchParams.get('bd_vid') || ''; } catch (e) {}
    return fromSession || fromUrl || '';
  }

  // 构造百度转化跟踪列表（完全照搬 footerForm.vue submitForm 逻辑）
  function buildConversionTypeList(bdVid) {
    if (!bdVid) return [];
    var typeList = ['3', '75'];
    var href = window.location.href;
    var logidUrl = href.indexOf('bd_vid') !== -1
      ? href
      : href + (href.indexOf('?') !== -1 ? '&' : '?') + 'bd_vid=' + bdVid;
    return typeList.map(function (type) {
      return { logidUrl: logidUrl, newType: type || '' };
    });
  }

  // 手机号等校验（照搬 footerForm.vue 校验顺序与文案）
  function validateLead(form) {
    if (!form.customerName) return '请填写您的姓名';
    if (!form.customerMobile) return '请填写您的手机号';
    if (isNaN(form.customerMobile)) return '请输入正确的手机号';
    if (!/^1[3456789]\d{9}$/.test(form.customerMobile)) return '手机号格式不正确';
    if (!form.customerCompany) return '请填写您的公司名称';
    return '';
  }

  /**
   * 提交留言表单
   * @param {Object} form 表单字段：customerName / customerMobile / customerCompany /
   *                       customerEmail / customerPosition / customerGender / demandContent
   * @param {Object} opts { formType, sourceInfo, sourceDetail }
   * @returns {Promise} 成功 resolve 接口返回；失败 reject(Error)
   */
  function submitForm(form, opts) {
    opts = opts || {};
    var bdVid = getBdVid();

    // 与 footerForm.vue 一致的 payload 结构
    var payload = {
      customerName: form.customerName || '',
      customerGender: form.customerGender || '',
      customerMobile: form.customerMobile || '',
      customerCompany: form.customerCompany || '',
      customerPosition: form.customerPosition || '',
      customerEmail: form.customerEmail || '',
      demandContent: form.demandContent || '',
      formType: (opts.formType != null ? opts.formType : 1),
      sourceDetail: opts.sourceDetail || '',
      sourceInfo: (bdVid ? 'SEM-' : '') + (opts.sourceInfo || ''),
      sourceLanguage: 1,
      conversionTypeList: buildConversionTypeList(bdVid)
    };

    return fetch(BASE_API + 'customer/demand/uploadV2', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }).then(function (resp) {
      if (!resp.ok) throw new Error('网络异常，请稍后重试');
      return resp.json();
    }).then(function (res) {
      // 对应 plugins/api.js 拦截器：code === "0" 视为成功
      if (res && String(res.code) === '0') return res;
      throw new Error((res && (res.message || res.msg)) || '提交失败，请稍后重试');
    });
  }

  global.DataBakerAPI = {
    BASE_API: BASE_API,
    getBdVid: getBdVid,
    validateLead: validateLead,
    submitForm: submitForm
  };
})(window);
