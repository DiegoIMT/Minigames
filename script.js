const projectList = [
  { id: "coin", title: "1. Falacia del jugador", subtitle: "Una racha no cambia la probabilidad del siguiente lanzamiento." },
  { id: "casino", title: "2. ¿Puedes ganarle al casino?", subtitle: "La emoción del juego no elimina la ventaja de la casa." },
  { id: "cards", title: "3. La carta que nunca sale", subtitle: "Ver patrones no significa que el sistema tenga memoria." },
  { id: "contagion", title: "4. Contagio visual", subtitle: "La probabilidad depende del contacto, no de la intuición." },
  { id: "rare", title: "5. ¿Más intentos = éxito seguro?", subtitle: "Muchos intentos aumentan la oportunidad, pero no garantizan nada." },
  { id: "loot", title: "6. Loot boxes", subtitle: "Abrir muchas cajas puede seguir sin darte el legendario." },
  { id: "numbers", title: "7. Los números no tienen memoria", subtitle: "La mente ve patrones aunque el proceso sea aleatorio." },
  { id: "slots", title: "8. La ilusión del casi acierto", subtitle: "Quedarte cerca no cambia la probabilidad real del siguiente intento." }
];

const app = document.getElementById("app");
const menu = document.getElementById("projectMenu");
let activeProject = "coin";
let cleanup = null;

function statCard(label, value, hint = "") {
  return `
    <div class="stat-card glow-card">
      <span>${label}</span>
      <strong>${value}</strong>
      ${hint ? `<small>${hint}</small>` : ""}
    </div>
  `;
}

function frame({ title, subtitle, myth, lesson, main }) {
  return `
    <section class="project-frame glass">
      <div class="project-main">
        <div>
          <h2 class="project-title">${title}</h2>
          <p class="project-subtitle">${subtitle}</p>
        </div>
        ${main}
      </div>
      <aside class="project-side">
        <div class="info-box danger">
          <h3>Mito</h3>
          <p>${myth}</p>
        </div>
        <div class="info-box success">
          <h3>Lo que demuestra</h3>
          <p>${lesson}</p>
        </div>
      </aside>
    </section>
  `;
}

function renderMenu() {
  menu.innerHTML = projectList.map(project => `
    <button class="menu-btn ${project.id === activeProject ? "active" : ""}" data-id="${project.id}">
      <strong>${project.title}</strong>
      <span>${project.subtitle}</span>
    </button>
  `).join("");

  menu.querySelectorAll(".menu-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      activeProject = btn.dataset.id;
      renderMenu();
      renderProject();
      window.scrollTo({ top: menu.offsetTop - 12, behavior: "smooth" });
    });
  });
}

function renderProject() {
  if (cleanup) {
    cleanup();
    cleanup = null;
  }

  switch (activeProject) {
    case "coin": cleanup = renderCoin(); break;
    case "casino": cleanup = renderCasino(); break;
    case "cards": cleanup = renderCards(); break;
    case "contagion": cleanup = renderContagion(); break;
    case "rare": cleanup = renderRare(); break;
    case "loot": cleanup = renderLoot(); break;
    case "numbers": cleanup = renderNumbers(); break;
    case "slots": cleanup = renderSlots(); break;
    default: cleanup = renderCoin();
  }
}

function renderCoin() {
  let history = [];
  let autoId = null;

  app.innerHTML = frame({
    title: "Falacia del jugador",
    subtitle: "Después de una racha, el usuario siente que ahora ‘ya toca’ el resultado opuesto.",
    myth: "Si han salido muchas caras seguidas, entonces ahora debería salir cruz.",
    lesson: "Aunque haya una racha larga, el siguiente lanzamiento sigue teniendo la misma probabilidad que al inicio.",
    main: `
      <div class="panel">
        <div class="coin-stage"><div class="coin" id="coinVisual">🪙</div></div>
        <div class="controls">
          <button class="btn primary" id="coinOnce">Lanzar una vez</button>
          <button class="btn secondary" id="coinAuto">Auto lanzar</button>
          <button class="btn outline" id="coinReset">Reiniciar</button>
        </div>
        <div class="stats-grid" id="coinStats"></div>
        <div class="history" id="coinHistory"></div>
      </div>
    `
  });

  const historyEl = document.getElementById("coinHistory");
  const statsEl = document.getElementById("coinStats");
  const autoBtn = document.getElementById("coinAuto");
  const coinVisual = document.getElementById("coinVisual");

  function update() {
    const heads = history.filter(x => x === "Cara").length;
    const tails = history.filter(x => x === "Cruz").length;
    let streak = 0;

    if (history.length) {
      const first = history[0];
      for (const item of history) {
        if (item === first) streak++;
        else break;
      }
      coinVisual.textContent = first === "Cara" ? "🙂" : "✖";
    } else {
      coinVisual.textContent = "🪙";
    }

    statsEl.innerHTML = [
      statCard("Caras", heads),
      statCard("Cruces", tails),
      statCard("Racha actual", history.length ? `${streak} ${history[0]}` : "-", "La racha impresiona, pero no cambia el siguiente 50/50.")
    ].join("");

    historyEl.innerHTML = history.length
      ? history.map(item => `<div class="pill ${item === "Cara" ? "heads" : "tails"}">${item === "Cara" ? "🙂 Cara" : "✖ Cruz"}</div>`).join("")
      : `<span style="color:#cbd5e1;">Aquí aparecerá el historial visual.</span>`;
  }

  function launch() {
    coinVisual.classList.remove("spin");
    void coinVisual.offsetWidth;
    coinVisual.classList.add("spin");
    history.unshift(Math.random() < 0.5 ? "Cara" : "Cruz");
    history = history.slice(0, 24);
    setTimeout(update, 230);
  }

  document.getElementById("coinOnce").onclick = launch;

  autoBtn.onclick = () => {
    if (autoId) {
      clearInterval(autoId);
      autoId = null;
      autoBtn.textContent = "Auto lanzar";
    } else {
      autoId = setInterval(launch, 800);
      autoBtn.textContent = "Detener auto";
    }
  };

  document.getElementById("coinReset").onclick = () => {
    history = [];
    if (autoId) clearInterval(autoId);
    autoId = null;
    autoBtn.textContent = "Auto lanzar";
    update();
  };

  update();
  return () => autoId && clearInterval(autoId);
}

function renderCasino() {
  let balance = 100;
  let msg = "Apuesta 10 fichas al rojo.";
  let spins = [];
  let currentAngle = 0;
  let spinning = false;

  const sectors = [
    { name: "Rojo", start: 0, end: 120 },
    { name: "Negro", start: 120, end: 240 },
    { name: "Rojo", start: 240, end: 330 },
    { name: "Verde", start: 330, end: 360 }
  ];

  app.innerHTML = frame({
    title: "¿Puedes ganarle al casino?",
    subtitle: "Una ruleta simplificada para mostrar que la emoción no elimina la desventaja matemática.",
    myth: "Si juego suficiente tiempo, tarde o temprano terminaré ganando.",
    lesson: "Puedes tener rachas buenas, pero si el juego tiene ventaja para la casa, a largo plazo el saldo suele caer.",
    main: `
      <div class="panel">
        <div class="casino-wheel-wrap">
          <div class="casino-pointer"></div>
          <div class="casino-wheel" id="casinoWheel">
            <div class="casino-center">Rojo / Negro / Verde</div>
          </div>
        </div>

        <div class="controls" style="margin-top:16px;">
          <button class="btn success" id="casinoSpin">Girar</button>
          <button class="btn outline" id="casinoReset">Reiniciar</button>
        </div>

        <div class="stats-grid" id="casinoStats"></div>
        <div class="history" id="casinoHistory"></div>
      </div>
    `
  });

  const statsEl = document.getElementById("casinoStats");
  const historyEl = document.getElementById("casinoHistory");
  const wheelEl = document.getElementById("casinoWheel");
  const spinBtn = document.getElementById("casinoSpin");
  const resetBtn = document.getElementById("casinoReset");

  function update() {
    statsEl.innerHTML = [
      statCard("Saldo", `${balance} fichas`),
      statCard("Últimos giros", spins.length),
      statCard("Mensaje", msg)
    ].join("");

    historyEl.innerHTML = spins.length
      ? spins.map(s => `<div class="pill ${s === "Rojo" ? "red" : s === "Negro" ? "black" : "green"}">${s}</div>`).join("")
      : `<span style="color:#cbd5e1;">Aquí aparecerán los resultados de cada giro.</span>`;
  }

  function getRandomSector() {
    return sectors[Math.floor(Math.random() * sectors.length)];
  }

  function getTargetAngleForSector(sector) {
    const center = (sector.start + sector.end) / 2;
    const fullTurns = 1440;
    return currentAngle + fullTurns + (360 - center);
  }

  spinBtn.onclick = () => {
    if (spinning) return;

    spinning = true;
    spinBtn.disabled = true;
    resetBtn.disabled = true;
    spinBtn.textContent = "Girando...";

    const sector = getRandomSector();
    const result = sector.name;

    currentAngle = getTargetAngleForSector(sector);
    wheelEl.style.transform = `rotate(${currentAngle}deg)`;

    setTimeout(() => {
      spins.unshift(result);
      spins = spins.slice(0, 18);

      if (result === "Rojo") {
        balance += 10;
        msg = "Ganaste 10 fichas. Se siente bien… pero sigue jugando un rato más.";
      } else {
        balance -= 10;
        msg = result === "Verde"
          ? "Salió verde. La casa sonríe."
          : "Perdiste 10 fichas. La ventaja de la casa sigue allí.";
      }

      update();
      spinning = false;
      spinBtn.disabled = false;
      resetBtn.disabled = false;
      spinBtn.textContent = "Girar";
    }, 3200);
  };

  resetBtn.onclick = () => {
    if (spinning) return;

    balance = 100;
    msg = "Apuesta 10 fichas al rojo.";
    spins = [];
    currentAngle = 0;
    wheelEl.style.transform = "rotate(0deg)";
    update();
  };

  update();
  return () => {};
}


function renderCards() {
  let draws = [];
  const deck = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];
  let burstTimers = [];

  app.innerHTML = frame({
    title: "La carta que nunca sale",
    subtitle: "Un tablero visual para mostrar cómo los estudiantes suelen interpretar mal la aleatoriedad.",
    myth: "Si una carta no ha salido en mucho tiempo, ahora es más probable que por fin aparezca.",
    lesson: "En extracciones independientes con reposición, que una carta tarde en aparecer no obliga al sistema a compensarla.",
    main: `
      <div class="panel">
        <div class="controls">
          <button class="btn primary" id="drawOne">Robar carta</button>
          <button class="btn secondary" id="drawMany">Robar 15</button>
          <button class="btn outline" id="drawReset">Limpiar</button>
        </div>
        <div class="card-grid" id="cardGrid"></div>
        <div class="card-history" id="cardHistory"></div>
      </div>
    `
  });

  const cardGrid = document.getElementById("cardGrid");
  const historyEl = document.getElementById("cardHistory");

  function drawOne() {
    draws.unshift(deck[Math.floor(Math.random() * deck.length)]);
    draws = draws.slice(0, 30);
    update();
  }

  function update() {
    const counts = Object.fromEntries(deck.map(card => [card, draws.filter(d => d === card).length]));
    cardGrid.innerHTML = deck.map(card => `
      <div class="card-tile">
        <strong>${card}</strong>
        <small>Frecuencia</small>
        <div style="font-size:22px;font-weight:bold;color:#93c5fd;margin-top:6px;">${counts[card]}</div>
      </div>
    `).join("");

    historyEl.innerHTML = draws.length
      ? draws.map(card => `<div class="card-mini">${card}</div>`).join("")
      : `<span style="color:#cbd5e1;">Aquí irán cayendo las cartas robadas.</span>`;
  }

  document.getElementById("drawOne").onclick = drawOne;

  document.getElementById("drawMany").onclick = () => {
    burstTimers.forEach(clearTimeout);
    burstTimers = [];
    for (let i = 0; i < 15; i++) burstTimers.push(setTimeout(drawOne, i * 95));
  };

  document.getElementById("drawReset").onclick = () => {
    draws = [];
    burstTimers.forEach(clearTimeout);
    burstTimers = [];
    update();
  };

  update();
  return () => burstTimers.forEach(clearTimeout);
}

function renderContagion() {
  const size = 25;
  let grid = Array.from({ length: size }, (_, i) => (i === 12 ? 2 : 0));
  let running = false;
  let risk = 0.25;
  let timer = null;

  app.innerHTML = frame({
    title: "Contagio visual",
    subtitle: "Una simulación sencilla donde el contagio depende de quién toca a quién y con qué probabilidad.",
    myth: "El contagio ocurre al azar, sin relación con el contacto entre personas.",
    lesson: "La propagación cambia radicalmente cuando aumentas contactos o riesgo de transmisión.",
    main: `
      <div class="panel">
        <div class="controls">
          <button class="btn primary" id="contagionToggle">Iniciar</button>
          <button class="btn outline" id="contagionReset">Reiniciar</button>
          <div class="range-wrap">
            <span>Riesgo:</span>
            <input type="range" id="contagionRisk" min="0.05" max="0.95" step="0.05" value="0.25" />
            <strong id="contagionRiskLabel">25%</strong>
          </div>
        </div>
        <div class="contagion-grid" id="contagionGrid"></div>
        <div class="stats-grid" id="contagionStats"></div>
      </div>
    `
  });

  const gridEl = document.getElementById("contagionGrid");
  const statsEl = document.getElementById("contagionStats");
  const toggleBtn = document.getElementById("contagionToggle");
  const riskInput = document.getElementById("contagionRisk");
  const riskLabel = document.getElementById("contagionRiskLabel");

  function step() {
    const next = [...grid];
    for (let i = 0; i < grid.length; i++) {
      if (grid[i] === 2) {
        const neighbors = [i - 1, i + 1, i - 5, i + 5].filter(n => n >= 0 && n < grid.length);
        neighbors.forEach(n => {
          if (grid[n] === 0 && Math.random() < risk) next[n] = 1;
        });
      }
    }
    grid = next.map(v => v === 1 ? 2 : v);
    update();
  }

  function update() {
    const infected = grid.filter(x => x === 2).length;
    gridEl.innerHTML = grid.map(cell => `<div class="cell ${cell === 2 ? "infected" : "healthy"}"></div>`).join("");
    statsEl.innerHTML = [
      statCard("Personas contagiadas", `${infected}/${size}`),
      statCard("Idea clave", "Más contacto, más propagación")
    ].join("");
  }

  toggleBtn.onclick = () => {
    running = !running;
    toggleBtn.textContent = running ? "Pausar" : "Iniciar";
    if (running) timer = setInterval(step, 600);
    else clearInterval(timer);
  };

  document.getElementById("contagionReset").onclick = () => {
    clearInterval(timer);
    timer = null;
    running = false;
    toggleBtn.textContent = "Iniciar";
    grid = Array.from({ length: size }, (_, i) => (i === 12 ? 2 : 0));
    update();
  };

  riskInput.oninput = e => {
    risk = parseFloat(e.target.value);
    riskLabel.textContent = `${Math.round(risk * 100)}%`;
  };

  update();
  return () => clearInterval(timer);
}

function renderRare() {
  let attempts = 0;
  let wins = 0;
  const chance = 0.05;
  let timers = [];
  let recent = Array(10).fill(false);

  app.innerHTML = frame({
    title: "¿Más intentos = éxito seguro?",
    subtitle: "Un botón tentador para mostrar que una baja probabilidad sigue siendo baja, aunque lo intentes muchas veces.",
    myth: "Si lo intento muchas veces, seguro lo logro.",
    lesson: "Más intentos aumentan la posibilidad acumulada, pero no existe garantía de éxito individual.",
    main: `
      <div class="panel">
        <div class="controls">
          <button class="btn secondary" id="rareOnce">Intentar</button>
          <button class="btn primary" id="rareMany">Intentar 20 veces</button>
          <button class="btn outline" id="rareReset">Reiniciar</button>
        </div>
        <div class="stats-grid" id="rareStats"></div>
        <div class="panel">
          <div class="progress-bar"><div id="rareBar"></div></div>
          <div class="attempt-stage" id="attemptStage" style="margin-top:14px;"></div>
          <p>Aunque hagas muchos intentos, puedes pasar un buen rato sin ganar.</p>
        </div>
      </div>
    `
  });

  const statsEl = document.getElementById("rareStats");
  const bar = document.getElementById("rareBar");
  const stage = document.getElementById("attemptStage");

  function tryOnce() {
    attempts++;
    const hit = Math.random() < chance;
    if (hit) wins++;
    recent.unshift(hit);
    recent = recent.slice(0, 10);
    update();
  }

  function update() {
    statsEl.innerHTML = [
      statCard("Intentos", attempts),
      statCard("Éxitos", wins),
      statCard("Probabilidad por intento", "5%")
    ].join("");

    const width = Math.min((wins / Math.max(attempts || 1, 1)) * 100 * 4, 100);
    bar.style.width = `${width}%`;
    stage.innerHTML = recent.map(hit => `<div class="orb ${hit ? "hit" : ""}"></div>`).join("");
  }

  document.getElementById("rareOnce").onclick = tryOnce;

  document.getElementById("rareMany").onclick = () => {
    timers.forEach(clearTimeout);
    timers = [];
    for (let i = 0; i < 20; i++) timers.push(setTimeout(tryOnce, i * 95));
  };

  document.getElementById("rareReset").onclick = () => {
    attempts = 0;
    wins = 0;
    recent = Array(10).fill(false);
    timers.forEach(clearTimeout);
    timers = [];
    update();
  };

  update();
  return () => timers.forEach(clearTimeout);
}

function renderLoot() {
  let items = [];
  let timers = [];

  app.innerHTML = frame({
    title: "Loot boxes",
    subtitle: "Abrir cajas se siente emocionante, pero las rarezas altas pueden tardar muchísimo en aparecer.",
    myth: "Si abro suficientes cajas, ya casi me toca el legendario.",
    lesson: "Cada caja vuelve a empezar. Haber fallado muchas veces no obliga a que el siguiente intento sea especial.",
    main: `
      <div class="panel">
        <div class="controls">
          <button class="btn warn" id="lootOne">Abrir caja</button>
          <button class="btn primary" id="lootMany">Abrir 15</button>
          <button class="btn outline" id="lootReset">Vaciar inventario</button>
        </div>
        <div class="stats-grid" id="lootStats"></div>
        <div class="loot-grid" id="lootGrid"></div>
      </div>
    `
  });

  const statsEl = document.getElementById("lootStats");
  const gridEl = document.getElementById("lootGrid");

  function openOne() {
    const r = Math.random();
    const item = r < 0.01 ? "Legendario" : r < 0.08 ? "Épico" : r < 0.28 ? "Raro" : "Común";
    items.unshift(item);
    items = items.slice(0, 40);
    update();
  }

  function update() {
    const counts = {
      Común: items.filter(x => x === "Común").length,
      Raro: items.filter(x => x === "Raro").length,
      Épico: items.filter(x => x === "Épico").length,
      Legendario: items.filter(x => x === "Legendario").length
    };

    statsEl.innerHTML = Object.entries(counts).map(([key, val]) => statCard(key, val)).join("");
    gridEl.innerHTML = items.length
      ? items.map(item => {
          const css = item === "Legendario" ? "legendary" : item === "Épico" ? "epic" : item === "Raro" ? "rare" : "common";
          return `<div class="loot-item ${css}">${item}</div>`;
        }).join("")
      : `<span style="color:#cbd5e1;">Aquí aparecerán los premios obtenidos.</span>`;
  }

  document.getElementById("lootOne").onclick = openOne;

  document.getElementById("lootMany").onclick = () => {
    timers.forEach(clearTimeout);
    timers = [];
    for (let i = 0; i < 15; i++) timers.push(setTimeout(openOne, i * 110));
  };

  document.getElementById("lootReset").onclick = () => {
    items = [];
    timers.forEach(clearTimeout);
    timers = [];
    update();
  };

  update();
  return () => timers.forEach(clearTimeout);
}

function renderNumbers() {
  let nums = [];
  let timers = [];

  app.innerHTML = frame({
    title: "Los números no tienen memoria",
    subtitle: "Un panel para intentar adivinar el siguiente número, aunque el sistema sea completamente aleatorio.",
    myth: "Después de cierta secuencia, seguro ya viene un número específico.",
    lesson: "La aleatoriedad puede formar rachas y aparentes patrones sin que exista una regla escondida.",
    main: `
      <div class="panel">
        <div class="controls">
          <button class="btn primary" id="numOne">Generar número</button>
          <button class="btn secondary" id="numMany">Generar 25</button>
          <button class="btn outline" id="numReset">Reiniciar</button>
        </div>
        <div class="number-history" id="numHistory"></div>
        <div class="number-bars" id="numBars"></div>
      </div>
    `
  });

  const historyEl = document.getElementById("numHistory");
  const barsEl = document.getElementById("numBars");

  function roll() {
    nums.unshift(Math.floor(Math.random() * 10) + 1);
    nums = nums.slice(0, 40);
    update();
  }

  function update() {
    const counts = Array.from({ length: 10 }, (_, i) => nums.filter(n => n === i + 1).length);
    historyEl.innerHTML = nums.length
      ? nums.map(n => `<div class="num">${n}</div>`).join("")
      : `<span style="color:#cbd5e1;">Los números generados aparecerán aquí.</span>`;
    barsEl.innerHTML = counts.map((count, i) => `
      <div class="number-bar">
        <div>Número ${i + 1}</div>
        <div class="track"><div class="fill" style="width:${Math.min(count * 12, 100)}%"></div></div>
        <strong>${count}</strong>
      </div>
    `).join("");
  }

  document.getElementById("numOne").onclick = roll;

  document.getElementById("numMany").onclick = () => {
    timers.forEach(clearTimeout);
    timers = [];
    for (let i = 0; i < 25; i++) timers.push(setTimeout(roll, i * 85));
  };

  document.getElementById("numReset").onclick = () => {
    nums = [];
    timers.forEach(clearTimeout);
    timers = [];
    update();
  };

  update();
  return () => timers.forEach(clearTimeout);
}

function renderSlots() {
  const symbols = ["🍒", "⭐", "7", "💎"];
  let reels = ["🍒", "⭐", "7"];
  let message = "Gira para ver cómo el casi acierto engaña al cerebro.";

  app.innerHTML = frame({
    title: "La ilusión del casi acierto",
    subtitle: "Un tragamonedas visual donde los ‘casi, casi’ hacen sentir al usuario que está a punto de ganar.",
    myth: "Si quedé cerca de ganar, entonces ya estoy más cerca del premio en el siguiente giro.",
    lesson: "Un casi acierto es psicológicamente poderoso, pero no modifica la probabilidad real del próximo intento.",
    main: `
      <div class="panel">
        <div class="slot-machine">
          <div class="slot-reels" id="slotReels"></div>
          <div class="controls" style="justify-content:center; margin-top:16px;">
            <button class="btn warn" id="slotSpin">Girar</button>
          </div>
        </div>
        <div class="stats-grid" id="slotStats"></div>
      </div>
    `
  });

  const reelsEl = document.getElementById("slotReels");
  const statsEl = document.getElementById("slotStats");

  function update(spinAnim) {
    reelsEl.innerHTML = reels.map(r => `<div class="reel ${spinAnim ? "spin" : ""}">${r}</div>`).join("");
    statsEl.innerHTML = [
      statCard("Lectura del resultado", message),
      statCard("Idea clave", "Casi ganar no cambia el siguiente giro")
    ].join("");
  }

  document.getElementById("slotSpin").onclick = () => {
    const nearMiss = Math.random() < 0.55;

    if (nearMiss) {
      const base = symbols[Math.floor(Math.random() * symbols.length)];
      const otherPool = symbols.filter(s => s !== base);
      const other = otherPool[Math.floor(Math.random() * otherPool.length)];
      reels = [base, base, other];
      message = "¡Quedaste cerquísima! Pero eso no mejora el siguiente giro.";
    } else {
      reels = Array.from({ length: 3 }, () => symbols[Math.floor(Math.random() * symbols.length)]);
      message = reels[0] === reels[1] && reels[1] === reels[2]
        ? "Ganaste esta vez."
        : "No hubo premio. La emoción sigue empujando a jugar.";
    }

    update(true);
  };

  update(false);
  return () => {};
}

renderMenu();
renderProject();
