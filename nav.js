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

  /* ── Píldora deslizante (solo escritorio, con mouse) ── */
  if(!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  var desktop = window.matchMedia('(min-width: 1181px)');
  var items = Array.prototype.filter.call(nav.children, function(el){
    return el.matches('a, .has-dropdown');
  });
  var pill = document.createElement('span');
  pill.className = 'nav-pill';
  pill.setAttribute('aria-hidden', 'true');
  nav.insertBefore(pill, nav.firstChild);
  nav.classList.add('has-pill');

  function linkOf(item){ return item.matches('a') ? item : item.querySelector(':scope > a'); }
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
    pill.classList.add('on');
    pill.classList.toggle('is-active', item === active);
    if(instant){ pill.offsetWidth; pill.classList.remove('instant'); }
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
