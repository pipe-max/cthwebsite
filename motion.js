/* motion.js — capa de animaciones del sitio CTH.
   Se incluye al final del <body>, después del script del IntersectionObserver (.reveal).
   Los estilos viven en styles.css, sección "MOTION". */
(function(){
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  document.documentElement.classList.add('motion');

  /* ── Barra de progreso de lectura ── */
  var bar = document.createElement('div');
  bar.className = 'scroll-progress';
  document.body.appendChild(bar);

  /* ── Hero: título palabra por palabra ── */
  var hero = document.querySelector('.page-hero');
  var h1 = hero && hero.querySelector('h1');
  var wordCount = 0;
  function splitWords(node){
    Array.prototype.slice.call(node.childNodes).forEach(function(child){
      if(child.nodeType === 3){
        var parts = child.textContent.split(/(\s+)/);
        var frag = document.createDocumentFragment();
        parts.forEach(function(p){
          if(!p) return;
          if(/^\s+$/.test(p)){ frag.appendChild(document.createTextNode(p)); return; }
          var s = document.createElement('span');
          s.className = 'w';
          s.style.setProperty('--i', wordCount++);
          s.textContent = p;
          frag.appendChild(s);
        });
        node.replaceChild(frag, child);
      } else if(child.nodeType === 1){
        splitWords(child);
      }
    });
  }
  if(h1){
    splitWords(h1);
    h1.classList.add('split');
    h1.style.setProperty('--words', wordCount);
    // el párrafo entra cuando el título ya casi terminó
    hero.querySelectorAll('.wrap > p').forEach(function(p, i){
      p.style.transitionDelay = (300 + wordCount * 70 + i * 120) + 'ms';
    });

  }

  /* ── Grupos que entran escalonados: cada tarjeta se anima al entrar en pantalla;
        las que entran juntas (una fila) lo hacen una tras otra ── */
  var sio = new IntersectionObserver(function(entries){
    var n = 0;
    entries.forEach(function(e){
      if(!e.isIntersecting) return;
      e.target.style.setProperty('--d', (n++ * 110) + 'ms');
      e.target.classList.add('st-in');
      sio.unobserve(e.target);
    });
  }, {threshold: .15, rootMargin: '0px 0px -8% 0px'});
  document.querySelectorAll('.prog-tabs, .banner-grid, .staff-grid, #horaa-mutemet .tl-grid, #horaa-mutemet .pill-grid, #filosofia .pill-grid, .mv-grid, .fam-grid-lg, .news-grid, .proj-grid, .ci-cards').forEach(function(el){
    el.classList.remove('reveal');   // el contenedor ya no se anima entero; lo hacen sus tarjetas
    el.classList.add('stagger');
    Array.prototype.forEach.call(el.children, function(c){ c.classList.remove('reveal'); sio.observe(c); });
  });

  // documentos: los íconos se "dibujan" al pasar el mouse (cada trazo mide 1 para animar el dash)
  document.querySelectorAll('#perfil .fam .ic svg').forEach(function(svg){
    svg.querySelectorAll('path, rect, circle, line, polyline').forEach(function(sh){ sh.setAttribute('pathLength', '1'); });
  });

  /* ── Portada ── */
  // noticias: la foto pasa a una capa interna para poder hacer zoom sin salirse de su caja
  document.querySelectorAll('.n-card .img').forEach(function(img){
    var bg = document.createElement('span');
    bg.className = 'img-bg';
    bg.setAttribute('aria-hidden', 'true');
    bg.style.backgroundImage = img.style.backgroundImage || getComputedStyle(img).backgroundImage;
    img.style.background = 'none';
    img.insertBefore(bg, img.firstChild);
  });
  // identidad: título palabra por palabra cuando aparece
  document.querySelectorAll('#identidad h2').forEach(function(h){
    var i = 0;
    h.innerHTML = h.textContent.trim().split(/\s+/).map(function(w){
      return '<span class="w" style="--i:' + (i++) + '">' + w.replace(/</g, '&lt;') + '</span>';
    }).join(' ');
    h.classList.add('split-in');
  });
  // datos de la franja: los números cuentan desde cero al aparecer
  var countUp = function(el){
    var parts = el.textContent.split(/(\d+)/);
    if(parts.length < 2) return;
    el.innerHTML = parts.map(function(p){ return /^\d+$/.test(p) ? '<span class="cu" data-n="' + p + '">0</span>' : p.replace(/</g, '&lt;'); }).join('');
    var cus = el.querySelectorAll('.cu');
    var t0 = null;
    var step = function(t){
      if(t0 === null) t0 = t;
      var k = Math.min((t - t0) / 1100, 1), e = 1 - Math.pow(1 - k, 3);
      cus.forEach(function(c){ c.textContent = Math.round(+c.dataset.n * e); });
      if(k < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  var cio = new IntersectionObserver(function(es){
    es.forEach(function(e){ if(e.isIntersecting){ cio.unobserve(e.target); if(!reduce) setTimeout(function(){ countUp(e.target); }, 250); } });
  }, {threshold: .6});
  document.querySelectorAll('.cred-stats .stat .num').forEach(function(n){ cio.observe(n); });

  /* ── Indicadores: píldora que se desliza entre pestañas y períodos que entran en cascada ── */
  document.querySelectorAll('.perf-tabs').forEach(function(bar){
    var pill = document.createElement('span');
    pill.className = 'perf-pill';
    pill.setAttribute('aria-hidden', 'true');
    bar.insertBefore(pill, bar.firstChild);
    bar.classList.add('has-pill');
    var place = function(){
      var a = bar.querySelector('.perf-tab.active');
      if(!a) return;
      pill.style.width = a.offsetWidth + 'px';
      pill.style.height = a.offsetHeight + 'px';
      pill.style.transform = 'translate(' + a.offsetLeft + 'px,' + a.offsetTop + 'px)';
    };
    bar.addEventListener('click', function(){ requestAnimationFrame(place); });
    window.addEventListener('resize', place);
    window.addEventListener('load', place);
    place();
  });

  /* ── Tarjetas del equipo: el círculo gira y muestra un sobre; clic en el correo lo copia ── */
  var en = document.documentElement.lang === 'en';
  var ICON_MAIL = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-10 6L2 7"/></svg>';
  var ICON_CHECK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>';
  var live = document.createElement('div');
  live.className = 'sr-only';
  live.setAttribute('role', 'status');
  document.body.appendChild(live);

  // clic en un correo → se copia, el texto cambia a "¡Correo copiado! ✓" y vuelve a los 1.8 s
  function copyOnClick(link, label, card, onCopied, onReset){
    if(!navigator.clipboard) return;
    var addr = label.textContent.trim();
    link.title = en ? 'Click to copy' : 'Clic para copiar';
    var timer;
    link.addEventListener('click', function(e){
      e.preventDefault();
      navigator.clipboard.writeText(addr).then(function(){
        clearTimeout(timer);
        label.textContent = en ? 'Email copied ✓' : '¡Correo copiado! ✓';
        card.classList.add('copied');
        if(onCopied) onCopied();
        live.textContent = (en ? 'Copied: ' : 'Copiado: ') + addr;
        timer = setTimeout(function(){
          label.textContent = addr;
          card.classList.remove('copied');
          if(onReset) onReset();
        }, 1800);
      }, function(){ window.location.href = link.href; });
    });
  }

  document.querySelectorAll('.staff-card').forEach(function(card){
    var av = card.querySelector('.av');
    if(av){
      av.innerHTML = '<span class="av-face av-front">' + av.innerHTML + '</span>' +
                     '<span class="av-face av-back">' + ICON_MAIL + '</span>';
      av.classList.add('flip');
    }
    var link = card.querySelector('a.email');
    if(!link) return;
    copyOnClick(link, link, card,
      function(){ if(av) av.querySelector('.av-back').innerHTML = ICON_CHECK; },
      function(){ if(av) av.querySelector('.av-back').innerHTML = ICON_MAIL; });
  });

  /* ── Servicios: botón de correo con sobre que aparece y copia con un clic ── */
  document.querySelectorAll('.svc-banner').forEach(function(card){
    var link = card.querySelector('a.svc-banner-mail');
    if(!link) return;
    var addr = link.textContent.trim();
    link.innerHTML = '<span class="mail-ic">' + ICON_MAIL + '</span><span class="lbl"></span>';
    var label = link.querySelector('.lbl');
    label.textContent = addr;
    var ic = link.querySelector('.mail-ic');
    copyOnClick(link, label, card,
      function(){ ic.innerHTML = ICON_CHECK; },
      function(){ ic.innerHTML = ICON_MAIL; });
  });

  if(reduce){ return; }

  /* ── Scroll: progreso + parallax del hero ── */
  var heroWrap = hero && hero.querySelector('.wrap');
  var ticking = false;
  function onScroll(){
    var y = window.scrollY;
    var max = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.transform = 'scaleX(' + (max > 0 ? y / max : 0) + ')';
    if(heroWrap){
      var h = hero.offsetHeight;
      if(y < h){
        heroWrap.style.transform = 'translateY(' + (y * 0.28) + 'px)';
        heroWrap.style.opacity = String(1 - Math.min(y / h, 1) * 0.85);
      }
    }
    ticking = false;
  }
  window.addEventListener('scroll', function(){
    if(!ticking){ ticking = true; requestAnimationFrame(onScroll); }
  }, {passive: true});
  onScroll();

  if(!finePointer){ return; }

  /* ── Tarjetas con inclinación 3D + brillo ── */
  document.querySelectorAll('.ptab, .svc-banner, #horaa-mutemet .p-card, #horaa-mutemet .tl-card, #filosofia .p-card, .mv-card, .n-card, .proj-card').forEach(function(card){
    card.classList.add('tilt');
    card.addEventListener('pointermove', function(e){
      var r = card.getBoundingClientRect();
      var px = (e.clientX - r.left) / r.width;
      var py = (e.clientY - r.top) / r.height;
      card.classList.add('tilting');
      card.style.setProperty('--ry', ((px - .5) * 10).toFixed(2) + 'deg');
      card.style.setProperty('--rx', ((.5 - py) * 8).toFixed(2) + 'deg');
      card.style.setProperty('--mx', (px * 100).toFixed(1) + '%');
      card.style.setProperty('--my', (py * 100).toFixed(1) + '%');
      card.style.setProperty('--tx', (px - .5).toFixed(3));
      card.style.setProperty('--ty', (py - .5).toFixed(3));
    });
    card.addEventListener('pointerleave', function(){
      card.classList.remove('tilting');
      card.style.setProperty('--rx', '0deg');
      card.style.setProperty('--ry', '0deg');
      card.style.setProperty('--tx', '0');
      card.style.setProperty('--ty', '0');
    });
  });

  /* ── Equipo: el borde se ilumina cerca del cursor ── */
  document.querySelectorAll('.staff-grid').forEach(function(grid){
    var cards = grid.querySelectorAll('.staff-card');
    grid.addEventListener('pointermove', function(e){
      cards.forEach(function(c){
        var r = c.getBoundingClientRect();
        c.style.setProperty('--gx', (e.clientX - r.left) + 'px');
        c.style.setProperty('--gy', (e.clientY - r.top) + 'px');
      });
    });
  });

  /* ── Aviso de Trabaja con nosotros: borde que se ilumina cerca del cursor ── */
  document.querySelectorAll('.safety-alert').forEach(function(box){
    box.addEventListener('pointermove', function(e){
      var r = box.getBoundingClientRect();
      box.style.setProperty('--gx', (e.clientX - r.left) + 'px');
      box.style.setProperty('--gy', (e.clientY - r.top) + 'px');
    });
  });

  /* ── Botones magnéticos ── */
  document.querySelectorAll('.cta-band .btn').forEach(function(btn){
    btn.addEventListener('pointermove', function(e){
      var r = btn.getBoundingClientRect();
      var dx = (e.clientX - (r.left + r.width / 2)) * 0.22;
      var dy = (e.clientY - (r.top + r.height / 2)) * 0.35;
      btn.style.translate = dx.toFixed(1) + 'px ' + dy.toFixed(1) + 'px';
    });
    btn.addEventListener('pointerleave', function(){ btn.style.translate = '0 0'; });
  });

  /* ── Franja CTA: resplandor que sigue al mouse ── */
  document.querySelectorAll('.cta-band .box').forEach(function(box){
    box.addEventListener('pointermove', function(e){
      var r = box.getBoundingClientRect();
      box.style.setProperty('--mx', (e.clientX - r.left) + 'px');
      box.style.setProperty('--my', (e.clientY - r.top) + 'px');
    });
  });
})();
