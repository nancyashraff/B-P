const API = 'http://localhost:3000/api';
let deliveryPrice = 80;

function getCart() {
  return JSON.parse(localStorage.getItem('cart')) || [];
}

function loadSummary() {
  const cart     = getCart();
  const subtotal = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const total    = subtotal + deliveryPrice;

  document.querySelector('.payment-summary .summary-row:nth-child(1) .summary-value').textContent = `${subtotal} L.E`;
  document.querySelector('.summary-row:nth-child(2) .summary-value').textContent                  = `${deliveryPrice} L.E`;
  document.querySelector('.summary-row.total .summary-value').textContent                         = `${total} L.E`;

  return total;
}

// ── CHECK CART ON PAGE LOAD ──
document.addEventListener('DOMContentLoaded', () => {
  const cart = getCart();
  if (cart.length === 0) {
    showPopup('Your cart is empty! Add products first.', 'error');
    setTimeout(() => {
      window.location.href = 'index.html';
    }, 2000);
    return;
  }
  loadSummary();
});

// ── SEND OTP ──
document.getElementById('send-otp-btn').addEventListener('click', async () => {
  const email = document.getElementById('email').value.trim();
  if (!email) { showPopup('Please enter your email', 'error'); return; }

  const btn = document.getElementById('send-otp-btn');
  btn.textContent = 'Sending...';
  btn.disabled    = true;

  const res  = await fetch(`${API}/otp/request`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ email })
  });

  const data = await res.json();

  if (res.ok) {
    document.getElementById('otp-section').style.display = 'block';
    btn.textContent = 'Resend OTP';
    btn.disabled    = false;
    showPopup('OTP sent! Check your email ✓', 'success');
    // mark that OTP was sent so confirm requires it
    localStorage.setItem('otpSent', '1');
  } else {
    showPopup(data.message, 'error');
    btn.textContent = 'Send OTP';
    btn.disabled    = false;
  }
});

// ── CONFIRM ORDER ──
document.querySelector('.confirm-btn').addEventListener('click', async () => {
  const cart = getCart();
  if (cart.length === 0) {
    showPopup('Your cart is empty!', 'error');
    return;
  }

  // Require that an OTP was requested before confirming
  if (!localStorage.getItem('otpSent')) {
    showPopup('Please request an OTP before confirming your order.', 'error');
    return;
  }

  const email       = document.getElementById('email').value.trim();
  const phone       = document.getElementById('phone').value.trim();
  const otp         = document.getElementById('otp').value.trim();
  const governorate = document.getElementById('governorate').value.trim();
  const street      = document.getElementById('street').value.trim();
  const building    = document.getElementById('building').value.trim();
  const apartment   = document.getElementById('apartment').value.trim();

  if (!email || !phone || !otp || !governorate || !street || !building || !apartment) {
    showPopup('Please fill in all fields and enter your OTP', 'error');
    return;
  }

  const total = loadSummary();

  const res = await fetch(`${API}/otp/verify`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({
      email, otp, phone,
      address:   { governorate, street, building, apartment },
      cartItems: cart,
      total
    })
  });

  const order = await res.json();

  if (res.ok) {
    // Prefer canonical values from server response when available
    localStorage.setItem('lastOrderId',      order._id);
    localStorage.setItem('lastOrderTotal',   order.total ?? total);
    localStorage.setItem('lastOrderPhone',   order.phone || phone || '-');
    // Compose a full address string from server response or from the form
    const addrObj = order.address || { governorate, street, building, apartment };
    const fullAddress = `${addrObj.governorate || ''}${addrObj.street ? ', ' + addrObj.street : ''}${addrObj.building ? ', ' + addrObj.building : ''}${addrObj.apartment ? ', ' + addrObj.apartment : ''}`.replace(/^,\s*/, '').trim();
    localStorage.setItem('lastOrderAddress', fullAddress || '-');
    localStorage.removeItem('cart');
    // clear OTP sent flag after successful order
    localStorage.removeItem('otpSent');
    window.location.href = 'confirmation.html';
  } else {
    showPopup(order.message || 'Something went wrong', 'error');
  }
});

// ── DELIVERY PRICE BY CITY ──
document.getElementById('governorate').addEventListener('blur', async () => {
  const city = document.getElementById('governorate').value.trim();
  if (!city) return;

  try {
    const res  = await fetch(`${API}/orders/delivery-price/${city}`);
    const data = await res.json();

    if (data.priceAfterVat || data.price) {
      deliveryPrice = data.priceAfterVat || data.price;
      loadSummary();
      showPopup(`Delivery to ${city}: ${deliveryPrice} L.E`, 'success');
    }
  } catch (err) {
    console.log('Could not fetch delivery price, using default');
  }
});