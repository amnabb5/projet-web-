/**
 * OPAL - Adventure Gear Store
 * Frontend JS - talks to api.php for all data
 */

const PRODUCT_CATEGORIES = ['Footwear', 'Bags', 'Shelter', 'Apparel', 'Cooking', 'Sleeping'];

const SHOE_VARIANTS = [
    { id: 'red',    color: '#EF4444', name: 'Volcanic Red',  image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' },
    { id: 'blue',   color: '#3B82F6', name: 'Ocean Blue',    image: 'https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' },
    { id: 'yellow', color: '#EAB308', name: 'Solar Yellow',  image: 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' },
    { id: 'black',  color: '#1C1917', name: 'Stealth Black', image: 'https://images.unsplash.com/photo-1539185441755-769473a23570?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' }
];
const SHOE_SIZES = ['US 7', 'US 8', 'US 9', 'US 10', 'US 11', 'US 12'];

const state = {
    products: [],
    cart: [],
    user: null  // { username, isAdmin, phone, address }
};

// simple fetch wrapper for our api
async function api(action, data = null, method = "GET") {
    const url     = `api.php?action=${action}`;
    const options = { method };

    if (method === "POST" && data) {
        options.headers = { "Content-Type": "application/json" };
        options.body    = JSON.stringify(data);
    }

    const res = await fetch(url, options);
    return await res.json();
}

// --- Init ---
async function init() {
    const sessionData = await api("check_session");
    if (sessionData.loggedIn) {
        state.user = {
            username: sessionData.username,
            isAdmin:  sessionData.isAdmin,
            phone:    sessionData.phone || "",
            address:  sessionData.address || ""
        };
    }

    const products = await api("get_products");
    state.products = products.map(p => {
        if (p.customizable) { p.variants = SHOE_VARIANTS; p.sizes = SHOE_SIZES; }
        return p;
    });

    const cartItems = await api("get_cart");
    state.cart = cartItems.map(item => ({
        cartId:    item.cart_key,
        productId: item.product_id,
        quantity:  item.quantity,
        variant:   item.variant,
        size:      item.size
    }));

    setupEventListeners();
    updateAuthUI();
    updateCartBadge();
    handleRoute();

    setTimeout(() => {
        if (window.lucide) window.lucide.createIcons();
    }, 100);
}

// --- Event Listeners ---
function setupEventListeners() {
    window.addEventListener('hashchange', handleRoute);

    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu    = document.getElementById('mobile-menu');

    mobileMenuBtn.addEventListener('click', () => mobileMenu.classList.toggle('open'));

    document.querySelectorAll('.mobile-link').forEach(link => {
        link.addEventListener('click', () => mobileMenu.classList.remove('open'));
    });

    document.getElementById('nav-cart-link').addEventListener('click', (e) => {
        e.preventDefault();
        toggleCartDrawer(true);
    });

    document.getElementById('mobile-cart-link').addEventListener('click', (e) => {
        e.preventDefault();
        mobileMenu.classList.remove('open');
        toggleCartDrawer(true);
    });

    document.getElementById('drawer-close').addEventListener('click', () => toggleCartDrawer(false));
    document.getElementById('drawer-overlay').addEventListener('click', () => toggleCartDrawer(false));
}

// --- Router ---
const routes = {
    '/':            renderLanding,
    '/shop':        renderShop,
    '/product/:id': renderProductDetail,
    '/cart':        renderCartPage,
    '/login':       renderLogin,
    '/register':    renderRegister,
    '/admin':       renderAdmin,
    '/profile':     renderProfile,
};

function handleRoute() {
    const path = window.location.hash.slice(1) || '/';
    const root = document.getElementById('app-root');

    const navbar = document.getElementById('navbar');
    if (path === '/') {
        navbar.classList.add('nav-transparent');
    } else {
        navbar.classList.remove('nav-transparent');
    }

    document.getElementById('mobile-menu').classList.remove('open');
    toggleCartDrawer(false);

    let matchedParams  = {};
    let matchedRouteFn = null;

    for (const route in routes) {
        if (route.includes(':')) {
            const routeParts = route.split('/');
            const pathParts  = path.split('/');
            if (routeParts.length === pathParts.length && routeParts[1] === pathParts[1]) {
                matchedParams.id = pathParts[2];
                matchedRouteFn   = routes[route];
                break;
            }
        } else if (route === path) {
            matchedRouteFn = routes[route];
            break;
        }
    }

    if (matchedRouteFn) {
        root.innerHTML = '<div class="page-loader"><div class="loader-ring"></div></div>';
        setTimeout(() => {
            matchedRouteFn(root, matchedParams);
            if (window.lucide) window.lucide.createIcons();
        }, 200);
    } else {
        root.innerHTML = '<div class="container" style="padding: 100px 0; text-align: center;"><h2>Page Not Found</h2><a href="#/" class="btn btn-primary" style="margin-top: 20px;">Return to Shop</a></div>';
    }
}

// --- Views ---

function renderLanding(root) {
    root.innerHTML = `
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

    <section class="landing-strip">
      <span class="strip-year">26</span>
      <span class="strip-tagline">Built for Beyond</span>
      <span class="strip-brand">OPAL</span>
    </section>

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

    setTimeout(() => {
        const items = document.querySelectorAll('.collage-item, .category-card');
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(e => {
                if (e.isIntersecting) { e.target.classList.add('visible'); observer.unobserve(e.target); }
            });
        }, { threshold: 0.15 });
        items.forEach(i => observer.observe(i));
    }, 100);
}

// Shop page
function renderShop(root) {
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
      <div id="product-grid" class="shop-grid"></div>
    </section>
  `;

    let activeCategory = 'all';
    let searchTerm     = '';
    let minPrice       = null;
    let maxPrice       = null;
    let sortMode       = 'default';

    const grid = document.getElementById('product-grid');

    function applyFilters() {
        let results = [...state.products];
        if (searchTerm) results = results.filter(p => p.name.toLowerCase().includes(searchTerm));
        if (activeCategory !== 'all') results = results.filter(p => p.category === activeCategory);
        if (minPrice !== null) results = results.filter(p => p.price >= minPrice);
        if (maxPrice !== null) results = results.filter(p => p.price <= maxPrice);
        if (sortMode === 'price-asc')  results.sort((a, b) => a.price - b.price);
        if (sortMode === 'price-desc') results.sort((a, b) => b.price - a.price);
        renderProductCards(results);
    }

    function renderProductCards(products) {
        if (products.length === 0) {
            grid.innerHTML = '<div class="no-results">No products found matching your filters.</div>';
            return;
        }

        grid.innerHTML = products.map(p => {
            // show out of stock badge if needed
            const outOfStock = p.stock <= 0;
            const stockBadge = outOfStock
                ? `<span style="position:absolute;top:12px;left:12px;background:#ef4444;color:#fff;font-size:0.75rem;padding:4px 10px;border-radius:20px;font-weight:600;">Out of Stock</span>`
                : (p.stock <= 3 ? `<span style="position:absolute;top:12px;left:12px;background:#f97316;color:#fff;font-size:0.75rem;padding:4px 10px;border-radius:20px;font-weight:600;">Only ${p.stock} left</span>` : '');

            return `
        <div class="product-card">
          <a href="#/product/${p.id}" class="product-img-wrapper">
            <img src="${p.image}" alt="${p.name}" class="product-img">
            ${p.customizable ? '<span class="badge-custom">Customizable</span>' : ''}
            ${stockBadge}
          </a>
          <div class="product-info">
            ${p.category ? `<span class="product-category">${p.category}</span>` : ''}
            <h3 class="product-title">${p.name}</h3>
            <p class="product-desc">${p.description}</p>
            <div class="product-price">$${p.price.toFixed(2)}</div>
            <div class="product-actions">
              <a href="#/product/${p.id}" class="btn btn-secondary" style="flex: 1; text-align: center;">${p.customizable ? 'Customize' : 'Details'}</a>
              ${!p.customizable ? `
                <button class="btn btn-primary add-to-cart-btn" data-id="${p.id}" style="flex: 1;" ${outOfStock ? 'disabled style="flex:1;opacity:0.5;cursor:not-allowed;"' : ''}>
                  <i data-lucide="shopping-cart" style="width: 16px; height: 16px;"></i> ${outOfStock ? 'Sold Out' : 'Add'}
                </button>
              ` : ''}
            </div>
          </div>
        </div>
      `;
        }).join('');

        document.querySelectorAll('.add-to-cart-btn').forEach(btn => {
            btn.addEventListener('click', (e) => addToCart(e.currentTarget.dataset.id));
        });
        if (window.lucide) window.lucide.createIcons();
    }

    document.getElementById('searchInput').addEventListener('input', (e) => { searchTerm = e.target.value.toLowerCase(); applyFilters(); });
    document.getElementById('category-pills').addEventListener('click', (e) => {
        if (!e.target.classList.contains('filter-pill')) return;
        document.querySelectorAll('.filter-pill').forEach(p => p.classList.remove('active'));
        e.target.classList.add('active');
        activeCategory = e.target.dataset.cat;
        applyFilters();
    });
    document.getElementById('minPrice').addEventListener('input', (e) => { minPrice = e.target.value ? parseFloat(e.target.value) : null; applyFilters(); });
    document.getElementById('maxPrice').addEventListener('input', (e) => { maxPrice = e.target.value ? parseFloat(e.target.value) : null; applyFilters(); });
    document.getElementById('sortSelect').addEventListener('change', (e) => { sortMode = e.target.value; applyFilters(); });

    applyFilters();
}

// Product detail page
function renderProductDetail(root, params) {
    const product = state.products.find(p => p.id === params.id);

    if (!product) {
        root.innerHTML = '<div class="container" style="padding: 100px 0; text-align: center;"><h2>Product Not Found</h2><a href="#/" class="btn btn-primary" style="margin-top: 20px;">Return to Shop</a></div>';
        return;
    }

    let selectedVariant = product.customizable ? product.variants[0] : null;
    let selectedSize    = product.customizable ? product.sizes[0] : null;

    function renderDetailHTML() {
        const mainImg    = selectedVariant ? selectedVariant.image : product.image;
        const outOfStock = product.stock <= 0;

        let customizerHTML = '';
        if (product.customizable) {
            const colorsHTML = product.variants.map(v => `
        <button class="color-swatch ${v.id === selectedVariant.id ? 'active' : ''}"
                style="background-color: ${v.color};" data-id="${v.id}" title="${v.name}"></button>
      `).join('');
            const sizesHTML = product.sizes.map(s => `
        <button class="size-btn ${s === selectedSize ? 'active' : ''}" data-size="${s}">${s}</button>
      `).join('');
            customizerHTML = `
        <div class="customizer-section">
          <div class="customizer-group">
            <h4 class="customizer-title">Color: <span id="color-name-display" style="color: var(--text-muted); font-weight: 400;">${selectedVariant.name}</span></h4>
            <div class="color-options" id="color-options">${colorsHTML}</div>
          </div>
          <div class="customizer-group">
            <h4 class="customizer-title">Size: <span id="size-display" style="color: var(--text-muted); font-weight: 400;">${selectedSize}</span></h4>
            <div class="size-options" id="size-options">${sizesHTML}</div>
          </div>
        </div>
      `;
        }

        // stock indicator text
        let stockInfo = '';
        if (outOfStock) {
            stockInfo = `<div style="color:#ef4444;font-weight:600;margin-bottom:16px;">Out of Stock</div>`;
        } else if (product.stock <= 5) {
            stockInfo = `<div style="color:#f97316;font-weight:600;margin-bottom:16px;">Only ${product.stock} left in stock!</div>`;
        } else {
            stockInfo = `<div style="color:#22c55e;font-weight:500;margin-bottom:16px;">In Stock (${product.stock} available)</div>`;
        }

        root.innerHTML = `
      <div class="container product-detail-container">
        <div class="detail-img-wrapper" id="detail-img-wrapper">
          <img src="${mainImg}" alt="${product.name}" id="main-product-img"
               style="width:100%;height:100%;object-fit:contain;transition:opacity 0.3s ease;background:#f5f5f5;">
        </div>
        <div class="detail-info">
          <a href="#/shop" class="back-link"><i data-lucide="arrow-left" style="width:16px;height:16px;"></i> Back to Shop</a>
          <h1 class="detail-title">${product.name}</h1>
          <div class="detail-price">$${product.price.toFixed(2)}</div>
          <p class="detail-desc">${product.description}</p>
          ${stockInfo}
          ${customizerHTML}
          <div class="detail-actions">
            <button class="btn btn-primary add-to-cart-detail" style="width:100%;max-width:300px;font-size:1.125rem;padding:16px;" ${outOfStock ? 'disabled style="opacity:0.5;cursor:not-allowed;"' : ''}>
              ${outOfStock ? 'Out of Stock' : (product.customizable ? 'Add Customized to Cart' : 'Add to Cart')}
            </button>
          </div>
        </div>
      </div>
    `;

        if (product.customizable) {
            document.querySelectorAll('.color-swatch').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const vId = e.target.dataset.id;
                    selectedVariant = product.variants.find(v => v.id === vId);
                    const imgEl = document.getElementById('main-product-img');
                    imgEl.style.opacity = 0;
                    setTimeout(() => { imgEl.src = selectedVariant.image; imgEl.style.opacity = 1; }, 300);
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

        if (!outOfStock) {
            document.querySelector('.add-to-cart-detail').addEventListener('click', () => {
                if (product.customizable) addToCart(product.id, selectedVariant, selectedSize);
                else addToCart(product.id);
            });
        }

        if (window.lucide) window.lucide.createIcons();
    }

    renderDetailHTML();
}

// Cart page
function renderCartPage(root) {
    root.innerHTML = `
    <div class="container cart-page-container">
      <h1 style="font-family: var(--font-heading); font-size: 2.5rem; text-transform: uppercase; margin-bottom: 40px;">Shopping Cart</h1>
      <div class="cart-layout" id="cart-page-content"></div>
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
        <a href="#/shop" class="btn btn-primary" style="margin-top: 24px;">Start Shopping</a>
      </div>
    `;
        if (window.lucide) window.lucide.createIcons();
        return;
    }

    let total = 0;
    const itemsHtml = state.cart.map(item => {
        const product = state.products.find(p => p.id === item.productId);
        if (!product) return '';
        const itemTotal = product.price * item.quantity;
        total += itemTotal;
        const img      = item.variant ? item.variant.image : product.image;
        const titleExt = item.variant ? `<br><small style="color:var(--text-muted);font-size:0.875rem;">${item.variant.name} | Size: ${item.size}</small>` : '';

        return `
      <div class="cart-item" style="align-items: center;">
        <img src="${img}" alt="${product.name}" class="cart-item-img" style="width:120px;height:120px;object-fit:contain;background:#f5f5f5;">
        <div class="cart-item-info">
          <h3 style="font-size: 1.25rem; margin-bottom: 8px;">${product.name}${titleExt}</h3>
          <div style="color: var(--accent); font-weight: 700; font-size: 1.125rem;">$${product.price.toFixed(2)}</div>
          <div style="color: var(--text-muted); font-size: 0.8rem; margin-top: 4px;">Stock: ${product.stock}</div>
        </div>
        <div class="qty-controls" style="margin: 0 24px;">
          <button class="qty-btn" onclick="updateQuantity('${item.cartId}', '${item.productId}', -1)"><i data-lucide="minus" style="width:16px;"></i></button>
          <span class="qty-val">${item.quantity}</span>
          <button class="qty-btn" onclick="updateQuantity('${item.cartId}', '${item.productId}', 1)"><i data-lucide="plus" style="width:16px;"></i></button>
        </div>
        <div style="font-weight: 700; font-size: 1.25rem; width: 100px; text-align: right;">$${itemTotal.toFixed(2)}</div>
        <button class="btn btn-danger" onclick="removeFromCart('${item.cartId}')" style="margin-left: 24px; padding: 8px;">
          <i data-lucide="trash-2" style="width:20px;"></i>
        </button>
      </div>
    `;
    }).join('');

    content.innerHTML = `
    <div class="cart-items-list">${itemsHtml}</div>
    <div class="cart-summary">
      <h2 style="margin-bottom: 24px; text-transform: uppercase;">Order Summary</h2>
      <div style="display:flex;justify-content:space-between;margin-bottom:16px;color:var(--text-secondary);">
        <span>Subtotal</span><span>$${total.toFixed(2)}</span>
      </div>
      <div style="display:flex;justify-content:space-between;margin-bottom:24px;color:var(--text-secondary);">
        <span>Shipping</span><span>Free</span>
      </div>
      <div style="border-top:1px solid var(--border-color);padding-top:24px;margin-bottom:32px;display:flex;justify-content:space-between;font-size:1.5rem;font-family:var(--font-heading);font-weight:700;">
        <span>Total</span><span style="color:var(--accent);">$${total.toFixed(2)}</span>
      </div>
      <button class="btn btn-primary" style="width:100%;padding:16px;" onclick="checkout()">Proceed to Checkout</button>
    </div>
  `;
    if (window.lucide) window.lucide.createIcons();
}

// Login page
function renderLogin(root) {
    if (state.user) { window.location.hash = '/'; return; }

    root.innerHTML = `
    <div class="container">
      <div class="auth-container">
        <h1 class="auth-title">Login</h1>
        <div id="login-error" style="color:#ef4444;margin-bottom:16px;display:none;"></div>
        <div class="form-group">
          <label class="form-label">Username</label>
          <input type="text" id="username" class="form-input">
        </div>
        <div class="form-group">
          <label class="form-label">Password</label>
          <input type="password" id="password" class="form-input">
        </div>
        <button id="login-btn" class="btn btn-primary" style="width:100%;">Sign In</button>
        <p style="text-align:center;margin-top:20px;color:var(--text-muted);">
          Don't have an account? <a href="#/register" style="color:var(--accent);">Register</a>
        </p>
        <p style="text-align:center;margin-top:8px;color:var(--text-muted);font-size:0.85rem;">
          Admin: admin / admin123 &nbsp;|&nbsp; User: user1 / user123
        </p>
      </div>
    </div>
  `;

    document.getElementById('login-btn').addEventListener('click', async () => {
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value.trim();
        const errBox   = document.getElementById('login-error');

        if (!username || !password) { errBox.textContent = "Please fill in all fields."; errBox.style.display = 'block'; return; }

        const result = await api("login", { username, password }, "POST");
        if (result.error) { errBox.textContent = result.error; errBox.style.display = 'block'; return; }

        state.user = { username: result.username, isAdmin: result.isAdmin, phone: result.phone || "", address: result.address || "" };
        showToast(`Welcome back, ${result.username}!`);
        updateAuthUI();
        window.location.hash = result.isAdmin ? '/admin' : '/';
    });
}

// Register page
function renderRegister(root) {
    if (state.user) { window.location.hash = '/'; return; }

    root.innerHTML = `
    <div class="container">
      <div class="auth-container">
        <h1 class="auth-title">Create Account</h1>
        <div id="reg-error" style="color:#ef4444;margin-bottom:16px;display:none;"></div>
        <div class="form-group">
          <label class="form-label">Username</label>
          <input type="text" id="reg-username" class="form-input">
        </div>
        <div class="form-group">
          <label class="form-label">Password</label>
          <input type="password" id="reg-password" class="form-input">
          <small style="color:var(--text-muted);">At least 4 characters</small>
        </div>
        <div class="form-group">
          <label class="form-label">Phone Number</label>
          <input type="tel" id="reg-phone" class="form-input" placeholder="e.g. 0559734667" maxlength="10">
          <small style="color:var(--text-muted);">10 digits, starting with 0 (Algerian format)</small>
        </div>
        <div class="form-group">
          <label class="form-label">Address</label>
          <input type="text" id="reg-address" class="form-input" placeholder="e.g. 12 Rue Didouche, Alger">
        </div>
        <button id="reg-btn" class="btn btn-primary" style="width:100%;">Register</button>
        <p style="text-align:center;margin-top:20px;color:var(--text-muted);">
          Already have an account? <a href="#/login" style="color:var(--accent);">Login</a>
        </p>
      </div>
    </div>
  `;

    document.getElementById('reg-btn').addEventListener('click', async () => {
        const username = document.getElementById('reg-username').value.trim();
        const password = document.getElementById('reg-password').value.trim();
        const phone    = document.getElementById('reg-phone').value.trim();
        const address  = document.getElementById('reg-address').value.trim();
        const errBox   = document.getElementById('reg-error');

        if (!username || !password || !phone || !address) {
            errBox.textContent = "Please fill in all fields."; errBox.style.display = 'block'; return;
        }

        // Client-side Algerian phone validation
        if (!/^0[0-9]{9}$/.test(phone)) {
            errBox.textContent = "Phone number must be 10 digits and start with 0 (e.g. 0559734667).";
            errBox.style.display = 'block'; return;
        }

        const result = await api("register", { username, password, phone, address }, "POST");
        if (result.error) { errBox.textContent = result.error; errBox.style.display = 'block'; return; }

        showToast("Account created! Please log in.");
        window.location.hash = '/login';
    });
}

// Admin page
function renderAdmin(root) {
    if (!state.user || !state.user.isAdmin) { window.location.hash = '/login'; return; }

    let currentMode = 'add';
    let editingId   = null;

    root.innerHTML = `
    <div class="container">
      <div class="admin-header">
        <h1 style="font-family:var(--font-heading);font-size:2.5rem;text-transform:uppercase;">Admin Dashboard</h1>
        <button class="btn btn-secondary" onclick="logout()">Logout</button>
      </div>

      <div class="admin-grid">
        <div class="admin-sidebar">
          <h3 id="admin-form-title" style="margin-bottom:24px;color:var(--accent);">Add New Product</h3>
          <div id="form-error" style="color:#ef4444;margin-bottom:12px;display:none;"></div>

          <div class="form-group">
            <label class="form-label">Product Name *</label>
            <input type="text" id="p-name" class="form-input">
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
            <input type="number" step="0.01" min="0.01" id="p-price" class="form-input">
          </div>
          <div class="form-group">
            <label class="form-label">Stock Quantity *</label>
            <input type="number" min="0" id="p-stock" class="form-input" value="10">
          </div>

          <div class="form-group">
            <label class="form-label">Product Image *</label>

            <div style="display:flex;gap:8px;margin-bottom:10px;">
              <button type="button" id="tab-url" class="btn btn-primary" style="flex:1;font-size:0.8rem;padding:8px;">Use URL</button>
              <button type="button" id="tab-file" class="btn btn-secondary" style="flex:1;font-size:0.8rem;padding:8px;">Upload File</button>
            </div>

            <div id="input-url-section">
              <input type="url" id="p-image-url" class="form-input" placeholder="https://...">
            </div>

            <div id="input-file-section" style="display:none;">
              <input type="file" id="p-image-file" accept="image/*" class="form-input" style="padding:8px;">
              <div id="upload-status" style="font-size:0.8rem;margin-top:4px;color:var(--text-muted);"></div>
            </div>

            <div id="image-preview-container" style="margin-top:12px;display:none;">
              <img id="image-preview" src=""
                   style="width:100%;height:220px;object-fit:contain;border-radius:var(--radius-sm);border:1px solid var(--border-color);background:#f5f5f5;">
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Description *</label>
            <textarea id="p-desc" class="form-input"></textarea>
          </div>

          <div style="display:flex;gap:12px;">
            <button id="btn-submit-form" class="btn btn-primary" style="flex:1;">Add Product</button>
            <button id="btn-cancel-edit" class="btn btn-secondary" style="display:none;">Cancel</button>
          </div>
        </div>

        <div class="admin-content">
          <div style="display:flex;gap:12px;margin-bottom:24px;">
            <button id="tab-products" class="btn btn-primary" onclick="showAdminTab('products')">Products</button>
            <button id="tab-orders" class="btn btn-secondary" onclick="showAdminTab('orders')">Orders</button>
          </div>
          <div id="admin-product-list" style="display:flex;flex-direction:column;gap:16px;"></div>
          <div id="admin-order-list" style="display:none;flex-direction:column;gap:16px;"></div>
        </div>
      </div>
    </div>
  `;

    renderAdminProductList();

    // switch between products and orders tabs
    window.showAdminTab = async function(tab) {
        const productList = document.getElementById('admin-product-list');
        const orderList   = document.getElementById('admin-order-list');
        const tabProducts = document.getElementById('tab-products');
        const tabOrders   = document.getElementById('tab-orders');

        if (tab === 'products') {
            productList.style.display = 'flex';
            orderList.style.display   = 'none';
            tabProducts.className = 'btn btn-primary';
            tabOrders.className   = 'btn btn-secondary';
        } else {
            productList.style.display = 'none';
            orderList.style.display   = 'flex';
            tabProducts.className = 'btn btn-secondary';
            tabOrders.className   = 'btn btn-primary';
            renderAdminOrders();
        }
    };

    // which image input is active
    let imageMode   = 'url';   // 'url' or 'file'
    let uploadedUrl = '';      // url returned after upload

    const tabUrl  = document.getElementById('tab-url');
    const tabFile = document.getElementById('tab-file');
    const secUrl  = document.getElementById('input-url-section');
    const secFile = document.getElementById('input-file-section');
    const imgUrlInput = document.getElementById('p-image-url');
    const imgFileInput = document.getElementById('p-image-file');
    const previewContainer = document.getElementById('image-preview-container');
    const previewImg       = document.getElementById('image-preview');
    const uploadStatus     = document.getElementById('upload-status');
    const cancelBtn        = document.getElementById('btn-cancel-edit');
    const title            = document.getElementById('admin-form-title');
    const submitBtn        = document.getElementById('btn-submit-form');
    const formError        = document.getElementById('form-error');

    // switch tabs
    tabUrl.addEventListener('click', () => {
        imageMode = 'url';
        tabUrl.className  = 'btn btn-primary';
        tabFile.className = 'btn btn-secondary';
        secUrl.style.display  = 'block';
        secFile.style.display = 'none';
    });

    tabFile.addEventListener('click', () => {
        imageMode = 'file';
        tabFile.className = 'btn btn-primary';
        tabUrl.className  = 'btn btn-secondary';
        secFile.style.display = 'block';
        secUrl.style.display  = 'none';
    });

    // live preview for url input
    imgUrlInput.addEventListener('input', () => {
        const url = imgUrlInput.value.trim();
        if (url) { previewImg.src = url; previewContainer.style.display = 'block'; }
        else previewContainer.style.display = 'none';
    });

    previewImg.addEventListener('error', () => { previewContainer.style.display = 'none'; });

    // handle file selection and upload right away
    imgFileInput.addEventListener('change', async () => {
        const file = imgFileInput.files[0];
        if (!file) return;

        uploadStatus.textContent = 'Uploading...';
        uploadedUrl = '';

        const formData = new FormData();
        formData.append('image', file);

        const res    = await fetch('api.php?action=upload_image', { method: 'POST', body: formData });
        const result = await res.json();

        if (result.error) {
            uploadStatus.textContent = 'Upload failed: ' + result.error;
            return;
        }

        uploadedUrl = result.url;
        uploadStatus.textContent = 'Uploaded successfully!';
        previewImg.src = result.url;
        previewContainer.style.display = 'block';
    });

    // cancel edit mode
    cancelBtn.addEventListener('click', () => {
        document.getElementById('p-name').value     = '';
        document.getElementById('p-category').value = '';
        document.getElementById('p-price').value    = '';
        document.getElementById('p-stock').value    = '10';
        imgUrlInput.value = '';
        imgFileInput.value = '';
        uploadedUrl = '';
        previewContainer.style.display = 'none';
        formError.style.display = 'none';
        uploadStatus.textContent = '';
        currentMode = 'add';
        editingId   = null;
        title.textContent       = 'Add New Product';
        submitBtn.textContent   = 'Add Product';
        cancelBtn.style.display = 'none';
    });

    // submit
    submitBtn.addEventListener('click', async () => {
        formError.style.display = 'none';

        const name     = document.getElementById('p-name').value.trim();
        const price    = parseFloat(document.getElementById('p-price').value);
        const category = document.getElementById('p-category').value;
        const stock    = parseInt(document.getElementById('p-stock').value);
        const desc     = document.getElementById('p-desc').value.trim();

        // figure out what image url we're using
        let image = '';
        if (imageMode === 'url') {
            image = imgUrlInput.value.trim();
        } else {
            image = uploadedUrl;
        }

        if (!name || !price || price <= 0 || !image || !desc) {
            formError.textContent   = 'Please fill in all required fields (including an image).';
            formError.style.display = 'block';
            return;
        }

        let result;
        if (currentMode === 'add') {
            result = await api("add_product", { name, price, category, image, description: desc, stock }, "POST");
        } else {
            result = await api("update_product", { id: editingId, name, price, category, image, description: desc, stock }, "POST");
        }

        if (result.error) {
            formError.textContent   = result.error;
            formError.style.display = 'block';
            return;
        }

        // reload products from server
        const products = await api("get_products");
        state.products = products.map(p => {
            if (p.customizable) { p.variants = SHOE_VARIANTS; p.sizes = SHOE_SIZES; }
            return p;
        });

        showToast(currentMode === 'add' ? 'Product added!' : 'Product updated!');
        cancelBtn.click();
        renderAdminProductList();
    });

    window.editProduct = function(id) {
        const product = state.products.find(p => p.id === id);
        if (!product) return;

        currentMode = 'edit';
        editingId   = id;
        title.textContent       = 'Edit Product';
        submitBtn.textContent   = 'Save Changes';
        cancelBtn.style.display = 'block';

        document.getElementById('p-name').value     = product.name;
        document.getElementById('p-category').value = product.category || '';
        document.getElementById('p-price').value    = product.price;
        document.getElementById('p-stock').value    = product.stock;
        document.getElementById('p-desc').value     = product.description;

        // if the image is a url, switch to url tab
        if (product.image.startsWith('http')) {
            tabUrl.click();
            imgUrlInput.value = product.image;
        } else {
            // it was an uploaded file, show url tab with the path
            tabUrl.click();
            imgUrlInput.value = product.image;
        }

        previewImg.src = product.image;
        previewContainer.style.display = 'block';
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    window.deleteProduct = async function(id) {
        if (!confirm('Are you sure you want to delete this product?')) return;
        const result = await api("delete_product", { id }, "POST");
        if (result.error) { showToast('Error: ' + result.error); return; }
        state.products = state.products.filter(p => p.id !== id);
        state.cart     = state.cart.filter(item => item.productId !== id);
        updateCartBadge();
        renderAdminProductList();
        showToast('Product deleted');
    };
}

function renderAdminProductList() {
    const list = document.getElementById('admin-product-list');
    if (!list) return;

    list.innerHTML = state.products.map(p => `
    <div style="display:flex;justify-content:space-between;align-items:center;padding:16px;background:var(--bg-primary);border:1px solid var(--border-color);border-radius:var(--radius-sm);">
      <div style="display:flex;align-items:center;gap:16px;">
        <img src="${p.image}" style="width:56px;height:56px;object-fit:contain;border-radius:4px;background:#f5f5f5;border:1px solid var(--border-color);">
        <div>
          <div style="font-weight:600;">${p.name}</div>
          <div style="color:var(--accent);font-size:0.875rem;">$${p.price.toFixed(2)} ${p.category ? '• ' + p.category : ''}</div>
          <div style="font-size:0.8rem;color:var(--text-muted);margin-top:2px;">Stock: <strong style="color:${p.stock <= 3 ? '#ef4444' : 'inherit'}">${p.stock}</strong></div>
        </div>
      </div>
      <div style="display:flex;gap:8px;">
        <button class="btn btn-secondary" onclick="editProduct('${p.id}')" style="padding:8px;">
          <i data-lucide="edit-2" style="width:18px;"></i>
        </button>
        <button class="btn btn-danger" onclick="deleteProduct('${p.id}')" style="padding:8px;">
          <i data-lucide="trash-2" style="width:18px;"></i>
        </button>
      </div>
    </div>
  `).join('');

    if (window.lucide) window.lucide.createIcons();
}

// --- Cart Logic ---

async function addToCart(productId, variant = null, size = null) {
    const cartId  = variant ? `${productId}_${variant.id}_${size}` : productId;
    const product = state.products.find(p => p.id === productId);

    // check stock on client side first
    const currentQty = state.cart.find(i => i.cartId === cartId)?.quantity || 0;
    if (product && currentQty >= product.stock) {
        showToast(`Sorry, only ${product.stock} in stock!`);
        return;
    }

    // try to add on the server (server double-checks stock)
    const result = await api("add_to_cart", { cartKey: cartId, productId, quantity: 1, variant, size }, "POST");

    if (result.error) {
        showToast(result.error);
        return;
    }

    // update local state
    const existing = state.cart.find(item => item.cartId === cartId);
    if (existing) {
        existing.quantity += 1;
    } else {
        state.cart.push({ cartId, productId, variant, size, quantity: 1 });
    }

    updateCartBadge();
    showToast('Added to cart');
    toggleCartDrawer(true);
}

window.updateQuantity = async function(cartId, productId, delta) {
    const item    = state.cart.find(i => i.cartId === cartId);
    const product = state.products.find(p => p.id === productId);
    if (!item) return;

    const newQty = item.quantity + delta;

    if (newQty <= 0) {
        removeFromCart(cartId, false);
        return;
    }

    // check stock before increasing
    if (delta > 0 && product && newQty > product.stock) {
        showToast(`Only ${product.stock} in stock!`);
        return;
    }

    const result = await api("update_cart", { cartKey: cartId, quantity: newQty, productId }, "POST");
    if (result.error) { showToast(result.error); return; }

    item.quantity = newQty;
    updateCartBadge();
    renderCartDrawerContent();
    renderCartPageItems();
};

window.removeFromCart = async function(cartId, showMsg = true) {
    state.cart = state.cart.filter(item => item.cartId !== cartId);
    updateCartBadge();
    renderCartDrawerContent();
    renderCartPageItems();
    if (showMsg) showToast('Removed from cart');
    await api("remove_from_cart", { cartKey: cartId }, "POST");
};

function updateCartBadge() {
    const count = state.cart.reduce((sum, item) => sum + item.quantity, 0);
    const badge = document.getElementById('cart-badge');
    badge.textContent = count;
    if (count > 0) { badge.style.transform = 'scale(1.2)'; setTimeout(() => badge.style.transform = 'scale(1)', 200); }
}

window.checkout = async function() {
    if (state.cart.length === 0) return;
    if (!state.user) {
        showToast('Please login to checkout');
        window.location.hash = '/login';
        toggleCartDrawer(false);
        return;
    }

    // send the order to the server - it saves it and reduces stock
    const result = await api("checkout", {}, "POST");

    if (result.error) {
        showToast(result.error);
        return;
    }

    // clear local cart after successful order
    state.cart = [];

    // refresh products so stock numbers are up to date
    const products = await api("get_products");
    state.products = products.map(p => {
        if (p.customizable) { p.variants = SHOE_VARIANTS; p.sizes = SHOE_SIZES; }
        return p;
    });

    updateCartBadge();
    renderCartDrawerContent();
    renderCartPageItems();
    toggleCartDrawer(false);
    showToast('Order #' + result.orderId + ' placed! Total: $' + result.total.toFixed(2), 4000);
    window.location.hash = '/';
};

// --- Cart Drawer ---

function toggleCartDrawer(open) {
    const drawer  = document.getElementById('cart-drawer');
    const overlay = document.getElementById('drawer-overlay');
    if (open) { renderCartDrawerContent(); drawer.classList.add('open'); overlay.classList.add('open'); }
    else { drawer.classList.remove('open'); overlay.classList.remove('open'); }
}

function renderCartDrawerContent() {
    const body   = document.getElementById('drawer-body');
    const footer = document.getElementById('drawer-footer');

    if (state.cart.length === 0) {
        body.innerHTML   = '<div class="empty-cart">Your cart is empty</div>';
        footer.innerHTML = '';
        return;
    }

    let total = 0;
    body.innerHTML = state.cart.map(item => {
        const product = state.products.find(p => p.id === item.productId);
        if (!product) return '';
        total += product.price * item.quantity;
        const img      = item.variant ? item.variant.image : product.image;
        const titleExt = item.variant ? `<div style="color:var(--text-muted);font-size:0.75rem;margin-top:2px;">${item.variant.name} / ${item.size}</div>` : '';

        return `
      <div class="cart-item">
        <img src="${img}" alt="${product.name}" class="cart-item-img" style="object-fit:contain;background:#f5f5f5;">
        <div class="cart-item-info">
          <div class="cart-item-title">${product.name}${titleExt}</div>
          <div class="cart-item-price">$${product.price.toFixed(2)}</div>
          <div class="cart-item-actions">
            <div class="qty-controls">
              <button class="qty-btn" onclick="updateQuantity('${item.cartId}', '${item.productId}', -1)"><i data-lucide="minus" style="width:14px;"></i></button>
              <span class="qty-val">${item.quantity}</span>
              <button class="qty-btn" onclick="updateQuantity('${item.cartId}', '${item.productId}', 1)"><i data-lucide="plus" style="width:14px;"></i></button>
            </div>
            <button class="btn btn-danger" onclick="removeFromCart('${item.cartId}')" style="padding:4px;">
              <i data-lucide="trash-2" style="width:16px;"></i>
            </button>
          </div>
        </div>
      </div>
    `;
    }).join('');

    footer.innerHTML = `
    <div class="cart-total"><span>Total</span><span>$${total.toFixed(2)}</span></div>
    <button class="btn btn-primary" style="width:100%;" onclick="checkout()">Checkout</button>
    <a href="#/cart" class="btn btn-secondary" style="width:100%;margin-top:12px;text-align:center;display:block;" onclick="document.getElementById('drawer-close').click()">View Full Cart</a>
  `;
    if (window.lucide) window.lucide.createIcons();
}

// --- Auth ---

function updateAuthUI() {
    const navAuth    = document.getElementById('nav-auth');
    const mobileAuth = document.getElementById('mobile-auth');

    if (state.user) {
        const adminLink       = state.user.isAdmin ? `<a href="#/admin" class="nav-link">Admin</a>` : '';
        const adminLinkMobile = state.user.isAdmin ? `<a href="#/admin" class="mobile-link">Admin</a>` : '';
        navAuth.innerHTML = `
      ${adminLink}
      <a href="#/profile" style="display:flex;align-items:center;gap:8px;color:var(--text-primary);font-weight:600;font-size:0.875rem;text-decoration:none;cursor:pointer;padding:6px 10px;border-radius:var(--radius-sm);transition:background 0.2s;" onmouseover="this.style.background='var(--bg-secondary)'" onmouseout="this.style.background='transparent'">
        <i data-lucide="user" style="width:16px;"></i> ${state.user.username}
      </a>
      <button class="btn btn-secondary" onclick="logout()" style="padding:8px 16px;font-size:0.75rem;">Logout</button>
    `;
        mobileAuth.innerHTML = `
      ${adminLinkMobile}
      <a href="#/profile" class="mobile-link" onclick="document.getElementById('mobile-menu').classList.remove('open')" style="color:var(--accent);font-weight:600;">My Profile (${state.user.username})</a>
      <button class="btn btn-secondary" onclick="logout()" style="width:100%;margin-top:8px;">Logout</button>
    `;
    } else {
        navAuth.innerHTML    = `<a href="#/login" class="btn btn-primary" style="padding:8px 24px;">Login</a>`;
        mobileAuth.innerHTML = `<a href="#/login" class="btn btn-primary" style="width:100%;display:block;text-align:center;" onclick="document.getElementById('mobile-menu').classList.remove('open')">Login</a>`;
    }
    if (window.lucide) window.lucide.createIcons();
}

window.logout = async function() {
    await api("logout", {}, "POST");
    state.user = null;
    updateAuthUI();
    showToast('Logged out successfully');
    window.location.hash = '/';
};

// --- Toast ---

function showToast(message, duration = 3000) {
    const container = document.getElementById('toast-container');
    const toast     = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `<i data-lucide="check-circle" style="color:var(--accent);"></i> ${message}`;
    container.appendChild(toast);
    if (window.lucide) window.lucide.createIcons();
    setTimeout(() => toast.classList.add('show'), 10);
    setTimeout(() => { toast.classList.remove('show'); setTimeout(() => toast.remove(), 300); }, duration);
}

window.addEventListener('DOMContentLoaded', init);

// Profile page
async function renderProfile(root) {
    if (!state.user) { window.location.hash = '/login'; return; }

    root.innerHTML = `
    <div class="container">
      <div class="auth-container" style="max-width:520px;">
        <h1 class="auth-title" style="margin-bottom:8px;">My Profile</h1>
        <p style="color:var(--text-muted);text-align:center;margin-bottom:28px;font-size:0.9rem;">Update your personal information</p>
        <div id="profile-error"   style="color:#ef4444;margin-bottom:12px;display:none;padding:10px 14px;background:#fff1f1;border-radius:var(--radius-sm);"></div>
        <div id="profile-success" style="color:#22c55e;margin-bottom:12px;display:none;padding:10px 14px;background:#f0fdf4;border-radius:var(--radius-sm);"></div>
        <div class="form-group">
          <label class="form-label">Username</label>
          <input type="text" id="prof-username" class="form-input" value="${state.user.username}">
        </div>
        <div class="form-group">
          <label class="form-label">New Password <span style="color:var(--text-muted);font-weight:400;font-size:0.8rem;">(leave blank to keep current)</span></label>
          <input type="password" id="prof-password" class="form-input" placeholder="Enter new password">
          <small style="color:var(--text-muted);">At least 4 characters</small>
        </div>
        <div class="form-group">
          <label class="form-label">Phone Number</label>
          <input type="tel" id="prof-phone" class="form-input" maxlength="10" placeholder="e.g. 0559734667" value="${state.user.phone || ''}">
          <small style="color:var(--text-muted);">10 digits, starting with 0 (Algerian format)</small>
        </div>
        <div class="form-group">
          <label class="form-label">Address</label>
          <input type="text" id="prof-address" class="form-input" placeholder="e.g. 12 Rue Didouche, Alger" value="${state.user.address || ''}">
        </div>
        <button id="prof-save-btn" class="btn btn-primary" style="width:100%;padding:14px;">Save Changes</button>
        <a href="#/" class="btn btn-secondary" style="width:100%;display:block;text-align:center;margin-top:12px;padding:14px;">Back to Shop</a>
      </div>
    </div>
  `;

    // Load fresh profile data from server
    const profile = await api("get_profile");
    if (profile && !profile.error) {
        document.getElementById('prof-username').value = profile.username || state.user.username;
        document.getElementById('prof-phone').value   = profile.phone || state.user.phone || '';
        document.getElementById('prof-address').value = profile.address || state.user.address || '';
    }

    document.getElementById('prof-save-btn').addEventListener('click', async () => {
        const username = document.getElementById('prof-username').value.trim();
        const password = document.getElementById('prof-password').value.trim();
        const phone    = document.getElementById('prof-phone').value.trim();
        const address  = document.getElementById('prof-address').value.trim();
        const errBox   = document.getElementById('profile-error');
        const okBox    = document.getElementById('profile-success');

        errBox.style.display = 'none';
        okBox.style.display  = 'none';

        if (!username || !phone || !address) {
            errBox.textContent = "Username, phone and address are required.";
            errBox.style.display = 'block'; return;
        }

        if (!/^0[0-9]{9}$/.test(phone)) {
            errBox.textContent = "Phone must be 10 digits and start with 0 (e.g. 0559734667).";
            errBox.style.display = 'block'; return;
        }

        const btn = document.getElementById('prof-save-btn');
        btn.disabled = true; btn.textContent = 'Saving...';

        const result = await api("update_profile", { username, password, phone, address }, "POST");

        btn.disabled = false; btn.textContent = 'Save Changes';

        if (result.error) {
            errBox.textContent = result.error; errBox.style.display = 'block'; return;
        }

        // Update local state
        state.user.username = result.username;
        state.user.phone    = result.phone;
        state.user.address  = result.address;
        updateAuthUI();

        okBox.textContent = 'Profile updated successfully!';
        okBox.style.display = 'block';
        document.getElementById('prof-password').value = '';
    });
}

// marks an order as done - admin only
window.markOrderDone = async function(orderId) {
    const result = await api("update_order_status", { orderId, status: "done" }, "POST");
    if (result.error) {
        showToast(result.error);
        return;
    }
    showToast('Order #' + orderId + ' marked as done');
    renderAdminOrders();
};

// renders the orders list in the admin dashboard
async function renderAdminOrders() {
    const list = document.getElementById('admin-order-list');
    if (!list) return;

    list.innerHTML = '<div style="color:var(--text-muted);">Loading orders...</div>';

    const orders = await api("get_orders");

    if (orders.error) {
        list.innerHTML = '<div style="color:#ef4444;">Error loading orders: ' + orders.error + '</div>';
        return;
    }

    if (orders.length === 0) {
        list.innerHTML = '<div style="color:var(--text-muted);padding:40px;text-align:center;">No orders yet.</div>';
        return;
    }

    list.innerHTML = orders.map(order => {
        const date = new Date(order.created_at).toLocaleString();

        // build the items list for this order
        const itemsHtml = order.items.map(item => `
            <div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid var(--border-color);font-size:0.875rem;">
                <span>${item.product_name} ${item.variant_info ? '(' + item.variant_info + ')' : ''} x${item.quantity}</span>
                <span>$${(item.price * item.quantity).toFixed(2)}</span>
            </div>
        `).join('');

        // color the status badge
        const statusColor  = order.status === 'pending' ? '#f97316' : '#22c55e';
        const doneBtn      = order.status === 'pending'
            ? `<button class="btn btn-primary" onclick="markOrderDone(${order.id})" style="padding:6px 14px;font-size:0.8rem;">
                 <i data-lucide="check" style="width:14px;height:14px;"></i> Mark as Done
               </button>`
            : '';

        return `
        <div style="background:var(--bg-primary);border:1px solid var(--border-color);border-radius:var(--radius-sm);padding:20px;">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
                <div>
                    <span style="font-weight:700;font-size:1.1rem;">Order #${order.id}</span>
                    <span style="margin-left:12px;color:var(--text-muted);font-size:0.85rem;">${date}</span>
                </div>
                <div style="display:flex;align-items:center;gap:12px;">
                    <span style="background:${statusColor};color:#fff;padding:4px 12px;border-radius:20px;font-size:0.8rem;font-weight:600;">${order.status}</span>
                    <span style="font-weight:700;color:var(--accent);font-size:1.1rem;">$${order.total.toFixed(2)}</span>
                    ${doneBtn}
                </div>
            </div>
            <div style="color:var(--text-muted);font-size:0.85rem;margin-bottom:6px;">
                Customer: <strong style="color:var(--text-primary);">${order.username}</strong>
            </div>
            ${order.phone ? `<div style="color:var(--text-muted);font-size:0.85rem;margin-bottom:6px;">Phone: <strong style="color:var(--text-primary);">${order.phone}</strong></div>` : ''}
            ${order.address ? `<div style="color:var(--text-muted);font-size:0.85rem;margin-bottom:12px;">Address: <strong style="color:var(--text-primary);">${order.address}</strong></div>` : ''}
            <div>${itemsHtml}</div>
        </div>
        `;
    }).join('');
}
