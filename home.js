{{script}}
(function () {
  function swapSearchAndBurger() {
    const nav = document.querySelector("nav.nav-header");
    if (!nav) return false;

    // Evitar repetir el swap si el header se re-renderiza
    if (nav.dataset.swapDone === "1") return true;

    const searchIcon = nav.querySelector("a.search-icon");
    const burgerButton = nav.querySelector("button.button-mobile-menu");

    if (!searchIcon || !burgerButton) return false;

    // Wrapper de la hamburguesa
    const burgerWrapper =
      burgerButton.closest(".d-block.d-lg-none") || burgerButton.closest("div");

    if (!burgerWrapper) return false;

    // Guardar referencias
    const searchParent = searchIcon.parentNode;
    const burgerParent = burgerWrapper.parentNode;
    const searchNext = searchIcon.nextSibling;
    const burgerNext = burgerWrapper.nextSibling;

    // Intercambiar
    burgerParent.insertBefore(searchIcon, burgerNext);
    searchParent.insertBefore(burgerWrapper, searchNext);

    nav.dataset.swapDone = "1";
    return true;
  }

  // Intento inmediato
  swapSearchAndBurger();

  // Reintentos (por render tardío)
  let tries = 0;
  const timer = setInterval(() => {
    tries += 1;
    if (swapSearchAndBurger() || tries >= 40) clearInterval(timer);
  }, 250);

  // Observer por si TPOP re-renderiza el header
  const obs = new MutationObserver(() => {
    swapSearchAndBurger();
  });

  obs.observe(document.documentElement, { childList: true, subtree: true });
})();
{{/script}}

{{script}}
(function () {
  const bd = document.querySelector('.backdrop-menu');
  const menu = document.querySelector('.mobile-menu');
  if (!bd || !menu) return;

  const DURATION = 300; // debe coincidir con CSS (0.3s)

  function backdropIsOpen() {
    const cs = getComputedStyle(bd);
    if (cs.display === 'none' || cs.visibility === 'hidden') return false;
    if (cs.pointerEvents === 'none') return false;

    const r = bd.getBoundingClientRect();
    return r.width > 0 && r.height > 0;
  }

  function openMenu() {
    // Asegurar que el menú puede animarse
    menu.style.display = 'block';
    menu.style.visibility = 'visible';
    menu.style.pointerEvents = 'auto';

    // Estado inicial (cerrado)
    menu.style.transition = 'none';
    menu.style.transform = 'translateX(-100%)';

    // Forzar reflow
    menu.offsetHeight;

    // Estado final (abierto) → anima
    menu.style.transition = 'transform 0.3s ease';
    menu.style.transform = 'translateX(0)';
  }

  function closeMenu() {
    menu.style.transition = 'transform 0.3s ease';
    menu.style.transform = 'translateX(-100%)';

    // Limpieza tras la animación
    setTimeout(() => {
      menu.style.pointerEvents = 'none';
      menu.style.visibility = 'hidden';
    }, DURATION);
  }

  let isOpen = false;

  function sync() {
    const shouldBeOpen = backdropIsOpen();

    if (shouldBeOpen && !isOpen) {
      openMenu();
      isOpen = true;
    }

    if (!shouldBeOpen && isOpen) {
      closeMenu();
      isOpen = false;
    }
  }

  // Estado inicial
  sync();

  // Observar cambios del theme
  const obs = new MutationObserver(sync);
  obs.observe(bd, { attributes: true, attributeFilter: ['class', 'style'] });

  // Fallback por clicks
  document.addEventListener('click', () => setTimeout(sync, 0), true);
})();
{{/script}}


{{script}}
(function () {

  const header = document.querySelector('nav.nav-header');
  if (!header) return;

  const SCROLL_THRESHOLD = 20;
  let lastState = null;

  function updateBodyPadding() {
    const h = header.getBoundingClientRect().height;
    document.body.style.paddingTop = h + 'px';
  }

  function onScroll() {
    const scrolled = window.scrollY > SCROLL_THRESHOLD;

    // Solo actuar si cambia el estado
    if (scrolled !== lastState) {
      document.body.classList.toggle('header-scrolled', scrolled);
      updateBodyPadding();
      lastState = scrolled;
    }
  }

  // Estado inicial
  updateBodyPadding();
  onScroll();

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', updateBodyPadding);

})();
{{/script}}

{{script}}
(function () {

  var mainPicture = document.querySelector('#mainPicture');
  if (!mainPicture) return;

  var container = mainPicture.querySelector('.img-container.main-image');
  if (!container) return;

  var baseImg = container.querySelector('img.img-product');
  if (!baseImg) return;

  var thumbs = document.querySelectorAll('.sub-images-container img.img-product');
  if (!thumbs) return;

  /* ===== Si solo hay 1 imagen → NO slider ===== */
  if (thumbs.length <= 1) {
    mainPicture.classList.remove('slider-active');
    return;
  }

  /* ===== Activar slider ===== */
  mainPicture.classList.add('slider-active');

  /* ===== Imágenes ===== */
  var images = [];
  for (var i = 0; i < thumbs.length; i++) {
    images.push(thumbs[i].src);
  }

  var index = 0;
  for (i = 0; i < images.length; i++) {
    if (images[i] === baseImg.src) {
      index = i;
      break;
    }
  }

  /* Fijar altura */
  var h = container.getBoundingClientRect().height;
  container.style.height = h + 'px';

  var OVERLAP = 10;

  function getW() {
    return container.getBoundingClientRect().width;
  }

  function t3d(x) {
    return 'translate3d(' + x + 'px,0,0)';
  }

  /* ===== Imagen activa ===== */
  var activeImg = document.createElement('img');
  activeImg.className = 'slider-img';
  activeImg.src = images[index];
  activeImg.style.transform = t3d(0);
  container.appendChild(activeImg);

  var ghostImg = null;
  var animating = false;

  /* ===== DOTS ===== */
  var dotsWrap = document.createElement('div');
  dotsWrap.className = 'product-image-dots';

  var dots = [];
  for (i = 0; i < images.length; i++) {
    (function (iDot) {
      var b = document.createElement('button');
      if (iDot === index) b.className = 'active';

      b.onclick = function () {
        if (iDot === index) return;
        slideTo(iDot, iDot > index ? 1 : -1);
      };

      dotsWrap.appendChild(b);
      dots.push(b);
    })(i);
  }

  /* Colocar dots justo bajo la imagen */
  container.insertAdjacentElement('afterend', dotsWrap);

  function updateDots() {
    for (var j = 0; j < dots.length; j++) {
      dots[j].className = (j === index) ? 'active' : '';
    }
  }

  /* ===== Core slider ===== */
  function makeGhost(newIndex, dir) {
    var W = getW();
    ghostImg = document.createElement('img');
    ghostImg.className = 'slider-img';
    ghostImg.src = images[newIndex];
    ghostImg.style.transform = t3d(dir * (W - OVERLAP));
    container.appendChild(ghostImg);
  }

  function commit(newIndex) {
    if (activeImg && activeImg.parentNode) {
      activeImg.parentNode.removeChild(activeImg);
    }
    activeImg = ghostImg;
    ghostImg = null;
    index = newIndex;
    activeImg.style.transition = '';
    activeImg.style.transform = t3d(0);
    animating = false;
    updateDots();
  }

  function jumpTo(newIndex) {
    if (newIndex < 0 || newIndex >= images.length) return;
    if (activeImg && activeImg.parentNode) {
      activeImg.parentNode.removeChild(activeImg);
    }
    activeImg = document.createElement('img');
    activeImg.className = 'slider-img';
    activeImg.src = images[newIndex];
    activeImg.style.transform = t3d(0);
    container.appendChild(activeImg);
    index = newIndex;
    updateDots();
  }

  function slideTo(newIndex, dir) {
    if (animating || newIndex === index) return;
    animating = true;

    var W = getW();
    makeGhost(newIndex, dir);

    activeImg.style.transition = 'none';
    ghostImg.style.transition = 'none';
    activeImg.offsetHeight;

    activeImg.style.transition = 'transform 0.3s ease';
    ghostImg.style.transition  = 'transform 0.3s ease';

    activeImg.style.transform = t3d(-dir * (W - OVERLAP));
    ghostImg.style.transform  = t3d(0);

    setTimeout(function () {
      commit(newIndex);
    }, 300);
  }

  /* ===== Flechas ===== */
  var nav = document.createElement('div');
  nav.className = 'product-image-nav';

  var prev = document.createElement('button');
  prev.className = 'prev';
  prev.type = 'button';

  var next = document.createElement('button');
  next.className = 'next';
  next.type = 'button';

  nav.appendChild(prev);
  nav.appendChild(next);
  mainPicture.style.position = 'relative';
  mainPicture.appendChild(nav);

  prev.onclick = function () {
    slideTo((index - 1 + images.length) % images.length, -1);
  };
  next.onclick = function () {
    slideTo((index + 1) % images.length, 1);
  };

  /* ===== Swipe ===== */
  var startX = 0;
  var deltaX = 0;
  var dragging = false;
  var swipeDir = 0;
  var swipeTarget = -1;

  container.addEventListener('touchstart', function (e) {
    if (animating) return;
    startX = e.touches[0].clientX;
    deltaX = 0;
    dragging = true;
    swipeTarget = -1;
    activeImg.style.transition = 'none';
  });

  container.addEventListener('touchmove', function (e) {
    if (!dragging || animating) return;

    var W = getW();
    deltaX = e.touches[0].clientX - startX;
    var dir = deltaX < 0 ? 1 : -1;

    if (!ghostImg) {
      swipeDir = dir;
      swipeTarget =
        deltaX < 0
          ? (index + 1) % images.length
          : (index - 1 + images.length) % images.length;

      makeGhost(swipeTarget, dir);
      ghostImg.style.transition = 'none';
    }

    activeImg.style.transform = t3d(deltaX);
    ghostImg.style.transform  = t3d(dir * (W - OVERLAP) + deltaX);
  });

  container.addEventListener('touchend', function () {
    if (!dragging) return;
    dragging = false;

    if (!ghostImg) {
      activeImg.style.transition = '';
      activeImg.style.transform = t3d(0);
      return;
    }

    var W = getW();
    var threshold = W * 0.25;

    activeImg.style.transition = 'transform 0.3s ease';
    ghostImg.style.transition  = 'transform 0.3s ease';

    if (Math.abs(deltaX) > threshold) {
      activeImg.style.transform = t3d(-swipeDir * (W - OVERLAP));
      ghostImg.style.transform  = t3d(0);

      setTimeout(function () {
        commit(swipeTarget);
      }, 300);
    } else {
      activeImg.style.transform = t3d(0);
      ghostImg.style.transform  = t3d(swipeDir * (W - OVERLAP));

      setTimeout(function () {
        if (ghostImg && ghostImg.parentNode) {
          ghostImg.parentNode.removeChild(ghostImg);
        }
        ghostImg = null;
        activeImg.style.transition = '';
        activeImg.style.transform = t3d(0);
      }, 300);
    }

    deltaX = 0;
  });

  /* ===== SINCRONIZAR CAMBIO DE COLOR (CLAVE) ===== */
  var observer = new MutationObserver(function () {
    var newSrc = baseImg.src;
    var newIndex = images.indexOf(newSrc);
    if (newIndex !== -1 && newIndex !== index) {
      jumpTo(newIndex);
    }
  });

  observer.observe(baseImg, {
    attributes: true,
    attributeFilter: ['src']
  });

})();
{{/script}}

{{script}}
(function () {

  if (window.innerWidth > 991) return;

  var mainPicture = document.querySelector('#mainPicture');
  if (!mainPicture) return;

  var container = mainPicture.querySelector('.img-container.main-image');
  if (!container) return;

  var thumbs = document.querySelectorAll('.sub-images-container img.img-product');
  if (!thumbs || thumbs.length === 0) return;

  /* ===== Imágenes ===== */
  var images = [];
  for (var i = 0; i < thumbs.length; i++) images.push(thumbs[i].src);

  var index = 0;
  var activeImg = null;
  var ghostImg = null;
  var animating = false;

  var OVERLAP = 10;

  /* ===== Zoom ===== */
  var zoomed = false;
  var ZOOM_SCALE = 2.5;

  function t3d(x, y, s) {
    return 'translate3d(' + x + 'px,' + y + 'px,0) scale(' + s + ')';
  }

  function getW() {
    return overlay.getBoundingClientRect().width;
  }

  function getStageRect() {
    return stage.getBoundingClientRect();
  }

  /* Rectángulo real visible de la imagen (por object-fit: contain) */
  function getDisplayedImageRect() {
    if (!activeImg) return null;

    var nw = activeImg.naturalWidth;
    var nh = activeImg.naturalHeight;
    if (!nw || !nh) return null;

    var r = getStageRect();
    var stageW = r.width;
    var stageH = r.height;

    var scale = Math.min(stageW / nw, stageH / nh);
    var dispW = nw * scale;
    var dispH = nh * scale;

    var left = r.left + (stageW - dispW) / 2;
    var top  = r.top  + (stageH - dispH) / 2;

    return {
      left: left,
      top: top,
      right: left + dispW,
      bottom: top + dispH,
      width: dispW,
      height: dispH
    };
  }

  /* ===== Overlay ===== */
  var overlay = document.createElement('div');
  overlay.className = 'product-fullscreen';

  var backdrop = document.createElement('div');
  backdrop.className = 'product-fullscreen-backdrop';
  overlay.appendChild(backdrop);

  var stage = document.createElement('div');
  stage.className = 'product-fullscreen-stage';
  overlay.appendChild(stage);

  var closeBtn = document.createElement('button');
  closeBtn.className = 'product-fullscreen-close';
  closeBtn.innerHTML = '✕';
  overlay.appendChild(closeBtn);

  document.body.appendChild(overlay);

  function open(startIndex) {
    index = startIndex || 0;
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';

    activeImg = document.createElement('img');
    activeImg.src = images[index];
    activeImg.style.transform = t3d(0, 0, 1);
    stage.appendChild(activeImg);

    zoomed = false;
  }

  function close() {
    overlay.classList.remove('active');
    document.body.style.overflow = '';

    if (activeImg) stage.removeChild(activeImg);
    if (ghostImg) stage.removeChild(ghostImg);

    activeImg = null;
    ghostImg = null;
    animating = false;
    zoomed = false;
  }

  closeBtn.onclick = close;

  /* ===== Core swipe (igual que el slider principal) ===== */
  function makeGhost(newIndex, dir) {
    var W = getW();
    ghostImg = document.createElement('img');
    ghostImg.src = images[newIndex];
    ghostImg.style.transform = t3d(dir * (W - OVERLAP), 0, 1);
    stage.appendChild(ghostImg);
  }

  function commit(newIndex) {
    stage.removeChild(activeImg);
    activeImg = ghostImg;
    ghostImg = null;
    index = newIndex;

    activeImg.style.transition = '';
    activeImg.style.transform = t3d(0, 0, 1);

    animating = false;
    zoomed = false;
  }

  /* ===== Gestos: tap / doble tap / swipe ===== */
  var startX = 0, startY = 0;
  var deltaX = 0, deltaY = 0;
  var dragging = false;
  var swipeDir = 0;
  var swipeTarget = -1;

  var lastTapTime = 0;
  var TAP_MOVE_PX = 8;     /* tolerancia para considerar “tap” */
  var DBL_TAP_MS = 300;

  stage.addEventListener('touchstart', function (e) {
    if (!overlay.classList.contains('active') || animating) return;

    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
    deltaX = 0;
    deltaY = 0;
    dragging = true;

    /* Solo permitimos swipe entre imágenes si NO hay zoom */
    swipeTarget = -1;
    if (!zoomed && activeImg) activeImg.style.transition = 'none';
  });

  stage.addEventListener('touchmove', function (e) {
    if (!dragging || animating) return;

    var x = e.touches[0].clientX;
    var y = e.touches[0].clientY;

    deltaX = x - startX;
    deltaY = y - startY;

    /* Si está zoomed, no hacemos swipe de galería (UX estándar) */
    if (zoomed) return;

    var W = getW();
    var dir = deltaX < 0 ? 1 : -1;

    if (!ghostImg) {
      swipeDir = dir;
      swipeTarget =
        deltaX < 0
          ? (index + 1) % images.length
          : (index - 1 + images.length) % images.length;

      makeGhost(swipeTarget, dir);
      ghostImg.style.transition = 'none';
    }

    activeImg.style.transform = t3d(deltaX, 0, 1);
    ghostImg.style.transform  = t3d(dir * (W - OVERLAP) + deltaX, 0, 1);
  });

  stage.addEventListener('touchend', function (e) {
    if (!dragging) return;
    dragging = false;

    var absX = Math.abs(deltaX);
    var absY = Math.abs(deltaY);

    /* ===== TAP (sin arrastre) ===== */
    if (absX < TAP_MOVE_PX && absY < TAP_MOVE_PX && !animating) {
      var now = Date.now();
      var dt = now - lastTapTime;
      lastTapTime = now;

      var touch = e.changedTouches[0];

      /* Si doble tap → zoom / volver */
      if (dt > 0 && dt < DBL_TAP_MS && activeImg) {
        var imgRect = getDisplayedImageRect();
        var stageRect = getStageRect();

        if (!zoomed) {
          /* centrar zoom en el punto tocado */
          var cx = touch.clientX - stageRect.left - stageRect.width / 2;
          var cy = touch.clientY - stageRect.top  - stageRect.height / 2;

          activeImg.style.transition = 'transform 0.25s ease';
          activeImg.style.transform = t3d(-cx, -cy, ZOOM_SCALE);
          zoomed = true;
        } else {
          activeImg.style.transition = 'transform 0.25s ease';
          activeImg.style.transform = t3d(0, 0, 1);
          zoomed = false;
        }
        return;
      }

      /* Si tap simple fuera de la imagen → cerrar */
      var r = getDisplayedImageRect();
      if (r) {
        var outside =
          touch.clientX < r.left || touch.clientX > r.right ||
          touch.clientY < r.top  || touch.clientY > r.bottom;

        if (outside) {
          close();
          return;
        }
      }

      return; /* tap dentro → no hace nada */
    }

    /* ===== Si hay zoom, no hacemos swipe de galería ===== */
    if (zoomed) return;

    /* ===== SWIPE fin ===== */
    if (!ghostImg) {
      if (activeImg) {
        activeImg.style.transition = '';
        activeImg.style.transform = t3d(0, 0, 1);
      }
      return;
    }

    var W = getW();
    var threshold = W * 0.25;

    activeImg.style.transition = 'transform 0.3s ease';
    ghostImg.style.transition  = 'transform 0.3s ease';

    if (Math.abs(deltaX) > threshold) {
      activeImg.style.transform = t3d(-swipeDir * (W - OVERLAP), 0, 1);
      ghostImg.style.transform  = t3d(0, 0, 1);

      setTimeout(function () {
        commit(swipeTarget);
      }, 300);
    } else {
      activeImg.style.transform = t3d(0, 0, 1);
      ghostImg.style.transform  = t3d(swipeDir * (W - OVERLAP), 0, 1);

      setTimeout(function () {
        stage.removeChild(ghostImg);
        ghostImg = null;
        activeImg.style.transition = '';
        activeImg.style.transform = t3d(0, 0, 1);
      }, 300);
    }

    deltaX = 0;
    deltaY = 0;
  });

  /* Abrir fullscreen al tocar imagen del producto */
  container.addEventListener('click', function () {
    open(index);
  });

})();
{{/script}}

{{script}}
(function () {

  let done = false;

  function fixColeccionesTitle() {
    if (done) return;

    const candidates = Array.from(
      document.querySelectorAll('h1, h2')
    ).filter(el =>
      el.textContent &&
      el.textContent.toLowerCase().includes('colecciones')
    );

    if (!candidates.length) return;

    const main = candidates[0];

    /* Ocultar duplicados */
    for (let i = 1; i < candidates.length; i++) {
      candidates[i].style.display = 'none';
    }

    /* Reconstruir contenido */
    main.innerHTML =
      '<span class="col-bracket">[ </span> ' +
      '<span class="col-word">colecciones</span>' +
      '<span class="col-dot">.</span> ' +
      '<span class="col-bracket"> ]</span>';

    const isMobile = window.innerWidth <= 991;

/* === CONTENEDOR === */
main.style.setProperty('display', 'block', 'important');
main.style.setProperty('width', '100%', 'important');
main.style.setProperty('max-width', '100%', 'important');
main.style.setProperty('text-align', 'center', 'important');
main.style.setProperty('white-space', 'nowrap', 'important');
main.style.setProperty('position', 'relative', 'important');

main.style.setProperty(
  'line-height',
  isMobile ? '1' : '1.05',
  'important'
);

main.style.setProperty(
  'margin',
  '0 auto',
  'important'
    );

/* 🔑 AJUSTE DEL ESPACIO INFERIOR */
main.style.setProperty('margin-bottom', '10px', 'important');
main.style.setProperty('margin-top', '30px', 'important');
    
     main.style.setProperty(
      'font-size',
      isMobile ? '30px' : 'clamp(20px, 6vw, 34px)',
      'important'
    );
    main.style.setProperty('color', '#61ffd7', 'important');

    /* === PALABRA === */
    const word = main.querySelector('.col-word');
    if (word) {
      word.style.setProperty(
        'font-family',
        'BarQBlind, sans-serif',
        'important'
      );
      word.style.setProperty('font-size', '1.3em', 'important');
      word.style.setProperty('letter-spacing', '0.1em', 'important');
      word.style.setProperty('color', '#ffffff', 'important');
      word.style.setProperty('display', 'inline-block', 'important');
    }

    /* === SÍMBOLOS === */
    main.querySelectorAll('.col-bracket, .col-dot').forEach(el => {
      el.style.setProperty('color', '#61ffd7', 'important');
      el.style.setProperty('letter-spacing', 'normal', 'important');
    });

    done = true;
    observer.disconnect();
  }

  const observer = new MutationObserver(fixColeccionesTitle);
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });

  window.addEventListener('load', fixColeccionesTitle);

})();
{{/script}}

{{script}}
(function () {

  let done = false;

  function fixQuienesSomosTitle() {
    if (done) return;

    const candidates = Array.from(
      document.querySelectorAll('h1, h2')
    ).filter(el =>
      el.textContent &&
      el.textContent.toLowerCase().includes('quiénes somos')
    );

    if (!candidates.length) return;

    const main = candidates[0];

    /* Ocultar duplicados */
    for (let i = 1; i < candidates.length; i++) {
      candidates[i].style.display = 'none';
    }

    /* Reconstruir contenido */
    main.innerHTML =
      '<span class="qs-dots">: </span>' +
      '<span class="qs-word">quiénes somos</span>' +
      '<span class="qs-dots"> :</span>';

    const isMobile = window.innerWidth <= 991;

    /* === CONTENEDOR === */
    main.style.setProperty('display', 'block', 'important');
    main.style.setProperty('width', '100%', 'important');
    main.style.setProperty('max-width', '100%', 'important');
    main.style.setProperty('text-align', 'center', 'important');
    main.style.setProperty('white-space', 'nowrap', 'important');
    main.style.setProperty('position', 'relative', 'important');

    main.style.setProperty(
      'line-height',
      isMobile ? '1' : '1.05',
      'important'
    );

    main.style.setProperty('margin', '0 auto', 'important');
    main.style.setProperty('margin-top', '30px', 'important');
    main.style.setProperty('margin-bottom', '10px', 'important');

    main.style.setProperty(
      'font-size',
      isMobile ? '30px' : 'clamp(20px, 6vw, 34px)',
      'important'
    );

    main.style.setProperty('color', '#61ffd7', 'important');

    /* === PALABRA === */
    const word = main.querySelector('.qs-word');
    if (word) {
      word.style.setProperty(
        'font-family',
        'BarQBlind, sans-serif',
        'important'
      );
      word.style.setProperty('font-size', '1.3em', 'important');
      word.style.setProperty('letter-spacing', '0.1em', 'important');
      word.style.setProperty('color', '#ffffff', 'important');
      word.style.setProperty('display', 'inline-block', 'important');
    }

    /* === SÍMBOLOS === */
    main.querySelectorAll('.qs-dots, .qs-dots').forEach(el => {
      el.style.setProperty('color', '#61ffd7', 'important');
      el.style.setProperty('letter-spacing', 'normal', 'important');
    });

    done = true;
    observer.disconnect();
  }

  const observer = new MutationObserver(fixQuienesSomosTitle);
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });

  window.addEventListener('load', fixQuienesSomosTitle);

})();
{{/script}}

{{script}}
(function () {

  let done = false;

  function fixTerminosLegalesTitle() {
    if (done) return;

    const candidates = Array.from(
      document.querySelectorAll('h1, h2')
    ).filter(el =>
      el.textContent &&
      el.textContent.toLowerCase().includes('términos legales')
    );

    if (!candidates.length) return;

    const main = candidates[0];

    /* Ocultar duplicados */
    for (let i = 1; i < candidates.length; i++) {
      candidates[i].style.display = 'none';
    }

    /* Reconstruir contenido */
    main.innerHTML =
      '<span class="qs-equal">= </span>' +
      '<span class="qs-word">términos legales</span>' +
      '<span class="qs-equal"> =</span>';

    const isMobile = window.innerWidth <= 991;

    /* === CONTENEDOR === */
    main.style.setProperty('display', 'block', 'important');
    main.style.setProperty('width', '100%', 'important');
    main.style.setProperty('max-width', '100%', 'important');
    main.style.setProperty('text-align', 'center', 'important');
    main.style.setProperty('white-space', 'nowrap', 'important');
    main.style.setProperty('position', 'relative', 'important');

    main.style.setProperty(
      'line-height',
      isMobile ? '1' : '1.05',
      'important'
    );

    main.style.setProperty('margin', '0 auto', 'important');
    main.style.setProperty('margin-top', '30px', 'important');
    main.style.setProperty('margin-bottom', '10px', 'important');

    main.style.setProperty(
      'font-size',
      isMobile ? '30px' : 'clamp(20px, 6vw, 34px)',
      'important'
    );

    main.style.setProperty('color', '#61ffd7', 'important');

    /* === PALABRA === */
    const word = main.querySelector('.qs-word');
    if (word) {
      word.style.setProperty(
        'font-family',
        'BarQBlind, sans-serif',
        'important'
      );
      word.style.setProperty('font-size', '1.3em', 'important');
      word.style.setProperty('letter-spacing', '0.1em', 'important');
      word.style.setProperty('color', '#ffffff', 'important');
      word.style.setProperty('display', 'inline-block', 'important');
    }

    /* === SÍMBOLOS === */
    main.querySelectorAll('.qs-equal, .qs-equal').forEach(el => {
      el.style.setProperty('color', '#61ffd7', 'important');
      el.style.setProperty('letter-spacing', 'normal', 'important');
    });

    done = true;
    observer.disconnect();
  }

  const observer = new MutationObserver(fixTerminosLegalesTitle);
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });

  window.addEventListener('load', fixTerminosLegalesTitle);

})();
{{/script}}


{{script}}
(function () {

  let done = false;

  function fixCondicionesDeCompraTitle() {
    if (done) return;

    const candidates = Array.from(
      document.querySelectorAll('h1, h2')
    ).filter(el =>
      el.textContent &&
      el.textContent.toLowerCase().includes('shipping')
    );

    if (!candidates.length) return;

    const main = candidates[0];

    /* Ocultar duplicados */
    for (let i = 1; i < candidates.length; i++) {
      candidates[i].style.display = 'none';
    }

    /* Reconstruir contenido */
    main.innerHTML =
      '<span class="qs-line">- </span>' +
      '<span class="qs-word">condiciones de compra</span>' +
      '<span class="qs-line"> -</span>';

    const isMobile = window.innerWidth <= 991;

    /* === CONTENEDOR === */
    main.style.setProperty('display', 'block', 'important');
    main.style.setProperty('width', '100%', 'important');
    main.style.setProperty('max-width', '100%', 'important');
    main.style.setProperty('text-align', 'center', 'important');
    main.style.setProperty('white-space', 'nowrap', 'important');
    main.style.setProperty('position', 'relative', 'important');

    main.style.setProperty(
      'line-height',
      isMobile ? '1' : '1.05',
      'important'
    );

    main.style.setProperty('margin', '0 auto', 'important');
    main.style.setProperty('margin-top', '30px', 'important');
    main.style.setProperty('margin-bottom', '10px', 'important');

    main.style.setProperty(
      'font-size',
      isMobile ? '23px' : 'clamp(20px, 6vw, 34px)',
      'important'
    );

    main.style.setProperty('color', '#61ffd7', 'important');

    /* === PALABRA === */
    const word = main.querySelector('.qs-word');
    if (word) {
      word.style.setProperty(
        'font-family',
        'BarQBlind, sans-serif',
        'important'
      );
      word.style.setProperty('font-size', '1.3em', 'important');
      word.style.setProperty('letter-spacing', '0.1em', 'important');
      word.style.setProperty('color', '#ffffff', 'important');
      word.style.setProperty('display', 'inline-block', 'important');
    }

    /* === SÍMBOLOS === */
    main.querySelectorAll('.qs-line, .qs-line').forEach(el => {
      el.style.setProperty('color', '#61ffd7', 'important');
      el.style.setProperty('letter-spacing', 'normal', 'important');
    });

    done = true;
    observer.disconnect();
  }

  const observer = new MutationObserver(fixCondicionesDeCompraTitle);
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });

  window.addEventListener('load', fixCondicionesDeCompraTitle);

})();
{{/script}}



{{script}}
(function () {

  let done = false;

  function fixGuiaDeTallasCamisetasTitle() {
    if (done) return;

    const candidates = Array.from(
      document.querySelectorAll('h1, h2')
    ).filter(el =>
      el.textContent &&
      el.textContent.toLowerCase().includes('guia de tallas [camisetas]')
    );

    if (!candidates.length) return;

    const main = candidates[0];

    /* Ocultar duplicados */
    for (let i = 1; i < candidates.length; i++) {
      candidates[i].style.display = 'none';
    }

    /* Reconstruir contenido */
    main.innerHTML =
      '<span class="qs-word">guía de tallas</span><br>' +
      '<span class="qs-bracket"> [ </span>' +
      '<span class="qs-word2"> camisetas </span>' +
      '<span class="qs-bracket"> ]</span>';

    const isMobile = window.innerWidth <= 991;

    /* === CONTENEDOR === */
    main.style.setProperty('display', 'block', 'important');
    main.style.setProperty('width', '100%', 'important');
    main.style.setProperty('max-width', '100%', 'important');
    main.style.setProperty('text-align', 'center', 'important');
    main.style.setProperty('white-space', 'nowrap', 'important');
    main.style.setProperty('position', 'relative', 'important');

    main.style.setProperty(
      'line-height',
      isMobile ? '1' : '1.05',
      'important'
    );

    main.style.setProperty('margin', '0 auto', 'important');
    main.style.setProperty('margin-top', '30px', 'important');
    main.style.setProperty('margin-bottom', '10px', 'important');

    main.style.setProperty(
      'font-size',
      isMobile ? '30px' : 'clamp(20px, 6vw, 34px)',
      'important'
    );

    main.style.setProperty('color', '#61ffd7', 'important');

    /* === PALABRA === */
    const word = main.querySelector('.qs-word');
    if (word) {
      word.style.setProperty(
        'font-family',
        'BarQBlind, sans-serif',
        'important'
      );
      word.style.setProperty('font-size', '1.3em', 'important');
      word.style.setProperty('letter-spacing', '0.1em', 'important');
      word.style.setProperty('color', '#ffffff', 'important');
      word.style.setProperty('display', 'inline-block', 'important');

    
    }

    /* === PALABRA2 === */
    const word2 = main.querySelector('.qs-word2');
    if (word2) {
      word2.style.setProperty(
        'font-family',
        'BarQBlind, sans-serif',
        'important'
      );
      word2.style.setProperty('font-size', '1.3em', 'important');
      word2.style.setProperty('letter-spacing', '0.1em', 'important');
      word2.style.setProperty('color', '#ffffff', 'important');
      word2.style.setProperty('display', 'inline-block', 'important');

    
    }


    /* === SÍMBOLOS === */
    main.querySelectorAll('.qs-bracket, .qs-bracket').forEach(el => {
      el.style.setProperty('color', '#61ffd7', 'important');
      el.style.setProperty('letter-spacing', 'normal', 'important');
    });

    done = true;
    observer.disconnect();
  }

  const observer = new MutationObserver(fixGuiaDeTallasCamisetasTitle);
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });

  window.addEventListener('load', fixGuiaDeTallasCamisetasTitle);

})();
{{/script}}


{{script}}
(function () {

  let done = false;

  function fixGuiaDeTallasSudaderasTitle() {
    if (done) return;

    const candidates = Array.from(
      document.querySelectorAll('h1, h2')
    ).filter(el =>
      el.textContent &&
      el.textContent.toLowerCase().includes('guia de tallas [sudaderas]')
    );

    if (!candidates.length) return;

    const main = candidates[0];

    /* Ocultar duplicados */
    for (let i = 1; i < candidates.length; i++) {
      candidates[i].style.display = 'none';
    }

    /* Reconstruir contenido */
    main.innerHTML =
      '<span class="qs-word">guía de tallas</span><br>' +
      '<span class="qs-bracket"> [ </span>' +
      '<span class="qs-word2"> sudaderas </span>' +
      '<span class="qs-bracket"> ]</span>';

    const isMobile = window.innerWidth <= 991;

    /* === CONTENEDOR === */
    main.style.setProperty('display', 'block', 'important');
    main.style.setProperty('width', '100%', 'important');
    main.style.setProperty('max-width', '100%', 'important');
    main.style.setProperty('text-align', 'center', 'important');
    main.style.setProperty('white-space', 'nowrap', 'important');
    main.style.setProperty('position', 'relative', 'important');

    main.style.setProperty(
      'line-height',
      isMobile ? '1' : '1.05',
      'important'
    );

    main.style.setProperty('margin', '0 auto', 'important');
    main.style.setProperty('margin-top', '30px', 'important');
    main.style.setProperty('margin-bottom', '10px', 'important');

    main.style.setProperty(
      'font-size',
      isMobile ? '30px' : 'clamp(20px, 6vw, 34px)',
      'important'
    );

    main.style.setProperty('color', '#61ffd7', 'important');

    /* === PALABRA === */
    const word = main.querySelector('.qs-word');
    if (word) {
      word.style.setProperty(
        'font-family',
        'BarQBlind, sans-serif',
        'important'
      );
      word.style.setProperty('font-size', '1.3em', 'important');
      word.style.setProperty('letter-spacing', '0.1em', 'important');
      word.style.setProperty('color', '#ffffff', 'important');
      word.style.setProperty('display', 'inline-block', 'important');

    
    }

    /* === PALABRA2 === */
    const word2 = main.querySelector('.qs-word2');
    if (word2) {
      word2.style.setProperty(
        'font-family',
        'BarQBlind, sans-serif',
        'important'
      );
      word2.style.setProperty('font-size', '1.3em', 'important');
      word2.style.setProperty('letter-spacing', '0.1em', 'important');
      word2.style.setProperty('color', '#ffffff', 'important');
      word2.style.setProperty('display', 'inline-block', 'important');

    
    }


    /* === SÍMBOLOS === */
    main.querySelectorAll('.qs-bracket, .qs-bracket').forEach(el => {
      el.style.setProperty('color', '#61ffd7', 'important');
      el.style.setProperty('letter-spacing', 'normal', 'important');
    });

    done = true;
    observer.disconnect();
  }

  const observer = new MutationObserver(fixGuiaDeTallasSudaderasTitle);
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });

  window.addEventListener('load', fixGuiaDeTallasSudaderasTitle);

})();
{{/script}}


{{script}}
(function () {

  /* ===== SOLO EN /colecciones ===== */
  if (!/\/colecciones\/?$/.test(location.pathname)) return;

  /* =================================================
     MAPA ALT → URL
     Añade aquí nuevas imágenes cuando quieras
     ================================================= */
  const LINKS = {
    'surfwear': '/colecciones/surfwear',
    'sudaderas': '/colecciones/sudaderas',
    'camisetas': '/colecciones/camisetas',
    'accesorios': '/colecciones/accesorios'
    // 👆 añade más aquí
  };

  function applyLinks() {
    document.querySelectorAll('img').forEach(img => {
      if (img.dataset.linkified === '1') return;

      const key = img.alt && img.alt.trim().toLowerCase();
      if (!key || !LINKS[key]) return;

      img.style.cursor = 'pointer';
      img.setAttribute('role', 'link');
      img.setAttribute('aria-label', 'Ir a ' + key);

      img.addEventListener('click', () => {
        window.location.href = LINKS[key];
      });

      img.dataset.linkified = '1';
    });
  }

  /* Intento inicial */
  applyLinks();

  /* Reintentos por render tardío */
  let tries = 0;
  const timer = setInterval(() => {
    tries++;
    applyLinks();
    if (tries >= 20) clearInterval(timer);
  }, 300);

  /* Observer por si TPop re-renderiza */
  const observer = new MutationObserver(applyLinks);
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });

})();
{{/script}}


{{script}}
(function () {

  /* ===== SOLO EN /colecciones ===== */
  if (!/\/colecciones\/?$/.test(location.pathname)) return;

  /* =================================================
     MAPA ALT → URL
     ================================================= */
  const LINKS = {
    'life-aftr-surf': '/collection/life-aftr-surf',
    'in-offshore-we-trust': '/collection/in-offshore-we-trust',
    'like-other-planet': '/collection/like-other-planet',
    'fish-foot': '/collection/fish-foot',
    'breakfast': '/collection/breakfast'
  };

  function applyLinks() {
    document.querySelectorAll('img').forEach(img => {
      if (img.dataset.linkified === '1') return;

      const key = img.alt && img.alt.trim().toLowerCase();
      if (!key || !LINKS[key]) return;

      img.style.cursor = 'pointer';
      img.setAttribute('role', 'link');
      img.setAttribute('aria-label', 'Ir a ' + key.replace(/-/g, ' '));

      img.addEventListener('click', () => {
        window.location.href = LINKS[key];
      });

      img.dataset.linkified = '1';
    });
  }

  /* Intento inicial */
  applyLinks();

  /* Reintentos por render tardío */
  let tries = 0;
  const timer = setInterval(() => {
    tries++;
    applyLinks();
    if (tries >= 20) clearInterval(timer);
  }, 300);

  /* Observer por si TPop re-renderiza */
  const observer = new MutationObserver(applyLinks);
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });

})();
{{/script}}

{{script}}
(function () {

  const TARGET_URL = '/colecciones';

  function enhanceColeccionesMenus() {
    const links = Array.from(
      document.querySelectorAll('a.nav-link.dropdown-toggle')
    ).filter(a =>
      (a.textContent || '').toLowerCase().includes('colecciones')
    );

    links.forEach(link => {
      if (link.dataset.coleccionesEnhanced === '1') return;

      const text = link.textContent;
      link.textContent = '';
      link.style.position = 'relative';

      /* ===== TEXTO ===== */
      const textSpan = document.createElement('span');
      textSpan.className = 'colecciones-text-link';
      textSpan.textContent = text;

      textSpan.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        window.location.href = TARGET_URL;
      });

      link.appendChild(textSpan);

      /* ===== FLECHA ===== */
      const arrow = document.createElement('span');
      arrow.className = 'colecciones-arrow-toggle';

      /* CLAVE: en móvil bloqueamos navegación */
      arrow.addEventListener('touchstart', function (e) {
        e.stopPropagation();
      }, { passive: true });

      arrow.addEventListener('click', function (e) {
        e.stopPropagation();
        /* NO preventDefault → Bootstrap puede abrir el dropdown */
      });

      link.appendChild(arrow);

      link.dataset.coleccionesEnhanced = '1';
    });
  }

  enhanceColeccionesMenus();

  const observer = new MutationObserver(enhanceColeccionesMenus);
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });

})();
{{/script}}

{{script}}
(function () {

  function fixHomeBannerNaturalImage() {
    const bg = document.querySelector('.banner-background');
    const img = document.querySelector('.banner-background img.shop_banner_background');
    const overlayLayer = document.querySelector('.banner-background .position-absolute.w-100.h-100.top-0.start-0');
    const bannerContent = document.querySelector('.banner-content');

    if (!bg || !img || !bannerContent) return;

    const banner = bg.parentElement;
    if (!banner) return;

    const container = banner.closest('.container, .container-fluid');

    if (container) {
      container.style.maxWidth = '100%';
      container.style.paddingLeft = '0';
      container.style.paddingRight = '0';
    }

    /* ancho completo */
    banner.style.width = '100vw';
    banner.style.marginLeft = '50%';
    banner.style.transform = 'translateX(-50%)';
    banner.style.position = 'relative';
    banner.style.overflow = 'visible';

    /* quitar TODAS las alturas forzadas */
    banner.style.height = 'auto';
    banner.style.minHeight = '0';
    banner.style.maxHeight = 'none';

    bg.style.position = 'relative';
    bg.style.width = '100%';
    bg.style.height = 'auto';
    bg.style.minHeight = '0';
    bg.style.maxHeight = 'none';

    /* MUY IMPORTANTE: matar h-100 inline del html */
    bg.classList.remove('h-100');
    img.classList.remove('h-100');

    img.style.display = 'block';
    img.style.width = '100%';
    img.style.height = 'auto';
    img.style.minHeight = '0';
    img.style.maxHeight = 'none';
    img.style.objectFit = 'contain';

    /* anular la capa vacía que venía preparada como fondo */
    if (overlayLayer) {
      overlayLayer.style.display = 'none';
    }

    /* texto por encima */
    bannerContent.style.position = 'absolute';
    bannerContent.style.inset = '0';
    bannerContent.style.zIndex = '2';
    bannerContent.style.display = 'flex';
    bannerContent.style.alignItems = 'center';
    bannerContent.style.justifyContent = 'center';
    bannerContent.style.padding = '0';

    banner.classList.add('las-home-banner-natural');
  }

  fixHomeBannerNaturalImage();

  let tries = 0;
  const timer = setInterval(() => {
    fixHomeBannerNaturalImage();
    tries++;
    if (tries > 30) clearInterval(timer);
  }, 250);

  const obs = new MutationObserver(fixHomeBannerNaturalImage);
  obs.observe(document.body, { childList: true, subtree: true });

})();
{{/script}}



{{script}}
(function () {

  function tightenColeccionesGap() {

    const h1 = Array.from(document.querySelectorAll('h1'))
      .find(el => el.textContent.toLowerCase().includes('colecciones'));

    if (!h1) return;

    let next = h1.nextElementSibling;
    let steps = 0;

    /* Reducimos espacio en los primeros bloques tras el h1 */
    while (next && steps < 3) {
      next.style.setProperty('margin-top', '0', 'important');
      next.style.setProperty('padding-top', '0', 'important');

      /* Si dentro hay otro wrapper típico, también lo tocamos */
      const inner = next.querySelector(':scope > *');
      if (inner) {
        inner.style.setProperty('margin-top', '0', 'important');
        inner.style.setProperty('padding-top', '0', 'important');
      }

      steps++;
      next = next.nextElementSibling;
    }
  }

  tightenColeccionesGap();

  let tries = 0;
  const timer = setInterval(() => {
    tightenColeccionesGap();
    tries++;
    if (tries > 20) clearInterval(timer);
  }, 300);

  const obs = new MutationObserver(tightenColeccionesGap);
  obs.observe(document.body, { childList: true, subtree: true });

})();
{{/script}}

{{script}}
(function () {

  function handleHomeBannerVisibility() {

    const isHome =
      location.pathname === '/' ||
      location.pathname === '/index.html';

    const banner = document.querySelector('.banner-background')?.parentElement;

    if (!banner) return;

    if (!isHome) {
      banner.style.display = 'none';
    } else {
      banner.style.display = '';
    }
  }

  handleHomeBannerVisibility();

  let tries = 0;
  const timer = setInterval(() => {
    handleHomeBannerVisibility();
    tries++;
    if (tries > 20) clearInterval(timer);
  }, 300);

})();
{{/script}}

{{script}}
(function () {

  /* ===== CARGA DE JETBRAINS MONO VIA JS ===== */
  /* Lo hacemos por JS porque TPOP a veces bloquea los @import del CSS */
  function loadJetBrainsMono() {
    if (document.querySelector('link[data-las-font="jetbrains"]')) return;

    /* Preconnect a Google Fonts (más rápido) */
    const pre1 = document.createElement('link');
    pre1.rel = 'preconnect';
    pre1.href = 'https://fonts.googleapis.com';
    pre1.setAttribute('data-las-font', 'jetbrains');
    document.head.appendChild(pre1);

    const pre2 = document.createElement('link');
    pre2.rel = 'preconnect';
    pre2.href = 'https://fonts.gstatic.com';
    pre2.crossOrigin = 'anonymous';
    document.head.appendChild(pre2);

    /* Stylesheet de la fuente */
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href =
      'https://fonts.googleapis.com/css2?' +
      'family=JetBrains+Mono:wght@200;300;400&display=swap';
    document.head.appendChild(link);
  }

  loadJetBrainsMono();


  /* ===== SOLO EN HOME ===== */
  function isHome() {
    return location.pathname === '/' ||
           location.pathname === '/index.html';
  }

  if (!isHome()) return;


  /* ===== INYECTAR BANDA DE COORDENADAS ===== */
  function injectCoordsBar() {

    if (document.querySelector('.las-coords-bar')) return true;

    const banner = document.querySelector('.banner-background')?.parentElement;
    if (!banner) return false;

    const bar = document.createElement('div');
    bar.className = 'las-coords-bar';
    bar.innerHTML =
      '<span class="las-coords-left">EST. ATLÁNTICO/</span>' +
      '<span class="las-coords-right">N 43°32\'21" W 8°18\'1"</span>';

    banner.parentNode.insertBefore(bar, banner);

    return true;
  }

  injectCoordsBar();

  let tries = 0;
  const timer = setInterval(() => {
    tries++;
    if (injectCoordsBar() || tries >= 40) clearInterval(timer);
  }, 250);

  const obs = new MutationObserver(() => {
    if (isHome()) injectCoordsBar();
  });

  obs.observe(document.body, { childList: true, subtree: true });

})();
{{/script}}

