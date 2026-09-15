// Supabase browser client.
// Only the publishable key belongs in client-side code. Never put the service
// role key here: it bypasses Row Level Security and must stay server-side.
const SUPABASE_URL = 'https://afixydlauedkpgplqzbc.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_5uotdJcv0WqSC5YCIiDEdw_kW9jHYOV';

const createSupabaseRestClient = ({ url, apiKey }) => {
  const request = async (path, options = {}) => {
    const response = await fetch(`${url}/rest/v1/${path}`, {
      ...options,
      headers: {
        apikey: apiKey,
        Authorization: `Bearer ${apiKey}`,
        Accept: 'application/json',
        ...(options.headers || {})
      }
    });

    if (!response.ok) {
      const message = await response.text();
      throw new Error(`Supabase request failed (${response.status}): ${message}`);
    }

    return response.status === 204 ? null : response.json();
  };

  return {
    from: (table) => ({
      select: (columns = '*', query = '') => request(`${table}?select=${encodeURIComponent(columns)}${query ? `&${query}` : ''}`),
      insert: (rows) => request(table, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Prefer: 'return=representation' },
        body: JSON.stringify(rows)
      })
    }),
    request
  };
};

window.projectskevvDb = createSupabaseRestClient({
  url: SUPABASE_URL,
  apiKey: SUPABASE_PUBLISHABLE_KEY
});

const journalListing = document.querySelector('.journal-page #journal-articles');
if (journalListing) {
  const journalMedia = (url, title) => {
    if (!url) return '<div class="article-image article-image-empty" aria-hidden="true"></div>';
    const cleanUrl = String(url).trim();
    const isVideo = /\.(mp4|webm|mov|m4v)(\?|#|$)/i.test(cleanUrl);
    return isVideo
      ? `<div class="article-image"><video src="${cleanUrl}" autoplay muted loop playsinline aria-label="${title}"></video></div>`
      : `<div class="article-image"><img src="${cleanUrl}" alt="${title}" /></div>`;
  };
  const renderJournalListing = async () => {
    journalListing.innerHTML = '';
    try {
      const posts = await window.projectskevvDb.from('journal_posts').select('id,title,slug,description,cover_image_url,tag,minutes_read,status,published_at,created_at', 'status=eq.published&order=published_at.desc.nullslast,created_at.desc');
      journalListing.innerHTML = '';
      if (!posts.length) {
        journalListing.innerHTML = '<p class="journal-empty-state">No journal articles published yet.</p>';
        return;
      }
      posts.forEach((post) => {
        const title = post.title || 'Untitled journal';
        const slug = encodeURIComponent(post.slug || post.id);
        const card = document.createElement('a');
        card.className = 'article-card';
        card.href = `./${slug}/index.html`;
        card.innerHTML = `${journalMedia(post.cover_image_url, title)}<div class="article-content"><span class="read-time">${post.minutes_read || 1} min read</span><h2>${title}</h2><span class="read-link">READ ARTICLE <span aria-hidden="true">↗</span></span></div>`;
        journalListing.appendChild(card);
      });
    } catch (error) {
      journalListing.innerHTML = '<p class="journal-empty-state">Journal articles are unavailable right now.</p>';
      console.error(error);
    }
  };
  renderJournalListing();
}

const journalArticle = document.querySelector('.journal-article-page');
const isPublicJournalArticle = journalArticle && !new URLSearchParams(window.location.search).has('cms');
if (isPublicJournalArticle) {
  const articlePath = window.location.pathname.split('/').filter(Boolean);
  const articleSlug = articlePath.at(-1) === 'index.html' ? articlePath.at(-2) : articlePath.at(-1);
  const renderJournalArticle = async () => {
    try {
      const posts = await window.projectskevvDb.from('journal_posts').select('title,slug,description,content_html,cover_image_url,tag,minutes_read,author_name,author_role,author_image_url,published_at', `status=eq.published&slug=eq.${encodeURIComponent(articleSlug)}`);
      const post = posts[0];
      if (!post) {
        document.querySelector('main').innerHTML = '<section class="journal-empty-state"><p>This journal article is not published.</p></section>';
        return;
      }
      const setText = (selector, value) => { const element = document.querySelector(selector); if (element) element.textContent = value || ''; };
      setText('.journal-article-hero h1', (post.title || 'Untitled journal').toUpperCase());
      setText('.journal-article-hero p', post.description);
      setText('.journal-article-read-time', `${post.minutes_read || 1} MIN READ`);
      setText('.journal-article-meta span:first-child strong', post.tag);
      setText('.journal-author strong', post.author_name);
      setText('.journal-author span', post.author_role);
      const cover = document.querySelector('.journal-article-feature figure');
      if (cover && post.cover_image_url) cover.innerHTML = /\.(mp4|webm|mov|m4v)(\?|#|$)/i.test(post.cover_image_url) ? `<video src="${post.cover_image_url}" autoplay muted loop playsinline></video>` : `<img src="${post.cover_image_url}" alt="${post.title || ''}" />`;
      const authorImage = document.querySelector('.journal-author img'); if (authorImage && post.author_image_url) authorImage.src = post.author_image_url;
      const copy = document.querySelector('.journal-article-copy'); if (copy) copy.innerHTML = post.content_html || '';
    } catch (error) {
      document.querySelector('main').innerHTML = '<section class="journal-empty-state"><p>Journal article unavailable right now.</p></section>';
      console.error(error);
    }
  };
  renderJournalArticle();
}

const hero = document.querySelector('.hero-container');
const background = document.querySelector('.background-wrapper img');
const siteHeader = document.querySelector('.site-header');

const serviceRoutes = {
  branding: './branding/index.html'
};

document.querySelectorAll('.services-page .service-item').forEach((serviceItem) => {
  const serviceName = serviceItem.querySelector('.service-name')?.textContent.trim().toLowerCase();
  if (serviceName && serviceRoutes[serviceName]) serviceItem.href = serviceRoutes[serviceName];
});

if (siteHeader) {
  const desktopNav = siteHeader.querySelector('.site-nav');
  const menuButton = document.createElement('button');
  menuButton.className = 'mobile-menu-toggle';
  menuButton.type = 'button';
  menuButton.setAttribute('aria-label', 'Open navigation menu');
  menuButton.setAttribute('aria-expanded', 'false');
  menuButton.innerHTML = '<span></span><span></span><span></span>';
  siteHeader.appendChild(menuButton);

  const backdrop = document.createElement('button');
  backdrop.className = 'mobile-sidebar-backdrop';
  backdrop.type = 'button';
  backdrop.setAttribute('aria-label', 'Close navigation menu');

  const sidebar = document.createElement('aside');
  sidebar.className = 'mobile-sidebar';
  sidebar.id = 'mobile-navigation';
  sidebar.setAttribute('aria-label', 'Mobile navigation');
  sidebar.setAttribute('aria-hidden', 'true');
  sidebar.innerHTML = '<div class="mobile-sidebar-header"><span>MENU</span><button class="mobile-sidebar-close" type="button" aria-label="Close navigation menu">×</button></div>';
  const mobileNav = desktopNav?.cloneNode(true);
  if (mobileNav) {
    mobileNav.className = 'mobile-sidebar-nav';
    sidebar.appendChild(mobileNav);
  }
  document.body.append(backdrop, sidebar);

  const setMenuOpen = (isOpen) => {
    document.body.classList.toggle('mobile-menu-open', isOpen);
    sidebar.setAttribute('aria-hidden', String(!isOpen));
    menuButton.setAttribute('aria-expanded', String(isOpen));
    menuButton.setAttribute('aria-label', isOpen ? 'Close navigation menu' : 'Open navigation menu');
    if (isOpen) sidebar.querySelector('.mobile-sidebar-close')?.focus();
  };

  menuButton.addEventListener('click', () => setMenuOpen(!document.body.classList.contains('mobile-menu-open')));
  backdrop.addEventListener('click', () => setMenuOpen(false));
  sidebar.querySelector('.mobile-sidebar-close')?.addEventListener('click', () => setMenuOpen(false));
  sidebar.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => setMenuOpen(false)));
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && document.body.classList.contains('mobile-menu-open')) setMenuOpen(false);
  });

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
const countSection = document.querySelector('.studio-section, .contact-stats-section, .about-team-section');

if (countElements.length && countSection) {
  const animateCounts = () => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    countElements.forEach((element) => {
      const target = Number(element.dataset.count);
      const prefix = element.dataset.prefix || '';
      const suffix = element.dataset.suffix || '';
      if (reducedMotion) {
        element.textContent = `${prefix}${target}${suffix}`;
        return;
      }

      const start = performance.now();
      const duration = 1100;
      const tick = (now) => {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        element.textContent = `${prefix}${Math.floor(target * eased)}${suffix}`;
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

document.querySelectorAll('.about-studio-play').forEach((button) => {
  button.addEventListener('click', () => {
    const video = button.closest('.about-studio-video')?.querySelector('video');
    if (!video) return;
    if (video.paused) {
      video.play();
      button.textContent = '❚❚';
    } else {
      video.pause();
      button.textContent = '▶';
    }
  });
});

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

// CMS preview editing mode. This runs inside the previewed page itself so it
// also works when the admin shell and page are served from different origins.
const cmsPreview = new URLSearchParams(window.location.search).get('cms') === '1';

if (cmsPreview) {
  const isCmsServiceDetail = document.body.classList.contains('service-detail-page');
  const isCmsJournalDetail = document.body.classList.contains('journal-article-page');
  const isCmsProjectDetail = document.body.classList.contains('project-detail-page') && !isCmsServiceDetail;
  const postCmsProjectChange = (payload) => {
    if (isCmsProjectDetail && window.parent !== window) window.parent.postMessage({ source: 'projectskevv-cms-project', ...payload }, '*');
  };
  const postCmsServiceChange = (payload) => {
    if (isCmsServiceDetail && window.parent !== window) window.parent.postMessage({ source: 'projectskevv-cms-service', ...payload }, '*');
  };
  const postCmsJournalChange = (payload) => {
    if (isCmsJournalDetail && window.parent !== window) window.parent.postMessage({ source: 'projectskevv-cms-journal', ...payload }, '*');
  };
  if (isCmsJournalDetail) {
    const journalEditorMediaStyle = document.createElement('style');
    journalEditorMediaStyle.textContent = '.journal-article-copy img, .journal-article-copy video { display:block; height:auto; max-width:100%; } .journal-article-copy figure { margin: 18px 0; max-width:100%; }';
    document.head.appendChild(journalEditorMediaStyle);
  }
  const applyCmsProjectDraft = (project) => {
    if (!isCmsProjectDetail || !project) return;
    const title = document.querySelector('.project-detail-title-wrap h1');
    const description = document.querySelector('.project-detail-description');
    const website = document.querySelector('.project-detail-button-primary');
    const tag = document.querySelector('.meta-row .meta-label:nth-child(2)');
    const summary = document.querySelector('.project-summary');
    const meta = [...document.querySelectorAll('.project-detail-meta dd')];
    if (title) title.textContent = (project.title || 'Untitled project').toUpperCase();
    if (description) description.textContent = project.description || 'Add a project description.';
    if (website) website.href = project.website || '#';
    if (tag) tag.textContent = project.tag || 'Add tag';
    if (summary) summary.textContent = project.text || 'Add project text.';
    if (meta[0]) meta[0].textContent = project.duration || 'Add duration';
    if (meta[1]) meta[1].textContent = project.client || 'Add client';
    const setProjectMedia = (container, source, alt) => {
      if (!container) return;
      const videoSource = /\.(mp4|webm|ogg|mov)(?:[?#].*)?$/i.test(String(source || '').trim());
      let media = container.querySelector('img, video');
      if (media && ((videoSource && media.tagName.toLowerCase() !== 'video') || (!videoSource && media.tagName.toLowerCase() !== 'img'))) { media.remove(); media = null; }
      if (!media) { media = document.createElement(videoSource ? 'video' : 'img'); container.appendChild(media); }
      media.src = source || '';
      media.alt = alt || '';
      media.classList.add('cms-editor-target');
      media.dataset.editorLabel = videoSource ? 'Video' : 'Image';
      if (videoSource) { media.controls = true; media.muted = true; media.playsInline = true; media.load(); }
    };
    setProjectMedia(document.querySelector('.project-detail-lead-image'), project.image, project.title);
    const gallery = document.querySelector('.image-gallery');
    if (gallery) {
      gallery.innerHTML = '';
      (project.gallery || []).forEach((source, index) => {
        const figure = document.createElement('figure');
        figure.className = `gallery-item ${index === 0 ? 'gallery-item-large' : 'gallery-item-medium'}`;
        setProjectMedia(figure, source, `${project.title || 'Project'} gallery media ${index + 1}`);
        gallery.appendChild(figure);
      });
    }
  };
  const applyCmsServiceDraft = (service) => {
    if (!isCmsServiceDetail || !service) return;
    const setText = (selector, value) => { const element = document.querySelector(selector); if (element) element.textContent = value || ''; };
    setText('#service-title', (service.title || 'Untitled service').toUpperCase());
    setText('.project-detail-description', service.description);
    setText('.project-detail-meta dd:nth-of-type(1)', service.scope);
    setText('.project-detail-meta dd:nth-of-type(2)', service.timeline);
    setText('#service-showcase-title', service.applicationTitle);
    setText('.service-showcase-intro > p', service.applicationDescription);
    ['detail1', 'detail2', 'detail3'].forEach((key, index) => { setText(`.service-showcase-detail:nth-of-type(${index + 1}) h3`, service[`${key}Title`]); setText(`.service-showcase-detail:nth-of-type(${index + 1}) p`, service[`${key}Description`]); });
    setText('.service-showcase-feature h3', service.featureTitle);
    setText('.service-showcase-feature p', service.featureText);
    const hero = document.querySelector('.project-detail-lead-image img'); if (hero) hero.src = service.image || '';
    [...document.querySelectorAll('.service-showcase-visuals img')].forEach((image, index) => { if (service.applicationVisuals?.[index]) image.src = service.applicationVisuals[index]; });
    [service.detail1Image, service.detail2Image, service.detail3Image].forEach((source, index) => { const image = document.querySelectorAll('.service-showcase-detail figure img')[index]; if (image && source) image.src = source; });
    const feature = document.querySelector('.service-showcase-feature figure img'); if (feature) feature.src = service.featureImage || '';
    const website = document.querySelector('.service-website-card img'); if (website) website.src = service.websiteImage || '';
  };
  const applyCmsJournalDraft = (journal) => {
    if (!isCmsJournalDetail || !journal) return;
    const setText = (selector, value) => { const element = document.querySelector(selector); if (element) element.textContent = value || ''; };
    setText('.journal-article-hero h1', (journal.title || 'Untitled journal').toUpperCase());
    setText('.journal-article-hero p', journal.description);
    setText('.journal-article-read-time', `${journal.minutesRead || '0'} MIN READ`);
    setText('.journal-article-meta span:first-child strong', journal.tag);
    setText('.journal-author strong', journal.authorName);
    setText('.journal-author span', journal.authorRole);
    const image = document.querySelector('.journal-article-feature figure img'); if (image) image.src = journal.image || '';
    const authorImage = document.querySelector('.journal-author img'); if (authorImage) authorImage.src = journal.authorImage || '';
    const copy = document.querySelector('.journal-article-copy'); if (copy) copy.innerHTML = journal.content || '';
  };
  window.addEventListener('message', (event) => {
    if (event.data?.source === 'projectskevv-cms-project' && event.data.type === 'draft-sync') applyCmsProjectDraft(event.data.project);
    if (event.data?.source === 'projectskevv-cms-service' && event.data.type === 'draft-sync') applyCmsServiceDraft(event.data.service);
    if (event.data?.source === 'projectskevv-cms-journal' && event.data.type === 'draft-sync') applyCmsJournalDraft(event.data.journal);
  });
  const cmsEditableSelector = [
    'header', 'main > section', 'main > section > *', 'footer', 'footer > *',
    'section', 'article', 'aside', 'figure', 'form',
    'h1', 'h2', 'h3', 'h4', 'p', 'a', 'button', 'img',
    '[class*="card"]', '[class*="item"]', '[class*="tile"]', '[class*="panel"]', '[class*="container"]'
  ].join(', ');
  const cmsEditorStyle = document.createElement('style');
  cmsEditorStyle.textContent = `
    .cms-editor-target { cursor: text !important; }
    .cms-editor-target:hover { outline: 1px dashed rgba(8, 126, 245, .9) !important; outline-offset: 4px !important; }
    .cms-editor-target.cms-editor-selected { outline: 2px solid #087ef5 !important; outline-offset: 4px !important; z-index: 21 !important; }
    .cms-editor-target[contenteditable="true"]:focus { outline: 2px solid #f59e0b !important; outline-offset: 4px !important; }
    .cms-editor-badge { background: #087ef5; border-radius: 3px; color: #fff; font: 500 10px/1 Inter, Arial, sans-serif; padding: 4px 6px; pointer-events: none; position: fixed; white-space: nowrap; z-index: 2147483647; }
    .cms-media-editor { background: #fff; border: 1px solid #d9d9d9; border-radius: 8px; bottom: 18px; box-shadow: 0 12px 35px rgba(0,0,0,.18); color: #222; font: 13px/1.35 Inter, Arial, sans-serif; padding: 13px; position: fixed; right: 18px; width: 285px; z-index: 2147483646; }
    .cms-media-editor-header { align-items: center; display: flex; justify-content: space-between; }
    .cms-media-editor-header button { background: none; border: 0; color: #777; cursor: pointer; font-size: 20px; line-height: 1; padding: 0; }
    .cms-media-editor-name { color: #777; font-size: 11px; margin: 10px 0; }
    .cms-media-file { background: #087ef5; border-radius: 5px; color: #fff; cursor: pointer; display: block; font-size: 11px; padding: 9px 10px; text-align: center; }
    .cms-media-file input { display: none; }
    .cms-media-url-row { display: flex; gap: 6px; margin-top: 8px; }
    .cms-media-url-row input { border: 1px solid #ddd; border-radius: 4px; min-width: 0; padding: 7px; width: 100%; }
    .cms-media-url-row button { background: #222; border: 0; border-radius: 4px; color: #fff; cursor: pointer; padding: 0 9px; }
    .cms-media-editor small { color: #999; display: block; font-size: 10px; margin-top: 10px; }
    .cms-project-editor { background: #fff; border: 1px solid #d9d9d9; border-radius: 8px; bottom: 18px; box-shadow: 0 12px 35px rgba(0,0,0,.18); color: #222; font: 13px/1.35 Inter, Arial, sans-serif; padding: 13px; position: fixed; right: 18px; width: 285px; z-index: 2147483645; }
    .cms-project-editor-header { align-items: center; display: flex; justify-content: space-between; }
    .cms-project-editor-header button { background: none; border: 0; color: #777; cursor: pointer; font-size: 20px; line-height: 1; padding: 0; }
    .cms-project-editor p { color: #777; font-size: 11px; margin: 10px 0; }
    .cms-project-count { align-items: center; display: flex; gap: 8px; }
    .cms-project-count input { accent-color: #087ef5; flex: 1; }
    .cms-project-count output { font-weight: 600; min-width: 22px; text-align: right; }
    .cms-project-editor small { color: #999; display: block; font-size: 10px; margin-top: 10px; }
    .cms-service-editor { background: #fff; border: 1px solid #d9d9d9; border-radius: 8px; bottom: 18px; box-shadow: 0 12px 35px rgba(0,0,0,.18); color: #222; font: 13px/1.35 Inter, Arial, sans-serif; padding: 13px; position: fixed; right: 18px; width: 285px; z-index: 2147483645; }
    .cms-service-editor-header { align-items: center; display: flex; justify-content: space-between; }
    .cms-service-editor-header button { background: none; border: 0; color: #777; cursor: pointer; font-size: 20px; line-height: 1; padding: 0; }
    .cms-service-editor p { color: #777; font-size: 11px; margin: 10px 0; }
    .cms-service-count { align-items: center; display: flex; gap: 8px; }
    .cms-service-count input { accent-color: #087ef5; flex: 1; }
    .cms-service-count output { font-weight: 600; min-width: 22px; text-align: right; }
    .cms-service-editor small { color: #999; display: block; font-size: 10px; margin-top: 10px; }
    .cms-journal-editor { background: #fff; border: 1px solid #d9d9d9; border-radius: 8px; bottom: 18px; box-shadow: 0 12px 35px rgba(0,0,0,.18); color: #222; font: 13px/1.35 Inter, Arial, sans-serif; padding: 13px; position: fixed; right: 18px; width: 285px; z-index: 2147483645; }
    .cms-journal-editor-header { align-items: center; display: flex; justify-content: space-between; }
    .cms-journal-editor-header button { background: none; border: 0; color: #777; cursor: pointer; font-size: 20px; line-height: 1; padding: 0; }
    .cms-journal-editor p { color: #777; font-size: 11px; margin: 10px 0; }
    .cms-journal-count { align-items: center; display: flex; gap: 8px; }
    .cms-journal-count input { accent-color: #087ef5; flex: 1; }
    .cms-journal-count output { font-weight: 600; min-width: 22px; text-align: right; }
    .cms-journal-editor small { color: #999; display: block; font-size: 10px; margin-top: 10px; }
    .cms-accordion-editor { background: #fff; border: 1px solid #d9d9d9; border-radius: 8px; bottom: 18px; box-shadow: 0 12px 35px rgba(0,0,0,.18); color: #222; font: 13px/1.35 Inter, Arial, sans-serif; max-height: min(620px, calc(100vh - 36px)); overflow: auto; padding: 13px; position: fixed; right: 18px; width: 330px; z-index: 2147483644; }
    .cms-accordion-editor-header { align-items: center; display: flex; justify-content: space-between; }
    .cms-accordion-editor-header button { background: none; border: 0; color: #777; cursor: pointer; font-size: 20px; line-height: 1; padding: 0; }
    .cms-accordion-editor > p { color: #777; font-size: 11px; margin: 10px 0; }
    .cms-accordion-add { background: #087ef5; border: 0; border-radius: 4px; color: #fff; cursor: pointer; font-size: 11px; margin-bottom: 10px; padding: 8px 10px; width: 100%; }
    .cms-accordion-editor-list { display: grid; gap: 6px; list-style: none; margin: 0; padding: 0; }
    .cms-accordion-row { background: #f6f6f6; border: 1px solid #e2e2e2; border-radius: 5px; cursor: grab; padding: 7px; }
    .cms-accordion-row.is-dragging { border-color: #087ef5; opacity: .55; }
    .cms-accordion-row-top { align-items: center; display: flex; gap: 6px; }
    .cms-accordion-row-number { color: #087ef5; font-size: 10px; font-weight: 600; min-width: 18px; }
    .cms-accordion-row input { background: #fff; border: 1px solid #ddd; border-radius: 3px; min-width: 0; padding: 5px; width: 100%; }
    .cms-accordion-row-description { margin: 5px 0 0 24px; width: calc(100% - 24px) !important; }
    .cms-accordion-row-actions { display: flex; gap: 4px; margin: 6px 0 0 24px; }
    .cms-accordion-row-actions button { background: #fff; border: 1px solid #ddd; border-radius: 3px; color: #555; cursor: pointer; font-size: 10px; padding: 4px 7px; }
    .cms-accordion-editor small { color: #999; display: block; font-size: 10px; margin-top: 10px; }
    .cms-pricing-editor { background: #fff; border: 1px solid #d9d9d9; border-radius: 8px; bottom: 18px; box-shadow: 0 12px 35px rgba(0,0,0,.18); color: #222; font: 13px/1.35 Inter, Arial, sans-serif; max-height: min(620px, calc(100vh - 36px)); overflow: auto; padding: 13px; position: fixed; right: 18px; width: 330px; z-index: 2147483643; }
    .cms-pricing-editor-header { align-items: center; display: flex; justify-content: space-between; }
    .cms-pricing-editor-header button { background: none; border: 0; color: #777; cursor: pointer; font-size: 20px; line-height: 1; padding: 0; }
    .cms-pricing-editor > p { color: #777; font-size: 11px; margin: 10px 0; }
    .cms-pricing-editor select { background: #fff; border: 1px solid #ddd; border-radius: 4px; margin-bottom: 10px; padding: 7px; width: 100%; }
    .cms-pricing-feature-list { display: grid; gap: 6px; }
    .cms-pricing-feature-row { align-items: center; display: flex; gap: 5px; }
    .cms-pricing-feature-row input { border: 1px solid #ddd; border-radius: 4px; min-width: 0; padding: 7px; width: 100%; }
    .cms-pricing-feature-row button { background: #fff; border: 1px solid #ddd; border-radius: 4px; color: #777; cursor: pointer; padding: 6px 8px; }
    .cms-pricing-add { background: #087ef5; border: 0; border-radius: 4px; color: #fff; cursor: pointer; font-size: 11px; margin-top: 10px; padding: 8px 10px; width: 100%; }
    .cms-pricing-editor small { color: #999; display: block; font-size: 10px; margin-top: 10px; }
  `;
  document.head.appendChild(cmsEditorStyle);

  const cmsEditorLabel = (element) => {
    const tagName = element.tagName.toLowerCase();
    if (tagName === 'img') return 'Image';
    if (tagName === 'a') return 'Link';
    if (tagName === 'button') return 'Button';
    if (tagName === 'section') return 'Section';
    if (tagName === 'footer') return 'Footer';
    if (tagName === 'header') return 'Header';
    if (tagName === 'figure' || /card|item|tile|panel/i.test(String(element.className))) return 'Card';
    if (/container/i.test(String(element.className))) return 'Component';
    return 'Text';
  };

  document.querySelectorAll(cmsEditableSelector).forEach((element) => {
    if (element.closest('script, style')) return;
    element.classList.add('cms-editor-target');
    element.dataset.editorLabel = cmsEditorLabel(element);
  });

  const cmsLockedMedia = (element) => Boolean(element.closest('.featured-project, .footer-services, [class*="projects"], [class*="services"], a[href*="projects"], a[href*="services"]'));
  const cmsLockedContent = (element) => Boolean(element.closest('#projects, #services, #journal, .featured-project, .footer-services, [class*="projects"], [class*="services"], [class*="journal"], a[href*="projects"], a[href*="services"], a[href*="journal"]'));
  const cmsTextSelector = 'h1, h2, h3, h4, h5, h6, p, span, a, button, li, label, summary, dd';
  const cmsMediaEditor = document.createElement('aside');
  cmsMediaEditor.className = 'cms-media-editor';
  cmsMediaEditor.hidden = true;
  cmsMediaEditor.innerHTML = `
    <div class="cms-media-editor-header">
      <strong>Change media</strong>
      <button type="button" data-cms-media-close aria-label="Close media editor">×</button>
    </div>
    <p class="cms-media-editor-name" data-cms-media-name></p>
    <label class="cms-media-file">Choose image or video<input type="file" accept="image/*,video/*" data-cms-media-file /></label>
    <div class="cms-media-url-row"><input type="url" placeholder="Paste media URL" data-cms-media-url /><button type="button" data-cms-media-apply>Apply</button></div>
    <small>Preview only until media storage is connected.</small>
  `;
  document.body.appendChild(cmsMediaEditor);

  let cmsActiveMedia = null;
  let cmsActiveObjectUrl = null;
  let cmsMediaEditorOpen = false;
  let cmsHoveredTarget = null;
  const cmsMediaName = cmsMediaEditor.querySelector('[data-cms-media-name]');
  const cmsMediaFile = cmsMediaEditor.querySelector('[data-cms-media-file]');
  const cmsMediaUrl = cmsMediaEditor.querySelector('[data-cms-media-url]');
  const cmsMediaApply = cmsMediaEditor.querySelector('[data-cms-media-apply]');
  const cmsMediaClose = cmsMediaEditor.querySelector('[data-cms-media-close]');

  const openCmsMediaEditor = (media) => {
    if (cmsLockedMedia(media)) return;
    cmsActiveMedia = media;
    cmsMediaEditorOpen = true;
    cmsMediaEditor.hidden = false;
    cmsMediaName.textContent = `${media.tagName.toLowerCase() === 'video' ? 'Video' : 'Image'} selected`;
    cmsMediaUrl.value = media.currentSrc || media.src || '';
    const bounds = media.getBoundingClientRect();
    const panelWidth = cmsMediaEditor.offsetWidth || 285;
    const panelHeight = cmsMediaEditor.offsetHeight || 180;
    const left = Math.min(Math.max(8, bounds.right + 12), window.innerWidth - panelWidth - 8);
    const top = Math.min(Math.max(8, bounds.top), window.innerHeight - panelHeight - 8);
    cmsMediaEditor.style.left = `${left}px`;
    cmsMediaEditor.style.top = `${top}px`;
    cmsMediaEditor.style.right = 'auto';
    cmsMediaEditor.style.bottom = 'auto';
    cmsEditorBadge.hidden = true;
    document.querySelectorAll('.cms-editor-selected').forEach((element) => element.classList.remove('cms-editor-selected'));
    media.classList.add('cms-editor-selected');
  };

  const applyCmsMedia = (source) => {
    if (!cmsActiveMedia || !source) return;
    if (cmsActiveObjectUrl) URL.revokeObjectURL(cmsActiveObjectUrl);
    cmsActiveObjectUrl = source;
    const sourceIsVideo = /\.(mp4|webm|ogg|mov)(?:[?#].*)?$/i.test(source);
    const mediaIsVideo = cmsActiveMedia.tagName.toLowerCase() === 'video';
    if (sourceIsVideo !== mediaIsVideo) {
      const replacement = document.createElement(sourceIsVideo ? 'video' : 'img');
      replacement.className = cmsActiveMedia.className;
      replacement.dataset.editorLabel = sourceIsVideo ? 'Video' : 'Image';
      replacement.alt = cmsActiveMedia.alt || '';
      cmsActiveMedia.replaceWith(replacement);
      cmsActiveMedia = replacement;
    }
    cmsActiveMedia.src = source;
    if (sourceIsVideo) {
      cmsActiveMedia.controls = true;
      cmsActiveMedia.muted = true;
      cmsActiveMedia.playsInline = true;
      cmsActiveMedia.load();
    }
    if (isCmsProjectDetail) {
      const galleryImages = [...document.querySelectorAll('.image-gallery img, .image-gallery video')];
      const galleryIndex = galleryImages.indexOf(cmsActiveMedia);
      postCmsProjectChange(galleryIndex >= 0 ? { type: 'media-change', field: 'gallery', index: galleryIndex, value: source } : { type: 'media-change', field: 'image', value: source });
    }
    if (isCmsServiceDetail) postCmsServiceChange({ type: 'media-change', field: 'image', value: source });
    if (isCmsJournalDetail) postCmsJournalChange({ type: 'media-change', field: cmsActiveMedia?.closest('.journal-author') ? 'authorImage' : 'image', value: source });
    cmsMediaEditor.hidden = true;
    cmsMediaEditorOpen = false;
  };

  cmsMediaFile.addEventListener('change', () => {
    const file = cmsMediaFile.files?.[0];
    if (!file) return;
    applyCmsMedia(URL.createObjectURL(file));
  });
  cmsMediaApply.addEventListener('click', () => applyCmsMedia(cmsMediaUrl.value.trim()));
  cmsMediaClose.addEventListener('click', () => {
    cmsMediaEditor.hidden = true;
    cmsMediaEditorOpen = false;
  });

  const cmsProjectSection = document.querySelector('#projects');
  const cmsProjectCards = [...document.querySelectorAll('#projects .project-card')];
  const cmsProjectEditor = document.createElement('aside');
  cmsProjectEditor.className = 'cms-project-editor';
  cmsProjectEditor.hidden = true;
  cmsProjectEditor.innerHTML = `
    <div class="cms-project-editor-header"><strong>Home projects</strong><button type="button" data-cms-project-close aria-label="Close project settings">×</button></div>
    <p>Choose how many project cards appear on Home. Available projects: <b data-cms-project-available></b></p>
    <label class="cms-project-count"><span>Display</span><input type="range" min="1" data-cms-project-range /><output data-cms-project-output></output></label>
    <small>This only changes the Home preview. Project records stay unchanged.</small>
  `;
  document.body.appendChild(cmsProjectEditor);

  let cmsProjectEditorOpen = false;
  const cmsProjectRange = cmsProjectEditor.querySelector('[data-cms-project-range]');
  const cmsProjectOutput = cmsProjectEditor.querySelector('[data-cms-project-output]');
  const cmsProjectAvailable = cmsProjectEditor.querySelector('[data-cms-project-available]');
  const cmsProjectClose = cmsProjectEditor.querySelector('[data-cms-project-close]');
  const openCmsProjectEditor = () => {
    if (!cmsProjectSection || !cmsProjectCards.length) return;
    cmsProjectEditorOpen = true;
    cmsProjectEditor.hidden = false;
    cmsMediaEditor.hidden = true;
    cmsMediaEditorOpen = false;
    cmsProjectRange.max = String(cmsProjectCards.length);
    if (!cmsProjectRange.value || Number(cmsProjectRange.value) > cmsProjectCards.length) cmsProjectRange.value = String(cmsProjectCards.length);
    cmsProjectAvailable.textContent = String(cmsProjectCards.length);
    cmsProjectOutput.value = cmsProjectRange.value;
    const bounds = cmsProjectSection.getBoundingClientRect();
    const panelWidth = cmsProjectEditor.offsetWidth || 285;
    const panelHeight = cmsProjectEditor.offsetHeight || 180;
    cmsProjectEditor.style.left = `${Math.min(Math.max(8, bounds.right - panelWidth), window.innerWidth - panelWidth - 8)}px`;
    cmsProjectEditor.style.top = `${Math.min(Math.max(8, bounds.top), window.innerHeight - panelHeight - 8)}px`;
    cmsProjectEditor.style.right = 'auto';
    cmsProjectEditor.style.bottom = 'auto';
  };
  const closeCmsProjectEditor = () => {
    cmsProjectEditor.hidden = true;
    cmsProjectEditorOpen = false;
  };
  cmsProjectRange.addEventListener('input', () => {
    const visibleCount = Math.min(Number(cmsProjectRange.value), cmsProjectCards.length);
    cmsProjectOutput.value = String(visibleCount);
    cmsProjectCards.forEach((card, index) => { card.style.display = index < visibleCount ? '' : 'none'; });
  });
  cmsProjectClose.addEventListener('click', closeCmsProjectEditor);

  const cmsServiceSection = document.querySelector('#services');
  const cmsServiceItems = [...document.querySelectorAll('#services .service-item')];
  const cmsServiceEditor = document.createElement('aside');
  cmsServiceEditor.className = 'cms-service-editor';
  cmsServiceEditor.hidden = true;
  cmsServiceEditor.innerHTML = `
    <div class="cms-service-editor-header"><strong>Home services</strong><button type="button" data-cms-service-close aria-label="Close service settings">×</button></div>
    <p>Choose how many service items appear on Home. Available services: <b data-cms-service-available></b></p>
    <label class="cms-service-count"><span>Display</span><input type="range" min="1" data-cms-service-range /><output data-cms-service-output></output></label>
    <small>This only changes the Home preview. Service records stay unchanged.</small>
  `;
  document.body.appendChild(cmsServiceEditor);

  const cmsServiceRange = cmsServiceEditor.querySelector('[data-cms-service-range]');
  const cmsServiceOutput = cmsServiceEditor.querySelector('[data-cms-service-output]');
  const cmsServiceAvailable = cmsServiceEditor.querySelector('[data-cms-service-available]');
  const cmsServiceClose = cmsServiceEditor.querySelector('[data-cms-service-close]');
  const openCmsServiceEditor = () => {
    if (!cmsServiceSection || !cmsServiceItems.length) return;
    cmsServiceEditor.hidden = false;
    closeCmsProjectEditor();
    cmsMediaEditor.hidden = true;
    cmsMediaEditorOpen = false;
    cmsServiceRange.max = String(cmsServiceItems.length);
    if (!cmsServiceRange.value || Number(cmsServiceRange.value) > cmsServiceItems.length) cmsServiceRange.value = String(cmsServiceItems.length);
    cmsServiceAvailable.textContent = String(cmsServiceItems.length);
    cmsServiceOutput.value = cmsServiceRange.value;
    const bounds = cmsServiceSection.getBoundingClientRect();
    const panelWidth = cmsServiceEditor.offsetWidth || 285;
    const panelHeight = cmsServiceEditor.offsetHeight || 180;
    cmsServiceEditor.style.left = `${Math.min(Math.max(8, bounds.right - panelWidth), window.innerWidth - panelWidth - 8)}px`;
    cmsServiceEditor.style.top = `${Math.min(Math.max(8, bounds.top), window.innerHeight - panelHeight - 8)}px`;
    cmsServiceEditor.style.right = 'auto';
    cmsServiceEditor.style.bottom = 'auto';
  };
  const closeCmsServiceEditor = () => { cmsServiceEditor.hidden = true; };
  cmsServiceRange.addEventListener('input', () => {
    const visibleCount = Math.min(Number(cmsServiceRange.value), cmsServiceItems.length);
    cmsServiceOutput.value = String(visibleCount);
    cmsServiceItems.forEach((item, index) => { item.style.display = index < visibleCount ? '' : 'none'; });
  });
  cmsServiceClose.addEventListener('click', closeCmsServiceEditor);

  const cmsJournalSection = document.querySelector('#journal');
  const cmsJournalItems = [...document.querySelectorAll('#journal .article-card')];
  const cmsJournalEditor = document.createElement('aside');
  cmsJournalEditor.className = 'cms-journal-editor';
  cmsJournalEditor.hidden = true;
  cmsJournalEditor.innerHTML = `
    <div class="cms-journal-editor-header"><strong>Home journal</strong><button type="button" data-cms-journal-close aria-label="Close journal settings">×</button></div>
    <p>Choose how many articles appear on Home. Available articles: <b data-cms-journal-available></b></p>
    <label class="cms-journal-count"><span>Display</span><input type="range" min="1" data-cms-journal-range /><output data-cms-journal-output></output></label>
    <small>This only changes the Home preview. Journal content stays managed by its own page.</small>
  `;
  document.body.appendChild(cmsJournalEditor);

  const cmsJournalRange = cmsJournalEditor.querySelector('[data-cms-journal-range]');
  const cmsJournalOutput = cmsJournalEditor.querySelector('[data-cms-journal-output]');
  const cmsJournalAvailable = cmsJournalEditor.querySelector('[data-cms-journal-available]');
  const cmsJournalClose = cmsJournalEditor.querySelector('[data-cms-journal-close]');
  const openCmsJournalEditor = () => {
    if (!cmsJournalSection || !cmsJournalItems.length) return;
    cmsJournalEditor.hidden = false;
    closeCmsProjectEditor();
    closeCmsServiceEditor();
    cmsMediaEditor.hidden = true;
    cmsMediaEditorOpen = false;
    cmsJournalRange.max = String(cmsJournalItems.length);
    if (!cmsJournalRange.value || Number(cmsJournalRange.value) > cmsJournalItems.length) cmsJournalRange.value = String(cmsJournalItems.length);
    cmsJournalAvailable.textContent = String(cmsJournalItems.length);
    cmsJournalOutput.value = cmsJournalRange.value;
    const bounds = cmsJournalSection.getBoundingClientRect();
    const panelWidth = cmsJournalEditor.offsetWidth || 285;
    const panelHeight = cmsJournalEditor.offsetHeight || 180;
    cmsJournalEditor.style.left = `${Math.min(Math.max(8, bounds.right - panelWidth), window.innerWidth - panelWidth - 8)}px`;
    cmsJournalEditor.style.top = `${Math.min(Math.max(8, bounds.top), window.innerHeight - panelHeight - 8)}px`;
    cmsJournalEditor.style.right = 'auto';
    cmsJournalEditor.style.bottom = 'auto';
  };
  const closeCmsJournalEditor = () => { cmsJournalEditor.hidden = true; };
  cmsJournalRange.addEventListener('input', () => {
    const visibleCount = Math.min(Number(cmsJournalRange.value), cmsJournalItems.length);
    cmsJournalOutput.value = String(visibleCount);
    cmsJournalItems.forEach((item, index) => { item.style.display = index < visibleCount ? '' : 'none'; });
  });
  cmsJournalClose.addEventListener('click', closeCmsJournalEditor);

  const cmsAccordionSection = document.querySelector('.service-accordion-section');
  const cmsAccordionItems = () => [...document.querySelectorAll('.service-accordion-section .service-accordion-item')];
  const cmsAccordionEditor = document.createElement('aside');
  cmsAccordionEditor.className = 'cms-accordion-editor';
  cmsAccordionEditor.hidden = true;
  cmsAccordionEditor.innerHTML = `
    <div class="cms-accordion-editor-header"><strong>Service categories</strong><button type="button" data-cms-accordion-close aria-label="Close service category settings">×</button></div>
    <p>Drag rows to rearrange them, or use the arrows. Numbers follow the order automatically.</p>
    <button class="cms-accordion-add" type="button" data-cms-accordion-add>+ Add mock row</button>
    <ol class="cms-accordion-editor-list" data-cms-accordion-list></ol>
    <small>Preview only. This does not change the Services collection.</small>
  `;
  document.body.appendChild(cmsAccordionEditor);

  const cmsAccordionList = cmsAccordionEditor.querySelector('[data-cms-accordion-list]');
  const cmsAccordionAdd = cmsAccordionEditor.querySelector('[data-cms-accordion-add]');
  const cmsAccordionClose = cmsAccordionEditor.querySelector('[data-cms-accordion-close]');
  let cmsDraggedAccordionItem = null;

  const updateCmsAccordionNumbers = () => {
    cmsAccordionItems().forEach((item, index) => {
      const number = item.querySelector('.accordion-number');
      if (number) number.textContent = String(index + 1).padStart(2, '0');
    });
  };

  const renderCmsAccordionEditor = () => {
    cmsAccordionList.innerHTML = '';
    cmsAccordionItems().forEach((item, index) => {
      const row = document.createElement('li');
      row.className = 'cms-accordion-row';
      row.draggable = true;
      row.dataset.index = String(index);
      const title = item.querySelector('.accordion-title')?.textContent.trim() || 'UNTITLED';
      const description = item.querySelector('.service-accordion-content p')?.textContent.trim() || '';
      row.innerHTML = `
        <div class="cms-accordion-row-top"><span class="cms-accordion-row-number">${String(index + 1).padStart(2, '0')}</span><input data-row-title value="${title.replaceAll('"', '&quot;')}" aria-label="Category title" /></div>
        <input class="cms-accordion-row-description" data-row-description value="${description.replaceAll('"', '&quot;')}" aria-label="Category description" />
        <div class="cms-accordion-row-actions"><button type="button" data-row-up>↑ Up</button><button type="button" data-row-down>↓ Down</button></div>
      `;
      row.querySelector('[data-row-title]').addEventListener('input', (event) => {
        const target = item.querySelector('.accordion-title');
        if (target) target.textContent = event.target.value;
      });
      row.querySelector('[data-row-description]').addEventListener('input', (event) => {
        const target = item.querySelector('.service-accordion-content p');
        if (target) target.textContent = event.target.value;
      });
      row.querySelector('[data-row-up]').addEventListener('click', () => {
        const previous = item.previousElementSibling;
        if (previous) item.parentElement.insertBefore(item, previous);
        updateCmsAccordionNumbers();
        renderCmsAccordionEditor();
      });
      row.querySelector('[data-row-down]').addEventListener('click', () => {
        const next = item.nextElementSibling;
        if (next) item.parentElement.insertBefore(next, item);
        updateCmsAccordionNumbers();
        renderCmsAccordionEditor();
      });
      row.addEventListener('dragstart', () => { cmsDraggedAccordionItem = item; row.classList.add('is-dragging'); });
      row.addEventListener('dragend', () => { cmsDraggedAccordionItem = null; row.classList.remove('is-dragging'); });
      row.addEventListener('dragover', (event) => event.preventDefault());
      row.addEventListener('drop', (event) => {
        event.preventDefault();
        if (!cmsDraggedAccordionItem || cmsDraggedAccordionItem === item) return;
        const bounds = row.getBoundingClientRect();
        const insertBefore = event.clientY < bounds.top + bounds.height / 2;
        item.parentElement.insertBefore(cmsDraggedAccordionItem, insertBefore ? item : item.nextSibling);
        updateCmsAccordionNumbers();
        renderCmsAccordionEditor();
      });
      cmsAccordionList.appendChild(row);
    });
  };

  const openCmsAccordionEditor = () => {
    if (!cmsAccordionSection) return;
    cmsAccordionEditor.hidden = false;
    closeCmsProjectEditor();
    closeCmsServiceEditor();
    closeCmsJournalEditor();
    cmsMediaEditor.hidden = true;
    cmsMediaEditorOpen = false;
    renderCmsAccordionEditor();
    const bounds = cmsAccordionSection.getBoundingClientRect();
    const panelWidth = cmsAccordionEditor.offsetWidth || 330;
    const panelHeight = Math.min(cmsAccordionEditor.offsetHeight || 420, window.innerHeight - 36);
    cmsAccordionEditor.style.left = `${Math.min(Math.max(8, bounds.right - panelWidth), window.innerWidth - panelWidth - 8)}px`;
    cmsAccordionEditor.style.top = `${Math.min(Math.max(8, bounds.top), window.innerHeight - panelHeight - 8)}px`;
    cmsAccordionEditor.style.right = 'auto';
    cmsAccordionEditor.style.bottom = 'auto';
  };
  const closeCmsAccordionEditor = () => { cmsAccordionEditor.hidden = true; };
  cmsAccordionAdd.addEventListener('click', () => {
    const source = cmsAccordionItems()[0];
    if (!source) return;
    const mock = source.cloneNode(true);
    mock.classList.remove('is-open');
    mock.querySelector('.accordion-title').textContent = 'NEW SERVICE CATEGORY';
    mock.querySelector('.service-accordion-content p').textContent = 'Add a description for this new category.';
    mock.querySelector('.service-accordion-header')?.setAttribute('aria-expanded', 'false');
    mock.querySelector('.accordion-icon').textContent = '+';
    source.parentElement.appendChild(mock);
    updateCmsAccordionNumbers();
    renderCmsAccordionEditor();
  });
  cmsAccordionClose.addEventListener('click', closeCmsAccordionEditor);

  const cmsPricingSection = document.querySelector('#pricing');
  const cmsPricingCards = [...document.querySelectorAll('#pricing .pricing-card')];
  const cmsPricingEditor = document.createElement('aside');
  cmsPricingEditor.className = 'cms-pricing-editor';
  cmsPricingEditor.hidden = true;
  cmsPricingEditor.innerHTML = `
    <div class="cms-pricing-editor-header"><strong>Pricing content</strong><button type="button" data-cms-pricing-close aria-label="Close pricing editor">×</button></div>
    <p>Add, edit, or remove the feature content inside each pricing plan.</p>
    <select data-cms-pricing-plan aria-label="Choose pricing plan"></select>
    <div class="cms-pricing-feature-list" data-cms-pricing-features></div>
    <button class="cms-pricing-add" type="button" data-cms-pricing-add>+ Add mock feature</button>
    <small>Preview only. Pricing plans stay independent from the Projects, Services, and Journal collections.</small>
  `;
  document.body.appendChild(cmsPricingEditor);

  const cmsPricingPlan = cmsPricingEditor.querySelector('[data-cms-pricing-plan]');
  const cmsPricingFeatures = cmsPricingEditor.querySelector('[data-cms-pricing-features]');
  const cmsPricingAdd = cmsPricingEditor.querySelector('[data-cms-pricing-add]');
  const cmsPricingClose = cmsPricingEditor.querySelector('[data-cms-pricing-close]');
  let cmsPricingActiveIndex = 0;

  const renderCmsPricingFeatures = () => {
    const card = cmsPricingCards[cmsPricingActiveIndex];
    if (!card) return;
    cmsPricingFeatures.innerHTML = '';
    card.querySelectorAll('.features li').forEach((feature) => {
      const row = document.createElement('div');
      row.className = 'cms-pricing-feature-row';
      const input = document.createElement('input');
      input.type = 'text';
      input.value = feature.textContent.trim();
      input.setAttribute('aria-label', 'Pricing feature');
      input.addEventListener('input', () => { feature.textContent = input.value; });
      const remove = document.createElement('button');
      remove.type = 'button';
      remove.textContent = 'Remove';
      remove.addEventListener('click', () => { feature.remove(); renderCmsPricingFeatures(); });
      row.append(input, remove);
      cmsPricingFeatures.appendChild(row);
    });
  };

  const openCmsPricingEditor = () => {
    if (!cmsPricingSection || !cmsPricingCards.length) return;
    cmsPricingEditor.hidden = false;
    closeCmsProjectEditor();
    closeCmsServiceEditor();
    closeCmsJournalEditor();
    closeCmsAccordionEditor();
    cmsMediaEditor.hidden = true;
    cmsMediaEditorOpen = false;
    cmsPricingPlan.innerHTML = '';
    cmsPricingCards.forEach((card, index) => {
      const option = document.createElement('option');
      option.value = String(index);
      option.textContent = card.querySelector('.plan-title-row h3, .pricing-card-header h3')?.textContent.trim() || `Plan ${index + 1}`;
      cmsPricingPlan.appendChild(option);
    });
    cmsPricingPlan.value = String(cmsPricingActiveIndex);
    renderCmsPricingFeatures();
    const bounds = cmsPricingSection.getBoundingClientRect();
    const panelWidth = cmsPricingEditor.offsetWidth || 330;
    const panelHeight = Math.min(cmsPricingEditor.offsetHeight || 360, window.innerHeight - 36);
    cmsPricingEditor.style.left = `${Math.min(Math.max(8, bounds.right - panelWidth), window.innerWidth - panelWidth - 8)}px`;
    cmsPricingEditor.style.top = `${Math.min(Math.max(8, bounds.top), window.innerHeight - panelHeight - 8)}px`;
    cmsPricingEditor.style.right = 'auto';
    cmsPricingEditor.style.bottom = 'auto';
  };
  const closeCmsPricingEditor = () => { cmsPricingEditor.hidden = true; };
  cmsPricingPlan.addEventListener('change', () => {
    cmsPricingActiveIndex = Number(cmsPricingPlan.value);
    renderCmsPricingFeatures();
  });
  cmsPricingAdd.addEventListener('click', () => {
    const card = cmsPricingCards[cmsPricingActiveIndex];
    if (!card) return;
    const feature = document.createElement('li');
    feature.textContent = 'New pricing feature';
    card.querySelector('.features')?.appendChild(feature);
    renderCmsPricingFeatures();
  });
  cmsPricingClose.addEventListener('click', closeCmsPricingEditor);

  const cmsEditorBadge = document.createElement('span');
  cmsEditorBadge.className = 'cms-editor-badge';
  cmsEditorBadge.hidden = true;
  document.body.appendChild(cmsEditorBadge);

  const showEditorBadge = (element) => {
    if (cmsMediaEditorOpen) return;
    const bounds = element.getBoundingClientRect();
    cmsEditorBadge.textContent = element.dataset.editorLabel || 'Component';
    cmsEditorBadge.style.left = `${Math.max(4, bounds.left)}px`;
    cmsEditorBadge.style.top = `${Math.max(4, bounds.top - 23)}px`;
    cmsEditorBadge.hidden = false;
  };

  document.addEventListener('mouseover', (event) => {
    const target = event.target.closest?.(cmsEditableSelector);
    if (target && !target.closest('script, style')) {
      cmsHoveredTarget = target;
      showEditorBadge(target);
    }
  }, true);

  document.addEventListener('mousemove', (event) => {
    const target = event.target.closest?.(cmsEditableSelector);
    if (target && !target.closest('script, style')) {
      cmsHoveredTarget = target;
      showEditorBadge(target);
    }
  }, true);

  document.addEventListener('mouseout', (event) => {
    const nextTarget = event.relatedTarget?.closest?.(cmsEditableSelector);
    if (!nextTarget || nextTarget !== cmsHoveredTarget) {
      cmsHoveredTarget = nextTarget || null;
      if (!cmsMediaEditorOpen) {
        if (nextTarget) showEditorBadge(nextTarget);
        else cmsEditorBadge.hidden = true;
      }
    }
  }, true);

  document.addEventListener('click', (event) => {
    if (event.target.closest?.('.cms-media-editor')) return;
    if (event.target.closest?.('.cms-project-editor')) return;
    if (event.target.closest?.('.cms-service-editor')) return;
    if (event.target.closest?.('.cms-journal-editor')) return;
    if (event.target.closest?.('.cms-accordion-editor')) return;
    if (event.target.closest?.('.cms-pricing-editor')) return;
    const media = event.target.closest?.('img, video');
    if (media && !cmsLockedMedia(media)) {
      event.preventDefault();
      event.stopPropagation();
      openCmsMediaEditor(media);
      return;
    }
    if (cmsProjectSection && event.target.closest?.('#projects')) {
      event.preventDefault();
      event.stopPropagation();
      openCmsProjectEditor();
      return;
    }
    if (cmsServiceSection && event.target.closest?.('#services')) {
      event.preventDefault();
      event.stopPropagation();
      openCmsServiceEditor();
      return;
    }
    if (cmsJournalSection && event.target.closest?.('#journal')) {
      event.preventDefault();
      event.stopPropagation();
      openCmsJournalEditor();
      return;
    }
    if (cmsAccordionSection && event.target.closest?.('.service-accordion-section')) {
      event.preventDefault();
      event.stopPropagation();
      openCmsAccordionEditor();
      return;
    }
    if (cmsPricingSection && event.target.closest?.('#pricing')) {
      event.preventDefault();
      event.stopPropagation();
      openCmsPricingEditor();
      return;
    }
    const target = event.target.closest?.(cmsEditableSelector);
    if (!target || target.closest('script, style')) return;
    event.preventDefault();
    event.stopPropagation();
    if (cmsMediaEditorOpen) {
      cmsMediaEditor.hidden = true;
      cmsMediaEditorOpen = false;
    }
    closeCmsProjectEditor();
    closeCmsServiceEditor();
    closeCmsJournalEditor();
    closeCmsAccordionEditor();
    closeCmsPricingEditor();
    document.querySelectorAll('.cms-editor-selected').forEach((element) => element.classList.remove('cms-editor-selected'));
    target.classList.add('cms-editor-selected');
    const textTarget = event.target.closest?.(cmsTextSelector);
    if (textTarget && !cmsLockedContent(textTarget) && textTarget.textContent.trim()) {
      textTarget.contentEditable = 'true';
      textTarget.spellcheck = true;
      textTarget.focus();
      if ((isCmsProjectDetail || isCmsServiceDetail) && !textTarget.dataset.cmsProjectInputBound) {
        textTarget.dataset.cmsProjectInputBound = 'true';
        textTarget.addEventListener('input', () => {
          const field = textTarget.matches('.journal-article-hero h1') ? 'title'
            : textTarget.matches('.journal-article-hero p') ? 'description'
              : textTarget.matches('.journal-article-meta span:first-child strong') ? 'tag'
                : textTarget.matches('.journal-author strong') ? 'authorName'
                  : textTarget.matches('.journal-author span') ? 'authorRole'
                    : textTarget.closest('.journal-article-copy') ? 'content'
            : textTarget.matches('#service-title, .project-detail-title-wrap h1') ? 'title'
            : textTarget.matches('.project-detail-description') ? 'description'
            : textTarget.matches('.project-summary') ? 'text'
              : textTarget.matches('#service-showcase-title') ? 'applicationTitle'
                : textTarget.matches('.service-showcase-intro > p') ? 'applicationDescription'
                  : textTarget.matches('.service-showcase-feature h3') ? 'featureTitle'
                    : textTarget.matches('.service-showcase-feature p') ? 'featureText'
              : textTarget.matches('.meta-row .meta-label:nth-child(2)') ? 'tag'
                : textTarget.matches('.project-detail-meta dd:nth-of-type(1)') ? 'duration'
                    : textTarget.matches('.project-detail-meta dd:nth-of-type(2)') ? 'client' : null;
          if (field) {
            if (isCmsJournalDetail) postCmsJournalChange({ type: 'field-change', field, value: field === 'content' ? document.querySelector('.journal-article-copy')?.innerHTML || '' : textTarget.textContent.trim() });
            else (isCmsServiceDetail ? postCmsServiceChange : postCmsProjectChange)({ type: 'field-change', field, value: textTarget.textContent.trim() });
          }
        });
      }
    }
    showEditorBadge(target);
  }, true);
}
