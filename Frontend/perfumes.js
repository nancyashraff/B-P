const API = 'http://localhost:3000/api';

async function loadPerfumes(size = 'all', gender = 'all') {
  let url = `${API}/products?category=perfumes`;
  if (size !== 'all')   url += `&size=${size}`;
  if (gender !== 'all') url += `&gender=${gender}`;

  const res      = await fetch(url);
  const products = await res.json();

  const grid = document.querySelector('.perfumes-grid');
  grid.innerHTML = products.map(p => `
    <div class="perfume-card" data-size="${p.size}" data-gender="${p.gender}" onclick="window.location.href='product.html?id=${p._id}'" style="cursor:pointer;">
      <div class="perfume-image">
          <img src="http://localhost:3000/uploads/${p.image}" alt="${p.name}" onerror="this.onerror=null; this.src='utils/${p.image}';" />
        </div>
      <div class="perfume-info">
        <h3 class="perfume-name">${p.name}</h3>
        <p class="perfume-price">
    ${p.discount > 0
    ? `<span style="text-decoration:line-through; color:#aaa; font-size:14px;">${p.price} L.E</span>
       <span style="color:var(--gold); margin-left:6px;">${p.finalPrice} L.E</span>
       <span style="background:#fff3cd; color:#856404; border-radius:50px; padding:2px 8px; font-size:11px; margin-left:4px;">${p.discount}% off</span>`
    : `${p.price} L.E`}
  </p>
      </div>
      <select class="scent-select" id="scent-${p._id}">
        <option>SELECT SCENT</option>
        ${p.scents.map(s => `<option>${s}</option>`).join('')}
      </select>
      <button class="add-to-cart-btn" onclick="event.stopPropagation(); addToCart(${JSON.stringify(p._id)}, ${JSON.stringify(p.name)}, ${p.price}, ${JSON.stringify(p.image)}, ${JSON.stringify(p.category)}, ${JSON.stringify(p.gender)}, ${JSON.stringify(p.size)})">
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