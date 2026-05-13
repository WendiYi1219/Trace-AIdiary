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
    "1": "../assets/day-1.png",
    "9": "../assets/day-9.png",
    "10": "../assets/day-10.png",
    "14": "../assets/day-14.png",
    "16": "../assets/day-16.png",
    "21": "../assets/day-21.png",
    "22": "../assets/day-22.png",
    "24": "../assets/day-24.png",
  };
  const CALENDAR_PRESET_DAY_ARCHIVES = {
    "21": {
      gratitude: [
        "Had my PolyU ISD interview this afternoon. I think it went pretty well — the interviewer and I had a great conversation! ISD is a tough program to get into. Somehow this interview rebuilt my confidence a bit.",
        "F (my upstairs neighbor, a girl) came back from her spring-break trip. I went over at 11:30pm and she made me instant noodles. We chatted until 4am — I really love talking to friends.",
        "Made some real progress organizing my personal website today.",
      ],
      improve: [
        "Woke up feeling terrible this morning. Anxious about the upcoming interview, terrified about graduation looming, sad about saying goodbye to friends — anxiety, confusion, and melancholy all tangled together and overwhelmed me. Maybe it's the change of seasons? Getting up earlier next time might help.",
        "Got up too late and skipped breakfast. Next time I'll leave myself at least enough time to eat one egg.",
      ],
      affirm: ["Staying curious about the world is the real foundation of motivation!"],
    },
    "22": {
      gratitude: [
        "Taking out the trash behind the house, I happened to bump into V (a guy) in his pajamas grabbing his delivery. We made eye contact and burst out laughing. He invited me over for dinner — went at 7:30pm, he made beef and tomato-egg, and we watched 4–5 episodes of a show. V counted on the calendar: 9 weeks until graduation. My heart sank a bit. But since time keeps moving, might as well live each day well.",
        "Had a really fun afternoon chat with G (a guy) and his mom in the ID building.",
        "Beautiful weather today, my mood was good from the morning on. The temperature wasn't actually high, but at least the sun was out — even the Trader Joe's run felt joyful.",
      ],
      improve: ["Talked with people so much that none of my plans moved forward.", "I really do need to get up earlier!"],
      affirm: ["I genuinely love interaction design — I flow into focus mode just watching tutorials."],
    },
    "24": {
      gratitude: [
        "Stopped by S's place at 9:30pm, lay on her couch chatting, my friend X sprawled on the floor cushion. Hadn't seen them in a while — talking about work, jobs, the future, my anxiety started easing up.",
        "At 8pm (just after dark) we went to see J's band play on the Brown University lawn, classmates in clusters, laughing and shouting. People screamed J's name from the crowd. This is J's band's last show in college.",
        "Stayed up till 1am chatting with my roommate L — she shared some of her anxieties and little worries. L suddenly said, \"Talking with you is so soothing and healing, queen. Anyone who says you're too rational is wrong. I think you're emotionally pretty perceptive.\"",
      ],
      improve: ["Felt drained when I got home in the evening. I should have done a bit of work.", "Was a little impatient with my friends at dinner. That wasn't great."],
      affirm: ["I've got a future, breathing room, and friends. Life is good! Keep going!!"],
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
      "Can't reach the chat service. Please check:",
      "1. In the project root, run: node server.js (you should see 'Trace app running at http://localhost:8787')",
      "2. Open http://localhost:8787 in your browser to load this page (same origin as the image API — easiest setup)",
      "3. GEMINI_API_KEY is configured in .env, and node has been restarted",
    ];
    try {
      if (typeof location !== "undefined" && location.protocol === "https:") {
        var base = resolveGenerateApiBase();
        if (base && /^http:/i.test(String(base))) {
          lines.push(
            "4. If this page is loaded over HTTPS (e.g. some embedded preview browsers), it may block requests to http://localhost. Open the URL above in your system browser over http:// instead."
          );
        }
      }
    } catch (x) {
      /* ignore */
    }
    var em = err && err.message ? String(err.message) : "";
    if (em.indexOf("Failed to fetch") >= 0 || em.indexOf("NetworkError") >= 0) {
      lines.push("(Tip: 'Failed to fetch' usually means the server isn't running, the port is wrong, or an HTTPS page is blocking an http API.)");
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
      setStatus("Please fill in at least one Gratitude entry first.", true);
      return;
    }

    try {
      if (generateBtn) generateBtn.disabled = true;
      setFeedbackEnabled(false);
      setDownloadVisible(false);
      setStatus("AI is generating your image...", false);
      hero.classList.add("hero--generating");

      var response = await fetch(generateApiBase + "/api/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lines: lines, lang: "en" }),
      });

      var text = await response.text();
      var payload;
      try {
        payload = text ? JSON.parse(text) : {};
      } catch (parseErr) {
        throw new Error(
          response.status === 404
            ? "Image-generation endpoint not found. Run 'node server.js' in the project directory and load this page from http://localhost:8787 — don't open it from file:// or a static-only server."
            : "Server returned a non-JSON response. Please make sure node server is running."
        );
      }
      if (!response.ok || !payload.imageUrl) {
        throw new Error(payload.error || "Generation failed, please try again later.");
      }

      var finalUrl = await trimUniformBorder(payload.imageUrl);
      heroImg.src = finalUrl;
      hero.classList.add("hero--has-image");
      syncDownloadWithHero();
      setFeedbackEnabled(true);
      setStatus("Image generated.", false);
    } catch (error) {
      var msg = error && error.message ? error.message : "API call failed, please check your configuration.";
      if (/failed to fetch|networkerror|load failed/i.test(String(msg)) || (error && error.name === "TypeError")) {
        msg =
          "Can't reach the image-generation service. Run 'node server.js' in the project directory and open http://localhost:8787 in your system browser (Cursor's built-in HTTPS preview blocks http API calls). Make sure GEMINI_API_KEY is set in .env and node has been restarted. If your endpoint is elsewhere, set window.TRACE_GENERATE_API_ORIGIN.";
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
      empty.textContent = "No diary archive saved for this day yet.";
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
      empty.textContent = "Nothing yet";
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
      calendarDiaryTitle.textContent = (dateKey || "Today") + " · Diary Archive";
    }
    if (!record) {
      var empty = document.createElement("p");
      empty.className = "calendar-diary-archive__empty";
      empty.textContent = "No diary archive saved for this day yet.";
      calendarDiaryArchive.appendChild(empty);
      calendarDiaryModal.hidden = false;
      return;
    }
    if (record.imageUrl) {
      var img = document.createElement("img");
      img.className = "calendar-diary-archive__img";
      img.alt = "Daily illustration";
      img.src = record.imageUrl;
      calendarDiaryArchive.appendChild(img);
    }
    calendarDiaryArchive.appendChild(
      renderArchiveList("3 things I'm grateful for", record.gratitude || [], "calendar-diary-archive__section--orange")
    );
    calendarDiaryArchive.appendChild(
      renderArchiveList("2 areas I can improve", record.improve || [], "calendar-diary-archive__section--teal")
    );
    calendarDiaryArchive.appendChild(
      renderArchiveList("1 affirmation to myself", record.affirm || [], "calendar-diary-archive__section--violet")
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
    if (scratchSourceTitle) scratchSourceTitle.textContent = dateKey + " · Diary Source";
    scratchSourceGratitude.innerHTML = "";
    var list = Array.isArray(record.gratitude) ? record.gratitude : [];
    var idx = typeof gratitudeIndex === "number" ? gratitudeIndex : -1;
    if (idx < 0 || idx >= list.length) idx = 0;
    var line = list[idx] || "Nothing yet";
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
      art.alt = "Daily generated illustration";
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
      setStatus("Please generate an image before adding to the calendar.", true);
      return;
    }
    var targetCell = getTodayCalendarCell();
    if (!targetCell) {
      setStatus("Today's date isn't in the current calendar month.", true);
      return;
    }
    var art = setCalendarCellArt(targetCell, heroImg.src, false);
    if (!art) return;
    saveArchiveForCell(targetCell, heroImg.src);

    switchTab("calendar");
    setCalendarCellArt(targetCell, heroImg.src, true);

    setStatus("Added to calendar.", false);
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
    var intro = "Here are your analysis results";
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
            lang: "en",
          }),
        });
        var points = [];
        var narrativeElLocal = null;
        if (!responseEt.ok || !responseEt.body || !responseEt.body.getReader) {
          throw new Error("Emotion-trend request failed (" + responseEt.status + ")");
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
          throw new Error("Empty analysis result");
        }
      } catch (etErr) {
        emotionOk = false;
        var emotionMsg =
          etErr && etErr.message ? String(etErr.message) : "Emotion-trend analysis failed. Please try again later or check node logs.";
        setStatus(emotionMsg, true);
        try {
          window.alert("AI Analyzer failed:\n" + emotionMsg);
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
          "The selected date range has no 'areas to improve' or 'self-affirmation' entries, so hidden-positive-signals analysis can't run.",
          true
        );
      } else {
        var hiddenShell = null;
        try {
          var hidRes = await fetch(baseUrl + "/api/hidden-positive-signals", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ entries: entriesForHidden, lang: "en" }),
          });
          if (!hidRes.ok || !hidRes.body || typeof hidRes.body.getReader !== "function") {
            throw new Error("Hidden-positive-signals request failed (" + hidRes.status + ")");
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
            "Hidden Positive Signals couldn't be generated: " +
              (hidErr && hidErr.message ? String(hidErr.message) : "Please make sure node server is running and the network is available."),
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
        setStatus("Please select at least one date in the calendar first.", true);
        return;
      }
      if (!calendarGrid) return;
      var year = parseInt(calendarGrid.dataset.year || "", 10);
      var month = parseInt(calendarGrid.dataset.month || "", 10);
      if (Number.isNaN(year) || Number.isNaN(month)) {
        setStatus("Couldn't read the current calendar year/month.", true);
        return;
      }

      var startDay = days[0];
      var endDay = days[days.length - 1];
      var startKey = buildDateKey(year, month, startDay);
      var endKey = buildDateKey(year, month, endDay);
      var entries = collectArchiveEntriesInRange(startKey, endKey);
      if (!entries.length) {
        setStatus("No diary content to analyze in the selected date range.", true);
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
        setStatus("Please check at least one analysis option (A / B).", true);
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
            ? "AI Analyzer: generating emotion trend and hidden positive signals…"
            : wantsEmotionTrend
              ? "AI Analyzer: generating emotion trend…"
              : "AI Analyzer: generating hidden positive signals…",
          false
        );
        await runCalendarAiAnalysis(startKey, endKey, entries, wantsEmotionTrend, wantsHiddenSignals);
      } catch (error) {
        var msg = error && error.message ? error.message : "Analysis service unavailable";
        setStatus(msg, true);
        try {
          window.alert("AI Analyzer failed:\n" + msg);
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
    "Hi, I'm Echo,",
    "the keeper of your diary.",
    "I read every day with you —",
    "the people you meet, the things you go through; your joys, your sorrows, and the words you say to yourself.",
    "Every Trace you leave behind, I remember.",
    "",
    "Is there anything you'd like to talk about?",
  ].join("\n");

  /** 识别「你是谁 / 自我介绍 / Echo 是谁」等同义问法（含少量改写），避免误伤长文里偶然出现的字眼 */
  function aiChatIsWhoAreYouQuestion(t) {
    var s = String(t || "").trim();
    if (!s || s.length > 72) return false;
    var compact = s.replace(/\s+/g, "");
    var low = s.toLowerCase();

    if (/\bwho\s+(do\s+you\s+think\s+)?you\s+(think\s+you\s+)?(are|am)\b/i.test(low)) return true;
    if (/\bwho\s+r\s+u\b/i.test(low)) return true;
    if (/\bwhat\s+are\s+you\b/i.test(low)) return true;
    if (/\bwhat'?s\s+your\s+name\b/i.test(low)) return true;
    if (/\bwhat\s+is\s+your\s+name\b/i.test(low)) return true;
    if (/\b(introduce|tell\s+me\s+about)\s+(your)?self\b/i.test(low)) return true;
    if (/\bare\s+you\s+(an?\s+)?(ai|bot|echo|chatbot|assistant|robot)\b/i.test(low)) return true;
    if (/\bwhich\s+(model|ai)\b/i.test(low)) return true;
    if (/\bwhat\s+(model|ai)\s+(are\s+you|do\s+you\s+use)\b/i.test(low)) return true;
    if (/\byour\s+(identity|name|model)\b/i.test(low)) return true;

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
    if (/^(hi|hello|hey|hiya|yo|sup|howdy|good\s+(morning|afternoon|evening|night))([!！?？。.,，\s]*)$/i.test(low)) return true;
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
    actions.setAttribute("aria-label", "Message actions");
    var wrap = document.createElement("div");
    wrap.className = "ai-chat__action-bar-wrap";
    var img = document.createElement("img");
    img.className = "ai-chat__action-bar-img";
    img.src = "../assets/frame-120.svg";
    img.alt = "";
    img.decoding = "async";
    img.width = 168;
    img.height = 36;
    var hits = document.createElement("div");
    hits.className = "ai-chat__action-bar-hits";
    var hitLabels = ["Copy", "Like", "Dislike", "Refresh"];
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
      "Emotion Report: " + parseDateKeyToLabel(startDate) + " - " + parseDateKeyToLabel(endDate);
    cardHeader.appendChild(title);
    var axisHint = document.createElement("p");
    axisHint.className = "ai-chat__trend-axis-hint";
    axisHint.textContent = "X-axis: Date  ·  Y-axis: Positivity score (1-10)";
    var legend = document.createElement("div");
    legend.className = "ai-chat__trend-legend";
    [
      { band: "low", label: "1-3 Low" },
      { band: "mid", label: "4-7 Mid" },
      { band: "high", label: "8-10 High" },
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
    svg.setAttribute("aria-label", "Emotion positivity trend chart");

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
    yAxisTitle.textContent = "Positivity (1-10)";
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
    xAxisTitle.textContent = "Date";
    svg.appendChild(xAxisTitle);

    card.appendChild(svg);

    var narrWrap = document.createElement("div");
    narrWrap.className = "ai-chat__trend-narrative";
    narrWrap.hidden = false;
    var narrLbl = document.createElement("div");
    narrLbl.className = "ai-chat__trend-narrative-label";
    narrLbl.textContent = "Trend interpretation";
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
      "Hidden Positive Signals: " + parseDateKeyToLabel(startDate) + " - " + parseDateKeyToLabel(endDate);
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
      var a = /^\[([^\]]+)\]$/.exec(trimmed);
      if (a) return { title: a[1].trim() };
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
      var blockRe = /(?:【([^】]+)】|\[([^\]]+)\])\s*\n([\s\S]+?)(?=\n\s*(?:【|\[)|$)/g;
      var bm;
      while ((bm = blockRe.exec(t)) !== null) {
        var bt = bm[3].trim();
        if (bt) {
          sections.push({ title: (bm[1] || bm[2] || "").trim(), body: bt });
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
      "Hidden Positive Signals: " + parseDateKeyToLabel(startDate) + " - " + parseDateKeyToLabel(endDate);
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
      var delay = /[，。！？；,.!?]/.test(ch) ? 38 : 18;
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
    bubble.textContent = "Thinking…";
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
        body: JSON.stringify({ messages: aiChatHistory, lang: "en" }),
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
              ? "Request failed (" + response.status + ")"
              : "No valid reply received";
        aiChatAppendAssistantBubble("Sorry, Echo couldn't reply just now: " + errMsg, true);
        setStatus(errMsg, true);
        return;
      }

      await aiChatAppendAssistantBubbleTyped(reply, false);
      aiChatAppendAssistantActionBarRow(reply, true);
      aiChatHistory.push({ role: "assistant", text: reply });
      setStatus("", false);
    } catch (e) {
      aiChatRemoveRow(pendingRow);
      aiChatHistory.pop();
      aiChatAppendAssistantBubble(buildAiChatUnreachableMessage(e), true);
      setStatus("Can't reach the chat service", true);
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
      setStatus("Please generate an image before saving.", true);
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
      setStatus("Image saved to your device.", false);
    } catch (e) {
      setStatus("Save failed, please try again.", true);
    }
  }

  if (downloadImageBtn) {
    downloadImageBtn.addEventListener("click", downloadCurrentImage);
  }

  if (feedbackLikeBtn) {
    feedbackLikeBtn.addEventListener("click", function () {
      if (!lastGeneratedUserPromptForFeedback) {
        setStatus("Please generate an image first.", true);
        return;
      }
      setFeedbackVisualState("liked");
      setStatus("Recorded as 'liked' preference (Demo).", false);
    });
  }

  if (feedbackDislikeBtn) {
    feedbackDislikeBtn.addEventListener("click", function () {
      if (!lastGeneratedUserPromptForFeedback) {
        setStatus("Please generate an image first.", true);
        return;
      }
      setFeedbackVisualState("disliked");
      setStatus("Recorded as 'disliked' preference (Demo).", false);
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
    setStatus("All inputs cleared.", false);
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

    var SCRATCH_PLACEHOLDER_TEXT = "A warm moment with friends today.";
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
        .replace(/\b[A-Z]\b(?=\s*\(|\s|$)/g, "a friend")
        .replace(/\d{1,2}:\d{2}(?:\s*[AP]M)?/gi, "late at night")
        .replace(/trader joe'?s/gi, "the grocery store")
        .trim();
      var firstClause = src.split(/[.!?]/)[0] || "";
      var coreClause = firstClause.split(/[,;—–]/)[0] || firstClause;
      var keywordPool = [];
      if (/friend|chat|chatting|hang out|dinner|gather|together/i.test(src)) keywordPool.push("Being with friends warmed my heart today.", "A long chat with a friend felt healing.");
      if (/sun|sunshine|weather|beautiful|happy|joyful/i.test(src)) keywordPool.push("The sun was just right, and so was my mood.", "Beautiful weather made the day feel light.");
      if (/interview|interviewer|performed|confiden/i.test(src)) keywordPool.push("The interview went well — I feel more confident.", "A good interview lit a little spark of confidence.");
      /** Live performance: explicit cues — band, lawn, stage, concert. Plain "show" alone is too ambiguous (also matches "TV show"). */
      if (/\bband\b|\blawn\b|\bstage\b|\bconcert\b|live\s+(show|music|gig)|perform(ing|ance)/i.test(src)) keywordPool.push("Seeing friends perform was joyful and healing.", "A show on the lawn brought a long-missed kind of happiness.");
      /** Watching shows / episodes at home — distinct from a live show. */
      if (/episode|episodes|watched (a |some )?(show|series|tv)|watching (a |some )?(show|series|tv)/i.test(src)) keywordPool.push("A quiet evening of shows together felt cozy.", "Dinner and a few episodes with a friend made the night easy.");
      if (/anxious|anxiety|ease|easing|healing|heal/i.test(src)) keywordPool.push("As we talked, the anxiety slowly let go.", "Saying my worries out loud lifted something off my chest.");
      if (/website|web|organize|organizing|update|maintain/i.test(src)) {
        keywordPool.push("Real progress on my personal website today.", "Pushed the website project one step forward.");
      }
      if (/late|midnight|stay(ed)? up|all night|1am|4am/i.test(src)) {
        keywordPool.push("Stayed up chatting with a friend — a reminder to rest earlier next time.");
      }
      if (/graduat|weeks until|time (keeps|won't)|9 weeks/i.test(src)) {
        keywordPool.push("With graduation near, I want to live today more carefully.");
      }
      if (!keywordPool.length) {
        if (coreClause) {
          keywordPool = ["What I want to remember today: " + coreClause.trim() + "."];
        } else {
          keywordPool = ["A small thing today really cheered me up."];
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
      /* Force English copy: reject CJK and over-long lines so the card stays one-liner. */
      if (/[\u4e00-\u9fff]/.test(cleaned)) return "";
      if (cleaned.length > 80) return "";
      /* Reject obvious fragments / truncated output (e.g. "Here is", "A quiet"). */
      if (cleaned.length < 15) return "";
      var wordCount = cleaned.split(/\s+/).filter(Boolean).length;
      if (wordCount < 4) return "";
      if (/[,;:—–-]$/.test(cleaned)) return "";
      if (/\b(the|a|an|is|are|to|of|and|with|in|on)$/i.test(cleaned)) return "";
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
          lang: "en",
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
