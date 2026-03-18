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

document.getElementById('conf-order-id').textContent     = `#${orderId.slice(-6).toUpperCase()}`;
document.getElementById('conf-delivery-date').textContent = formatted;
document.getElementById('conf-phone').textContent         = phone || '-';
document.getElementById('conf-address').textContent       = address || '-';
document.getElementById('conf-total').textContent         = `${total} L.E`;

// Clear order from localStorage after showing
localStorage.removeItem('lastOrderId');
localStorage.removeItem('lastOrderTotal');
localStorage.removeItem('lastOrderPhone');
localStorage.removeItem('lastOrderAddress');