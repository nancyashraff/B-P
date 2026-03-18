const API = 'http://localhost:3000/api/admin';
let adminPassword = '';

// ── LOGIN ──
async function adminLogin() {
  const password = document.getElementById('admin-password').value;
  const errorEl  = document.getElementById('login-error');

  const res = await fetch(`${API}/stats`, {
    headers: { 'admin-password': password }
  });

  if (res.ok) {
    adminPassword = password;
    sessionStorage.setItem('adminPassword', password);
    document.getElementById('login-screen').style.display = 'none';
    document.getElementById('dashboard').style.display    = 'block';
    loadDashboard();
  } else {
    errorEl.textContent = 'Incorrect password. Try again.';
    setTimeout(() => errorEl.textContent = '', 3000);
  }
}

function logout() {
  sessionStorage.removeItem('adminPassword');
  adminPassword = '';
  document.getElementById('login-screen').style.display = 'flex';
  document.getElementById('dashboard').style.display    = 'none';
  document.getElementById('admin-password').value       = '';
}

// Allow pressing Enter to login
document.getElementById('admin-password').addEventListener('keydown', (e) => {
  if (e.key === 'Enter') adminLogin();
});

// Auto login if session exists
window.addEventListener('DOMContentLoaded', () => {
  const saved = sessionStorage.getItem('adminPassword');
  if (saved) {
    adminPassword = saved;
    document.getElementById('login-screen').style.display = 'none';
    document.getElementById('dashboard').style.display    = 'block';
    loadDashboard();
  }
});

// ── LOAD ALL DATA ──
async function loadDashboard() {
  await Promise.all([
    loadStats(),
    loadCategoryStats(),
    loadTopProducts(),
    loadOrders(),
  ]);
}

// ── OVERVIEW STATS ──
async function loadStats() {
  const res  = await fetch(`${API}/stats`, { headers: { 'admin-password': adminPassword } });
  const data = await res.json();

  document.getElementById('total-orders').textContent  = data.totalOrders;
  document.getElementById('total-revenue').textContent = `${data.totalRevenue} L.E`;
  document.getElementById('avg-order').textContent     = `${data.avgOrderValue} L.E`;
}

// ── CATEGORY STATS ──
async function loadCategoryStats() {
  const res  = await fetch(`${API}/by-category`, { headers: { 'admin-password': adminPassword } });
  const data = await res.json();

  const categoryNames = {
    perfumes:    '🌸 Perfumes',
    bodysplash:  '💧 Body Splash',
    naturaloils: '🌿 Natural Oils',
  };

  const container = document.getElementById('category-stats');
  container.innerHTML = Object.entries(data).map(([cat, stats]) => `
    <div class="cat-stat-card">
      <div class="cat-stat-name">${categoryNames[cat] || cat}</div>
      <div class="cat-stat-row">
        <span>Revenue</span>
        <span>${stats.revenue} L.E</span>
      </div>
      <div class="cat-stat-row">
        <span>Units Sold</span>
        <span>${stats.quantity}</span>
      </div>
      <div class="cat-stat-row">
        <span>Orders</span>
        <span>${stats.orders}</span>
      </div>
    </div>
  `).join('');
}

// ── TOP PRODUCTS ──
async function loadTopProducts() {
  const res      = await fetch(`${API}/top-products`, { headers: { 'admin-password': adminPassword } });
  const products = await res.json();

  const tbody = document.getElementById('top-products');
  tbody.innerHTML = products.map((p, i) => `
    <tr>
      <td>${i + 1}</td>
      <td>${p.name}</td>
      <td>${p.category}</td>
      <td>${p.quantity}</td>
      <td>${p.revenue} L.E</td>
    </tr>
  `).join('');
}

// ── ALL ORDERS ──
async function loadOrders() {
  const res    = await fetch(`${API}/orders`, { headers: { 'admin-password': adminPassword } });
  const orders = await res.json();

  const tbody = document.getElementById('orders-list');
  tbody.innerHTML = orders.map(o => `
    <tr>
      <td>#${o._id.slice(-6).toUpperCase()}</td>
      <td>${o.email}</td>
      <td>${o.phone}</td>
      <td>${o.address?.governorate || '-'}, ${o.address?.street || ''}</td>
      <td>${o.total} L.E</td>
      </td>
      <td>${new Date(o.createdAt).toLocaleDateString('en-GB')}</td>
    </tr>
  `).join('');
}

// ── UPDATE ORDER STATUS ──
async function updateStatus(orderId, status) {
  await fetch(`${API}/orders/${orderId}/status`, {
    method:  'PUT',
    headers: {
      'Content-Type':   'application/json',
      'admin-password': adminPassword
    },
    body: JSON.stringify({ status })
  });
}

//http://127.0.0.1:5500/Frontend/admin.html