// Mobile menu only. Without JavaScript the links simply stay visible.
(function () {
  var btn = document.querySelector('.nav-toggle');
  var list = document.getElementById('site-nav');
  if (!btn || !list) return;
  document.documentElement.classList.add('js');
  btn.hidden = false;
  function set(open) {
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    list.classList.toggle('is-open', open);
  }
  btn.addEventListener('click', function () {
    set(btn.getAttribute('aria-expanded') !== 'true');
  });
  list.addEventListener('click', function (e) {
    if (e.target.closest('a')) set(false);
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && btn.getAttribute('aria-expanded') === 'true') {
      set(false);
      btn.focus();
    }
  });
  document.addEventListener('click', function (e) {
    if (!e.target.closest('.site-header')) set(false);
  });
})();
