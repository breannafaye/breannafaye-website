(function () {
  var cursor = document.getElementById('cursor');
  var menu = document.querySelector('.menu');
  var menuHover = false;

  function syncCursor(x, y) {
    if (!cursor) return;
    cursor.style.transform = 'translate(' + (x + 10) + 'px,' + (y + 8) + 'px)';
    cursor.style.opacity = menuHover ? '0' : '1';
  }

  document.addEventListener('pointermove', function (e) {
    syncCursor(e.clientX, e.clientY);
  }, { passive: true });

  if (!menu) return;

  function setLit(on) {
    menu.classList.toggle('is-lit', !!on);
    menu.setAttribute('aria-pressed', on ? 'true' : 'false');
  }

  menu.addEventListener('pointerenter', function () {
    menuHover = true;
    setLit(true);
    if (cursor) cursor.style.opacity = '0';
  });

  menu.addEventListener('pointerleave', function () {
    menuHover = false;
    setLit(false);
  });

  menu.addEventListener('pointerdown', function () {
    menuHover = true;
    setLit(true);
    if (cursor) cursor.style.opacity = '0';
  });

  function goHome() {
    try { sessionStorage.setItem('bf-home-unlocked', '1'); } catch (err) {}
    window.location.href = 'index.html';
  }

  menu.addEventListener('click', function (e) {
    e.preventDefault();
    setLit(true);
    goHome();
  });

  menu.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setLit(true);
      goHome();
    }
  });
})();
