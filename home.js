/* ==========================================================
   LIFE AFTR SURF · home.js
   Todos los scripts personalizados de la tienda
   ========================================================== */


/* ==========================================================
   1. SWAP SEARCH / BURGER EN EL HEADER MÓVIL
   ========================================================== */
(function () {
  function swapSearchAndBurger() {
    const nav = document.querySelector("nav.nav-header");
    if (!nav) return false;

    if (nav.dataset.swapDone === "1") return true;

    const searchIcon = nav.querySelector("a.search-icon");
    const burgerButton = nav.querySelector("button.button-mobile-menu");
    if (!searchIcon || !burgerButton) return false;

    const burgerWrapper =
      burgerButton.closest(".d-block.d-lg-none") || burgerButton.closest("div");
    if (!burgerWrapper) return false;

    const searchParent = searchIcon.parentNode;
    const burgerParent = burgerWrapper.parentNode;
    const searchNext = searchIcon.nextSibling;
    const burgerNext = burgerWrapper.nextSibling;

    burgerParent.insertBefore(searchIcon, burgerNext);
    searchParent.insertBefore(burgerWrapper, searchNext);

    nav.dataset.swapDone = "1";
    return true;
  }

  swapSearchAndBurger();

  let tries = 0;
  const timer = setInterval(() => {
    tries += 1;
    if (swapSearchAndBurger() || tries >= 40) clearInterval(timer);
  }, 250);

  const obs = new MutationObserver(() => { swapSearchAndBurger(); });
  obs.observe(document.documentElement, { childList: true, subtree: true });
})();


/* ==========================================================
   2. MENÚ MÓVIL · APERTURA/CIERRE ANIMADO
   ========================================================== */
(function () {
  const bd = document.querySelector('.backdrop-menu');
  const menu = document.querySelector('.mobile-menu');
  if (!bd || !menu) return;

  const DURATION = 300;

  function backdropIsOpen() {
    const cs = getComputedStyle(bd);
    if (cs.display === 'none' || cs.visibility === 'hidden') return false;
    if (cs.pointerEvents === 'none') return false;
    const r = bd.getBoundingClientRect();
    return r.width > 0 && r.height > 0;
  }

  function openMenu() {
    menu.style.display = 'block';
    menu.style.visibility = 'visible';
    menu.style.pointerEvents = 'auto';
    menu.style.transition = 'none';
    menu.style.transform = 'translateX(-100%)';
    menu.offsetHeight;
    menu.style.transition = 'transform 0.3s ease';
    menu.style.transform = 'translateX(0)';
  }

  function closeMenu() {
    menu.style.transition = 'transform 0.3s ease';
    menu.style.transform = 'translateX(-100%)';
    setTimeout(() => {
      menu.style.pointerEvents = 'none';
      menu.style.visibility = 'hidden';
    }, DURATION);
  }

  let isOpen = false;

  function sync() {
    const shouldBeOpen = backdropIsOpen();
    if (shouldBeOpen && !isOpen) { openMenu(); isOpen = true; }
    if (!shouldBeOpen && isOpen) { closeMenu(); isOpen = false; }
  }

  sync();

  const obs = new MutationObserver(sync);
  obs.observe(bd, { attributes: true, attributeFilter: ['class', 'style'] });
  document.addEventListener('click', () => setTimeout(sync, 0), true);
})();


/* ==========================================================
   3. HEADER STICKY · SCROLL STATE
   ========================================================== */
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
    if (scrolled !== lastState) {
      document.body.classList.toggle('header-scrolled', scrolled);
      updateBodyPadding();
      lastState = scrolled;
    }
  }

  updateBodyPadding();
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', updateBodyPadding);
})();


/* ==========================================================
   4. SLIDER DE PRODUCTO · IMAGEN PRINCIPAL
   ========================================================== */
(function () {
  var mainPicture = document.querySelector('#mainPicture');
  if (!mainPicture) return;

  var container = mainPicture.querySelector('.img-container.main-image');
  if (!container) return;

  var baseImg = container.querySelector('img.img-product');
  if (!baseImg) return;

  var thumbs = document.querySelectorAll('.sub-images-container img.img-product');
  if (!thumbs) return;

  if (thumbs.length <= 1) {
    mainPicture.classList.remove('slider-active');
    return;
  }

  mainPicture.classList.add('slider-active');

  var images = [];
  for (var i = 0; i < thumbs.length; i++) { images.push(thumbs[i].src); }

  var index = 0;
  for (i = 0; i < images.length; i++) {
    if (images[i] === baseImg.src) { index = i; break; }
  }

  var h = container.getBoundingClientRect().height;
  container.style.height = h + 'px';

  var OVERLAP = 10;

  function getW() { return container.getBoundingClientRect().width; }
  function t3d(x) { return 'translate3d(' + x + 'px,0,0)'; }

  var activeImg = document.createElement('img');
  activeImg.className = 'slider-img';
  activeImg.src = images[index];
  activeImg.style.transform = t3d(0);
  container.appendChild(activeImg);

  var ghostImg = null;
  var animating = false;

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

  container.insertAdjacentElement('afterend', dotsWrap);

  function updateDots() {
    for (var j = 0; j < dots.length; j++) {
      dots[j].className = (j === index) ? 'active' : '';
    }
  }

  function makeGhost(newIndex, dir) {
    var W = getW();
    ghostImg = document.createElement('img');
    ghostImg.className = 'slider-img';
    ghostImg.src = images[newIndex];
    ghostImg.style.transform = t3d(dir * (W - OVERLAP));
    container.appendChild(ghostImg);
  }

  function commit(newIndex) {
    if (activeImg && activeImg.parentNode) activeImg.parentNode.removeChild(activeImg);
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
    if (activeImg && activeImg.parentNode) activeImg.parentNode.removeChild(activeImg);
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

    setTimeout(function () { commit(newIndex); }, 300);
  }

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

  prev.onclick = function () { slideTo((index - 1 + images.length) % images.length, -1); };
  next.onclick = function () { slideTo((index + 1) % images.length, 1); };

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
      swipeTarget = deltaX < 0
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
      setTimeout(function () { commit(swipeTarget); }, 300);
    } else {
      activeImg.style.transform = t3d(0);
      ghostImg.style.transform  = t3d(swipeDir * (W - OVERLAP));
      setTimeout(function () {
        if (ghostImg && ghostImg.parentNode) ghostImg.parentNode.removeChild(ghostImg);
        ghostImg = null;
        activeImg.style.transition = '';
        activeImg.style.transform = t3d(0);
      }, 300);
    }

    deltaX = 0;
  });

  var observer = new MutationObserver(function () {
    var newSrc = baseImg.src;
    var newIndex = images.indexOf(newSrc);
    if (newIndex !== -1 && newIndex !== index) jumpTo(newIndex);
  });

  observer.observe(baseImg, { attributes: true, attributeFilter: ['src'] });
})();


/* ==========================================================
   5. FULLSCREEN MÓVIL · GALERÍA CON ZOOM
   ========================================================== */
(function () {
  if (window.innerWidth > 991) return;

  var mainPicture = document.querySelector('#mainPicture');
  if (!mainPicture) return;

  var container = mainPicture.querySelector('.img-container.main-image');
  if (!container) return;

  var thumbs = document.querySelectorAll('.sub-images-container img.img-product');
  if (!thumbs || thumbs.length === 0) return;

  var images = [];
  for (var i = 0; i < thumbs.length; i++) images.push(thumbs[i].src);

  var index = 0;
  var activeImg = null;
  var ghostImg = null;
  var animating = false;
  var OVERLAP = 10;
  var zoomed = false;
  var ZOOM_SCALE = 2.5;

  function t3d(x, y, s) {
    return 'translate3d(' + x + 'px,' + y + 'px,0) scale(' + s + ')';
  }

  function getW() { return overlay.getBoundingClientRect().width; }
  function getStageRect() { return stage.getBoundingClientRect(); }

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

    return { left: left, top: top, right: left + dispW, bottom: top + dispH, width: dispW, height: dispH };
  }

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

  var startX = 0, startY = 0;
  var deltaX = 0, deltaY = 0;
  var dragging = false;
  var swipeDir = 0;
  var swipeTarget = -1;
  var lastTapTime = 0;
  var TAP_MOVE_PX = 8;
  var DBL_TAP_MS = 300;

  stage.addEventListener('touchstart', function (e) {
    if (!overlay.classList.contains('active') || animating) return;
    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
    deltaX = 0;
    deltaY = 0;
    dragging = true;
    swipeTarget = -1;
    if (!zoomed && activeImg) activeImg.style.transition = 'none';
  });

  stage.addEventListener('touchmove', function (e) {
    if (!dragging || animating) return;
    var x = e.touches[0].clientX;
    var y = e.touches[0].clientY;
    deltaX = x - startX;
    deltaY = y - startY;
    if (zoomed) return;

    var W = getW();
    var dir = deltaX < 0 ? 1 : -1;

    if (!ghostImg) {
      swipeDir = dir;
      swipeTarget = deltaX < 0
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

    if (absX < TAP_MOVE_PX && absY < TAP_MOVE_PX && !animating) {
      var now = Date.now();
      var dt = now - lastTapTime;
      lastTapTime = now;
      var touch = e.changedTouches[0];

      if (dt > 0 && dt < DBL_TAP_MS && activeImg) {
        var stageRect = getStageRect();
        if (!zoomed) {
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

      var r = getDisplayedImageRect();
      if (r) {
        var outside =
          touch.clientX < r.left || touch.clientX > r.right ||
          touch.clientY < r.top  || touch.clientY > r.bottom;
        if (outside) { close(); return; }
      }
      return;
    }

    if (zoomed) return;

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
      setTimeout(function () { commit(swipeTarget); }, 300);
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

  container.addEventListener('click', function () { open(index); });
})();


/* ==========================================================
   6. TÍTULOS PERSONALIZADOS · BarQBlind
   ========================================================== */

/* 6.1 · COLECCIONES */
(function () {
  let done = false;
  function fixTitle() {
    if (done) return;
    const candidates = Array.from(document.querySelectorAll('h1, h2'))
      .filter(el => el.textContent && el.textContent.toLowerCase().includes('colecciones'));
    if (!candidates.length) return;

    const main = candidates[0];
    for (let i = 1; i < candidates.length; i++) candidates[i].style.display = 'none';

    main.innerHTML =
      '<span class="col-bracket">[ </span> ' +
      '<span class="col-word">colecciones</span>' +
      '<span class="col-dot">.</span> ' +
      '<span class="col-bracket"> ]</span>';

    const isMobile = window.innerWidth <= 991;

    main.style.setProperty('display', 'block', 'important');
    main.style.setProperty('width', '100%', 'important');
    main.style.setProperty('max-width', '100%', 'important');
    main.style.setProperty('text-align', 'center', 'important');
    main.style.setProperty('white-space', 'nowrap', 'important');
    main.style.setProperty('position', 'relative', 'important');
    main.style.setProperty('line-height', isMobile ? '1' : '1.05', 'important');
    main.style.setProperty('margin', '0 auto', 'important');
    main.style.setProperty('margin-bottom', '10px', 'important');
    main.style.setProperty('margin-top', '30px', 'important');
    main.style.setProperty('font-size', isMobile ? '30px' : 'clamp(20px, 6vw, 34px)', 'important');
    main.style.setProperty('color', '#61ffd7', 'important');

    const word = main.querySelector('.col-word');
    if (word) {
      word.style.setProperty('font-family', 'BarQBlind, sans-serif', 'important');
      word.style.setProperty('font-size', '1.3em', 'important');
      word.style.setProperty('letter-spacing', '0.1em', 'important');
      word.style.setProperty('color', '#ffffff', 'important');
      word.style.setProperty('display', 'inline-block', 'important');
    }

    main.querySelectorAll('.col-bracket, .col-dot').forEach(el => {
      el.style.setProperty('color', '#61ffd7', 'important');
      el.style.setProperty('letter-spacing', 'normal', 'important');
    });

    done = true;
    observer.disconnect();
  }
  const observer = new MutationObserver(fixTitle);
  observer.observe(document.body, { childList: true, subtree: true });
  window.addEventListener('load', fixTitle);
})();


/* 6.2 · QUIÉNES SOMOS */
(function () {
  let done = false;
  function fixTitle() {
    if (done) return;
    const candidates = Array.from(document.querySelectorAll('h1, h2'))
      .filter(el => el.textContent && el.textContent.toLowerCase().includes('quiénes somos'));
    if (!candidates.length) return;

    const main = candidates[0];
    for (let i = 1; i < candidates.length; i++) candidates[i].style.display = 'none';

    main.innerHTML =
      '<span class="qs-dots">: </span>' +
      '<span class="qs-word">quiénes somos</span>' +
      '<span class="qs-dots"> :</span>';

    const isMobile = window.innerWidth <= 991;
    main.style.setProperty('display', 'block', 'important');
    main.style.setProperty('width', '100%', 'important');
    main.style.setProperty('max-width', '100%', 'important');
    main.style.setProperty('text-align', 'center', 'important');
    main.style.setProperty('white-space', 'nowrap', 'important');
    main.style.setProperty('position', 'relative', 'important');
    main.style.setProperty('line-height', isMobile ? '1' : '1.05', 'important');
    main.style.setProperty('margin', '0 auto', 'important');
    main.style.setProperty('margin-top', '30px', 'important');
    main.style.setProperty('margin-bottom', '10px', 'important');
    main.style.setProperty('font-size', isMobile ? '30px' : 'clamp(20px, 6vw, 34px)', 'important');
    main.style.setProperty('color', '#61ffd7', 'important');

    const word = main.querySelector('.qs-word');
    if (word) {
      word.style.setProperty('font-family', 'BarQBlind, sans-serif', 'important');
      word.style.setProperty('font-size', '1.3em', 'important');
      word.style.setProperty('letter-spacing', '0.1em', 'important');
      word.style.setProperty('color', '#ffffff', 'important');
      word.style.setProperty('display', 'inline-block', 'important');
    }

    main.querySelectorAll('.qs-dots').forEach(el => {
      el.style.setProperty('color', '#61ffd7', 'important');
      el.style.setProperty('letter-spacing', 'normal', 'important');
    });

    done = true;
    observer.disconnect();
  }
  const observer = new MutationObserver(fixTitle);
  observer.observe(document.body, { childList: true, subtree: true });
  window.addEventListener('load', fixTitle);
})();


/* 6.3 · TÉRMINOS LEGALES */
(function () {
  let done = false;
  function fixTitle() {
    if (done) return;
    const candidates = Array.from(document.querySelectorAll('h1, h2'))
      .filter(el => el.textContent && el.textContent.toLowerCase().includes('términos legales'));
    if (!candidates.length) return;

    const main = candidates[0];
    for (let i = 1; i < candidates.length; i++) candidates[i].style.display = 'none';

    main.innerHTML =
      '<span class="qs-equal">= </span>' +
      '<span class="qs-word">términos legales</span>' +
      '<span class="qs-equal"> =</span>';

    const isMobile = window.innerWidth <= 991;
    main.style.setProperty('display', 'block', 'important');
    main.style.setProperty('width', '100%', 'important');
    main.style.setProperty('max-width', '100%', 'important');
    main.style.setProperty('text-align', 'center', 'important');
    main.style.setProperty('white-space', 'nowrap', 'important');
    main.style.setProperty('position', 'relative', 'important');
    main.style.setProperty('line-height', isMobile ? '1' : '1.05', 'important');
    main.style.setProperty('margin', '0 auto', 'important');
    main.style.setProperty('margin-top', '30px', 'important');
    main.style.setProperty('margin-bottom', '10px', 'important');
    main.style.setProperty('font-size', isMobile ? '30px' : 'clamp(20px, 6vw, 34px)', 'important');
    main.style.setProperty('color', '#61ffd7', 'important');

    const word = main.querySelector('.qs-word');
    if (word) {
      word.style.setProperty('font-family', 'BarQBlind, sans-serif', 'important');
      word.style.setProperty('font-size', '1.3em', 'important');
      word.style.setProperty('letter-spacing', '0.1em', 'important');
      word.style.setProperty('color', '#ffffff', 'important');
      word.style.setProperty('display', 'inline-block', 'important');
    }

    main.querySelectorAll('.qs-equal').forEach(el => {
      el.style.setProperty('color', '#61ffd7', 'important');
      el.style.setProperty('letter-spacing', 'normal', 'important');
    });

    done = true;
    observer.disconnect();
  }
  const observer = new MutationObserver(fixTitle);
  observer.observe(document.body, { childList: true, subtree: true });
  window.addEventListener('load', fixTitle);
})();


/* 6.4 · CONDICIONES DE COMPRA (busca "shipping") */
(function () {
  let done = false;
  function fixTitle() {
    if (done) return;
    const candidates = Array.from(document.querySelectorAll('h1, h2'))
      .filter(el => el.textContent && el.textContent.toLowerCase().includes('shipping'));
    if (!candidates.length) return;

    const main = candidates[0];
    for (let i = 1; i < candidates.length; i++) candidates[i].style.display = 'none';

    main.innerHTML =
      '<span class="qs-line">- </span>' +
      '<span class="qs-word">condiciones de compra</span>' +
      '<span class="qs-line"> -</span>';

    const isMobile = window.innerWidth <= 991;
    main.style.setProperty('display', 'block', 'important');
    main.style.setProperty('width', '100%', 'important');
    main.style.setProperty('max-width', '100%', 'important');
    main.style.setProperty('text-align', 'center', 'important');
    main.style.setProperty('white-space', 'nowrap', 'important');
    main.style.setProperty('position', 'relative', 'important');
    main.style.setProperty('line-height', isMobile ? '1' : '1.05', 'important');
    main.style.setProperty('margin', '0 auto', 'important');
    main.style.setProperty('margin-top', '30px', 'important');
    main.style.setProperty('margin-bottom', '10px', 'important');
    main.style.setProperty('font-size', isMobile ? '23px' : 'clamp(20px, 6vw, 34px)', 'important');
    main.style.setProperty('color', '#61ffd7', 'important');

    const word = main.querySelector('.qs-word');
    if (word) {
      word.style.setProperty('font-family', 'BarQBlind, sans-serif', 'important');
      word.style.setProperty('font-size', '1.3em', 'important');
      word.style.setProperty('letter-spacing', '0.1em', 'important');
      word.style.setProperty('color', '#ffffff', 'important');
      word.style.setProperty('display', 'inline-block', 'important');
    }

    main.querySelectorAll('.qs-line').forEach(el => {
      el.style.setProperty('color', '#61ffd7', 'important');
      el.style.setProperty('letter-spacing', 'normal', 'important');
    });

    done = true;
    observer.disconnect();
  }
  const observer = new MutationObserver(fixTitle);
  observer.observe(document.body, { childList: true, subtree: true });
  window.addEventListener('load', fixTitle);
})();


/* 6.5 · GUÍA DE TALLAS CAMISETAS */
(function () {
  let done = false;
  function fixTitle() {
    if (done) return;
    const candidates = Array.from(document.querySelectorAll('h1, h2'))
      .filter(el => el.textContent && el.textContent.toLowerCase().includes('guia de tallas [camisetas]'));
    if (!candidates.length) return;

    const main = candidates[0];
    for (let i = 1; i < candidates.length; i++) candidates[i].style.display = 'none';

    main.innerHTML =
      '<span class="qs-word">guía de tallas</span><br>' +
      '<span class="qs-bracket"> [ </span>' +
      '<span class="qs-word2"> camisetas </span>' +
      '<span class="qs-bracket"> ]</span>';

    const isMobile = window.innerWidth <= 991;
    main.style.setProperty('display', 'block', 'important');
    main.style.setProperty('width', '100%', 'important');
    main.style.setProperty('max-width', '100%', 'important');
    main.style.setProperty('text-align', 'center', 'important');
    main.style.setProperty('white-space', 'nowrap', 'important');
    main.style.setProperty('position', 'relative', 'important');
    main.style.setProperty('line-height', isMobile ? '1' : '1.05', 'important');
    main.style.setProperty('margin', '0 auto', 'important');
    main.style.setProperty('margin-top', '30px', 'important');
    main.style.setProperty('margin-bottom', '10px', 'important');
    main.style.setProperty('font-size', isMobile ? '30px' : 'clamp(20px, 6vw, 34px)', 'important');
    main.style.setProperty('color', '#61ffd7', 'important');

    ['qs-word', 'qs-word2'].forEach(cls => {
      const w = main.querySelector('.' + cls);
      if (w) {
        w.style.setProperty('font-family', 'BarQBlind, sans-serif', 'important');
        w.style.setProperty('font-size', '1.3em', 'important');
        w.style.setProperty('letter-spacing', '0.1em', 'important');
        w.style.setProperty('color', '#ffffff', 'important');
        w.style.setProperty('display', 'inline-block', 'important');
      }
    });

    main.querySelectorAll('.qs-bracket').forEach(el => {
      el.style.setProperty('color', '#61ffd7', 'important');
      el.style.setProperty('letter-spacing', 'normal', 'important');
    });

    done = true;
    observer.disconnect();
  }
  const observer = new MutationObserver(fixTitle);
  observer.observe(document.body, { childList: true, subtree: true });
  window.addEventListener('load', fixTitle);
})();


/* 6.6 · GUÍA DE TALLAS SUDADERAS */
(function () {
  let done = false;
  function fixTitle() {
    if (done) return;
    const candidates = Array.from(document.querySelectorAll('h1, h2'))
      .filter(el => el.textContent && el.textContent.toLowerCase().includes('guia de tallas [sudaderas]'));
    if (!candidates.length) return;

    const main = candidates[0];
    for (let i = 1; i < candidates.length; i++) candidates[i].style.display = 'none';

    main.innerHTML =
      '<span class="qs-word">guía de tallas</span><br>' +
      '<span class="qs-bracket"> [ </span>' +
      '<span class="qs-word2"> sudaderas </span>' +
      '<span class="qs-bracket"> ]</span>';

    const isMobile = window.innerWidth <= 991;
    main.style.setProperty('display', 'block', 'important');
    main.style.setProperty('width', '100%', 'important');
    main.style.setProperty('max-width', '100%', 'important');
    main.style.setProperty('text-align', 'center', 'important');
    main.style.setProperty('white-space', 'nowrap', 'important');
    main.style.setProperty('position', 'relative', 'important');
    main.style.setProperty('line-height', isMobile ? '1' : '1.05', 'important');
    main.style.setProperty('margin', '0 auto', 'important');
    main.style.setProperty('margin-top', '30px', 'important');
    main.style.setProperty('margin-bottom', '10px', 'important');
    main.style.setProperty('font-size', isMobile ? '30px' : 'clamp(20px, 6vw, 34px)', 'important');
    main.style.setProperty('color', '#61ffd7', 'important');

    ['qs-word', 'qs-word2'].forEach(cls => {
      const w = main.querySelector('.' + cls);
      if (w) {
        w.style.setProperty('font-family', 'BarQBlind, sans-serif', 'important');
        w.style.setProperty('font-size', '1.3em', 'important');
        w.style.setProperty('letter-spacing', '0.1em', 'important');
        w.style.setProperty('color', '#ffffff', 'important');
        w.style.setProperty('display', 'inline-block', 'important');
      }
    });

    main.querySelectorAll('.qs-bracket').forEach(el => {
      el.style.setProperty('color', '#61ffd7', 'important');
      el.style.setProperty('letter-spacing', 'normal', 'important');
    });

    done = true;
    observer.disconnect();
  }
  const observer = new MutationObserver(fixTitle);
  observer.observe(document.body, { childList: true, subtree: true });
  window.addEventListener('load', fixTitle);
})();


/* ==========================================================
   7. LINKS EN /colecciones · POR ATRIBUTO ALT (categorías)
   ========================================================== */
(function () {
  if (!/\/colecciones\/?$/.test(location.pathname)) return;

  const LINKS = {
    'surfwear': '/colecciones/surfwear',
    'sudaderas': '/colecciones/sudaderas',
    'camisetas': '/colecciones/camisetas',
    'accesorios': '/colecciones/accesorios'
  };

  function applyLinks() {
    document.querySelectorAll('img').forEach(img => {
      if (img.dataset.linkified === '1') return;
      const key = img.alt && img.alt.trim().toLowerCase();
      if (!key || !LINKS[key]) return;
      img.style.cursor = 'pointer';
      img.setAttribute('role', 'link');
      img.setAttribute('aria-label', 'Ir a ' + key);
      img.addEventListener('click', () => { window.location.href = LINKS[key]; });
      img.dataset.linkified = '1';
    });
  }

  applyLinks();
  let tries = 0;
  const timer = setInterval(() => {
    tries++;
    applyLinks();
    if (tries >= 20) clearInterval(timer);
  }, 300);
  const observer = new MutationObserver(applyLinks);
  observer.observe(document.body, { childList: true, subtree: true });
})();


/* ==========================================================
   8. LINKS EN /colecciones · POR ATRIBUTO ALT (colecciones)
   ========================================================== */
(function () {
  if (!/\/colecciones\/?$/.test(location.pathname)) return;

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
      img.addEventListener('click', () => { window.location.href = LINKS[key]; });
      img.dataset.linkified = '1';
    });
  }

  applyLinks();
  let tries = 0;
  const timer = setInterval(() => {
    tries++;
    applyLinks();
    if (tries >= 20) clearInterval(timer);
  }, 300);
  const observer = new MutationObserver(applyLinks);
  observer.observe(document.body, { childList: true, subtree: true });
})();


/* ==========================================================
   9. MENÚ COLECCIONES · TEXTO + FLECHA SEPARADAS
   ========================================================== */
(function () {
  const TARGET_URL = '/colecciones';

  function enhance() {
    const links = Array.from(document.querySelectorAll('a.nav-link.dropdown-toggle'))
      .filter(a => (a.textContent || '').toLowerCase().includes('colecciones'));

    links.forEach(link => {
      if (link.dataset.coleccionesEnhanced === '1') return;

      const text = link.textContent;
      link.textContent = '';
      link.style.position = 'relative';

      const textSpan = document.createElement('span');
      textSpan.className = 'colecciones-text-link';
      textSpan.textContent = text;
      textSpan.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        window.location.href = TARGET_URL;
      });
      link.appendChild(textSpan);

      const arrow = document.createElement('span');
      arrow.className = 'colecciones-arrow-toggle';
      arrow.addEventListener('touchstart', function (e) { e.stopPropagation(); }, { passive: true });
      arrow.addEventListener('click', function (e) { e.stopPropagation(); });
      link.appendChild(arrow);

      link.dataset.coleccionesEnhanced = '1';
    });
  }

  enhance();
  const observer = new MutationObserver(enhance);
  observer.observe(document.body, { childList: true, subtree: true });
})();


/* ==========================================================
   10. HOME BANNER · IMAGEN A TAMAÑO NATURAL
   ========================================================== */
(function () {
  function fixBanner() {
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

    banner.style.width = '100vw';
    banner.style.marginLeft = '50%';
    banner.style.transform = 'translateX(-50%)';
    banner.style.position = 'relative';
    banner.style.overflow = 'visible';
    banner.style.height = 'auto';
    banner.style.minHeight = '0';
    banner.style.maxHeight = 'none';

    bg.style.position = 'relative';
    bg.style.width = '100%';
    bg.style.height = 'auto';
    bg.style.minHeight = '0';
    bg.style.maxHeight = 'none';
    bg.classList.remove('h-100');
    img.classList.remove('h-100');

    img.style.display = 'block';
    img.style.width = '100%';
    img.style.height = 'auto';
    img.style.minHeight = '0';
    img.style.maxHeight = 'none';
    img.style.objectFit = 'contain';

    if (overlayLayer) overlayLayer.style.display = 'none';

    bannerContent.style.position = 'absolute';
    bannerContent.style.inset = '0';
    bannerContent.style.zIndex = '2';
    bannerContent.style.display = 'flex';
    bannerContent.style.alignItems = 'center';
    bannerContent.style.justifyContent = 'center';
    bannerContent.style.padding = '0';

    banner.classList.add('las-home-banner-natural');
  }

  fixBanner();
  let tries = 0;
  const timer = setInterval(() => {
    fixBanner();
    tries++;
    if (tries > 30) clearInterval(timer);
  }, 250);
  const obs = new MutationObserver(fixBanner);
  obs.observe(document.body, { childList: true, subtree: true });
})();


/* ==========================================================
   11. COLECCIONES · TIGHTEN GAP
   ========================================================== */
(function () {
  function tighten() {
    const h1 = Array.from(document.querySelectorAll('h1'))
      .find(el => el.textContent.toLowerCase().includes('colecciones'));
    if (!h1) return;

    let next = h1.nextElementSibling;
    let steps = 0;
    while (next && steps < 3) {
      next.style.setProperty('margin-top', '0', 'important');
      next.style.setProperty('padding-top', '0', 'important');
      const inner = next.querySelector(':scope > *');
      if (inner) {
        inner.style.setProperty('margin-top', '0', 'important');
        inner.style.setProperty('padding-top', '0', 'important');
      }
      steps++;
      next = next.nextElementSibling;
    }
  }

  tighten();
  let tries = 0;
  const timer = setInterval(() => {
    tighten();
    tries++;
    if (tries > 20) clearInterval(timer);
  }, 300);
  const obs = new MutationObserver(tighten);
  obs.observe(document.body, { childList: true, subtree: true });
})();


/* ==========================================================
   12. OCULTAR BANNER FUERA DE HOME
   ========================================================== */
(function () {
  function handle() {
    const isHome = location.pathname === '/' || location.pathname === '/index.html';
    const bg = document.querySelector('.banner-background');
    const banner = bg ? bg.parentElement : null;
    if (!banner) return;
    banner.style.display = isHome ? '' : 'none';
  }

  handle();
  let tries = 0;
  const timer = setInterval(() => {
    handle();
    tries++;
    if (tries > 20) clearInterval(timer);
  }, 300);
})();


/* ==========================================================
   13. CARGA DE FUENTES · Inter completa + JetBrains Mono
   ========================================================== */
(function () {
  if (document.querySelector('link[data-las-font="loaded"]')) return;

  const pre1 = document.createElement('link');
  pre1.rel = 'preconnect';
  pre1.href = 'https://fonts.googleapis.com';
  pre1.setAttribute('data-las-font', 'loaded');
  document.head.appendChild(pre1);

  const pre2 = document.createElement('link');
  pre2.rel = 'preconnect';
  pre2.href = 'https://fonts.gstatic.com';
  pre2.crossOrigin = 'anonymous';
  document.head.appendChild(pre2);

  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@200;300;400&display=swap';
  document.head.appendChild(link);
})();


/* ==========================================================
   14. HOME · BANDA DE COORDENADAS
   ========================================================== */
(function () {
  function isHome() {
    return location.pathname === '/' || location.pathname === '/index.html';
  }
  if (!isHome()) return;

  function injectCoordsBar() {
    if (document.querySelector('.las-coords-bar')) return true;
    const bg = document.querySelector('.banner-background');
    const banner = bg ? bg.parentElement : null;
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
  const obs = new MutationObserver(() => { if (isHome()) injectCoordsBar(); });
  obs.observe(document.body, { childList: true, subtree: true });
})();


/* ==========================================================
   15. HOME · HERO TEXTUAL (claim + descripción + CTA)
   ========================================================== */
(function () {
  function isHome() {
    return location.pathname === '/' || location.pathname === '/index.html';
  }
  if (!isHome()) return;

  function injectHeroText() {
    if (document.querySelector('.las-hero-text')) return true;
    const bg = document.querySelector('.banner-background');
    const banner = bg ? bg.parentElement : null;
    if (!banner || !banner.parentElement) return false;

    const hero = document.createElement('section');
    hero.className = 'las-hero-text';

    hero.innerHTML =
      '<div class="las-hero-inner">' +
        '<h1 class="las-hero-claim">' +
          '<span class="las-line-1">' +
            'TU CUERPO EN<span class="las-break"></span>' +
            '<span class="las-outlined">TIERRA.</span>' +
          '</span>' +
          '<span class="las-line-2">' +
            'TU CABEZA EN<span class="las-break"></span>' +
            'EL <span class="las-accent">MAR.</span>' +
          '</span>' +
        '</h1>' +
        '<p class="las-hero-desc">Arte original sobre piezas que duran. Para los que se llevan el mar puesto al salir del agua.</p>' +
        '<div class="las-hero-cta-wrap">' +
          '<a href="/colecciones" class="las-hero-cta">' +
            '<span>NO ENTRES si no tienes curiosidad</span>' +
            '<span class="las-arrow">&rarr;</span>' +
          '</a>' +
        '</div>' +
      '</div>';

    if (banner.nextSibling) {
      banner.parentNode.insertBefore(hero, banner.nextSibling);
    } else {
      banner.parentNode.appendChild(hero);
    }
    return true;
  }

  injectHeroText();
  let tries = 0;
  const timer = setInterval(() => {
    tries++;
    if (injectHeroText() || tries >= 40) clearInterval(timer);
  }, 250);
  const obs = new MutationObserver(() => { if (isHome()) injectHeroText(); });
  obs.observe(document.body, { childList: true, subtree: true });
})();
