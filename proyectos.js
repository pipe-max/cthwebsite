/* proyectos.js — Nuestros Proyectos (ES/EN): cada tarjeta muestra su nombre y abre
   una ventana con la imagen grande y el texto completo; flechas para pasar de proyecto.
   Estilos en styles.css, sección "PROYECTOS · VENTANA". */
(function(){
  var en = document.documentElement.lang === 'en';
  var cards = Array.prototype.slice.call(document.querySelectorAll('.proj-card')).filter(function(c){
    return c.querySelector('.proj-desc h4');
  });
  if(!cards.length) return;
  var T = en ? {more: 'Read more', close: 'Close', prev: 'Previous project', next: 'Next project', of: ' of '}
             : {more: 'Ver más', close: 'Cerrar', prev: 'Proyecto anterior', next: 'Proyecto siguiente', of: ' de '};
  var ARROW = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';

  /* ── Tarjetas: nombre visible + "Ver más"; se abren con clic o Enter ── */
  cards.forEach(function(card, i){
    var title = card.querySelector('.proj-desc h4').textContent.trim();
    card.classList.add('has-modal');
    card.setAttribute('role', 'button');
    card.setAttribute('tabindex', '0');
    card.setAttribute('aria-haspopup', 'dialog');
    var cap = document.createElement('div');
    cap.className = 'proj-cap';
    cap.innerHTML = '<h4></h4><span class="proj-more">' + T.more + ARROW + '</span>';
    cap.querySelector('h4').textContent = title;
    card.querySelector('img').insertAdjacentElement('afterend', cap);
    card.addEventListener('click', function(){ open(i); });
    card.addEventListener('keydown', function(e){
      if(e.key === 'Enter' || e.key === ' '){ e.preventDefault(); open(i); }
    });
  });

  /* ── Ventana ── */
  var modal = document.createElement('div');
  modal.className = 'pm-overlay';
  modal.hidden = true;
  modal.innerHTML =
    '<div class="pm-panel" role="dialog" aria-modal="true" aria-labelledby="pm-title">' +
      '<button class="pm-close" type="button" aria-label="' + T.close + '">✕</button>' +
      '<div class="pm-media"><img alt=""></div>' +
      '<div class="pm-body">' +
        '<span class="pm-count"></span>' +
        '<h3 id="pm-title"></h3>' +
        '<div class="pm-text"></div>' +
        '<div class="pm-nav">' +
          '<button class="pm-prev" type="button" aria-label="' + T.prev + '">' + ARROW + '</button>' +
          '<button class="pm-next" type="button" aria-label="' + T.next + '">' + ARROW + '</button>' +
        '</div>' +
      '</div>' +
    '</div>';
  document.body.appendChild(modal);
  var panel = modal.querySelector('.pm-panel');
  var img = modal.querySelector('.pm-media img');
  var h3 = modal.querySelector('#pm-title');
  var text = modal.querySelector('.pm-text');
  var count = modal.querySelector('.pm-count');
  var current = -1, lastFocus = null;

  function fill(i){
    var c = cards[i];
    var src = c.querySelector('img');
    img.src = src.currentSrc || src.src;
    img.alt = src.alt;
    h3.textContent = c.querySelector('.proj-desc h4').textContent.trim();
    text.innerHTML = '';
    c.querySelectorAll('.proj-desc p').forEach(function(p){ text.appendChild(p.cloneNode(true)); });
    count.textContent = (i + 1) + T.of + cards.length;
    text.scrollTop = 0;
    panel.classList.remove('swap'); void panel.offsetWidth; panel.classList.add('swap');
  }
  function open(i){
    current = i;
    lastFocus = document.activeElement;
    fill(i);
    modal.hidden = false;
    document.documentElement.classList.add('pm-lock');
    requestAnimationFrame(function(){ modal.classList.add('on'); });
    modal.querySelector('.pm-close').focus();
  }
  function close(){
    modal.classList.remove('on');
    document.documentElement.classList.remove('pm-lock');
    setTimeout(function(){ modal.hidden = true; }, 250);
    if(lastFocus) lastFocus.focus();
  }
  function go(d){ current = (current + d + cards.length) % cards.length; fill(current); }

  modal.querySelector('.pm-close').addEventListener('click', close);
  modal.querySelector('.pm-prev').addEventListener('click', function(){ go(-1); });
  modal.querySelector('.pm-next').addEventListener('click', function(){ go(1); });
  modal.addEventListener('click', function(e){ if(e.target === modal) close(); });
  document.addEventListener('keydown', function(e){
    if(modal.hidden) return;
    if(e.key === 'Escape') close();
    else if(e.key === 'ArrowRight') go(1);
    else if(e.key === 'ArrowLeft') go(-1);
    else if(e.key === 'Tab'){
      // mantener el foco dentro de la ventana
      var f = panel.querySelectorAll('button');
      if(e.shiftKey && document.activeElement === f[0]){ e.preventDefault(); f[f.length - 1].focus(); }
      else if(!e.shiftKey && document.activeElement === f[f.length - 1]){ e.preventDefault(); f[0].focus(); }
    }
  });
  // en celular: deslizar para pasar de proyecto
  var x0 = null;
  panel.addEventListener('touchstart', function(e){ x0 = e.touches[0].clientX; }, {passive: true});
  panel.addEventListener('touchend', function(e){
    if(x0 === null) return;
    var dx = e.changedTouches[0].clientX - x0;
    if(Math.abs(dx) > 60) go(dx < 0 ? 1 : -1);
    x0 = null;
  });
})();
