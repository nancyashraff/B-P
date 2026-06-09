const API = 'http://localhost:3000/api';

async function loadOils(volume = 'all', purpose = 'all') {
  let url = `${API}/products?category=naturaloils`;
  if (volume !== 'all') url += `&volume=${volume}`;
  if (purpose !== 'all') url += `&purpose=${purpose}`;

  const res = await fetch(url);
  const products = await res.json();

  const container = document.querySelector('.oils-container');
  container.innerHTML = products.map(p => `
    <div class="oil-card" onclick="window.location.href='product.html?id=${p._id}'" style="cursor:pointer;">
      <img src="http://localhost:3000/uploads/${p.image}" alt="${p.name}" class="oil-image" onerror="this.onerror=null; this.src='utils/${p.image}';">
      <div class="oil-content">
        <h3>${p.name}</h3>
        <div class="oil-details">
          <span class="volume">${p.volume || ''}</span>
          <p class="price">
  ${p.discount > 0
    ? `<span style="text-decoration:line-through; color:#aaa; font-size:14px;">${p.price} L.E</span>
       <span style="color:var(--gold); margin-left:6px;">${p.finalPrice} L.E</span>
       <span style="background:#fff3cd; color:#856404; border-radius:50px; padding:2px 8px; font-size:11px; margin-left:4px;">${p.discount}% off</span>`
    : `${p.price} L.E`}
</p>
        </div>
        <button class="add-cart-btn" onclick="event.stopPropagation(); addToCart(${JSON.stringify(p._id)}, ${JSON.stringify(p.name)}, ${p.price}, ${JSON.stringify(p.image)})">
          add to cart
        </button>
      </div>
    </div>
  `).join('');
}

function addToCart(productId, name, price, image) {
  let cart = JSON.parse(localStorage.getItem('cart')) || [];
  const existing = cart.find(i => i.productId === productId);

  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({ productId, name, price, image, scent: '', category: 'naturaloils', quantity: 1 });
  }

  localStorage.setItem('cart', JSON.stringify(cart));
  updateCartBadge();
  showToast('Added to cart! 🛍️', 'success');
}

// Filter buttons
document.querySelectorAll('.volume-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.volume-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const purpose = document.querySelector('.purpose-btn.active').dataset.purpose;
    loadOils(btn.dataset.volume, purpose);
  });
});

document.querySelectorAll('.purpose-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.purpose-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const volume = document.querySelector('.volume-btn.active').dataset.volume;
    loadOils(volume, btn.dataset.purpose);
  });
});

function updateCartBadge() {
  const cart = JSON.parse(localStorage.getItem('cart')) || [];
  const count = cart.reduce((sum, i) => sum + i.quantity, 0);
  const badge = document.querySelector('.cart-badge');
  if (badge) badge.textContent = count;
}

document.addEventListener('DOMContentLoaded', updateCartBadge);
loadOils();