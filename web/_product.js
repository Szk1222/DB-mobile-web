/* =========================================================
   标贝 Cyber · 产品详情页演示引擎
   读取 .demo-wrap[data-demo] 与 #pd-config(JSON)，注入并驱动演示。
   类型：asr / tts / convert / vpr / mos / selflearn
   ========================================================= */
(function () {
  /* ---------- 通用代码标签切换（API 区） ---------- */
  function bindCodeTabs() {
    var tabs = document.querySelectorAll('.code-tab');
    var panes = document.querySelectorAll('.code-pane');
    tabs.forEach(function (t) {
      t.addEventListener('click', function () {
        var k = t.getAttribute('data-code');
        tabs.forEach(function (x) { x.classList.toggle('on', x === t); });
        panes.forEach(function (p) { p.classList.toggle('on', p.getAttribute('data-code') === k); });
      });
    });
  }
  bindCodeTabs();

  var wrap = document.querySelector('.demo-wrap[data-demo]');
  if (!wrap) return;
  var TYPE = wrap.getAttribute('data-demo');
  var CFG = {};
  try {
    var cfgEl = document.getElementById('pd-config');
    if (cfgEl) CFG = JSON.parse(cfgEl.textContent);
  } catch (e) { CFG = {}; }

  /* ---------- 基础工具 ---------- */
  function buildBars(host, n) {
    var a = [];
    for (var i = 0; i < n; i++) {
      var b = document.createElement('i');
      b.style.height = '6px';
      host.appendChild(b);
      a.push(b);
    }
    return a;
  }
  function flat(b) { b.forEach(function (x) { x.style.height = '6px'; }); }
  function waveAnim(b) {
    var t = 0, id = null;
    return {
      start: function () {
        if (id) return;
        id = setInterval(function () {
          t++;
          b.forEach(function (x, i) {
            var base = Math.sin(t / 5 + i * 0.5);
            var env = Math.sin(t / 22 + i / 9);
            var h = 7 + Math.abs(base) * (0.45 + 0.55 * Math.random()) * Math.abs(env) * 60;
            x.style.height = h.toFixed(1) + 'px';
          });
        }, 55);
      },
      stop: function () { if (id) { clearInterval(id); id = null; } flat(b); }
    };
  }
  function streamText(textEl, caretEl, full, speed, done) {
    var i = 0;
    textEl.classList.remove('ph');
    textEl.textContent = '';
    caretEl.classList.add('on');
    textEl.appendChild(caretEl);
    var id = setInterval(function () {
      i++;
      textEl.textContent = full.slice(0, i);
      textEl.appendChild(caretEl);
      if (i >= full.length) {
        clearInterval(id);
        caretEl.classList.remove('on');
        if (done) done();
      }
    }, speed);
    return function () { clearInterval(id); caretEl.classList.remove('on'); };
  }
  function setPill(p, txt, cls) {
    p.className = 'st' + (cls ? ' ' + cls : '');
    p.querySelector('span').textContent = txt;
  }
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }

  var IC = {
    mic: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 2a3 3 0 0 1 3 3v7a3 3 0 0 1-6 0V5a3 3 0 0 1 3-3zm-7 9a7 7 0 0 0 14 0M12 19v3" stroke-linecap="round"/></svg>',
    play: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M7 4l13 8-13 8z"/></svg>',
    pause: '<svg viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/></svg>',
    file: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/></svg>',
    txt: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 6h16M4 12h16M4 18h10"/></svg>'
  };
  function headHTML(title) {
    return '<div class="demo-head"><span class="demo-dot r"></span><span class="demo-dot y"></span>' +
      '<span class="demo-dot g"></span><span class="demo-title">' + esc(title || 'Console') +
      '</span><span class="demo-live"><i></i>Engine Ready</span></div>';
  }
  function resultHTML(label, ph, rid, cid) {
    return '<div class="result-box"><div class="result-label">' + IC.txt + ' ' + esc(label) + '</div>' +
      '<div class="result-text ph" id="' + rid + '">' + esc(ph) + '<span class="caret" id="' + cid + '"></span></div></div>';
  }

  /* getUserMedia 波形（返回控制器） */
  function micWave(bars, onFail, onReady) {
    var stream = null, ctx = null, raf = null, alive = false;
    function stop() {
      alive = false;
      if (raf) cancelAnimationFrame(raf);
      if (stream) stream.getTracks().forEach(function (t) { t.stop(); });
      if (ctx) ctx.close().catch(function () {});
      stream = ctx = null;
      flat(bars);
    }
    async function start() {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) { onFail('当前浏览器不支持麦克风录音，请使用最新版 Chrome / Edge。'); return; }
      try { stream = await navigator.mediaDevices.getUserMedia({ audio: true }); }
      catch (e) { onFail('未能获取麦克风权限，请在浏览器允许麦克风访问后重试。'); return; }
      ctx = new (window.AudioContext || window.webkitAudioContext)();
      var src = ctx.createMediaStreamSource(stream);
      var an = ctx.createAnalyser();
      an.fftSize = 128;
      src.connect(an);
      var data = new Uint8Array(an.frequencyBinCount);
      alive = true;
      (function draw() {
        if (!alive) return;
        an.getByteFrequencyData(data);
        bars.forEach(function (b, i) { b.style.height = (6 + (data[i % data.length] / 255) * 64).toFixed(1) + 'px'; });
        raf = requestAnimationFrame(draw);
      })();
      if (onReady) onReady();
    }
    return { start: start, stop: stop };
  }

  /* speechSynthesis 朗读 */
  function speak(text, opt, onEnd) {
    opt = opt || {};
    if (!window.speechSynthesis || !window.SpeechSynthesisUtterance) { onEnd(false); return; }
    try { window.speechSynthesis.cancel(); } catch (e) {}
    var u = new SpeechSynthesisUtterance(text);
    u.lang = 'zh-CN';
    u.rate = opt.rate || 1;
    u.pitch = opt.pitch || 1;
    var vs = window.speechSynthesis.getVoices() || [];
    var zh = vs.filter(function (v) { return /zh|cmn|Chinese/i.test(v.lang + ' ' + v.name); });
    if (zh.length) u.voice = zh[(opt.vi || 0) % zh.length];
    u.onend = function () { onEnd(true); };
    u.onerror = function () { onEnd(false); };
    window.speechSynthesis.speak(u);
  }
  function stopSpeak() { try { window.speechSynthesis && window.speechSynthesis.cancel(); } catch (e) {} }
  if (window.speechSynthesis) { try { window.speechSynthesis.getVoices(); } catch (e) {} }
  window.addEventListener('beforeunload', stopSpeak);

  var q = function (s) { return wrap.querySelector(s); };

  /* =======================================================
     ASR · 语音转写演示
     ======================================================= */
  function initAsr() {
    var samples = CFG.samples || [];
    var fileMode = !!CFG.fileMode;
    var hasRec = CFG.record !== false;
    var tabs = '<div class="demo-tabs"><button class="demo-tab on" data-tab="a">' +
      (fileMode ? '示例文件' : '示例音频') + '</button>' +
      (hasRec ? '<button class="demo-tab" data-tab="b">实时录音</button>' : '') + '</div>';
    var panelA = '<div class="demo-panel on" data-panel="a">' +
      '<div class="smp-row" id="smpRow"></div>' +
      '<div class="stage"><div class="wave" id="wave"></div>' +
      (fileMode ? '<div class="file-prog" id="fileProg"><i></i></div>' : '') +
      '<div class="stage-foot"><button class="btn btn-primary btn-sm" id="goBtn">' +
      (fileMode ? '上传并识别' : '开始识别') + '</button>' +
      '<button class="btn btn-ghost btn-sm" id="resetBtn">重置</button>' +
      '<span class="st" id="st"><i></i><span>待机</span></span></div></div>' +
      resultHTML('识别结果 · Transcript', '选择' + (fileMode ? '示例文件' : '示例音频') + '后点击「' +
        (fileMode ? '上传并识别' : '开始识别') + '」，识别文本将在此呈现。', 'res', 'caret') +
      '<div class="metrics" id="metrics">' +
      '<div class="metric"><div class="v" id="m1">—</div><div class="k">识别置信度</div></div>' +
      '<div class="metric"><div class="v" id="m2">—</div><div class="k">识别耗时</div></div>' +
      '<div class="metric"><div class="v" id="m3">—</div><div class="k">输出字数</div></div></div></div>';
    var panelB = hasRec ? '<div class="demo-panel" data-panel="b">' +
      '<div class="stage"><div class="wave" id="recWave"></div></div>' +
      '<div class="rec-area"><button class="rec-btn" id="recBtn"><span class="rec-circle">' + IC.mic +
      '</span><span class="rec-label" id="recLabel">点击录音</span></button>' +
      '<span class="st" id="recSt"><i></i><span>待机</span></span>' +
      '<p class="rec-note">麦克风音频仅用于本页声波可视化，不会上传或存储。接入标贝接口后即可获得真实转写结果。</p>' +
      '<div class="demo-msg" id="recMsg"></div></div>' +
      resultHTML('识别结果 · Transcript', '点击麦克风开始录音，结束后展示演示转写结果。', 'recRes', 'recCaret') +
      '</div>' : '';
    wrap.innerHTML = headHTML(CFG.title || 'ASR Console') + tabs + panelA + panelB;

    var waveBars = buildBars(q('#wave'), 56);
    var wave = waveAnim(waveBars);
    var sel = 0, running = false, stopStream = null;
    var st = q('#st'), res = q('#res'), caret = q('#caret'), metrics = q('#metrics');
    var goBtn = q('#goBtn'), fileProg = q('#fileProg');

    var smpRow = q('#smpRow');
    samples.forEach(function (s, i) {
      var b = document.createElement('button');
      b.className = 'smp' + (i === 0 ? ' on' : '');
      b.innerHTML = '<span class="smp-ic">' + (fileMode ? IC.file : IC.mic) + '</span>' +
        '<span class="smp-meta"><b>' + esc(s.label) + '</b><span>' + esc(s.type + ' · ' + s.dur) + '</span></span>';
      b.addEventListener('click', function () {
        if (running) return;
        sel = i;
        wrap.querySelectorAll('.smp').forEach(function (x, xi) { x.classList.toggle('on', xi === i); });
        resetA();
      });
      smpRow.appendChild(b);
    });

    function resetA() {
      if (stopStream) { stopStream(); stopStream = null; }
      wave.stop();
      running = false;
      goBtn.disabled = false;
      res.classList.add('ph');
      res.textContent = '选择' + (fileMode ? '示例文件' : '示例音频') + '后点击「' +
        (fileMode ? '上传并识别' : '开始识别') + '」，识别文本将在此呈现。';
      res.appendChild(caret);
      caret.classList.remove('on');
      metrics.classList.remove('show');
      q('#m1').textContent = q('#m2').textContent = q('#m3').textContent = '—';
      if (fileProg) fileProg.firstChild.style.width = '0';
      setPill(st, '待机', '');
    }
    function runA() {
      if (running || !samples.length) return;
      var s = samples[sel];
      running = true;
      goBtn.disabled = true;
      metrics.classList.remove('show');
      wave.start();
      function doRecognize() {
        res.classList.remove('ph');
        res.textContent = '';
        res.appendChild(caret);
        stopStream = streamText(res, caret, s.text, 78, function () {
          wave.stop();
          setPill(st, '识别完成', 'done');
          q('#m1').textContent = s.conf.toFixed(1) + '%';
          q('#m2').textContent = s.ms + 'ms';
          q('#m3').textContent = s.text.length + ' 字';
          metrics.classList.add('show');
          running = false;
          goBtn.disabled = false;
        });
      }
      if (fileMode) {
        setPill(st, '上传中', 'busy');
        var p = 0;
        var pid = setInterval(function () {
          p += 6 + Math.random() * 12;
          if (p >= 100) { p = 100; clearInterval(pid); setPill(st, '识别中', 'busy'); setTimeout(doRecognize, 300); }
          fileProg.firstChild.style.width = p + '%';
        }, 110);
      } else {
        setPill(st, '识别中', 'busy');
        setTimeout(doRecognize, 480);
      }
    }
    goBtn.addEventListener('click', runA);
    q('#resetBtn').addEventListener('click', resetA);

    /* 录音 tab */
    if (hasRec) {
      var recBars = buildBars(q('#recWave'), 56);
      var recBtn = q('#recBtn'), recLabel = q('#recLabel'), recSt = q('#recSt'),
        recMsg = q('#recMsg'), recRes = q('#recRes'), recCaret = q('#recCaret');
      var recording = false;
      var mw = micWave(recBars, function (msg) {
        recMsg.textContent = msg; recMsg.classList.add('show');
      }, function () {
        recording = true;
        recBtn.classList.add('on');
        recLabel.textContent = '结束录音';
        recMsg.classList.remove('show');
        setPill(recSt, '录音中', 'busy');
      });
      recBtn.addEventListener('click', function () {
        if (recording) {
          recording = false;
          recBtn.classList.remove('on');
          recLabel.textContent = '点击录音';
          mw.stop();
          setPill(recSt, '识别中', 'busy');
          recRes.classList.remove('ph');
          recRes.textContent = '';
          recRes.appendChild(recCaret);
          setTimeout(function () {
            streamText(recRes, recCaret,
              '这是一段实时录音的演示识别结果，接入标贝语音识别接口后即可获得真实转写文本。', 70,
              function () { setPill(recSt, '识别完成 · 演示', 'done'); });
          }, 600);
        } else { mw.start(); }
      });
      wrap.__cleanup = mw.stop;
    }

    bindDemoTabs();
    resetA();
  }

  /* =======================================================
     TTS · 语音合成演示
     ======================================================= */
  function initTts() {
    var voices = CFG.voices || [];
    var limit = CFG.limit || 200;
    var cloneHTML = CFG.clone ? '<div class="clone-step" id="cloneStep">' +
      '<div class="clone-head"><span class="n">1</span>录入声音样本</div>' +
      '<p>点击下方按钮录制约 5 秒朗读样本，系统将复刻你的专属音色（演示为模拟流程，音频不上传）。</p>' +
      '<div class="btn-row"><button class="btn btn-primary btn-sm" id="cloneBtn">' + IC.mic.replace('width="1.8"', 'width="1.8" style="width:14px;height:14px"') + ' 开始录制样本</button>' +
      '<span class="st" id="cloneSt"><i></i><span>待录制</span></span></div></div>' : '';
    wrap.innerHTML = headHTML(CFG.title || 'TTS Studio') + '<div class="demo-body">' + cloneHTML +
      '<div class="field-label">' + (CFG.clone ? '② ' : '') + '合成文本（≤ ' + limit + ' 字）</div>' +
      '<textarea class="tts-input" id="ttsText" maxlength="' + limit + '">' + esc(CFG.text || '') + '</textarea>' +
      '<div class="char-count" id="cc"></div>' +
      '<div class="field-label">' + (CFG.clone ? '③ ' : '') + '选择音色</div>' +
      '<div class="voice-chips" id="voices"></div>' +
      '<div class="stage" style="margin-top:18px;"><div class="wave" id="wave"></div>' +
      '<div class="stage-foot"><button class="btn btn-primary btn-sm" id="goBtn">合成并播放</button>' +
      '<button class="btn btn-ghost btn-sm" id="stopBtn">停止</button>' +
      '<span class="st" id="st"><i></i><span>待机</span></span></div></div>' +
      '<div class="player"><button class="play-btn" id="playBtn">' + IC.play + '</button>' +
      '<div class="play-main"><div class="play-track"><div class="play-fill" id="fill"></div></div>' +
      '<div class="play-time" id="ptime">00:00 / 00:00</div></div></div>' +
      '<div class="demo-msg" id="msg"></div></div>';

    var bars = buildBars(q('#wave'), 56);
    var wave = waveAnim(bars);
    var st = q('#st'), text = q('#ttsText'), cc = q('#cc'), msg = q('#msg');
    var fill = q('#fill'), ptime = q('#ptime'), playBtn = q('#playBtn');
    var vsel = 0, playing = false, progId = null, cloned = false;

    function updCC() { cc.textContent = text.value.length + ' / ' + limit; }
    text.addEventListener('input', updCC); updCC();

    function renderVoices() {
      var host = q('#voices');
      host.innerHTML = '';
      voices.forEach(function (v, i) {
        var b = document.createElement('button');
        b.className = 'voice-chip' + (i === vsel ? ' on' : '');
        b.innerHTML = '<span class="vc-av">' + esc((v.name || 'V').slice(0, 1)) + '</span>' +
          '<span class="vc-meta"><b>' + esc(v.name) + '</b><span>' + esc(v.tag || '') + '</span></span>';
        b.addEventListener('click', function () {
          vsel = i;
          host.querySelectorAll('.voice-chip').forEach(function (x, xi) { x.classList.toggle('on', xi === i); });
        });
        host.appendChild(b);
      });
    }
    renderVoices();

    function fmt(s) { s = Math.max(0, Math.round(s)); return ('0' + Math.floor(s / 60)).slice(-2) + ':' + ('0' + (s % 60)).slice(-2); }
    function resetPlay() {
      if (progId) { clearInterval(progId); progId = null; }
      wave.stop();
      playing = false;
      playBtn.innerHTML = IC.play;
      fill.style.width = '0';
    }
    function synth() {
      if (playing) return;
      var t = text.value.trim();
      if (!t) { msg.textContent = '请输入要合成的文本。'; msg.classList.add('show'); return; }
      if (CFG.clone && !cloned) { msg.textContent = '请先完成第 ① 步：录入声音样本。'; msg.classList.add('show'); return; }
      msg.classList.remove('show');
      playing = true;
      playBtn.innerHTML = IC.pause;
      wave.start();
      setPill(st, '合成中', 'busy');
      var v = voices[vsel] || {};
      var dur = Math.max(1.6, t.length * 0.235 / (v.rate || 1));
      var elapsed = 0;
      progId = setInterval(function () {
        elapsed += 0.1;
        var pct = Math.min(100, elapsed / dur * 100);
        fill.style.width = pct + '%';
        ptime.textContent = fmt(elapsed) + ' / ' + fmt(dur);
        if (elapsed >= dur) { clearInterval(progId); progId = null; }
      }, 100);
      setPill(st, '播报中', 'busy');
      speak(t, { rate: v.rate || 1, pitch: v.pitch || 1, vi: v.vi || vsel }, function (ok) {
        resetPlay();
        fill.style.width = '100%';
        ptime.textContent = fmt(dur) + ' / ' + fmt(dur);
        setPill(st, '合成完成', 'done');
        if (!ok) { msg.textContent = '当前浏览器未启用语音播放，已展示可视化演示。接入标贝 TTS 接口可获得高保真音色。'; msg.classList.add('show'); }
      });
    }
    q('#goBtn').addEventListener('click', synth);
    q('#stopBtn').addEventListener('click', function () { stopSpeak(); resetPlay(); setPill(st, '已停止', ''); });
    playBtn.addEventListener('click', function () { if (playing) { stopSpeak(); resetPlay(); setPill(st, '已暂停', ''); } else { synth(); } });

    if (CFG.clone) {
      var cloneBtn = q('#cloneBtn'), cloneSt = q('#cloneSt'), cloneStep = q('#cloneStep');
      var recBars = null;
      cloneBtn.addEventListener('click', function () {
        if (cloned) return;
        cloneBtn.disabled = true;
        var c = 5;
        setPill(cloneSt, '录制中 ' + c + 's', 'busy');
        var cid = setInterval(function () {
          c--;
          if (c > 0) { setPill(cloneSt, '录制中 ' + c + 's', 'busy'); }
          else {
            clearInterval(cid);
            setPill(cloneSt, '声纹建模中', 'busy');
            setTimeout(function () {
              cloned = true;
              cloneStep.classList.add('done');
              setPill(cloneSt, '复刻完成', 'done');
              cloneBtn.textContent = '✓ 已生成专属音色';
              voices.unshift({ name: '我的复刻音色', tag: 'CLONED · 5S', rate: 1, pitch: 1 });
              vsel = 0;
              renderVoices();
            }, 900);
          }
        }, 1000);
      });
    }
    if (!window.speechSynthesis) {
      msg.textContent = '提示：当前浏览器不支持本地语音播放，演示将以波形可视化呈现。';
      msg.classList.add('show');
    }
  }

  /* =======================================================
     CONVERT · 声音转换演示
     ======================================================= */
  function initConvert() {
    var targets = CFG.targets || [];
    var sampleText = CFG.sampleText || '欢迎使用标贝智能语音技术。';
    wrap.innerHTML = headHTML(CFG.title || 'Voice Conversion') + '<div class="demo-body">' +
      '<div class="cv-grid">' +
      '<div class="cv-card"><div class="cv-cap">源音频 · Source</div>' +
      '<div style="font-family:var(--font-display);font-weight:600;color:var(--text-hi);">' + esc(CFG.source || '原始说话人') + '</div>' +
      '<div style="font-size:0.78rem;color:var(--text-dim);margin-top:4px;">' + esc(CFG.sourceTag || '中文 · 男声') + '</div></div>' +
      '<div class="cv-arrow"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M5 12h14M13 6l6 6-6 6"/></svg></div>' +
      '<div class="cv-card"><div class="cv-cap">目标音色 · Target</div>' +
      '<div style="font-family:var(--font-display);font-weight:600;color:var(--ac);" id="tgtName">—</div>' +
      '<div style="font-size:0.78rem;color:var(--text-dim);margin-top:4px;" id="tgtTag">请在下方选择</div></div></div>' +
      '<div class="field-label">选择目标音色</div><div class="voice-chips" id="targets"></div>' +
      '<div class="stage" style="margin-top:18px;"><div class="wave" id="wave"></div>' +
      '<div class="stage-foot"><button class="btn btn-primary btn-sm" id="goBtn">开始转换</button>' +
      '<span class="st" id="st"><i></i><span>待机</span></span></div></div>' +
      '<div class="player"><button class="play-btn" id="playBtn">' + IC.play + '</button>' +
      '<div class="play-main"><div class="play-track"><div class="play-fill" id="fill"></div></div>' +
      '<div class="play-time" id="ptime">转换结果 · 试听</div></div></div>' +
      '<div class="demo-msg" id="msg"></div></div>';

    var bars = buildBars(q('#wave'), 56);
    var wave = waveAnim(bars);
    var st = q('#st'), fill = q('#fill'), msg = q('#msg');
    var tsel = -1, running = false;

    var host = q('#targets');
    targets.forEach(function (v, i) {
      var b = document.createElement('button');
      b.className = 'voice-chip';
      b.innerHTML = '<span class="vc-av">' + esc((v.name || 'T').slice(0, 1)) + '</span>' +
        '<span class="vc-meta"><b>' + esc(v.name) + '</b><span>' + esc(v.tag || '') + '</span></span>';
      b.addEventListener('click', function () {
        tsel = i;
        host.querySelectorAll('.voice-chip').forEach(function (x, xi) { x.classList.toggle('on', xi === i); });
        q('#tgtName').textContent = v.name;
        q('#tgtTag').textContent = v.tag || '';
      });
      host.appendChild(b);
    });

    q('#goBtn').addEventListener('click', function () {
      if (running) return;
      if (tsel < 0) { msg.textContent = '请先选择目标音色。'; msg.classList.add('show'); return; }
      msg.classList.remove('show');
      running = true;
      wave.start();
      setPill(st, '转换中', 'busy');
      fill.style.width = '0';
      var p = 0;
      var pid = setInterval(function () {
        p += 5 + Math.random() * 9;
        if (p >= 100) {
          p = 100; clearInterval(pid);
          wave.stop();
          setPill(st, '转换完成 · 试听', 'done');
          running = false;
          var v = targets[tsel];
          speak(sampleText, { rate: v.rate || 1, pitch: v.pitch || 1, vi: v.vi || tsel }, function (ok) {
            if (!ok) { msg.textContent = '当前浏览器未启用语音播放，已展示可视化演示。'; msg.classList.add('show'); }
          });
        }
        fill.style.width = p + '%';
      }, 110);
    });
  }

  /* =======================================================
     VPR · 声纹识别演示
     ======================================================= */
  function initVpr() {
    var threshold = CFG.threshold || 85;
    wrap.innerHTML = headHTML(CFG.title || 'Voiceprint') + '<div class="demo-body">' +
      '<div class="vpr-grid">' +
      '<div class="vpr-card"><h4>① 注册声纹</h4><p>录制一段语音建立声纹模板</p>' +
      '<div class="wave" id="w1" style="width:100%;height:54px;"></div>' +
      '<button class="btn btn-primary btn-sm" id="enrollBtn">开始注册</button>' +
      '<span class="st" id="st1"><i></i><span>未注册</span></span></div>' +
      '<div class="vpr-card"><h4>② 验证声纹</h4><p>再次录音与模板比对身份</p>' +
      '<div class="gauge" id="gauge"><div class="gauge-in"><div><div class="gauge-v" id="gv">—</div>' +
      '<div class="gauge-k">MATCH</div></div></div></div>' +
      '<button class="btn btn-primary btn-sm" id="verifyBtn" disabled>开始验证</button>' +
      '<span class="st" id="st2"><i></i><span>待验证</span></span></div></div>' +
      '<div class="result-box"><div class="result-label">' + IC.txt + ' 验证结论</div>' +
      '<div class="result-text ph" id="vres">完成注册与验证后，此处显示身份比对结论。</div></div>' +
      '<div class="demo-msg" id="msg"></div></div>';

    var b1 = buildBars(q('#w1'), 40);
    var w1 = waveAnim(b1);
    var st1 = q('#st1'), st2 = q('#st2'), gauge = q('#gauge'), gv = q('#gv'),
      vres = q('#vres'), verifyBtn = q('#verifyBtn'), enrollBtn = q('#enrollBtn');
    var enrolled = false, busy = false;

    function sim(stPill, btn, label, cb) {
      if (busy) return;
      busy = true; btn.disabled = true;
      w1.start();
      var c = 3;
      setPill(stPill, label + ' ' + c + 's', 'busy');
      var id = setInterval(function () {
        c--;
        if (c > 0) setPill(stPill, label + ' ' + c + 's', 'busy');
        else {
          clearInterval(id);
          w1.stop();
          setPill(stPill, '建模中', 'busy');
          setTimeout(function () { busy = false; cb(); }, 800);
        }
      }, 1000);
    }
    enrollBtn.addEventListener('click', function () {
      sim(st1, enrollBtn, '录音', function () {
        enrolled = true;
        setPill(st1, '已注册', 'done');
        enrollBtn.textContent = '✓ 声纹已注册';
        verifyBtn.disabled = false;
      });
    });
    verifyBtn.addEventListener('click', function () {
      if (!enrolled) return;
      sim(st2, verifyBtn, '录音', function () {
        verifyBtn.disabled = false;
        var score = 88 + Math.random() * 11;          // 88 ~ 99
        var pass = score >= threshold;
        var cur = 0;
        var aid = setInterval(function () {
          cur += score / 22;
          if (cur >= score) { cur = score; clearInterval(aid); }
          gauge.style.background = 'conic-gradient(' + (pass ? 'var(--ac)' : '#ff6b6b') + ' ' + cur + '%, rgba(255,255,255,0.06) 0)';
          gv.textContent = cur.toFixed(1) + '%';
        }, 40);
        setPill(st2, pass ? '验证通过' : '验证未通过', pass ? 'done' : 'err');
        vres.classList.remove('ph');
        vres.innerHTML = pass
          ? '<b style="color:#44e08a;">✓ 身份验证通过</b> · 声纹匹配度 ' + score.toFixed(1) + '%，高于阈值 ' + threshold + '%，确认为同一说话人。'
          : '<b style="color:#ff6b6b;">✗ 身份验证未通过</b> · 声纹匹配度 ' + score.toFixed(1) + '%，低于阈值 ' + threshold + '%。';
      });
    });
  }

  /* =======================================================
     MOS · 合成系统评测演示
     ======================================================= */
  function initMos() {
    var systems = CFG.systems || [];
    wrap.innerHTML = headHTML(CFG.title || 'MOS Evaluation') + '<div class="demo-body">' +
      '<div class="field-label">评测文本</div>' +
      '<div style="padding:13px 16px;border:1px solid var(--line);border-radius:10px;background:rgba(5,10,26,0.6);color:var(--text);font-size:0.92rem;">' +
      esc(CFG.sampleText || '标贝科技为多语种与方言提供专业的语音合成系统评测服务。') + '</div>' +
      '<div class="field-label">参评系统 · MOS 主观评分（满分 5.0）</div>' +
      '<div class="mos-list" id="mosList"></div>' +
      '<div class="stage-foot" style="margin-top:18px;"><button class="btn btn-primary btn-sm" id="goBtn">运行评测</button>' +
      '<button class="btn btn-ghost btn-sm" id="resetBtn">重置</button>' +
      '<span class="st" id="st"><i></i><span>待机</span></span></div>' +
      '<div class="result-box"><div class="result-label">' + IC.txt + ' 评测结论</div>' +
      '<div class="result-text ph" id="mres">点击「运行评测」，系统将给出各参评系统的 MOS 评分与排名。</div></div></div>';

    var list = q('#mosList'), st = q('#st'), mres = q('#mres');
    var rows = [];
    systems.forEach(function (s) {
      var row = document.createElement('div');
      row.className = 'mos-row';
      row.innerHTML = '<div class="mos-name">' + (s.self ? '<b>' + esc(s.name) + '</b>' : esc(s.name)) + '</div>' +
        '<div class="mos-bar"><div class="mos-fill"></div></div><div class="mos-val">—</div>';
      list.appendChild(row);
      rows.push({ fill: row.querySelector('.mos-fill'), val: row.querySelector('.mos-val'), data: s });
    });
    var done = false;
    function reset() {
      done = false;
      rows.forEach(function (r) { r.fill.style.width = '0'; r.val.textContent = '—'; });
      mres.classList.add('ph');
      mres.textContent = '点击「运行评测」，系统将给出各参评系统的 MOS 评分与排名。';
      setPill(st, '待机', '');
    }
    q('#goBtn').addEventListener('click', function () {
      if (done) return;
      done = true;
      setPill(st, '评测中', 'busy');
      rows.forEach(function (r) {
        r.fill.style.width = (r.data.mos / 5 * 100) + '%';
        var cur = 0;
        var id = setInterval(function () {
          cur += r.data.mos / 26;
          if (cur >= r.data.mos) { cur = r.data.mos; clearInterval(id); }
          r.val.textContent = cur.toFixed(2);
        }, 38);
      });
      setTimeout(function () {
        setPill(st, '评测完成', 'done');
        var best = systems.slice().sort(function (a, b) { return b.mos - a.mos; })[0];
        mres.classList.remove('ph');
        mres.innerHTML = '评测完成 · 共 ' + systems.length + ' 个系统参评，<b style="color:var(--ac);">' +
          esc(best.name) + '</b> 以 MOS <b>' + best.mos.toFixed(2) + '</b> 综合排名第一，自然度与清晰度表现最优。';
      }, 1100);
    });
    q('#resetBtn').addEventListener('click', reset);
    reset();
  }

  /* =======================================================
     SELFLEARN · 自学习工具演示
     ======================================================= */
  function initSelflearn() {
    var preset = CFG.presetHotwords || [];
    var before = CFG.before || 92.1, after = CFG.after || 98.7;
    wrap.innerHTML = headHTML(CFG.title || 'Self-Learning') + '<div class="demo-body">' +
      '<div class="field-label">领域热词 · ' + esc(CFG.domain || '专有名词') + '</div>' +
      '<div class="hw-input-row"><input class="hw-input" id="hwInput" placeholder="输入热词后按回车或点击添加，如：标贝科技" />' +
      '<button class="btn btn-ghost btn-sm" id="addBtn">添加</button></div>' +
      '<div class="hw-tags" id="hwTags"></div>' +
      '<div class="stage-foot" style="margin-top:18px;"><button class="btn btn-primary btn-sm" id="goBtn">开始训练优化</button>' +
      '<span class="st" id="st"><i></i><span>待训练</span></span></div>' +
      '<div class="file-prog" id="prog" style="margin-top:14px;"><i></i></div>' +
      '<div class="cmp-grid" id="cmp">' +
      '<div class="cmp-box"><div class="cmp-v" id="cmpB">—</div><div class="cmp-k">训练前准确率</div></div>' +
      '<div class="cv-arrow"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M5 12h14M13 6l6 6-6 6"/></svg></div>' +
      '<div class="cmp-box after"><div class="cmp-v" id="cmpA">—</div><div class="cmp-k">训练后准确率</div></div></div>' +
      '<div class="demo-msg" id="msg"></div></div>';

    var tags = preset.slice();
    var hwTags = q('#hwTags'), input = q('#hwInput'), st = q('#st'),
      prog = q('#prog').firstChild, cmp = q('#cmp'), msg = q('#msg');
    function render() {
      hwTags.innerHTML = '';
      tags.forEach(function (t, i) {
        var s = document.createElement('span');
        s.className = 'hw-tag';
        s.innerHTML = esc(t) + ' <button aria-label="删除">&times;</button>';
        s.querySelector('button').addEventListener('click', function () { tags.splice(i, 1); render(); });
        hwTags.appendChild(s);
      });
    }
    render();
    function add() {
      var v = input.value.trim();
      if (!v) return;
      if (tags.indexOf(v) < 0) tags.push(v);
      input.value = '';
      render();
    }
    q('#addBtn').addEventListener('click', add);
    input.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); add(); } });

    var trained = false;
    q('#goBtn').addEventListener('click', function () {
      if (trained) return;
      if (!tags.length) { msg.textContent = '请至少添加一个领域热词后再开始训练。'; msg.classList.add('show'); return; }
      msg.classList.remove('show');
      trained = true;
      setPill(st, '训练中', 'busy');
      var p = 0;
      var id = setInterval(function () {
        p += 3 + Math.random() * 7;
        if (p >= 100) {
          p = 100; clearInterval(id);
          setPill(st, '训练完成', 'done');
          cmp.classList.add('show');
          countTo(q('#cmpB'), before, '%');
          countTo(q('#cmpA'), after, '%');
        }
        prog.style.width = p + '%';
      }, 120);
    });
    function countTo(el, target, suf) {
      var cur = 0;
      var id = setInterval(function () {
        cur += target / 30;
        if (cur >= target) { cur = target; clearInterval(id); }
        el.textContent = cur.toFixed(1) + suf;
      }, 34);
    }
  }

  /* ---------- demo 内 tab 切换 ---------- */
  function bindDemoTabs() {
    var tabs = wrap.querySelectorAll('.demo-tab');
    var panels = wrap.querySelectorAll('.demo-panel');
    tabs.forEach(function (t) {
      t.addEventListener('click', function () {
        var k = t.getAttribute('data-tab');
        tabs.forEach(function (x) { x.classList.toggle('on', x === t); });
        panels.forEach(function (p) { p.classList.toggle('on', p.getAttribute('data-panel') === k); });
        if (wrap.__cleanup) wrap.__cleanup();
        stopSpeak();
      });
    });
  }

  /* ---------- 分发 ---------- */
  var map = { asr: initAsr, tts: initTts, convert: initConvert, vpr: initVpr, mos: initMos, selflearn: initSelflearn };
  if (map[TYPE]) {
    try { map[TYPE](); } catch (e) {
      wrap.innerHTML = headHTML('Demo') + '<div class="demo-body"><div class="demo-msg show">演示组件加载失败：' + esc(e.message) + '</div></div>';
    }
  }
})();
