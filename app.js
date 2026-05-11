/**
 * 日记页日期固定为 4/25，不随系统时间变化
 */
(function () {
  const weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const DIARY_FIXED_DATE_YEAR = 2026;
  const DIARY_FIXED_DATE_MONTH = 4;
  const DIARY_FIXED_DATE_DAY = 25;
  const fixedDate = new Date(DIARY_FIXED_DATE_YEAR, DIARY_FIXED_DATE_MONTH - 1, DIARY_FIXED_DATE_DAY);

  const el = {
    month: document.getElementById("display-month"),
    day: document.getElementById("display-day"),
    year: document.getElementById("display-year"),
    weekday: document.getElementById("display-weekday"),
  };

  if (el.month && el.day && el.year && el.weekday) {
    el.month.textContent = months[fixedDate.getMonth()];
    el.day.textContent = String(DIARY_FIXED_DATE_DAY);
    el.year.textContent = String(DIARY_FIXED_DATE_YEAR);
    el.weekday.textContent = weekdays[fixedDate.getDay()];
  }

  const toggles = document.querySelectorAll(".block__toggle");
  const tabButtons = document.querySelectorAll(".tab__item[data-tab]");
  const views = document.querySelectorAll(".view[data-view]");

  for (const toggle of toggles) {
    const block = toggle.closest(".block");
    if (!block) continue;
    const titleText = block.querySelector(".block__title-text");

    function toggleBlockCollapsed() {
      const isCollapsed = block.classList.contains("block--collapsed");
      block.classList.toggle("block--collapsed", !isCollapsed);
      toggle.setAttribute("aria-expanded", String(isCollapsed));
    }

    toggle.addEventListener("click", function () {
      toggleBlockCollapsed();
    });

    /* 标题文字与圆点都可触发同一收起/展开动画 */
    if (titleText) {
      titleText.setAttribute("role", "button");
      titleText.setAttribute("tabindex", "0");
      titleText.setAttribute("aria-expanded", toggle.getAttribute("aria-expanded") || "false");
      titleText.addEventListener("click", function () {
        toggleBlockCollapsed();
        titleText.setAttribute("aria-expanded", toggle.getAttribute("aria-expanded") || "false");
      });
      titleText.addEventListener("keydown", function (evt) {
        if (evt.key !== "Enter" && evt.key !== " ") return;
        evt.preventDefault();
        toggleBlockCollapsed();
        titleText.setAttribute("aria-expanded", toggle.getAttribute("aria-expanded") || "false");
      });
    }
  }

  function switchTab(tabName) {
    for (const btn of tabButtons) {
      const isActive = btn.dataset.tab === tabName;
      btn.classList.toggle("tab__item--active", isActive);
      btn.setAttribute("aria-current", isActive ? "page" : "false");
    }
    for (const view of views) {
      view.classList.toggle("view--active", view.dataset.view === tabName);
    }
    if (typeof window !== "undefined" && typeof window.dispatchEvent === "function") {
      try {
        window.dispatchEvent(new CustomEvent("trace:tabchange", { detail: { tab: tabName } }));
      } catch (e) {}
    }
  }

  for (const btn of tabButtons) {
    btn.addEventListener("click", function () {
      const target = btn.dataset.tab;
      switchTab(target);
    });
  }

  function markTodayOnCalendar() {
    const grid = document.querySelector(".calendar-grid");
    if (!grid || !grid.dataset.year || !grid.dataset.month) return;
    const y = parseInt(grid.dataset.year, 10);
    const m = parseInt(grid.dataset.month, 10);
    if (Number.isNaN(y) || Number.isNaN(m)) return;

    const prev = grid.querySelector(".calendar-grid__day--today");
    if (prev) prev.classList.remove("calendar-grid__day--today");

    if (y !== DIARY_FIXED_DATE_YEAR || m !== DIARY_FIXED_DATE_MONTH) return;

    const d = String(DIARY_FIXED_DATE_DAY);
    const cell = grid.querySelector('.calendar-grid__day[data-day="' + d + '"]');
    if (cell) cell.classList.add("calendar-grid__day--today");
  }

  markTodayOnCalendar();

  const generateBtn = document.getElementById("generate-image-btn");
  const generateBtnLabel = document.getElementById("generate-image-btn-label");
  const addToCalendarBtn = document.getElementById("add-to-calendar-btn");
  const downloadImageBtn = document.getElementById("download-image-btn");
  const downloadActions = document.getElementById("download-actions");
  const feedbackLikeBtn = document.getElementById("feedback-like-btn");
  const feedbackDislikeBtn = document.getElementById("feedback-dislike-btn");
  const hero = document.querySelector(".hero");
  const heroImg = document.getElementById("hero-generated");
  const statusEl = document.getElementById("generate-status");
  const allInputs = Array.from(document.querySelectorAll(".input--area"));
  const calendarGrid = document.getElementById("calendar-grid");
  const calendarDayModal = document.getElementById("calendar-day-modal");
  const calendarDayModalZoom = document.getElementById("calendar-day-modal-zoom");
  const calendarDayModalClose = document.getElementById("calendar-day-modal-close");
  const calendarDayModalPrev = document.getElementById("calendar-day-modal-prev");
  const calendarDayModalNext = document.getElementById("calendar-day-modal-next");
  const calendarDayViewDiaryBtn = document.getElementById("calendar-day-view-diary-btn");
  const calendarDiaryModal = document.getElementById("calendar-diary-modal");
  const calendarDiaryModalBack = document.getElementById("calendar-diary-modal-back");
  const calendarDiaryModalClose = document.getElementById("calendar-diary-modal-close");
  const calendarDiaryArchive = document.getElementById("calendar-diary-archive");
  const calendarDiaryTitle = document.getElementById("calendar-diary-title");
  const scratchSourceModal = document.getElementById("scratch-source-modal");
  const scratchSourceModalClose = document.getElementById("scratch-source-modal-close");
  const scratchSourceTitle = document.getElementById("scratch-source-title");
  const scratchSourceGratitude = document.getElementById("scratch-source-gratitude");
  const scratchSourceViewFullBtn = document.getElementById("scratch-source-view-full-btn");
  const calendarAnalysisModal = document.getElementById("calendar-analysis-modal");
  const calendarAnalysisGridHost = document.getElementById("calendar-analysis-grid-host");
  const calendarAnalysisDeleteBtn = document.getElementById("calendar-analysis-delete-btn");
  const calendarAnalysisRunBtn = document.getElementById("calendar-analysis-run-btn");
  const calendarAnalysisStepDate = document.getElementById("calendar-analysis-step-date");
  const calendarAnalysisStepType = document.getElementById("calendar-analysis-step-type");
  const calendarAnalysisBackBtn = document.getElementById("calendar-analysis-back-btn");
  const calendarAnalysisConfirmBtn = document.getElementById("calendar-analysis-confirm-btn");
  const calendarAnalysisOptEmotion = document.getElementById("calendar-analysis-option-emotion");
  const calendarAnalysisOptHidden = document.getElementById("calendar-analysis-option-hidden");
  const calendarAnalysisModalClose = document.getElementById("calendar-analysis-modal-close");
  const calendarPageSearchBtn = document.querySelector(".calendar-page-head__search-btn");
  var calendarAnalysisPendingRun = null;

  function resetCalendarAnalysisModalSteps() {
    calendarAnalysisPendingRun = null;
    if (calendarAnalysisStepDate) calendarAnalysisStepDate.hidden = false;
    if (calendarAnalysisStepType) calendarAnalysisStepType.hidden = true;
    if (calendarAnalysisOptEmotion) calendarAnalysisOptEmotion.checked = false;
    if (calendarAnalysisOptHidden) calendarAnalysisOptHidden.checked = false;
  }

  function showCalendarAnalysisTypeStep() {
    if (calendarAnalysisOptEmotion) calendarAnalysisOptEmotion.checked = false;
    if (calendarAnalysisOptHidden) calendarAnalysisOptHidden.checked = false;
    if (calendarAnalysisStepDate) calendarAnalysisStepDate.hidden = true;
    if (calendarAnalysisStepType) calendarAnalysisStepType.hidden = false;
  }

  function showCalendarAnalysisDateStep() {
    if (calendarAnalysisStepDate) calendarAnalysisStepDate.hidden = false;
    if (calendarAnalysisStepType) calendarAnalysisStepType.hidden = true;
  }
  /* v2：换新 key，旧的 v1 草稿不再读出，演示页打开时不会因历史 localStorage 出现旧内容 */
  const DRAFT_PREFIX = "trace:diaryDraft:v2:";
  const DIARY_ARCHIVE_KEY = "trace:diaryArchive:v1";
  const CALENDAR_PRESET_DAY_IMAGES = {
    "1": "assets/day-1.png",
    "9": "assets/day-9.png",
    "10": "assets/day-10.png",
    "14": "assets/day-14.png",
    "16": "assets/day-16.png",
    "21": "assets/day-21.png",
    "22": "assets/day-22.png",
    "24": "assets/day-24.png",
  };
  const CALENDAR_PRESET_DAY_ARCHIVES = {
    "21": {
      gratitude: [
        "今天下午面试了PolyU ISD。我觉得我发挥的还不错，和面试官聊的很开心！ISD这个项目挺难进的。面试竟然有点重塑我的信心了。",
        "住我楼上的朋友F（女生）从春假旅游完回来了，我23:30的时候去她家串门，她给煮了泡面给我吃。我和她一直闲聊到了凌晨4:00AM，真喜欢和朋友聊天。",
        "今天个人网站整理算是有一定推进。",
      ],
      improve: [
        "我今天早上睁眼的时候心情差到极点。很焦虑即将到来的面试，即将到来的毕业感到让我很恐慌，和朋友们的分别也让我很忧伤。这种感觉太难受了，焦虑迷茫和惆怅混杂在一起，压倒了我。这种情绪的出现，是不是换季的原因？可能我下次早一些起床会好点。",
        "今天起床太晚，导致没时间吃早饭了。下次要给自己留出至少吃一个鸡蛋的时间。",
      ],
      affirm: ["保持对世界的好奇，才是维持动力的基础！"],
    },
    "22": {
      gratitude: [
        "我去家后面扔垃圾的时候，碰巧撞见了穿着睡衣开门拿外卖的V（男生），我们对视的时候大笑。他邀请我去他家吃晚饭。于是我19:30去了，他做了牛肉和西红柿鸡蛋，我们一起看了四五集美剧。V数了数日历，还有9周就毕业了，我心里有点难过。但是既然无法阻挡时间的流逝，就过好每一天吧。",
        "今天下午跟G（男生）和G的妈妈在ID楼里聊天聊的很开心。",
        "今天天气很美丽，心情在白天就很好。其实温度还是不高，但至少阳光好，去trader joes买东西都是高兴的。",
      ],
      improve: ["和人聊天聊多了，计划都没有推进。", "我还是需要起床起得更早啊！"],
      affirm: ["我是喜欢交互设计的，我看教程都会进入心流状态。"],
    },
    "24": {
      gratitude: [
        "21:30去了朋友S家里坐了一会，躺在沙发上和她聊天，朋友X躺在地上的垫子上。好久没见过他们了，聊聊天还是很开心，聊工作，就业，未来，焦虑也会缓解一点。",
        "20:00（天刚刚黑）和朋友们去看了J的乐队的表演，在布朗大学的草坪上，同学们成群结队，欢声笑语。大家在台下尖叫和搞怪地喊J的名字。这是J的乐队在大学期间最后一次表演了。",
        "晚上和室友L聊天到凌晨一点，她讲了她的一些焦虑和小烦恼。L突然说，“跟你聊天很缓解治愈呀queen，谁再敢说你太理性了。我觉得你情感挺细腻的。”",
      ],
      improve: ["晚上回家后有点没力气，应该晚上work一会的。", "晚饭的时候对朋友们态度有一点急，这样不好。"],
      affirm: ["有未来，有喘息，有朋友。生活多好呀！继续加油！！"],
    },
  };
  var lastGeneratedUserPromptForFeedback = "";
  var selectedCalendarDateKey = "";
  /** 分析弹窗内选日顺序（字符串 day），用于「删除」只撤销最近一次选择 */
  var calendarAnalysisSelectionStack = [];

  function draftKeyForIndex(i) {
    return DRAFT_PREFIX + i;
  }

  function loadDiaryDrafts() {
    if (typeof localStorage === "undefined") return;
    allInputs.forEach(function (el, i) {
      try {
        var saved = localStorage.getItem(draftKeyForIndex(i));
        if (saved != null && saved !== "") el.value = saved;
      } catch (e) {
        /* 无痕/存满时忽略 */
      }
    });
  }

  function saveDraftForIndex(i, value) {
    if (typeof localStorage === "undefined") return;
    try {
      var v = value == null ? "" : String(value);
      if (v === "") {
        localStorage.removeItem(draftKeyForIndex(i));
      } else {
        localStorage.setItem(draftKeyForIndex(i), v);
      }
    } catch (e) {}
  }

  allInputs.forEach(function (el, i) {
    el.addEventListener("input", function () {
      saveDraftForIndex(i, el.value);
    });
  });
  loadDiaryDrafts();

  const resetBtns = document.querySelectorAll(".input-reset");
  const resetIconPath =
    "M16 6c-2.627 0-5.11 1.015-6.992 2.856-.013.013-.017.029-.029.042-.053-.502-.462-.898-.979-.898-.553 0-1 .447-1 1v2c0 .553.447 1 1 1h2c.553 0 1-.447 1-1 0-.353-.193-.648-.468-.826 1.49-1.4 3.423-2.174 5.468-2.174 4.411 0 8 3.589 8 8s-3.589 8-8 8-8-3.589-8-8c0-.553-.447-1-1-1s-1 .447-1 1c0 5.514 4.486 10 10 10s10-4.486 10-10-4.486-10-10-10z";

  function setStatus(message, isError) {
    if (!statusEl) return;
    statusEl.textContent = message || "";
    statusEl.classList.toggle("generate-status--error", Boolean(isError));
  }

  function setDownloadVisible(visible) {
    if (!downloadActions) return;
    downloadActions.hidden = !visible;
    downloadActions.classList.toggle("download-actions--hidden", !visible);
  }

  /** 与界面一致：占位文案可见时不视为「已有生成图」；并排除异常 src（如等于当前页 URL） */
  function heroHasStorableGeneratedVisual() {
    if (!hero || !heroImg) return false;
    if (!hero.classList.contains("hero--has-image")) return false;
    var attr = heroImg.getAttribute("src");
    if (attr == null) return false;
    var trimmed = String(attr).trim();
    if (!trimmed) return false;
    if (typeof location !== "undefined" && location.href) {
      var page = location.href.replace(/#.*$/, "");
      try {
        var abs = new URL(trimmed, location.href).href.replace(/#.*$/, "");
        if (abs === page || abs === location.href.replace(/#.*$/, "")) return false;
      } catch (e) {
        /* data: / 相对路径异常时仍允许 data URL */
        if (!/^data:image\//i.test(trimmed)) return false;
      }
    }
    return true;
  }

  /** 仅当 hero 处于「展示生成图」状态且 src 可信时显示「Save image」 */
  function syncDownloadWithHero() {
    if (!downloadActions || !hero || !heroImg) {
      if (downloadActions) setDownloadVisible(false);
      return;
    }
    setDownloadVisible(heroHasStorableGeneratedVisual());
  }

  function syncGenerateButtonLabel() {
    if (!generateBtnLabel) return;
    generateBtnLabel.textContent = heroHasStorableGeneratedVisual() ? "Regenerate" : "Generate";
  }

  function setFeedbackEnabled(enabled) {
    if (feedbackLikeBtn) feedbackLikeBtn.disabled = !enabled;
    if (feedbackDislikeBtn) feedbackDislikeBtn.disabled = !enabled;
    setFeedbackVisualState(enabled ? "ready" : "disabled");
  }

  function setFeedbackVisualState(state) {
    var likeBtn = feedbackLikeBtn;
    var dislikeBtn = feedbackDislikeBtn;
    if (!likeBtn || !dislikeBtn) return;
    likeBtn.classList.remove("is-ready", "is-active");
    dislikeBtn.classList.remove("is-ready", "is-active");
    if (state === "ready") {
      likeBtn.classList.add("is-ready");
      dislikeBtn.classList.add("is-ready");
      return;
    }
    if (state === "liked") {
      likeBtn.classList.add("is-ready", "is-active");
      dislikeBtn.classList.add("is-ready");
      return;
    }
    if (state === "disliked") {
      likeBtn.classList.add("is-ready");
      dislikeBtn.classList.add("is-ready", "is-active");
    }
  }

  /**
   * 生图走 node server 的 /api。优先级：
   * 1) window.TRACE_GENERATE_API_ORIGIN（可手动设）
   * 2) file:// 或 localhost/127.0.0.1 但**不是** 8787 时，连 http(s)://同主机:8787（与 Live Server / Cursor 预览 并存）
   * 3) 已在 8787 上打开时留空，用同源的相对路径
   */
  function resolveGenerateApiBase() {
    if (typeof window !== "undefined" && window.TRACE_GENERATE_API_ORIGIN) {
      return String(window.TRACE_GENERATE_API_ORIGIN).replace(/\/$/, "");
    }
    if (typeof location === "undefined" || !location.protocol) return "";
    if (location.protocol === "file:") {
      return "http://localhost:8787";
    }
    var host = location.hostname;
    if (host === "localhost" || host === "127.0.0.1") {
      var port = location.port;
      if (port && port !== "8787") {
        return location.protocol + "//" + host + ":8787";
      }
    }
    return "";
  }

  var generateApiBase = resolveGenerateApiBase();

  /** 对话请求失败时在气泡里展示的说明（含 HTTPS→HTTP 混合内容提示） */
  function buildAiChatUnreachableMessage(err) {
    var lines = [
      "暂时连不上对话服务，请逐项确认：",
      "① 在项目根目录终端执行：node server.js（看到 Trace app running at http://localhost:8787）",
      "② 用浏览器打开 http://localhost:8787 访问本页（与生图接口同源，最省事）",
      "③ .env 里已配置 GEMINI_API_KEY，保存后重启过 node",
    ];
    try {
      if (typeof location !== "undefined" && location.protocol === "https:") {
        var base = resolveGenerateApiBase();
        if (base && /^http:/i.test(String(base))) {
          lines.push(
            "④ 当前页面若是「HTTPS 预览」（如部分内置浏览器），可能会拦截访问 http://localhost，请换用系统浏览器以 http:// 打开上述地址。"
          );
        }
      }
    } catch (x) {
      /* ignore */
    }
    var em = err && err.message ? String(err.message) : "";
    if (em.indexOf("Failed to fetch") >= 0 || em.indexOf("NetworkError") >= 0) {
      lines.push("(技术提示：Failed to fetch — 多为服务未启动、端口不对，或 HTTPS 页面调用 http 接口被拦截。)");
    }
    return lines.join("\n");
  }

  function trimUniformBorder(dataUrl) {
    return new Promise(function (resolve) {
      var img = new Image();
      img.onload = function () {
        try {
          var w = img.naturalWidth || img.width;
          var h = img.naturalHeight || img.height;
          if (!w || !h) {
            resolve(dataUrl);
            return;
          }

          var canvas = document.createElement("canvas");
          canvas.width = w;
          canvas.height = h;
          var ctx = canvas.getContext("2d");
          if (!ctx) {
            resolve(dataUrl);
            return;
          }
          ctx.drawImage(img, 0, 0);
          var pixels = ctx.getImageData(0, 0, w, h).data;

          var minX = w;
          var minY = h;
          var maxX = -1;
          var maxY = -1;

          // 采样四角背景色，适配白/灰/浅色留边
          function getPixel(x, y) {
            var idx = (y * w + x) * 4;
            return {
              r: pixels[idx],
              g: pixels[idx + 1],
              b: pixels[idx + 2],
              a: pixels[idx + 3],
            };
          }

          var c1 = getPixel(0, 0);
          var c2 = getPixel(w - 1, 0);
          var c3 = getPixel(0, h - 1);
          var c4 = getPixel(w - 1, h - 1);
          var corners = [c1, c2, c3, c4];

          function colorDistSq(p, c) {
            var dr = p.r - c.r;
            var dg = p.g - c.g;
            var db = p.b - c.b;
            return dr * dr + dg * dg + db * db;
          }

          var edgeColorThresholdSq = 42 * 42;

          for (var y = 0; y < h; y++) {
            for (var x = 0; x < w; x++) {
              var i = (y * w + x) * 4;
              var p = {
                r: pixels[i],
                g: pixels[i + 1],
                b: pixels[i + 2],
                a: pixels[i + 3],
              };
              if (p.a < 8) continue;

              var nearAnyCorner = false;
              for (var k = 0; k < corners.length; k++) {
                if (colorDistSq(p, corners[k]) <= edgeColorThresholdSq) {
                  nearAnyCorner = true;
                  break;
                }
              }

              // 与四角背景色明显不同，视为有效内容
              if (!nearAnyCorner) {
                if (x < minX) minX = x;
                if (y < minY) minY = y;
                if (x > maxX) maxX = x;
                if (y > maxY) maxY = y;
              }
            }
          }

          if (maxX < minX || maxY < minY) {
            resolve(dataUrl);
            return;
          }

          var cropW = maxX - minX + 1;
          var cropH = maxY - minY + 1;
          var trimmed = cropW < w - 6 || cropH < h - 6;
          if (!trimmed) {
            resolve(dataUrl);
            return;
          }

          var out = document.createElement("canvas");
          out.width = cropW;
          out.height = cropH;
          var outCtx = out.getContext("2d");
          if (!outCtx) {
            resolve(dataUrl);
            return;
          }
          outCtx.drawImage(canvas, minX, minY, cropW, cropH, 0, 0, cropW, cropH);
          resolve(out.toDataURL("image/png"));
        } catch (e) {
          resolve(dataUrl);
        }
      };
      img.onerror = function () {
        resolve(dataUrl);
      };
      img.src = dataUrl;
    });
  }

  async function generateHeroImageFromInputs() {
    if (!hero || !heroImg) return;
    const gratitudeInputs = Array.from(document.querySelectorAll("#block-list-gratitude .input--area"));
    const gratitudeLines = gratitudeInputs
      .map(function (elInput) {
        return (elInput.value || "").trim();
      })
      .filter(Boolean);
    var lines = [];
    if (gratitudeLines.length) {
      var picked = Math.floor(Math.random() * gratitudeLines.length);
      var selectedPrompt = gratitudeLines[picked];
      lines = [selectedPrompt];
      lastGeneratedUserPromptForFeedback = selectedPrompt;
    }

    if (!lines.length) {
      hero.classList.remove("hero--has-image");
      heroImg.removeAttribute("src");
      lastGeneratedUserPromptForFeedback = "";
      setFeedbackEnabled(false);
      syncDownloadWithHero();
      syncGenerateButtonLabel();
      setStatus("请先填写至少一条「感恩事项」。", true);
      return;
    }

    try {
      if (generateBtn) generateBtn.disabled = true;
      setFeedbackEnabled(false);
      setDownloadVisible(false);
      setStatus("AI 正在生成图片...", false);
      hero.classList.add("hero--generating");

      var response = await fetch(generateApiBase + "/api/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lines: lines }),
      });

      var text = await response.text();
      var payload;
      try {
        payload = text ? JSON.parse(text) : {};
      } catch (parseErr) {
        throw new Error(
          response.status === 404
            ? "未找到生图接口。请在本项目目录执行 node server.js，并用 http://localhost:8787 打开本页，勿用 file:// 或仅静态服务。"
            : "服务返回了非 JSON，请确认 node server 已启动。"
        );
      }
      if (!response.ok || !payload.imageUrl) {
        throw new Error(payload.error || "生成失败，请稍后再试");
      }

      var finalUrl = await trimUniformBorder(payload.imageUrl);
      heroImg.src = finalUrl;
      hero.classList.add("hero--has-image");
      syncDownloadWithHero();
      setFeedbackEnabled(true);
      setStatus("图片已生成。", false);
    } catch (error) {
      var msg = error && error.message ? error.message : "调用 API 失败，请检查配置。";
      if (/failed to fetch|networkerror|load failed/i.test(String(msg)) || (error && error.name === "TypeError")) {
        msg =
          "连不上生图服务。请在项目目录执行 node server.js；用系统浏览器打开 http://localhost:8787 使用（Cursor 的 HTTPS 内置预览会拦截对 http 的 API）。确认 .env 中 GEMINI_API_KEY 已设置并重启过 node。若生图在别的地址，可设 window.TRACE_GENERATE_API_ORIGIN。";
      }
      setStatus(msg, true);
      setFeedbackEnabled(heroHasStorableGeneratedVisual() && Boolean(lastGeneratedUserPromptForFeedback));
      syncDownloadWithHero();
    } finally {
      if (generateBtn) generateBtn.disabled = false;
      if (hero) hero.classList.remove("hero--generating");
      syncGenerateButtonLabel();
    }
  }

  if (generateBtn) {
    generateBtn.addEventListener("click", generateHeroImageFromInputs);
  }

  function getTodayCalendarCell() {
    var grid = calendarGrid;
    if (!grid) return null;
    var day = String(DIARY_FIXED_DATE_DAY);
    var cell = grid.querySelector('.calendar-grid__day[data-day="' + day + '"]');
    return cell || null;
  }

  function buildDateKey(year, month, day) {
    var y = String(year);
    var m = String(month).padStart(2, "0");
    var d = String(day).padStart(2, "0");
    return y + "-" + m + "-" + d;
  }

  function getCellDateKey(cell) {
    if (!calendarGrid || !cell) return "";
    var y = parseInt(calendarGrid.dataset.year || "", 10);
    var m = parseInt(calendarGrid.dataset.month || "", 10);
    var d = parseInt(cell.dataset.day || "", 10);
    if (Number.isNaN(y) || Number.isNaN(m) || Number.isNaN(d)) return "";
    return buildDateKey(y, m, d);
  }

  function readDiaryArchiveStore() {
    if (typeof localStorage === "undefined") return {};
    try {
      var raw = localStorage.getItem(DIARY_ARCHIVE_KEY);
      if (!raw) return {};
      var parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== "object") return {};
      return parsed;
    } catch (e) {
      return {};
    }
  }

  function writeDiaryArchiveStore(store) {
    if (typeof localStorage === "undefined") return;
    try {
      localStorage.setItem(DIARY_ARCHIVE_KEY, JSON.stringify(store));
    } catch (e) {}
  }

  function collectDiarySnapshot() {
    function getValues(selector) {
      return Array.from(document.querySelectorAll(selector))
        .map(function (elInput) {
          return (elInput.value || "").trim();
        })
        .filter(Boolean);
    }
    return {
      gratitude: getValues("#block-list-gratitude .input--area"),
      improve: getValues("#block-list-improve .input--area"),
      affirm: getValues("#block-list-affirm .input--area"),
    };
  }

  function saveArchiveForCell(cell, imageUrl) {
    var dateKey = getCellDateKey(cell);
    if (!dateKey) return;
    var snapshot = collectDiarySnapshot();
    var hasText = snapshot.gratitude.length || snapshot.improve.length || snapshot.affirm.length;
    if (!hasText && !imageUrl) return;
    var store = readDiaryArchiveStore();
    store[dateKey] = {
      date: dateKey,
      imageUrl: imageUrl || "",
      gratitude: snapshot.gratitude,
      improve: snapshot.improve,
      affirm: snapshot.affirm,
      savedAt: new Date().toISOString(),
    };
    writeDiaryArchiveStore(store);
  }

  function hasDiaryArchiveForDate(dateKey) {
    if (!dateKey) return false;
    var store = readDiaryArchiveStore();
    return Boolean(store[dateKey]);
  }

  function isCalendarCellInteractive(cell) {
    if (!cell || !cell.dataset || !cell.dataset.day) return false;
    return hasDiaryArchiveForDate(getCellDateKey(cell));
  }

  function findCalendarCellByDateKey(dateKey) {
    if (!calendarGrid || !dateKey) return null;
    var parts = String(dateKey).split("-");
    if (parts.length !== 3) return null;
    var day = String(parseInt(parts[2], 10));
    if (!day || day === "NaN") return null;
    return calendarGrid.querySelector('.calendar-grid__day[data-day="' + day + '"]');
  }

  function getInteractiveDateKeysInMonth() {
    if (!calendarGrid) return [];
    return Array.from(calendarGrid.querySelectorAll(".calendar-grid__day[data-day]"))
      .filter(function (cell) {
        return isCalendarCellInteractive(cell);
      })
      .map(function (cell) {
        return getCellDateKey(cell);
      })
      .filter(Boolean)
      .sort();
  }

  function updateCalendarDayModalNav() {
    var keys = getInteractiveDateKeysInMonth();
    var idx = keys.indexOf(selectedCalendarDateKey);
    if (calendarDayModalPrev) {
      calendarDayModalPrev.disabled = idx <= 0;
    }
    if (calendarDayModalNext) {
      calendarDayModalNext.disabled = idx < 0 || idx >= keys.length - 1;
    }
  }

  function goToCalendarDayByStep(step) {
    var keys = getInteractiveDateKeysInMonth();
    var idx = keys.indexOf(selectedCalendarDateKey);
    if (idx < 0) return;
    var nextIdx = idx + step;
    if (nextIdx < 0 || nextIdx >= keys.length) return;
    var nextCell = findCalendarCellByDateKey(keys[nextIdx]);
    if (!nextCell) return;
    openCalendarDayModalFromCell(nextCell);
  }

  function closeCalendarDayModal() {
    if (!calendarDayModal) return;
    calendarDayModal.hidden = true;
    if (calendarDayModalZoom) calendarDayModalZoom.innerHTML = "";
  }

  function closeCalendarDiaryModal() {
    if (!calendarDiaryModal) return;
    calendarDiaryModal.hidden = true;
    if (calendarDiaryArchive) calendarDiaryArchive.innerHTML = "";
  }

  function closeCalendarAnalysisModal() {
    if (!calendarAnalysisModal) return;
    calendarAnalysisModal.hidden = true;
    calendarAnalysisSelectionStack.length = 0;
    if (calendarAnalysisGridHost) calendarAnalysisGridHost.innerHTML = "";
    resetCalendarAnalysisModalSteps();
  }

  function openCalendarAnalysisModal() {
    if (!calendarAnalysisModal || !calendarAnalysisGridHost || !calendarGrid) return;
    closeCalendarDayModal();
    closeCalendarDiaryModal();
    closeScratchSourceModal();
    switchTab("calendar");
    calendarAnalysisSelectionStack.length = 0;
    calendarAnalysisGridHost.innerHTML = "";
    resetCalendarAnalysisModalSteps();
    var clone = calendarGrid.cloneNode(true);
    clone.removeAttribute("id");
    clone.classList.add("calendar-analysis-modal__calendar");
    calendarAnalysisGridHost.appendChild(clone);
    calendarAnalysisModal.hidden = false;
  }

  function openCalendarDayModalFromCell(cell) {
    if (!calendarDayModal || !calendarDayModalZoom || !cell) return;
    selectedCalendarDateKey = getCellDateKey(cell);
    var hasArchive = hasDiaryArchiveForDate(selectedCalendarDateKey);
    calendarDayModal.classList.toggle("calendar-modal--empty", !hasArchive);
    if (calendarDayViewDiaryBtn) {
      calendarDayViewDiaryBtn.hidden = !hasArchive;
    }
    calendarDayModalZoom.innerHTML = "";
    if (hasArchive) {
      var zoomCell = cell.cloneNode(true);
      zoomCell.classList.remove("calendar-grid__day--today");
      calendarDayModalZoom.appendChild(zoomCell);
    } else {
      var empty = document.createElement("div");
      empty.className = "calendar-modal__zoom-empty";
      empty.textContent = "这一天还没有保存的日记档案。";
      calendarDayModalZoom.appendChild(empty);
    }
    calendarDayModal.hidden = false;
    updateCalendarDayModalNav();
  }

  function renderArchiveList(title, list, toneClass) {
    var section = document.createElement("section");
    section.className = "calendar-diary-archive__section";
    if (toneClass) section.classList.add(toneClass);
    var heading = document.createElement("h4");
    heading.textContent = title;
    section.appendChild(heading);
    if (!list || !list.length) {
      var empty = document.createElement("p");
      empty.textContent = "暂无";
      section.appendChild(empty);
      return section;
    }
    list.forEach(function (line, idx) {
      var p = document.createElement("p");
      p.className = "calendar-diary-archive__item";

      var index = document.createElement("span");
      index.className = "calendar-diary-archive__index";
      index.textContent = "(" + String(idx + 1) + ")";
      p.appendChild(index);

      var text = document.createElement("span");
      text.className = "calendar-diary-archive__text";
      text.textContent = " " + line;
      p.appendChild(text);

      section.appendChild(p);
    });
    return section;
  }

  function openDiaryArchiveModal(dateKey) {
    if (!calendarDiaryModal || !calendarDiaryArchive) return;
    var store = readDiaryArchiveStore();
    var record = store[dateKey];
    calendarDiaryArchive.innerHTML = "";
    if (calendarDiaryTitle) {
      calendarDiaryTitle.textContent = (dateKey || "当天") + " 日记档案";
    }
    if (!record) {
      var empty = document.createElement("p");
      empty.className = "calendar-diary-archive__empty";
      empty.textContent = "这一天还没有保存的日记档案。";
      calendarDiaryArchive.appendChild(empty);
      calendarDiaryModal.hidden = false;
      return;
    }
    if (record.imageUrl) {
      var img = document.createElement("img");
      img.className = "calendar-diary-archive__img";
      img.alt = "当天插画";
      img.src = record.imageUrl;
      calendarDiaryArchive.appendChild(img);
    }
    calendarDiaryArchive.appendChild(
      renderArchiveList("3件值得感恩的事", record.gratitude || [], "calendar-diary-archive__section--orange")
    );
    calendarDiaryArchive.appendChild(
      renderArchiveList("2个可以改进的空间", record.improve || [], "calendar-diary-archive__section--teal")
    );
    calendarDiaryArchive.appendChild(
      renderArchiveList("1句对自己的肯定", record.affirm || [], "calendar-diary-archive__section--violet")
    );
    calendarDiaryModal.hidden = false;
  }

  function closeScratchSourceModal() {
    if (!scratchSourceModal) return;
    scratchSourceModal.hidden = true;
    if (scratchSourceGratitude) scratchSourceGratitude.innerHTML = "";
    if (scratchSourceViewFullBtn) scratchSourceViewFullBtn.dataset.dateKey = "";
  }

  function openScratchSourceModal(dateKey, gratitudeIndex) {
    if (!scratchSourceModal || !scratchSourceGratitude) return;
    var store = readDiaryArchiveStore();
    var record = store[dateKey];
    if (!record) return;
    if (scratchSourceTitle) scratchSourceTitle.textContent = dateKey + " 日记源";
    scratchSourceGratitude.innerHTML = "";
    var list = Array.isArray(record.gratitude) ? record.gratitude : [];
    var idx = typeof gratitudeIndex === "number" ? gratitudeIndex : -1;
    if (idx < 0 || idx >= list.length) idx = 0;
    var line = list[idx] || "暂无";
    var p = document.createElement("p");
    p.className = "calendar-diary-archive__item";
    var index = document.createElement("span");
    index.className = "calendar-diary-archive__index";
    index.textContent = "(" + String(idx + 1) + ")";
    var text = document.createElement("span");
    text.className = "calendar-diary-archive__text";
    text.textContent = " " + line;
    p.appendChild(index);
    p.appendChild(text);
    scratchSourceGratitude.appendChild(p);
    if (scratchSourceViewFullBtn) scratchSourceViewFullBtn.dataset.dateKey = dateKey;
    scratchSourceModal.hidden = false;
  }

  function ensureCalendarDayLabel(cell) {
    if (!cell) return null;
    var existing = cell.querySelector(".calendar-grid__day-label");
    if (existing) return existing;
    var raw = (cell.textContent || "").trim();
    cell.textContent = "";
    var label = document.createElement("span");
    label.className = "calendar-grid__day-label";
    label.textContent = raw;
    cell.appendChild(label);
    return label;
  }

  function setCalendarCellArt(cell, imageUrl, shouldAnimate) {
    if (!cell || !imageUrl) return null;
    ensureCalendarDayLabel(cell);
    var art = cell.querySelector(".calendar-grid__day-art");
    if (!art) {
      art = document.createElement("img");
      art.className = "calendar-grid__day-art";
      art.alt = "当天生成插画";
      cell.insertBefore(art, cell.firstChild);
    }
    art.classList.remove("calendar-grid__day-art--visible");
    art.src = imageUrl;
    cell.classList.add("calendar-grid__day--has-art");
    if (shouldAnimate) {
      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          art.classList.add("calendar-grid__day-art--visible");
        });
      });
    } else {
      art.classList.add("calendar-grid__day-art--visible");
    }
    return art;
  }

  function seedPresetImagesIntoCalendar() {
    if (!calendarGrid) return;
    var year = parseInt(calendarGrid.dataset.year || "", 10);
    var month = parseInt(calendarGrid.dataset.month || "", 10);
    if (Number.isNaN(year) || Number.isNaN(month)) return;
    var store = readDiaryArchiveStore();
    Object.keys(CALENDAR_PRESET_DAY_IMAGES).forEach(function (day) {
      var cell = calendarGrid.querySelector('.calendar-grid__day[data-day="' + day + '"]');
      if (!cell) return;
      var src = CALENDAR_PRESET_DAY_IMAGES[day];
      setCalendarCellArt(cell, src, false);
      var key = buildDateKey(year, month, parseInt(day, 10));
      var prev = store[key] || {};
      var presetArchive = CALENDAR_PRESET_DAY_ARCHIVES[day] || {};
      store[key] = {
        date: key,
        imageUrl: src,
        gratitude: Array.isArray(presetArchive.gratitude)
          ? presetArchive.gratitude
          : Array.isArray(prev.gratitude)
            ? prev.gratitude
            : [],
        improve: Array.isArray(presetArchive.improve)
          ? presetArchive.improve
          : Array.isArray(prev.improve)
            ? prev.improve
            : [],
        affirm: Array.isArray(presetArchive.affirm)
          ? presetArchive.affirm
          : Array.isArray(prev.affirm)
            ? prev.affirm
            : [],
        savedAt: prev.savedAt || new Date().toISOString(),
      };
    });
    writeDiaryArchiveStore(store);
  }

  function addCurrentImageToCalendar() {
    if (!heroImg || !heroImg.getAttribute("src")) {
      setStatus("请先生成图片，再添加到日历。", true);
      return;
    }
    var targetCell = getTodayCalendarCell();
    if (!targetCell) {
      setStatus("当前月份中未找到今天对应日期。", true);
      return;
    }
    var art = setCalendarCellArt(targetCell, heroImg.src, false);
    if (!art) return;
    saveArchiveForCell(targetCell, heroImg.src);

    switchTab("calendar");
    setCalendarCellArt(targetCell, heroImg.src, true);

    setStatus("已添加到日历。", false);
  }

  if (addToCalendarBtn) {
    addToCalendarBtn.addEventListener("click", addCurrentImageToCalendar);
  }

  if (calendarGrid) {
    calendarGrid.addEventListener("click", function (event) {
      var target = event.target;
      if (!(target instanceof HTMLElement)) return;
      var cell = target.closest(".calendar-grid__day");
      if (!cell) return;
      if (cell.classList.contains("calendar-grid__day--muted")) return;
      if (!cell.dataset.day) return;
      openCalendarDayModalFromCell(cell);
    });
  }

  if (calendarDayModal) {
    calendarDayModal.addEventListener("click", function (event) {
      var target = event.target;
      if (!(target instanceof HTMLElement)) return;
      if (target.dataset.closeCalendarModal === "true") closeCalendarDayModal();
    });
  }

  if (calendarDayModalClose) {
    calendarDayModalClose.addEventListener("click", closeCalendarDayModal);
  }

  if (calendarDayModalPrev) {
    calendarDayModalPrev.addEventListener("click", function () {
      goToCalendarDayByStep(-1);
    });
  }

  if (calendarDayModalNext) {
    calendarDayModalNext.addEventListener("click", function () {
      goToCalendarDayByStep(1);
    });
  }

  if (calendarDayViewDiaryBtn) {
    calendarDayViewDiaryBtn.addEventListener("click", function () {
      if (!hasDiaryArchiveForDate(selectedCalendarDateKey)) return;
      closeCalendarDayModal();
      openDiaryArchiveModal(selectedCalendarDateKey);
    });
  }

  if (calendarDiaryModal) {
    calendarDiaryModal.addEventListener("click", function (event) {
      var target = event.target;
      if (!(target instanceof HTMLElement)) return;
      if (target.dataset.closeCalendarDiary === "true") closeCalendarDiaryModal();
    });
  }

  if (calendarDiaryModalClose) {
    calendarDiaryModalClose.addEventListener("click", closeCalendarDiaryModal);
  }

  if (calendarDiaryModalBack) {
    calendarDiaryModalBack.addEventListener("click", function () {
      closeCalendarDiaryModal();
      var cell = findCalendarCellByDateKey(selectedCalendarDateKey);
      if (cell) openCalendarDayModalFromCell(cell);
    });
  }

  if (scratchSourceModal) {
    scratchSourceModal.addEventListener("click", function (event) {
      var target = event.target;
      if (!(target instanceof HTMLElement)) return;
      if (target.dataset.closeScratchSource === "true") closeScratchSourceModal();
    });
  }

  if (scratchSourceModalClose) {
    scratchSourceModalClose.addEventListener("click", closeScratchSourceModal);
  }

  if (scratchSourceViewFullBtn) {
    scratchSourceViewFullBtn.addEventListener("click", function () {
      var dateKey = scratchSourceViewFullBtn.dataset.dateKey || "";
      if (!dateKey) return;
      closeScratchSourceModal();
      openDiaryArchiveModal(dateKey);
    });
  }

  if (calendarPageSearchBtn) {
    calendarPageSearchBtn.addEventListener("click", function () {
      openCalendarAnalysisModal();
    });
  }

  if (calendarAnalysisModalClose) {
    calendarAnalysisModalClose.addEventListener("click", closeCalendarAnalysisModal);
  }

  if (calendarAnalysisModal) {
    calendarAnalysisModal.addEventListener("click", function (event) {
      var target = event.target;
      if (!(target instanceof HTMLElement)) return;
      if (target.dataset.closeCalendarAnalysis === "true") {
        closeCalendarAnalysisModal();
        return;
      }
      var cell = target.closest(".calendar-grid__day");
      if (!cell || !calendarAnalysisGridHost || !calendarAnalysisGridHost.contains(cell)) return;
      if (cell.classList.contains("calendar-grid__day--muted")) return;
      if (!cell.dataset.day) return;
      var day = cell.dataset.day;
      if (cell.classList.contains("calendar-analysis-modal__day--selected")) {
        cell.classList.remove("calendar-analysis-modal__day--selected");
        var idxOff = calendarAnalysisSelectionStack.lastIndexOf(day);
        if (idxOff !== -1) calendarAnalysisSelectionStack.splice(idxOff, 1);
      } else {
        cell.classList.add("calendar-analysis-modal__day--selected");
        calendarAnalysisSelectionStack.push(day);
      }
    });
  }

  if (calendarAnalysisDeleteBtn) {
    calendarAnalysisDeleteBtn.addEventListener("click", function () {
      if (!calendarAnalysisGridHost || !calendarAnalysisSelectionStack.length) return;
      var lastDay = calendarAnalysisSelectionStack.pop();
      if (lastDay == null) return;
      var lastCell = calendarAnalysisGridHost.querySelector('.calendar-grid__day[data-day="' + lastDay + '"]');
      if (lastCell) lastCell.classList.remove("calendar-analysis-modal__day--selected");
    });
  }

  function parseDateKeyToLabel(dateKey) {
    var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(dateKey || ""));
    if (!m) return String(dateKey || "");
    return String(parseInt(m[2], 10)) + "." + String(parseInt(m[3], 10));
  }

  function collectArchiveEntriesInRange(startKey, endKey) {
    var store = readDiaryArchiveStore();
    return Object.keys(store)
      .filter(function (key) {
        return key >= startKey && key <= endKey;
      })
      .sort()
      .map(function (key) {
        var rec = store[key] || {};
        var gratitude = Array.isArray(rec.gratitude) ? rec.gratitude.filter(Boolean) : [];
        var improve = Array.isArray(rec.improve) ? rec.improve.filter(Boolean) : [];
        var affirm = Array.isArray(rec.affirm) ? rec.affirm.filter(Boolean) : [];
        return { date: key, gratitude: gratitude, improve: improve, affirm: affirm };
      })
      .filter(function (item) {
        return item.gratitude.length || item.improve.length || item.affirm.length;
      });
  }

  async function runCalendarAiAnalysis(startKey, endKey, entries, wantsEmotionTrend, wantsHiddenSignals) {
    var intro = "请查收你的分析结果";
    var baseUrl = resolveGenerateApiBase();

    var entriesForHidden = entries.filter(function (e) {
      var hasImp = Array.isArray(e.improve) && e.improve.length;
      var hasAff = Array.isArray(e.affirm) && e.affirm.length;
      return hasImp || hasAff;
    });

    closeCalendarAnalysisModal();
    switchTab("ai");
    if (intro) {
      await aiChatAppendAssistantBubbleTyped(intro, false);
    }

    var emotionOk = true;
    if (wantsEmotionTrend) {
      try {
        var responseEt = await fetch(baseUrl + "/api/emotion-trend", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            startDate: startKey,
            endDate: endKey,
            entries: entries,
          }),
        });
        var points = [];
        var narrativeElLocal = null;
        if (!responseEt.ok || !responseEt.body || !responseEt.body.getReader) {
          throw new Error("情绪趋势请求失败（" + responseEt.status + "）");
        }
        await consumeNdjsonFromReader(responseEt.body.getReader(), function (obj) {
          if (!obj || typeof obj !== "object") return;
          if (obj.type === "points") {
            points = Array.isArray(obj.points) ? obj.points : [];
            var trendRefs =
              points.length >= 1
                ? aiChatAppendEmotionTrendCard(startKey, endKey, points)
                : null;
            narrativeElLocal = trendRefs && trendRefs.narrativeEl ? trendRefs.narrativeEl : null;
          }
          if (obj.type === "delta" && narrativeElLocal) {
            narrativeElLocal.textContent += obj.text ? String(obj.text) : "";
            aiChatScrollToBottom(false);
          }
        });

        if (!points.length) {
          throw new Error("分析结果为空");
        }
      } catch (etErr) {
        emotionOk = false;
        var emotionMsg =
          etErr && etErr.message ? String(etErr.message) : "情绪趋势分析失败，请稍后重试或检查 node 日志。";
        setStatus(emotionMsg, true);
        try {
          window.alert("AI Analyzer 分析失败：\n" + emotionMsg);
        } catch (noop) {}
      }
    }

    if (!emotionOk && wantsEmotionTrend) {
      setStatus("", false);
      return;
    }

    if (wantsHiddenSignals) {
      if (!entriesForHidden.length) {
        aiChatAppendAssistantBubble(
          "所选日期范围内没有「可以改进的空间」或「1句对自己的肯定」的填写内容，无法进行隐藏积极信号分析。",
          true
        );
      } else {
        var hiddenShell = null;
        try {
          var hidRes = await fetch(baseUrl + "/api/hidden-positive-signals", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ entries: entriesForHidden }),
          });
          if (!hidRes.ok || !hidRes.body || typeof hidRes.body.getReader !== "function") {
            throw new Error("隐藏积极信号请求失败（" + hidRes.status + "）");
          }
          hiddenShell = aiChatAppendHiddenPositiveStreamShell(startKey, endKey);
          var doneHiddenText = "";
          await consumeNdjsonFromReader(hidRes.body.getReader(), function (obj) {
            if (!obj || typeof obj !== "object") return;
            if (obj.type === "delta" && hiddenShell && hiddenShell.streamEl) {
              hiddenShell.streamEl.textContent += obj.text ? String(obj.text) : "";
              aiChatScrollToBottom(false);
            }
            if (obj.type === "done" && typeof obj.text === "string") {
              doneHiddenText = obj.text.trim();
            }
          });
          var streamedRaw =
            hiddenShell && hiddenShell.streamEl
              ? String(hiddenShell.streamEl.textContent || "").trim()
              : "";
          var finalHidden = doneHiddenText || streamedRaw;
          if (hiddenShell && hiddenShell.blocksEl && hiddenShell.streamEl) {
            aiChatFinalizeHiddenPositiveStream(hiddenShell.blocksEl, hiddenShell.streamEl, finalHidden);
          }
        } catch (hidErr) {
          if (hiddenShell && hiddenShell.rowEl && hiddenShell.rowEl.parentNode) {
            hiddenShell.rowEl.parentNode.removeChild(hiddenShell.rowEl);
          }
          aiChatAppendAssistantBubble(
            "隐藏积极信号未能生成：" +
              (hidErr && hidErr.message ? String(hidErr.message) : "请确认 node server 已启动且网络可用。"),
            true
          );
        }
      }
    }

    setStatus("", false);
  }

  if (calendarAnalysisRunBtn) {
    calendarAnalysisRunBtn.addEventListener("click", function () {
      if (!calendarAnalysisGridHost) return;
      var days = Array.from(calendarAnalysisGridHost.querySelectorAll(".calendar-analysis-modal__day--selected[data-day]"))
        .map(function (el) {
          return parseInt(el.dataset.day, 10);
        })
        .filter(function (n) {
          return !Number.isNaN(n);
        })
        .sort(function (a, b) {
          return a - b;
        });
      if (!days.length) {
        setStatus("请先在日历中选择至少一个日期。", true);
        return;
      }
      if (!calendarGrid) return;
      var year = parseInt(calendarGrid.dataset.year || "", 10);
      var month = parseInt(calendarGrid.dataset.month || "", 10);
      if (Number.isNaN(year) || Number.isNaN(month)) {
        setStatus("无法读取当前日历年月。", true);
        return;
      }

      var startDay = days[0];
      var endDay = days[days.length - 1];
      var startKey = buildDateKey(year, month, startDay);
      var endKey = buildDateKey(year, month, endDay);
      var entries = collectArchiveEntriesInRange(startKey, endKey);
      if (!entries.length) {
        setStatus("所选日期范围内没有可分析的日记内容。", true);
        return;
      }

      calendarAnalysisPendingRun = { startKey: startKey, endKey: endKey, entries: entries };
      showCalendarAnalysisTypeStep();
      setStatus("", false);
    });
  }

  if (calendarAnalysisBackBtn) {
    calendarAnalysisBackBtn.addEventListener("click", function () {
      showCalendarAnalysisDateStep();
    });
  }

  if (calendarAnalysisConfirmBtn) {
    calendarAnalysisConfirmBtn.addEventListener("click", async function () {
      if (!calendarAnalysisPendingRun || !calendarAnalysisPendingRun.entries) return;
      var wantsEmotionTrend = !!(calendarAnalysisOptEmotion && calendarAnalysisOptEmotion.checked);
      var wantsHiddenSignals = !!(calendarAnalysisOptHidden && calendarAnalysisOptHidden.checked);
      if (!wantsEmotionTrend && !wantsHiddenSignals) {
        setStatus("请至少勾选一项分析（A / B）。", true);
        return;
      }

      var startKey = calendarAnalysisPendingRun.startKey;
      var endKey = calendarAnalysisPendingRun.endKey;
      var entries = calendarAnalysisPendingRun.entries;

      if (calendarAnalysisConfirmBtn) calendarAnalysisConfirmBtn.disabled = true;
      if (calendarAnalysisRunBtn) calendarAnalysisRunBtn.disabled = true;

      try {
        setStatus(
          wantsEmotionTrend && wantsHiddenSignals
            ? "AI Analyzer：正在生成情绪趋势与隐藏积极信号…"
            : wantsEmotionTrend
              ? "AI Analyzer：正在生成情绪趋势…"
              : "AI Analyzer：正在生成隐藏积极信号…",
          false
        );
        await runCalendarAiAnalysis(startKey, endKey, entries, wantsEmotionTrend, wantsHiddenSignals);
      } catch (error) {
        var msg = error && error.message ? error.message : "分析服务暂不可用";
        setStatus(msg, true);
        try {
          window.alert("AI Analyzer 分析失败：\n" + msg);
        } catch (e) {}
      } finally {
        if (calendarAnalysisConfirmBtn) calendarAnalysisConfirmBtn.disabled = false;
        if (calendarAnalysisRunBtn) calendarAnalysisRunBtn.disabled = false;
      }
    });
  }

  var aiChatMessagesEl = document.getElementById("ai-chat-messages");
  var aiChatInput = document.getElementById("ai-chat-input");
  var aiChatSendBtn = document.getElementById("ai-chat-send-btn");
  var aiChatHistory = [];
  var aiChatSending = false;

  /** 将消息列表滚到最底，使最新内容出现在输入框上方可视区内（不依赖 scrollIntoView 的 nearest） */
  function aiChatScrollToBottom(smooth) {
    if (!aiChatMessagesEl) return;
    if (typeof smooth === "undefined") smooth = true;
    var el = aiChatMessagesEl;
    function apply() {
      try {
        if (smooth) {
          el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
        } else {
          el.scrollTop = el.scrollHeight;
        }
      } catch (e) {
        el.scrollTop = el.scrollHeight;
      }
    }
    if (smooth) {
      requestAnimationFrame(function () {
        requestAnimationFrame(apply);
      });
    } else {
      requestAnimationFrame(apply);
    }
  }

  var AI_CHAT_ECHO_INTRO_TEXT = [
    "你好，我是 Echo，你的日记管理员。",
    "我会读懂你的每一天——",
    "你遇见过的人，经历过的事；你的开心和你的伤感，还有你对自己说过的话，",
    "你每一天留下的Trace，我都记得。",
    "",
    "有什么想和我聊聊的吗？",
  ].join("\n");

  /** 识别「你是谁 / 自我介绍 / Echo 是谁」等同义问法（含少量改写），避免误伤长文里偶然出现的字眼 */
  function aiChatIsWhoAreYouQuestion(t) {
    var s = String(t || "").trim();
    if (!s || s.length > 72) return false;
    var compact = s.replace(/\s+/g, "");
    var low = s.toLowerCase();

    if (/^who\s+are\s+you\??$/i.test(low)) return true;
    if (/^what\s+are\s+you\??$/i.test(low)) return true;
    if (/^what'?s\s+your\s+name\??$/i.test(low)) return true;

    if (/你是谁(?!写)/.test(compact)) return true;
    if (/您是谁(?!写)/.test(compact)) return true;
    if (/echo是谁|^谁是echo$/i.test(compact)) return true;
    if (/你是(哪位|哪一个|干啥的|做什么的)/.test(compact)) return true;
    if (/^(请问)?(你|您)(到底)?(是|叫)(谁|什么|啥)/.test(compact)) return true;
    if (/介绍一下(你|您)?自己/.test(compact)) return true;
    if (/自我介绍/.test(compact)) return true;
    if (/(你|您)叫什么|叫啥|什么名字/.test(compact)) return true;
    if (/你是(echo|ai|机器人)/i.test(compact)) return true;
    if (/什么模型|哪个模型/.test(compact)) return true;
    if (/你的身份/.test(compact)) return true;

    var exactShort = [
      "你谁啊",
      "你哪位",
      "哪位啊",
      "你是echo吗",
      "你是echo",
      "echo是什么",
    ];
    for (var i = 0; i < exactShort.length; i++) {
      if (compact === exactShort[i] || compact === exactShort[i] + "？" || compact === exactShort[i] + "?")
        return true;
    }

    return false;
  }

  function aiChatIsGreetingMessage(t) {
    var s = String(t || "").trim();
    if (!s) return false;
    var compact = s.replace(/\s+/g, "").replace(/[!！?？。.,，…~～]+$/g, "");
    var exact = [
      "你好呀",
      "你好啊",
      "你好",
      "您好",
      "哈喽",
      "嗨",
      "在吗",
      "早上好",
      "晚上好",
      "下午好",
    ];
    if (exact.indexOf(compact) >= 0) return true;
    var low = s.toLowerCase();
    if (/^(hi|hello|hey|hiya)([!！?？。.,，\s]*)$/i.test(low)) return true;
    return false;
  }

  function waitMs(ms) {
    return new Promise(function (resolve) {
      window.setTimeout(resolve, ms);
    });
  }

  /** 每条助手气泡下方：Frame 120 操作条；复制为本次回复正文 copyText */
  function aiChatAppendAssistantActionBarRow(copyText, fadeIn) {
    if (!aiChatMessagesEl) return;
    var textToCopy =
      copyText != null && String(copyText).length ? String(copyText) : AI_CHAT_ECHO_INTRO_TEXT;
    var row = document.createElement("div");
    row.className = "ai-chat__row ai-chat__row--assistant";
    var actions = document.createElement("div");
    actions.className = "ai-chat__actions ai-chat__actions--assistant-action-bar";
    if (fadeIn) actions.classList.add("ai-chat__actions--enter");
    actions.setAttribute("aria-label", "消息操作");
    var wrap = document.createElement("div");
    wrap.className = "ai-chat__action-bar-wrap";
    var img = document.createElement("img");
    img.className = "ai-chat__action-bar-img";
    img.src = "assets/frame-120.svg";
    img.alt = "";
    img.decoding = "async";
    img.width = 168;
    img.height = 36;
    var hits = document.createElement("div");
    hits.className = "ai-chat__action-bar-hits";
    var hitLabels = ["复制", "点赞", "点踩", "刷新"];
    hitLabels.forEach(function (label, i) {
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "ai-chat__action-hit";
      btn.setAttribute("aria-label", label);
      if (i === 0) btn.setAttribute("data-ai-chat-copy-reply", "true");
      hits.appendChild(btn);
    });
    wrap.appendChild(img);
    wrap.appendChild(hits);
    actions.appendChild(wrap);
    row.appendChild(actions);
    aiChatMessagesEl.appendChild(row);
    var copyBtn = actions.querySelector("[data-ai-chat-copy-reply]");
    if (copyBtn) {
      copyBtn.addEventListener("click", function () {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(textToCopy).catch(function () {});
        }
      });
    }
    if (fadeIn) {
      requestAnimationFrame(function () {
        actions.classList.add("is-visible");
      });
    }
    aiChatScrollToBottom(true);
  }

  function aiChatFillMultiline(el, text) {
    el.textContent = "";
    var parts = String(text || "").split("\n");
    parts.forEach(function (part, i) {
      if (i) el.appendChild(document.createElement("br"));
      el.appendChild(document.createTextNode(part));
    });
  }

  function aiChatAppendUserBubble(text) {
    if (!aiChatMessagesEl) return;
    var row = document.createElement("div");
    row.className = "ai-chat__row ai-chat__row--user";
    var bubble = document.createElement("div");
    bubble.className = "ai-chat__bubble ai-chat__bubble--user";
    bubble.textContent = text;
    row.appendChild(bubble);
    aiChatMessagesEl.appendChild(row);
    aiChatScrollToBottom(true);
  }

  function aiChatAppendAssistantBubble(text, isError) {
    if (!aiChatMessagesEl) return;
    var row = document.createElement("div");
    row.className = "ai-chat__row ai-chat__row--assistant";
    var bubble = document.createElement("div");
    bubble.className = "ai-chat__bubble ai-chat__bubble--assistant";
    if (isError) bubble.classList.add("ai-chat__bubble--error");
    aiChatFillMultiline(bubble, text);
    row.appendChild(bubble);
    aiChatMessagesEl.appendChild(row);
    aiChatScrollToBottom(true);
  }

  function aiChatAppendEmotionTrendCard(startDate, endDate, points) {
    if (!aiChatMessagesEl || !Array.isArray(points) || !points.length) return null;
    var cleanPoints = points
      .map(function (p) {
        var score = parseInt(p && p.score, 10);
        return {
          date: String(p && p.date ? p.date : ""),
          score: Number.isNaN(score) ? null : Math.max(1, Math.min(10, score)),
        };
      })
      .filter(function (p) {
        return p.date && p.score != null;
      });
    if (!cleanPoints.length) return null;

    var row = document.createElement("div");
    row.className = "ai-chat__row ai-chat__row--assistant";
    var bubble = document.createElement("div");
    bubble.className = "ai-chat__bubble ai-chat__bubble--assistant ai-chat__bubble--trend";

    var card = document.createElement("section");
    card.className = "ai-chat__trend-card";
    var cardHeader = document.createElement("div");
    cardHeader.className = "ai-chat__trend-card-header";
    var title = document.createElement("h4");
    title.className = "ai-chat__trend-title";
    title.textContent =
      "情绪报告：" + parseDateKeyToLabel(startDate) + "-" + parseDateKeyToLabel(endDate);
    cardHeader.appendChild(title);
    var axisHint = document.createElement("p");
    axisHint.className = "ai-chat__trend-axis-hint";
    axisHint.textContent = "横轴：日期  ·  纵轴：情绪积极度（1-10）";
    var legend = document.createElement("div");
    legend.className = "ai-chat__trend-legend";
    [
      { band: "low", label: "1-3 低积极度" },
      { band: "mid", label: "4-7 中积极度" },
      { band: "high", label: "8-10 高积极度" },
    ].forEach(function (item) {
      var legendItem = document.createElement("span");
      legendItem.className = "ai-chat__trend-legend-item";
      var swatch = document.createElement("i");
      swatch.className = "ai-chat__trend-legend-swatch ai-chat__trend-legend-swatch--" + item.band;
      swatch.setAttribute("aria-hidden", "true");
      var text = document.createElement("span");
      text.className = "ai-chat__trend-legend-text";
      text.textContent = item.label;
      legendItem.appendChild(swatch);
      legendItem.appendChild(text);
      legend.appendChild(legendItem);
    });
    card.appendChild(cardHeader);
    card.appendChild(legend);

    var svgWidth = 280;
    var svgHeight = 156;
    var padLeft = 22;
    var padRight = 14;
    var padTop = 12;
    var padBottom = 28;
    var innerW = svgWidth - padLeft - padRight;
    var innerH = svgHeight - padTop - padBottom;
    var stepX = cleanPoints.length > 1 ? innerW / (cleanPoints.length - 1) : 0;
    function xAt(i) {
      return padLeft + stepX * i;
    }
    function yAt(score) {
      return padTop + ((10 - score) / 9) * innerH;
    }
    function scoreBand(score) {
      if (score <= 3) return "low";
      if (score <= 7) return "mid";
      return "high";
    }
    /** 与 styles.css 图例一致；线段渐变与描边用属性写入，避免 SVG 内 CSS 偶发不生效 */
    function trendBandHex(band) {
      if (band === "low") return "#2563eb";
      if (band === "mid") return "#94a3b8";
      return "#fa8a2e";
    }

    var svgNs = "http://www.w3.org/2000/svg";
    var svg = document.createElementNS(svgNs, "svg");
    svg.setAttribute("class", "ai-chat__trend-chart");
    svg.setAttribute("viewBox", "0 0 " + svgWidth + " " + svgHeight);
    svg.setAttribute("aria-label", "情绪积极度趋势图");

    var gradBase =
      "tg" +
      String(Date.now()) +
      "x" +
      Math.random()
        .toString(36)
        .slice(2, 9);
    var defs = document.createElementNS(svgNs, "defs");
    for (var gi = 0; gi < cleanPoints.length - 1; gi++) {
      var gp1 = cleanPoints[gi];
      var gp2 = cleanPoints[gi + 1];
      var gx1 = xAt(gi);
      var gy1 = yAt(gp1.score);
      var gx2 = xAt(gi + 1);
      var gy2 = yAt(gp2.score);
      var gid = gradBase + "s" + gi;
      var lg = document.createElementNS(svgNs, "linearGradient");
      lg.setAttribute("id", gid);
      lg.setAttribute("gradientUnits", "userSpaceOnUse");
      lg.setAttribute("x1", String(gx1));
      lg.setAttribute("y1", String(gy1));
      lg.setAttribute("x2", String(gx2));
      lg.setAttribute("y2", String(gy2));
      var stopA = document.createElementNS(svgNs, "stop");
      stopA.setAttribute("offset", "0%");
      stopA.setAttribute("stop-color", trendBandHex(scoreBand(gp1.score)));
      var stopB = document.createElementNS(svgNs, "stop");
      stopB.setAttribute("offset", "100%");
      stopB.setAttribute("stop-color", trendBandHex(scoreBand(gp2.score)));
      lg.appendChild(stopA);
      lg.appendChild(stopB);
      defs.appendChild(lg);
    }
    svg.appendChild(defs);

    [1, 4, 7, 10].forEach(function (tick) {
      var y = yAt(tick);
      var line = document.createElementNS(svgNs, "line");
      line.setAttribute("x1", String(padLeft));
      line.setAttribute("x2", String(svgWidth - padRight));
      line.setAttribute("y1", String(y));
      line.setAttribute("y2", String(y));
      line.setAttribute("class", "ai-chat__trend-grid-line");
      svg.appendChild(line);
    });

    var yAxisTitle = document.createElementNS(svgNs, "text");
    yAxisTitle.setAttribute("x", "10");
    yAxisTitle.setAttribute("y", String(padTop + innerH / 2));
    yAxisTitle.setAttribute("text-anchor", "middle");
    yAxisTitle.setAttribute("class", "ai-chat__trend-axis-title");
    yAxisTitle.setAttribute("transform", "rotate(-90 10 " + String(padTop + innerH / 2) + ")");
    yAxisTitle.textContent = "积极度（1-10）";
    svg.appendChild(yAxisTitle);

    for (var si = 0; si < cleanPoints.length - 1; si++) {
      var p1 = cleanPoints[si];
      var p2 = cleanPoints[si + 1];
      var seg = document.createElementNS(svgNs, "line");
      seg.setAttribute("x1", String(xAt(si)));
      seg.setAttribute("y1", String(yAt(p1.score)));
      seg.setAttribute("x2", String(xAt(si + 1)));
      seg.setAttribute("y2", String(yAt(p2.score)));
      seg.setAttribute("stroke", "url(#" + gradBase + "s" + si + ")");
      seg.setAttribute("class", "ai-chat__trend-line");
      svg.appendChild(seg);
    }

    cleanPoints.forEach(function (p, i) {
      var cx = xAt(i);
      var cy = yAt(p.score);
      var band = scoreBand(p.score);
      var dot = document.createElementNS(svgNs, "circle");
      dot.setAttribute("cx", String(cx));
      dot.setAttribute("cy", String(cy));
      dot.setAttribute("r", "3.5");
      dot.setAttribute("stroke", trendBandHex(band));
      dot.setAttribute("class", "ai-chat__trend-dot ai-chat__trend-dot--" + band);
      svg.appendChild(dot);

      var scoreLabel = document.createElementNS(svgNs, "text");
      scoreLabel.setAttribute("x", String(cx));
      scoreLabel.setAttribute("y", String(cy - 8));
      scoreLabel.setAttribute("text-anchor", "middle");
      scoreLabel.setAttribute("fill", trendBandHex(band));
      scoreLabel.setAttribute("class", "ai-chat__trend-score-label ai-chat__trend-score-label--" + band);
      scoreLabel.textContent = String(p.score);
      svg.appendChild(scoreLabel);

      var dayLabel = document.createElementNS(svgNs, "text");
      dayLabel.setAttribute("x", String(cx));
      dayLabel.setAttribute("y", String(svgHeight - 18));
      dayLabel.setAttribute("text-anchor", "middle");
      dayLabel.setAttribute("class", "ai-chat__trend-day-label");
      dayLabel.textContent = parseDateKeyToLabel(p.date);
      svg.appendChild(dayLabel);
    });

    var xAxisTitle = document.createElementNS(svgNs, "text");
    xAxisTitle.setAttribute("x", String(svgWidth / 2));
    xAxisTitle.setAttribute("y", String(svgHeight - 4));
    xAxisTitle.setAttribute("text-anchor", "middle");
    xAxisTitle.setAttribute("class", "ai-chat__trend-axis-title");
    xAxisTitle.textContent = "日期";
    svg.appendChild(xAxisTitle);

    card.appendChild(svg);

    var narrWrap = document.createElement("div");
    narrWrap.className = "ai-chat__trend-narrative";
    narrWrap.hidden = false;
    var narrLbl = document.createElement("div");
    narrLbl.className = "ai-chat__trend-narrative-label";
    narrLbl.textContent = "趋势解读";
    var narrativeEl = document.createElement("p");
    narrativeEl.className = "ai-chat__trend-narrative-text";
    narrativeEl.textContent = "";
    narrWrap.appendChild(narrLbl);
    narrWrap.appendChild(narrativeEl);

    card.appendChild(narrWrap);
    card.appendChild(axisHint);
    bubble.appendChild(card);
    row.appendChild(bubble);
    aiChatMessagesEl.appendChild(row);
    aiChatScrollToBottom(true);
    return { narrativeEl: narrativeEl };
  }

  /** NDJSON ReadableStream → 回调每行解析后的对象（含 error） */
  function consumeNdjsonFromReader(reader, onRecord) {
    return new Promise(function (resolve, reject) {
      var decoder = new TextDecoder();
      var buffer = "";
      var stopped = false;

      function pump() {
        if (stopped) return;
        reader
          .read()
          .then(function (result) {
            if (stopped) return;
            if (result.done) {
              resolve();
              return;
            }
            buffer += decoder.decode(result.value, { stream: true });
            var cut;
            while ((cut = buffer.indexOf("\n")) >= 0) {
              var line = buffer.slice(0, cut).trim();
              buffer = buffer.slice(cut + 1);
              if (!line) continue;
              try {
                var obj = JSON.parse(line);
                onRecord(obj);
                if (obj && obj.type === "error") {
                  stopped = true;
                  reject(new Error(obj.message || "Stream error"));
                  return;
                }
              } catch (parseErr) {
                stopped = true;
                reject(parseErr);
                return;
              }
            }
            pump();
          })
          .catch(function (readErr) {
            if (!stopped) reject(readErr);
          });
      }

      pump();
    });
  }

  function aiChatAppendHiddenPositiveStreamShell(startDate, endDate) {
    if (!aiChatMessagesEl) return null;
    var rangeTitle =
      "隐藏的积极信号：" + parseDateKeyToLabel(startDate) + "-" + parseDateKeyToLabel(endDate);
    var row = document.createElement("div");
    row.className = "ai-chat__row ai-chat__row--assistant";
    var bubble = document.createElement("div");
    bubble.className = "ai-chat__bubble ai-chat__bubble--assistant ai-chat__bubble--hidden-positive";
    var card = document.createElement("section");
    card.className = "ai-chat__hidden-positive-card";
    card.setAttribute("aria-label", rangeTitle);
    var cardHeader = document.createElement("div");
    cardHeader.className = "ai-chat__trend-card-header";
    var title = document.createElement("h4");
    title.className = "ai-chat__trend-title";
    title.textContent = rangeTitle;
    cardHeader.appendChild(title);
    var blocks = document.createElement("div");
    blocks.className = "ai-chat__hidden-positive-blocks";
    var streamEl = document.createElement("pre");
    streamEl.className = "ai-chat__hidden-positive-stream";
    streamEl.style.whiteSpace = "pre-wrap";
    streamEl.style.margin = "0";
    streamEl.style.font = "inherit";
    streamEl.textContent = "";
    blocks.appendChild(streamEl);
    card.appendChild(cardHeader);
    card.appendChild(blocks);
    bubble.appendChild(card);
    row.appendChild(bubble);
    aiChatMessagesEl.appendChild(row);
    aiChatScrollToBottom(true);
    return { blocksEl: blocks, streamEl: streamEl, rowEl: row };
  }

  function aiChatFinalizeHiddenPositiveStream(blocksEl, streamEl, finalText) {
    if (!blocksEl || !streamEl) return;
    if (streamEl.parentNode === blocksEl) {
      blocksEl.removeChild(streamEl);
    }
    aiChatFillHiddenPositiveBody(blocksEl, finalText || "");
    aiChatScrollToBottom(true);
  }

  /**
   * 解析「隐藏的积极信号」多段输出：按行扫描最稳（不依赖空两行分段）。
   * 支持单行标题：【……】 或 **……**（兼容模型仍用星号的情况）
   */
  function aiChatFillHiddenPositiveBody(container, raw) {
    var t = String(raw || "")
      .replace(/\r\n/g, "\n")
      .trim();
    if (!t) return;

    var sections = [];
    var lines = t.split("\n");
    var i = 0;

    function isTitleLine(trimmed) {
      var b = /^【([^】]+)】$/.exec(trimmed);
      if (b) return { title: b[1].trim() };
      var s = /^\*\*\s*([^*]+?)\s*\*\*$/.exec(trimmed);
      if (s) return { title: s[1].trim() };
      return null;
    }

    while (i < lines.length) {
      var trimmed = lines[i].trim();
      if (!trimmed) {
        i += 1;
        continue;
      }
      var head = isTitleLine(trimmed);
      if (head) {
        i += 1;
        var bodyLines = [];
        while (i < lines.length) {
          var tr2 = lines[i].trim();
          if (tr2 && (isTitleLine(tr2))) break;
          bodyLines.push(lines[i]);
          i += 1;
        }
        sections.push({ title: head.title, body: bodyLines.join("\n").trim() });
        continue;
      }
      i += 1;
    }

    if (!sections.length) {
      var blockRe = /【([^】]+)】\s*\n([\s\S]+?)(?=\n\s*【|$)/g;
      var bm;
      while ((bm = blockRe.exec(t)) !== null) {
        var bt = bm[2].trim();
        if (bt) {
          sections.push({ title: bm[1].trim(), body: bt });
        }
      }
    }

    if (sections.length) {
      sections.forEach(function (s) {
        var wrap = document.createElement("div");
        wrap.className = "ai-chat__hidden-positive-section";
        var ttl = document.createElement("p");
        ttl.className = "ai-chat__hidden-positive-section-title";
        ttl.textContent = s.title;
        var bodyEl = document.createElement("p");
        bodyEl.className = "ai-chat__hidden-positive-section-text";
        bodyEl.textContent = s.body;
        wrap.appendChild(ttl);
        wrap.appendChild(bodyEl);
        container.appendChild(wrap);
      });
      return;
    }

    var fallback = document.createElement("p");
    fallback.className = "ai-chat__hidden-positive-body";
    fallback.style.whiteSpace = "pre-line";
    fallback.textContent = t;
    container.appendChild(fallback);
  }

  function aiChatAppendHiddenPositiveCard(startDate, endDate, insight) {
    if (!aiChatMessagesEl) return;
    var text = String(insight || "").trim();
    if (!text) return;
    var row = document.createElement("div");
    row.className = "ai-chat__row ai-chat__row--assistant";
    var bubble = document.createElement("div");
    bubble.className = "ai-chat__bubble ai-chat__bubble--assistant ai-chat__bubble--hidden-positive";
    var card = document.createElement("section");
    card.className = "ai-chat__hidden-positive-card";
    var rangeTitle =
      "隐藏的积极信号：" + parseDateKeyToLabel(startDate) + "-" + parseDateKeyToLabel(endDate);
    card.setAttribute("aria-label", rangeTitle);
    var cardHeader = document.createElement("div");
    cardHeader.className = "ai-chat__trend-card-header";
    var title = document.createElement("h4");
    title.className = "ai-chat__trend-title";
    title.textContent = rangeTitle;
    cardHeader.appendChild(title);
    var blocks = document.createElement("div");
    blocks.className = "ai-chat__hidden-positive-blocks";
    aiChatFillHiddenPositiveBody(blocks, text);
    card.appendChild(cardHeader);
    card.appendChild(blocks);
    bubble.appendChild(card);
    row.appendChild(bubble);
    aiChatMessagesEl.appendChild(row);
    aiChatScrollToBottom(true);
  }

  async function aiChatAppendAssistantBubbleTyped(text, isError) {
    if (!aiChatMessagesEl) return;
    var full = String(text || "");
    var row = document.createElement("div");
    row.className = "ai-chat__row ai-chat__row--assistant";
    var bubble = document.createElement("div");
    bubble.className = "ai-chat__bubble ai-chat__bubble--assistant";
    if (isError) bubble.classList.add("ai-chat__bubble--error");
    row.appendChild(bubble);
    aiChatMessagesEl.appendChild(row);

    var out = "";
    for (var i = 0; i < full.length; i++) {
      out += full[i];
      aiChatFillMultiline(bubble, out);
      aiChatScrollToBottom(false);
      var ch = full[i];
      var delay = /[，。！？；,.!?]/.test(ch) ? 55 : 28;
      await waitMs(delay);
    }
    aiChatScrollToBottom(true);
  }

  function aiChatAppendPendingBubble() {
    if (!aiChatMessagesEl) return null;
    var row = document.createElement("div");
    row.className = "ai-chat__row ai-chat__row--assistant";
    var bubble = document.createElement("div");
    bubble.className = "ai-chat__bubble ai-chat__bubble--assistant ai-chat__bubble--pending";
    bubble.textContent = "思考中…";
    row.appendChild(bubble);
    aiChatMessagesEl.appendChild(row);
    aiChatScrollToBottom(true);
    return row;
  }

  function aiChatRemoveRow(row) {
    if (row && row.parentNode) row.parentNode.removeChild(row);
  }

  function aiChatSetBusy(busy) {
    aiChatSending = Boolean(busy);
    if (aiChatInput) {
      aiChatInput.disabled = Boolean(busy);
      aiChatInput.setAttribute("aria-busy", busy ? "true" : "false");
    }
    if (aiChatSendBtn) aiChatSendBtn.disabled = Boolean(busy);
  }

  async function aiChatSubmit() {
    if (!aiChatInput || aiChatSending) return;
    var text = String(aiChatInput.value || "").trim();
    if (!text) return;

    aiChatInput.value = "";
    aiChatAppendUserBubble(text);
    aiChatHistory.push({ role: "user", text: text });

    if (aiChatIsWhoAreYouQuestion(text)) {
      aiChatSetBusy(true);
      await aiChatAppendAssistantBubbleTyped(AI_CHAT_ECHO_INTRO_TEXT, false);
      aiChatAppendAssistantActionBarRow(AI_CHAT_ECHO_INTRO_TEXT, true);
      aiChatHistory.push({ role: "assistant", text: AI_CHAT_ECHO_INTRO_TEXT });
      aiChatSetBusy(false);
      setStatus("", false);
      return;
    }

    if (aiChatHistory.length === 1 && aiChatIsGreetingMessage(text)) {
      aiChatSetBusy(true);
      await aiChatAppendAssistantBubbleTyped(AI_CHAT_ECHO_INTRO_TEXT, false);
      aiChatAppendAssistantActionBarRow(AI_CHAT_ECHO_INTRO_TEXT, true);
      aiChatHistory.push({ role: "assistant", text: AI_CHAT_ECHO_INTRO_TEXT });
      aiChatSetBusy(false);
      setStatus("", false);
      return;
    }

    var pendingRow = aiChatAppendPendingBubble();
    aiChatSetBusy(true);

    try {
      var url = resolveGenerateApiBase() + "/api/chat";
      var response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: aiChatHistory }),
      });
      var payload = await response.json().catch(function () {
        return {};
      });
      aiChatRemoveRow(pendingRow);
      pendingRow = null;

      var reply =
        payload && typeof payload.text === "string" ? payload.text.replace(/^\s+|\s+$/g, "") : "";

      if (!response.ok || !reply) {
        aiChatHistory.pop();
        var errMsg =
          payload && payload.error
            ? String(payload.error)
            : !response.ok
              ? "请求失败（" + response.status + "）"
              : "未收到有效回复";
        aiChatAppendAssistantBubble("抱歉，Echo 暂时没能回复：" + errMsg, true);
        setStatus(errMsg, true);
        return;
      }

      aiChatAppendAssistantBubble(reply, false);
      aiChatAppendAssistantActionBarRow(reply);
      aiChatHistory.push({ role: "assistant", text: reply });
      setStatus("", false);
    } catch (e) {
      aiChatRemoveRow(pendingRow);
      aiChatHistory.pop();
      aiChatAppendAssistantBubble(buildAiChatUnreachableMessage(e), true);
      setStatus("无法连接对话服务", true);
    } finally {
      aiChatSetBusy(false);
    }
  }

  if (aiChatSendBtn) {
    aiChatSendBtn.addEventListener("click", function () {
      aiChatSubmit();
    });
  }

  if (aiChatInput) {
    aiChatInput.addEventListener("keydown", function (e) {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        aiChatSubmit();
      }
    });
  }

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
      closeCalendarDayModal();
      closeCalendarDiaryModal();
      closeScratchSourceModal();
      closeCalendarAnalysisModal();
      return;
    }
    if (calendarDayModal && !calendarDayModal.hidden) {
      if (event.key === "ArrowLeft") {
        goToCalendarDayByStep(-1);
      } else if (event.key === "ArrowRight") {
        goToCalendarDayByStep(1);
      }
    }
  });

  function downloadCurrentImage() {
    if (!heroImg || !heroImg.getAttribute("src")) {
      setStatus("请先生成图片再保存到设备。", true);
      return;
    }
    try {
      var link = document.createElement("a");
      var stamp = new Date().toISOString().replace(/[:.]/g, "-");
      link.href = heroImg.src;
      link.download = "trace-image-" + stamp + ".png";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setStatus("图片已保存到设备。", false);
    } catch (e) {
      setStatus("保存失败，请重试。", true);
    }
  }

  if (downloadImageBtn) {
    downloadImageBtn.addEventListener("click", downloadCurrentImage);
  }

  if (feedbackLikeBtn) {
    feedbackLikeBtn.addEventListener("click", function () {
      if (!lastGeneratedUserPromptForFeedback) {
        setStatus("请先生成图片。", true);
        return;
      }
      setFeedbackVisualState("liked");
      setStatus("已记录为喜欢偏好（Demo）。", false);
    });
  }

  if (feedbackDislikeBtn) {
    feedbackDislikeBtn.addEventListener("click", function () {
      if (!lastGeneratedUserPromptForFeedback) {
        setStatus("请先生成图片。", true);
        return;
      }
      setFeedbackVisualState("disliked");
      setStatus("已记录为不喜欢偏好（Demo）。", false);
    });
  }

  function clearAllInputs() {
    if (typeof localStorage !== "undefined") {
      for (var d = 0; d < allInputs.length; d++) {
        try {
          localStorage.removeItem(draftKeyForIndex(d));
        } catch (e) {}
      }
    }
    for (const input of allInputs) {
      input.value = "";
      input.dispatchEvent(new Event("input", { bubbles: true }));
    }
    if (hero && heroImg) {
      hero.classList.remove("hero--has-image");
      heroImg.removeAttribute("src");
      syncDownloadWithHero();
    }
    syncGenerateButtonLabel();
    lastGeneratedUserPromptForFeedback = "";
    setFeedbackEnabled(false);
    setStatus("已清空全部输入内容。", false);
  }

  for (const resetBtn of resetBtns) {
    const icon = resetBtn.querySelector("svg");
    if (icon) {
      icon.setAttribute("viewBox", "0 0 32 32");
      icon.innerHTML = '<path d="' + resetIconPath + '" />';
    }
  }

  for (const resetBtn of resetBtns) {
    resetBtn.addEventListener("click", function () {
      clearAllInputs();
    });
  }

  seedPresetImagesIntoCalendar();
  syncDownloadWithHero();
  syncGenerateButtonLabel();
  setFeedbackEnabled(false);

  (function initCalendarScratchCard() {
    var panel = document.getElementById("scratch-card-panel");
    var canvas = document.getElementById("scratch-card-canvas");
    var prizeEl = document.getElementById("scratch-card-prize");
    var sourceBtn = document.getElementById("scratch-view-source-btn");
    var hintEl = panel ? panel.querySelector(".scratch-card-glass__scratch-hint") : null;
    if (!panel || !canvas || !prizeEl) return;
    var ctx = canvas.getContext("2d");
    if (!ctx) return;

    var SCRATCH_PLACEHOLDER_TEXT = "今天和朋友们相处的开心";
    var SCRATCH_HISTORY_KEY = "trace:scratchSummaryHistory:v1";
    var SCRATCH_SOURCE_HISTORY_KEY = "trace:scratchSourceHistory:v1";
    var scratchSourceMeta = null;
    prizeEl.textContent = SCRATCH_PLACEHOLDER_TEXT;

    function getScratchCorpusEntries() {
      var sourceDays = ["21", "22", "24"];
      var lines = [];
      sourceDays.forEach(function (day) {
        var entry = CALENDAR_PRESET_DAY_ARCHIVES[day];
        if (!entry || !Array.isArray(entry.gratitude)) return;
        entry.gratitude.forEach(function (line, idx) {
          var text = String(line || "").trim();
          if (!text) return;
          lines.push({
            day: day,
            gratitudeIndex: idx,
            sourceId: day + "-" + String(idx + 1),
            text: text,
          });
        });
      });
      return lines;
    }

    function pickFallbackScratchEntry(entries) {
      if (!entries || !entries.length) return null;
      return entries[Math.floor(Math.random() * entries.length)];
    }

    function buildFallbackSummaryFromEntry(entry, avoidSummaries) {
      if (!entry || !entry.text) return SCRATCH_PLACEHOLDER_TEXT;
      var avoid = Array.isArray(avoidSummaries)
        ? avoidSummaries.map(function (s) { return String(s || "").trim(); }).filter(Boolean)
        : [];
      var src = String(entry.text || "")
        .replace(/[A-Z](?=（|$)/g, "朋友")
        .replace(/\d{1,2}:\d{2}(?:AM|PM)?/gi, "深夜")
        .replace(/trader joes/gi, "超市")
        .replace(/\s+/g, "")
        .trim();
      var firstClause = src.split(/[。！？]/)[0] || "";
      var coreClause = firstClause.split(/[，,；;]/)[0] || firstClause;
      var keywordPool = [];
      if (/朋友|聊天|串门|吃饭|相聚/.test(src)) keywordPool.push("和朋友相聚，心里很暖。", "和朋友聊到深夜，心被治愈。");
      if (/阳光|天气|美丽|高兴/.test(src)) keywordPool.push("阳光正好，心情也跟着发亮。", "天气很美，整天都轻快明亮。");
      if (/面试|发挥|信心/.test(src)) keywordPool.push("面试发挥不错，我更有信心了。", "一次面试的顺利，点亮了信心。");
      if (/表演|乐队|草坪/.test(src)) keywordPool.push("和朋友看表演，热闹又治愈。", "草坪上的演出，让人久违地开心。");
      if (/焦虑|缓解|治愈/.test(src)) keywordPool.push("聊着聊着，焦虑慢慢放下。", "把烦恼说出来，心里松了很多。");
      if (/网站|网页|整理|改版|维护/.test(src) || (/推进|进展|完成/.test(src) && /网站|网页/.test(src))) {
        keywordPool.push("今天在个人网站上有实在推进。", "把网站整理往前推了一步。");
      }
      if (/晚睡|太晚|凌晨|熬夜/.test(src)) {
        keywordPool.push("和朋友聊到很晚，也提醒我早点休息。");
      }
      if (/毕业|倒计时|九周|时间流逝/.test(src)) {
        keywordPool.push("想到毕业将近，更想认真过好今天。");
      }
      if (!keywordPool.length) {
        if (coreClause) {
          keywordPool = ["今天最想记住的是：" + coreClause + "。"];
        } else {
          keywordPool = ["今天有一件小事，让我很受鼓舞。"];
        }
      }
      var candidates = keywordPool
        .map(function (s) { return normalizeScratchSummary(s) || ""; })
        .filter(Boolean)
        .filter(function (s) { return avoid.indexOf(s) < 0; });
      if (!candidates.length) {
        candidates = keywordPool.map(function (s) { return normalizeScratchSummary(s) || ""; }).filter(Boolean);
      }
      return candidates[Math.floor(Math.random() * candidates.length)] || SCRATCH_PLACEHOLDER_TEXT;
    }

    function normalizeScratchSummary(text) {
      var cleaned = String(text || "")
        .replace(/[\r\n\t]+/g, " ")
        .replace(/[“”"']/g, "")
        .replace(/^[\-*#\d\.\)\s]+/, "")
        .replace(/\s+/g, " ")
        .trim();
      if (!cleaned) return "";
      /* 刮刮乐文案强制中文，避免出现 "Here is" 这类英文残留 */
      if (/[A-Za-z]/.test(cleaned)) return "";
      if (cleaned.length > 30) return "";
      return cleaned;
    }

    function readScratchSummaryHistory() {
      if (typeof localStorage === "undefined") return [];
      try {
        var raw = localStorage.getItem(SCRATCH_HISTORY_KEY);
        if (!raw) return [];
        var parsed = JSON.parse(raw);
        if (!Array.isArray(parsed)) return [];
        return parsed.map(function (s) {
          return String(s || "").trim();
        }).filter(Boolean);
      } catch (e) {
        return [];
      }
    }

    function readScratchSourceHistory() {
      if (typeof localStorage === "undefined") return [];
      try {
        var raw = localStorage.getItem(SCRATCH_SOURCE_HISTORY_KEY);
        if (!raw) return [];
        var parsed = JSON.parse(raw);
        if (!Array.isArray(parsed)) return [];
        return parsed.map(function (s) {
          return String(s || "").trim();
        }).filter(Boolean);
      } catch (e) {
        return [];
      }
    }

    function writeScratchSummaryHistory(list) {
      if (typeof localStorage === "undefined") return;
      try {
        localStorage.setItem(SCRATCH_HISTORY_KEY, JSON.stringify(list.slice(0, 8)));
      } catch (e) {}
    }

    function writeScratchSourceHistory(list) {
      if (typeof localStorage === "undefined") return;
      try {
        localStorage.setItem(SCRATCH_SOURCE_HISTORY_KEY, JSON.stringify(list.slice(0, 8)));
      } catch (e) {}
    }

    function rememberScratchSummary(summary) {
      var text = String(summary || "").trim();
      if (!text) return;
      var history = readScratchSummaryHistory().filter(function (s) {
        return s !== text;
      });
      history.unshift(text);
      writeScratchSummaryHistory(history);
    }

    function rememberScratchSource(sourceId) {
      var id = String(sourceId || "").trim();
      if (!id) return;
      var history = readScratchSourceHistory().filter(function (s) {
        return s !== id;
      });
      history.unshift(id);
      writeScratchSourceHistory(history);
    }

    function pickDiverseScratchEntry(entries) {
      if (!entries || !entries.length) return null;
      var recentSources = readScratchSourceHistory().slice(0, 4);
      var preferred = entries.filter(function (entry) {
        return recentSources.indexOf(entry.sourceId) < 0;
      });
      var pool = preferred.length ? preferred : entries;
      return pool[Math.floor(Math.random() * pool.length)];
    }

    async function requestScratchSummary(entry, avoidSummaries) {
      var response = await fetch(generateApiBase + "/api/scratch-summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          entries: [{ sourceId: entry.sourceId, text: entry.text }],
          avoidSummaries: avoidSummaries || [],
        }),
      });
      var payload = await response.json();
      if (!response.ok || !payload || !payload.summary) throw new Error("scratch-summary failed");
      return normalizeScratchSummary(payload.summary);
    }

    async function refreshScratchSummaryFromAI() {
      var corpus = getScratchCorpusEntries();
      if (!corpus.length) {
        prizeEl.textContent = SCRATCH_PLACEHOLDER_TEXT;
        scratchSourceMeta = null;
        return;
      }
      var selectedEntry = pickDiverseScratchEntry(corpus) || pickFallbackScratchEntry(corpus);
      if (!selectedEntry) {
        prizeEl.textContent = SCRATCH_PLACEHOLDER_TEXT;
        scratchSourceMeta = null;
        return;
      }
      try {
        var history = readScratchSummaryHistory();
        var candidate = "";
        for (var attempt = 0; attempt < 3; attempt++) {
          var avoid = history.slice(0, 5);
          candidate = await requestScratchSummary(selectedEntry, avoid);
          if (candidate && history.indexOf(candidate) < 0) break;
          candidate = "";
        }
        var finalText = normalizeScratchSummary(candidate) || buildFallbackSummaryFromEntry(selectedEntry, history);
        prizeEl.textContent = finalText;
        rememberScratchSummary(finalText);
        rememberScratchSource(selectedEntry.sourceId);
        scratchSourceMeta = {
          day: selectedEntry.day,
          gratitudeIndex: selectedEntry.gratitudeIndex,
        };
      } catch (e) {
        var fallbackText = buildFallbackSummaryFromEntry(selectedEntry, readScratchSummaryHistory());
        prizeEl.textContent = fallbackText;
        rememberScratchSummary(fallbackText);
        rememberScratchSource(selectedEntry.sourceId);
        scratchSourceMeta = {
          day: selectedEntry.day,
          gratitudeIndex: selectedEntry.gratitudeIndex,
        };
      }
    }
    refreshScratchSummaryFromAI();

    if (sourceBtn) {
      sourceBtn.addEventListener("click", function () {
        if (!scratchSourceMeta || !scratchSourceMeta.day) return;
        var y = parseInt(calendarGrid && calendarGrid.dataset ? calendarGrid.dataset.year || "" : "", 10);
        var m = parseInt(calendarGrid && calendarGrid.dataset ? calendarGrid.dataset.month || "" : "", 10);
        if (Number.isNaN(y) || Number.isNaN(m)) return;
        var dateKey = buildDateKey(y, m, parseInt(scratchSourceMeta.day, 10));
        closeCalendarDayModal();
        switchTab("calendar");
        openScratchSourceModal(dateKey, scratchSourceMeta.gratitudeIndex);
      });
    }

    var wCss = 1;
    var hCss = 1;
    var dpr = 1;
    var lastW = -1;
    var lastH = -1;
    var lastDpr = -1;
    var active = false;
    var hintHidden = false;
    var isAutoRevealRunning = false;
    var scratchSampleTick = 0;
    var SCRATCH_REMAINING_THRESHOLD = 0.3;
    var hasScratchInitialized = false;
    var scratchMaskSnapshot = null;

    function setSourceBtnVisible(visible) {
      if (!sourceBtn) return;
      sourceBtn.classList.toggle("scratch-card-glass__source-btn--hidden", !visible);
      sourceBtn.disabled = !visible;
    }

    function syncSourceBtnVisibilityFromCoat() {
      var revealed = canvas.style.pointerEvents === "none" || canvas.style.opacity === "0";
      setSourceBtnVisible(revealed);
    }

    function hideHintOnce() {
      if (hintHidden || !hintEl) return;
      hintHidden = true;
      hintEl.classList.add("scratch-card-glass__scratch-hint--hidden");
    }

    function drawCoat() {
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, wCss, hCss);
      canvas.style.opacity = "1";
      canvas.style.transition = "";
      canvas.style.pointerEvents = "auto";
      isAutoRevealRunning = false;
      scratchSampleTick = 0;
      saveScratchMaskSnapshot();
      setSourceBtnVisible(false);
    }

    function saveScratchMaskSnapshot() {
      if (!canvas.width || !canvas.height) return;
      try {
        var snap = document.createElement("canvas");
        snap.width = canvas.width;
        snap.height = canvas.height;
        var snapCtx = snap.getContext("2d");
        if (!snapCtx) return;
        snapCtx.drawImage(canvas, 0, 0);
        scratchMaskSnapshot = snap;
      } catch (e) {}
    }

    function sizeAndRedraw(forceRestore) {
      var rect = panel.getBoundingClientRect();
      /* 面板处于 display:none（切到其他 tab）时不重绘，避免把已刮开的状态刷回白涂层 */
      if (rect.width < 2 || rect.height < 2) return;
      var nw = Math.max(1, Math.floor(rect.width));
      var nh = Math.max(1, Math.floor(rect.height));
      var ndpr = window.devicePixelRatio || 1;
      var sameSize = nw === lastW && nh === lastH && ndpr === lastDpr;
      if (sameSize && !forceRestore) return;
      var prevBitmap = null;
      var prevOpacity = canvas.style.opacity || "1";
      var prevPointer = canvas.style.pointerEvents || "auto";
      if (!sameSize && hasScratchInitialized && canvas.width > 0 && canvas.height > 0) {
        prevBitmap = document.createElement("canvas");
        prevBitmap.width = canvas.width;
        prevBitmap.height = canvas.height;
        var prevCtx = prevBitmap.getContext("2d");
        if (prevCtx) prevCtx.drawImage(canvas, 0, 0);
      }
      lastW = nw;
      lastH = nh;
      lastDpr = ndpr;
      wCss = nw;
      hCss = nh;
      dpr = ndpr;
      if (!sameSize) {
        canvas.width = Math.floor(wCss * dpr);
        canvas.height = Math.floor(hCss * dpr);
        canvas.style.width = wCss + "px";
        canvas.style.height = hCss + "px";
      }
      if (!hasScratchInitialized) {
        drawCoat();
        hasScratchInitialized = true;
        return;
      }
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      if (prevBitmap) {
        ctx.drawImage(prevBitmap, 0, 0, prevBitmap.width, prevBitmap.height, 0, 0, canvas.width, canvas.height);
      } else if (scratchMaskSnapshot) {
        ctx.drawImage(
          scratchMaskSnapshot,
          0,
          0,
          scratchMaskSnapshot.width,
          scratchMaskSnapshot.height,
          0,
          0,
          canvas.width,
          canvas.height
        );
      }
      canvas.style.opacity = prevOpacity;
      canvas.style.pointerEvents = prevPointer;
      saveScratchMaskSnapshot();
      syncSourceBtnVisibilityFromCoat();
    }

    function localPosFromClient(clientX, clientY) {
      var r = canvas.getBoundingClientRect();
      var x = clientX - r.left;
      var y = clientY - r.top;
      if (x < 0) x = 0;
      if (y < 0) y = 0;
      if (x > wCss) x = wCss;
      if (y > hCss) y = hCss;
      return { x: x, y: y };
    }

    function scratchAt(x, y) {
      if (isAutoRevealRunning) return;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.globalCompositeOperation = "destination-out";
      ctx.beginPath();
      ctx.arc(x, y, 28, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalCompositeOperation = "source-over";
      /* 每次刮擦都保存一份，避免快速切 tab 时回退到白涂层 */
      saveScratchMaskSnapshot();
      scratchSampleTick += 1;
      if (scratchSampleTick % 4 === 0) {
        maybeAutoRevealCoat();
      }
    }

    function getRemainingCoatRatio() {
      if (!canvas.width || !canvas.height) return 1;
      var data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
      var visibleCount = 0;
      var pixelCount = data.length / 4;
      for (var i = 3; i < data.length; i += 4) {
        if (data[i] > 12) visibleCount += 1;
      }
      return pixelCount > 0 ? visibleCount / pixelCount : 1;
    }

    function maybeAutoRevealCoat() {
      if (isAutoRevealRunning) return;
      var remainRatio = getRemainingCoatRatio();
      if (remainRatio > SCRATCH_REMAINING_THRESHOLD) return;
      isAutoRevealRunning = true;
      canvas.style.transition = "opacity 320ms ease";
      canvas.style.opacity = "0";
      window.setTimeout(function () {
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        canvas.style.pointerEvents = "none";
        saveScratchMaskSnapshot();
        setSourceBtnVisible(true);
      }, 340);
    }

    function onDown(e) {
      if (e.type === "mousedown" && e.button !== 0) return;
      if (e.type === "touchstart" && e.cancelable) e.preventDefault();
      active = true;
      hideHintOnce();
      var p =
        e.touches && e.touches[0]
          ? localPosFromClient(e.touches[0].clientX, e.touches[0].clientY)
          : localPosFromClient(e.clientX, e.clientY);
      scratchAt(p.x, p.y);
    }

    function onMove(e) {
      if (!active) return;
      if (e.type === "touchmove" && e.cancelable) e.preventDefault();
      var clientX;
      var clientY;
      if (e.touches && e.touches[0]) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      } else {
        if (e.type === "mousemove" && (e.buttons & 1) === 0) return;
        clientX = e.clientX;
        clientY = e.clientY;
      }
      var p = localPosFromClient(clientX, clientY);
      scratchAt(p.x, p.y);
    }

    function onUp() {
      active = false;
      saveScratchMaskSnapshot();
    }

    canvas.addEventListener("mousedown", onDown);
    canvas.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    canvas.addEventListener("mouseleave", onUp);

    canvas.addEventListener("touchstart", onDown, { passive: false });
    canvas.addEventListener("touchmove", onMove, { passive: false });
    canvas.addEventListener("touchend", onUp);
    canvas.addEventListener("touchcancel", onUp);

    if (typeof ResizeObserver !== "undefined") {
      var ro = new ResizeObserver(function () {
        sizeAndRedraw();
      });
      ro.observe(panel);
    } else {
      sizeAndRedraw();
      window.addEventListener("resize", function () {
        sizeAndRedraw();
      });
    }
    if (typeof window !== "undefined") {
      window.addEventListener("trace:tabchange", function (evt) {
        var tab = evt && evt.detail ? evt.detail.tab : "";
        if (tab !== "calendar") return;
        requestAnimationFrame(function () {
          requestAnimationFrame(function () {
            sizeAndRedraw(true);
          });
        });
      });
    }
    setSourceBtnVisible(false);
    sizeAndRedraw();
  })();

})();
