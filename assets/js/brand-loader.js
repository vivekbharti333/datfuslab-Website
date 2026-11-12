/* No minimum delay: dismiss on load, or after at most 1.8 seconds from navigation. */
(() => {
  const loader = document.getElementById('brand-page-loader');
  if (!loader) return;
  let timer;
  function dismiss() {
    loader.hidden = true;
    clearTimeout(timer);
    window.removeEventListener('load', dismiss);
  }
  const elapsed = window.performance ? window.performance.now() : 0;
  if (document.readyState === 'complete' || elapsed >= 1800) {
    dismiss();
    return;
  }
  // Fail closed if the stylesheet is missing: never insert a loader into page flow.
  if (window.getComputedStyle(loader).position !== 'fixed') return;
  loader.hidden = false;
  window.addEventListener('load', dismiss, {once:true});
  window.addEventListener('pageshow', event => { if (event.persisted) dismiss(); });
  loader.querySelector('.brand-loader-animation')?.addEventListener('error', dismiss, {once:true});
  timer = setTimeout(dismiss, Math.max(0, 1800 - elapsed));
})();
