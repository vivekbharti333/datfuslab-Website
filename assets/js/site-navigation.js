/* Shared navigation controller; capture prevents conflicting template handlers. */
(() => {
  const desktop = matchMedia('(min-width: 1200px)');
  let returnFocus;
  function drawer() { return document.querySelector('.xb-header-menu'); }
  function setDrawer(open) {
    const menu = drawer();
    if (!menu) return;
    menu.classList.toggle('active', open);
    menu.inert = desktop.matches || !open;
    menu.setAttribute('aria-hidden', String(!open));
    document.body.classList.toggle('body-overflow', open);
    document.querySelectorAll('.xb-nav-mobile').forEach(button => {
      button.classList.toggle('active', open);
      button.setAttribute('aria-expanded', String(open));
      button.setAttribute('aria-label', open ? 'Close navigation menu' : 'Open navigation menu');
    });
    if (open) {
      returnFocus = document.activeElement;
      menu.querySelector('button,a[href]')?.focus();
    } else if (returnFocus?.isConnected) { returnFocus.focus(); returnFocus = null; }
  }
  function setSubmenu(button, open) {
    button.setAttribute('aria-expanded', String(open));
    button.parentElement.classList.toggle('site-menu-open', open);
    if (!open) button.parentElement.querySelectorAll('.site-submenu-toggle[aria-expanded="true"]').forEach(child => setSubmenu(child, false));
  }
  function init() {
    document.querySelectorAll('.xb-header-menu .xb-menu-toggle').forEach(el => el.remove());
    let number = 0;
    document.querySelectorAll('.main-menu li.menu-item-has-children,.xb-header-menu li.menu-item-has-children').forEach(item => {
      const submenu = item.querySelector(':scope > ul');
      const link = item.querySelector(':scope > a');
      if (!submenu || !link || item.querySelector(':scope > .site-submenu-toggle')) return;
      if (item.closest('.xb-header-menu')) submenu.id = 'site-submenu-' + (++number);
      submenu.style.removeProperty('display');
      const button = document.createElement('button');
      button.type = 'button'; button.className = 'site-submenu-toggle';
      button.setAttribute('aria-label', 'Toggle ' + link.textContent.trim() + ' submenu');
      button.setAttribute('aria-expanded', 'false');
      if (item.closest('.xb-header-menu')) button.setAttribute('aria-controls', submenu.id);
      button.setAttribute('aria-haspopup', 'true');
      button.textContent = '+';
      item.append(button);
    });
    const close = document.querySelector('.xb-menu-close');
    if (close) { close.setAttribute('role', 'button'); close.tabIndex = 0; close.setAttribute('aria-label', 'Close navigation menu'); }
    setDrawer(false);
  }
  document.addEventListener('click', event => {
    const el = event.target.closest?.('.xb-nav-mobile,.xb-menu-close,.xb-header-menu-backdrop,.site-submenu-toggle');
    if (el) {
      event.preventDefault(); event.stopImmediatePropagation();
      if (el.matches('.site-submenu-toggle')) setSubmenu(el, el.getAttribute('aria-expanded') !== 'true');
      else setDrawer(el.matches('.xb-nav-mobile') && !drawer()?.classList.contains('active'));
      return;
    }
    if (event.target.closest?.('.xb-header-menu a[href]')) setDrawer(false);
    if (!event.target.closest?.('.main-menu')) document.querySelectorAll('.main-menu .site-submenu-toggle[aria-expanded="true"]').forEach(button => setSubmenu(button, false));
  }, true);
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
      if (drawer()?.classList.contains('active')) setDrawer(false);
      const item = event.target.closest?.('.site-menu-open');
      const button = item?.querySelector(':scope > .site-submenu-toggle');
      if (button) { setSubmenu(button, false); button.focus(); }
    }
    if ((event.key === 'Enter' || event.key === ' ') && event.target.matches('.xb-menu-close')) { event.preventDefault(); setDrawer(false); }
    if (event.key === 'Tab' && drawer()?.classList.contains('active')) {
      const focusable = [...drawer().querySelectorAll('a[href],button,[tabindex="0"]')].filter(el => el.getClientRects().length && !el.disabled);
      const first = focusable[0], last = focusable.at(-1);
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    }
  }, true);
  desktop.addEventListener('change', () => {
    setDrawer(false);
    document.querySelectorAll('.site-submenu-toggle').forEach(button => setSubmenu(button, false));
  });
  function hideLoader() {
    const loader = document.getElementById('xb-loadding');
    if (loader) { loader.style.display = 'none'; loader.setAttribute('aria-hidden', 'true'); }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, {once:true}); else init();
  if (document.readyState === 'complete') hideLoader(); else window.addEventListener('load', hideLoader, {once:true});
  setTimeout(hideLoader, 4000);
})();
