const API_URL = "/api/products";

const rows = document.querySelector("#product-rows");
const searchInput = document.querySelector("#search");
const dialog = document.querySelector("#product-dialog");
const form = document.querySelector("#product-form");
const formError = document.querySelector("#form-error");
const toast = document.querySelector("#toast");
const apiIndicator = document.querySelector("#api-indicator");
const apiStatus = document.querySelector("#api-status");

let products = [];
let editingProductId = null;
let toastTimer;

function setApiStatus(connected) {
  apiIndicator.classList.toggle("connected", connected);
  apiIndicator.classList.toggle("disconnected", !connected);
  apiStatus.textContent = connected ? "API connected" : "API unavailable";
}

function showToast(message, isError = false) {
  window.clearTimeout(toastTimer);
  toast.textContent = message;
  toast.classList.toggle("error", isError);
  toast.classList.add("show");
  toastTimer = window.setTimeout(() => toast.classList.remove("show"), 3200);
}

async function apiRequest(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...options.headers,
    },
  });

  if (!response.ok) {
    let message = `Request failed (${response.status})`;
    try {
      const errorBody = await response.json();
      message = errorBody.message || errorBody.error || message;
    } catch {
      // Keep the status-based message if the response is not JSON.
    }
    throw new Error(message);
  }

  if (response.status === 204) return null;
  const contentType = response.headers.get("content-type") || "";
  return contentType.includes("application/json") ? response.json() : response.text();
}

async function loadProducts() {
  rows.innerHTML = '<tr><td colspan="5" class="state-cell"><span class="loader"></span> Loading products…</td></tr>';
  try {
    products = await apiRequest(API_URL);
    setApiStatus(true);
    renderProducts();
  } catch (error) {
    products = [];
    setApiStatus(false);
    updateStats();
    rows.innerHTML = `<tr><td colspan="5" class="state-cell"><div class="empty-state"><span class="empty-icon">!</span><strong>Could not load products</strong><span>${escapeHtml(error.message)}. Check that the app is running, then refresh.</span></div></td></tr>`;
    document.querySelector("#visible-count").textContent = "0";
  }
}

function renderProducts() {
  const query = searchInput.value.trim().toLowerCase();
  const visibleProducts = products.filter((product) => (product.name || "").toLowerCase().includes(query));
  document.querySelector("#visible-count").textContent = String(visibleProducts.length);
  updateStats();

  if (visibleProducts.length === 0) {
    const isSearching = query.length > 0;
    rows.innerHTML = `<tr><td colspan="5" class="state-cell"><div class="empty-state"><span class="empty-icon">${isSearching ? "⌕" : "+"}</span><strong>${isSearching ? "No matching products" : "Your catalog is empty"}</strong><span>${isSearching ? "Try another search term." : "Add your first product to get started."}</span></div></td></tr>`;
    return;
  }

  rows.innerHTML = visibleProducts.map((product) => {
    const quantity = Number(product.quantity) || 0;
    const stockClass = quantity === 0 ? "out" : quantity <= 10 ? "low" : "";
    const stockLabel = quantity === 0 ? "Out of stock" : quantity <= 10 ? `${quantity} · Low stock` : `${quantity} · In stock`;
    const initial = escapeHtml((product.name || "?").trim().charAt(0) || "?");
    return `
      <tr>
        <td><div class="product-cell"><span class="product-avatar">${initial}</span><div><div class="product-name">${escapeHtml(product.name || "Unnamed product")}</div><div class="product-id">ID ${escapeHtml(product.id)}</div></div></div></td>
        <td><span class="price-value">${formatNumber(product.price)}</span></td>
        <td><span class="stock-badge ${stockClass}">${stockLabel}</span></td>
        <td><span class="rating"><span class="rating-star">★</span>${escapeHtml(product.rating ?? 0)} / 5</span></td>
        <td class="actions-cell"><span class="row-actions">
          <button class="row-button" type="button" data-action="edit" data-id="${escapeHtml(product.id)}" aria-label="Edit ${escapeHtml(product.name)}" title="Edit product"><svg viewBox="0 0 20 20"><path d="m12.8 4.2 3 3M4 16l3.5-.7L16 6.8a1.8 1.8 0 0 0-2.5-2.5L5 12.8 4 16Z"/></svg></button>
          <button class="row-button delete" type="button" data-action="delete" data-id="${escapeHtml(product.id)}" aria-label="Delete ${escapeHtml(product.name)}" title="Delete product"><svg viewBox="0 0 20 20"><path d="M4.5 6h11M8 6V4.5h4V6m2.5 0-.6 9H6.1l-.6-9M8.5 8.5v4m3-4v4"/></svg></button>
        </span></td>
      </tr>`;
  }).join("");
}

function updateStats() {
  const totalUnits = products.reduce((sum, product) => sum + (Number(product.quantity) || 0), 0);
  const inventoryValue = products.reduce((sum, product) => sum + ((Number(product.price) || 0) * (Number(product.quantity) || 0)), 0);
  const lowStockCount = products.filter((product) => (Number(product.quantity) || 0) <= 10).length;
  document.querySelector("#total-products").textContent = String(products.length);
  document.querySelector("#total-units").textContent = totalUnits.toLocaleString();
  document.querySelector("#inventory-value").textContent = formatNumber(inventoryValue);
  document.querySelector("#low-stock-count").textContent = String(lowStockCount);
}

function formatNumber(value) {
  return (Number(value) || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  })[character]);
}

function openCreateDialog() {
  editingProductId = null;
  form.reset();
  form.elements.rating.value = "0";
  formError.textContent = "";
  document.querySelector("#dialog-kicker").textContent = "NEW ITEM";
  document.querySelector("#dialog-title").textContent = "Add a product";
  document.querySelector("#save-product").textContent = "Save product";
  dialog.showModal();
  form.elements.name.focus();
}

function openEditDialog(product) {
  editingProductId = product.id;
  form.elements.name.value = product.name ?? "";
  form.elements.price.value = product.price ?? "";
  form.elements.quantity.value = product.quantity ?? "";
  form.elements.rating.value = product.rating ?? 0;
  formError.textContent = "";
  document.querySelector("#dialog-kicker").textContent = `EDITING ITEM · ID ${product.id}`;
  document.querySelector("#dialog-title").textContent = "Update product";
  document.querySelector("#save-product").textContent = "Save changes";
  dialog.showModal();
  form.elements.name.focus();
}

document.querySelector("#add-product").addEventListener("click", openCreateDialog);
document.querySelectorAll(".close-dialog").forEach((button) => button.addEventListener("click", () => dialog.close()));
document.querySelector("#refresh").addEventListener("click", loadProducts);
searchInput.addEventListener("input", renderProducts);

document.querySelector("#product-rows").addEventListener("click", async (event) => {
  const button = event.target.closest("button[data-action]");
  if (!button) return;
  const product = products.find((item) => String(item.id) === button.dataset.id);
  if (!product) return;

  if (button.dataset.action === "edit") {
    openEditDialog(product);
    return;
  }

  if (button.dataset.action === "delete" && window.confirm(`Delete “${product.name}”? This cannot be undone.`)) {
    try {
      await apiRequest(`${API_URL}/${encodeURIComponent(product.id)}`, { method: "DELETE" });
      showToast("Product deleted.");
      await loadProducts();
    } catch (error) {
      showToast(error.message, true);
    }
  }
});

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  formError.textContent = "";
  const saveButton = document.querySelector("#save-product");
  saveButton.disabled = true;
  saveButton.textContent = "Saving…";

  const payload = {
    name: form.elements.name.value.trim(),
    price: Number(form.elements.price.value),
    quantity: Number(form.elements.quantity.value),
    rating: Number(form.elements.rating.value),
  };

  try {
    if (editingProductId === null) {
      await apiRequest(API_URL, { method: "POST", body: JSON.stringify(payload) });
      showToast("Product added to your catalog.");
    } else {
      await apiRequest(`${API_URL}/${encodeURIComponent(editingProductId)}`, { method: "PUT", body: JSON.stringify(payload) });
      showToast("Product updated.");
    }
    dialog.close();
    await loadProducts();
  } catch (error) {
    formError.textContent = error.message;
  } finally {
    saveButton.disabled = false;
    saveButton.textContent = editingProductId === null ? "Save product" : "Save changes";
  }
});

document.addEventListener("keydown", (event) => {
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
    event.preventDefault();
    searchInput.focus();
  }
});

loadProducts();
