/* Shared navigation without the template's unused plugin bundle. */
(() => {
  const original = document.querySelector('.stricky');
  let sticky;
  if (original) original.classList.add('original');
  function createSticky() {
    if (!original || sticky) return;
    sticky = original.cloneNode(true);
    sticky.classList.remove('original');
    sticky.classList.add('stricked-menu');
    original.after(sticky);
  }
  document.querySelectorAll('.xb-header-menu li.menu-item-has-children').forEach(item => {
    if (item.querySelector(':scope > .xb-menu-toggle')) return;
    const toggle = document.createElement('button');
    toggle.type = 'button'; toggle.className = 'xb-menu-toggle';
    toggle.setAttribute('aria-label', 'Toggle submenu');
    toggle.setAttribute('aria-expanded', 'false');
    item.append(toggle);
  });
  const menu = document.querySelector('.xb-header-menu');
  function mobileMenu(open) {
    menu?.classList.toggle('active', open);
    document.body.classList.toggle('body-overflow', open);
    document.querySelectorAll('.xb-nav-mobile').forEach(toggle => {
      toggle.classList.toggle('active', open);
      toggle.setAttribute('aria-expanded', String(open));
    });
  }
  document.addEventListener('click', event => {
    const target = event.target;
    if (target.closest('.xb-nav-mobile')) { event.preventDefault(); mobileMenu(!menu?.classList.contains('active')); }
    if (target.closest('.xb-menu-close,.xb-header-menu-backdrop')) { event.preventDefault(); mobileMenu(false); }
    const toggle = target.closest('.xb-menu-toggle');
    if (toggle) {
      event.preventDefault();
      const submenu = toggle.parentElement.querySelector(':scope > ul');
      const open = toggle.getAttribute('aria-expanded') !== 'true';
      toggle.classList.toggle('active', open); toggle.setAttribute('aria-expanded', String(open));
      if (submenu) { submenu.classList.toggle('active', open); submenu.style.display = open ? 'block' : 'none'; }
    }
    if (target.closest('.xb-backtotop .scroll')) { event.preventDefault(); window.scrollTo({top:0,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'}); }
    const dismiss = target.closest('[data-bs-dismiss="alert"]');
    if (dismiss) dismiss.closest('.alert')?.remove();
  });
  document.addEventListener('keydown', event => { if (event.key === 'Escape') mobileMenu(false); });
  let ticking = false;
  function scroll() {
    ticking = false;
    if (scrollY > 150) createSticky();
    sticky?.classList.toggle('stricky-fixed', scrollY > 150);
    if (sticky) sticky.inert = scrollY <= 150;
    document.querySelector('.xb-backtotop')?.classList.toggle('active', scrollY > 500);
  }
  addEventListener('scroll', () => { if (!ticking) { ticking=true; requestAnimationFrame(scroll); } }, {passive:true});
  const backgroundObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      el.style.backgroundImage = `url("${el.dataset.background}")`;
      backgroundObserver.unobserve(el);
    });
  }, {rootMargin:'300px'});
  document.querySelectorAll('[data-background]').forEach(el => {
    if (!el.style.backgroundImage) backgroundObserver.observe(el);
  });
  document.querySelectorAll('[data-bg-color]').forEach(el => { el.style.backgroundColor = el.dataset.bgColor; });
})();
