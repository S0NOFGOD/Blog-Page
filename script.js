/* script.js
   Features:
   - Dynamic rendering of posts from a JS array
   - Search (top + sidebar)
   - Categories filtering
   - Pagination
   - Read more expansion per post
   - Comments stored in localStorage per post id
   - Share using navigator.share with fallback copy link
*/

(() => {
  // ---- CONFIG ----
  const POSTS_PER_PAGE = 4;

  // Sample posts (replace with your own content or load from server)
  const posts = [
    {
      id: 'p1',
      title: 'Building a Mobile-First Blog — Quick Guide',
      category: 'Development',
      date: '2025-12-01',
      image: 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?q=80&w=1200&auto=format&fit=crop',
      excerpt: 'A short step-by-step guide to creating a mobile-first blog with modern UI patterns.',
      content: '<p>This article walks through the essentials of building a responsive blog that looks great on phones first. Focus on layout, typography and performance.</p><p>Use CSS Grid / Flexbox and keep images optimized. Add progressive enhancement for search and comments.</p>',
      author: {
        name: 'Jane Doe',
        avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=600&auto=format&fit=crop',
        bio: 'Web dev and technical writer.'
      }
    },
    {
      id: 'p2',
      title: 'Design Tips: Modern Typography for the Web',
      category: 'Design',
      date: '2025-11-25',
      image: 'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?q=80&w=1200&auto=format&fit=crop',
      excerpt: 'Typography makes or breaks your design. Learn the rules for readable, elegant text on the web.',
      content: '<p>Pick a system font stack or reliable webfont, set readable sizes, and respect line length (50–75 characters).</p>',
      author: {
        name: 'Max Finn',
        avatar: 'https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?q=80&w=600&auto=format&fit=crop',
        bio: 'Designer & typographer.'
      }
    },
    {
      id: 'p3',
      title: 'How to Add Social Share Buttons (that work)',
      category: 'Marketing',
      date: '2025-10-10',
      image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=1200&auto=format&fit=crop',
      excerpt: 'A practical look at building share buttons with web APIs and fallbacks.',
      content: '<p>Use navigator.share on mobile for best UX, and fall back to copy-to-clipboard or service links for desktop.</p>',
      author: {
        name: 'Alex Chen',
        avatar: 'https://images.unsplash.com/photo-1545996124-6bb8a0c1b4b0?q=80&w=600&auto=format&fit=crop',
        bio: 'Growth hacker.'
      }
    },
    {
      id: 'p4',
      title: 'Pagination: Keep Users Engaged Without Overwhelm',
      category: 'UX',
      date: '2025-09-14',
      image: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?q=80&w=1200&auto=format&fit=crop',
      excerpt: 'Pagination patterns: infinite scroll vs numbered pages vs load more.',
      content: '<p>Offer predictable navigation for users and keep performance in mind. Numbered pages are SEO-friendly.</p>',
      author: {
        name: 'Sam Green',
        avatar: 'https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?q=80&w=600&auto=format&fit=crop',
        bio: 'Product designer.'
      }
    },
    {
      id: 'p5',
      title: 'Author Info: Building Trust through Transparency',
      category: 'Writing',
      date: '2025-08-02',
      image: 'https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?q=80&w=1200&auto=format&fit=crop',
      excerpt: 'Why a good author bio matters, and what to include.',
      content: '<p>Show a photo, short bio, and links. If you have credentials, highlight them — but keep it concise.</p>',
      author: {
        name: 'Jane Doe',
        avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=600&auto=format&fit=crop',
        bio: 'Web dev and technical writer.'
      }
    },
    {
      id: 'p6',
      title: 'Using Categories to Improve Discoverability',
      category: 'Development',
      date: '2025-07-12',
      image: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=1200&auto=format&fit=crop',
      excerpt: 'Organize posts into categories and tags so readers find related content.',
      content: '<p>Categories help users and search engines. Use a few broad categories and add tags for specifics.</p>',
      author: {
        name: 'Max Finn',
        avatar: 'https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?q=80&w=600&auto=format&fit=crop',
        bio: 'Designer & typographer.'
      }
    }
  ];

  // ---- STATE ----
  let state = {
    page: 1,
    perPage: POSTS_PER_PAGE,
    query: '',
    category: null,
    filtered: [...posts]
  };

  // ---- DOM ----
  const postsListEl = document.getElementById('postsList');
  const postTemplate = document.getElementById('postTemplate');
  const categoriesListEl = document.getElementById('categoriesList');
  const searchInput = document.getElementById('searchInput');
  const searchInputTop = document.getElementById('searchInputTop');
  const paginationEl = document.getElementById('pagination');
  const menuBtn = document.getElementById('menuBtn');
  const mainNav = document.getElementById('mainNav');

  // set footer year
  document.getElementById('year').textContent = new Date().getFullYear();

  // ---- HELPERS ----
  function uniq(arr){ return [...new Set(arr)]; }

  function formatDate(d){
    try {
      const dt = new Date(d);
      return dt.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
    } catch(e){ return d; }
  }

  function saveComments(postId, comments){
    localStorage.setItem('comments_'+postId, JSON.stringify(comments));
  }

  function loadComments(postId){
    const raw = localStorage.getItem('comments_'+postId);
    return raw ? JSON.parse(raw) : [];
  }

  // ---- RENDERING ----
  function renderCategories(){
    const cats = uniq(posts.map(p => p.category));
    categoriesListEl.innerHTML = '';
    const allBtn = document.createElement('a');
    allBtn.href = "#";
    allBtn.textContent = 'All';
    allBtn.addEventListener('click', (e) => { e.preventDefault(); setCategory(null); });
    const liAll = document.createElement('li');
    liAll.appendChild(allBtn);
    categoriesListEl.appendChild(liAll);

    cats.forEach(cat => {
      const a = document.createElement('a');
      a.href = '#';
      a.textContent = cat;
      a.addEventListener('click', (e) => { e.preventDefault(); setCategory(cat); });
      const li = document.createElement('li');
      li.appendChild(a);
      categoriesListEl.appendChild(li);
    });
  }

  function applyFilters(){
    const q = state.query.trim().toLowerCase();
    state.filtered = posts.filter(p => {
      const matchesQuery = q === '' || (p.title + ' ' + p.excerpt + ' ' + (p.content || '')).toLowerCase().includes(q);
      const matchesCat = !state.category || p.category === state.category;
      return matchesQuery && matchesCat;
    });
    state.page = 1;
    render();
  }

  function render(){
    // clear posts
    postsListEl.innerHTML = '';
    // pagination
    const start = (state.page - 1) * state.perPage;
    const end = start + state.perPage;
    const pagePosts = state.filtered.slice(start, end);

    if(pagePosts.length === 0){
      const empty = document.createElement('div');
      empty.className = 'card';
      empty.innerHTML = '<p class="small">No posts found. Try changing your search or category.</p>';
      postsListEl.appendChild(empty);
    }

    pagePosts.forEach(p => {
      const clone = postTemplate.content.cloneNode(true);
      const article = clone.querySelector('.post');
      const img = clone.querySelector('.post-image');
      img.src = p.image;
      img.alt = p.title;

      clone.querySelector('.post-category').textContent = p.category;
      clone.querySelector('.post-date').textContent = formatDate(p.date);
      clone.querySelector('.post-title').textContent = p.title;
      clone.querySelector('.post-excerpt').textContent = p.excerpt;

      // read more expansion
      const readBtn = clone.querySelector('.read-more');
      const fullEl = clone.querySelector('.post-full');
      const fullContent = clone.querySelector('.post-full-content');
      fullContent.innerHTML = p.content;

      // author info fill
      clone.querySelector('.author-avatar').src = p.author.avatar;
      clone.querySelector('.author-name').textContent = p.author.name;
      clone.querySelector('.author-bio').textContent = p.author.bio;

      // comments area
      const commentsListEl = clone.querySelector('.comments-list');
      const commentForm = clone.querySelector('.comment-form');

      function renderComments(){
        commentsListEl.innerHTML = '';
        const comments = loadComments(p.id);
        if(comments.length === 0){
          commentsListEl.innerHTML = '<li class="small">No comments yet — be the first!</li>';
          return;
        }
        comments.forEach(c => {
          const li = document.createElement('li');
          li.innerHTML = <strong>${escapeHtml(c.name)}</strong> <span class="small" style="color:var(--muted)"> — ${formatDate(c.date)}</span><div>${escapeHtml(c.text)}</div>;
          commentsListEl.appendChild(li);
        });
      }

      // form handling
      commentForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const formData = new FormData(commentForm);
        const name = formData.get('name').trim();
        const text = formData.get('comment').trim();
        if(!name || !text) return;
        const comments = loadComments(p.id);
        comments.unshift({ name, text, date: new Date().toISOString() });
        saveComments(p.id, comments);
        commentForm.reset();
        renderComments();
      });

      // clear comments
      const clearBtn = clone.querySelector('.clear-comments');
      clearBtn.addEventListener('click', () => {
        if(confirm('Clear all comments for this post?')) {
          saveComments(p.id, []);
          renderComments();
        }
      });

      // READ MORE toggle
      readBtn.addEventListener('click', () => {
        const expanded = !fullEl.hidden;
        // toggle
        fullEl.hidden = expanded;
        readBtn.textContent = expanded ? 'Read more' : 'Collapse';
      });

      // SHARE button
      const shareBtn = clone.querySelector('.share-btn');
      shareBtn.addEventListener('click', async () => {
        const url = location.href.split('#')[0] + '#post=' + p.id;
        const shareData = { title: p.title, text: p.excerpt, url };
        if (navigator.share) {
          try { await navigator.share(shareData); } catch(e){ /* user canceled */ }
        } else {
          // fallback: copy link
          try {
            await navigator.clipboard.writeText(url);
            alert('Link copied to clipboard.');
          } catch(e){
            prompt('Copy this link:', url);
          }
        }
      });

      // load comments for this post
      renderComments();

      postsListEl.appendChild(clone);
    });

    renderPagination();
  }

  function renderPagination(){
    paginationEl.innerHTML = '';
    const total = state.filtered.length;
    const pages = Math.max(1, Math.ceil(total / state.perPage));
    // Prev
    const prev = document.createElement('button');
    prev.textContent = '« Prev';
    prev.disabled = state.page <= 1;
    prev.addEventListener('click', () => { if(state.page>1){ state.page--; render(); }});
    paginationEl.appendChild(prev);

    // page numbers (compact)
    for(let i=1;i<=pages;i++){
      // limit page buttons to small range if many pages
      if (pages > 7 && Math.abs(i - state.page) > 3) {
        if (i === 1 || i === pages) {
          const btn = document.createElement('button');
          btn.textContent = i;
          if (i === state.page) btn.classList.add('active');
          btn.addEventListener('click', () => { state.page = i; render(); });
          paginationEl.appendChild(btn);
        } else if (i === 2 || i === pages - 1) {
          const dots = document.createElement('span');
          dots.textContent = '...';
          dots.style.padding = '8px 12px';
          paginationEl.appendChild(dots);
        }
        continue;
      }
      const btn = document.createElement('button');
      btn.textContent = i;
      if (i === state.page) btn.classList.add('active');
      btn.addEventListener('click', () => { state.page = i; render(); });
      paginationEl.appendChild(btn);
    }

    // Next
    const next = document.createElement('button');
    next.textContent = 'Next »';
    next.disabled = state.page >= Math.ceil(total/state.perPage);
    next.addEventListener('click', () => { state.page++; render(); });
    paginationEl.appendChild(next);
  }

  // ---- UI EVENTS ----
  searchInput.addEventListener('input', (e) => {
    state.query = e.target.value;
    applyFilters();
  });
  searchInputTop.addEventListener('input', (e) => {
    searchInput.value = e.target.value;
    state.query = e.target.value;
    applyFilters();
  });

  function setCategory(cat){
    state.category = cat;
    // visually mark selected category
    Array.from(categoriesListEl.querySelectorAll('a')).forEach(a => {
      a.style.fontWeight = (a.textContent === (cat || 'All')) ? '700' : '400';
    });
    applyFilters();
  }

  // hamburger toggle
  menuBtn.addEventListener('click', () => {
    const expanded = menuBtn.getAttribute('aria-expanded') === 'true';
    menuBtn.setAttribute('aria-expanded', String(!expanded));
    mainNav.style.display = expanded ? 'none' : 'block';
  });

  // keyboard accessible: close nav on resize
  window.addEventListener('resize', () => {
    if(window.innerWidth >= 768){
      mainNav.style.display = 'block';
      menuBtn.setAttribute('aria-expanded', 'false');
    } else {
      mainNav.style.display = 'none';
    }
  });

  // remove any HTML from user text when rendering comments
  function escapeHtml(unsafe) {
    return (unsafe || '').replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  // handle deep link to open a post (post id in hash)
  function openFromHash(){
    const hash = location.hash;
    if(hash.startsWith('#post=')){
      const pid = hash.split('=')[1];
      // find which page contains it
      const index = state.filtered.findIndex(p => p.id === pid);
      if(index >= 0){
        state.page = Math.floor(index / state.perPage) + 1;
        render();
        // expand that post after rendering (wait a frame)
        requestAnimationFrame(() => {
          // find the read-more for the nth displayed element
          const nodes = postsListEl.querySelectorAll('.post');
          for(let node of nodes){
            const title = node.querySelector('.post-title')?.textContent || '';
            if(title === posts.find(p => p.id === pid).title){
              const read = node.querySelector('.read-more');
              if(read) read.click();
            }
          }
        });
      }
    }
  }

  window.addEventListener('hashchange', openFromHash);

  // ---- INIT ----
  function init(){
    renderCategories();
    applyFilters();
    // responsive nav init
    if(window.innerWidth >= 768) mainNav.style.display = 'block';
    else mainNav.style.display = 'none';

    // open from hash if present
    openFromHash();
  }

  init();
})();