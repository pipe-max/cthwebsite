(function () {
  'use strict';

  var privacyUrl = 'https://heyzine.com/flip-book/b39d348efc.html';
  var areas = [
    {
      name: 'Recepción o asesoría general',
      icon: '💬',
      phone: '573223706702',
      reply: 'Gracias por comunicarte con Recepción, te escribe Sonia Franco. Por favor indícame tu nombre completo y cómo puedo apoyarte.'
    },
    {
      name: 'Admisiones',
      icon: '🎓',
      phone: '573206452599',
      reply: 'Gracias por comunicarte con Admisiones, te escribe Luz Elena Ostrovsky, líder de admisiones. Por favor indícame tu nombre completo y cómo puedo apoyarte.'
    },
    {
      name: 'Secretaría Académica',
      icon: '📚',
      phone: '573107152956',
      reply: 'Gracias por comunicarte con Secretaría Académica, te escribe Diana Restrepo, Secretaria Académica. Por favor indícame tu nombre completo y cómo puedo apoyarte.'
    },
    {
      name: 'Enfermería',
      icon: '🩺',
      phone: '573107888372',
      reply: 'Gracias por comunicarte con Enfermería, te escribe Verónica Hoyos, Enfermera. Por favor indícame tu nombre completo y cómo puedo apoyarte.'
    },
    {
      name: 'Transporte Escolar',
      icon: '🚌',
      phone: '573104969716',
      reply: 'Gracias por comunicarte con el servicio de Transporte Escolar, te escribe Camilo López, Coordinador de Transporte. Por favor indícame tu nombre completo y cómo puedo apoyarte.'
    },
    {
      name: 'Sistemas y soporte tecnológico',
      icon: '💻',
      phone: '573156043903',
      reply: 'Gracias por comunicarte con Sistemas y Soporte Tecnológico, te escribe Juan Camilo Ramírez, líder de Sistemas. Por favor indícame tu nombre completo y cómo puedo apoyarte.'
    },
    {
      name: 'Restaurante Escolar',
      icon: '🍽️',
      phone: '573104149958',
      reply: 'Gracias por comunicarte con el servicio de Restaurante Escolar. Por favor indícame tu nombre completo y cómo puedo apoyarte.'
    }
  ];

  var overlay;
  var panel;
  var previousFocus;

  function escapeHtml(value) {
    return value.replace(/[&<>'"]/g, function (char) {
      return {'&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'}[char];
    });
  }

  function shell(content, step) {
    panel.innerHTML =
      '<div class="wa-menu-head">' +
        '<div class="wa-menu-brand"><span class="wa-menu-logo">' +
          '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.39 1.26 4.82L2 22l5.36-1.36a9.9 9.9 0 0 0 4.68 1.19h.01c5.46 0 9.9-4.45 9.9-9.91C21.96 6.45 17.5 2 12.04 2zm5.9 14.06c-.25.71-1.45 1.35-2 1.44-.51.08-1.15.11-1.86-.12-.43-.14-.98-.32-1.69-.63-2.97-1.28-4.9-4.29-5.05-4.49-.15-.2-1.2-1.6-1.2-3.05s.76-2.16 1.03-2.45c.27-.29.59-.36.78-.36.2 0 .39 0 .56.01.18.01.42-.07.66.5.25.6.84 2.07.91 2.22.07.15.12.33.02.53-.1.2-.15.32-.3.49-.15.17-.31.38-.44.51-.15.15-.3.31-.13.6.17.3.76 1.25 1.63 2.02 1.12.99 2.06 1.3 2.36 1.45.3.15.47.13.65-.08.18-.2.76-.89.97-1.19.2-.3.4-.25.68-.15.28.1 1.78.84 2.08 1 .3.15.5.23.57.35.08.13.08.75-.17 1.46z"/></svg>' +
        '</span><span><strong>Colegio Theodoro Herzl</strong><small>Atención por WhatsApp</small></span></div>' +
        '<button class="wa-menu-close" type="button" aria-label="Cerrar">×</button>' +
      '</div>' +
      '<div class="wa-menu-progress" aria-label="Paso ' + step + ' de 3"><span style="width:' + (step * 33.333) + '%"></span></div>' +
      '<div class="wa-menu-body">' + content + '</div>';
    panel.querySelector('.wa-menu-close').addEventListener('click', closeMenu);
  }

  function showConsent() {
    shell(
      '<p class="wa-bubble">¡Te damos una calurosa bienvenida al Colegio Theodoro Herzl!</p>' +
      '<h2>Antes de comenzar</h2>' +
      '<label class="wa-consent"><input type="checkbox" id="wa-consent-check"><span>Acepto la <a href="' + privacyUrl + '" target="_blank" rel="noopener">Política de Tratamiento de Datos Personales</a>.</span></label>' +
      '<button class="wa-primary" id="wa-continue" type="button" disabled>Continuar</button>',
      1
    );
    var check = panel.querySelector('#wa-consent-check');
    var button = panel.querySelector('#wa-continue');
    check.addEventListener('change', function () { button.disabled = !check.checked; });
    button.addEventListener('click', showAreas);
    check.focus();
  }

  function showAreas() {
    var buttons = areas.map(function (area, index) {
      return '<button class="wa-area" type="button" data-area="' + index + '"><span aria-hidden="true">' + area.icon + '</span><span class="wa-area-copy"><small>Opción ' + (index + 1) + '</small>' + escapeHtml(area.name) + '</span><b>›</b></button>';
    }).join('');
    shell(
      '<p class="wa-bubble">Selecciona una de las siguientes opciones para ser atendido:</p>' +
      '<div class="wa-area-list">' + buttons + '</div>' +
      '<button class="wa-back" type="button">← Volver</button>',
      2
    );
    panel.querySelectorAll('.wa-area').forEach(function (button) {
      button.addEventListener('click', function () { showArea(Number(button.dataset.area)); });
    });
    panel.querySelector('.wa-back').addEventListener('click', showConsent);
    panel.querySelector('.wa-area').focus();
  }

  function showArea(index) {
    var area = areas[index];
    var firstMessage = 'Hola, deseo comunicarme con ' + area.name + '.';
    var whatsappUrl = 'https://wa.me/' + area.phone + '?text=' + encodeURIComponent(firstMessage);
    shell(
      '<span class="wa-selected"><span aria-hidden="true">' + area.icon + '</span>' + escapeHtml(area.name) + '</span>' +
      '<p class="wa-bubble">' + escapeHtml(area.reply) + '</p>' +
      '<a class="wa-primary wa-open" href="' + whatsappUrl + '" target="_blank" rel="noopener">Continuar en WhatsApp</a>' +
      '<button class="wa-back" type="button">← Elegir otra opción</button>',
      3
    );
    panel.querySelector('.wa-back').addEventListener('click', showAreas);
    panel.querySelector('.wa-open').focus();
  }

  function openMenu(event) {
    if (event) event.preventDefault();
    previousFocus = event && event.currentTarget;
    overlay.classList.add('open');
    overlay.setAttribute('aria-hidden', 'false');
    document.body.classList.add('wa-menu-open');
    showConsent();
  }

  function closeMenu() {
    overlay.classList.remove('open');
    overlay.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('wa-menu-open');
    if (previousFocus) previousFocus.focus();
  }

  function init() {
    var links = document.querySelectorAll('.quicklinks a[aria-label="WhatsApp"]');
    if (!links.length) return;
    overlay = document.createElement('div');
    overlay.className = 'wa-menu-overlay';
    overlay.setAttribute('aria-hidden', 'true');
    overlay.innerHTML = '<section class="wa-menu-panel" role="dialog" aria-modal="true" aria-label="Atención por WhatsApp"></section>';
    document.body.appendChild(overlay);
    panel = overlay.querySelector('.wa-menu-panel');
    links.forEach(function (link) { link.addEventListener('click', openMenu); });
    overlay.addEventListener('click', function (event) { if (event.target === overlay) closeMenu(); });
    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && overlay.classList.contains('open')) closeMenu();
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
