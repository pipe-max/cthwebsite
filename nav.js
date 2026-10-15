/* nav.js — efectos de la barra de menú (todas las páginas).
   Píldora que se desliza entre opciones + barra de vidrio al hacer scroll.
   Estilos en styles.css, sección "NAV MOTION". */
(function(){
  var header = document.querySelector('header');
  var nav = document.querySelector('nav.main');
  if(!header || !nav) return;

  /* ── Color de la página: la línea del menú toma el tono del encabezado ── */
  var hero = document.querySelector('.page-hero');
  var acc = hero && getComputedStyle(hero).getPropertyValue('--acc').trim();
  if(acc) header.style.setProperty('--nav-acc', acc);

  /* ── Barra de vidrio al hacer scroll ── */
  var scrolled = false;
  function onScroll(){
    var s = window.scrollY > 8;
    if(s !== scrolled){ scrolled = s; header.classList.toggle('scrolled', s); }
  }
  window.addEventListener('scroll', onScroll, {passive: true});
  onScroll();

  /* ── Color de cada opción = color del encabezado de su página (se lee de las clases .hero-* del CSS) ── */
  var items = Array.prototype.filter.call(nav.children, function(el){
    return el.matches('a, .has-dropdown');
  });
  function linkOf(item){ return item.matches('a') ? item : item.querySelector(':scope > a'); }
  var HERO = {'quienes-somos':'hero-yellow','programas':'hero-mint','servicios':'hero-orange','admisiones':'hero-celeste',
              'egresados':'hero-violet','trabaja':'hero-teal','contacto':'hero-navy','proyectos':'hero-lime'};
  var probe = document.createElement('div');
  probe.style.display = 'none';
  document.body.appendChild(probe);
  items.forEach(function(it){
    var a = linkOf(it);
    var m = (a.getAttribute('href') || '').match(/^([a-z-]+?)(?:-en)?\.html/);
    if(!m || !HERO[m[1]]) return;
    probe.className = 'page-hero ' + HERO[m[1]];
    it.dataset.acc = getComputedStyle(probe).getPropertyValue('--acc').trim();
    a.style.setProperty('--item-acc', it.dataset.acc);
    // color de texto propio de la sección (si el encabezado lo define, p. ej. fondos muy claros)
    var txt = getComputedStyle(probe).getPropertyValue('--nav-text').trim();
    if(txt) a.style.setProperty('--item-text', txt);
  });
  probe.remove();

  /* ── Píldora deslizante (solo escritorio, con mouse) ── */
  if(!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  var desktop = window.matchMedia('(min-width: 1181px)');
  var pill = document.createElement('span');
  pill.className = 'nav-pill';
  pill.setAttribute('aria-hidden', 'true');
  nav.insertBefore(pill, nav.firstChild);
  nav.classList.add('has-pill');

  var active = null;
  items.forEach(function(it){ if(linkOf(it).classList.contains('active')) active = it; });

  function moveTo(item, instant){
    if(!desktop.matches) return;
    if(!item){ pill.classList.remove('on'); return; }
    var a = linkOf(item);
    if(instant) pill.classList.add('instant');
    pill.style.width = a.offsetWidth + 'px';
    pill.style.height = a.offsetHeight + 'px';
    // los <a> directos se miden contra el nav; el de "Quiénes Somos" contra su .has-dropdown
    var x = item === a ? a.offsetLeft : item.offsetLeft + a.offsetLeft;
    var y = item === a ? a.offsetTop : item.offsetTop + a.offsetTop;
    pill.style.transform = 'translate(' + x + 'px,' + y + 'px)';
    if(item.dataset.acc) pill.style.setProperty('--pill-acc', item.dataset.acc);
    else pill.style.removeProperty('--pill-acc');
    pill.classList.add('on');
    pill.classList.toggle('is-active', item === active);
    if(instant){
      // quitar 'instant' dos frames después para que la primera aparición no anime desde el celeste
      requestAnimationFrame(function(){ requestAnimationFrame(function(){ pill.classList.remove('instant'); }); });
    }
  }

  items.forEach(function(it){
    it.addEventListener('pointerenter', function(){ moveTo(it); });
  });
  nav.addEventListener('pointerleave', function(){ moveTo(active); });

  function reset(){ moveTo(active, true); }
  reset();
  if(document.fonts && document.fonts.ready) document.fonts.ready.then(reset);
  window.addEventListener('load', reset);
  window.addEventListener('resize', reset);
})();
