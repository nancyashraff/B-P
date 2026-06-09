const orderId  = localStorage.getItem('lastOrderId');
const total    = localStorage.getItem('lastOrderTotal');
const phone    = localStorage.getItem('lastOrderPhone');
const address  = localStorage.getItem('lastOrderAddress');

if (!orderId) {
  window.location.href = 'index.html';
}

// Delivery date = today + 5 days
const deliveryDate = new Date();
deliveryDate.setDate(deliveryDate.getDate() + 5);
const formatted = deliveryDate.toLocaleDateString('en-GB', {
  day: 'numeric', month: 'short', year: 'numeric'
});

document.getElementById('conf-order-id').textContent = `#${orderId.slice(-6).toUpperCase()}`;
const deliveryEl = document.getElementById('conf-delivery-date');
if (deliveryEl) deliveryEl.textContent = formatted;
const phoneEl = document.getElementById('conf-phone');
if (phoneEl) phoneEl.textContent = phone || '-';
const addressEl = document.getElementById('conf-address');
if (addressEl) addressEl.textContent = address || '-';
const totalEl = document.getElementById('conf-total');
if (totalEl) totalEl.textContent = `${total} L.E`;

// Clear order from localStorage after showing
localStorage.removeItem('lastOrderId');
localStorage.removeItem('lastOrderTotal');
localStorage.removeItem('lastOrderPhone');
localStorage.removeItem('lastOrderAddress');