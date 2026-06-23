const API = 'https://b-p-kappa.vercel.app/api';

async function loadBodySplash() {
  const res = await fetch(`${API}/products?category=bodysplash`);
  const products = await res.json();

  const container = document.querySelector('.splash-container');
  container.innerHTML = products.map(p => `
    <div class="splash-card" onclick="window.location.href='product.html?id=${p._id}'" style="cursor:pointer;">
      <img src="https://b-p-kappa.vercel.app/uploads/${p.image}" alt="${p.name}" class="splash-image" onerror="this.onerror=null; this.src='utils/${p.image}';">
      <div class="splash-content">
        <h3>${p.name}</h3>
        <div class="splash-details">
          <span class="size">${p.size}</span>
          <p class="price">
  ${p.discount > 0
    ? `<span style="text-decoration:line-through; color:#aaa; font-size:14px;">${p.price} L.E</span>
       <span style="color:var(--gold); margin-left:6px;">${p.finalPrice} L.E</span>
       <span style="background:#fff3cd; color:#856404; border-radius:50px; padding:2px 8px; font-size:11px; margin-left:4px;">${p.discount}% off</span>`
    : `${p.price} L.E`}
</p>
        </div>
        <button class="add-cart-btn" onclick="event.stopPropagation(); addToCart(${JSON.stringify(p._id)}, ${JSON.stringify(p.name)}, ${p.price}, ${JSON.stringify(p.image)}, ${JSON.stringify(p.description || '')})">add to cart</button>
      </div>
    </div>
  `).join('');
}

function addToCart(productId, name, price, image, description) {
  let cart = JSON.parse(localStorage.getItem('cart')) || [];
  const existing = cart.find(i => i.productId === productId);

  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({ productId, name, price, image, scent: description, category: 'bodysplash', quantity: 1 });
  }

  localStorage.setItem('cart', JSON.stringify(cart));
  updateCartBadge();
  showToast('Added to cart! 🛍️', 'success');
}

function updateCartBadge() {
  const cart = JSON.parse(localStorage.getItem('cart')) || [];
  const count = cart.reduce((sum, i) => sum + i.quantity, 0);
  const badge = document.querySelector('.cart-badge');
  if (badge) badge.textContent = count;
}

document.addEventListener('DOMContentLoaded', updateCartBadge);

loadBodySplash();