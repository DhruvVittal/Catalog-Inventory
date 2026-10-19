const detailCard = document.querySelector("#product-detail");
const productId = new URLSearchParams(window.location.search).get("id");

function formatAmount(value) {
  return (Number(value) || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

async function loadProduct() {
  if (!productId || !/^\d+$/.test(productId)) {
    showError("No valid product ID was provided.");
    return;
  }

  try {
    const response = await fetch(`/api/products/${encodeURIComponent(productId)}`);
    if (!response.ok) {
      if (response.status === 404) throw new Error("This product could not be found.");
      throw new Error(`Could not load product (HTTP ${response.status}).`);
    }
    const product = await response.json();
    renderProduct(product);
  } catch (error) {
    showError(error.message || "Could not load product details. Check that the application is running.");
  }
}

function renderProduct(product) {
  const quantity = Number(product.quantity) || 0;
  const status = quantity === 0 ? "Out of stock" : quantity <= 10 ? "Low stock" : "In stock";
  detailCard.innerHTML = `
    <div class="detail-topline"><span class="section-kicker">PRODUCT · ID ${escapeHtml(product.id)}</span><span class="detail-stock ${quantity <= 10 ? "detail-low" : ""}">${status}</span></div>
    <div class="detail-title-row"><span class="detail-avatar" aria-hidden="true">${escapeHtml((product.name || "?").trim().charAt(0) || "?")}</span><div><h1>${escapeHtml(product.name || "Unnamed product")}<span class="title-period">.</span></h1><p class="page-subtitle">Catalog item details</p></div></div>
    <div class="detail-metrics">
      <article><span>UNIT PRICE</span><strong>${formatAmount(product.price)}</strong></article>
      <article><span>QUANTITY</span><strong>${quantity.toLocaleString()}</strong></article>
      <article><span>RATING</span><strong>★ ${escapeHtml(product.rating ?? 0)} <small>/ 5</small></strong></article>
      <article><span>STOCK VALUE</span><strong>${formatAmount((Number(product.price) || 0) * quantity)}</strong></article>
    </div>
    <div class="detail-actions"><a class="button button-secondary" href="/">← Back to catalog</a><a class="button button-primary" href="/learning.html">Explore the code</a></div>`;
}

function showError(message) {
  detailCard.innerHTML = `<div class="detail-error"><span class="empty-icon">!</span><strong>Product unavailable</strong><p>${escapeHtml(message)}</p><a class="button button-secondary" href="/">Return to catalog</a></div>`;
}

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  })[character]);
}

loadProduct();
