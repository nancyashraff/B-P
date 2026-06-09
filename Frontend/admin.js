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

async function promptChangePassword() {
  const bodyHtml = `
    <div class="modal-field">
      <label for="admin-cur-pass">Current password</label>
      <input id="admin-cur-pass" type="password" autocomplete="current-password" />
    </div>
    <div class="modal-field">
      <label for="admin-new-pass">New password</label>
      <input id="admin-new-pass" type="password" autocomplete="new-password" />
    </div>
    <div class="modal-field">
      <label for="admin-confirm-pass">Confirm password</label>
      <input id="admin-confirm-pass" type="password" autocomplete="new-password" />
    </div>
  `;

  openAdminModal({
    title: 'Change Admin Password',
    bodyHtml,
    confirmText: 'Save',
    onConfirm: async () => {
      const current = document.getElementById('admin-cur-pass').value.trim();
      const next    = document.getElementById('admin-new-pass').value.trim();
      const confirm = document.getElementById('admin-confirm-pass').value.trim();

      if (!current || !next || !confirm) {
        showAdminMessage('Please complete all fields.', 'error');
        return false;
      }
      if (next !== confirm) {
        showAdminMessage('Passwords do not match.', 'error');
        return false;
      }

      const res = await fetch(`${API}/password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'admin-password': adminPassword
        },
        body: JSON.stringify({ currentPassword: current, newPassword: next })
      });

      if (res.ok) {
        adminPassword = next;
        sessionStorage.setItem('adminPassword', next);
        showAdminMessage('Password changed successfully.', 'success');
        return true;
      }

      const data = await res.json().catch(() => ({}));
      showAdminMessage(data.message || 'Unable to change password.', 'error');
      return false;
    }
  });
}

let adminToastTimeout = null;

function showAdminMessage(message, type = 'success') {
  const toast = document.getElementById('admin-toast');
  toast.textContent = message;
  toast.className = `admin-toast show ${type === 'error' ? 'error' : ''}`;

  clearTimeout(adminToastTimeout);
  adminToastTimeout = setTimeout(() => {
    toast.classList.remove('show');
  }, 3200);
}

function openAdminModal({ title, bodyHtml, confirmText = 'Confirm', cancelText = 'Cancel', onConfirm, showCancel = true }) {
  const modal = document.getElementById('admin-modal');
  const titleEl = document.getElementById('admin-modal-title');
  const bodyEl = document.getElementById('admin-modal-body');
  const confirmBtn = document.getElementById('admin-modal-confirm');
  const cancelBtn = modal.querySelector('.modal-cancel');

  titleEl.textContent = title;
  bodyEl.innerHTML = bodyHtml;
  confirmBtn.textContent = confirmText;
  cancelBtn.textContent = cancelText;
  cancelBtn.style.display = showCancel ? 'inline-flex' : 'none';

  confirmBtn.onclick = async () => {
    const shouldClose = await onConfirm();
    if (shouldClose !== false) {
      closeAdminModal();
    }
  };

  modal.classList.remove('hidden');
}

function closeAdminModal() {
  const modal = document.getElementById('admin-modal');
  const confirmBtn = document.getElementById('admin-modal-confirm');
  modal.classList.add('hidden');
  confirmBtn.onclick = null;
}

function showAdminConfirm(message, onConfirm) {
  openAdminModal({
    title: 'Confirm Action',
    bodyHtml: `<div class="modal-message">${message}</div>`,
    confirmText: 'Yes, continue',
    cancelText: 'Cancel',
    onConfirm: async () => {
      await onConfirm();
      return true;
    }
  });
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
    loadProducts(),
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
  tbody.innerHTML = orders.map(o => {
    const addressParts = [o.address?.governorate, o.address?.street, o.address?.building, o.address?.apartment].filter(Boolean);
    const address = addressParts.length ? addressParts.join(', ') : '-';
    const created  = new Date(o.createdAt).toLocaleString('en-GB');
    const itemsHtml = (Array.isArray(o.items) ? o.items : []).map(item => `
      <div class="order-item">
        <img src="http://localhost:3000/uploads/${item.image}" alt="${item.name}" class="order-item-image" onerror="this.src='https://via.placeholder.com/60'" />
        <div class="order-item-meta">
          <div class="order-item-name">${item.name || 'Unnamed product'}</div>
          <div class="order-item-detail">${item.category || 'Product'} · ${item.scent || 'No scent'} · ${item.quantity} × ${item.price} L.E</div>
        </div>
        <div class="order-item-total">${(item.quantity || 0) * (item.price || 0)} L.E</div>
      </div>
    `).join('');

    return `
      <tr class="order-row">
        <td>#${o._id.slice(-6).toUpperCase()}</td>
        <td>${o.email}</td>
        <td>${o.phone}</td>
        <td>${address}</td>
        <td>${o.total} L.E</td>
        <td>${created}</td>
        <td><button class="toggle-btn" onclick="toggleOrderDetails('${o._id}')">Details</button></td>
      </tr>
      <tr class="order-details-row hidden" id="order-details-${o._id}">
        <td colspan="7">
          <div class="order-details-card">
            <div class="order-detail-section">
              <div><strong>Status:</strong> <span class="status-badge status-${o.status || 'pending'}">${o.status || 'pending'}</span></div>
              <div><strong>Created:</strong> ${created}</div>
              <div><strong>Tracking:</strong> ${o.trackingNumber || '-'}</div>
              <div><strong>Address:</strong> ${address}</div>
            </div>
            <div><strong>Ordered products:</strong></div>
            ${itemsHtml || '<div class="order-item-empty">No products were saved with this order.</div>'}
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

function toggleOrderDetails(orderId) {
  const detailsRow = document.getElementById(`order-details-${orderId}`);
  if (detailsRow) {
    detailsRow.classList.toggle('hidden');
  }
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

// ── LOAD PRODUCTS ──
async function loadProducts() {
  const res      = await fetch(`${API}/products`, { headers: { 'admin-password': adminPassword } });
  const products = await res.json();

  const tbody = document.getElementById('products-list');
  tbody.innerHTML = products.map(p => `
    <tr>
      <td>
        <img src="http://localhost:3000/uploads/${p.image}" 
             style="width:50px; height:50px; object-fit:cover; border-radius:4px;" 
             onerror="this.src='https://via.placeholder.com/50'">
      </td>
      <td>${p.name}</td>
      <td>${p.category}</td>
      <td>${p.price} L.E</td>
      <td>
        ${p.discount > 0
          ? `<span class="discount-badge">${p.discount}% off</span>`
          : '-'}
      </td>
      <td style="color: var(--gold); font-weight:700;">
        ${p.finalPrice || p.price} L.E
      </td>
      <td>
        <button class="stock-btn ${p.inStock ? 'in-stock' : 'out-stock'}"
          onclick="toggleStock('${p._id}')">
          ${p.inStock ? '✓ In Stock' : '✗ Out of Stock'}
        </button>
      </td>
      <td>
        <button class="edit-btn" onclick="editProduct('${p._id}')">Edit</button>
        <button class="delete-btn" onclick="deleteProduct('${p._id}')">Delete</button>
      </td>
    </tr>
  `).join('');
}

// ── PREVIEW IMAGE ──
function previewImage(input) {
  const file    = input.files[0];
  const preview = document.getElementById('image-preview');

  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      preview.innerHTML = `<img src="${e.target.result}" />`;
    };
    reader.readAsDataURL(file);
  }
}

// ── UPLOAD IMAGE TO SERVER ──
async function uploadImage() {
  const fileInput = document.getElementById('p-image-file');
  const file      = fileInput.files[0];
  if (!file) return null;

  const formData = new FormData();
  formData.append('image', file);

  const res  = await fetch(`${API}/upload`, {
    method:  'POST',
    headers: { 'admin-password': adminPassword },
    body:    formData
  });

  const data = await res.json();
  return data.filename;
}

// ── UPDATE saveProduct to upload image first ──
async function saveProduct() {
  const id = document.getElementById('edit-product-id').value;

  // Upload image if a new file was selected
  const fileInput = document.getElementById('p-image-file');
  let imageName   = document.getElementById('p-image').value;

  if (fileInput.files[0]) {
    const uploaded = await uploadImage();
    if (uploaded) imageName = uploaded;
  }

  if (!imageName) {
    showAdminMessage('Please upload a product image.', 'error');
    return;
  }

  const scentsRaw = document.getElementById('p-scents').value;
  const scents    = scentsRaw ? scentsRaw.split(',').map(s => s.trim()).filter(Boolean) : [];

  const data = {
    name:        document.getElementById('p-name').value.trim(),
    price:       Number(document.getElementById('p-price').value),
    discount:    Number(document.getElementById('p-discount').value) || 0,
    category:    document.getElementById('p-category').value,
    image:       imageName,
    size:        document.getElementById('p-size').value.trim(),
    gender:      document.getElementById('p-gender').value || undefined,
    volume:      document.getElementById('p-volume').value.trim(),
    description: document.getElementById('p-description').value.trim(),
    scents,
  };

  if (!data.name || !data.price || !data.category) {
    showAdminMessage('Name, price and category are required.', 'error');
    return;
  }

  const url    = id ? `${API}/products/${id}` : `${API}/products`;
  const method = id ? 'PUT' : 'POST';

  const res = await fetch(url, {
    method,
    headers: {
      'Content-Type':   'application/json',
      'admin-password': adminPassword
    },
    body: JSON.stringify(data)
  });

  if (res.ok) {
    clearForm();
    loadProducts();
    showAdminMessage(id ? 'Product updated!' : 'Product added!', 'success');
  } else {
    const err = await res.json();
    showAdminMessage(err.message || 'Unable to save product.', 'error');
  }
}

async function editProduct(id) {
  const res     = await fetch(`http://localhost:3000/api/products/${id}`);
  const product = await res.json();

  document.getElementById('edit-product-id').value  = product._id;
  document.getElementById('p-name').value           = product.name;
  document.getElementById('p-price').value          = product.price;
  document.getElementById('p-discount').value       = product.discount || 0;
  document.getElementById('p-category').value       = product.category;
  document.getElementById('p-image').value          = product.image || '';
  document.getElementById('p-size').value           = product.size || '';
  document.getElementById('p-gender').value         = product.gender || '';
  document.getElementById('p-volume').value         = product.volume || '';
  document.getElementById('p-description').value    = product.description || '';
  document.getElementById('p-scents').value         = (product.scents || []).join(', ');

  // Show existing image preview
  // Change this line in editProduct
if (product.image) {
  // Use the full API URL to ensure the browser finds the image
  const imageUrl = `http://localhost:3000/uploads/${product.image}`; 
  document.getElementById('image-preview').innerHTML =
    `<img src="${imageUrl}" style="width:100%;height:100%;object-fit:cover;" />`;
}

  document.getElementById('cancel-edit-btn').style.display = 'inline-block';
  document.querySelector('.product-form-wrap').scrollIntoView({ behavior: 'smooth' });
}

// ── DELETE PRODUCT ──
async function deleteProduct(id) {
  showAdminConfirm('Are you sure you want to delete this product?', async () => {
    const res = await fetch(`${API}/products/${id}`, {
      method:  'DELETE',
      headers: { 'admin-password': adminPassword }
    });

    if (res.ok) {
      closeAdminModal();
      loadProducts();
      showAdminMessage('Product deleted!', 'success');
    } else {
      const err = await res.json().catch(() => ({}));
      showAdminMessage(err.message || 'Unable to delete product.', 'error');
    }
  });
}

// ── TOGGLE STOCK ──
async function toggleStock(id) {
  await fetch(`${API}/products/${id}/stock`, {
    method:  'PUT',
    headers: { 'admin-password': adminPassword }
  });
  loadProducts();
}

// ── UPDATE clearForm to reset image ──
function clearForm() {
  document.getElementById('edit-product-id').value      = '';
  document.getElementById('p-name').value               = '';
  document.getElementById('p-price').value              = '';
  document.getElementById('p-discount').value           = '0';
  document.getElementById('p-category').value          = 'perfumes';
  document.getElementById('p-image').value              = '';
  document.getElementById('p-image-file').value         = '';
  document.getElementById('image-preview').innerHTML    = '<span>Click to upload image</span>';
  document.getElementById('p-size').value               = '';
  document.getElementById('p-gender').value             = '';
  document.getElementById('p-volume').value             = '';
  document.getElementById('p-description').value        = '';
  document.getElementById('p-scents').value             = '';
  document.getElementById('cancel-edit-btn').style.display = 'none';
}

//http://127.0.0.1:5500/Frontend/admin.html