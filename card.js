(() => {
  "use strict";

  const openButton = document.getElementById("openCard");
  if (window.__bouquetReady) {
    openButton.hidden = false;
  } else {
    document.addEventListener("bouquet:ready", () => {
      openButton.hidden = false;
    });
  }

  const style = document.createElement("style");
  style.textContent = `
    #cardOverlay {
      display: none;
      position: fixed;
      inset: 0;
      z-index: 100;
      background: rgba(15, 42, 70, 0.50);
      backdrop-filter: blur(4px);
      -webkit-backdrop-filter: blur(4px);
      align-items: center;
      justify-content: center;
    }
    #cardOverlay.is-open {
      display: flex;
      animation: overlay-in 0.4s ease both;
    }
    #cardOverlay.is-closing {
      animation: overlay-out 0.38s ease both;
    }
    @keyframes overlay-in {
      from { opacity: 0; } to { opacity: 1; }
    }
    @keyframes overlay-out {
      from { opacity: 1; } to { opacity: 0; }
    }

    #envCloseBtn {
      position: absolute;
      top: max(18px, env(safe-area-inset-top));
      right: max(18px, env(safe-area-inset-right));
      z-index: 105;
      width: 40px;
      height: 40px;
      border-radius: 50%;
      border: 1px solid rgba(255, 255, 255, 0.35);
      background: rgba(255, 255, 255, 0.18);
      color: #ffffff;
      font-size: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      backdrop-filter: blur(4px);
      transition: background 0.2s ease, transform 0.2s ease;
      line-height: 1;
      padding: 0;
    }
    #envCloseBtn:hover {
      background: rgba(255, 255, 255, 0.35);
      transform: scale(1.08);
    }
    #envCloseBtn:active {
      transform: scale(0.95);
    }

    #envScene {
      position: relative;
      width: clamp(300px, 75vw, 420px);
      height: clamp(345px, 72vh, 540px);
      overflow: visible;
      transform-origin: center center;
    }
      @media (max-width: 480px) {
  #envScene {
    height: clamp(260px, 55vh, 380px); 
  }
}
    #envScene:not(.is-open) {
      cursor: pointer;
    }
    #envScene:not(.is-open) #envSeal {
      cursor: pointer;
      animation: seal-pulse 2s infinite ease-in-out;
    }
    @keyframes seal-pulse {
      0%, 100% {
        transform: translate(-50%, 50%) scale(1);
        box-shadow: 0 3px 12px rgba(20,60,100,.4), 0 0 0 0 rgba(91,163,212,0.4);
      }
      50% {
        transform: translate(-50%, 50%) scale(1.08);
        box-shadow: 0 5px 18px rgba(20,60,100,.5), 0 0 0 8px rgba(91,163,212,0);
      }
    }

    /* Animation thiệp nhỏ hiện to dần ra */
    #envScene.is-zooming {
      animation: env-zoom-in 0.55s cubic-bezier(0.16, 1, 0.3, 1) both;
    }
    #envScene.is-closing {
      animation: env-zoom-out 0.38s cubic-bezier(0.4, 0, 0.2, 1) both;
    }

    @keyframes env-zoom-in {
      0% {
        transform: translate(var(--start-x, 0px), var(--start-y, 0px)) scale(var(--start-scale, 0.28)) rotate(-7deg);
        opacity: 0.3;
      }
      35% {
        opacity: 1;
      }
      100% {
        transform: translate(0, 0) scale(1) rotate(0deg);
        opacity: 1;
      }
    }

    @keyframes env-zoom-out {
      0% {
        transform: translate(0, 0) scale(1) rotate(0deg);
        opacity: 1;
      }
      100% {
        transform: translate(var(--start-x, 0px), var(--start-y, 0px)) scale(var(--start-scale, 0.28)) rotate(-7deg);
        opacity: 0;
      }
    }

    /* SVG phong bì — gồm 3 lớp: Lưng (z:1), Túi trước (z:3), Nắp động (z:4 khi đóng, z:1 khi mở) */
    #envBackSvg,
    #envFrontSvg,
    #envFlapSvg {
      position: absolute;
      bottom: 0; left: 0;
      width: 100%; height: 55%;
      overflow: visible;
    }

    /* 1. Lưng phong bì: nằm sau cùng */
    #envBackSvg {
      z-index: 1;
      filter:
        drop-shadow(0 20px 48px rgba(20,60,100,.22))
        drop-shadow(0 4px 12px rgba(20,60,100,.10));
    }

    /* 2. Nắp phong bì:
          - Khi đóng: z-index 4, nắp gập xuống phủ lên túi trước và che kín tấm thiệp
          - Khi mở: lật ngược ra sau (rotateX(-180deg)), hạ xuống z-index 1 (sau thiệp)
    */
    #envFlapSvg {
      z-index: 4;
      pointer-events: none;
    }
    #envSvgFlap {
      transform-origin: 50% 0%;
      transform-box: fill-box;
      transition: transform .8s cubic-bezier(.4,0,.2,1);
    }
    /* Nắp phong bì mở ra sau khi có .is-open */
    #envScene.is-open #envSvgFlap {
      transform: rotateX(-180deg);
    }
    #envScene.is-open #envFlapSvg {
      z-index: 1;
      transition: z-index 0s .35s;
    }

    /* 3. Tấm thiệp: nằm giữa Lưng (z:1) và Túi trước (z:3) */
    #envCard {
      position: absolute;
      bottom: 0;
      left: 50%;
      transform: translateX(-50%) translateY(0%);
      width: 90%;
      z-index: 2;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 6px 20px rgba(20,60,100,.14);
      opacity: 0;
      cursor: pointer;
      pointer-events: auto;
      transition: box-shadow .25s ease;
    }
    #envCard:hover {
      box-shadow: 0 10px 28px rgba(20,60,100,.22);
    }
    #envCard img {
      display: block;
      width: 100%;
      height: auto;
      object-fit: cover;
      object-position: center top;
    }
    #envCard img[data-error] { display: none; }

    /* Khi mở phong bì (ẢNH 2): thiệp trồi lên phân nửa (50%), còn phân nửa vẫn nằm trong túi phong bì */
    #envScene.is-open #envCard {
      opacity: 1;
      animation: card-rise-half 0.85s 0.25s cubic-bezier(.16,1,.3,1) both;
    }
    @keyframes card-rise-half {
      0% {
        transform: translateX(-50%) translateY(0%);
        opacity: 0;
      }
      20% {
        opacity: 1;
      }
      100% {
        transform: translateX(-50%) translateY(-50%);
        opacity: 1;
      }
    }

    /* 4. Túi trước phong bì: z-index 3 (che phân nửa dưới của tấm thiệp) */
    #envFrontSvg {
      z-index: 3;
      pointer-events: none;
      filter: drop-shadow(0 -3px 8px rgba(20,60,100,.08));
    }

    /* 5. Con dấu trái tim: z-index 5 (nằm trên đỉnh nắp khi đóng) */
    #envSeal {
      position: absolute;
      left: 50%;
      bottom: calc(55% * 30 / 70);
      transform: translate(-50%, 50%);
      z-index: 5;
      width: 40px; height: 40px;
      border-radius: 50%;
      background: radial-gradient(circle at 38% 35%, #5ba3d4, #1e5f94 72%);
      box-shadow: 0 3px 12px rgba(20,60,100,.4), inset 0 1px rgba(180,220,255,.3);
      display: grid;
      place-items: center;
      color: #e8f4ff;
      font-size: 18px;
      transition: opacity .25s ease, transform .25s ease;
      pointer-events: none;
    }
    #envScene.is-open #envSeal {
      opacity: 0;
      transform: translate(-50%, 50%) scale(.3);
    }

    /* Cánh hoa */
    .env-petal {
      position: fixed; pointer-events: none;
      font-size: 20px; opacity: 0; z-index: 200;
    }
    @keyframes petal-burst {
      0%   { opacity: 1; transform: translate(0,0) rotate(0deg) scale(1); }
      100% { opacity: 0; transform: translate(var(--dx),var(--dy)) rotate(var(--dr)) scale(.4); }
    }

    @media (prefers-reduced-motion: reduce) {
      #envScene.is-zooming { animation: none; transform: none; opacity: 1; }
      #envScene.is-closing { animation: none; }
      #envScene.is-open #envSvgFlap { transform: rotateX(-180deg); transition: none; }
      #envScene.is-open #envSeal    { opacity: 0; transition: none; }
      #envScene.is-open #envCard    {
        animation: none;
        transform: translateX(-50%) translateY(-50%);
        opacity: 1;
      }
    }

    #cardOverlay.has-card-zoomed {
      background: rgba(8, 24, 45, 0.75);
    }
    #cardOverlay.has-card-zoomed #envBackSvg,
    #cardOverlay.has-card-zoomed #envFrontSvg,
    #cardOverlay.has-card-zoomed #envFlapSvg,
    #cardOverlay.has-card-zoomed #envCloseBtn {
      opacity: 0.22;
      transition: opacity 0.3s ease;
    }

    #envCard.is-zoomed {
      position: fixed !important;
      top: 50% !important;
      left: 50% !important;
      bottom: auto !important;
      width: min(92vw, 129vh, 768px) !important;
      transform: translate(-50%, -50%) !important;
      z-index: 120 !important;
      clip-path: inset(0% 0 0 0 round 10px) !important;
      opacity: 1 !important;
      box-shadow: 0 25px 65px rgba(5, 18, 35, 0.5) !important;
      animation: card-zoom-in 0.45s cubic-bezier(.16,1,.3,1) both !important;
    }

    @keyframes card-zoom-in {
      0%   { transform: translate(-50%, -50%) scale(0.4); opacity: 0.6; }
      100% { transform: translate(-50%, -50%) scale(1);   opacity: 1; }
    }
  `;
  document.head.appendChild(style);

  const overlay = document.createElement("div");
  overlay.id = "cardOverlay";
  overlay.setAttribute("role", "dialog");
  overlay.setAttribute("aria-modal", "true");
  overlay.setAttribute("aria-label", "Thiệp 20/10");

  overlay.innerHTML = `
    <button id="envCloseBtn" type="button" aria-label="Đóng thiệp">✕</button>
    <div id="envScene">

      <!-- 1. Lưng phong bì (bên trong túi) — z-index 1 -->
      <svg id="envBackSvg" viewBox="0 0 100 70" preserveAspectRatio="none" aria-hidden="true">
        <defs>
          <linearGradient id="backInnerGrad" x1="0%" y1="0%" x2="60%" y2="100%">
            <stop offset="0%"   stop-color="#d9ebf7"/>
            <stop offset="100%" stop-color="#b0d4eb"/>
          </linearGradient>
        </defs>
        <rect x="0" y="0" width="100" height="70" rx="3" ry="3"
              fill="url(#backInnerGrad)" stroke="#9dbbd0" stroke-width=".6"/>
      </svg>

      <!-- 2. Nắp phong bì — z-index 4 khi đóng, lật ra sau thiệp (z-index 1) khi mở -->
      <svg id="envFlapSvg" viewBox="0 0 100 70" preserveAspectRatio="none" aria-hidden="true">
        <defs>
          <linearGradient id="flapGrad" x1="0%" y1="0%" x2="40%" y2="100%">
            <stop offset="0%"   stop-color="#daedf8"/>
            <stop offset="100%" stop-color="#a8cfe4"/>
          </linearGradient>
        </defs>
        <g id="envSvgFlap">
          <polygon points="0,0 100,0 50,40"
                   fill="url(#flapGrad)" stroke="#9dbbd0" stroke-width=".5"/>
          <polygon points="0,0 100,0 50,40"
                   fill="white" opacity=".10"/>
        </g>
      </svg>

      <!-- 3. Tấm thiệp — z-index 2 (kẹp giữa lưng z:1 và túi trước z:3) -->
      <div id="envCard">
        <img src="./assets/tune.png" alt="Ảnh kỷ niệm" decoding="async"
             onerror="this.setAttribute('data-error','1')"/>
      </div>

      <!-- 4. Túi trước phong bì — z-index 3 (che phân nửa dưới tấm thiệp) -->
      <svg id="envFrontSvg" viewBox="0 0 100 70" preserveAspectRatio="none" aria-hidden="true">
        <defs>
          <linearGradient id="frontBodyGrad" x1="0%" y1="0%" x2="60%" y2="100%">
            <stop offset="0%"   stop-color="#f5fafd"/>
            <stop offset="100%" stop-color="#bddbf0"/>
          </linearGradient>
          <linearGradient id="frontFoldL" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#ffffff" stop-opacity="0.35"/>
            <stop offset="100%" stop-color="#7eaecf" stop-opacity="0.2"/>
          </linearGradient>
          <linearGradient id="frontFoldR" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#ffffff" stop-opacity="0.35"/>
            <stop offset="100%" stop-color="#7eaecf" stop-opacity="0.2"/>
          </linearGradient>
          <linearGradient id="frontFoldB" x1="50%" y1="100%" x2="50%" y2="0%">
            <stop offset="0%" stop-color="#8db8d6" stop-opacity="0.3"/>
            <stop offset="100%" stop-color="#ffffff" stop-opacity="0.1"/>
          </linearGradient>
        </defs>

        <!-- Thân túi trước với rãnh chữ V: mở hé để thấy thiệp trồi lên từ trong túi -->
        <path d="M 0,0 L 50,28 L 100,0 L 100,68 Q 100,70 97,70 L 3,70 Q 0,70 0,68 Z"
              fill="url(#frontBodyGrad)" stroke="#9dbbd0" stroke-width=".6"/>

        <!-- Nếp gấp chéo hai bên và đáy -->
        <polygon points="0,0 50,28 0,70" fill="url(#frontFoldL)" stroke="#9dbbd0" stroke-width=".3"/>
        <polygon points="100,0 50,28 100,70" fill="url(#frontFoldR)" stroke="#9dbbd0" stroke-width=".3"/>
        <polygon points="0,70 100,70 50,28" fill="url(#frontFoldB)" stroke="#9dbbd0" stroke-width=".3"/>
      </svg>

      <!-- 5. Con dấu trái tim — z-index 5 (trên chóp nắp khi đóng) -->
      <div id="envSeal" aria-hidden="true">♡</div>

    </div>
  `;
  document.body.appendChild(overlay);

  const scene = document.getElementById("envScene");
  const closeBtn = document.getElementById("envCloseBtn");
  const envCard = document.getElementById("envCard");

  function zoomCard() {
    envCard.classList.add("is-zoomed");
    overlay.classList.add("has-card-zoomed");
  }

  function unzoomCard() {
    envCard.classList.remove("is-zoomed");
    overlay.classList.remove("has-card-zoomed");
  }

  envCard.addEventListener("click", (e) => {
    e.stopPropagation();
    if (!envCard.classList.contains("is-zoomed")) {
      zoomCard();
    } else {
      unzoomCard();
    }
  });

  const PETALS = ["🌸", "🌺", "✿", "❀", "🌷"];

  function burstPetals() {
    const r = scene.getBoundingClientRect();
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height * 0.38;
    for (let i = 0; i < 20; i++) {
      const el = document.createElement("span");
      el.className = "env-petal";
      el.textContent = PETALS[i % PETALS.length];
      const angle = Math.random() * Math.PI * 2;
      const dist = 80 + Math.random() * 150;
      el.style.setProperty("--dx", Math.cos(angle) * dist + "px");
      el.style.setProperty("--dy", Math.sin(angle) * dist + 60 + "px");
      el.style.setProperty("--dr", Math.random() * 360 - 180 + "deg");
      el.style.left = cx + "px";
      el.style.top = cy + "px";
      el.style.animation = `petal-burst ${0.6 + Math.random() * 0.9}s ${i * 35}ms ease-out both`;
      document.body.appendChild(el);
      el.addEventListener("animationend", () => el.remove());
    }
  }

  function openEnvelope() {
    if (
      scene.classList.contains("is-open") ||
      scene.classList.contains("is-closing")
    )
      return;
    scene.classList.add("is-open");
    burstPetals();
  }

  function openCard() {
    if (overlay.classList.contains("is-open")) return;

    // Tính toán tọa độ và kích thước từ vị trí thiệp nhỏ
    const envElem = openButton.querySelector(".envelope") || openButton;
    const rect = envElem.getBoundingClientRect();
    const btnCenterX = rect.left + rect.width / 2;
    const btnCenterY = rect.top + rect.height / 2;

    const vpCenterX = window.innerWidth / 2;
    const vpCenterY = window.innerHeight / 2;

    const dx = btnCenterX - vpCenterX;
    const dy = btnCenterY - vpCenterY;

    // Chiều rộng thiệp nhỏ là ~106px, ước lượng tỉ lệ ban đầu
    const targetWidth = Math.min(Math.max(window.innerWidth * 0.75, 300), 420);
    const startScale = Math.min(Math.max(rect.width / targetWidth, 0.2), 0.35);

    scene.style.setProperty("--start-x", `${Math.round(dx)}px`);
    scene.style.setProperty("--start-y", `${Math.round(dy)}px`);
    scene.style.setProperty("--start-scale", `${startScale.toFixed(3)}`);

    // Ẩn nhẹ nút thiệp nhỏ để hiệu ứng phóng to mượt mà
    openButton.style.transition = "opacity 0.25s ease";
    openButton.style.opacity = "0";

    // Kích hoạt overlay và animation hiện to dần ra ở trạng thái đóng (ẢNH 1)
    overlay.classList.remove("is-closing", "has-card-zoomed");
    overlay.classList.add("is-open");
    scene.classList.remove("is-open", "is-closing");
    scene.classList.add("is-zooming");
    document.body.style.overflow = "hidden";
  }

  function closeCard() {
    if (envCard.classList.contains("is-zoomed")) {
      unzoomCard();
    }
    scene.classList.remove("is-open");
    scene.classList.add("is-closing");
    overlay.classList.add("is-closing");

    setTimeout(() => {
      overlay.classList.remove("is-open", "is-closing", "has-card-zoomed");
      scene.classList.remove("is-closing", "is-zooming", "is-open");
      openButton.style.opacity = "";
      document.body.style.overflow = "";
      openButton.focus({ preventScroll: true });
    }, 380);
  }

  // Thứ tự click theo đúng 3 ảnh:
  // - Khi ở ẢNH 1 (phong bì đóng): ấn vào phong bì -> mở nắp và trồi thiệp lên phân nửa như ẢNH 2
  scene.addEventListener("click", (e) => {
    if (!scene.classList.contains("is-open")) {
      e.stopPropagation();
      openEnvelope();
    }
  });

  // - Khi ở ẢNH 2 (thiệp đang ở phân nửa bao thư): ấn vào thiệp -> phóng to toàn bộ như ẢNH 3
  // - Khi ở ẢNH 3 (thiệp đang phóng to): ấn vào thiệp -> thu nhỏ về ẢNH 2
  envCard.addEventListener("click", (e) => {
    e.stopPropagation();
    if (!scene.classList.contains("is-open")) {
      openEnvelope();
      return;
    }
    if (!envCard.classList.contains("is-zoomed")) {
      zoomCard();
    } else {
      unzoomCard();
    }
  });

  openButton.addEventListener("click", openCard);
  if (closeBtn) closeBtn.addEventListener("click", closeCard);

  overlay.addEventListener("click", (e) => {
    if (envCard.classList.contains("is-zoomed")) {
      unzoomCard();
      return;
    }
    if (e.target === overlay) closeCard();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      if (envCard.classList.contains("is-zoomed")) {
        e.preventDefault();
        unzoomCard();
      } else if (overlay.classList.contains("is-open")) {
        e.preventDefault();
        closeCard();
      }
    }
  });

  document.addEventListener("bouquet:rose", () => {});
  const replayBtn = document.getElementById("replayBloom");
  if (replayBtn) {
    replayBtn.addEventListener("click", () => {
      document.dispatchEvent(new Event("bouquet:replay"));
      const wish = document.getElementById("roseWish");
      if (wish) wish.textContent = "";
    });
  }
})();
