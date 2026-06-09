const API = 'http://localhost:3000/api';

document.addEventListener('DOMContentLoaded', () => {

  // ── CART BADGE ──
  function updateCartBadge() {
    const cart  = JSON.parse(localStorage.getItem('cart')) || [];
    const count = cart.reduce((sum, i) => sum + i.quantity, 0);
    const badge = document.querySelector('.cart-badge');
    if (badge) badge.textContent = count;
  }

  updateCartBadge();

  // ── SEARCH ──
  const searchInput   = document.getElementById('search-input');
  const searchResults = document.getElementById('search-results');
  const searchClear   = document.getElementById('search-clear');

  if (!searchInput) return; // safety check

  let searchTimeout;

  searchInput.addEventListener('input', () => {
    const query = searchInput.value.trim();
    searchClear.style.display = query ? 'block' : 'none';
    clearTimeout(searchTimeout);

    if (!query) {
      searchResults.style.display = 'none';
      return;
    }

    searchTimeout = setTimeout(() => searchProducts(query), 300);
  });

  searchClear.addEventListener('click', () => {
    searchInput.value           = '';
    searchClear.style.display   = 'none';
    searchResults.style.display = 'none';
    searchInput.focus();
  });

  document.addEventListener('click', (e) => {
    if (!e.target.closest('.search-wrap')) {
      searchResults.style.display = 'none';
    }
  });

  async function searchProducts(query) {
    try {
      const res      = await fetch(`${API}/products/search?q=${encodeURIComponent(query)}`);
      const products = await res.json();

      if (!Array.isArray(products) || !products.length) {
        searchResults.innerHTML = `
          <div class="search-no-results">
            no results found for "<strong>${query}</strong>"<br>
            <span style="font-size:11px; margin-top:4px; display:block;">
              try: perfumes · body splash · natural oils · sauvage · 60ml · women
            </span>
          </div>`;
        searchResults.style.display = 'block';
        return;
      }

      searchResults.innerHTML = products.map(p => `
        <a href="product.html?id=${p._id}" class="search-result-item">
          <img src="http://localhost:3000/uploads/${p.image}" alt="${p.name}" class="search-result-img"
            onerror="this.onerror=null; this.src='utils/${p.image}';" />
          <div class="search-result-info">
            <div class="search-result-name">${highlightMatch(p.name, query)}</div>
            <div class="search-result-category">${formatCategory(p.category)}
              ${p.scents ? getScentMatch(p.scents, query) : ''}
            </div>
          </div>
          <div class="search-result-price">${p.price} L.E</div>
        </a>
      `).join('');

      searchResults.style.display = 'block';
    } catch (err) {
      console.error('Search error:', err);
    }
  }

  function highlightMatch(text, query) {
    const regex = new RegExp(`(${query})`, 'gi');
    return text.replace(regex, '<mark style="background:#e2c99a; border-radius:2px; padding:0 2px;">$1</mark>');
  }

  function formatCategory(category) {
    const names = {
      perfumes:    '🌸 Perfumes',
      bodysplash:  '💧 Body Splash',
      naturaloils: '🌿 Natural Oils',
    };
    return names[category] || category;
  }

  function getScentMatch(scents, query) {
    if (!scents || !scents.length) return '';
    const match = scents.find(s => s.toLowerCase().includes(query.toLowerCase()));
    return match ? `· <span style="color:#c8a96e">${match}</span>` : '';
  }

  function getCategoryPage(category) {
    const pages = {
      perfumes:    'perfumes.html',
      bodysplash:  'bodysplash.html',
      naturaloils: 'naturaloils.html',
    };
    return pages[category] || 'index.html';
  }

});