(() => {
  const carousel = document.querySelector('.donexia-testimonials');
  if (!carousel) return;
  const track = carousel.querySelector('.donexia-testimonials-track');
  const viewport = carousel.querySelector('.donexia-testimonials-window');
  const cards = Array.from(track.children);
  const dots = Array.from(carousel.querySelectorAll('[data-testimonial]'));
  const status = carousel.querySelector('[data-testimonial-status]');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let current = 0;

  let moving = false;
  let activeAnimation = null;
  let timer = null;
  let inView = false;

  function update(announce = false) {
    dots.forEach((dot, index) => dot.setAttribute('aria-pressed', String(index === current)));
    const visible = Math.round(viewport.clientWidth / track.firstElementChild.getBoundingClientRect().width);
    Array.from(track.children).forEach((card, index) => card.setAttribute('aria-hidden', String(index >= visible)));
    if (announce) status.textContent = cards[current].querySelector('h3').textContent + ', testimonial ' + (current + 1) + ' of ' + cards.length;
  }

  async function step(direction, announce) {
    const gap = parseFloat(getComputedStyle(track).gap) || 0;
    const distance = track.firstElementChild.getBoundingClientRect().width + gap;
    let duplicate;
    if (direction > 0) {
      duplicate = track.firstElementChild.cloneNode(true);
      duplicate.setAttribute('aria-hidden', 'true');
      duplicate.inert = true;
      track.appendChild(duplicate);
    } else {
      track.prepend(track.lastElementChild);
    }
    activeAnimation = track.animate([
      {transform: `translateX(${direction > 0 ? 0 : -distance}px)`},
      {transform: `translateX(${direction > 0 ? -distance : 0}px)`}
    ], {duration: reducedMotion.matches ? 0 : 600, easing: 'cubic-bezier(.22,.61,.36,1)', fill: 'forwards'});
    await activeAnimation.finished;
    if (direction > 0) {
      duplicate.remove();
      track.appendChild(track.firstElementChild);
    }
    activeAnimation.cancel();
    activeAnimation = null;
    current = (current + direction + cards.length) % cards.length;
    update(announce);
  }
  async function move(direction, count = 1, announce = true) {
    if (moving) return;
    moving = true;
    try {
      for (let i = 0; i < count; i++) await step(direction, announce && i === count - 1);
    } finally { moving = false; }
  }
  carousel.querySelector('.testimonial-prev').addEventListener('click', () => move(-1));
  carousel.querySelector('.testimonial-next').addEventListener('click', () => move(1));
  dots.forEach(dot => dot.addEventListener('click', () => {
    const distance = (Number(dot.dataset.testimonial) - current + cards.length) % cards.length;
    if (distance) move(distance > cards.length / 2 ? -1 : 1, Math.min(distance, cards.length - distance));
  }));
  viewport.addEventListener('keydown', event => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    move(event.key === 'ArrowRight' ? 1 : -1);
  });
  let touchStart = null;
  viewport.addEventListener('touchstart', event => { touchStart = event.changedTouches[0].clientX; }, {passive: true});
  viewport.addEventListener('touchend', event => {
    if (touchStart === null) return;
    const distance = event.changedTouches[0].clientX - touchStart;
    if (Math.abs(distance) > 45) move(distance < 0 ? 1 : -1);
    touchStart = null;
  }, {passive: true});
  function schedule() {
    clearInterval(timer);
    if (!inView || reducedMotion.matches || document.hidden || carousel.matches(':hover') || carousel.contains(document.activeElement)) return;
    timer = setInterval(() => move(1, 1, false), 4000);
  }
  carousel.addEventListener('mouseenter', () => clearInterval(timer));
  carousel.addEventListener('mouseleave', schedule);
  carousel.addEventListener('focusin', () => clearInterval(timer));
  carousel.addEventListener('focusout', () => setTimeout(schedule, 0));
  document.addEventListener('visibilitychange', schedule);
  reducedMotion.addEventListener('change', schedule);
  new IntersectionObserver(entries => { inView = entries[0].isIntersecting; schedule(); }, {threshold: .2}).observe(carousel);
  const observer = new ResizeObserver(() => { if (activeAnimation) activeAnimation.finish(); else update(); });
  observer.observe(viewport);
})();
