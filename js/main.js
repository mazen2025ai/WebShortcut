/* ============================================================
   WebShortcut — main.js (vanilla JS, no dependencies)
   - sticky nav + mobile menu
   - scroll reveal + animated counters
   - hero "chat with your ERP" console animation
   - FAQ accordion
   - contact form -> send_email.php
   ============================================================ */
(function () {
  'use strict';

  var mylog = function () {
    if (window.console && window.location.search.indexOf('debug=1') !== -1) {
      console.log.apply(console, ['[ws]'].concat([].slice.call(arguments)));
    }
  };
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Nav ---------- */
  var nav = document.getElementById('siteNav');
  var toTop = document.getElementById('toTop');
  function onScroll() {
    var y = window.scrollY || window.pageYOffset;
    nav.classList.toggle('scrolled', y > 50);
    if (toTop) toTop.classList.toggle('show', y > 600);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  var hamburger = document.getElementById('hamburger');
  var mobileMenu = document.getElementById('mobileMenu');
  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', function () {
      var open = mobileMenu.classList.toggle('open');
      hamburger.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    mobileMenu.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        mobileMenu.classList.remove('open');
        hamburger.setAttribute('aria-expanded', 'false');
      });
    });
  }
  if (toTop) {
    toTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
    });
  }

  /* ---------- Smooth anchor scroll (offset for sticky nav) ---------- */
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      var id = this.getAttribute('href');
      if (id.length < 2) return;
      var target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      var top = target.getBoundingClientRect().top + window.pageYOffset - 70;
      window.scrollTo({ top: top, behavior: reduceMotion ? 'auto' : 'smooth' });
      if (history.pushState) history.pushState(null, '', id);
    });
  });

  /* ---------- Scroll reveal ---------- */
  var revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08 });
    revealEls.forEach(function (el) { revealObserver.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('visible'); });
  }

  /* ---------- Animated counters ---------- */
  function animateCount(el) {
    var target = parseInt(el.getAttribute('data-count'), 10);
    var suffix = el.getAttribute('data-suffix') || '';
    if (isNaN(target)) return;
    if (el.getAttribute('data-plain') === '1' || reduceMotion) { el.textContent = target + suffix; return; }
    var start = null, duration = 1400;
    function step(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / duration, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased) + suffix;
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  var counters = document.querySelectorAll('.stat-number[data-count]');
  if ('IntersectionObserver' in window) {
    var countObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { animateCount(entry.target); countObserver.unobserve(entry.target); }
      });
    }, { threshold: 0.5 });
    counters.forEach(function (el) { countObserver.observe(el); });
  } else {
    counters.forEach(animateCount);
  }

  /* ---------- Hero AI console ---------- */
  var consoleBody = document.getElementById('consoleBody');
  if (consoleBody) {
    var scenarios = [
      {
        q: "What's our cash position today?",
        title: 'Cash position · all banks and cash boxes',
        rows: [
          ['Cash & banks (USD accounts)', 'USD 184,300', 'good'],
          ['Cash & banks (LBP accounts)', 'LBP 2.14 B', 'good'],
          ['Cheques due this week', '3 · USD 12,750', 'warn'],
          ['Cash covers payables for', '1.4 months', '']
        ],
        foot: 'Two suppliers are 49% of purchases. Want the aged payables?'
      },
      {
        q: 'Which items run out in the next 30 days?',
        title: 'Stockout risk · main warehouse · next 30 days',
        rows: [
          ['Olive oil 1 L', '9 days of cover', 'bad'],
          ['Flour 50 kg', '14 days of cover', 'warn'],
          ['Paper cups 12 oz', '22 days of cover', 'warn'],
          ['On order already', '2 of 3 items', '']
        ],
        foot: 'A purchase plan grouped by supplier is ready to review.'
      },
      {
        q: 'Prepare the VAT return for Q3.',
        title: 'VAT return · Q3 2026 · from the general ledger',
        rows: [
          ['Output VAT (sales)', 'USD 41,200', ''],
          ['Input VAT (purchases)', 'USD 27,950', ''],
          ['Net VAT payable', 'USD 13,250', 'warn'],
          ['Article 59 exempt sales', 'kept separate', 'good']
        ],
        foot: 'Effective rate checks out against taxable sales. Export the worksheet?'
      },
      {
        q: 'Who stopped buying from us this year?',
        title: 'Inactive customers · bought in 2025, nothing in 2026',
        rows: [
          ['Dar Al Salam Pharmacy', 'last order Feb 2026', 'bad'],
          ['Mount Trading SARL', 'last order Mar 2026', 'warn'],
          ['Blue Café', 'last order Apr 2026', 'warn'],
          ['Revenue at risk', 'USD 38,400 / yr', '']
        ],
        foot: 'Win-back list sent to the sales team with last prices.'
      }
    ];
    var idx = 0;
    var timers = [];
    function later(fn, ms) { timers.push(setTimeout(fn, ms)); }
    function clearTimers() { timers.forEach(clearTimeout); timers = []; }

    function el(tag, cls, html) {
      var n = document.createElement(tag);
      if (cls) n.className = cls;
      if (html !== undefined) n.innerHTML = html;
      return n;
    }
    function escapeHtml(s) {
      return String(s).replace(/[&<>"']/g, function (c) {
        return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
      });
    }

    function runScenario(s) {
      consoleBody.innerHTML = '';
      // user message, typed
      var user = el('div', 'msg user');
      user.appendChild(el('div', 'avatar', 'YOU'));
      var bubble = el('div', 'bubble');
      var text = el('span');
      var cursor = el('span', 'cursor');
      bubble.appendChild(text); bubble.appendChild(cursor);
      user.appendChild(bubble);
      consoleBody.appendChild(user);

      var i = 0;
      var typeDelay = reduceMotion ? 0 : 38;
      function type() {
        if (i <= s.q.length) {
          text.textContent = s.q.slice(0, i);
          i++;
          later(type, typeDelay);
        } else {
          later(showThinking, 350);
        }
      }
      function showThinking() {
        cursor.style.display = 'none';
        var ai = el('div', 'msg ai');
        ai.appendChild(el('div', 'avatar', 'AI'));
        var b = el('div', 'bubble');
        b.appendChild(el('div', 'thinking', '<span></span><span></span><span></span>'));
        ai.appendChild(b);
        consoleBody.appendChild(ai);
        later(function () { showAnswer(b); }, reduceMotion ? 50 : 900);
      }
      function showAnswer(b) {
        b.innerHTML = '';
        b.appendChild(el('div', 'ai-title', escapeHtml(s.title)));
        var rows = [];
        s.rows.forEach(function (r) {
          var row = el('div', 'ai-row');
          row.appendChild(el('span', 'k', escapeHtml(r[0])));
          row.appendChild(el('span', 'v' + (r[2] ? ' ' + r[2] : ''), escapeHtml(r[1])));
          b.appendChild(row);
          rows.push(row);
        });
        var foot = el('div', 'ai-foot', escapeHtml(s.foot));
        b.appendChild(foot);
        rows.forEach(function (row, n) { later(function () { row.classList.add('in'); }, 120 + n * 160); });
        later(function () { foot.classList.add('in'); }, 120 + rows.length * 160 + 200);
        later(next, reduceMotion ? 6000 : 6500);
      }
      type();
    }
    function next() {
      clearTimers();
      idx = (idx + 1) % scenarios.length;
      runScenario(scenarios[idx]);
    }
    // Pause when tab hidden to save CPU; resume on return.
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) { clearTimers(); } else { runScenario(scenarios[idx]); }
    });
    runScenario(scenarios[idx]);
    mylog('console animation started', scenarios.length, 'scenarios');
  }

  /* ---------- FAQ accordion ---------- */
  var faqList = document.getElementById('faqList');
  if (faqList) {
    faqList.querySelectorAll('.faq-item').forEach(function (item) {
      var btn = item.querySelector('.faq-q');
      var panel = item.querySelector('.faq-a');
      btn.addEventListener('click', function () {
        var isOpen = item.classList.contains('open');
        faqList.querySelectorAll('.faq-item.open').forEach(function (o) {
          o.classList.remove('open');
          o.querySelector('.faq-a').style.maxHeight = null;
          o.querySelector('.faq-q').setAttribute('aria-expanded', 'false');
        });
        if (!isOpen) {
          item.classList.add('open');
          panel.style.maxHeight = panel.scrollHeight + 'px';
          btn.setAttribute('aria-expanded', 'true');
        }
      });
    });
  }

  /* ---------- Contact form ---------- */
  var form = document.getElementById('ctaForm');
  if (form) {
    var errorBox = document.getElementById('formError');
    function showError(msg) { errorBox.textContent = msg; errorBox.classList.add('show'); }
    function clearError() { errorBox.textContent = ''; errorBox.classList.remove('show'); }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      clearError();
      var name = form.name.value.trim();
      var org = form.organization.value.trim();
      var email = form.email.value.trim();
      var interest = form.interest.value;
      if (!name || !org || !email || !interest) { showError('Please fill in your name, company, email and interest.'); return; }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { showError('Please enter a valid email address.'); return; }

      var btn = form.querySelector('button[type="submit"]');
      var originalText = btn.textContent;
      btn.textContent = 'Sending…';
      btn.disabled = true;

      fetch('send_email.php', { method: 'POST', body: new FormData(form) })
        .then(function (res) { return res.json(); })
        .then(function (data) {
          mylog('send_email response', data);
          if (data && data.success) {
            document.getElementById('ctaFormArea').style.display = 'none';
            document.getElementById('ctaSuccess').classList.add('show');
          } else {
            showError((data && data.message) || 'Something went wrong. Please try again.');
            btn.textContent = originalText;
            btn.disabled = false;
          }
        })
        .catch(function (err) {
          mylog('send_email failed', err);
          showError('Could not send your message. Please email us directly at info@unodotnet.com or call +961 1 648 440.');
          btn.textContent = originalText;
          btn.disabled = false;
        });
    });
  }

  /* ---------- Footer year ---------- */
  var year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();
})();
