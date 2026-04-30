/**
 * OPAL - Adventure Gear Store
 * Vanilla JS SPA Implementation
 */

// --- Initial Data (Simulated DB) ---
const PRODUCT_CATEGORIES = ['Footwear', 'Bags', 'Shelter', 'Apparel', 'Cooking', 'Sleeping'];

const initialProducts = [
  {
    id: 'p7',
    name: 'Trailblazer Pro Series Shoes',
    price: 145.00,
    category: 'Footwear',
    description: 'Customizable trail running shoes. Built for speed and comfort on the toughest terrain. Choose your style and fit. Real-time updates as you customize!',
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    customizable: true,
    variants: [
      { id: 'red', color: '#EF4444', name: 'Volcanic Red', image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' },
      { id: 'blue', color: '#3B82F6', name: 'Ocean Blue', image: 'https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' },
      { id: 'yellow', color: '#EAB308', name: 'Solar Yellow', image: 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' },
      { id: 'black', color: '#1C1917', name: 'Stealth Black', image: 'https://images.unsplash.com/photo-1539185441755-769473a23570?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' }
    ],
    sizes: ['US 7', 'US 8', 'US 9', 'US 10', 'US 11', 'US 12']
  },
  {
    id: 'p1',
    name: 'Summit Series Alpha Backpack',
    price: 249.99,
    category: 'Bags',
    description: 'Ultra-durable, weather-resistant 45L backpack for extended backcountry missions. Features adjustable suspension, multiple attachment points, and hydration sleeve.',
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'p2',
    name: 'Zenith 2-Person Ultralight Tent',
    price: 399.00,
    category: 'Shelter',
    description: 'Weighing just under 2.5 lbs, this freestanding tent offers maximum space-to-weight ratio. Double-wall construction prevents condensation.',
    image: 'https://images.unsplash.com/photo-1504280390227-31365cc1a89c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'p3',
    name: 'Merino Wool Base Layer Top',
    price: 85.00,
    category: 'Apparel',
    description: 'Temperature-regulating, odor-resistant 100% merino wool. The perfect foundation for any cold-weather layering system.',
    image: 'https://images.unsplash.com/photo-1618354691438-25bc04584c23?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'p4',
    name: 'Titanium Camp Stove',
    price: 54.50,
    category: 'Cooking',
    description: 'Micro-sized, high-output stove that boils a liter of water in under 3 minutes. Folds down to fit inside your mug.',
    image: 'https://images.unsplash.com/photo-1606228303038-f80e7d0bbd60?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'p5',
    name: 'Alpine Ascend Hiking Boots',
    price: 189.95,
    category: 'Footwear',
    description: 'Waterproof, breathable Gore-Tex lined boots with Vibram soles for unmatched traction on wet and rocky terrain.',
    image: 'https://images.unsplash.com/photo-1520639888713-7851133b1ed0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'p6',
    name: 'Down Sleeping Bag (15°F)',
    price: 289.00,
    category: 'Sleeping',
    description: '800-fill water-resistant down provides exceptional warmth without the weight. Mummy shape maximizes thermal efficiency.',
    image: 'https://images.unsplash.com/photo-1559810852-25927c3a05f1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
  }
];

// --- State Management ---
const state = {
  products: [],
  cart: [],
  user: null, // { username: string, isAdmin: boolean }
};

// --- Initialization ---
function init() {
  // Initialize DB
  if (!localStorage.getItem('opal_products_v3')) {
    localStorage.setItem('opal_products_v3', JSON.stringify(initialProducts));
  }
  state.products = JSON.parse(localStorage.getItem('opal_products_v3'));

  // Initialize Cart
  if (localStorage.getItem('opal_cart')) {
    state.cart = JSON.parse(localStorage.getItem('opal_cart'));
  }

  // Initialize User
  if (localStorage.getItem('opal_user')) {
    state.user = JSON.parse(localStorage.getItem('opal_user'));
  }

  setupEventListeners();
  updateAuthUI();
  updateCartBadge();
  handleRoute();
  
  setTimeout(() => {
    if(window.lucide) window.lucide.createIcons();
  }, 100);
}

// --- Event Listeners ---
function setupEventListeners() {
  window.addEventListener('hashchange', handleRoute);
  
  // Mobile Menu
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const mobileMenu = document.getElementById('mobile-menu');
  
  mobileMenuBtn.addEventListener('click', () => {
    mobileMenu.classList.toggle('open');
  });

  document.querySelectorAll('.mobile-link').forEach(link => {
    link.addEventListener('click', () => {
      mobileMenu.classList.remove('open');
    });
  });

  // Cart Drawer
  document.getElementById('nav-cart-link').addEventListener('click', (e) => {
    e.preventDefault(); 
    toggleCartDrawer(true);
  });
  
  document.getElementById('mobile-cart-link').addEventListener('click', (e) => {
    e.preventDefault();
    mobileMenu.classList.remove('open');
    toggleCartDrawer(true);
  });

  document.getElementById('drawer-close').addEventListener('click', () => {
    toggleCartDrawer(false);
  });

  document.getElementById('drawer-overlay').addEventListener('click', () => {
    toggleCartDrawer(false);
  });
}

// --- Routing ---
const routes = {
  '/': renderLanding,
  '/shop': renderShop,
  '/product/:id': renderProductDetail,
  '/cart': renderCartPage,
  '/login': renderLogin,
  '/admin': renderAdmin,
};

function handleRoute() {
  const path = window.location.hash.slice(1) || '/';
  const root = document.getElementById('app-root');
  
  // Toggle transparent navbar on landing page
  const navbar = document.getElementById('navbar');
  if (path === '/') {
    navbar.classList.add('nav-transparent');
  } else {
    navbar.classList.remove('nav-transparent');
  }

  document.getElementById('mobile-menu').classList.remove('open');
  toggleCartDrawer(false);

  let matchedParams = {};
  let matchedRouteFunc = null;

  for (const route in routes) {
    if (route.includes(':')) {
      const routeParts = route.split('/');
      const pathParts = path.split('/');
      
      if (routeParts.length === pathParts.length && routeParts[1] === pathParts[1]) {
        matchedParams.id = pathParts[2];
        matchedRouteFunc = routes[route];
        break;
      }
    } else if (route === path) {
      matchedRouteFunc = routes[route];
      break;
    }
  }

  if (matchedRouteFunc) {
    root.innerHTML = '<div class="page-loader"><div class="loader-ring"></div></div>';
    setTimeout(() => {
      matchedRouteFunc(root, matchedParams);
      if(window.lucide) window.lucide.createIcons();
    }, 200);
  } else {
    root.innerHTML = '<div class="container" style="padding: 100px 0; text-align: center;"><h2>Page Not Found</h2><a href="#/" class="btn btn-primary" style="margin-top: 20px;">Return to Shop</a></div>';
  }
}

// --- Views ---

// 0. Landing Page
function renderLanding(root) {
  root.innerHTML = `
    <!-- HERO -->
    <section class="landing-hero">
      <div class="landing-hero-bg">
        <img src="https://images.unsplash.com/photo-1501555088652-021faa106b9b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80" alt="Hikers in misty forest">
        <div class="landing-hero-overlay"></div>
      </div>

      <nav class="landing-pills">
        <a href="#/shop" class="pill">New In</a>
        <a href="#/shop" class="pill">Woman</a>
        <a href="#/shop" class="pill">Man</a>
        <a href="#/shop" class="pill">Accessories</a>
        <a href="#/shop" class="pill">Lookbook</a>
      </nav>

      <div class="landing-hero-content">
        <h1 class="landing-headline">chase the feelings</h1>
        <a href="#/shop" class="landing-cta">Shop the collection</a>
      </div>

      <div class="landing-hero-bottom">
        <span class="scroll-hint">Scroll to see full collection</span>
        <div class="video-card">
          <img src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80" alt="Mountain video thumbnail">
          <div class="video-card-info">
            <span>Discover<br>full video</span>
            <div class="play-circle"><i data-lucide="play" style="width:20px;height:20px;"></i></div>
          </div>
        </div>
      </div>
    </section>

    <!-- EDITORIAL STRIP -->
    <section class="landing-strip">
      <span class="strip-year">26</span>
      <span class="strip-tagline">Built for Beyond</span>
      <span class="strip-brand">OPAL</span>
    </section>

    <!-- PHOTO COLLAGE -->
    <section class="landing-collage container">
      <div class="collage-grid">
        <div class="collage-item collage-large">
          <img src="https://images.unsplash.com/photo-1551632811-561732d1e306?ixlib=rb-4.0.3&auto=format&fit=crop&w=900&q=80" alt="Hiker on mountain ridge">
          <div class="collage-tag">Alpine Collection</div>
        </div>
        <div class="collage-item">
          <img src="https://images.unsplash.com/photo-1533240332313-0db49b459ad6?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" alt="Waterfall in forest">
        </div>
        <div class="collage-item">
          <img src="https://images.unsplash.com/photo-1527004013197-933c4bb611b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" alt="Mountain lake">
        </div>
        <div class="collage-item collage-wide">
          <img src="https://images.unsplash.com/photo-1486915309615-1eccd3f6e0a7?ixlib=rb-4.0.3&auto=format&fit=crop&w=900&q=80" alt="Hikers in fog">
          <div class="collage-tag">Expedition Gear</div>
        </div>
        <div class="collage-item">
          <img src="https://images.unsplash.com/photo-1483728642387-6c3bdd6c93e5?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" alt="Rocky terrain">
        </div>
      </div>
      <div class="collage-accent"></div>
      <div class="collage-coords">50.03544286908985N<br>36.36396570730049W</div>
    </section>

    <!-- CATEGORIES -->
    <section class="landing-categories">
      <div class="container">
        <h2 class="section-title">Shop by Category</h2>
        <div class="category-row">
          <a href="#/shop" class="category-card">
            <img src="https://images.unsplash.com/photo-1553062407-98eeb64c6a62?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80" alt="Backpacks">
            <span class="category-label">Bags</span>
          </a>
          <a href="#/shop" class="category-card">
            <img src="https://images.unsplash.com/photo-1618354691438-25bc04584c23?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80" alt="Base Layers">
            <span class="category-label">Base Layers</span>
          </a>
          <a href="#/shop" class="category-card">
            <img src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80" alt="Footwear">
            <span class="category-label">Footwear</span>
          </a>
          <a href="#/shop" class="category-card">
            <img src="https://images.unsplash.com/photo-1606228303038-f80e7d0bbd60?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80" alt="Accessories">
            <span class="category-label">Accessories</span>
          </a>
        </div>
      </div>
    </section>

    <!-- TICKER -->
    <section class="landing-ticker">
      <div class="ticker-track">
        <span>Own the Moment</span><span>◈</span>
        <span>Built for Beyond</span><span>◈</span>
        <span>Chase the Feelings</span><span>◈</span>
        <span>Own the Moment</span><span>◈</span>
        <span>Built for Beyond</span><span>◈</span>
        <span>Chase the Feelings</span><span>◈</span>
        <span>Own the Moment</span><span>◈</span>
        <span>Built for Beyond</span><span>◈</span>
      </div>
    </section>

    <!-- FOOTER -->
    <footer class="landing-footer">
      <div class="container">
        <div class="footer-grid">
          <div>
            <div class="footer-logo"><span class="logo-mark">◈</span> OPAL</div>
            <p class="footer-tagline">Premium adventure gear.<br>Designed for the wild.</p>
          </div>
          <div>
            <h4 class="footer-heading">Shop</h4>
            <a href="#/shop" class="footer-link">All Products</a>
            <a href="#/shop" class="footer-link">New Arrivals</a>
            <a href="#/shop" class="footer-link">Best Sellers</a>
          </div>
          <div>
            <h4 class="footer-heading">Company</h4>
            <a href="#/" class="footer-link">About Us</a>
            <a href="#/" class="footer-link">Lookbook</a>
            <a href="#/" class="footer-link">Sustainability</a>
          </div>
          <div>
            <h4 class="footer-heading">Support</h4>
            <a href="#/" class="footer-link">Contact</a>
            <a href="#/" class="footer-link">Shipping</a>
            <a href="#/" class="footer-link">Returns</a>
          </div>
        </div>
        <div class="footer-bottom">
          <span>&copy; 2026 OPAL. All rights reserved.</span>
          <span>YR26</span>
        </div>
      </div>
    </footer>
  `;

  // Scroll-triggered fade-in for collage items
  setTimeout(() => {
    const items = document.querySelectorAll('.collage-item, .category-card');
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('visible');
          observer.unobserve(e.target);
        }
      });
    }, { threshold: 0.15 });
    items.forEach(i => observer.observe(i));
  }, 100);
}

// 1. Shop Page
function renderShop(root) {
  // Build category buttons from products that exist in state
  const categoriesInUse = [...new Set(state.products.map(p => p.category).filter(Boolean))];

  root.innerHTML = `
    <section class="hero-section">
      <div class="container">
        <h1 class="hero-title">Equip Your Adventure</h1>
        <p class="hero-subtitle">Premium gear designed for the unforgiving wild. Tested by professionals, built for everyone.</p>
        <div class="search-bar">
          <i data-lucide="search"></i>
          <input type="text" id="searchInput" class="search-input" placeholder="Search for gear...">
        </div>
      </div>
    </section>

    <!-- Filter Bar -->
    <section class="container">
      <div class="filter-bar" id="filter-bar">
        <div class="filter-group">
          <label class="filter-label">Category</label>
          <div class="filter-pills" id="category-pills">
            <button class="filter-pill active" data-cat="all">All</button>
            ${categoriesInUse.map(c => `<button class="filter-pill" data-cat="${c}">${c}</button>`).join('')}
          </div>
        </div>

        <div class="filter-group">
          <label class="filter-label">Price Range</label>
          <div class="price-range-inputs">
            <input type="number" id="minPrice" class="form-input filter-input" placeholder="Min $" min="0" step="1">
            <span class="price-dash">—</span>
            <input type="number" id="maxPrice" class="form-input filter-input" placeholder="Max $" min="0" step="1">
          </div>
        </div>

        <div class="filter-group">
          <label class="filter-label">Sort By</label>
          <select id="sortSelect" class="form-input filter-select">
            <option value="default">Default</option>
            <option value="price-asc">Price: Low → High</option>
            <option value="price-desc">Price: High → Low</option>
          </select>
        </div>
      </div>
    </section>

    <section class="container" style="margin-top: 40px;">
      <div id="product-grid" class="shop-grid">
        <!-- Products injected here -->
      </div>
    </section>
  `;

  // --- Filter State ---
  let activeCategory = 'all';
  let searchTerm = '';
  let minPrice = null;
  let maxPrice = null;
  let sortMode = 'default';

  const grid = document.getElementById('product-grid');

  // --- Filter Pipeline ---
  function applyFilters() {
    let results = [...state.products];

    // 1. Search filter
    if (searchTerm) {
      results = results.filter(p => p.name.toLowerCase().includes(searchTerm));
    }

    // 2. Category filter
    if (activeCategory !== 'all') {
      results = results.filter(p => p.category === activeCategory);
    }

    // 3. Price filter
    if (minPrice !== null) {
      results = results.filter(p => p.price >= minPrice);
    }
    if (maxPrice !== null) {
      results = results.filter(p => p.price <= maxPrice);
    }

    // 4. Sort
    if (sortMode === 'price-asc') {
      results.sort((a, b) => a.price - b.price);
    } else if (sortMode === 'price-desc') {
      results.sort((a, b) => b.price - a.price);
    }

    renderProductCards(results);
  }

  // --- Render Cards ---
  function renderProductCards(products) {
    if (products.length === 0) {
      grid.innerHTML = '<div class="no-results">No products found matching your filters.</div>';
      return;
    }

    grid.innerHTML = products.map(p => `
      <div class="product-card">
        <a href="#/product/${p.id}" class="product-img-wrapper">
          <img src="${p.image}" alt="${p.name}" class="product-img">
          ${p.customizable ? '<span class="badge-custom">Customizable</span>' : ''}
        </a>
        <div class="product-info">
          ${p.category ? `<span class="product-category">${p.category}</span>` : ''}
          <h3 class="product-title">${p.name}</h3>
          <p class="product-desc">${p.description}</p>
          <div class="product-price">$${p.price.toFixed(2)}</div>
          <div class="product-actions">
            <a href="#/product/${p.id}" class="btn btn-secondary" style="flex: 1; text-align: center;">${p.customizable ? 'Customize' : 'Details'}</a>
            ${!p.customizable ? `
              <button class="btn btn-primary add-to-cart-btn" data-id="${p.id}" style="flex: 1;">
                <i data-lucide="shopping-cart" style="width: 16px; height: 16px;"></i> Add
              </button>
            ` : ''}
          </div>
        </div>
      </div>
    `).join('');

    // Bind add-to-cart buttons
    document.querySelectorAll('.add-to-cart-btn').forEach(btn => {
      btn.addEventListener('click', (e) => addToCart(e.currentTarget.dataset.id));
    });
    if (window.lucide) window.lucide.createIcons();
  }

  // --- Event Listeners ---

  // Search
  document.getElementById('searchInput').addEventListener('input', (e) => {
    searchTerm = e.target.value.toLowerCase();
    applyFilters();
  });

  // Category pills
  document.getElementById('category-pills').addEventListener('click', (e) => {
    if (!e.target.classList.contains('filter-pill')) return;
    document.querySelectorAll('.filter-pill').forEach(p => p.classList.remove('active'));
    e.target.classList.add('active');
    activeCategory = e.target.dataset.cat;
    applyFilters();
  });

  // Price range
  document.getElementById('minPrice').addEventListener('input', (e) => {
    minPrice = e.target.value ? parseFloat(e.target.value) : null;
    applyFilters();
  });
  document.getElementById('maxPrice').addEventListener('input', (e) => {
    maxPrice = e.target.value ? parseFloat(e.target.value) : null;
    applyFilters();
  });

  // Sort
  document.getElementById('sortSelect').addEventListener('change', (e) => {
    sortMode = e.target.value;
    applyFilters();
  });

  // Initial render
  applyFilters();
}


// 2. Product Detail Page
function renderProductDetail(root, params) {
  const product = state.products.find(p => p.id === params.id);
  
  if (!product) {
    root.innerHTML = '<div class="container" style="padding: 100px 0; text-align: center;"><h2>Product Not Found</h2><a href="#/" class="btn btn-primary" style="margin-top: 20px;">Return to Shop</a></div>';
    return;
  }

  // Local state for customizer
  let selectedVariant = product.customizable ? product.variants[0] : null;
  let selectedSize = product.customizable ? product.sizes[0] : null;

  function renderDetailHTML() {
    const mainImg = selectedVariant ? selectedVariant.image : product.image;
    
    let customizerHTML = '';
    if (product.customizable) {
      const colorsHTML = product.variants.map(v => `
        <button class="color-swatch ${v.id === selectedVariant.id ? 'active' : ''}" 
                style="background-color: ${v.color};" 
                data-id="${v.id}"
                title="${v.name}"></button>
      `).join('');
      
      const sizesHTML = product.sizes.map(s => `
        <button class="size-btn ${s === selectedSize ? 'active' : ''}" data-size="${s}">${s}</button>
      `).join('');

      customizerHTML = `
        <div class="customizer-section">
          <div class="customizer-group">
            <h4 class="customizer-title">Color: <span id="color-name-display" style="color: var(--text-muted); font-weight: 400;">${selectedVariant.name}</span></h4>
            <div class="color-options" id="color-options">
              ${colorsHTML}
            </div>
          </div>
          <div class="customizer-group">
            <h4 class="customizer-title">Size: <span id="size-display" style="color: var(--text-muted); font-weight: 400;">${selectedSize}</span></h4>
            <div class="size-options" id="size-options">
              ${sizesHTML}
            </div>
          </div>
        </div>
      `;
    }

    root.innerHTML = `
      <div class="container product-detail-container">
        <div class="detail-img-wrapper" id="detail-img-wrapper">
          <img src="${mainImg}" alt="${product.name}" id="main-product-img" style="width: 100%; height: 100%; object-fit: cover; transition: opacity 0.3s ease;">
        </div>
        <div class="detail-info">
          <a href="#/" class="back-link"><i data-lucide="arrow-left" style="width: 16px; height: 16px;"></i> Back to Shop</a>
          <h1 class="detail-title">${product.name}</h1>
          <div class="detail-price">$${product.price.toFixed(2)}</div>
          <p class="detail-desc">${product.description}</p>
          
          ${customizerHTML}

          <div class="detail-actions">
            <button class="btn btn-primary add-to-cart-detail" style="width: 100%; max-width: 300px; font-size: 1.125rem; padding: 16px;">
              ${product.customizable ? 'Add Customized to Cart' : 'Add to Cart'}
            </button>
          </div>
        </div>
      </div>
    `;

    // Attach customizer listeners
    if (product.customizable) {
      document.querySelectorAll('.color-swatch').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const vId = e.target.dataset.id;
          selectedVariant = product.variants.find(v => v.id === vId);
          
          // Animate image change
          const imgEl = document.getElementById('main-product-img');
          imgEl.style.opacity = 0;
          setTimeout(() => {
            imgEl.src = selectedVariant.image;
            imgEl.style.opacity = 1;
          }, 300);

          // Update UI
          document.getElementById('color-name-display').textContent = selectedVariant.name;
          document.querySelectorAll('.color-swatch').forEach(b => b.classList.remove('active'));
          e.target.classList.add('active');
        });
      });

      document.querySelectorAll('.size-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          selectedSize = e.target.dataset.size;
          document.getElementById('size-display').textContent = selectedSize;
          document.querySelectorAll('.size-btn').forEach(b => b.classList.remove('active'));
          e.target.classList.add('active');
        });
      });
    }

    document.querySelector('.add-to-cart-detail').addEventListener('click', () => {
      if (product.customizable) {
        addToCart(product.id, selectedVariant, selectedSize);
      } else {
        addToCart(product.id);
      }
    });

    if(window.lucide) window.lucide.createIcons();
  }

  renderDetailHTML();
}

// 3. Cart Page (Full page alternative to drawer)
function renderCartPage(root) {
  root.innerHTML = `
    <div class="container cart-page-container">
      <h1 style="font-family: var(--font-heading); font-size: 2.5rem; text-transform: uppercase; margin-bottom: 40px;">Shopping Cart</h1>
      <div class="cart-layout" id="cart-page-content">
        <!-- populated by renderCartPageItems -->
      </div>
    </div>
  `;
  renderCartPageItems();
}

function renderCartPageItems() {
  const content = document.getElementById('cart-page-content');
  if (!content) return;

  if (state.cart.length === 0) {
    content.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 60px 0; background: var(--bg-secondary); border-radius: var(--radius-md); border: 1px solid var(--border-color);">
        <i data-lucide="shopping-bag" style="width: 64px; height: 64px; color: var(--text-muted); margin-bottom: 16px;"></i>
        <h2>Your cart is empty</h2>
        <a href="#/" class="btn btn-primary" style="margin-top: 24px;">Start Shopping</a>
      </div>
    `;
    if(window.lucide) window.lucide.createIcons();
    return;
  }

  let total = 0;
  const itemsHtml = state.cart.map(item => {
    const product = state.products.find(p => p.id === item.productId);
    if(!product) return '';
    const itemTotal = product.price * item.quantity;
    total += itemTotal;

    const img = item.variant ? item.variant.image : product.image;
    const titleExt = item.variant ? `<br><small style="color:var(--text-muted); font-size:0.875rem;">${item.variant.name} | Size: ${item.size}</small>` : '';

    return `
      <div class="cart-item" style="align-items: center;">
        <img src="${img}" alt="${product.name}" class="cart-item-img" style="width: 120px; height: 120px;">
        <div class="cart-item-info">
          <h3 style="font-size: 1.25rem; margin-bottom: 8px;">${product.name}${titleExt}</h3>
          <div style="color: var(--accent); font-weight: 700; font-size: 1.125rem;">$${product.price.toFixed(2)}</div>
        </div>
        <div class="qty-controls" style="margin: 0 24px;">
          <button class="qty-btn" onclick="updateQuantity('${item.cartId}', -1)"><i data-lucide="minus" style="width: 16px;"></i></button>
          <span class="qty-val">${item.quantity}</span>
          <button class="qty-btn" onclick="updateQuantity('${item.cartId}', 1)"><i data-lucide="plus" style="width: 16px;"></i></button>
        </div>
        <div style="font-weight: 700; font-size: 1.25rem; width: 100px; text-align: right;">
          $${itemTotal.toFixed(2)}
        </div>
        <button class="btn btn-danger" onclick="removeFromCart('${item.cartId}')" style="margin-left: 24px; padding: 8px;">
          <i data-lucide="trash-2" style="width: 20px;"></i>
        </button>
      </div>
    `;
  }).join('');

  content.innerHTML = `
    <div class="cart-items-list">
      ${itemsHtml}
    </div>
    <div class="cart-summary">
      <h2 style="margin-bottom: 24px; text-transform: uppercase;">Order Summary</h2>
      <div style="display: flex; justify-content: space-between; margin-bottom: 16px; color: var(--text-secondary);">
        <span>Subtotal</span>
        <span>$${total.toFixed(2)}</span>
      </div>
      <div style="display: flex; justify-content: space-between; margin-bottom: 24px; color: var(--text-secondary);">
        <span>Shipping</span>
        <span>Free</span>
      </div>
      <div style="border-top: 1px solid var(--border-color); padding-top: 24px; margin-bottom: 32px; display: flex; justify-content: space-between; font-size: 1.5rem; font-family: var(--font-heading); font-weight: 700;">
        <span>Total</span>
        <span style="color: var(--accent);">$${total.toFixed(2)}</span>
      </div>
      <button class="btn btn-primary" style="width: 100%; padding: 16px;" onclick="checkout()">Proceed to Checkout</button>
    </div>
  `;
  if(window.lucide) window.lucide.createIcons();
}

// 4. Login Page
function renderLogin(root) {
  if (state.user) {
    window.location.hash = '/';
    return;
  }

  root.innerHTML = `
    <div class="container">
      <div class="auth-container">
        <h1 class="auth-title">Login</h1>
        <form id="login-form">
          <div class="form-group">
            <label class="form-label">Username</label>
            <input type="text" id="username" class="form-input" required>
            <small style="color: var(--text-muted); display: block; margin-top: 4px;">Use 'admin' to access admin panel</small>
          </div>
          <div class="form-group">
            <label class="form-label">Password</label>
            <input type="password" id="password" class="form-input" required>
            <small style="color: var(--text-muted); display: block; margin-top: 4px;">Any password works for simulation</small>
          </div>
          <button type="submit" class="btn btn-primary" style="width: 100%;">Sign In</button>
        </form>
      </div>
    </div>
  `;

  document.getElementById('login-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const username = document.getElementById('username').value.trim();
    if (!username) return;

    const user = {
      username: username,
      isAdmin: username.toLowerCase() === 'admin'
    };

    state.user = user;
    localStorage.setItem('opal_user', JSON.stringify(user));
    
    showToast(`Welcome back, ${username}!`);
    updateAuthUI();
    
    if (user.isAdmin) {
      window.location.hash = '/admin';
    } else {
      window.location.hash = '/';
    }
  });
}

// 5. Admin Page
function renderAdmin(root) {
  if (!state.user || !state.user.isAdmin) {
    window.location.hash = '/login';
    return;
  }

  // Define modes: 'add' or 'edit'
  let currentMode = 'add';
  let editingId = null;

  root.innerHTML = `
    <div class="container">
      <div class="admin-header">
        <h1 style="font-family: var(--font-heading); font-size: 2.5rem; text-transform: uppercase;">Admin Dashboard</h1>
        <button class="btn btn-secondary" onclick="logout()">Logout</button>
      </div>
      
      <div class="admin-grid">
        <div class="admin-sidebar">
          <h3 id="admin-form-title" style="margin-bottom: 24px; color: var(--accent);">Add New Product</h3>
          <form id="admin-product-form">
            <div class="form-group">
              <label class="form-label">Product Name *</label>
              <input type="text" id="p-name" class="form-input" required>
              <small class="error-msg" id="err-name" style="color: #ef4444; display: none; margin-top: 4px;">Name is required</small>
            </div>
            <div class="form-group">
              <label class="form-label">Category</label>
              <select id="p-category" class="form-input">
                <option value="">None</option>
                ${PRODUCT_CATEGORIES.map(c => `<option value="${c}">${c}</option>`).join('')}
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Price ($) *</label>
              <input type="number" step="0.01" min="0.01" id="p-price" class="form-input" required>
              <small class="error-msg" id="err-price" style="color: #ef4444; display: none; margin-top: 4px;">Price must be positive</small>
            </div>
            <div class="form-group">
              <label class="form-label">Image URL *</label>
              <input type="url" id="p-image" class="form-input" placeholder="https://..." required>
              <small class="error-msg" id="err-image" style="color: #ef4444; display: none; margin-top: 4px;">Valid image URL required</small>
              <div id="image-preview-container" style="margin-top: 12px; display: none;">
                <img id="image-preview" src="" style="width: 100%; height: 200px; object-fit: cover; border-radius: var(--radius-sm); border: 1px solid var(--border-color);">
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">Description *</label>
              <textarea id="p-desc" class="form-input" required></textarea>
              <small class="error-msg" id="err-desc" style="color: #ef4444; display: none; margin-top: 4px;">Description is required</small>
            </div>
            <div style="display: flex; gap: 12px;">
              <button type="submit" class="btn btn-primary" id="btn-submit-form" style="flex: 1;">Add Product</button>
              <button type="button" class="btn btn-secondary" id="btn-cancel-edit" style="display: none;">Cancel</button>
            </div>
          </form>
        </div>
        
        <div class="admin-content">
          <h3 style="margin-bottom: 24px;">Manage Products</h3>
          <div id="admin-product-list" style="display: flex; flex-direction: column; gap: 16px;">
            <!-- populated by JS -->
          </div>
        </div>
      </div>
    </div>
  `;

  renderAdminProductList();

  const form = document.getElementById('admin-product-form');
  const imgInput = document.getElementById('p-image');
  const previewContainer = document.getElementById('image-preview-container');
  const previewImg = document.getElementById('image-preview');
  const cancelBtn = document.getElementById('btn-cancel-edit');
  const title = document.getElementById('admin-form-title');
  const submitBtn = document.getElementById('btn-submit-form');

  // Live image preview
  imgInput.addEventListener('input', () => {
    const url = imgInput.value.trim();
    if (url) {
      previewImg.src = url;
      previewContainer.style.display = 'block';
    } else {
      previewContainer.style.display = 'none';
    }
  });

  previewImg.addEventListener('error', () => {
    previewContainer.style.display = 'none';
  });

  // Cancel Edit
  cancelBtn.addEventListener('click', () => {
    form.reset();
    previewContainer.style.display = 'none';
    currentMode = 'add';
    editingId = null;
    title.textContent = 'Add New Product';
    submitBtn.textContent = 'Add Product';
    cancelBtn.style.display = 'none';
    document.querySelectorAll('.error-msg').forEach(el => el.style.display = 'none');
  });

  // Form Validation & Submit
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    document.querySelectorAll('.error-msg').forEach(el => el.style.display = 'none');
    let isValid = true;

    const name = document.getElementById('p-name').value.trim();
    const price = parseFloat(document.getElementById('p-price').value);
    const category = document.getElementById('p-category').value;
    const image = document.getElementById('p-image').value.trim();
    const desc = document.getElementById('p-desc').value.trim();

    if (!name) { document.getElementById('err-name').style.display = 'block'; isValid = false; }
    if (!price || price <= 0) { document.getElementById('err-price').style.display = 'block'; isValid = false; }
    if (!image) { document.getElementById('err-image').style.display = 'block'; isValid = false; }
    if (!desc) { document.getElementById('err-desc').style.display = 'block'; isValid = false; }

    if (!isValid) return;

    if (currentMode === 'add') {
      const newProduct = {
        id: 'p' + Date.now(),
        name, price, category, image, description: desc, customizable: false
      };
      state.products.push(newProduct);
      showToast('Product added successfully!');
    } else if (currentMode === 'edit') {
      const idx = state.products.findIndex(p => p.id === editingId);
      if (idx !== -1) {
        state.products[idx] = {
          ...state.products[idx],
          name, price, category, image, description: desc
        };
        showToast('Product updated successfully!');
      }
    }

    localStorage.setItem('opal_products_v3', JSON.stringify(state.products));
    cancelBtn.click(); // resets form and mode
    renderAdminProductList();
  });

  // Edit global hook
  window.editProduct = function(id) {
    const product = state.products.find(p => p.id === id);
    if (!product) return;

    currentMode = 'edit';
    editingId = id;
    title.textContent = 'Edit Product';
    submitBtn.textContent = 'Save Changes';
    cancelBtn.style.display = 'block';
    
    document.getElementById('p-name').value = product.name;
    document.getElementById('p-category').value = product.category || '';
    document.getElementById('p-price').value = product.price;
    document.getElementById('p-image').value = product.image;
    document.getElementById('p-desc').value = product.description;

    previewImg.src = product.image;
    previewContainer.style.display = 'block';
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
}

function renderAdminProductList() {
  const list = document.getElementById('admin-product-list');
  if (!list) return;

  list.innerHTML = state.products.map(p => `
    <div style="display: flex; justify-content: space-between; align-items: center; padding: 16px; background: var(--bg-primary); border: 1px solid var(--border-color); border-radius: var(--radius-sm);">
      <div style="display: flex; align-items: center; gap: 16px;">
        <img src="${p.image}" style="width: 48px; height: 48px; object-fit: cover; border-radius: 4px;">
        <div>
          <div style="font-weight: 600;">${p.name}</div>
          <div style="color: var(--accent); font-size: 0.875rem;">$${p.price.toFixed(2)} ${p.category ? `• ${p.category}` : ''}</div>
        </div>
      </div>
      <div style="display: flex; gap: 8px;">
        <button class="btn btn-secondary" onclick="editProduct('${p.id}')" style="padding: 8px;">
          <i data-lucide="edit-2" style="width: 18px;"></i>
        </button>
        <button class="btn btn-danger" onclick="deleteProduct('${p.id}')" style="padding: 8px;">
          <i data-lucide="trash-2" style="width: 18px;"></i>
        </button>
      </div>
    </div>
  `).join('');
  if(window.lucide) window.lucide.createIcons();
}

window.deleteProduct = function(id) {
  if(confirm('Are you sure you want to delete this product?')) {
    state.products = state.products.filter(p => p.id !== id);
    localStorage.setItem('opal_products_v3', JSON.stringify(state.products));
    
    state.cart = state.cart.filter(item => item.productId !== id);
    localStorage.setItem('opal_cart', JSON.stringify(state.cart));
    updateCartBadge();
    
    renderAdminProductList();
    showToast('Product deleted');
  }
}

// --- Cart Logic ---
function addToCart(productId, variant = null, size = null) {
  const cartId = variant ? `${productId}_${variant.id}_${size}` : productId;
  const existingItem = state.cart.find(item => item.cartId === cartId);
  
  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    state.cart.push({ 
      cartId, 
      productId, 
      variant, 
      size, 
      quantity: 1 
    });
  }
  
  saveCart();
  updateCartBadge();
  showToast('Added to cart');
  toggleCartDrawer(true);
}

window.updateQuantity = function(cartId, delta) {
  const item = state.cart.find(i => i.cartId === cartId);
  if (item) {
    item.quantity += delta;
    if (item.quantity <= 0) {
      removeFromCart(cartId, false);
    } else {
      saveCart();
      updateCartBadge();
      renderCartDrawerContent();
      renderCartPageItems();
    }
  }
}

window.removeFromCart = function(cartId, showMsg = true) {
  state.cart = state.cart.filter(item => item.cartId !== cartId);
  saveCart();
  updateCartBadge();
  renderCartDrawerContent();
  renderCartPageItems();
  if(showMsg) showToast('Removed from cart');
}

function saveCart() {
  localStorage.setItem('opal_cart', JSON.stringify(state.cart));
}

function updateCartBadge() {
  const count = state.cart.reduce((sum, item) => sum + item.quantity, 0);
  const badge = document.getElementById('cart-badge');
  badge.textContent = count;
  
  if (count > 0) {
    badge.style.transform = 'scale(1.2)';
    setTimeout(() => badge.style.transform = 'scale(1)', 200);
  }
}

window.checkout = function() {
  if (state.cart.length === 0) return;
  if (!state.user) {
    showToast('Please login to checkout');
    window.location.hash = '/login';
    toggleCartDrawer(false);
    return;
  }
  
  state.cart = [];
  saveCart();
  updateCartBadge();
  renderCartDrawerContent();
  renderCartPageItems();
  toggleCartDrawer(false);
  showToast('Order placed successfully! Thank you.', 4000);
  window.location.hash = '/';
}

// --- Cart Drawer UI ---
function toggleCartDrawer(open) {
  const drawer = document.getElementById('cart-drawer');
  const overlay = document.getElementById('drawer-overlay');
  
  if (open) {
    renderCartDrawerContent();
    drawer.classList.add('open');
    overlay.classList.add('open');
  } else {
    drawer.classList.remove('open');
    overlay.classList.remove('open');
  }
}

function renderCartDrawerContent() {
  const body = document.getElementById('drawer-body');
  const footer = document.getElementById('drawer-footer');
  
  if (state.cart.length === 0) {
    body.innerHTML = '<div class="empty-cart">Your cart is empty</div>';
    footer.innerHTML = '';
    return;
  }

  let total = 0;
  body.innerHTML = state.cart.map(item => {
    const product = state.products.find(p => p.id === item.productId);
    if (!product) return '';
    total += product.price * item.quantity;
    
    const img = item.variant ? item.variant.image : product.image;
    const titleExt = item.variant ? `<div style="color:var(--text-muted); font-size:0.75rem; margin-top:2px;">${item.variant.name} / ${item.size}</div>` : '';

    return `
      <div class="cart-item">
        <img src="${img}" alt="${product.name}" class="cart-item-img">
        <div class="cart-item-info">
          <div class="cart-item-title">${product.name}${titleExt}</div>
          <div class="cart-item-price">$${product.price.toFixed(2)}</div>
          <div class="cart-item-actions">
            <div class="qty-controls">
              <button class="qty-btn" onclick="updateQuantity('${item.cartId}', -1)"><i data-lucide="minus" style="width: 14px;"></i></button>
              <span class="qty-val">${item.quantity}</span>
              <button class="qty-btn" onclick="updateQuantity('${item.cartId}', 1)"><i data-lucide="plus" style="width: 14px;"></i></button>
            </div>
            <button class="btn btn-danger" onclick="removeFromCart('${item.cartId}')" style="padding: 4px;">
              <i data-lucide="trash-2" style="width: 16px;"></i>
            </button>
          </div>
        </div>
      </div>
    `;
  }).join('');

  footer.innerHTML = `
    <div class="cart-total">
      <span>Total</span>
      <span>$${total.toFixed(2)}</span>
    </div>
    <button class="btn btn-primary" style="width: 100%;" onclick="checkout()">Checkout</button>
    <a href="#/cart" class="btn btn-secondary" style="width: 100%; margin-top: 12px; text-align: center; display: block;" onclick="document.getElementById('drawer-close').click()">View Full Cart</a>
  `;
  if(window.lucide) window.lucide.createIcons();
}

// --- Auth UI ---
function updateAuthUI() {
  const navAuth = document.getElementById('nav-auth');
  const mobileAuth = document.getElementById('mobile-auth');
  
  if (state.user) {
    const adminLink = state.user.isAdmin ? `<a href="#/admin" class="nav-link">Admin</a>` : '';
    const adminLinkMobile = state.user.isAdmin ? `<a href="#/admin" class="mobile-link">Admin</a>` : '';
    
    navAuth.innerHTML = `
      ${adminLink}
      <div style="display: flex; align-items: center; gap: 8px; color: var(--text-primary); font-weight: 600; font-size: 0.875rem;">
        <i data-lucide="user" style="width: 16px;"></i> ${state.user.username}
      </div>
      <button class="btn btn-secondary" onclick="logout()" style="padding: 8px 16px; font-size: 0.75rem;">Logout</button>
    `;
    
    mobileAuth.innerHTML = `
      ${adminLinkMobile}
      <div style="margin: 16px 0; color: var(--accent); font-weight: 600;">Logged in as ${state.user.username}</div>
      <button class="btn btn-secondary" onclick="logout()" style="width: 100%;">Logout</button>
    `;
  } else {
    navAuth.innerHTML = `<a href="#/login" class="btn btn-primary" style="padding: 8px 24px;">Login</a>`;
    mobileAuth.innerHTML = `<a href="#/login" class="btn btn-primary" style="width: 100%; display: block; text-align: center;" onclick="document.getElementById('mobile-menu').classList.remove('open')">Login</a>`;
  }
  if(window.lucide) window.lucide.createIcons();
}

window.logout = function() {
  state.user = null;
  localStorage.removeItem('opal_user');
  updateAuthUI();
  showToast('Logged out successfully');
  window.location.hash = '/';
}

// --- UI Utilities ---
function showToast(message, duration = 3000) {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `<i data-lucide="check-circle" style="color: var(--accent);"></i> ${message}`;
  
  container.appendChild(toast);
  if(window.lucide) window.lucide.createIcons();
  
  setTimeout(() => toast.classList.add('show'), 10);
  
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

window.addEventListener('DOMContentLoaded', init);
