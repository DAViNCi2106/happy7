// ===========================
// Clock Display
// ===========================

function createClockDOM(config) {
  const clock = document.getElementById("clock");
  const cfg = config.time || {};
  const digits = {};
  clock.textContent = "";

  function addUnit(key, defaultLabel) {
    const unitBox = document.createElement("div");
    unitBox.className = `clock-unit clock-unit--${key}`;

    const span = document.createElement("span");
    span.className = "digit";
    unitBox.appendChild(span);

    const lbl = document.createElement("span");
    lbl.className = "unit-label";
    lbl.textContent = defaultLabel;
    unitBox.appendChild(lbl);

    clock.appendChild(unitBox);
    digits[key] = { valueEl: span, containerEl: unitBox, labelEl: lbl };
    return digits[key];
  }

  addUnit("months", cfg.month || "months");
  addUnit("days", cfg.day || "days");
  addUnit("hours", cfg.hour || "hours");
  addUnit("minutes", cfg.minute || "mins");
  addUnit("seconds", cfg.second || "secs");

  return digits;
}

function calculateTimeElapsed(startMs, nowMs = Date.now()) {
  const startDate = new Date(startMs);
  const nowDate = new Date(nowMs);

  let years = nowDate.getFullYear() - startDate.getFullYear();
  let months = nowDate.getMonth() - startDate.getMonth() + years * 12;

  let anchor = new Date(startDate);
  anchor.setFullYear(startDate.getFullYear());
  anchor.setMonth(startDate.getMonth() + months);

  if (anchor > nowDate) {
    months--;
    anchor = new Date(startDate);
    anchor.setMonth(startDate.getMonth() + months);
  }

  let diffMs = Math.max(0, nowDate - anchor);
  let totalSecs = Math.floor(diffMs / 1000);

  const secondsPerMinute = 60;
  const secondsPerHour = secondsPerMinute * 60;
  const secondsPerDay = secondsPerHour * 24;

  const days = Math.floor(totalSecs / secondsPerDay);
  const remSecs = totalSecs % secondsPerDay;

  const hours = Math.floor(remSecs / secondsPerHour);
  const minutes = Math.floor((remSecs % secondsPerHour) / secondsPerMinute);
  const seconds = remSecs % secondsPerMinute;

  return { months, days, hours, minutes, seconds };
}

function timeElapse(startMs, digits) {
  const cfg = (typeof CONFIG !== "undefined" && CONFIG.time) ? CONFIG.time : {};
  const elapsed = calculateTimeElapsed(startMs);

  function twoDigits(value) {
    return String(value).padStart(2, "0");
  }

  // Months
  if (digits.months) {
    digits.months.valueEl.textContent = String(elapsed.months);
    digits.months.labelEl.textContent = elapsed.months === 1
      ? (cfg.monthSingular || "month")
      : (cfg.month || "months");
  }

  // Days: if 0 days, we hide days container so it reads cleanly as "7 months 5 hours..."
  // When days > 0, it seamlessly displays "X days"
  if (digits.days) {
    if (elapsed.days === 0) {
      digits.days.containerEl.style.display = "none";
    } else {
      digits.days.containerEl.style.display = "inline-flex";
      digits.days.valueEl.textContent = String(elapsed.days);
      digits.days.labelEl.textContent = elapsed.days === 1
        ? (cfg.daySingular || "day")
        : (cfg.day || "days");
    }
  }

  // Hours
  if (digits.hours) {
    digits.hours.valueEl.textContent = twoDigits(elapsed.hours);
    digits.hours.labelEl.textContent = elapsed.hours === 1
      ? (cfg.hourSingular || "hour")
      : (cfg.hour || "hours");
  }

  // Minutes
  if (digits.minutes) {
    digits.minutes.valueEl.textContent = twoDigits(elapsed.minutes);
  }

  // Seconds
  if (digits.seconds) {
    digits.seconds.valueEl.textContent = twoDigits(elapsed.seconds);
  }
}

// ===========================
// Responsive Scaling
// ===========================

function scaleContent() {
  const viewport = document.getElementById("viewport");
  const main = document.getElementById("main");

  function resize() {
    const scale = Math.min(
      window.innerWidth / StageConfig.width,
      window.innerHeight / StageConfig.height,
      1
    );
    viewport.style.width = `${StageConfig.width * scale}px`;
    viewport.style.height = `${StageConfig.height * scale}px`;
    main.style.transform = `scale(${scale})`;
  }

  resize();
  window.addEventListener("resize", resize);
}

// ===========================
// Content Initialization
// ===========================

function initContent(config) {
  const letter = document.getElementById("letter");
  letter.textContent = "";

  if (config.letter.title) {
    const title = document.createElement("h2");
    title.className = "letter-title";
    title.textContent = config.letter.title;
    letter.appendChild(title);
  }

  function addParagraph(lines) {
    const stanza = document.createElement("div");
    stanza.className = "letter-stanza";
    lines.forEach(line => {
      const p = document.createElement("p");
      p.setAttribute("data-raw", line);
      p.textContent = line;
      stanza.appendChild(p);
    });
    letter.appendChild(stanza);
  }

  function createName(text) {
    const span = document.createElement("span");
    span.className = "name";
    span.textContent = text;
    return span;
  }

  const paragraphs = config.letter.paragraphs || [
    config.letter.paragraph1,
    config.letter.paragraph2,
    config.letter.paragraph3
  ].filter(Boolean);

  paragraphs.forEach(lines => {
    addParagraph(lines);
  });

  const clockText = document.getElementById("clock-text");
  clockText.textContent = "";
  clockText.appendChild(createName(config.couple.name1));
  clockText.appendChild(document.createTextNode(` ${config.couple.connector} `));
  clockText.appendChild(createName(config.couple.name2));
  clockText.appendChild(document.createTextNode(` ${config.couple.together}`));
}

// ===========================
// Canvas Initialization
// ===========================

function initCanvas(id) {
  const canvas = document.getElementById(id);
  const { width: w, height: h } = StageConfig;
  const dpr = window.devicePixelRatio || 1;
  canvas.width = w * dpr;
  canvas.height = h * dpr;
  canvas.style.width = w + "px";
  canvas.style.height = h + "px";
  canvas.getContext("2d").scale(dpr, dpr);
  return canvas;
}

