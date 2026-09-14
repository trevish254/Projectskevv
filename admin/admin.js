const cmsPages = {
  home: { label: 'Home', source: '../index.html' },
  services: { label: 'Services', source: '../services/index.html' },
  projects: { label: 'Projects', source: '../projects/index.html' },
  journal: { label: 'Journal', source: '../journal/index.html' },
  legal: { label: 'Legal', source: '../contact/index.html' }
};

const selectedPage = new URLSearchParams(window.location.search).get('page') || 'home';
const page = cmsPages[selectedPage] || cmsPages.home;
const pageFrame = document.querySelector('#cms-page-frame');
const pageTitle = document.querySelector('#cms-page-title');
const publicLink = document.querySelector('#cms-public-link');
const editingStatus = document.querySelector('#cms-editing-status');
const editingTime = document.querySelector('#cms-editing-time');
const editorFrameOverlay = document.querySelector('#cms-editor-frame-overlay');

document.querySelectorAll('[data-cms-page]').forEach((link) => {
  const isActive = link.dataset.cmsPage === (cmsPages[selectedPage] ? selectedPage : 'home');
  link.classList.toggle('is-active', isActive);
  if (isActive) link.setAttribute('aria-current', 'page');
  link.href = window.location.protocol === 'file:'
    ? `./index.html?page=${link.dataset.cmsPage}`
    : `/admin/index.html?page=${link.dataset.cmsPage}`;
});

if (pageTitle) pageTitle.textContent = page.label;
if (publicLink) publicLink.href = page.source;

const editorStyle = `
  .cms-editor-target {
    cursor: text !important;
    position: relative !important;
  }
  .cms-editor-target:hover {
    outline: 1px dashed rgba(8, 126, 245, .72) !important;
    outline-offset: 4px !important;
    z-index: 20 !important;
  }
  .cms-editor-target.cms-editor-selected {
    outline: 2px solid #087ef5 !important;
    outline-offset: 4px !important;
    z-index: 21 !important;
  }
  .cms-editor-target:hover::after,
  .cms-editor-target.cms-editor-selected::after {
    background: #087ef5;
    border-radius: 3px;
    color: #fff;
    content: attr(data-editor-label);
    font: 500 10px/1 Inter, Arial, sans-serif;
    left: -1px;
    padding: 4px 6px;
    pointer-events: none;
    position: absolute;
    top: -22px;
    white-space: nowrap;
    z-index: 30;
  }
`;

const editableSelector = [
  'header', 'main > section', 'main > section > *', 'footer', 'footer > *',
  'section', 'article', 'aside', 'figure', 'form',
  'h1', 'h2', 'h3', 'h4', 'p', 'a', 'button', 'img',
  '[class*="card"]', '[class*="item"]', '[class*="tile"]', '[class*="panel"]', '[class*="container"]'
].join(', ');

const getEditorLabel = (element) => {
  const tagName = element.tagName.toLowerCase();
  if (tagName === 'img') return 'Image';
  if (tagName === 'a') return 'Link';
  if (tagName === 'button') return 'Button';
  if (tagName === 'section') return 'Section';
  if (tagName === 'footer') return 'Footer';
  if (tagName === 'header') return 'Header';
  if (tagName === 'figure') return 'Card';
  if (/card|item|tile|panel/i.test(element.className)) return 'Card';
  if (/container/i.test(element.className)) return 'Component';
  return 'Text';
};

const updateEditingTime = () => {
  if (editingTime) editingTime.textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const enterHomeEditingMode = () => {
  if (page.label !== 'Home') return;
  if (editorFrameOverlay) editorFrameOverlay.hidden = true;
  pageFrame?.classList.add('cms-editing-preview');
};

if (page.label === 'Home') {
  if (editingStatus) editingStatus.hidden = false;
  updateEditingTime();
  pageFrame?.addEventListener('load', enterHomeEditingMode);
  window.setTimeout(enterHomeEditingMode, 250);
} else if (editorFrameOverlay) {
  editorFrameOverlay.hidden = true;
}

if (pageFrame) pageFrame.src = page.label === 'Home' ? `${page.source}?cms=1` : page.source;

if (page.label === 'Projects') {
  const projectTools = document.querySelector('#cms-project-tools');
  const projectSelect = document.querySelector('#cms-project-select');
  const newProjectButton = document.querySelector('#cms-new-project');
  const projectsPageLink = document.querySelector('#cms-projects-page-link');
  const projectManager = document.querySelector('#cms-project-manager');
  const projectFrame = document.querySelector('#cms-page-frame');
  const projectsStorageKey = 'projectskevv.cms.projects.v1';
  const seedProjects = [{
    id: 'beach-shoot',
    title: 'Beach Shoot',
    status: 'Live',
    slug: 'beach-shoot',
    description: 'An abstract visual exploration where light, water, color dissolve into a single atmospheric form.',
    text: 'Explores the tension between light and darkness through a series of abstract beach captures.',
    image: 'https://framerusercontent.com/images/64pa4deJ9c4cc4c58vzW7N0WgU.jpg?width=3500&height=2333',
    tag: 'Art Direction / Photography',
    duration: '1 day',
    client: 'Mia Khalifa',
    website: 'https://projectskevv.com',
    gallery: [
      'https://framerusercontent.com/images/1828lmWV1X8KP4ehLRXfgbmTjMs.png?width=1349&height=2400',
      'https://framerusercontent.com/images/TEPq34U3DUtGaXdZtpGZFrtXlI.png?width=1800&height=2400'
    ],
    useVideo: false,
    videoPoster: '',
    videoFile: ''
  }];
  let storedProjects = [];
  try { storedProjects = JSON.parse(localStorage.getItem(projectsStorageKey) || '[]'); } catch { storedProjects = []; }
  const projects = storedProjects.length ? storedProjects : seedProjects;
  let activeProjectId = projects[0]?.id || null;
  let draftProject = null;
  let projectPreviewMode = false;
  let projectListingMode = false;

  const saveProjects = () => {
    try { localStorage.setItem(projectsStorageKey, JSON.stringify(projects)); } catch { /* local preview storage may be unavailable */ }
  };

  const projectValue = (project, field) => field === 'gallery' ? (project.gallery || []).join('\n') : (project[field] ?? '');

  const renderProjectOptions = () => {
    projectSelect.innerHTML = '';
    projects.forEach((project) => {
      const option = document.createElement('option');
      option.value = project.id;
      option.textContent = project.title || 'Untitled project';
      projectSelect.appendChild(option);
    });
    if (draftProject) {
      const draftOption = document.createElement('option');
      draftOption.value = '__new__';
      draftOption.textContent = 'New project';
      projectSelect.appendChild(draftOption);
      projectSelect.value = '__new__';
    } else {
      projectSelect.value = activeProjectId;
    }
  };

  const currentProject = () => draftProject || projects.find((project) => project.id === activeProjectId) || projects[0];

  const isVideoSource = (source) => /\.(mp4|webm|ogg|mov)(?:[?#].*)?$/i.test(String(source || '').trim());
  const renderMediaPreview = (container, source, alt = 'Media preview') => {
    container.innerHTML = '';
    if (!source) { container.innerHTML = '<span>No image yet</span>'; return; }
    const media = document.createElement(isVideoSource(source) ? 'video' : 'img');
    media.src = source;
    media.alt = alt;
    if (media.tagName.toLowerCase() === 'video') { media.controls = true; media.muted = true; media.playsInline = true; }
    container.appendChild(media);
  };

  const updateProjectMediaPreviews = (project) => {
    const mainPreview = projectManager.querySelector('[data-main-image-preview]');
    if (mainPreview) renderMediaPreview(mainPreview, project.image, 'Main media preview');
  };

  const updateProjectLivePreview = () => {
    const project = currentProject();
    const previewFrame = projectManager.querySelector('[data-live-project-frame]');
    if (project && previewFrame?.contentWindow) previewFrame.contentWindow.postMessage({ source: 'projectskevv-cms-project', type: 'draft-sync', project }, '*');
    let previewDocument = null;
    try { previewDocument = previewFrame?.contentDocument; } catch { previewDocument = null; }
    if (!project || !previewDocument) return;
    const title = previewDocument.querySelector('.project-detail-title-wrap h1');
    const description = previewDocument.querySelector('.project-detail-description');
    const website = previewDocument.querySelector('.project-detail-button-primary');
    const tag = previewDocument.querySelector('.meta-row .meta-label:nth-child(2)');
    const summary = previewDocument.querySelector('.project-summary');
    const meta = [...previewDocument.querySelectorAll('.project-detail-meta dd')];
    const leadImage = previewDocument.querySelector('.project-detail-lead-image img');
    const gallery = previewDocument.querySelector('.image-gallery');
    if (title) title.textContent = (project.title || 'Untitled project').toUpperCase();
    if (description) description.textContent = project.description || 'Add a project description.';
    if (website) website.href = project.website || '#';
    if (tag) tag.textContent = project.tag || 'Add tag';
    if (summary) summary.textContent = project.text || 'Add project text.';
    if (meta[0]) meta[0].textContent = project.duration || 'Add duration';
    if (meta[1]) meta[1].textContent = project.client || 'Add client';
    const leadContainer = previewDocument.querySelector('.project-detail-lead-image');
    if (leadContainer) {
      let leadMedia = leadContainer.querySelector('img, video');
      if (leadMedia && ((isVideoSource(project.image) && leadMedia.tagName.toLowerCase() !== 'video') || (!isVideoSource(project.image) && leadMedia.tagName.toLowerCase() !== 'img'))) {
        leadMedia.remove();
        leadMedia = null;
      }
      if (!leadMedia) { leadMedia = previewDocument.createElement(isVideoSource(project.image) ? 'video' : 'img'); leadContainer.appendChild(leadMedia); }
      leadMedia.src = project.image || '';
      leadMedia.alt = project.title || '';
      if (leadMedia.tagName.toLowerCase() === 'video') { leadMedia.controls = true; leadMedia.muted = true; leadMedia.playsInline = true; }
      leadMedia.style.display = 'block';
      leadMedia.style.width = '100%';
    }
    if (gallery) {
      gallery.innerHTML = '';
      (project.gallery || []).forEach((source, index) => {
        const figure = previewDocument.createElement('figure');
        figure.className = `gallery-item ${index === 0 ? 'gallery-item-large' : 'gallery-item-medium'}`;
        const image = previewDocument.createElement(isVideoSource(source) ? 'video' : 'img');
        image.src = source;
        image.alt = `${project.title || 'Project'} gallery media ${index + 1}`;
        if (image.tagName.toLowerCase() === 'video') { image.controls = true; image.muted = true; image.playsInline = true; }
        image.style.display = 'block';
        image.style.width = '100%';
        image.classList.add('cms-editor-target');
        image.dataset.editorLabel = 'Image';
        figure.appendChild(image);
        gallery.appendChild(figure);
      });
    }
  };

  const renderProjectForm = (notice = '') => {
    const project = currentProject();
    if (!project) return;
    projectManager.innerHTML = `
      <div class="cms-project-manager-inner">
        <div class="cms-project-manager-heading"><div><h2>${draftProject ? 'Create project' : 'Edit project'}</h2><p>These fields will feed the project detail page, Projects page, and Home selection.</p><button class="cms-project-preview-toggle" type="button" data-project-preview-toggle>Preview</button></div><p>${project.status || 'Draft'}</p></div>
        <div class="cms-project-manager-content">
        <form class="cms-project-form" data-project-form>
          <div class="cms-project-field"><label for="project-title">Title</label><input id="project-title" data-field="title" value="" required /></div>
          <div class="cms-project-field"><label for="project-status">Status</label><input id="project-status" data-field="status" value="" /></div>
          <div class="cms-project-field"><label for="project-slug">Slug</label><input id="project-slug" data-field="slug" value="" required /></div>
          <div class="cms-project-field"><label for="project-description">Description</label><textarea id="project-description" data-field="description"></textarea></div>
          <div class="cms-project-field"><label for="project-text">Text</label><textarea id="project-text" data-field="text"></textarea></div>
        <div class="cms-project-field"><label for="project-image">Main Image / Thumb</label><div class="cms-project-media-control"><div class="cms-project-image-preview" data-main-image-preview><span>No image yet</span></div><input id="project-image" type="url" data-field="image" placeholder="Paste image, GIF, or video URL" /><p class="cms-project-hint">Images, animated GIFs, and MP4/WebM/OGG/MOV links are supported.</p></div></div>
          <div class="cms-project-field"><label for="project-tag">Tag</label><input id="project-tag" data-field="tag" /></div>
          <div class="cms-project-field"><label for="project-duration">Duration</label><input id="project-duration" data-field="duration" /></div>
          <div class="cms-project-field"><label for="project-client">Client</label><input id="project-client" data-field="client" /></div>
          <div class="cms-project-field"><label for="project-website">Website</label><input id="project-website" type="url" data-field="website" placeholder="Page or URL..." /></div>
          <div class="cms-project-field"><label>Gallery</label><div class="cms-project-gallery"><div class="cms-project-gallery-list" data-gallery-list></div><button class="cms-project-add-image" type="button" data-gallery-add>+ Add image</button><p class="cms-project-hint">Add images one by one. Each image appears as a visual thumbnail.</p></div></div>
          <div class="cms-project-field"><label for="project-use-video">Video</label><div><label><input id="project-use-video" type="checkbox" data-field="useVideo" /> Use video as cover</label><input id="project-video-poster" type="url" data-field="videoPoster" placeholder="Video poster URL" style="margin-top:8px" /><input id="project-video-file" type="url" data-field="videoFile" placeholder="Video file URL" style="margin-top:8px" /></div></div>
          <div class="cms-project-form-actions"><span class="cms-project-notice">${notice}</span><button class="cms-project-cancel" type="button" data-project-cancel>Cancel</button><button class="cms-project-save" type="submit">Save project</button></div>
        </form>
        <div class="cms-project-live-preview" data-project-live-preview><iframe data-live-project-frame title="Exact project page preview" src="../projects/beach-shoot/index.html?cms=1&projectEditor=1"></iframe></div>
        </div>
      </div>
    `;
    projectManager.querySelectorAll('[data-field]').forEach((field) => {
      const value = projectValue(project, field.dataset.field);
      if (field.type === 'checkbox') field.checked = Boolean(value);
      else field.value = value;
      field.addEventListener('input', () => {
        if (field.type === 'checkbox') project[field.dataset.field] = field.checked;
        else project[field.dataset.field] = field.value;
        updateProjectLivePreview();
        updateProjectMediaPreviews(project);
      });
    });
    const galleryList = projectManager.querySelector('[data-gallery-list]');
    const renderGalleryFields = () => {
      galleryList.innerHTML = '';
      (project.gallery || []).forEach((source, index) => {
        const row = document.createElement('div');
        row.className = 'cms-project-gallery-row';
        row.innerHTML = `<div class="cms-project-image-preview"><span>No image</span></div><input type="url" placeholder="Paste image, GIF, or video URL" aria-label="Gallery media URL" /><button class="cms-project-gallery-remove" type="button">Remove</button>`;
        const preview = row.querySelector('.cms-project-image-preview');
        const input = row.querySelector('input');
        const remove = row.querySelector('button');
        input.value = source || '';
        if (source) renderMediaPreview(preview, source, `Gallery media ${index + 1}`);
        input.addEventListener('input', () => {
          project.gallery[index] = input.value.trim();
          if (input.value.trim()) renderMediaPreview(preview, input.value.trim(), `Gallery media ${index + 1}`);
          else preview.innerHTML = '<span>No image</span>';
          updateProjectLivePreview();
        });
        remove.addEventListener('click', () => { project.gallery.splice(index, 1); renderGalleryFields(); updateProjectLivePreview(); });
        row.querySelector('input').addEventListener('error', () => { preview.innerHTML = '<span>Check URL</span>'; });
        galleryList.appendChild(row);
      });
    };
    projectManager.querySelector('[data-gallery-add]').addEventListener('click', () => { project.gallery.push(''); renderGalleryFields(); });
    renderGalleryFields();
    updateProjectMediaPreviews(project);
    projectManager.classList.toggle('is-previewing', projectPreviewMode);
    const previewToggle = projectManager.querySelector('[data-project-preview-toggle]');
    const previewFrame = projectManager.querySelector('[data-live-project-frame]');
    previewFrame?.addEventListener('load', updateProjectLivePreview);
    previewToggle.textContent = projectPreviewMode ? 'Edit fields' : 'Preview';
    previewToggle.addEventListener('click', () => {
      projectPreviewMode = !projectPreviewMode;
      projectManager.classList.toggle('is-previewing', projectPreviewMode);
      previewToggle.textContent = projectPreviewMode ? 'Edit fields' : 'Preview';
    });
    updateProjectLivePreview();
    projectManager.querySelector('[data-project-cancel]').addEventListener('click', () => {
      draftProject = null;
      activeProjectId = projects[0]?.id || null;
      renderProjectOptions();
      renderProjectForm();
    });
    projectManager.querySelector('[data-project-form]').addEventListener('submit', (event) => {
      event.preventDefault();
      const slug = String(project.slug || project.title || 'new-project').toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      project.slug = slug || `project-${Date.now()}`;
      project.id = project.id || project.slug;
      if (draftProject) {
        projects.push({ ...project, id: project.id });
        activeProjectId = project.id;
        draftProject = null;
      }
      saveProjects();
      projectPreviewMode = true;
      renderProjectOptions();
      renderProjectForm('Saved locally');
    });
  };

  const openProjectManager = () => {
    projectListingMode = false;
    projectTools.hidden = false;
    projectManager.hidden = false;
    projectFrame.hidden = true;
    if (editorFrameOverlay) editorFrameOverlay.hidden = true;
    if (editingStatus) editingStatus.hidden = true;
    if (publicLink) publicLink.href = '../projects/index.html';
    if (projectsPageLink) projectsPageLink.textContent = 'View Projects page ↗';
    renderProjectOptions();
    renderProjectForm();
  };

  projectSelect.addEventListener('change', () => {
    projectListingMode = false;
    projectManager.hidden = false;
    projectFrame.hidden = true;
    if (projectsPageLink) projectsPageLink.textContent = 'View Projects page ↗';
    draftProject = null;
    projectPreviewMode = false;
    activeProjectId = projectSelect.value;
    renderProjectForm();
  });
  newProjectButton.addEventListener('click', () => {
    projectListingMode = false;
    if (projectsPageLink) projectsPageLink.textContent = 'View Projects page ↗';
    projectPreviewMode = false;
    projectTools.hidden = false;
    projectManager.hidden = false;
    projectFrame.hidden = true;
    draftProject = { id: '', title: 'New project', status: 'Draft', slug: '', description: '', text: '', image: '', tag: '', duration: '', client: '', website: '', gallery: [], useVideo: false, videoPoster: '', videoFile: '' };
    renderProjectOptions();
    renderProjectForm();
    projectManager.scrollTop = 0;
  });
  projectsPageLink.addEventListener('click', () => {
    projectListingMode = !projectListingMode;
    if (projectListingMode) {
      projectManager.hidden = true;
      projectFrame.hidden = false;
      projectFrame.src = '../projects/index.html?cms=1&lockedMedia=1';
      projectsPageLink.textContent = 'Back to editor';
    } else {
      projectFrame.hidden = true;
      projectManager.hidden = false;
      projectsPageLink.textContent = 'View Projects page ↗';
    }
  });

  window.addEventListener('message', (event) => {
    if (event.source !== projectFrame.contentWindow || event.data?.source !== 'projectskevv-cms-project') return;
    const project = currentProject();
    if (!project) return;
    const { type, field, value, index } = event.data;
    if (type === 'field-change' && field) {
      project[field] = value;
      const input = projectManager.querySelector(`[data-field="${field}"]`);
      if (input) input.value = value;
      updateProjectLivePreview();
    }
    if (type === 'media-change' && field === 'image') {
      project.image = value;
      const input = projectManager.querySelector('[data-field="image"]');
      if (input) input.value = value;
      updateProjectMediaPreviews(project);
    }
    if (type === 'media-change' && field === 'gallery' && Number.isInteger(index)) {
      project.gallery[index] = value;
      const galleryRows = projectManager.querySelectorAll('[data-gallery-list] .cms-project-gallery-row');
      const input = galleryRows[index]?.querySelector('input');
      const preview = galleryRows[index]?.querySelector('.cms-project-image-preview');
      if (input) input.value = value;
      if (preview) renderMediaPreview(preview, value, `Gallery media ${index + 1}`);
    }
  });
  openProjectManager();
}

if (page.label === 'Services') {
  const serviceTools = document.querySelector('#cms-service-tools');
  const serviceSelect = document.querySelector('#cms-service-select');
  const newServiceButton = document.querySelector('#cms-new-service');
  const servicesPageLink = document.querySelector('#cms-services-page-link');
  const serviceManager = document.querySelector('#cms-service-manager');
  const serviceFrame = document.querySelector('#cms-page-frame');
  const servicesStorageKey = 'projectskevv.cms.services.v1';
  const seedServices = [{
    id: 'branding', title: 'Branding', status: 'Live', slug: 'branding',
    description: 'Distinctive identities built to make your brand clearer, more memorable, and ready to grow.',
    scope: 'Brand identity', timeline: '2–4 weeks', image: 'https://framerusercontent.com/images/8nrq8L6qbVPhVhBA9TMoevGLql4.webp',
    applicationTitle: 'BRAND APPLICATION', applicationDescription: 'Translating your core values into tangible brand applications for print and digital channels.',
    applicationVisuals: ['https://framerusercontent.com/images/8nrq8L6qbVPhVhBA9TMoevGLql4.webp', 'https://framerusercontent.com/images/daFBEqvccTmPwLaEvq3zBCJm8PU.png', 'https://framerusercontent.com/images/75Ki88np43SW5rT6tbMlWFiQ.png'],
    detail1Title: 'LOGO SYSTEM & USAGE', detail1Description: 'Logo system is core values into tangible brand applications for print and digital channels.', detail1Image: 'https://framerusercontent.com/images/3reGuWpWiARbmfYlToDFtUzhTc.png',
    detail2Title: 'TYPOGRAPHY & COLOR PALETTE', detail2Description: 'Typography, color, font palette, and expressive visual rules.', detail2Image: 'https://framerusercontent.com/images/xh2fVOTsCE3Sh3cD7Cy9JcjItI.png',
    detail3Title: 'VOICE & TONE GUIDELINES', detail3Description: 'A memorable voice and tone system for every brand touchpoint.', detail3Image: 'https://framerusercontent.com/images/3tETJhxzC5Ip37bkrel8frXLtYs.png',
    featureTitle: 'ONE SYSTEM, EVERY TOUCHPOINT', featureText: 'A strong identity should feel unmistakable everywhere it appears. We turn the core brand idea into a practical visual system.', featureImage: 'https://framerusercontent.com/images/8nrq8L6qbVPhVhBA9TMoevGLql4.webp', websiteImage: 'https://framerusercontent.com/images/8nrq8L6qbVPhVhBA9TMoevGLql4.webp'
  }];
  let storedServices = [];
  try { storedServices = JSON.parse(localStorage.getItem(servicesStorageKey) || '[]'); } catch { storedServices = []; }
  const services = storedServices.length ? storedServices : seedServices;
  let activeServiceId = services[0]?.id || null;
  let draftService = null;

  const currentService = () => draftService || services.find((service) => service.id === activeServiceId) || services[0];
  const saveServices = () => { try { localStorage.setItem(servicesStorageKey, JSON.stringify(services)); } catch { /* local preview storage may be unavailable */ } };
  const serviceValue = (service, field) => field === 'applicationVisuals' ? (service.applicationVisuals || []).join('\n') : (service[field] ?? '');
  const updateServicePreview = () => {
    const service = currentService();
    const frame = serviceManager.querySelector('[data-service-preview-frame]');
    if (service && frame?.contentWindow) frame.contentWindow.postMessage({ source: 'projectskevv-cms-service', type: 'draft-sync', service }, '*');
    let doc = null;
    try { doc = frame?.contentDocument; } catch { doc = null; }
    if (!service || !doc) return;
    const setText = (selector, value) => { const element = doc.querySelector(selector); if (element) element.textContent = value || ''; };
    setText('#service-title', (service.title || 'Untitled service').toUpperCase());
    setText('.project-detail-description', service.description);
    setText('.project-detail-meta dd:nth-of-type(1)', service.scope);
    setText('.project-detail-meta dd:nth-of-type(2)', service.timeline);
    setText('#service-showcase-title', service.applicationTitle);
    setText('.service-showcase-intro > p', service.applicationDescription);
    setText('.service-showcase-detail:nth-of-type(1) h3', service.detail1Title);
    setText('.service-showcase-detail:nth-of-type(1) p', service.detail1Description);
    setText('.service-showcase-detail:nth-of-type(2) h3', service.detail2Title);
    setText('.service-showcase-detail:nth-of-type(2) p', service.detail2Description);
    setText('.service-showcase-detail:nth-of-type(3) h3', service.detail3Title);
    setText('.service-showcase-detail:nth-of-type(3) p', service.detail3Description);
    setText('.service-showcase-feature h3', service.featureTitle);
    setText('.service-showcase-feature p', service.featureText);
    const heroImage = doc.querySelector('.project-detail-lead-image img');
    if (heroImage) heroImage.src = service.image || '';
    const showcaseImages = [...doc.querySelectorAll('.service-showcase-visuals img')];
    (service.applicationVisuals || []).slice(0, 3).forEach((source, index) => { if (showcaseImages[index]) showcaseImages[index].src = source; });
    const detailImages = [...doc.querySelectorAll('.service-showcase-detail figure img')];
    [service.detail1Image, service.detail2Image, service.detail3Image].forEach((source, index) => { if (detailImages[index]) detailImages[index].src = source; });
    const featureImage = doc.querySelector('.service-showcase-feature figure img');
    if (featureImage) featureImage.src = service.featureImage || '';
    const websiteImage = doc.querySelector('.service-website-card img');
    if (websiteImage) websiteImage.src = service.websiteImage || '';
  };
  const renderServiceOptions = () => {
    serviceSelect.innerHTML = '';
    services.forEach((service) => { const option = document.createElement('option'); option.value = service.id; option.textContent = service.title || 'Untitled service'; serviceSelect.appendChild(option); });
    if (draftService) { const option = document.createElement('option'); option.value = '__new__'; option.textContent = 'New service'; serviceSelect.appendChild(option); serviceSelect.value = '__new__'; }
    else serviceSelect.value = activeServiceId;
  };
  const renderServiceForm = (notice = '') => {
    const service = currentService();
    if (!service) return;
    serviceManager.innerHTML = `
      <div class="cms-project-manager-inner">
        <div class="cms-project-manager-heading"><div><h2>${draftService ? 'Create service' : 'Edit service'}</h2><p>These fields map directly to the service detail page.</p><button class="cms-project-preview-toggle" type="button" data-service-preview-toggle>Preview</button></div><p>${service.status || 'Draft'}</p></div>
        <form class="cms-project-form" data-service-form>
          <div class="cms-project-field"><label>Title</label><input data-service-field="title" required /></div>
          <div class="cms-project-field"><label>Status</label><input data-service-field="status" /></div>
          <div class="cms-project-field"><label>Slug</label><input data-service-field="slug" required /></div>
          <div class="cms-project-field"><label>Description</label><textarea data-service-field="description"></textarea></div>
          <div class="cms-project-field"><label>Scope</label><input data-service-field="scope" /></div>
          <div class="cms-project-field"><label>Timeline</label><input data-service-field="timeline" /></div>
          <div class="cms-project-field"><label>Main Image</label><input type="url" data-service-field="image" placeholder="Image, GIF, or video URL" /></div>
          <div class="cms-service-section-label">Brand Application</div>
          <div class="cms-project-field"><label>Section title</label><input data-service-field="applicationTitle" /></div>
          <div class="cms-project-field"><label>Section intro</label><textarea data-service-field="applicationDescription"></textarea></div>
          <div class="cms-project-field"><label>Application visuals</label><div class="cms-service-visual-list"><textarea data-service-field="applicationVisuals" placeholder="One image, GIF, or video URL per line"></textarea><p class="cms-project-hint">These feed the Brand Application visual strip.</p></div></div>
          <div class="cms-project-field"><label>Detail 1</label><div><input data-service-field="detail1Title" placeholder="Title" /><textarea data-service-field="detail1Description" placeholder="Description"></textarea><input type="url" data-service-field="detail1Image" placeholder="Image, GIF, or video URL" /></div></div>
          <div class="cms-project-field"><label>Detail 2</label><div><input data-service-field="detail2Title" placeholder="Title" /><textarea data-service-field="detail2Description" placeholder="Description"></textarea><input type="url" data-service-field="detail2Image" placeholder="Image, GIF, or video URL" /></div></div>
          <div class="cms-project-field"><label>Detail 3</label><div><input data-service-field="detail3Title" placeholder="Title" /><textarea data-service-field="detail3Description" placeholder="Description"></textarea><input type="url" data-service-field="detail3Image" placeholder="Image, GIF, or video URL" /></div></div>
          <div class="cms-project-field"><label>Feature block</label><div><input data-service-field="featureTitle" placeholder="Title" /><textarea data-service-field="featureText" placeholder="Description"></textarea><input type="url" data-service-field="featureImage" placeholder="Image, GIF, or video URL" /></div></div>
          <div class="cms-project-field"><label>Website visual</label><input type="url" data-service-field="websiteImage" placeholder="Image, GIF, or video URL" /></div>
          <div class="cms-project-form-actions"><span class="cms-project-notice">${notice}</span><button type="button" class="cms-project-cancel" data-service-cancel>Cancel</button><button class="cms-project-save" type="submit">Save service</button></div>
        </form>
        <div class="cms-project-live-preview" data-service-live-preview><iframe data-service-preview-frame title="Exact service page preview" src="../services/branding/index.html?cms=1&serviceEditor=1"></iframe></div>
      </div>`;
    serviceManager.querySelectorAll('[data-service-field]').forEach((field) => {
      field.value = serviceValue(service, field.dataset.serviceField);
      field.addEventListener('input', () => { service[field.dataset.serviceField] = field.dataset.serviceField === 'applicationVisuals' ? field.value.split(/\r?\n/).map((item) => item.trim()).filter(Boolean) : field.value; updateServicePreview(); });
    });
    const previewFrame = serviceManager.querySelector('[data-service-preview-frame]');
    previewFrame.addEventListener('load', updateServicePreview);
    const previewToggle = serviceManager.querySelector('[data-service-preview-toggle]');
    previewToggle.addEventListener('click', () => { serviceManager.classList.toggle('is-previewing'); previewToggle.textContent = serviceManager.classList.contains('is-previewing') ? 'Edit fields' : 'Preview'; updateServicePreview(); });
    serviceManager.querySelector('[data-service-cancel]').addEventListener('click', () => { draftService = null; activeServiceId = services[0]?.id || null; renderServiceOptions(); renderServiceForm(); });
    serviceManager.querySelector('[data-service-form]').addEventListener('submit', (event) => { event.preventDefault(); service.slug = String(service.slug || service.title || 'new-service').toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || `service-${Date.now()}`; service.id = service.id || service.slug; if (draftService) { services.push({ ...service }); activeServiceId = service.id; draftService = null; } saveServices(); renderServiceOptions(); renderServiceForm('Saved locally'); serviceManager.classList.add('is-previewing'); });
    updateServicePreview();
  };
  serviceTools.hidden = false;
  document.querySelector('#cms-project-tools').hidden = true;
  serviceManager.hidden = false;
  serviceFrame.hidden = true;
  if (editingStatus) editingStatus.hidden = true;
  if (publicLink) publicLink.href = '../services/index.html';
  servicesPageLink.addEventListener('click', () => { const showing = !serviceManager.hidden; serviceManager.hidden = showing; serviceFrame.hidden = !showing; serviceFrame.src = '../services/index.html?cms=1&lockedMedia=1'; servicesPageLink.textContent = showing ? 'Back to editor' : 'View Services page ↗'; });
  serviceSelect.addEventListener('change', () => { draftService = null; activeServiceId = serviceSelect.value; serviceManager.classList.remove('is-previewing'); renderServiceForm(); });
  newServiceButton.addEventListener('click', () => { draftService = { id: '', title: 'New service', status: 'Draft', slug: '', description: '', scope: '', timeline: '', image: '', applicationTitle: 'BRAND APPLICATION', applicationDescription: '', applicationVisuals: [], detail1Title: '', detail1Description: '', detail1Image: '', detail2Title: '', detail2Description: '', detail2Image: '', detail3Title: '', detail3Description: '', detail3Image: '', featureTitle: '', featureText: '', featureImage: '', websiteImage: '' }; renderServiceOptions(); renderServiceForm(); });
  window.addEventListener('message', (event) => { if (event.source !== serviceFrame.contentWindow || event.data?.source !== 'projectskevv-cms-service') return; const service = currentService(); if (!service) return; if (event.data.type === 'field-change' && event.data.field) { service[event.data.field] = event.data.value; const input = serviceManager.querySelector(`[data-service-field="${event.data.field}"]`); if (input) input.value = event.data.value; } });
  renderServiceOptions();
  renderServiceForm();
}
