const SHIPPING = 80;

function getCart() {
  return JSON.parse(localStorage.getItem('cart')) || [];
}

function loadCart() {
  const cart = getCart();
  const container = document.querySelector('.cart-items');

  if (cart.length === 0) {
    container.innerHTML = `
      <div style="text-align:center; padding: 40px; font-family: 'Josefin Sans', sans-serif; color: #888;">
        your cart is empty
      </div>`;
    updateSummary(0);
    return;
  }

  container.innerHTML = cart.map((item, index) => `
    <div class="cart-item" data-index="${index}">
      <div class="item-image">
        <img src="../utils/${item.image}" alt="${item.name}" />
      </div>
      <div class="item-details">
        <h3 class="item-name">${item.name}</h3>
        <p class="item-description">${item.scent || ''}</p>
      </div>
      <div class="item-quantity">
        <button class="qty-btn" onclick="changeQty(${index}, -1)">−</button>
        <span class="qty-display">${item.quantity}</span>
        <button class="qty-btn" onclick="changeQty(${index}, +1)">+</button>
      </div>
      <div class="item-price">${item.price * item.quantity} L.E</div>
      <button class="remove-btn" onclick="removeItem(${index})">×</button>
    </div>
  `).join('');

  const subtotal = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);
  updateSummary(subtotal);
}

function updateSummary(subtotal) {
  document.getElementById('subtotal').textContent = `${subtotal} L.E`;
  document.getElementById('total').textContent    = `${subtotal + SHIPPING} L.E`;
}

function changeQty(index, change) {
  let cart = getCart();
  cart[index].quantity += change;
  if (cart[index].quantity < 1) {
    cart.splice(index, 1);
  }
  localStorage.setItem('cart', JSON.stringify(cart));
  loadCart();
  updateCartBadge();
}

function removeItem(index) {
  let cart = getCart();
  cart.splice(index, 1);
  localStorage.setItem('cart', JSON.stringify(cart));
  loadCart();
  updateCartBadge();
}

function updateCartBadge() {
  const cart  = getCart();
  const count = cart.reduce((sum, i) => sum + i.quantity, 0);
  const badge = document.querySelector('.cart-badge');
  if (badge) badge.textContent = count;
}

// ── PROCEED TO CHECKOUT ──
function proceedToCheckout() {
  const cart = getCart();
  if (cart.length === 0) {
    showToast('Your cart is empty! Add products first.', 'error');
    return;
  }
  window.location.href = 'checkout.html';
}

document.addEventListener('DOMContentLoaded', () => {
  loadCart();
  updateCartBadge();
});