// =======================
// ADMIN DASHBOARD
// =======================

let allOrders = [];
let currentUser = null;

// Initialize admin dashboard
async function initAdmin() {
  // Check authentication
  window.authService.onAuthStateChanged(async (user) => {
    if (!user) {
      window.location.href = "index.html";
      return;
    }

    // Check if user is admin
    const isAdmin = await window.authService.isAdmin(user.uid);
    if (!isAdmin) {
      alert("Access denied. Admin privileges required.");
      window.location.href = "index.html";
      return;
    }

    currentUser = user;
    document.getElementById("adminName").textContent =
      user.displayName || user.email;

    // Load orders
    await loadOrders();

    // Wire up events
    document
      .getElementById("statusFilter")
      .addEventListener("change", applyFilters);
    document
      .getElementById("dateFilter")
      .addEventListener("change", applyFilters);
    document
      .getElementById("clearFilters")
      .addEventListener("click", clearFilters);
    document
      .getElementById("signOutBtn")
      .addEventListener("click", handleSignOut);

    // Set up real-time listener for orders
    setupRealtimeListener();
  });
}

// Load orders
async function loadOrders(filters = {}) {
  try {
    allOrders = await window.firestoreService.getAllOrders(filters);
    renderOrders(allOrders);
    updateStats(allOrders);
  } catch (error) {
    console.error("Error loading orders:", error);
    document.getElementById("ordersContainer").innerHTML =
      '<div class="error">Error loading orders. Please refresh.</div>';
  }
}

// Render orders
function renderOrders(orders) {
  const container = document.getElementById("ordersContainer");

  if (orders.length === 0) {
    container.innerHTML = '<div class="empty">No orders found.</div>';
    return;
  }

  container.innerHTML = orders
    .map(
      (order) => `
    <div class="order-card" data-order-id="${order.id}">
      <div class="order-header">
        <div>
          <strong>Order #${order.id.slice(0, 8)}</strong>
          <div class="muted small">
            ${order.customerName} • ${order.customerPhone}
            ${order.customerEmail ? ` • ${order.customerEmail}` : ""}
          </div>
        </div>
        <div class="order-status">
          <span class="status-badge status-${order.status}">${
        order.status
      }</span>
        </div>
      </div>

      <div class="order-details">
        <div class="detail-row">
          <span class="muted">Pickup:</span>
          <span>${formatDate(order.pickupDate)} at ${order.pickupTime}</span>
        </div>
        <div class="detail-row">
          <span class="muted">Total:</span>
          <strong>₹${order.total}</strong>
        </div>
        <div class="detail-row">
          <span class="muted">Payment:</span>
          <span>${order.paymentMethod === "credits" ? "Credits" : "Cash"}</span>
        </div>
        ${
          order.createdAt
            ? `
          <div class="detail-row">
            <span class="muted">Ordered:</span>
            <span>${formatTimestamp(order.createdAt)}</span>
          </div>
        `
            : ""
        }
      </div>

      ${
        order.cartItems && order.cartItems.length > 0
          ? `
        <div class="order-items">
          <strong>Items:</strong>
          <ul class="items-list">
            ${order.cartItems
              .map(
                (item) => `
              <li>${item.name} - ₹${item.price}</li>
            `
              )
              .join("")}
          </ul>
        </div>
      `
          : ""
      }

      ${
        order.uploadedFiles && order.uploadedFiles.length > 0
          ? `
        <div class="order-files">
          <strong>Files (${order.uploadedFiles.length}):</strong>
          <ul class="files-list">
            ${order.uploadedFiles
              .map(
                (file) => `
              <li>
                <a href="${file.url}" target="_blank">${file.fileName}</a>
                <span class="muted small">(${Math.round(
                  file.size / 1024
                )} KB)</span>
              </li>
            `
              )
              .join("")}
          </ul>
        </div>
      `
          : ""
      }

      ${
        order.notes
          ? `
        <div class="order-notes">
          <strong>Notes:</strong>
          <p>${order.notes}</p>
        </div>
      `
          : ""
      }

      <div class="order-actions">
        ${
          order.status === "pending"
            ? `
          <button class="btn primary" onclick="updateOrderStatus('${order.id}', 'processing')">
            Start Processing
          </button>
        `
            : ""
        }
        ${
          order.status === "processing"
            ? `
          <button class="btn primary" onclick="updateOrderStatus('${order.id}', 'ready')">
            Mark as Ready
          </button>
        `
            : ""
        }
        ${
          order.status === "ready"
            ? `
          <button class="btn success" onclick="updateOrderStatus('${order.id}', 'completed')">
            Mark as Completed
          </button>
        `
            : ""
        }
        ${
          order.status !== "cancelled" && order.status !== "completed"
            ? `
          <button class="btn ghost" onclick="updateOrderStatus('${order.id}', 'cancelled')">
            Cancel
          </button>
        `
            : ""
        }
      </div>
    </div>
  `
    )
    .join("");
}

// Update order status
async function updateOrderStatus(orderId, status) {
  if (!confirm(`Are you sure you want to mark this order as "${status}"?`)) {
    return;
  }

  try {
    const result = await window.firestoreService.updateOrderStatus(
      orderId,
      status
    );
    if (result.success) {
      // Order will be updated via real-time listener
      showNotification("Order status updated successfully");
    } else {
      alert("Error updating order status: " + result.error);
    }
  } catch (error) {
    console.error("Error updating order status:", error);
    alert("Error updating order status");
  }
}

// Apply filters
function applyFilters() {
  const status = document.getElementById("statusFilter").value;
  const date = document.getElementById("dateFilter").value;

  const filters = {};
  if (status !== "all") {
    filters.status = status;
  }
  if (date) {
    filters.startDate = date;
    filters.endDate = date;
  }

  loadOrders(filters);
}

// Clear filters
function clearFilters() {
  document.getElementById("statusFilter").value = "all";
  document.getElementById("dateFilter").value = "";
  loadOrders({});
}

// Update statistics
function updateStats(orders) {
  const today = new Date().toISOString().split("T")[0];
  const todayOrders = orders.filter((order) => {
    const orderDate =
      order.createdAt?.toDate?.()?.toISOString()?.split("T")[0] ||
      (typeof order.createdAt === "string"
        ? order.createdAt.split("T")[0]
        : "");
    return orderDate === today;
  });

  document.getElementById("statPending").textContent = orders.filter(
    (o) => o.status === "pending"
  ).length;
  document.getElementById("statReady").textContent = orders.filter(
    (o) => o.status === "ready"
  ).length;
  document.getElementById("statCompleted").textContent = orders.filter(
    (o) => o.status === "completed"
  ).length;
}

// Set up real-time listener
function setupRealtimeListener() {
  const db = firebase.firestore();

  db.collection("orders")
    .orderBy("createdAt", "desc")
    .onSnapshot(
      (snapshot) => {
        allOrders = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        renderOrders(allOrders);
        updateStats(allOrders);
      },
      (error) => {
        console.error("Error in real-time listener:", error);
      }
    );
}

// Format date
function formatDate(dateString) {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

// Format timestamp
function formatTimestamp(timestamp) {
  if (!timestamp) return "N/A";
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  return date.toLocaleString("en-US");
}

// Handle sign out
async function handleSignOut() {
  const result = await window.authService.signOut();
  if (result.success) {
    window.location.href = "index.html";
  }
}

// Show notification
function showNotification(message) {
  // Simple notification - could be enhanced with a toast library
  const notification = document.createElement("div");
  notification.className = "notification";
  notification.textContent = message;
  document.body.appendChild(notification);

  setTimeout(() => {
    notification.classList.add("show");
  }, 10);

  setTimeout(() => {
    notification.classList.remove("show");
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

// Initialize on load
document.addEventListener("DOMContentLoaded", initAdmin);
