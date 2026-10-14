/* forms.js — formularios (Egresados, Contáctanos) y correos de Trabaja con nosotros (ES/EN).
   Campos con el color de la página, validación amable, envío a Formspree en segundo plano
   con estados del botón, y correos que se copian con un clic.
   Estilos en styles.css, sección "FORMULARIOS". */
(function(){
  var en = document.documentElement.lang === 'en';
  var T = en ? {
    required: 'Please fill in this field.', email: 'Check the email address — it looks incomplete.',
    number: 'Enter a valid year.', consent: 'Please accept the data policy to continue.',
    sending: 'Sending…', sent: 'Sent!', error: 'We couldn\'t send it. Please try again.',
    thanks: 'Thank you!', thanksText: 'We received your message and will get back to you soon.',
    again: 'Send another', copied: 'Email copied ✓', copy: 'Click to copy'
  } : {
    required: 'Completa este campo.', email: 'Revisa el correo, parece incompleto.',
    number: 'Escribe un año válido.', consent: 'Acepta la política de datos para continuar.',
    sending: 'Enviando…', sent: '¡Enviado!', error: 'No pudimos enviarlo. Inténtalo de nuevo.',
    thanks: '¡Gracias!', thanksText: 'Recibimos tu mensaje y pronto nos pondremos en contacto contigo.',
    again: 'Enviar otro', copied: '¡Correo copiado! ✓', copy: 'Clic para copiar'
  };

  // color de la página (el del encabezado) para los campos
  var hero = document.querySelector('.page-hero');
  var acc = hero && getComputedStyle(hero).getPropertyValue('--acc').trim();

  document.querySelectorAll('form.alumni-form, form.contact-form').forEach(function(form){
    form.noValidate = true;
    form.classList.add('smart-form');
    if(acc) form.style.setProperty('--form-acc', acc);
    var btn = form.querySelector('button[type="submit"]');
    var btnLabel = btn.innerHTML;
    var fields = form.querySelectorAll('input:not([type="hidden"]), textarea');

    var msgFor = function(el){
      var v = el.validity;
      if(el.type === 'checkbox') return T.consent;
      if(v.valueMissing) return T.required;
      if(v.typeMismatch && el.type === 'email') return T.email;
      if(v.rangeUnderflow || v.rangeOverflow || v.badInput) return T.number;
      return el.validationMessage;
    };
    var box = function(el){ return el.closest('.field') || el.closest('.consent'); };
    var check = function(el, show){
      var b = box(el);
      if(!b) return true;
      var ok = el.checkValidity();
      var filled = el.type === 'checkbox' ? el.checked : el.value.trim() !== '';
      b.classList.toggle('ok', ok && filled);
      var err = b.querySelector('.f-err');
      if(!ok && show){
        if(!err){ err = document.createElement('span'); err.className = 'f-err'; err.setAttribute('role', 'alert'); b.appendChild(err); }
        err.textContent = msgFor(el);
        b.classList.add('bad');
        el.setAttribute('aria-invalid', 'true');
      } else if(ok){
        if(err) err.remove();
        b.classList.remove('bad');
        el.removeAttribute('aria-invalid');
      }
      return ok;
    };
    fields.forEach(function(el){
      el.addEventListener('input', function(){ check(el, box(el).classList.contains('bad')); });
      el.addEventListener('change', function(){ check(el, box(el).classList.contains('bad')); });
      el.addEventListener('blur', function(){ if(el.value.trim() !== '' || el.type === 'checkbox') check(el, true); });
    });

    form.addEventListener('submit', function(e){
      e.preventDefault();
      var first = null;
      fields.forEach(function(el){ if(!check(el, true) && !first) first = el; });
      if(first){ first.focus(); return; }
      if(btn.disabled) return;
      btn.disabled = true;
      btn.classList.add('is-sending');
      btn.innerHTML = '<span class="spin" aria-hidden="true"></span>' + T.sending;
      fetch(form.action, {method: 'POST', body: new FormData(form), headers: {'Accept': 'application/json'}})
        .then(function(r){ if(!r.ok) throw new Error(r.status); return r; })
        .then(function(){
          btn.classList.remove('is-sending');
          btn.classList.add('is-sent');
          btn.innerHTML = '✓ ' + T.sent;
          setTimeout(function(){
            var done = document.createElement('div');
            done.className = 'form-done';
            done.setAttribute('role', 'status');
            done.innerHTML = '<span class="fd-ic" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg></span>' +
              '<h3>' + T.thanks + '</h3><p>' + T.thanksText + '</p><button type="button" class="btn btn-ink">' + T.again + '</button>';
            form.classList.add('is-done');
            form.appendChild(done);
            done.querySelector('button').addEventListener('click', function(){
              form.reset();
              form.querySelectorAll('.ok').forEach(function(b){ b.classList.remove('ok'); });
              done.remove();
              form.classList.remove('is-done');
              btn.disabled = false;
              btn.classList.remove('is-sent');
              btn.innerHTML = btnLabel;
            });
          }, 900);
        })
        .catch(function(){
          btn.disabled = false;
          btn.classList.remove('is-sending');
          btn.innerHTML = btnLabel;
          var err = form.querySelector('.form-error');
          if(!err){ err = document.createElement('p'); err.className = 'form-error'; err.setAttribute('role', 'alert'); btn.parentNode.insertAdjacentElement('afterend', err); }
          err.textContent = T.error;
        });
    });
  });

  /* ── Trabaja con nosotros: correos que se copian con un clic ── */
  document.querySelectorAll('.safety-alert a[href^="mailto:"]').forEach(function(a){
    if(!navigator.clipboard) return;
    var addr = a.textContent.trim();
    a.title = T.copy;
    a.classList.add('copy-mail');
    var timer;
    a.addEventListener('click', function(e){
      e.preventDefault();
      navigator.clipboard.writeText(addr).then(function(){
        clearTimeout(timer);
        a.textContent = T.copied;
        a.classList.add('copied');
        timer = setTimeout(function(){ a.textContent = addr; a.classList.remove('copied'); }, 1800);
      }, function(){ window.location.href = a.href; });
    });
  });
})();
