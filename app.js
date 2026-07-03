// Shared site chrome: mega menu (desktop), premium mobile menu, sticky bar,
// and a universal "form -> Ralph's WhatsApp" router (he doesn't use email).
(function () {
  'use strict';

  var RALPH_CELL = '13053324220';      // wa.me + tel
  var OFFICE_TEL = '+18482103121';

  // ---- Nav model (single source of truth for every page) ----
  var PANELS = {
    wigs: {
      groups: [
        { h: "Who It's For", links: [
          ['Sheitels', 'sheitels.html'], ['Kallah', 'kallah.html'], ['Medical', 'medical.html'],
          ['Golden Age', 'golden-age.html'], ['Beauty', 'beauty.html'], ['Film & Theatre', 'film-theatre.html']
        ]},
        { h: 'Pieces & More', links: [
          ['Toppers & Falls', 'toppers-falls.html'], ['How to Buy', 'how-to-buy.html']
        ]}
      ],
      feature: { img: 'images/mega-wigs.jpg', span: 'Not sure where to start', strong: 'Find Your Ralph →', href: 'quiz.html' }
    },
    house: {
      groups: [
        { h: 'The House', links: [
          ['Meet Ralph', 'atelier.html'], ['How to Buy', 'how-to-buy.html'], ['Heritage', 'index.html#heritage'],
          ['Warranty', 'warranty.html'], ['Refresh & Repair', 'refresh.html']
        ]}
      ],
      feature: { img: 'images/real-atelier.jpg', span: 'Atelier-direct since 1966', strong: 'Meet Ralph →', href: 'atelier.html' }
    },
    tour: {
      groups: [
        { h: 'The Pop-Up Tour', links: [
          ['All Tour Stops', 'tour.html'], ['Flatbush', 'flatbush.html'], ['Boro Park', 'boro-park.html'],
          ['Lakewood', 'lakewood.html'], ['Monsey', 'monsey.html'], ['Five Towns', 'five-towns.html']
        ]},
        { h: 'More Cities', links: [
          ['Queens', 'queens.html'], ['Teaneck', 'teaneck.html'], ['Passaic', 'passaic.html'],
          ['Baltimore', 'baltimore.html'], ['Boston', 'boston.html'], ['Union', 'union.html']
        ]}
      ],
      feature: { img: 'images/mega-tour.jpg', span: 'Coming to your city', strong: 'Join the Pop-Up List →', href: 'index.html#vip' }
    }
  };
  var LEFT = [['Wigs', 'wigs'], ['The House', 'house']];
  var RIGHT = [['The Tour', 'tour'], ['Become a Dealer', 'dealers.html'], ['Contact', 'contact.html']];

  function el(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }

  // ---- Desktop mega menu ----
  function buildPanel(key) {
    var data = PANELS[key];
    var panel = el('div', 'mega-panel'); panel.dataset.panel = key;
    var inner = el('div', 'mega-inner');
    var groups = el('div', 'mega-groups');
    data.groups.forEach(function (g) {
      var col = el('div', 'mega-col');
      col.appendChild(el('h5', null, g.h));
      g.links.forEach(function (l) { var a = el('a', null, l[0]); a.href = l[1]; col.appendChild(a); });
      groups.appendChild(col);
    });
    inner.appendChild(groups);
    if (data.feature) {
      var f = data.feature, feat = el('a', 'mega-feature'); feat.href = f.href;
      var img = el('img'); img.src = f.img; img.alt = ''; img.loading = 'lazy'; feat.appendChild(img);
      feat.appendChild(el('div', 'mf-cap', '<span>' + f.span + '</span><strong>' + f.strong + '</strong>'));
      inner.appendChild(feat);
    }
    panel.appendChild(inner);
    return panel;
  }
  function buildTrigger(label, target) {
    if (PANELS[target]) {
      var item = el('span', 'mega-item');
      var btn = el('button', 'mega-trigger', label + '<span class="caret"></span>');
      btn.type = 'button'; btn.setAttribute('aria-haspopup', 'true'); btn.setAttribute('aria-expanded', 'false');
      item.appendChild(btn); item.dataset.panel = target; return item;
    }
    var a = el('a', null, label); a.href = target; return a;
  }
  function initMegaMenu() {
    var header = document.getElementById('header'); if (!header) return;
    var left = header.querySelector('.nav-links.left'), right = header.querySelector('.nav-links.right');
    if (!left || !right) return;
    left.innerHTML = ''; right.innerHTML = '';
    LEFT.forEach(function (t) { left.appendChild(buildTrigger(t[0], t[1])); });
    RIGHT.forEach(function (t) { right.appendChild(buildTrigger(t[0], t[1])); });
    var panels = {};
    Object.keys(PANELS).forEach(function (k) { var p = buildPanel(k); panels[k] = p; header.appendChild(p); });
    var openKey = null, closeTimer = null;
    function open(key) {
      clearTimeout(closeTimer);
      if (openKey && openKey !== key) close(openKey);
      openKey = key; panels[key].classList.add('open');
      var item = header.querySelector('.mega-item[data-panel="' + key + '"]');
      if (item) { item.classList.add('active'); item.querySelector('.mega-trigger').setAttribute('aria-expanded', 'true'); }
    }
    function close(key) {
      key = key || openKey; if (!key) return;
      panels[key].classList.remove('open');
      var item = header.querySelector('.mega-item[data-panel="' + key + '"]');
      if (item) { item.classList.remove('active'); item.querySelector('.mega-trigger').setAttribute('aria-expanded', 'false'); }
      if (key === openKey) openKey = null;
    }
    function scheduleClose() { clearTimeout(closeTimer); closeTimer = setTimeout(function () { if (openKey) close(openKey); }, 180); }
    header.querySelectorAll('.mega-item').forEach(function (item) {
      var key = item.dataset.panel, panel = panels[key];
      item.addEventListener('mouseenter', function () { open(key); });
      item.addEventListener('mouseleave', scheduleClose);
      panel.addEventListener('mouseenter', function () { clearTimeout(closeTimer); });
      panel.addEventListener('mouseleave', scheduleClose);
      item.querySelector('.mega-trigger').addEventListener('click', function (e) { e.preventDefault(); if (openKey === key) close(key); else open(key); });
    });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && openKey) close(openKey); });
    document.addEventListener('click', function (e) { if (openKey && !header.contains(e.target)) close(openKey); });
    window.addEventListener('scroll', function () { if (openKey) close(openKey); }, { passive: true });
  }

  // ---- Premium mobile menu (accordion + phone-first CTA) ----
  function initMobileMenu() {
    var mm = document.getElementById('mobileMenu'); if (!mm) return;
    var SECTIONS = [
      { h: 'Wigs & Pieces', links: PANELS.wigs.groups[0].links.concat(PANELS.wigs.groups[1].links) },
      { h: 'The House', links: PANELS.house.groups[0].links },
      { h: 'The Tour', links: PANELS.tour.groups[0].links.concat(PANELS.tour.groups[1].links) }
    ];
    var html = '';
    html += '<button class="mm-close" id="mmClose" aria-label="Close">&times;</button>';
    html += '<a class="mm-brand" href="index.html">RALPH</a>';
    html += '<div class="mm-tagline">The Most Beautiful Wigs in the World</div>';
    html += '<div class="mm-cta">';
    html += '<a class="mm-call" href="tel:+' + RALPH_CELL + '">Call Ralph · (305) 332-4220</a>';
    html += '<div class="mm-cta2"><a href="tel:' + OFFICE_TEL + '">Office</a><a href="https://wa.me/' + RALPH_CELL + '" target="_blank" rel="noopener">WhatsApp</a></div>';
    html += '</div>';
    html += '<div class="mm-acc">';
    SECTIONS.forEach(function (s) {
      html += '<div class="mm-sec"><button class="mm-head" type="button">' + s.h + '<span class="caret"></span></button><div class="mm-links"><div class="mm-links-inner">';
      s.links.forEach(function (l) { html += '<a href="' + l[1] + '">' + l[0] + '</a>'; });
      html += '</div></div></div>';
    });
    html += '<a class="mm-flat" href="dealers.html">Become a Dealer</a>';
    html += '<a class="mm-flat" href="contact.html">Contact</a>';
    html += '</div>';
    mm.innerHTML = html;

    function close() { mm.classList.remove('open'); document.body.style.overflow = ''; }
    mm.querySelector('#mmClose').addEventListener('click', close);
    mm.querySelectorAll('.mm-links a, .mm-flat, .mm-brand').forEach(function (a) { a.addEventListener('click', close); });
    mm.querySelectorAll('.mm-sec').forEach(function (sec) {
      sec.querySelector('.mm-head').addEventListener('click', function () {
        var open = sec.classList.contains('open');
        mm.querySelectorAll('.mm-sec').forEach(function (s) { s.classList.remove('open'); s.querySelector('.mm-links').style.maxHeight = null; });
        if (!open) { sec.classList.add('open'); var lk = sec.querySelector('.mm-links'); lk.style.maxHeight = lk.scrollHeight + 'px'; }
      });
    });
  }

  // ---- Universal form -> Ralph's WhatsApp (capture phase overrides any inline handler) ----
  function fieldLabel(f) {
    return f.getAttribute('data-label') || f.getAttribute('placeholder') ||
      (f.getAttribute('aria-label')) || (f.name ? f.name.replace(/[-_]/g, ' ') : 'Field');
  }
  function formToText(form) {
    var lines = [], hasFile = false;
    Array.prototype.forEach.call(form.elements, function (f) {
      var tag = f.tagName, type = (f.type || '').toLowerCase();
      if (tag === 'BUTTON' || type === 'submit' || type === 'button' || type === 'hidden') return;
      if (type === 'file') { if (f.files && f.files.length) hasFile = true; return; }
      var val = (f.value || '').trim();
      if (!val) return;
      if (type === 'checkbox' || type === 'radio') { if (!f.checked) return; }
      lines.push('• ' + fieldLabel(f) + ': ' + val);
    });
    var what = form.getAttribute('data-form') || (document.title.split('—')[0] || 'Website').trim();
    var msg = 'Hi Ralph — new message from the website (' + what + '):\n\n' + lines.join('\n');
    if (hasFile) msg += '\n\n(I have a photo to send too.)';
    return msg;
  }
  function initForms() {
    document.addEventListener('submit', function (e) {
      var form = e.target;
      if (!form || form.tagName !== 'FORM' || form.hasAttribute('data-no-wa')) return;
      e.preventDefault();
      e.stopImmediatePropagation();
      if (typeof form.checkValidity === 'function' && !form.checkValidity()) { form.reportValidity(); return; }
      var url = 'https://wa.me/' + RALPH_CELL + '?text=' + encodeURIComponent(formToText(form));
      window.open(url, '_blank', 'noopener');
      // graceful confirmation
      var note = form.parentNode.querySelector('.wa-sent');
      if (!note) { note = el('div', 'wa-sent'); form.parentNode.insertBefore(note, form.nextSibling); }
      note.innerHTML = 'Opening WhatsApp — just press <strong>send</strong> and it reaches Ralph’s phone right away. ' +
        'Didn’t open? <a href="' + url + '" target="_blank" rel="noopener">Tap here</a>.';
      form.reset();
    }, true); // capture
  }

  // ---- Sticky mobile conversion bar (phone-first) ----
  function initMobileBar() {
    if (document.querySelector('.mbar')) return;
    var bar = el('div', 'mbar');
    bar.innerHTML =
      '<a href="tel:+' + RALPH_CELL + '" class="mbar-mid">Call Ralph</a>' +
      '<a href="tel:' + OFFICE_TEL + '">Office</a>' +
      '<a href="https://wa.me/' + RALPH_CELL + '" target="_blank" rel="noopener">WhatsApp</a>';
    document.body.appendChild(bar);
  }

  // ---- Active nav state (highlight the current page's top-level item) ----
  function initActiveNav() {
    var header = document.getElementById('header'); if (!header) return;
    var page = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
    if (!page) page = 'index.html';
    function fileOf(href) { return ((href || '').split('#')[0].split('/').pop() || '').toLowerCase(); }
    header.querySelectorAll('.mega-item').forEach(function (item) {
      var data = PANELS[item.dataset.panel]; if (!data) return;
      var hit = data.groups.some(function (g) { return g.links.some(function (l) { return fileOf(l[1]) === page; }); });
      if (hit) item.classList.add('navnow');
    });
    header.querySelectorAll('.nav-links a').forEach(function (a) {
      if (page !== 'index.html' && fileOf(a.getAttribute('href')) === page) a.classList.add('navnow');
    });
  }

  function init() { initMegaMenu(); initActiveNav(); initMobileMenu(); initForms(); initMobileBar(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
