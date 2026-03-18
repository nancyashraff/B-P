const API = 'http://localhost:3000/api';

async function loadPerfumes(size = 'all', gender = 'all') {
  let url = `${API}/products?category=perfumes`;
  if (size !== 'all')   url += `&size=${size}`;
  if (gender !== 'all') url += `&gender=${gender}`;

  const res      = await fetch(url);
  const products = await res.json();

  const grid = document.querySelector('.perfumes-grid');
  grid.innerHTML = products.map(p => `
    <div class="perfume-card" data-size="${p.size}" data-gender="${p.gender}">
      <div class="perfume-image">
        <img src="../utils/${p.image}" alt="${p.name}" />
      </div>
      <div class="perfume-info">
        <h3 class="perfume-name">${p.name}</h3>
        <p class="perfume-price">${p.price} L.E</p>
      </div>
      <select class="scent-select" id="scent-${p._id}">
        <option>SELECT SCENT</option>
        ${p.scents.map(s => `<option>${s}</option>`).join('')}
      </select>
      <button class="add-to-cart-btn" onclick="addToCart('${p._id}', '${p.name}', ${p.price}, '${p.image}', '${p.category}', '${p.gender}', '${p.size}')">
        add to cart
      </button>
    </div>
  `).join('');
}

function addToCart(productId, name, price, image, category, gender, size) {
  const selectedScent = document.querySelector(`#scent-${productId}`)?.value;

  if (!selectedScent || selectedScent === 'SELECT SCENT') {
    showToast('Please select a scent first', 'error');
    return;
  }

  let cart = JSON.parse(localStorage.getItem('cart')) || [];
  const existing = cart.find(i => i.productId === productId && i.scent === selectedScent);

  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({ productId, name, price, image, scent: selectedScent, category, gender, size, quantity: 1 });
  }

  localStorage.setItem('cart', JSON.stringify(cart));
  updateCartBadge();
  showToast('Added to cart! 🛍️', 'success');
}

// Filter buttons
document.querySelectorAll('.size-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.size-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const gender = document.querySelector('.gender-btn.active').dataset.gender;
    loadPerfumes(btn.dataset.size, gender);
  });
});

document.querySelectorAll('.gender-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.gender-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const size = document.querySelector('.size-btn.active').dataset.size;
    loadPerfumes(size, btn.dataset.gender);
  });
});

function updateCartBadge() {
  const cart  = JSON.parse(localStorage.getItem('cart')) || [];
  const count = cart.reduce((sum, i) => sum + i.quantity, 0);
  const badge = document.querySelector('.cart-badge');
  if (badge) badge.textContent = count;
}

document.addEventListener('DOMContentLoaded', updateCartBadge);
loadPerfumes();