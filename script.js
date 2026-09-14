const hero = document.querySelector('.hero-container');
const background = document.querySelector('.background-wrapper img');
const siteHeader = document.querySelector('.site-header');

if (siteHeader) {
  let previousScroll = window.scrollY;
  let ticking = false;

  const updateHeader = () => {
    const currentScroll = window.scrollY;
    if (currentScroll <= 24) {
      siteHeader.classList.remove('is-hidden');
    } else if (currentScroll > previousScroll) {
      siteHeader.classList.add('is-hidden');
    } else if (currentScroll < previousScroll) {
      siteHeader.classList.remove('is-hidden');
    }
    previousScroll = currentScroll;
    ticking = false;
  };

  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(updateHeader);
      ticking = true;
    }
  }, { passive: true });

  window.addEventListener('pointermove', (event) => {
    if (event.clientY < 90) siteHeader.classList.remove('is-hidden');
  }, { passive: true });

  siteHeader.addEventListener('focusin', () => siteHeader.classList.remove('is-hidden'));
}

if (hero && background) {
  hero.addEventListener('pointermove', (event) => {
    const bounds = hero.getBoundingClientRect();
    const x = ((event.clientX - bounds.left) / bounds.width - 0.5) * 10;
    const y = ((event.clientY - bounds.top) / bounds.height - 0.5) * 10;
    background.style.transform = `scale(1.04) translate(${x}px, ${y}px)`;
  });

  hero.addEventListener('pointerleave', () => {
    background.style.transform = 'scale(1.04) translate(0, 0)';
  });
}

const imageTrack = document.querySelector('.framer-1p3njx7-container');

if (imageTrack) {
  [...imageTrack.children].forEach((figure) => {
    const clone = figure.cloneNode(true);
    clone.setAttribute('aria-hidden', 'true');
    clone.querySelectorAll('button').forEach((button) => button.remove());
    clone.querySelector('img')?.setAttribute('alt', '');
    imageTrack.appendChild(clone);
  });
}

document.querySelectorAll('.service-item, .footer-services a').forEach((serviceItem) => {
  const sourceImage = serviceItem.querySelector('.service-image img');
  if (!sourceImage) return;

  let preview;

  serviceItem.addEventListener('pointerenter', (event) => {
    preview = document.createElement('div');
    preview.className = 'service-cursor-preview';
    preview.innerHTML = `<img src="${sourceImage.currentSrc || sourceImage.src}" alt="" />`;
    document.body.appendChild(preview);
    window.requestAnimationFrame(() => preview?.classList.add('is-visible'));
    serviceItem.classList.add('is-hovered');
    preview.style.left = `${event.clientX + 24}px`;
    preview.style.top = `${event.clientY - 100}px`;
  });

  serviceItem.addEventListener('pointermove', (event) => {
    if (!preview) return;
    const offsetX = event.clientX > window.innerWidth - 260 ? -224 : 24;
    preview.style.left = `${event.clientX + offsetX}px`;
    preview.style.top = `${Math.max(18, event.clientY - 100)}px`;
  });

  serviceItem.addEventListener('pointerleave', () => {
    serviceItem.classList.remove('is-hovered');
    preview?.remove();
    preview = null;
  });
});

const countElements = document.querySelectorAll('[data-count]');
const countSection = document.querySelector('.studio-section, .contact-stats-section');

if (countElements.length && countSection) {
  const animateCounts = () => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    countElements.forEach((element) => {
      const target = Number(element.dataset.count);
      const suffix = element.dataset.suffix || '';
      if (reducedMotion) {
        element.textContent = `${target}${suffix}`;
        return;
      }

      const start = performance.now();
      const duration = 1100;
      const tick = (now) => {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        element.textContent = `${Math.floor(target * eased)}${suffix}`;
        if (progress < 1) window.requestAnimationFrame(tick);
      };
      window.requestAnimationFrame(tick);
    });
  };

  const countObserver = new IntersectionObserver((entries, observer) => {
    if (!entries.some((entry) => entry.isIntersecting)) return;
    animateCounts();
    observer.disconnect();
  }, { threshold: 0.35 });

  countObserver.observe(countSection);
}

document.querySelectorAll('.service-accordion-header').forEach((header) => {
  header.addEventListener('click', () => {
    const item = header.closest('.service-accordion-item');
    const isOpen = item.classList.contains('is-open');

    document.querySelectorAll('.service-accordion-item').forEach((otherItem) => {
      otherItem.classList.remove('is-open');
      otherItem.querySelector('.service-accordion-header').setAttribute('aria-expanded', 'false');
      otherItem.querySelector('.accordion-icon').textContent = '+';
    });

    if (!isOpen) {
      item.classList.add('is-open');
      header.setAttribute('aria-expanded', 'true');
      item.querySelector('.accordion-icon').textContent = '−';
    }
  });
});

const featuredProject = document.querySelector('.featured-project');

if (featuredProject) {
  const slides = [...featuredProject.querySelectorAll('.featured-project-slide')];
  const index = featuredProject.querySelector('.featured-index');
  const previous = featuredProject.querySelector('.featured-project-prev');
  const next = featuredProject.querySelector('.featured-project-next');
  let activeSlide = 0;
  let timer;

  const showSlide = (nextIndex) => {
    activeSlide = (nextIndex + slides.length) % slides.length;
    slides.forEach((slide, slideIndex) => slide.classList.toggle('is-active', slideIndex === activeSlide));
    if (index) index.textContent = `${String(activeSlide + 1).padStart(2, '0')}/${String(slides.length).padStart(2, '0')}`;
  };

  const restartTimer = () => {
    window.clearInterval(timer);
    timer = window.setInterval(() => showSlide(activeSlide + 1), 5000);
  };

  previous?.addEventListener('click', () => { showSlide(activeSlide - 1); restartTimer(); });
  next?.addEventListener('click', () => { showSlide(activeSlide + 1); restartTimer(); });
  featuredProject.addEventListener('mouseenter', () => window.clearInterval(timer));
  featuredProject.addEventListener('mouseleave', restartTimer);
  restartTimer();
}
