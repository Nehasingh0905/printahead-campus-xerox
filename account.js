// =======================
// ACCOUNT PAGE
// =======================

let currentUser = null;

// Initialize account page
async function initAccount() {
  // Check authentication
  window.authService.onAuthStateChanged(async (user) => {
    if (!user) {
      window.location.href = "index.html";
      return;
    }

    currentUser = user;
    
    // Wire up events
    document.getElementById("signOutBtn").addEventListener("click", handleSignOut);
    document.getElementById("addCreditsBtn").addEventListener("click", showWalletModal);

    // Load profile and data
    await loadProfile();
    await loadOrderHistory();
    await loadWallet();
  });
}

// Load user profile
async function loadProfile() {
  const profileInfo = document.getElementById("profileInfo");
  
  try {
    const userDoc = await firebase.firestore().collection("users").doc(currentUser.uid).get();
    const userData = userDoc.exists ? userDoc.data() : {};

    profileInfo.innerHTML = `
      <div class="profile-details">
        <div class="profile-field">
          <label>Email</label>
          <div class="profile-value">${currentUser.email}</div>
        </div>
        <div class="profile-field">
          <label>Display Name</label>
          <div class="profile-value">${currentUser.displayName || "Not set"}</div>
        </div>
        <div class="profile-field">
          <label>User ID</label>
          <div class="profile-value small">${currentUser.uid}</div>
        </div>
        <div class="profile-field">
          <label>Account Type</label>
          <div class="profile-value">
            <span class="badge">${userData.role === "admin" ? "Seller/Admin" : "Buyer"}</span>
          </div>
        </div>
        <div class="profile-field">
          <label>Member Since</label>
          <div class="profile-value">
            ${userData.createdAt ? formatDate(userData.createdAt.toDate()) : "Recently"}
          </div>
        </div>
      </div>
    `;
  } catch (error) {
    console.error("Error loading profile:", error);
    profileInfo.innerHTML = '<div class="error">Error loading profile information.</div>';
  }
}

// Load order history
async function loadOrderHistory() {
  const orderHistory = document.getElementById("orderHistory");
  
  try {
    const orders = await window.firestoreService.getUserOrders(currentUser.uid);
    
    if (orders.length === 0) {
      orderHistory.innerHTML = '<div class="empty">No orders yet. Start shopping!</div>';
      return;
    }

    orderHistory.innerHTML = orders.map(order => `
      <div class="order-card">
        <div class="order-header">
          <div>
            <strong>Order #${order.id.slice(0, 8)}</strong>
            <div class="muted small">
              ${formatDate(order.createdAt?.toDate?.() || new Date(order.createdAt))}
            </div>
          </div>
          <div>
            <span class="status-badge status-${order.status}">${order.status}</span>
          </div>
        </div>
        <div class="order-summary">
          <div class="summary-row">
            <span class="muted">Pickup:</span>
            <span>${order.pickupDate} at ${order.pickupTime}</span>
          </div>
          <div class="summary-row">
            <span class="muted">Total:</span>
            <strong>₹${order.total}</strong>
          </div>
          <div class="summary-row">
            <span class="muted">Payment:</span>
            <span>${order.paymentMethod === "credits" ? "Print Credits" : 
                   order.paymentMethod === "card" ? "Card" :
                   order.paymentMethod === "upi" ? "UPI" : "Cash on Delivery"}</span>
          </div>
        </div>
        ${order.cartItems && order.cartItems.length > 0 ? `
          <div class="order-items-list">
            <strong>Items (${order.cartItems.length}):</strong>
            <ul>
              ${order.cartItems.slice(0, 3).map(item => `<li>${item.name} - ₹${item.price}</li>`).join("")}
              ${order.cartItems.length > 3 ? `<li class="muted">+${order.cartItems.length - 3} more items</li>` : ""}
            </ul>
          </div>
        ` : ""}
      </div>
    `).join("");
  } catch (error) {
    console.error("Error loading order history:", error);
    orderHistory.innerHTML = '<div class="error">Error loading order history.</div>';
  }
}

// Load wallet
async function loadWallet() {
  try {
    const credits = await window.firestoreService.getUserCredits(currentUser.uid);
    document.getElementById("accountBalance").textContent = `₹${credits}`;
    
    // Load transactions
    const transactions = await window.firestoreService.getUserTransactions(currentUser.uid, 10);
    const transactionsList = document.getElementById("transactionsList");
    
    if (transactions.length === 0) {
      transactionsList.innerHTML = '<div class="empty">No transactions yet.</div>';
      return;
    }

    transactionsList.innerHTML = transactions.map(txn => `
      <div class="transaction-item">
        <div>
          <strong>${txn.type === "purchase" ? "Credit Added" : 
                   txn.type === "order_payment" ? "Order Payment" : 
                   "Transaction"}</strong>
          <div class="muted small">${formatTimestamp(txn.timestamp)}</div>
        </div>
        <div class="transaction-amount ${txn.amount > 0 ? "positive" : "negative"}">
          ${txn.amount > 0 ? "+" : ""}₹${Math.abs(txn.amount)}
        </div>
      </div>
    `).join("");
  } catch (error) {
    console.error("Error loading wallet:", error);
  }
}

// Show wallet modal
function showWalletModal() {
  const modal = document.createElement("div");
  modal.className = "modal";
  modal.innerHTML = `
    <div class="modal-content">
      <h2>Add Print Credits</h2>
      <form id="addCreditsForm">
        <label>Amount</label>
        <select id="creditAmount">
          <option value="100">₹100</option>
          <option value="250">₹250</option>
          <option value="500">₹500</option>
          <option value="1000">₹1000</option>
        </select>
        <button type="submit" class="btn primary block">Add to Wallet</button>
      </form>
      <button class="modal-close" onclick="this.closest('.modal').remove()">×</button>
      <div id="walletStatus" class="status muted small"></div>
    </div>
  `;
  document.body.appendChild(modal);
  
  document.getElementById("addCreditsForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const amount = parseInt(document.getElementById("creditAmount").value);
    const status = document.getElementById("walletStatus");
    
    status.textContent = "Adding credits...";
    const result = await window.firestoreService.addCredits(currentUser.uid, amount);
    if (result.success) {
      status.textContent = "Credits added successfully!";
      status.style.color = "#66bb6a";
      await loadWallet();
      setTimeout(() => modal.remove(), 1500);
    } else {
      status.textContent = result.error;
      status.style.color = "#e57373";
    }
  });
}

// Handle sign out
async function handleSignOut() {
  const result = await window.authService.signOut();
  if (result.success) {
    window.location.href = "index.html";
  }
}

// Format date
function formatDate(date) {
  return date.toLocaleDateString("en-US", { 
    year: "numeric", 
    month: "long", 
    day: "numeric" 
  });
}

// Format timestamp
function formatTimestamp(timestamp) {
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  return date.toLocaleString("en-US");
}

// Initialize on load
document.addEventListener("DOMContentLoaded", initAccount);

