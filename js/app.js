/* ============================================================
   app.js — Product data, card rendering, filter/sort, cart UX
   ============================================================ */

// ── PRODUCT DATA ─────────────────────────────────────────────
const PRODUCTS = [
  // ── CONCEPT PRODUCT 1: VERITAS ────────────────────────────
  {
    id: 'veritas',
    brand: 'Veritas',
    name: 'The Acne Cleanser For Oily Skin',
    subtitle: 'Succinic Acid 1.5% + LHA 0.3%',
    tagline: 'No BS. Just actives.',
    type: 'concept',
    price: 499,
    originalPrice: null,
    discount: null,
    rating: 4.6,
    reviews: 142,
    image: 'assets/images/ALl_ingridents_acbe_oily_skin.png',
    cardClass: 'card--veritas',
    ribbon: 'New',
    ribbonClass: 'card-ribbon--new',
    badgeText: 'Ingredient First',
    showIngredients: true,
    ingredients: [
      { category: 'Main Active', ingredient: 'Succinic Acid (1.5%)' },
      { category: 'Sub Active', ingredient: 'Capryloyl Salicylic Acid / LHA (0.3%) + Zinc PCA (0.5%)' },
      { category: 'Primary Surfactant', ingredient: 'Sodium Lauroyl Sarcosinate' },
      { category: 'Co-Surfactant', ingredient: 'Cocamidopropyl Betaine' },
      { category: 'Base Vehicle', ingredient: 'Water (Aqua)' },
      { category: 'Solvent / Humectant', ingredient: 'Propanediol (4.0%)' },
      { category: 'Preservative', ingredient: 'Phenoxyethanol, Ethylhexylglycerin' },
      { category: 'Chelator', ingredient: 'Sodium Phytate, Sodium Hydroxide' },
      { category: 'Penetration Enhancer', ingredient: '—' },
      { category: 'Hydration Network', ingredient: '—' },
    ],
  },

  // ── CONCEPT PRODUCT 2: SKN. ───────────────────────────────
  {
    id: 'skn',
    brand: 'Skn.',
    name: 'Oily + Acne Cleanser (01)',
    subtitle: 'Made For: Oily Skin · Frequent Breakouts',
    tagline: 'Your skin. Simplified.',
    type: 'concept',
    price: 499,
    originalPrice: null,
    discount: null,
    rating: 4.7,
    reviews: 89,
    image: 'assets/images/Simplified_skincare_acne_oily_skin.png',
    cardClass: 'card--skn',
    ribbon: 'New',
    ribbonClass: 'card-ribbon--new',
    showQR: true,
    qrUrl: '#', // TODO: Replace with video URL before going live
  },

  // ── COMPETITOR: CERAVE ────────────────────────────────────
  {
    id: 'cerave',
    brand: 'CeraVe',
    name: 'Foaming Facial Cleanser',
    subtitle: 'For Normal to Oily Skin · With Niacinamide & 3 Essential Ceramides',
    type: 'market',
    price: 559,
    originalPrice: 699,
    discount: '20% OFF',
    rating: 4.4,
    reviews: 3241,
    image: 'https://images-static.nykaa.com/media/catalog/product/d/a/da25edbCERAV00000010_1.jpg?tr=w-500',
    cardClass: 'card--market',
    ribbon: 'Bestseller',
    ribbonClass: 'card-ribbon--bestseller',
  },

  // ── COMPETITOR: THE MINIMALIST ────────────────────────────
  {
    id: 'minimalist',
    brand: 'The Minimalist',
    name: 'Salicylic Acid + LHA 2% Face Cleanser',
    subtitle: 'For Acne-Prone & Oily Skin · Pore Clearing Formula',
    type: 'market',
    price: 269,
    originalPrice: 349,
    discount: '23% OFF',
    rating: 4.3,
    reviews: 5812,
    image: 'https://images-static.nykaa.com/media/catalog/product/3/9/394e9c5MINIM00000019_a.jpg?tr=w-500',
    cardClass: 'card--market',
    ribbon: 'Bestseller',
    ribbonClass: 'card-ribbon--bestseller',
  },

  // ── COMPETITOR: DOT & KEY ─────────────────────────────────
  {
    id: 'dotandkey',
    brand: 'Dot & Key',
    name: 'Cica + Salicylic Acid Face Wash',
    subtitle: 'For Oily & Acne-Prone Skin · Green Tea + Tea Tree',
    type: 'market',
    price: 375,
    originalPrice: 449,
    discount: '17% OFF',
    rating: 4.2,
    reviews: 2104,
    image: 'https://images-static.nykaa.com/media/catalog/product/9/d/9d1c275DOTKE00000186_1.jpg?tr=w-500',
    cardClass: 'card--market',
    ribbon: null,
  },

  // ── COMPETITOR: MCAFFEINE ─────────────────────────────────
  {
    id: 'mcaffeine',
    brand: 'mCaffeine',
    name: '2% Salicylic Acid Anti-Acne Face Wash',
    subtitle: 'With Niacinamide & Matcha Tea · Oil Control',
    type: 'market',
    price: 254,
    originalPrice: 299,
    discount: '15% OFF',
    rating: 4.1,
    reviews: 8743,
    image: 'https://images-static.nykaa.com/media/catalog/product/2/f/2fed027MCAFF00000506_1.jpg?tr=w-500',
    cardClass: 'card--market',
    ribbon: null,
  },

  // ── COMPETITOR: PLUM ─────────────────────────────────────
  {
    id: 'plum',
    brand: 'Plum',
    name: 'Green Tea Pore Cleansing Face Wash',
    subtitle: 'With Glycolic Acid · Alcohol-Free · Acne-Prone & Oily Skin',
    type: 'market',
    price: 269,
    originalPrice: 325,
    discount: '17% OFF',
    rating: 4.3,
    reviews: 6920,
    image: 'https://images-static.nykaa.com/media/catalog/product/b/b/bbed6a8PLUMX00001019_01.jpg?tr=w-500',
    cardClass: 'card--market',
    ribbon: null,
  },

  // ── COMPETITOR: THE DERMA CO. ────────────────────────────
  {
    id: 'thedermaco',
    brand: 'The Derma Co.',
    name: '1% Salicylic Acid Foaming Face Wash',
    subtitle: 'Active Acne Control · Blackhead Clearing · Daily Use',
    type: 'market',
    price: 297,
    originalPrice: 349,
    discount: '15% OFF',
    rating: 4.2,
    reviews: 4315,
    image: 'https://images-static.nykaa.com/media/catalog/product/3/d/3d3a22aTHEDE00000342_1aa.jpg?tr=w-500',
    cardClass: 'card--market',
    ribbon: null,
  },
];

// ── CART STATE ───────────────────────────────────────────────
let cartCount = 0;
const cartCountEl = document.getElementById('cart-count');

function updateCartCount(n) {
  cartCount += n;
  cartCountEl.textContent = cartCount;
  cartCountEl.style.transform = 'scale(1.4)';
  setTimeout(() => { cartCountEl.style.transform = 'scale(1)'; cartCountEl.style.transition = 'transform 200ms ease'; }, 200);
}

// ── STAR RATING RENDERER ─────────────────────────────────────
function renderStars(rating) {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.4 ? 1 : 0;
  const empty = 5 - full - half;
  let html = '<span class="stars" aria-hidden="true">';
  for (let i = 0; i < full; i++) html += '<span class="star">★</span>';
  if (half) html += '<span class="star" style="opacity:0.5">★</span>';
  for (let i = 0; i < empty; i++) html += '<span class="star star-empty">★</span>';
  html += '</span>';
  return html;
}

// ── CARD HTML BUILDERS ───────────────────────────────────────

function buildIngredientTable(ingredients) {
  const rows = ingredients.map(r => `
    <tr>
      <td>${escHtml(r.category)}</td>
      <td>${escHtml(r.ingredient)}</td>
    </tr>`).join('');
  return `
    <table class="ingredient-table" aria-label="Full ingredient list">
      <thead><tr><th>Category</th><th>Ingredient</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>`;
}

function buildVeritasCard(p) {
  const ribbonHtml = p.ribbon
    ? `<span class="card-ribbon ${p.ribbonClass}">${escHtml(p.ribbon)}</span>` : '';

  return `
    <article class="product-card ${p.cardClass}" id="card-${p.id}">
      ${ribbonHtml}
      <button class="card-wishlist" aria-label="Add ${escHtml(p.name)} to wishlist" id="wish-${p.id}">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
      </button>
      <div class="card-image-wrap">
        <img src="${escHtml(p.image)}" alt="${escHtml(p.name)} by ${escHtml(p.brand)}" loading="lazy" />
      </div>
      <div class="card-body">
        <p class="card-brand">${escHtml(p.brand)}</p>
        <p class="card-name">${escHtml(p.name)}</p>
        <p class="card-sub">${escHtml(p.tagline)}</p>

        <div class="ingredient-badge-row">
          <span class="ingredient-badge">Succinic Acid 1.5%</span>
          <span class="ingredient-badge">LHA 0.3%</span>
          <span class="ingredient-badge">Zinc PCA 0.5%</span>
        </div>

        <div class="card-rating">
          ${renderStars(p.rating)}
          <span class="rating-text">${p.rating} (${p.reviews.toLocaleString('en-IN')} reviews)</span>
        </div>

        <div class="card-price-row">
          <span class="card-price">₹${p.price}</span>
        </div>

        <button class="ingredient-toggle" id="toggle-${p.id}" aria-expanded="false" aria-controls="table-${p.id}">
          Full Ingredient List <span class="toggle-arrow" aria-hidden="true">▾</span>
        </button>
        <div class="ingredient-table-wrap" id="table-${p.id}" role="region">
          ${buildIngredientTable(p.ingredients)}
        </div>

        <div class="card-cta-wrap">
          <button class="btn-buy-now" id="buy-${p.id}" data-product-id="${p.id}">
            Buy Now →
          </button>
        </div>
      </div>
    </article>`;
}

function buildSknCard(p) {
  const ribbonHtml = p.ribbon
    ? `<span class="card-ribbon ${p.ribbonClass}">${escHtml(p.ribbon)}</span>` : '';

  return `
    <article class="product-card ${p.cardClass}" id="card-${p.id}">
      ${ribbonHtml}
      <button class="card-wishlist" aria-label="Add ${escHtml(p.name)} to wishlist" id="wish-${p.id}">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
      </button>
      <div class="card-image-wrap">
        <img src="${escHtml(p.image)}" alt="${escHtml(p.name)} by ${escHtml(p.brand)}" loading="lazy" />
      </div>
      <div class="card-body">
        <p class="card-brand">${escHtml(p.brand)}</p>
        <p class="card-name">${escHtml(p.name)}</p>
        <span class="made-for-badge">🎯 Made For: Oily Skin · Frequent Breakouts</span>

        <div class="card-rating">
          ${renderStars(p.rating)}
          <span class="rating-text">${p.rating} (${p.reviews.toLocaleString('en-IN')} reviews)</span>
        </div>

        <div class="card-price-row">
          <span class="card-price">₹${p.price}</span>
        </div>

        <a class="qr-badge" href="${escHtml(p.qrUrl)}" target="_blank" rel="noopener noreferrer" id="qr-${p.id}" aria-label="Scan to see how this product works">
          <svg class="qr-icon-svg" viewBox="0 0 100 100" fill="currentColor">
            <rect x="10" y="10" width="30" height="30"/>
            <rect x="15" y="15" width="20" height="20" fill="white"/>
            <rect x="20" y="20" width="10" height="10"/>
            <rect x="60" y="10" width="30" height="30"/>
            <rect x="65" y="15" width="20" height="20" fill="white"/>
            <rect x="70" y="20" width="10" height="10"/>
            <rect x="10" y="60" width="30" height="30"/>
            <rect x="15" y="65" width="20" height="20" fill="white"/>
            <rect x="20" y="70" width="10" height="10"/>
            <rect x="60" y="60" width="10" height="10"/>
            <rect x="75" y="60" width="10" height="10"/>
            <rect x="60" y="75" width="10" height="15"/>
            <rect x="75" y="75" width="15" height="10"/>
            <rect x="45" y="10" width="10" height="10"/>
            <rect x="45" y="25" width="10" height="10"/>
            <rect x="10" y="45" width="10" height="10"/>
            <rect x="25" y="45" width="10" height="10"/>
            <rect x="45" y="45" width="10" height="10"/>
            <rect x="60" y="45" width="10" height="10"/>
            <rect x="80" y="45" width="10" height="10"/>
          </svg>
          <span class="qr-label">Scan to see how it works →<br/><span style="font-weight:400;opacity:0.8">See the actives, the science, in 60 sec</span></span>
        </a>

        <div class="card-cta-wrap">
          <button class="btn-buy-now" id="buy-${p.id}" data-product-id="${p.id}">
            Buy Now →
          </button>
        </div>
      </div>
    </article>`;
}

function buildMarketCard(p) {
  const ribbonHtml = p.ribbon
    ? `<span class="card-ribbon ${p.ribbonClass}">${escHtml(p.ribbon)}</span>` : '';
  const priceHtml = p.originalPrice
    ? `<span class="card-price">₹${p.price}</span>
       <span class="card-price-original">₹${p.originalPrice}</span>
       <span class="card-discount">${escHtml(p.discount)}</span>`
    : `<span class="card-price">₹${p.price}</span>`;

  return `
    <article class="product-card ${p.cardClass}" id="card-${p.id}">
      ${ribbonHtml}
      <button class="card-wishlist" aria-label="Add ${escHtml(p.name)} to wishlist" id="wish-${p.id}">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
      </button>
      <div class="card-image-wrap">
        <img src="${escHtml(p.image)}" alt="${escHtml(p.name)} by ${escHtml(p.brand)}" loading="lazy" />
      </div>
      <div class="card-body">
        <p class="card-brand">${escHtml(p.brand)}</p>
        <p class="card-name">${escHtml(p.name)}</p>
        <p class="card-sub">${escHtml(p.subtitle)}</p>
        <div class="card-rating">
          ${renderStars(p.rating)}
          <span class="rating-text">${p.rating} (${p.reviews.toLocaleString('en-IN')})</span>
        </div>
        <div class="card-price-row">${priceHtml}</div>
        <div class="card-cta-wrap">
          <button class="btn-buy-now" id="cart-${p.id}" data-product-id="${p.id}">
            Buy Now →
          </button>
        </div>
      </div>
    </article>`;
}

// ── RENDER ALL PRODUCTS ──────────────────────────────────────
function renderProducts(products) {
  const grid = document.getElementById('product-grid');
  grid.innerHTML = products.map(p => {
    if (p.id === 'veritas') return buildVeritasCard(p);
    if (p.id === 'skn') return buildSknCard(p);
    return buildMarketCard(p);
  }).join('');

  attachCardListeners();
}

// ── ATTACH EVENT LISTENERS AFTER RENDER ─────────────────────
function attachCardListeners() {
  // ALL product buttons → open survey modal (Buy Now + I want this)
  document.querySelectorAll('.btn-buy-now').forEach(btn => {
    btn.addEventListener('click', () => {
      const pid = btn.dataset.productId;
      const product = PRODUCTS.find(p => p.id === pid);
      if (product) openModal(pid, product);
    });
  });

  // Ingredient table toggles (Veritas)
  document.querySelectorAll('.ingredient-toggle').forEach(btn => {
    btn.addEventListener('click', () => {
      const tableId = btn.getAttribute('aria-controls');
      const tableWrap = document.getElementById(tableId);
      const arrow = btn.querySelector('.toggle-arrow');
      const isOpen = tableWrap.classList.contains('open');

      tableWrap.classList.toggle('open', !isOpen);
      arrow.classList.toggle('open', !isOpen);
      btn.setAttribute('aria-expanded', String(!isOpen));
      btn.querySelector('span:first-of-type') && null;
    });
  });

  // Wishlist buttons (decorative toggle)
  document.querySelectorAll('.card-wishlist').forEach(btn => {
    btn.addEventListener('click', () => {
      const svg = btn.querySelector('path');
      const active = btn.getAttribute('data-wishlisted') === 'true';
      btn.setAttribute('data-wishlisted', String(!active));
      svg.style.fill = active ? 'none' : '#e8527a';
      svg.style.stroke = active ? 'currentColor' : '#e8527a';
    });
  });
}

// ── FILTER PILLS ─────────────────────────────────────────────
document.querySelectorAll('.filter-pill').forEach(pill => {
  pill.addEventListener('click', () => {
    document.querySelectorAll('.filter-pill').forEach(p => p.classList.remove('active'));
    pill.classList.add('active');
    // All filters are decorative in this prototype — show all products
    renderProducts(PRODUCTS);
  });
});

// ── UTILITY ──────────────────────────────────────────────────
function escHtml(str) {
  if (typeof str !== 'string') return String(str);
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ── INIT ─────────────────────────────────────────────────────
renderProducts(PRODUCTS);
