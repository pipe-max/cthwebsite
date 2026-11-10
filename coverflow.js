/* Carrusel coverflow genérico: <div data-coverflow> con tarjetas hijas.
   La tarjeta activa queda al centro; las demás a los lados (data-pos -2…2),
   las que sobran quedan escondidas detrás. */
(function(){
  var en = (document.documentElement.lang || '').indexOf('en') === 0;
  var T = en ? {prev:'Previous', next:'Next', show:'Show'} : {prev:'Anterior', next:'Siguiente', show:'Ver'};
  var ARROW = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="PATH"/></svg>';

  document.querySelectorAll('[data-coverflow]').forEach(function(stage){
    var cards = Array.prototype.slice.call(stage.children);
    var n = cards.length, cur = 0;
    var reach = Math.min(2, Math.floor((n - 1) / 2));   // cuántas tarjetas se ven a cada lado
    stage.classList.add('cf');
    // las tarjetas ya no aparecen una por una (su animación de entrada choca con el giro)
    cards.forEach(function(c){ c.classList.remove('reveal'); });

    var nav = document.createElement('div');
    nav.className = 'cf-nav';
    nav.innerHTML = '<button type="button" class="cf-arrow" aria-label="' + T.prev + '">' + ARROW.replace('PATH','M15 6l-6 6 6 6') + '</button>' +
      '<div class="cf-dots"></div>' +
      '<button type="button" class="cf-arrow" aria-label="' + T.next + '">' + ARROW.replace('PATH','M9 6l6 6-6 6') + '</button>';
    stage.parentNode.insertBefore(nav, stage.nextSibling);
    var arrows = nav.querySelectorAll('.cf-arrow');
    arrows[0].addEventListener('click', function(){ go(cur - 1); });
    arrows[1].addEventListener('click', function(){ go(cur + 1); });

    var dotsBox = nav.querySelector('.cf-dots');
    var dots = cards.map(function(c, i){
      var d = document.createElement('button');
      d.type = 'button';
      var h = c.querySelector('h3');
      d.setAttribute('aria-label', T.show + ': ' + (h ? h.textContent : i + 1));
      d.addEventListener('click', function(){ go(i); });
      dotsBox.appendChild(d);
      return d;
    });

    function layout(){
      cards.forEach(function(c, i){
        var off = (i - cur + n) % n;
        if(off > n / 2) off -= n;
        c.dataset.pos = Math.abs(off) > reach ? 'x' : off;
        c.setAttribute('aria-hidden', off === 0 ? 'false' : 'true');
        c.querySelectorAll('a,button').forEach(function(el){ el.tabIndex = off === 0 ? 0 : -1; });
      });
      dots.forEach(function(d, i){ d.classList.toggle('on', i === cur); });
    }
    function go(i){ cur = (i + n) % n; layout(); }

    // clic en una tarjeta lateral: la trae al centro (y no abre/copia su enlace)
    stage.addEventListener('click', function(e){
      var card = e.target.closest('[data-pos]');
      if(swiped){ e.preventDefault(); e.stopPropagation(); swiped = false; return; }
      if(card && card.parentNode === stage && card.dataset.pos !== '0'){
        e.preventDefault(); e.stopPropagation();
        go(cards.indexOf(card));
      }
    }, true);

    // deslizar con el dedo
    var sx = null, sy = 0, swiped = false;
    stage.addEventListener('touchstart', function(e){ sx = e.touches[0].clientX; sy = e.touches[0].clientY; swiped = false; }, {passive:true});
    stage.addEventListener('touchend', function(e){
      if(sx === null) return;
      var dx = e.changedTouches[0].clientX - sx, dy = e.changedTouches[0].clientY - sy;
      if(Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)){ swiped = true; go(cur + (dx < 0 ? 1 : -1)); }
      sx = null;
    });

    // flechas del teclado cuando el foco está en el carrusel o sus controles
    [stage, nav].forEach(function(el){
      el.addEventListener('keydown', function(e){
        if(e.key === 'ArrowLeft' || e.key === 'ArrowRight'){ e.preventDefault(); go(cur + (e.key === 'ArrowLeft' ? -1 : 1)); }
      });
    });

    layout();
  });
})();
