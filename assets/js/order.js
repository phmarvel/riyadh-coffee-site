// Pickup pre-order form: validates the fields, builds a wa.me link in the page language and opens it.
// Labels, errors and status texts live in each page's HTML; only the WhatsApp message templates are here.
(function () {
  var TEMPLATES = {
    ar: 'السلام عليكم، أودّ الطلب المسبق للاستلام من نجد كوفي.\nالفرع: {branch}\nالاسم: {name}\nالطلب: {items}\nوقت الاستلام: {time}',
    en: 'Hello, I would like to pre-order for pickup from Najd Coffee.\nBranch: {branch}\nName: {name}\nOrder: {items}\nPickup time: {time}'
  };
  var FIELDS = ['branch', 'name', 'items', 'time'];

  var form = document.getElementById('order-form');
  if (!form) return;

  var lang = /^ar/i.test(document.documentElement.lang || '') ? 'ar' : 'en';
  var submit = document.getElementById('order-submit');
  var status = document.getElementById('order-status');
  var fallback = document.getElementById('order-fallback');
  var unavailable = document.getElementById('order-branch-unavailable');
  var baseDescribedBy = {};

  function field(key) { return document.getElementById('order-' + key); }
  function errorOf(key) { return document.getElementById('order-' + key + '-error'); }

  // "14:30" -> "2:30 PM" / "2:30 م"
  function formatTime(value) {
    var m = /^(\d{1,2}):(\d{2})/.exec(value);
    if (!m) return value;
    var h = parseInt(m[1], 10);
    var suffix = h < 12 ? (lang === 'ar' ? 'ص' : 'AM') : (lang === 'ar' ? 'م' : 'PM');
    return ((h % 12) || 12) + ':' + m[2] + ' ' + suffix;
  }

  function buildMessage(v) {
    return TEMPLATES[lang].replace(/\{(branch|name|items|time)\}/g, function (_, k) { return v[k]; });
  }

  function buildUrl(phone, text) {
    return 'https://wa.me/' + phone + '?text=' + encodeURIComponent(text);
  }

  function clearError(key) {
    var el = field(key);
    var err = errorOf(key);
    if (err) err.hidden = true;
    if (key === 'branch' && unavailable) unavailable.hidden = true;
    el.removeAttribute('aria-invalid');
    if (baseDescribedBy[key]) el.setAttribute('aria-describedby', baseDescribedBy[key]);
    else el.removeAttribute('aria-describedby');
  }

  function showError(key, err) {
    var el = field(key);
    err.hidden = false;
    el.setAttribute('aria-invalid', 'true');
    el.setAttribute('aria-describedby', (baseDescribedBy[key] ? baseDescribedBy[key] + ' ' : '') + err.id);
  }

  FIELDS.forEach(function (key) {
    var el = field(key);
    baseDescribedBy[key] = el.getAttribute('aria-describedby') || '';
    el.addEventListener('input', function () { clearError(key); });
    el.addEventListener('change', function () { clearError(key); });
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    FIELDS.forEach(clearError);
    status.hidden = true;
    fallback.hidden = true;

    var branchSelect = field('branch');
    var option = branchSelect.options[branchSelect.selectedIndex];
    var values = {
      branch: branchSelect.value,
      name: field('name').value.trim(),
      items: field('items').value.trim(),
      time: field('time').value
    };
    var cfg = (window.NAJD_CONFIG && window.NAJD_CONFIG.branches) || {};
    var phone = values.branch && Object.prototype.hasOwnProperty.call(cfg, values.branch) ? cfg[values.branch] : '';

    var firstBad = null;
    FIELDS.forEach(function (key) {
      var err = null;
      if (!values[key]) err = errorOf(key);
      else if (key === 'branch' && !phone) err = unavailable;
      if (err) {
        showError(key, err);
        if (!firstBad) firstBad = field(key);
      }
    });
    if (firstBad) {
      firstBad.focus();
      return;
    }

    var url = buildUrl(phone, buildMessage({
      branch: option.text.trim(),
      name: values.name,
      items: values.items,
      time: formatTime(values.time)
    }));

    submit.disabled = true;
    setTimeout(function () { submit.disabled = false; }, 1000);

    var w = window.open(url, '_blank');
    if (w) {
      try { w.opener = null; } catch (err) { /* cross-origin window: nothing to detach */ }
      status.hidden = false;
    } else {
      fallback.href = url;
      fallback.hidden = false;
    }
  });
})();
