/* quienes.js — interacciones propias de Quiénes Somos (ES/EN).
   Línea de tiempo que se dibuja con el scroll, frase de la propuesta de valor que se
   enciende palabra por palabra, las cinco C's que avanzan solas e índice lateral.
   Estilos en styles.css, sección "QUIÉNES SOMOS INTERACTIVO". */
(function(){
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var vh = function(){ return window.innerHeight; };
  var scrollers = [];
  var ticking = false;
  function onScroll(){
    if(ticking) return;
    ticking = true;
    requestAnimationFrame(function(){ scrollers.forEach(function(f){ f(); }); ticking = false; });
  }
  window.addEventListener('scroll', onScroll, {passive: true});
  window.addEventListener('resize', onScroll);

  /* ── 1. Historia: la línea se llena de dorado y cada año se enciende al llegar ── */
  var tl = document.querySelector('.hist-tl');
  if(tl){
    var fill = document.createElement('div');
    fill.className = 'hist-fill';
    fill.setAttribute('aria-hidden', 'true');
    tl.appendChild(fill);
    var items = Array.prototype.slice.call(tl.querySelectorAll('.hist-item'));
    scrollers.push(function(){
      var r = tl.getBoundingClientRect();
      var mark = vh() * 0.6;                                // la "aguja" está al 60 % de la pantalla
      var p = Math.max(0, Math.min(1, (mark - r.top) / r.height));
      fill.style.transform = 'scaleY(' + (reduce ? 1 : p) + ')';
      var current = null;
      items.forEach(function(it){
        var passed = reduce || it.getBoundingClientRect().top + 30 < mark;
        it.classList.toggle('passed', passed);
        if(passed) current = it;
      });
      items.forEach(function(it){ it.classList.toggle('current', it === current && !reduce); });
    });
  }

  /* ── 4. Propuesta de valor: la frase se enciende palabra por palabra con el scroll ── */
  var quote = document.querySelector('.propuesta-box blockquote');
  if(quote){
    var words = quote.textContent.trim().split(/\s+/);
    quote.setAttribute('aria-label', quote.textContent.trim());
    quote.innerHTML = words.map(function(w){ return '<span class="qw" aria-hidden="true">' + w.replace(/</g, '&lt;') + '</span>'; }).join(' ');
    var qws = quote.querySelectorAll('.qw');
    var box = quote.closest('.propuesta-box');
    box.classList.add('scroll-lit');
    scrollers.push(function(){
      var r = box.getBoundingClientRect();
      // empieza cuando la caja asoma abajo y termina cuando su centro llega al 62 % de la pantalla
      var start = vh() * 0.95, end = vh() * 0.62;
      var p = reduce ? 1 : Math.max(0, Math.min(1, (start - (r.top + r.height / 2)) / (start - end)));
      var lit = Math.round(p * qws.length);
      qws.forEach(function(w, i){ w.classList.toggle('lit', i < lit); });
    });
  }

  /* ── 5. Las cinco C's: avanzan solas con barra de progreso; se detienen con un clic ── */
  var cfive = document.querySelector('.cfive');
  if(cfive && !reduce){
    var tabs = Array.prototype.slice.call(cfive.querySelectorAll('.cfive-tab'));
    var DUR = 5000, elapsed = 0, last = null, visible = false, hover = false, stopped = false;
    cfive.classList.add('autoplay');
    var activeIdx = function(){ return Math.max(0, tabs.findIndex(function(t){ return t.classList.contains('active'); })); };
    tabs.forEach(function(t){
      t.addEventListener('click', function(e){
        if(e.isTrusted){ stopped = true; cfive.classList.remove('autoplay'); }   // clic de la persona → se queda ahí
        elapsed = 0;
      });
    });
    cfive.addEventListener('mouseenter', function(){ hover = true; });
    cfive.addEventListener('mouseleave', function(){ hover = false; });
    new IntersectionObserver(function(es){ visible = es[0].isIntersecting; }, {threshold: .5}).observe(cfive);
    var loop = function(t){
      if(stopped) return;
      if(last !== null && visible && !hover && !document.hidden) elapsed += t - last;
      last = t;
      var i = activeIdx();
      tabs[i].style.setProperty('--p', Math.min(elapsed / DUR, 1));
      if(elapsed >= DUR){
        tabs[i].style.setProperty('--p', 0);
        elapsed = 0;
        tabs[(i + 1) % tabs.length].click();
      }
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }

  /* ── 8. Índice lateral: un punto por sección, el actual se ilumina ── */
  var sections = Array.prototype.slice.call(document.querySelectorAll('main section[id], body > section[id]'));
  if(sections.length > 2){
    var nav = document.createElement('nav');
    nav.className = 'side-index';
    nav.setAttribute('aria-label', document.documentElement.lang === 'en' ? 'On this page' : 'En esta página');
    sections.forEach(function(sec){
      // nombre: el del submenú "Quiénes Somos" si existe; si no, el eyebrow de la sección
      var link = document.querySelector('.dropdown a[href$="#' + sec.id + '"]');
      var eb = sec.querySelector('.eyebrow');
      var label = (link || eb || {}).textContent || sec.id;
      var a = document.createElement('a');
      a.href = '#' + sec.id;
      a.innerHTML = '<span class="si-dot"></span><span class="si-label"></span>';
      a.querySelector('.si-label').textContent = label.trim();
      nav.appendChild(a);
    });
    document.body.appendChild(nav);
    var links = nav.querySelectorAll('a');
    scrollers.push(function(){
      var mark = vh() * 0.4, idx = -1;
      sections.forEach(function(sec, i){ if(sec.getBoundingClientRect().top <= mark) idx = i; });
      var lastSec = sections[sections.length - 1].getBoundingClientRect();
      nav.classList.toggle('on', idx >= 0 && lastSec.bottom > vh() * 0.3);
      links.forEach(function(a, i){
        a.classList.toggle('active', i === idx);
        if(i === idx) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current');
      });
    });
  }

  onScroll();
})();
