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
    var lead = hero.querySelector('.wrap > p');
    if(lead) lead.style.transitionDelay = (300 + wordCount * 70) + 'ms';

    // manchas de luz flotantes
    var orbs = document.createElement('div');
    orbs.className = 'hero-orbs';
    orbs.setAttribute('aria-hidden', 'true');
    orbs.innerHTML = '<span></span><span></span><span></span>';
    hero.insertBefore(orbs, hero.firstChild);
    var spot = document.createElement('div');
    spot.className = 'hero-spot';
    spot.setAttribute('aria-hidden', 'true');
    spot.innerHTML = '<span></span><span></span>';
    hero.insertBefore(spot, orbs.nextSibling);
  }

  /* ── Grupos que entran escalonados ── */
  function stagger(el){
    Array.prototype.forEach.call(el.children, function(c, i){ c.style.setProperty('--i', i); });
    el.classList.add('stagger');
  }
  // .prog-tabs ya es .reveal: el observer existente le pone .in
  document.querySelectorAll('.prog-tabs').forEach(function(el){
    el.classList.remove('reveal');
    stagger(el);
  });
  var sio = new IntersectionObserver(function(entries){
    entries.forEach(function(e){ if(e.isIntersecting){ e.target.classList.add('in'); sio.unobserve(e.target); } });
  }, {threshold: .08});
  document.querySelectorAll('.staff-grid').forEach(function(el){ stagger(el); sio.observe(el); });

  /* ── Tarjetas del equipo: el círculo gira y muestra un sobre; clic en el correo lo copia ── */
  var en = document.documentElement.lang === 'en';
  var ICON_MAIL = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-10 6L2 7"/></svg>';
  var ICON_CHECK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>';
  var live = document.createElement('div');
  live.className = 'sr-only';
  live.setAttribute('role', 'status');
  document.body.appendChild(live);

  document.querySelectorAll('.staff-card').forEach(function(card){
    var av = card.querySelector('.av');
    if(av){
      av.innerHTML = '<span class="av-face av-front">' + av.innerHTML + '</span>' +
                     '<span class="av-face av-back">' + ICON_MAIL + '</span>';
      av.classList.add('flip');
    }
    var link = card.querySelector('a.email');
    if(!link || !navigator.clipboard) return;
    var addr = link.textContent.trim();
    link.title = en ? 'Click to copy' : 'Clic para copiar';
    var timer;
    link.addEventListener('click', function(e){
      e.preventDefault();
      navigator.clipboard.writeText(addr).then(function(){
        clearTimeout(timer);
        link.textContent = en ? 'Email copied ✓' : '¡Correo copiado! ✓';
        card.classList.add('copied');
        if(av) av.querySelector('.av-back').innerHTML = ICON_CHECK;
        live.textContent = (en ? 'Copied: ' : 'Copiado: ') + addr;
        timer = setTimeout(function(){
          link.textContent = addr;
          card.classList.remove('copied');
          if(av) av.querySelector('.av-back').innerHTML = ICON_MAIL;
        }, 1800);
      }, function(){ window.location.href = link.href; });
    });
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

  /* ── Hero: las manchas siguen levemente al mouse ── */
  if(hero){
    hero.addEventListener('pointermove', function(e){
      var r = hero.getBoundingClientRect();
      hero.style.setProperty('--px', ((e.clientX - r.left) / r.width - .5).toFixed(3));
      hero.style.setProperty('--py', ((e.clientY - r.top) / r.height - .5).toFixed(3));
    });
  }

  /* ── Tarjetas con inclinación 3D + brillo ── */
  document.querySelectorAll('.ptab').forEach(function(card){
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
