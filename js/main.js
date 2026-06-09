/* ===================================================
   OPTIMALIZED MAIN.JS - Performance Enhanced + Multi-language Fix
   Jánosi Dalma - Pszichoterápia Website
   Version 2.1 - 2026.01.11
   =================================================== */

/* ---------------------------------------------------
   PERFORMANCE UTILITIES
--------------------------------------------------- */

const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

const rafThrottle = (callback) => {
  let requestId = null;
  let lastArgs;

  const later = (context) => () => {
    requestId = null;
    callback.apply(context, lastArgs);
  };

  const throttled = function (...args) {
    lastArgs = args;
    if (requestId === null) {
      requestId = requestAnimationFrame(later(this));
    }
  };

  throttled.cancel = () => {
    cancelAnimationFrame(requestId);
    requestId = null;
  };

  return throttled;
};

/* ---------------------------------------------------
   GLOBAL STATE
--------------------------------------------------- */
let cachedTranslations = null;
let cachedPosts = null;
let currentLang = getCurrentLang();
let allPosts = [];
let currentCategory = 'all';

const CATEGORY_NAMES = {
  'all':           { hu: 'Összes',         ro: 'Toate',                en: 'All' },
  'anxiety':       { hu: 'Szorongás',      ro: 'Anxietate',            en: 'Anxiety' },
  'relationships': { hu: 'Kapcsolatok',    ro: 'Relații',              en: 'Relationships' },
  'family':        { hu: 'Családterápia',  ro: 'Terapie de familie',   en: 'Family Therapy' },
  'personal-growth':{ hu: 'Személyes fejlődés', ro: 'Dezvoltare personală', en: 'Personal Growth' }
};

const SVG_SUN = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M12 18c-3.3 0-6-2.7-6-6s2.7-6 6-6 6 2.7 6 6-2.7 6-6 6zm0-10c-2.2 0-4 1.8-4 4s1.8 4 4 4 4-1.8 4-4-1.8-4-4-4zM12 4c-.6 0-1-.4-1-1V1c0-.6.4-1 1-1s1 .4 1 1v2c0 .6-.4 1-1 1zm0 20c-.6 0-1-.4-1-1v-2c0-.6.4-1 1-1s1 .4 1 1v2c0 .6-.4 1-1 1zM23 12c0 .6-.4 1-1 1h-2c-.6 0-1-.4-1-1s.4-1 1-1h2c.6 0 1 .4 1 1zM5 12c0 .6-.4 1-1 1H2c-.6 0-1-.4-1-1s.4-1 1-1h2c.6 0 1 .4 1 1zm13.7 6.3c-.4.4-1 .4-1.4 0-.4-.4-.4-1 0-1.4l1.4-1.4c.4-.4 1-.4 1.4 0 .4.4.4 1 0 1.4l-1.4 1.4zM6.7 7.7c-.4.4-1 .4-1.4 0L3.9 6.3c-.4-.4-.4-1 0-1.4.4-.4 1-.4 1.4 0l1.4 1.4c.4.4.4 1 0 1.4zm11 0c.4.4.4 1 0 1.4-.4.4-1 .4-1.4 0L15 7.7c-.4-.4-.4-1 0-1.4.4-.4 1-.4 1.4 0l1.3 1.4zm-11 9.6c.4.4.4 1 0 1.4l-1.4 1.4c-.4.4-1 .4-1.4 0-.4-.4-.4-1 0-1.4l1.4-1.4c.4-.4 1-.4 1.4 0z"/></svg>';
const SVG_MOON = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>';

/* ---------------------------------------------------
   LANGUAGE MANAGEMENT
--------------------------------------------------- */

function getCurrentLang() {
  const urlParams = new URLSearchParams(window.location.search);
  const urlLang = urlParams.get('lang');
  
  if (urlLang && ['hu', 'ro', 'en'].includes(urlLang)) {
    return urlLang;
  }
  
  try {
    const stored = localStorage.getItem('lang');
    if (stored && ['hu', 'ro', 'en'].includes(stored)) {
      return stored;
    }
  } catch (e) {
    console.warn('LocalStorage not available:', e);
  }
  
  return 'hu';
}

function setLangCookie(lang) {
  const expires = new Date();
  expires.setFullYear(expires.getFullYear() + 1);
  document.cookie = `lang=${lang};expires=${expires.toUTCString()};path=/;SameSite=Lax`;
  
  try {
    localStorage.setItem('lang', lang);
  } catch (e) {
    console.warn('LocalStorage not available:', e);
  }
}

/* ---------------------------------------------------
   LANGUAGE SWITCHER - Event Delegation
--------------------------------------------------- */
const langSwitcher = document.querySelector(".lang-switcher");
if (langSwitcher) {
  const activeBtn = langSwitcher.querySelector(`[data-lang="${currentLang}"]`);
  if (activeBtn) activeBtn.classList.add('active');
  
  langSwitcher.addEventListener("click", (e) => {
    const btn = e.target.closest('[data-lang]');
    if (!btn) return;
    
    const newLang = btn.dataset.lang;
    if (newLang === currentLang) return;
    
    currentLang = newLang;
    setLangCookie(currentLang);
    
    langSwitcher.querySelectorAll('button').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    loadStaticText();
    
    if (document.getElementById("blogContainer")) {
      updateBlogSearchAndFilters(); // Frissíti a keresőmező és kategória gombokat
      renderBlogPosts(allPosts);
    }
    if (document.getElementById("postTitle")) {
      loadBlogPost();
    }
  });
}

/* ---------------------------------------------------
   MOBILE MENU
--------------------------------------------------- */
const menuBtn = document.getElementById("menuBtn");
const mobileMenu = document.getElementById("mobileMenu");

if (menuBtn && mobileMenu) {
  menuBtn.addEventListener("click", () => {
    const isOpen = mobileMenu.classList.toggle("is-open");
    menuBtn.classList.toggle("active", isOpen);
    menuBtn.setAttribute('aria-expanded', isOpen);
  });

  mobileMenu.addEventListener("click", (e) => {
    if (e.target.tagName === 'A') {
      mobileMenu.classList.remove("is-open");
      menuBtn.classList.remove("active");
      menuBtn.setAttribute('aria-expanded', 'false');
    }
  });
}

/* ---------------------------------------------------
   DARK MODE
--------------------------------------------------- */
function initDarkMode() {
  const savedTheme = localStorage.getItem('theme') || 'light';
  document.documentElement.setAttribute('data-theme', savedTheme);

  const toggleBtn = document.createElement('button');
  toggleBtn.className = 'theme-toggle';
  toggleBtn.setAttribute('aria-label', 'Témaváltás');
  toggleBtn.innerHTML = savedTheme === 'dark' ? SVG_SUN : SVG_MOON;
  
  document.body.appendChild(toggleBtn);

  toggleBtn.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    
    toggleBtn.innerHTML = newTheme === 'dark' ? SVG_SUN : SVG_MOON;
  });
}

/* ---------------------------------------------------
   SCROLL TO TOP
--------------------------------------------------- */
function initScrollToTop() {
  const scrollBtn = document.createElement('button');
  scrollBtn.className = 'scroll-to-top';
  scrollBtn.setAttribute('aria-label', 'Vissza a tetejére');
  scrollBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M12 8l-6 6 1.4 1.4 4.6-4.6 4.6 4.6L18 14z"/></svg>';
  document.body.appendChild(scrollBtn);

  const handleScroll = rafThrottle(() => {
    if (window.pageYOffset > 300) {
      scrollBtn.classList.add('visible');
    } else {
      scrollBtn.classList.remove('visible');
    }
  });

  window.addEventListener('scroll', handleScroll, { passive: true });

  scrollBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

/* ---------------------------------------------------
   LAZY LOADING
--------------------------------------------------- */
function initLazyLoading() {
  if ('loading' in HTMLImageElement.prototype) {
    const images = document.querySelectorAll('img[data-src]');
    images.forEach(img => {
      img.src = img.dataset.src;
      img.removeAttribute('data-src');
    });
  } else {
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src;
          img.classList.add('loaded');
          img.removeAttribute('data-src');
          observer.unobserve(img);
        }
      });
    }, {
      rootMargin: '50px'
    });

    document.querySelectorAll('img[data-src]').forEach(img => {
      imageObserver.observe(img);
    });
  }
}

/* ---------------------------------------------------
   BASE PATH DETECTION
--------------------------------------------------- */
function getBasePath() {
  const path = window.location.pathname;
  
  if (path.includes("/service/")) {
    const parts = path.split('/');
    const repoIndex = parts.findIndex(p => p !== '');
    
    if (repoIndex >= 0 && parts[repoIndex] !== 'service') {
      return `/${parts[repoIndex]}/`;
    }
    return "../";
  }
  
  const parts = path.split('/').filter(p => p !== '');
  
  if (parts.length > 1 && parts[0] !== 'index.html' && parts[0] !== 'blog.html') {
    return `/${parts[0]}/`;
  }
  
  return "./";
}

/* ---------------------------------------------------
   STATIC TEXT LOADING
--------------------------------------------------- */
function loadStaticText() {
  if (cachedTranslations) {
    updateDOM(cachedTranslations);
    return;
  }
  
  const basePath = getBasePath();
  const langPath = basePath + "lang.json";

  fetch(langPath)
    .then(res => {
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      return res.json();
    })
    .then(data => {
      cachedTranslations = data;
      updateDOM(data);
    })
    .catch(error => {
      console.error("❌ Error loading lang.json:", error);
    });
}

function updateDOM(data) {
  document.querySelectorAll("[data-key]").forEach(el => {
    const key = el.dataset.key;
    if (data[key] && data[key][currentLang]) {
      el.innerHTML = data[key][currentLang];
    }
  });

  document.querySelectorAll("[data-key-placeholder]").forEach(el => {
    const key = el.dataset.keyPlaceholder;
    if (data[key] && data[key][currentLang]) {
      el.placeholder = data[key][currentLang];
    }
  });
}

/* ---------------------------------------------------
   BLOG LIST
--------------------------------------------------- */
function fetchPosts(basePath) {
  if (cachedPosts) return Promise.resolve(cachedPosts);
  return fetch(basePath + "blog-posts.json")
    .then(res => {
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      return res.json();
    })
    .then(posts => { cachedPosts = posts; return posts; });
}

function loadBlogList() {
  const container = document.getElementById("blogContainer");
  if (!container) return;

  fetchPosts(getBasePath())
    .then(posts => {
      allPosts = posts;
      renderBlogPosts(posts);
      initBlogSearch();
      initCategoryFilter();
    })
    .catch(error => {
      console.error("❌ Error loading blog posts:", error);
      container.innerHTML = '<p class="no-results">Nem sikerült betölteni a blogposztokat.</p>';
    });
}

function renderBlogPosts(posts) {
  const container = document.getElementById("blogContainer");
  if (!container) return;

  const basePath = getBasePath();
  
  if (posts.length === 0) {
    container.innerHTML = '<p class="no-results">Nincs találat.</p>';
    return;
  }

  const fragment = document.createDocumentFragment();
  
  posts.forEach(post => {
    const title = post.title?.[currentLang] || 'Untitled';
    const postLink = basePath + `blog-post.html?id=${post.id}&lang=${currentLang}`;
    const imageSrc = post.image.startsWith('/') ? post.image : basePath + post.image;
    const categoryBadge = post.category 
      ? `<span class="badge badge-category">${post.category[currentLang] || post.category.hu}</span>`
      : '';
    
    const card = document.createElement('a');
    card.href = postLink;
    card.className = 'blog-card card fade-in';
    card.innerHTML = `
      <div class="blog-card-image card-image">
        <img src="${imageSrc}" alt="${title}" loading="lazy">
      </div>
      <div class="blog-card-content card-content">
        ${categoryBadge}
        <h3>${title}</h3>
      </div>
    `;
    
    fragment.appendChild(card);
  });

  container.innerHTML = '';
  container.appendChild(fragment);
}

/* ---------------------------------------------------
   BLOG SEARCH
--------------------------------------------------- */
function initBlogSearch() {
  const searchContainer = document.querySelector('.blog-list .container');
  if (!searchContainer || document.getElementById('blogSearch')) return;

  const searchBar = document.createElement('div');
  searchBar.className = 'search-bar';
  searchBar.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
      <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
    </svg>
    <input type="text" id="blogSearch" placeholder="${getSearchPlaceholder()}">
  `;
  
  searchContainer.insertBefore(searchBar, document.getElementById('blogContainer'));

  const searchInput = document.getElementById('blogSearch');
  
  const debouncedSearch = debounce((query) => {
    filterPosts(query.toLowerCase(), currentCategory);
  }, 300);

  searchInput.addEventListener('input', (e) => {
    debouncedSearch(e.target.value);
  });
}

function getSearchPlaceholder() {
  if (!cachedTranslations) return 'Keresés a blogban...';
  const key = 'blog_search_placeholder';
  return cachedTranslations[key]?.[currentLang] || 'Keresés a blogban...';
}

/* ---------------------------------------------------
   CATEGORY FILTER
--------------------------------------------------- */
function initCategoryFilter() {
  const searchContainer = document.querySelector('.blog-list .container');
  if (!searchContainer || document.getElementById('categoryFilter')) return;

  const categories = ['all', ...new Set(allPosts.map(post => post.category?.en).filter(Boolean))];

  const filterBar = document.createElement('div');
  filterBar.className = 'category-filter';
  filterBar.id = 'categoryFilter';

  categories.forEach(cat => {
    const btn = document.createElement('button');
    btn.className = cat === 'all' ? 'category-btn active' : 'category-btn';
    btn.textContent = CATEGORY_NAMES[cat]?.[currentLang] || cat;
    btn.dataset.category = cat;
    filterBar.appendChild(btn);
  });

  filterBar.addEventListener('click', (e) => {
    const btn = e.target.closest('.category-btn');
    if (!btn) return;

    filterBar.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentCategory = btn.dataset.category;
    
    const searchQuery = document.getElementById('blogSearch')?.value.toLowerCase() || '';
    filterPosts(searchQuery, currentCategory);
  });

  const blogContainer = document.getElementById('blogContainer');
  searchContainer.insertBefore(filterBar, blogContainer);
}

/* ---------------------------------------------------
   UPDATE BLOG SEARCH AND FILTERS (Nyelvváltáskor)
--------------------------------------------------- */
function updateBlogSearchAndFilters() {
  // Frissítjük a keresőmező placeholder-ét
  const searchInput = document.getElementById('blogSearch');
  if (searchInput && cachedTranslations) {
    searchInput.placeholder = cachedTranslations['blog_search_placeholder']?.[currentLang] || 'Keresés a blogban...';
  }

  const categoryFilter = document.getElementById('categoryFilter');
  if (categoryFilter) {
    categoryFilter.querySelectorAll('.category-btn').forEach(btn => {
      const cat = btn.dataset.category;
      btn.textContent = CATEGORY_NAMES[cat]?.[currentLang] || cat;
    });
  }
}

function filterPosts(query, category) {
  let filtered = allPosts;

  if (category !== 'all') {
    filtered = filtered.filter(post => post.category?.en === category);
  }

  if (query) {
    filtered = filtered.filter(post => {
      const title = (post.title?.[currentLang] || '').toLowerCase();
      const content = (post.content?.[currentLang] || []).join(' ').toLowerCase();
      return title.includes(query) || content.includes(query);
    });
  }

  renderBlogPosts(filtered);
}

/* ---------------------------------------------------
   BLOG POST LOADING
--------------------------------------------------- */
function loadBlogPost() {
  const postTitle = document.getElementById("postTitle");
  const postContent = document.getElementById("postContent");
  const postImage = document.getElementById("postImage");
  
  if (!postTitle || !postContent || !postImage) return;

  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");
  
  if (!id) {
    console.error("❌ No ID parameter in URL!");
    postContent.innerHTML = '<p class="no-results">Nincs megadva blogposzt azonosító.</p>';
    return;
  }

  const basePath = getBasePath();

  fetchPosts(basePath)
    .then(posts => {
      const post = posts.find(p => p.id == id);
      
      if (!post) {
        console.error("❌ Post not found:", id);
        postContent.innerHTML = '<p class="no-results">A keresett blogposzt nem található.</p>';
        return;
      }

      const title = post.title?.[currentLang] || 'Untitled';
      postTitle.textContent = title;

      const imageSrc = post.image.startsWith('/') ? post.image : basePath + post.image;
      postImage.src = imageSrc;
      postImage.alt = title;

      if (post.content?.[currentLang]) {
        const fragment = document.createDocumentFragment();
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = post.content[currentLang].join('');
        fragment.appendChild(tempDiv);
        postContent.innerHTML = '';
        postContent.appendChild(fragment);
      } else {
        postContent.innerHTML = '<p class="no-results">Nincs elérhető tartalom ezen a nyelven.</p>';
      }

      renderRelatedPosts(posts, post, basePath);
    })
    .catch(error => {
      console.error("❌ Error loading blog post:", error);
      postContent.innerHTML = '<p class="no-results">Nem sikerült betölteni a blogposztot.</p>';
    });
}

/* ---------------------------------------------------
   RELATED POSTS
--------------------------------------------------- */
function renderRelatedPosts(allPosts, currentPost, basePath) {
  const postContent = document.getElementById("postContent");
  if (!postContent) return;

  const related = allPosts
    .filter(p => 
      p.id !== currentPost.id && 
      p.category?.en === currentPost.category?.en
    )
    .slice(0, 3);

  if (related.length === 0) return;

  const relatedSection = document.createElement('div');
  relatedSection.className = 'related-posts';
  
  const title = document.createElement('h3');
  title.textContent = 'Kapcsolódó cikkek';
  relatedSection.appendChild(title);

  const grid = document.createElement('div');
  grid.className = 'related-posts-grid';

  related.forEach(post => {
    const postTitle = post.title?.[currentLang] || 'Untitled';
    const imageSrc = post.image.startsWith('/') ? post.image : basePath + post.image;
    const postLink = basePath + `blog-post.html?id=${post.id}&lang=${currentLang}`;
    
    const card = document.createElement('a');
    card.href = postLink;
    card.className = 'blog-card card';
    card.innerHTML = `
      <div class="blog-card-image card-image">
        <img src="${imageSrc}" alt="${postTitle}" loading="lazy">
      </div>
      <div class="blog-card-content card-content">
        <h3 class="fs-base">${postTitle}</h3>
      </div>
    `;
    
    grid.appendChild(card);
  });

  relatedSection.appendChild(grid);
  postContent.appendChild(relatedSection);
}

/* ---------------------------------------------------
   CONTACT FORM
--------------------------------------------------- */
const contactForm = document.getElementById("contactForm");

if (contactForm) {
  let emailJSLoaded = false;

  const loadEmailJS = () => {
    if (emailJSLoaded) return;
    
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js';
    script.onload = () => {
      emailjs.init("_Rq7FAjiXz4lWprzY");
      emailJSLoaded = true;
    };
    document.head.appendChild(script);
  };

  contactForm.addEventListener('focus', loadEmailJS, { once: true, capture: true });

  contactForm.addEventListener("submit", function (e) {
    e.preventDefault();

    if (this.website.value !== "") {
      console.warn("⚠️ Spam detected: honeypot filled.");
      return;
    }

    if (!emailJSLoaded) {
      alert("Kérlek várj egy pillanatot...");
      loadEmailJS();
      setTimeout(() => contactForm.requestSubmit(), 1000);
      return;
    }

    const fullName = this.lastname.value + " " + this.firstname.value;
    const submitBtn = this.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    
    submitBtn.innerHTML = '<span class="loading"></span> Küldés...';
    submitBtn.disabled = true;

    emailjs.send("service_wlz0mh8", "template_htc2v29", {
      name: fullName,
      email: this.email.value,
      phone: this.phone.value || "Nincs megadva",
      message: this.message.value
    })
    .then(() => {
      alert("Köszönöm! Az üzenet sikeresen elküldve.");
      this.reset();
    })
    .catch((err) => {
      alert("Hiba történt az üzenet küldésekor. Kérlek próbáld újra!");
      console.error("❌ EmailJS error:", err);
    })
    .finally(() => {
      submitBtn.textContent = originalText;
      submitBtn.disabled = false;
    });
  });
}

/* ---------------------------------------------------
   HEADER SCROLL SHRINK
--------------------------------------------------- */
function initHeaderScroll() {
  const header = document.querySelector('.header');
  if (!header) return;

  const toggle = rafThrottle(() => {
    header.classList.toggle('scrolled', window.scrollY > 60);
  });

  window.addEventListener('scroll', toggle, { passive: true });
}

/* ---------------------------------------------------
   HERO KEN BURNS
--------------------------------------------------- */
function initHeroKenBurns() {
  const hero = document.querySelector('.hero');
  if (!hero || !hero.style.backgroundImage) return;

  const heroBg = document.createElement('div');
  heroBg.className = 'hero-bg';
  heroBg.style.backgroundImage = hero.style.backgroundImage;
  hero.style.backgroundImage = 'none';
  hero.insertBefore(heroBg, hero.firstChild);
}

/* ---------------------------------------------------
   SCROLL REVEAL
--------------------------------------------------- */
function initScrollReveal() {
  if (!('IntersectionObserver' in window)) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.05, rootMargin: '0px' });

  requestAnimationFrame(() => {
    // Service cards: felváltva bal/jobb oldalról úsznak be, egyenként
    const serviceCards = document.querySelectorAll('#services .grid-3 > *');
    const serviceCardSet = new Set(serviceCards);

    serviceCards.forEach((el, i) => {
      const rect = el.getBoundingClientRect();
      if (rect.top >= window.innerHeight * 0.9) {
        el.classList.add(i % 2 === 0 ? 'reveal-left' : 'reveal-right');
        el.style.transitionDelay = `${i * 0.18}s`;
        observer.observe(el);
      }
    });

    // Egyéb grid-ek: stagger felfelé
    document.querySelectorAll('.grid-3, .grid-2').forEach(grid => {
      if (!grid.closest('#services')) grid.classList.add('reveal-stagger');
    });

    // Általános elemek
    const selectors = [
      '.services h2',
      '.contact h2',
      '.contact-form',
      '.affirmation p',
      '.affirmation a',
      '.about-content',
      '.service-detail',
      '.blog-header h1',
      '.grid-3 > *',
      '.grid-2 > *',
    ];

    selectors.forEach(selector => {
      document.querySelectorAll(selector).forEach(el => {
        if (serviceCardSet.has(el)) return;
        const rect = el.getBoundingClientRect();
        if (rect.top >= window.innerHeight * 0.9) {
          el.classList.add('reveal');
          observer.observe(el);
        }
      });
    });

    // Biztonsági fallback: ha valami nem animálódna be 3s után, kényszermegjelenítés
    setTimeout(() => {
      document.querySelectorAll('.reveal-left:not(.visible), .reveal-right:not(.visible), .reveal:not(.visible)').forEach(el => {
        el.classList.add('visible');
      });
    }, 3000);
  });
}

/* ---------------------------------------------------
   SERVICES BOOK
--------------------------------------------------- */
const SERVICES = [
  { titleKey: 'service_psych_title',     descKey: 'service_psych_desc',     img: 'images/service-psychological.jpg', url: 'service/psychological.html' },
  { titleKey: 'service_individual_title',descKey: 'service_individual_desc', img: 'images/service-individual.jpg',   url: 'service/individual.html' },
  { titleKey: 'service_couples_title',   descKey: 'service_couples_desc',   img: 'images/service-couples.jpg',       url: 'service/couples.html' },
  { titleKey: 'service_online_title',    descKey: 'service_online_desc',    img: 'images/service-online.jpg',        url: 'service/online-therapy.html' },
  { titleKey: 'service_group_title',     descKey: 'service_group_desc',     img: 'images/service-group.jpg',         url: 'service/group-therapy.html' },
  { titleKey: 'service_sindelar_title',  descKey: 'service_sindelar_desc',  img: 'images/service-sindelar.jpg',      url: 'service/sindelar-therapy.html' },
];

function initServicesBook() {
  const bookLeft     = document.getElementById('bookLeft');
  const bookRightBg  = document.getElementById('bookRightBg');
  const bookFlip     = document.getElementById('bookFlip');
  const flipFront    = document.getElementById('bookFlipFront');
  const flipBack     = document.getElementById('bookFlipBack');
  const prevBtn      = document.querySelector('.book-prev');
  const nextBtn      = document.querySelector('.book-next');
  const dotsEl       = document.getElementById('bookDots');
  if (!bookLeft) return;

  const SPREADS = Math.ceil(SERVICES.length / 2);
  let current = 0;
  let busy = false;

  for (let i = 0; i < SPREADS; i++) {
    const dot = document.createElement('button');
    dot.className = i === 0 ? 'book-dot active' : 'book-dot';
    dot.setAttribute('aria-label', `${i + 1}. oldalpár`);
    dot.addEventListener('click', () => { if (i !== current) i > current ? flipNext() : flipPrev(); });
    dotsEl.appendChild(dot);
  }

  function fill(el, idx) {
    const bp = getBasePath();
    const s = SERVICES[idx];
    if (!s) { el.innerHTML = ''; return; }
    el.innerHTML = `
      <div class="book-page-inner">
        <img src="${bp}${s.img}" alt="" loading="lazy">
        <h3 data-key="${s.titleKey}"></h3>
        <p data-key="${s.descKey}"></p>
        <a href="${bp}${s.url}" class="btn btn-secondary" data-key="service_more">Bővebben</a>
      </div>`;
    if (cachedTranslations) updateDOM(cachedTranslations);
  }

  function syncUI(spread) {
    dotsEl.querySelectorAll('.book-dot').forEach((d, i) => d.classList.toggle('active', i === spread));
    prevBtn?.classList.toggle('hidden', spread === 0);
    nextBtn?.classList.toggle('hidden', spread === SPREADS - 1);
  }

  function isMobile() { return window.innerWidth <= 700; }

  function animate(dir, nextSpread) {
    const isNext = dir === 1;

    if (isNext) {
      fill(flipFront, current * 2 + 1);
      fill(flipBack,  nextSpread * 2);
      fill(bookRightBg, nextSpread * 2 + 1);
      bookFlip.style.cssText = 'display:block; left:50%; transform-origin:left center; transition:none; transform:rotateY(0deg);';
    } else {
      fill(flipFront, current * 2);
      fill(flipBack,  nextSpread * 2 + 1);
      fill(bookRightBg, nextSpread * 2 + 1);
      bookFlip.style.cssText = 'display:block; left:0; transform-origin:right center; transition:none; transform:rotateY(0deg);';
    }

    requestAnimationFrame(() => requestAnimationFrame(() => {
      bookFlip.style.transition = 'transform 0.7s cubic-bezier(0.645,0.045,0.355,1)';
      bookFlip.style.transform  = isNext ? 'rotateY(-180deg)' : 'rotateY(180deg)';
    }));

    setTimeout(() => {
      current = nextSpread;
      fill(bookLeft, current * 2);
      bookFlip.style.cssText = 'display:none;';
      syncUI(current);
      busy = false;
    }, 720);
  }

  function flipNext() {
    if (busy || current >= SPREADS - 1) return;
    busy = true;
    const next = current + 1;
    if (isMobile()) { current = next; fill(bookLeft, current * 2); syncUI(current); busy = false; return; }
    animate(1, next);
  }

  function flipPrev() {
    if (busy || current <= 0) return;
    busy = true;
    const prev = current - 1;
    if (isMobile()) { current = prev; fill(bookLeft, current * 2); fill(bookRightBg, current * 2 + 1); syncUI(current); busy = false; return; }
    animate(-1, prev);
  }

  prevBtn?.addEventListener('click', flipPrev);
  nextBtn?.addEventListener('click', flipNext);

  fill(bookLeft,    0);
  fill(bookRightBg, 1);
  syncUI(0);
}

/* ---------------------------------------------------
   SERVICES CARD STACK (mobil)
--------------------------------------------------- */
function initServicesCardStack() {
  const wrapper = document.getElementById('serviceCardStack');
  if (!wrapper) return;

  const bp = getBasePath();
  const N = SERVICES.length;
  if (N === 0) return;
  const STACK = Math.min(3, N);

  let topIdx = 0;
  let animating = false;
  let abortCtrl = null;

  // Fixed stack styles by position (tx = horizontal offset so corners poke out)
  const ST = [
    { z: 10, tx:   0, ty:  0, sc: 1,    rot:  0, op: 1   },
    { z: 9,  tx: -12, ty:  8, sc: 0.96, rot: -6, op: 0.9 },
    { z: 8,  tx:  12, ty: 14, sc: 0.92, rot:  6, op: 0.8 },
  ];

  // Create STACK card elements + detail overlay + swipe hint
  const cardEls = [];
  for (let i = 0; i < STACK; i++) {
    const el = document.createElement('div');
    el.className = 'svc-card';
    wrapper.appendChild(el);
    cardEls.push(el);
  }

  const hint = document.createElement('p');
  hint.className = 'svc-swipe-hint';
  hint.dataset.key = 'svc_swipe_hint';
  hint.textContent = '← húzd el →';
  wrapper.parentNode.insertBefore(hint, wrapper.nextSibling);

  // stackOrder[stackPos] = index into cardEls
  let stackOrder = Array.from({ length: STACK }, (_, i) => i);

  function svcOf(sp) { return (topIdx + sp) % N; }

  function fillCard(elIdx, svcIdx) {
    const s = SERVICES[svcIdx];
    cardEls[elIdx].dataset.svcIdx = String(svcIdx);
    cardEls[elIdx].innerHTML = `
      <img src="${bp}${s.img}" alt="" loading="lazy">
      <div class="svc-card-body">
        <h3 data-key="${s.titleKey}"></h3>
        <p data-key="${s.descKey}"></p>
        <a href="${bp}${s.url}" class="btn btn-secondary svc-card-link" data-key="service_more">Bővebben</a>
      </div>`;
  }

  function placeCard(elIdx, sp, tx, rot, withTransition) {
    const el = cardEls[elIdx];
    const s = ST[sp] || ST[STACK - 1];
    el.style.transition = withTransition
      ? 'transform 0.35s cubic-bezier(0.4,0,0.2,1), opacity 0.35s ease'
      : 'none';
    el.style.zIndex = String(s.z);
    el.style.opacity = String(s.op);
    el.style.transform = sp === 0
      ? `translateX(${tx}px) rotate(${rot}deg)`
      : `translateX(${s.tx}px) translateY(${s.ty}px) scale(${s.sc}) rotate(${s.rot}deg)`;
  }

  function render() {
    for (let sp = 0; sp < STACK; sp++) {
      fillCard(stackOrder[sp], svcOf(sp));
      placeCard(stackOrder[sp], sp, 0, 0, false);
    }
    if (cachedTranslations) updateDOM(cachedTranslations);
    bindTopCard();
  }

  function cycleForward(dir) {
    if (animating) return;
    animating = true;

    const topElIdx = stackOrder[0];
    const flyX = dir * (window.innerWidth * 0.75);

    // Fly top card off
    cardEls[topElIdx].style.transition = 'transform 0.42s ease-in, opacity 0.3s ease';
    cardEls[topElIdx].style.transform = `translateX(${flyX}px) rotate(${dir * 18}deg)`;
    cardEls[topElIdx].style.opacity = '0';
    cardEls[topElIdx].style.zIndex = '11';

    // Shift remaining cards toward top
    for (let sp = 1; sp < STACK; sp++) {
      placeCard(stackOrder[sp], sp - 1, 0, 0, true);
    }

    setTimeout(() => {
      topIdx = (topIdx + 1) % N;
      const oldTop = stackOrder[0];
      stackOrder = [...stackOrder.slice(1), oldTop];

      const newBottomElIdx = stackOrder[STACK - 1];
      fillCard(newBottomElIdx, svcOf(STACK - 1));

      // Place new bottom card instantly (currently invisible)
      const bs = ST[STACK - 1];
      cardEls[newBottomElIdx].style.transition = 'none';
      cardEls[newBottomElIdx].style.zIndex = String(bs.z);
      cardEls[newBottomElIdx].style.transform = `translateX(${bs.tx}px) translateY(${bs.ty}px) scale(${bs.sc}) rotate(${bs.rot}deg)`;
      cardEls[newBottomElIdx].style.opacity = '0';

      // Fade it in
      requestAnimationFrame(() => requestAnimationFrame(() => {
        cardEls[newBottomElIdx].style.transition = 'opacity 0.35s ease';
        cardEls[newBottomElIdx].style.opacity = String(bs.op);
      }));

      if (cachedTranslations) updateDOM(cachedTranslations);
      bindTopCard();
      animating = false;
    }, 460);
  }

  function bindTopCard() {
    // Abort previous listeners so old top card is no longer interactive
    if (abortCtrl) abortCtrl.abort();
    abortCtrl = new AbortController();
    const { signal } = abortCtrl;

    const el = cardEls[stackOrder[0]];
    let startX = 0, startY = 0, dx = 0, swiping = false;

    el.addEventListener('touchstart', (e) => {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
      dx = 0; swiping = false;
    }, { passive: true, signal });

    el.addEventListener('touchmove', (e) => {
      dx = e.touches[0].clientX - startX;
      const dy = e.touches[0].clientY - startY;
      if (!swiping && Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 12) {
        swiping = true;
      }
      if (swiping) {
        e.preventDefault();
        el.style.transition = 'none';
        el.style.transform = `translateX(${dx}px) rotate(${dx * 0.07}deg)`;
      }
    }, { passive: false, signal });

    el.addEventListener('touchend', (e) => {
      if (!swiping) return; // let click handle the tap
      e.preventDefault();  // prevent ghost click after swipe
      if (Math.abs(dx) > 80) {
        cycleForward(dx < 0 ? -1 : 1);
      } else {
        el.style.transition = 'transform 0.3s cubic-bezier(0.4,0,0.2,1)';
        el.style.transform = '';
      }
    }, { signal });
  }

  render();
}

/* ---------------------------------------------------
   VIDEO CAROUSEL
--------------------------------------------------- */
function initVideoCarousel() {
  const track = document.querySelector('.carousel-track');
  if (!track) return;

  const items = Array.from(track.querySelectorAll('.video-item'));
  if (!items.length) return;

  const prevBtn = document.querySelector('.carousel-prev');
  const nextBtn = document.querySelector('.carousel-next');
  const VISIBLE = 3;
  let current = 0;

  function visibleCount() {
    return window.innerWidth <= 600 ? 1 : VISIBLE;
  }

  function setItemWidths() {
    const visible = Math.min(items.length, visibleCount());
    const gapPx = visible > 1
      ? parseFloat(getComputedStyle(track).gap) || 24
      : 0;
    const w = `calc((100% - ${(visible - 1)} * ${gapPx}px) / ${visible})`;
    items.forEach(item => { item.style.width = w; });
  }

  function updateButtons() {
    const visible = Math.min(items.length, visibleCount());
    const canPrev = current > 0;
    const canNext = current < items.length - visible;
    prevBtn?.classList.toggle('hidden', !canPrev);
    nextBtn?.classList.toggle('hidden', !canNext);
  }

  function goTo(index) {
    const visible = Math.min(items.length, visibleCount());
    current = Math.max(0, Math.min(index, items.length - visible));
    const offset = current > 0 ? items[current].offsetLeft - items[0].offsetLeft : 0;
    track.style.transform = `translateX(-${offset}px)`;
    updateButtons();
  }

  prevBtn?.addEventListener('click', () => goTo(current - 1));
  nextBtn?.addEventListener('click', () => goTo(current + 1));

  setItemWidths();
  updateButtons();

  const debouncedResize = debounce(() => {
    setItemWidths();
    goTo(Math.min(current, items.length - Math.min(items.length, visibleCount())));
  }, 150);
  window.addEventListener('resize', debouncedResize, { passive: true });
}

/* ---------------------------------------------------
   PAGE INITIALIZATION
--------------------------------------------------- */
document.addEventListener('DOMContentLoaded', function() {
  console.log("🚀 Page loaded, base path:", getBasePath());

  initDarkMode();
  initScrollToTop();
  initLazyLoading();
  loadStaticText();
  initHeaderScroll();
  initHeroKenBurns();
  initScrollReveal();
  initServicesBook();
  initServicesCardStack();
  initVideoCarousel();

  if (document.getElementById("blogContainer")) {
    loadBlogList();
  }

  if (document.getElementById("postTitle")) {
    loadBlogPost();
  }
});
