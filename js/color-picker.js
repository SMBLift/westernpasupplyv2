/* ========================================
   Color Picker — Client Preview Tool
   Remove this script before go-live.
   ======================================== */
(function() {
  'use strict';

  var SCHEMES = [
    {
      name: 'Current (Steel Gray)',
      tag: 'current',
      accent: '#556063',
      accentDark: '#3F484B',
      accentLight: '#D4DADB',
      desc: 'The existing neutral gray accent'
    },
    {
      name: 'Industrial Orange',
      tag: 'orange',
      accent: '#E65C00',
      accentDark: '#B84A00',
      accentLight: '#FDDCC8',
      desc: 'Construction & safety — makes CTAs pop'
    },
    {
      name: 'Pittsburgh Gold',
      tag: 'gold',
      accent: '#F4B41A',
      accentDark: '#C8930E',
      accentLight: '#FDF0D0',
      desc: 'Steel City pride — rugged & industrial'
    },
    {
      name: 'Brick Red',
      tag: 'red',
      accent: '#A8322D',
      accentDark: '#862723',
      accentLight: '#F0D5D4',
      desc: 'Masonry & brick — traditional & grounded'
    },
    {
      name: 'Steel Blue',
      tag: 'blue',
      accent: '#4A6984',
      accentDark: '#37506A',
      accentLight: '#D3DEE7',
      desc: 'Trust & professionalism — corporate B2B'
    },
    {
      name: 'Burnt Copper',
      tag: 'copper',
      accent: '#B85014',
      accentDark: '#953F0F',
      accentLight: '#F3D4BE',
      desc: 'V1 Variant A/D — warm, earthy orange'
    },
    {
      name: 'Warm Amber',
      tag: 'amber',
      accent: '#C46A2D',
      accentDark: '#A35623',
      accentLight: '#F5D9C3',
      desc: 'V1 Variant B — softer, golden amber'
    },
    {
      name: 'Deep Teal',
      tag: 'teal',
      accent: '#123747',
      accentDark: '#0C2530',
      accentLight: '#C4D7DF',
      desc: 'V1 Variant E — cool, professional depth'
    },
    {
      name: 'Rustic Terracotta',
      tag: 'terracotta',
      accent: '#B95B2D',
      accentDark: '#944923',
      accentLight: '#F3D6C5',
      desc: 'V1 Variant F — earthy, rugged warmth'
    }
  ];

  var saved = localStorage.getItem('wpa-color-scheme');
  var activeIndex = 0;
  if (saved) {
    for (var i = 0; i < SCHEMES.length; i++) {
      if (SCHEMES[i].tag === saved) { activeIndex = i; break; }
    }
  }

  // The override style tag — this is the only thing that changes colors on the page.
  // No DOM querying, no inline styles, no conflicts with Tailwind.
  var overrideStyle = document.createElement('style');
  overrideStyle.id = 'cp-color-overrides';
  document.head.appendChild(overrideStyle);

  function applyScheme(index) {
    activeIndex = index;
    var s = SCHEMES[index];
    localStorage.setItem('wpa-color-scheme', s.tag);

    // Generate CSS that overrides Tailwind's accent utilities
    // Using !important to beat Tailwind's generated specificity
    overrideStyle.textContent =
      '.bg-accent:not(#color-picker-panel *) { background-color: ' + s.accent + ' !important; }\n' +
      '.bg-accent-dark:not(#color-picker-panel *) { background-color: ' + s.accentDark + ' !important; }\n' +
      '.bg-accent-light:not(#color-picker-panel *) { background-color: ' + s.accentLight + ' !important; }\n' +
      '.text-accent:not(#color-picker-panel *) { color: ' + s.accent + ' !important; }\n' +
      '.text-accent-dark:not(#color-picker-panel *) { color: ' + s.accentDark + ' !important; }\n' +
      '.text-accent-light:not(#color-picker-panel *) { color: ' + s.accentLight + ' !important; }\n' +
      '.border-accent:not(#color-picker-panel *) { border-color: ' + s.accent + ' !important; }\n' +
      '.border-accent-dark:not(#color-picker-panel *) { border-color: ' + s.accentDark + ' !important; }\n' +
      '.border-accent-light:not(#color-picker-panel *) { border-color: ' + s.accentLight + ' !important; }\n' +
      '.hover\\:bg-accent-dark:hover { background-color: ' + s.accentDark + ' !important; }\n' +
      '.hover\\:bg-accent:hover { background-color: ' + s.accent + ' !important; }\n' +
      '.hover\\:text-accent:hover { color: ' + s.accent + ' !important; }\n' +
      '.focus-visible\\:ring-accent:focus-visible { --tw-ring-color: ' + s.accent + ' !important; }\n' +
      '.focus\\:ring-accent:focus { --tw-ring-color: ' + s.accent + ' !important; }\n' +
      '.nav-link::after { background-color: ' + s.accent + ' !important; }\n' +
      '.review-dot:hover { background: ' + s.accent + ' !important; }\n';

    updatePickerUI();
  }

  function updatePickerUI() {
    var options = document.querySelectorAll('#cp-options .cp-option');
    for (var i = 0; i < options.length; i++) {
      if (i === activeIndex) {
        options[i].classList.add('cp-active');
      } else {
        options[i].classList.remove('cp-active');
      }
    }
  }

  function buildPicker() {
    var panel = document.createElement('div');
    panel.id = 'color-picker-panel';
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-label', 'Accent color picker');

    // All styles use cp- prefix to avoid any collision with page classes
    var html = '<style>' +
      '#color-picker-panel { position:fixed; bottom:80px; right:20px; z-index:99999; font-family:"DM Sans",system-ui,sans-serif; }' +
      '#cp-toggle-btn { width:52px; height:52px; border-radius:50%; border:3px solid #fff; background:linear-gradient(135deg,#E65C00,#F4B41A,#A8322D,#4A6984); cursor:pointer; box-shadow:0 4px 20px rgba(0,0,0,0.25); display:flex; align-items:center; justify-content:center; margin-left:auto; position:relative; }' +
      '#cp-toggle-btn:hover { transform:scale(1.1); }' +
      '#cp-toggle-btn svg { width:24px; height:24px; fill:white; filter:drop-shadow(0 1px 2px rgba(0,0,0,0.3)); }' +
      '#cp-drawer { background:#fff; border-radius:16px; box-shadow:0 8px 40px rgba(0,0,0,0.18),0 2px 8px rgba(0,0,0,0.08); margin-bottom:12px; width:300px; max-height:0; overflow:hidden; opacity:0; transition:max-height 0.35s ease,opacity 0.25s,padding 0.35s; padding:0 20px; }' +
      '#cp-drawer.cp-open { max-height:80vh; opacity:1; padding:20px; overflow-y:auto; }' +
      '.cp-title { font-size:13px; font-weight:700; text-transform:uppercase; letter-spacing:0.08em; color:#1B2118; margin-bottom:4px; }' +
      '.cp-subtitle { font-size:11px; color:#5A5A5A; margin-bottom:16px; line-height:1.4; }' +
      '.cp-option { display:flex; align-items:center; gap:12px; padding:10px 12px; border-radius:10px; cursor:pointer; border:2px solid transparent; margin-bottom:6px; }' +
      '.cp-option:hover { background:#f5f5f2; }' +
      '.cp-option.cp-active { border-color:#2F5733; background:#EBF3EC; }' +
      '.cp-swatch { width:36px; height:36px; border-radius:8px; flex-shrink:0; border:2px solid rgba(0,0,0,0.08); position:relative; display:flex; align-items:center; justify-content:center; }' +
      '.cp-swatch svg { width:18px; height:18px; display:none; }' +
      '.cp-option.cp-active .cp-swatch svg { display:block; }' +
      '.cp-label { font-size:13px; font-weight:600; color:#1B2118; line-height:1.3; }' +
      '.cp-desc { font-size:11px; color:#5A5A5A; line-height:1.3; margin-top:1px; }' +
      '.cp-badge { position:absolute; top:-6px; right:-6px; background:#E65C00; color:#fff; font-size:9px; font-weight:700; padding:2px 5px; border-radius:6px; letter-spacing:0.05em; text-transform:uppercase; box-shadow:0 2px 6px rgba(0,0,0,0.15); }' +
      '.cp-note { margin-top:14px; padding-top:12px; border-top:1px solid #E0E0D8; font-size:10px; color:#888; text-align:center; line-height:1.4; }' +
      '@media(max-width:400px){ #color-picker-panel{right:10px;bottom:90px;} #cp-drawer{width:280px;} }' +
      '</style>';

    html += '<div id="cp-drawer">';
    html += '<div class="cp-title">Choose Accent Color</div>';
    html += '<div class="cp-subtitle">Click a color to preview it across the entire site. Your choice is saved automatically.</div>';
    html += '<div id="cp-options">';

    for (var i = 0; i < SCHEMES.length; i++) {
      var s = SCHEMES[i];
      var checkColor = (s.tag === 'gold' || s.tag === 'amber') ? '#1B2118' : '#ffffff';
      var activeClass = (i === activeIndex) ? ' cp-active' : '';

      html += '<div class="cp-option' + activeClass + '" role="button" tabindex="0" data-idx="' + i + '" aria-label="Select ' + s.name + ' accent color">';
      html += '<div class="cp-swatch" style="background:' + s.accent + ';">';
      html += '<svg viewBox="0 0 24 24" fill="none" stroke="' + checkColor + '" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>';
      html += '</div>';
      html += '<div><div class="cp-label">' + s.name + '</div><div class="cp-desc">' + s.desc + '</div></div>';
      html += '</div>';
    }

    html += '</div>';
    html += '<div class="cp-note">This tool is for preview only and will be removed before launch.</div>';
    html += '</div>';

    html += '<div style="display:flex;justify-content:flex-end;">';
    html += '<button id="cp-toggle-btn" aria-label="Toggle color picker" title="Toggle color picker">';
    html += '<svg viewBox="0 0 24 24"><path d="M12 22C6.49 22 2 17.51 2 12S6.49 2 12 2s10 4.04 10 9c0 3.31-2.69 6-6 6h-1.77c-.28 0-.5.22-.5.5 0 .12.05.23.13.33.41.47.64 1.06.64 1.67A2.5 2.5 0 0 1 12 22zm0-18c-4.41 0-8 3.59-8 8s3.59 8 8 8c.28 0 .5-.22.5-.5a.54.54 0 0 0-.14-.35c-.41-.46-.63-1.05-.63-1.65a2.5 2.5 0 0 1 2.5-2.5H16c2.21 0 4-1.79 4-4 0-3.86-3.59-7-8-7z"/><circle cx="6.5" cy="11.5" r="1.5"/><circle cx="9.5" cy="7.5" r="1.5"/><circle cx="14.5" cy="7.5" r="1.5"/><circle cx="17.5" cy="11.5" r="1.5"/></svg>';
    html += '<span class="cp-badge">NEW</span>';
    html += '</button></div>';

    panel.innerHTML = html;
    document.body.appendChild(panel);

    // Event: toggle drawer
    var isOpen = false;
    document.getElementById('cp-toggle-btn').addEventListener('click', function() {
      isOpen = !isOpen;
      var drawer = document.getElementById('cp-drawer');
      if (isOpen) {
        drawer.classList.add('cp-open');
      } else {
        drawer.classList.remove('cp-open');
      }
    });

    // Event: click options
    var optionEls = document.querySelectorAll('#cp-options .cp-option');
    for (var i = 0; i < optionEls.length; i++) {
      (function(idx) {
        optionEls[idx].addEventListener('click', function() { applyScheme(idx); });
        optionEls[idx].addEventListener('keydown', function(e) {
          if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); applyScheme(idx); }
        });
      })(i);
    }
  }

  function init() {
    try {
      buildPicker();
      if (activeIndex !== 0) {
        applyScheme(activeIndex);
      }
    } catch(e) {
      console.warn('Color picker error:', e);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
