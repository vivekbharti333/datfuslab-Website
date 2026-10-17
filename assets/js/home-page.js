(() => {
  const assets = new URL('.', document.currentScript.src);
  const serviceItems = Array.from(document.querySelectorAll('.service-list-item'));
  function selectService(index) {
    serviceItems.forEach((item, position) => item.classList.toggle('current', position === index));
    document.querySelectorAll('.service-images .service-image-item').forEach((item, position) => item.classList.toggle('active', position === index));
    document.querySelectorAll('.service-content-image .xb-item--img').forEach((item, position) => item.classList.toggle('active', position === index));
  }
  serviceItems.forEach((item,index) => {
    item.addEventListener('mouseenter', () => selectService(index));
    item.addEventListener('click', () => selectService(index));
    item.addEventListener('focusin', () => selectService(index));
  });
  const slider = document.querySelector('.testimonial-slider');
  if (!slider) return;
  let initialized = false;
  const observer = new IntersectionObserver(async entries => {
    if (initialized || !entries.some(entry => entry.isIntersecting)) return;
    initialized = true; observer.disconnect();
    const css = document.createElement('link'); css.rel='stylesheet'; css.href=new URL('../css/swiper.min.css',assets);
    const script = document.createElement('script'); script.src=new URL('swiper.min.js',assets);
    const load = el => new Promise((resolve,reject) => { el.onload=resolve;el.onerror=reject;document.head.append(el); });
    try {
      await Promise.all([load(css),load(script)]);
      new Swiper(slider, {
        loop:true,spaceBetween:30,speed:400,slidesPerView:3,centeredSlides:true,
        autoplay:matchMedia('(prefers-reduced-motion: reduce)').matches?false:{delay:6000,disableOnInteraction:false},
        pagination:{el:slider.querySelector('.swiper-pagination'),type:'fraction'},
        navigation:{nextEl:slider.querySelector('.swiper-button-next'),prevEl:slider.querySelector('.swiper-button-prev')},
        breakpoints:{0:{slidesPerView:1},768:{slidesPerView:2},1600:{slidesPerView:3}}
      });
    } catch { initialized=false; }
  }, {rootMargin:'300px'});
  observer.observe(slider);
})();
