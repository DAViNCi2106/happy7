// ===========================
// Animation Timing
// ===========================

function nextFrame() {
  return new Promise((resolve) => requestAnimationFrame(resolve));
}

function wait(duration) {
  return new Promise((resolve) => setTimeout(resolve, duration));
}

async function runUntil(isDone, step, interval = 16) {
  let last = 0;
  while (!isDone()) {
    const now = await nextFrame();
    if (now - last >= interval) {
      step();
      last = now;
    }
  }
}

function startFrameLoop(step, interval = 16) {
  let last = 0;
  let frameId = 0;
  let running = true;

  function tick(now) {
    if (!running) return;
    if (now - last >= interval) {
      step(now);
      last = now;
    }
    frameId = requestAnimationFrame(tick);
  }

  frameId = requestAnimationFrame(tick);

  return function stop() {
    running = false;
    cancelAnimationFrame(frameId);
  };
}

// ===========================
// Animation Config
// ===========================

const AnimationConfig = {
  SCALE_FACTOR: 0.95,
  SEED_MOVE_SPEED: 2,
  TREE_GROW_DELAY: 10,
  FLOWER_BLOOM_COUNT: 2,
  FLOWER_BLOOM_DELAY: 10,
  TREE_SHIFT_X: 260,
  TREE_MOVE_DURATION: 1600,
  HEART_JUMP_INTERVAL: 25,
  MAX_FALLING_HEARTS: 4,
  FALLING_SPAWN_CHANCE: 0.22,
  TIME_UPDATE_INTERVAL: 1000
};

// ===========================
// Animation Phase Functions
// ===========================

function getCanvasPoint(event, canvas) {
  const source = event.touches ? event.touches[0] : event;
  const rect = canvas.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;
  const logicalWidth = canvas.width / dpr;
  const logicalHeight = canvas.height / dpr;
  return new Point(
    (source.clientX - rect.left) * logicalWidth / rect.width,
    (source.clientY - rect.top) * logicalHeight / rect.height
  );
}

async function waitForUserClick(seed, canvas) {
  return new Promise((resolve) => {
    function handler(e) {
      if (e.type === "touchstart") e.preventDefault();
      const point = getCanvasPoint(e, canvas);
      if (seed.hover(point.x, point.y)) {
        document.getElementById("bgm").play().catch(() => {});
        canvas.removeEventListener("click", handler);
        canvas.removeEventListener("touchstart", handler);
        resolve();
      }
    }

    canvas.addEventListener("click", handler);
    canvas.addEventListener("touchstart", handler, { passive: false });
  });
}

function animateSeedShrink(seed) {
  return runUntil(
    () => !seed.canScale(),
    () => seed.scale(AnimationConfig.SCALE_FACTOR),
    AnimationConfig.TREE_GROW_DELAY
  );
}

function animateSeedMove(seed, footer) {
  return runUntil(
    () => !seed.canMove(),
    () => {
      seed.move(0, AnimationConfig.SEED_MOVE_SPEED);
      footer.draw();
    },
    AnimationConfig.TREE_GROW_DELAY
  );
}

function animateTreeGrow(tree) {
  return runUntil(
    () => !tree.canGrow(),
    () => tree.grow(),
    AnimationConfig.TREE_GROW_DELAY
  );
}

function animateFlowerBloom(tree) {
  return runUntil(
    () => !tree.canFlower(),
    () => tree.flower(AnimationConfig.FLOWER_BLOOM_COUNT),
    AnimationConfig.FLOWER_BLOOM_DELAY
  );
}

async function animateTreeMove(staticCanvas) {
  staticCanvas.classList.add("shifted");
  await wait(AnimationConfig.TREE_MOVE_DURATION);
}

function startHeartJumpAnimation(tree) {
  const { dynamicCtx, width, height } = tree;
  let lastTime = 0;

  function render(now) {
    const dt = Math.min(lastTime ? now - lastTime : 16, 50);
    lastTime = now;
    dynamicCtx.clearRect(0, 0, width, height);
    tree.jump(dt);
  }

  let stop = startFrameLoop(render, AnimationConfig.HEART_JUMP_INTERVAL);

  function handleVisibilityChange() {
    if (document.hidden) {
      stop();
    } else {
      lastTime = 0;
      stop = startFrameLoop(render, AnimationConfig.HEART_JUMP_INTERVAL);
    }
  }

  document.addEventListener("visibilitychange", handleVisibilityChange);
}

// ===========================
// Typewriter Effect
// ===========================

function charDelay(char, base) {
  if ("…".includes(char)) return base * 8;
  if ("。！？.!?".includes(char)) return base * 6;
  if ("，、；：,;:—".includes(char)) return base * 3.5;
  return base + Math.random() * base * 0.4;
}

function parseMarkdownLine(text) {
  const chunks = [];
  const regex = /\*\*(.*?)\*\*/g;
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      chunks.push({ text: text.slice(lastIndex, match.index), isBold: false });
    }
    chunks.push({ text: match[1], isBold: true });
    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    chunks.push({ text: text.slice(lastIndex), isBold: false });
  }

  return chunks.length > 0 ? chunks : [{ text, isBold: false }];
}

async function typewriter(el, speed = 36) {
  el.style.display = "block";

  const title = el.querySelector(".letter-title");
  if (title) {
    title.classList.add("letter-title--visible");
    await wait(500);
  }

  const cursor = document.createElement("span");
  cursor.className = "typewriter-cursor";
  cursor.textContent = "_";

  const paragraphs = el.querySelectorAll("p");
  const lines = [];
  for (const p of paragraphs) {
    const rawText = p.getAttribute("data-raw") || p.textContent;
    lines.push({
      p,
      chunks: parseMarkdownLine(rawText)
    });
    p.textContent = "";
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    line.p.appendChild(cursor);

    for (const chunk of line.chunks) {
      let targetNode;
      if (chunk.isBold) {
        const boldSpan = document.createElement("strong");
        boldSpan.className = "letter-bold";
        line.p.insertBefore(boldSpan, cursor);
        targetNode = boldSpan;
      } else {
        const textNode = document.createTextNode("");
        line.p.insertBefore(textNode, cursor);
        targetNode = textNode;
      }

      for (const char of chunk.text) {
        targetNode.textContent += char;
        await wait(charDelay(char, speed));
      }
    }

    if (i < lines.length - 1) {
      await wait(speed * 5.5);
    }
  }

  cursor.classList.add("typewriter-cursor--done");
  await wait(2500);
  cursor.remove();
}

