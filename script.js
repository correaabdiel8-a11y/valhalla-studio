// ---- Nav scroll state ----
  const nav = document.getElementById('nav');

  // ---- Formulario de contacto: arma el mensaje y abre WhatsApp ----
  const contactForm = document.getElementById('contactForm');
  if (contactForm){
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const nombre = document.getElementById('cf-nombre').value.trim();
      const negocio = document.getElementById('cf-negocio').value.trim();
      const necesita = document.getElementById('cf-necesita').value;
      const presupuesto = document.getElementById('cf-presupuesto').value;
      const mensaje = document.getElementById('cf-mensaje').value.trim();

      let texto = `Hola, soy ${nombre || 'un negocio interesado'}.`;
      if (negocio) texto += ` Mi negocio es ${negocio}.`;
      if (necesita) texto += ` Necesito: ${necesita}.`;
      if (presupuesto) texto += ` Presupuesto aproximado: ${presupuesto}.`;
      if (mensaje) texto += ` ${mensaje}`;

      const url = 'https://wa.me/529621495348?text=' + encodeURIComponent(texto);
      window.open(url, '_blank', 'noopener');
    });
  }
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 30);
  }, { passive:true });

  // ---- Mobile menu toggle ----
  const navToggle = document.getElementById('navToggle');
  const mobilePanel = document.getElementById('mobilePanel');
  navToggle.addEventListener('click', () => {
    mobilePanel.classList.toggle('open');
  });
  mobilePanel.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => mobilePanel.classList.remove('open'));
  });

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const heroEl = document.querySelector('.hero');
  const glow = document.getElementById('cursorGlow');

  // ---- Reveal on scroll (single elements) — se repite cada vez que entra/sale ----
  const revealEls = document.querySelectorAll('.reveal');
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      entry.target.classList.toggle('is-visible', entry.isIntersecting);
    });
  }, { threshold:0.15 });
  revealEls.forEach(el => io.observe(el));

  // ---- Staggered reveal (grids) ----
  document.querySelectorAll('.stagger').forEach(group => {
    Array.from(group.children).forEach((child, i) => {
      child.style.setProperty('--i', i);
    });
  });
  const staggerIo = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      entry.target.classList.toggle('is-visible', entry.isIntersecting);
    });
  }, { threshold:0.1 });
  document.querySelectorAll('.stagger').forEach(el => staggerIo.observe(el));

  // ---- Fjord dividers draw-in on scroll — se repite cada vez ----
  const dividerIo = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      entry.target.classList.toggle('is-visible', entry.isIntersecting);
    });
  }, { threshold:0.4 });
  document.querySelectorAll('.fjord-divider').forEach(el => dividerIo.observe(el));
  const progressBar = document.getElementById('progressBar');
  function updateProgress(){
    const h = document.documentElement;
    const scrolled = h.scrollTop || document.body.scrollTop;
    const height = h.scrollHeight - h.clientHeight;
    progressBar.style.width = (height > 0 ? (scrolled / height) * 100 : 0) + '%';
  }
  window.addEventListener('scroll', updateProgress, { passive:true });
  updateProgress();

  // ---- Tilt effect on cards ----
  if (!prefersReduced && window.matchMedia('(hover: hover)').matches){
    document.querySelectorAll('.tilt').forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const r = card.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        card.style.setProperty('--rx', (px * 8).toFixed(2) + 'deg');
        card.style.setProperty('--ry', (py * -8).toFixed(2) + 'deg');
      });
      card.addEventListener('mouseleave', () => {
        card.style.setProperty('--rx', '0deg');
        card.style.setProperty('--ry', '0deg');
      });
    });
  }

  // ---- Cursor glow in hero (cached rect + rAF, sin retraso) ----
  if (!prefersReduced && window.matchMedia('(hover: hover)').matches){
    let heroRect = heroEl.getBoundingClientRect();
    let glowX = heroRect.width / 2, glowY = heroRect.height / 2;
    let glowRafPending = false;

    const refreshHeroRect = () => { heroRect = heroEl.getBoundingClientRect(); };
    window.addEventListener('resize', refreshHeroRect);
    window.addEventListener('scroll', refreshHeroRect, { passive:true });

    heroEl.addEventListener('mousemove', (e) => {
      glowX = e.clientX - heroRect.left;
      glowY = e.clientY - heroRect.top;
      if (!glowRafPending){
        glowRafPending = true;
        requestAnimationFrame(() => {
          glow.style.transform = `translate(${glowX}px, ${glowY}px) translate(-50%,-50%)`;
          glowRafPending = false;
        });
      }
    });
  }

  // ---- Parallax on topographic contour containers ----
  if (!prefersReduced){
    const contourBoxes = document.querySelectorAll('.contour-bg');
    let ticking = false;
    window.addEventListener('scroll', () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        contourBoxes.forEach(box => {
          const r = box.getBoundingClientRect();
          const offset = r.top * 0.06;
          box.style.transform = `translateY(${offset}px)`;
        });
        ticking = false;
      });
    }, { passive:true });
  }

  // ---- Match STUDIO width exactly to VALHALLA's VISIBLE width (y centrar ambos) ----
  function matchWordmark(){
    const main = document.getElementById('lineMain');
    const sub = document.getElementById('lineSub');
    if (!main || !sub) return;

    // letter-spacing deja un espacio "fantasma" tras la última letra que getBoundingClientRect
    // sí cuenta como ancho, pero que no es texto visible. Lo restamos para comparar anchos reales.
    const gMain = parseFloat(getComputedStyle(main).letterSpacing) || 0;
    const mainVisibleWidth = main.getBoundingClientRect().width - gMain;

    // Medimos STUDIO sin espaciado ni margen para tener su ancho base real
    sub.style.letterSpacing = '0px';
    sub.style.marginRight = '0px';
    const baseWidth = sub.getBoundingClientRect().width;

    const chars = sub.textContent.length;
    const gaps = Math.max(chars - 1, 1); // espacios internos entre letras (sin contar el final)
    const spacing = Math.max((mainVisibleWidth - baseWidth) / gaps, 0);

    sub.style.letterSpacing = spacing + 'px';
    sub.style.marginRight = (-spacing) + 'px'; // cancela su propio espacio final, igual que VALHALLA
  }

  if (document.fonts && document.fonts.ready){
    document.fonts.ready.then(matchWordmark);
  } else {
    window.addEventListener('load', matchWordmark);
  }
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(matchWordmark, 120);
  });
