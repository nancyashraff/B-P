const API = 'http://localhost:3000/api';

const params = new URLSearchParams(window.location.search);
const productId = params.get('id');
let quantity = 1;

const productImage = document.getElementById('product-image');
const productCategory = document.getElementById('product-category');
const productName = document.getElementById('product-name');
const productTagline = document.getElementById('product-tagline');
const productPrice = document.getElementById('product-price');
const productDiscount = document.getElementById('product-discount');
const productMeta = document.getElementById('product-meta');
const productDescription = document.getElementById('product-description');
const productScentField = document.getElementById('product-scent-field');
const quantityDisplay = document.getElementById('product-quantity');
const addCartBtn = document.getElementById('add-cart-btn');
const buyNowBtn = document.getElementById('buy-now-btn');
const qtyIncrease = document.getElementById('qty-increase');
const qtyDecrease = document.getElementById('qty-decrease');

async function loadProduct() {
  if (!productId) {
    showError('Product ID missing.');
    return;
  }

  try {
    const res = await fetch(`${API}/products/${productId}`);
    if (!res.ok) {
      const data = await res.json();
      showError(data.message || 'Failed to load product');
      return;
    }

    const product = await res.json();
    renderProduct(product);
  } catch (err) {
    showError('Unable to load product data.');
    console.error(err);
  }
}

function renderProduct(product) {
  productImage.innerHTML = `<img src="http://localhost:3000/uploads/${product.image}" alt="${product.name}" onerror="this.onerror=null; this.src='utils/${product.image}';" />`;
  productCategory.textContent = formatCategory(product.category);
  productName.textContent = product.name;
  productTagline.textContent = product.scents && product.scents.length ? `Available scents: ${product.scents.join(', ')}` : ' ';

  const backBtn = document.querySelector('.nav-back');
  if (backBtn && product.category) {
    backBtn.href = `${product.category}.html`;
  }

  const displayPrice = product.finalPrice || product.price;
  productPrice.textContent = `${displayPrice} L.E`;
  if (product.discount > 0) {
    productDiscount.textContent = `${product.discount}% off`;
  } else {
    productDiscount.textContent = '';
  }

  const metaRows = [];
  if (product.size) metaRows.push(`<span>Size: ${product.size}</span>`);
  if (product.volume) metaRows.push(`<span>Volume: ${product.volume}</span>`);
  if (product.gender) metaRows.push(`<span>Gender: ${product.gender}</span>`);
  if (product.category) metaRows.push(`<span>Category: ${formatCategory(product.category)}</span>`);
  productMeta.innerHTML = metaRows.join('<br>');

  const descriptionSection = document.getElementById('product-description-section');
  if (product.description) {
    productDescription.innerHTML = formatDescription(product.description);
    descriptionSection.style.display = 'block';
  } else {
    descriptionSection.style.display = 'none';
  }

  if (product.scents && product.scents.length) {
    productScentField.innerHTML = `
      <select id="scent-select" class="select-field">
        <option value="">Select a scent</option>
        ${product.scents.map(s => `<option value="${s}">${s}</option>`).join('')}
      </select>`;
  } else {
    productScentField.innerHTML = '';
  }

  addCartBtn.addEventListener('click', () => handleAddToCart(product));
  buyNowBtn.addEventListener('click', () => handleBuyNow(product));
}

function formatCategory(category) {
  const names = {
    perfumes: 'Perfumes',
    bodysplash: 'Body Splash',
    naturaloils: 'Natural Oils',
  };
  return names[category] || category || 'Product';
}

function formatDescription(description) {
  const parts = description
    .split('|')
    .map(part => part.replace(/\*\*/g, '').trim())
    .filter(Boolean);

  return parts.map(part => {
    const hasArabic = /[\u0600-\u06FF]/.test(part);
    const dir = hasArabic ? 'rtl' : 'ltr';
    const align = hasArabic ? 'right' : 'left';
    return `<p dir="${dir}" style="text-align:${align}; margin-bottom:1rem;">${escapeHtml(part)}</p>`;
  }).join('');
}

function escapeHtml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function handleAddToCart(product) {
  const scentSelect = document.getElementById('scent-select');
  const scent = scentSelect ? scentSelect.value : '';
  if (scentSelect && !scent) {
    showToast('Please choose a scent before adding to cart.', 'error');
    return;
  }

  addToCart(product, scent);
  showToast('Added to cart! 🛍️', 'success');
}

function handleBuyNow(product) {
  const scentSelect = document.getElementById('scent-select');
  const scent = scentSelect ? scentSelect.value : '';
  if (scentSelect && !scent) {
    showToast('Please choose a scent before buying.', 'error');
    return;
  }

  addToCart(product, scent);
  window.location.href = 'checkout.html';
}

function addToCart(product, scent) {
  const cart = JSON.parse(localStorage.getItem('cart')) || [];
  const existing = cart.find(item => item.productId === product._id && item.scent === scent);
  if (existing) {
    existing.quantity += quantity;
  } else {
    cart.push({
      productId: product._id,
      name: product.name,
      price: product.finalPrice || product.price,
      image: product.image,
      scent,
      category: product.category,
      quantity,
    });
  }
  localStorage.setItem('cart', JSON.stringify(cart));
  updateCartBadge();
}

function showError(message) {
  document.querySelector('.product-details-panel').innerHTML = `<div class="error-box">${message}</div>`;
}

qtyIncrease.addEventListener('click', () => {
  quantity += 1;
  quantityDisplay.textContent = quantity;
});

qtyDecrease.addEventListener('click', () => {
  if (quantity > 1) {
    quantity -= 1;
    quantityDisplay.textContent = quantity;
  }
});

function updateCartBadge() {
  const cart = JSON.parse(localStorage.getItem('cart')) || [];
  const count = cart.reduce((sum, i) => sum + i.quantity, 0);
  const badge = document.querySelector('.cart-badge');
  if (badge) badge.textContent = count;
}

loadProduct();
updateCartBadge();
