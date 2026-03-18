const API = 'http://localhost:3000/api';

async function loadBodySplash() {
  const res = await fetch(`${API}/products?category=bodysplash`);
  const products = await res.json();

  const container = document.querySelector('.splash-container');
  container.innerHTML = products.map(p => `
    <div class="splash-card">
      <img src="../utils/${p.image}" alt="${p.name}" class="splash-image">
      <div class="splash-content">
        <h3>${p.name}</h3>
        <p class="description">${p.description}</p>
        <div class="splash-details">
          <span class="size">${p.size}</span>
          <span class="price">${p.price} L.E</span>
        </div>
        <button class="add-cart-btn" onclick="addToCart('${p._id}', '${p.name}', ${p.price},    '${p.image}', '${p.description}')">add to cart</button>
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