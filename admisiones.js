/* admisiones.js — interacciones propias de la página de Admisiones (ES/EN).
   Calculadora de grado, resaltado de edades en las tablas, cuenta regresiva del
   próximo proceso y lista de documentos que se puede marcar.
   Estilos en styles.css, sección "ADMISIONES INTERACTIVO". */
(function(){
  var en = document.documentElement.lang === 'en';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function esc(t){ return String(t).replace(/[&<>"]/g, function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]; }); }

  /* ── Tablas de edades: cada fila sabe su edad (se lee de la propia tabla) ── */
  var rows = [];
  document.querySelectorAll('.age-block').forEach(function(block){
    var head = block.querySelector('.head');
    var level = head ? head.textContent.trim() : '';
    var r = 0;
    block.querySelectorAll('.age-table tr').forEach(function(tr){
      var td = tr.querySelectorAll('td');
      if(td.length < 3) return;
      tr.style.setProperty('--r', r++);
      var m = td[2].textContent.match(/\d+/);
      if(!m) return;
      tr.dataset.age = m[0];
      rows.push({tr: tr, age: +m[0], nat: td[0].textContent.trim(), intl: td[1].textContent.trim(), level: level});
    });
  });
  function rowsOfAge(age){ return rows.filter(function(x){ return x.age === age; }); }

  // al pasar el mouse por una edad, se resalta la misma edad en las tres tablas
  rows.forEach(function(x){
    x.tr.addEventListener('mouseenter', function(){
      rowsOfAge(x.age).forEach(function(y){ y.tr.classList.add('age-hl'); });
    });
    x.tr.addEventListener('mouseleave', function(){
      rows.forEach(function(y){ y.tr.classList.remove('age-hl'); });
    });
  });

  /* ── Calculadora de grado: edad cumplida al 31 de julio del año escolar ── */
  var ICON_MAIL_SM = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-10 6L2 7"/></svg>';
  // fecha en tres listas (día, mes, año): el campo de fecha nativo falla al escribir en Safari
  var selD = document.getElementById('age-d');
  var selM = document.getElementById('age-m');
  var selY = document.getElementById('age-y');
  var out = document.getElementById('age-out');
  if(selD && selM && selY && out){
    var today = new Date();
    var Y = today.getMonth() >= 7 ? today.getFullYear() + 1 : today.getFullYear(); // próximo año escolar (agosto en adelante → el siguiente)
    var addOpt = function(sel, value, text){
      var o = document.createElement('option');
      o.value = value;
      o.textContent = text;
      sel.appendChild(o);
    };
    var MONTHS = en ? ['January','February','March','April','May','June','July','August','September','October','November','December']
                    : ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
    for(var i = 1; i <= 31; i++) addOpt(selD, i, i);
    MONTHS.forEach(function(name, k){ addOpt(selM, k + 1, name); });
    for(var yy = today.getFullYear(); yy >= 2005; yy--) addOpt(selY, yy, yy);
    var intro = out.innerHTML;

    // primaria y bachillerato: el grado sale del grado que cursa y su calendario, no de la edad
    var more = document.getElementById('age-more');
    var selT = document.getElementById('age-t');     // tipo de grado: nacional o internacional/exterior
    var selG = document.getElementById('age-g');     // grado que cursa (valor = grado internacional del Theodoro)
    var selC = document.getElementById('age-c');     // calendario A o B
    var fillGrades = function(){
      var keep = selG.value;
      selG.length = 1;                                 // deja solo la opción "Elige…"
      if(selT.value === 'nac'){                        // nacional: Transición = 1° internacional, 5° nacional = 6° internacional…
        addOpt(selG, 1, en ? 'Transition' : 'Transición');
        for(var g = 1; g <= 11; g++) addOpt(selG, g + 1, g + '°');
      } else if(selT.value === 'int'){                 // internacional o exterior: los grados van hasta 12°
        for(var h = 1; h <= 12; h++) addOpt(selG, h, h + '°');
      }
      selG.disabled = !selT.value;
      selG.value = keep;
      if(selG.value !== keep) selG.value = '';
    };

    var calc = function(){
      rows.forEach(function(x){ x.tr.classList.remove('age-match'); });
      out.classList.remove('has-result');
      if(!selD.value || !selM.value || !selY.value){ out.innerHTML = intro; return; }
      var p = [+selY.value, +selM.value, +selD.value];    // [año, mes, día]
      var yr = Y + '–' + (Y + 1);
      var age = Y - p[0] - (p[1] >= 8 ? 1 : 0);           // cumple después del 31 de julio → un año menos
      // mensajes especiales: misma jerarquía que el resultado (título grande + texto + acción)
      var msg = function(title, text, extra){
        return '<div class="acr-res acr-msg"><span class="acr-title">' + title + '</span><p>' + text + '</p>' + (extra || '') + '</div>';
      };
      var MAIL = '<a class="acr-btn" href="mailto:admisiones@theodoro.edu.co">' + ICON_MAIL_SM + (en ? 'Email Admissions' : 'Escribir a admisiones') + '</a>';
      var yearsTxt = function(n){ return en ? n + (n === 1 ? ' year old' : ' years old') : n + (n === 1 ? ' año' : ' años'); };
      if(new Date(p[0], p[1] - 1, p[2]).getDate() !== p[2]){   // p. ej. 31 de febrero
        out.innerHTML = msg(en ? 'Check the date' : 'Revisa la fecha',
                            en ? 'That day doesn\'t exist in that month.' : 'Ese día no existe en ese mes.');
        out.classList.add('has-result');
        return;
      }
      if(new Date(p[0], p[1] - 1, p[2]) > today){
        out.innerHTML = msg(en ? 'Check the date' : 'Revisa la fecha',
                            en ? 'The date of birth can\'t be in the future.' : 'La fecha de nacimiento no puede ser futura.');
        out.classList.add('has-result');
        return;
      }
      if(age < 3){
        var ok = Y + (3 - age);
        out.innerHTML = msg(en ? 'Not old enough yet' : 'Aún no tiene la edad',
                            en ? 'The entry year would be:' : 'El año de ingreso corresponde a:',
                            '<span class="acr-age">' + ok + '–' + (ok + 1) + '</span>');
        out.classList.add('has-result');
        return;
      }
      var school = age >= 7;                              // desde primaria manda el grado que cursa
      if(more) more.hidden = !school;
      if(school && more){
        if(!selT.value || !selG.value || !selC.value){
          out.innerHTML = msg(en ? 'One more step' : 'Un paso más',
                              en ? 'For Elementary and High School, tell us the grade your child is in now and their school calendar.'
                                 : 'Para primaria y bachillerato, cuéntanos qué grado cursa ahora y el calendario de su colegio.');
          out.classList.add('has-result');
          return;
        }
        var next = +selG.value + 1;                       // grado internacional del Theodoro al que pasaría
        var calA = selC.value === 'A';
        // calendario A termina en noviembre → entra en enero; calendario B termina en junio → entra en agosto
        var when = calA ? (en ? 'In January ' : 'En enero de ') + (today.getFullYear() + 1) : (en ? 'In ' : 'En ') + yr;
        var row = rowsOfAge(next + 5)[0];                // en la tabla, cada grado internacional n va con la edad n + 5
        if(!row){
          out.innerHTML = msg(en ? 'Let\'s talk' : 'Hablemos',
                              en ? 'Your child would finish school before joining us. Write to us and we\'ll guide you.'
                                 : 'Terminaría el colegio antes de ingresar. Escríbenos y te orientamos.', MAIL);
          out.classList.add('has-result');
          return;
        }
        row.tr.classList.add('age-match');
        var byAge = rowsOfAge(age)[0];                   // calendario A va medio año adelante: se compara con agosto igual
        var warn = byAge && byAge.age !== row.age
          ? '<small class="acr-note">' + (en ? 'By age, your child would be in ' + esc(byAge.intl) + '. Write to us and we\'ll review it.'
                                            : 'Por su edad le correspondería ' + esc(byAge.intl) + '. Escríbenos y lo revisamos.') + '</small>'
          : '';
        out.innerHTML = '<div class="acr-res">' +
          '<span class="acr-label">' + when + (en ? ' they would enter' : ' ingresaría a') + '</span>' +
          '<span class="acr-grade">' + esc(row.intl) + '</span>' +
          '<span class="acr-level">' + esc(row.level) + ' · ' + esc(row.nat) + (en ? ' (national curriculum)' : ' en pénsum nacional') + '</span>' +
          '<span class="acr-age">' + (en ? 'Now in ' : 'Viene de ') + esc(selG.options[selG.selectedIndex].text) +
            (selT.value === 'nac' ? (en ? ' national' : ' nacional') : (en ? ' international' : ' internacional')) +
            (en ? ' · calendar ' : ' · calendario ') + selC.value + '</span>' +
          warn + '</div>';
        out.classList.add('has-result');
        return;
      }
      var m = rowsOfAge(age);
      if(!m.length){
        out.innerHTML = msg(yearsTxt(age) + (en ? ' in ' : ' en ') + yr,
                            en ? 'That\'s outside the ages in our table. Write to us and we\'ll guide you.'
                               : 'Está fuera de las edades de la tabla. Escríbenos y te orientamos.', MAIL);
        out.classList.add('has-result');
        return;
      }
      m.forEach(function(x){ x.tr.classList.add('age-match'); });
      out.innerHTML = '<div class="acr-res">' +
        '<span class="acr-label">' + (en ? 'In ' + yr + ' they would enter' : 'En ' + yr + ' ingresaría a') + '</span>' +
        '<span class="acr-grade">' + m.map(function(x){ return esc(x.intl); }).join(en ? ' or ' : ' o ') + '</span>' +
        m.map(function(x){ return '<span class="acr-level">' + esc(x.level) + ' · ' + esc(x.nat) + (en ? ' (national curriculum)' : ' en pénsum nacional') + '</span>'; }).join('') +
        '<span class="acr-age">' + (en ? age + ' years old on July 31' : age + ' años al 31 de julio') + '</span>' +
        '</div>';
      out.classList.add('has-result');
    };
    if(selT) selT.addEventListener('change', fillGrades);
    [selD, selM, selY, selT, selG, selC].forEach(function(sel){ if(sel) sel.addEventListener('change', calc); });
  }

  /* ── Próximo proceso: cuenta regresiva según las fechas de cada tarjeta ── */
  var cd = document.getElementById('tl-countdown');
  if(cd){
    var now = new Date(); now.setHours(0, 0, 0, 0);
    var day = 864e5;
    var parse = function(s){ var p = s.split('-').map(Number); return new Date(p[0], p[1] - 1, p[2]); };
    var open = null, next = null;
    document.querySelectorAll('.tl-card[data-start]').forEach(function(card){
      var start = parse(card.dataset.start);
      var end = card.dataset.end ? parse(card.dataset.end) : null;
      var title = card.querySelector('h3').textContent.trim();
      var date = (card.querySelector('.date') || {}).textContent || '';
      if(now < start){
        if(!next) next = {card: card, n: Math.round((start - now) / day), title: title, date: date};
      } else if(!end || now <= end){
        if(!open) open = {card: card, n: end ? Math.round((end - now) / day) : null, title: title, date: date};
      }
    });
    var label = function(n){ return n === 1 ? (en ? 'day' : 'día') : (en ? 'days' : 'días'); };
    var num = null, target = 0;
    if(open){
      open.card.classList.add('is-open');
      open.card.insertAdjacentHTML('afterbegin', '<span class="tl-chip open">' + (en ? 'Open now' : 'Abierto ahora') + '</span>');
      cd.innerHTML = '<span class="cd-live"></span><span class="cd-txt">' +
        (en ? 'Admissions are <b>open</b> for ' : '¡Inscripciones <b>abiertas</b> para ') + '<b>' + esc(open.title) + '</b>' +
        (open.n !== null ? (en ? ' — closing in ' : '! Cierran en ') + '<b>' + open.n + ' ' + label(open.n) + '</b>' : (en ? '' : '!')) + '</span>';
    } else if(next){
      next.card.classList.add('is-next');
      next.card.insertAdjacentHTML('afterbegin', '<span class="tl-chip">' + (en ? 'Up next' : 'Próximo') + '</span>');
      cd.innerHTML = '<span class="cd-num">' + next.n + '</span><span class="cd-txt">' +
        label(next.n) + (en ? ' until admissions open for ' : ' para la inscripción de ') +
        '<b>' + esc(next.title) + '</b>' + (next.date ? ' · ' + esc(next.date) : '') + '</span>';
      num = cd.querySelector('.cd-num');
      target = next.n;
    }
    if(open || next){
      cd.hidden = false;
      // el número cuenta desde cero cuando la sección aparece en pantalla
      if(num && !reduce && 'IntersectionObserver' in window){
        num.textContent = '0';
        var cio = new IntersectionObserver(function(es){
          if(!es[0].isIntersecting) return;
          cio.disconnect();
          var t0 = null;
          var step = function(t){
            if(t0 === null) t0 = t;
            var k = Math.min((t - t0) / 1200, 1);
            num.textContent = Math.round(target * (1 - Math.pow(1 - k, 3)));
            if(k < 1) requestAnimationFrame(step);
          };
          requestAnimationFrame(step);
        }, {threshold: .6});
        cio.observe(cd);
      }
    }
  }

  /* ── Documentos para adjuntar: lista que se puede marcar ── */
  document.querySelectorAll('.track').forEach(function(track, ti){
    var list = track.querySelector('.doclist');
    if(!list) return;
    var items = list.querySelectorAll('li');
    var KEY = 'cth-docs-' + (en ? 'en-' : 'es-') + ti;
    var saved = [];
    try { saved = JSON.parse(localStorage.getItem(KEY) || '[]'); } catch(e){}
    list.classList.add('checklist');
    items.forEach(function(li, i){
      var text = li.textContent.trim();
      li.innerHTML = '<label><input type="checkbox"><span></span></label>';
      li.querySelector('span').textContent = text;
      if(saved[i]) li.querySelector('input').checked = true;
    });
    var prog = document.createElement('p');
    prog.className = 'doc-progress';
    prog.setAttribute('aria-live', 'polite');
    list.insertAdjacentElement('afterend', prog);
    var update = function(){
      var boxes = list.querySelectorAll('input');
      var done = 0, state = [];
      boxes.forEach(function(b){ if(b.checked) done++; state.push(b.checked); b.closest('li').classList.toggle('done', b.checked); });
      try { localStorage.setItem(KEY, JSON.stringify(state)); } catch(e){}
      var all = done === boxes.length;
      track.classList.toggle('docs-ready', all);
      prog.innerHTML = all ? (en ? '✓ All set! You can now apply.' : '✓ ¡Todo listo! Ya puedes inscribirte.')
                           : done + (en ? ' of ' : ' de ') + boxes.length + (en ? ' documents ready' : ' documentos listos');
    };
    list.addEventListener('change', update);
    update();
  });
})();
