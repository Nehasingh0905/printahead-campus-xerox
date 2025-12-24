// =======================
// MAIN APPLICATION
// =======================

// Data
const items = [
  // Writing instruments
  {
    id: "gel-pen",
    name: "Smooth Gel Pen",
    price: 15,
    category: "writing",
    desc: "0.5mm blue/black",
  },
  {
    id: "ball-pen",
    name: "Ball Point Pen (Pack of 3)",
    price: 20,
    category: "writing",
    desc: "Blue, black, red",
  },
  {
    id: "hi-lite",
    name: "Pastel Highlighter",
    price: 25,
    category: "writing",
    desc: "Smear-safe, assorted",
  },
  {
    id: "pencil-set",
    name: "HB Pencil Set (Pack of 5)",
    price: 30,
    category: "writing",
    desc: "With eraser",
  },
  {
    id: "marker",
    name: "Permanent Marker",
    price: 18,
    category: "writing",
    desc: "Fine tip, black",
  },
  {
    id: "correction-pen",
    name: "Correction Pen",
    price: 22,
    category: "writing",
    desc: "Quick-dry formula",
  },
  // Notebooks
  {
    id: "notes-a5",
    name: "A5 Ruled Notebook",
    price: 80,
    category: "notebooks",
    desc: "160 pages, soft cover",
  },
  {
    id: "notes-a4",
    name: "A4 Spiral Notebook",
    price: 120,
    category: "notebooks",
    desc: "240 pages, 70 GSM",
  },
  {
    id: "notes-a4-hard",
    name: "A4 Hardbound Notebook",
    price: 150,
    category: "notebooks",
    desc: "200 pages, durable cover",
  },
  {
    id: "rough-book",
    name: "Rough Book A4",
    price: 60,
    category: "notebooks",
    desc: "150 pages, unruled",
  },
  {
    id: "project-book",
    name: "Project Book",
    price: 90,
    category: "notebooks",
    desc: "100 pages, A4 size",
  },
  // Supplies
  {
    id: "stickynotes",
    name: "Sticky Notes Pack",
    price: 45,
    category: "supplies",
    desc: "Assorted colours",
  },
  {
    id: "folder",
    name: "Document Folder",
    price: 30,
    category: "supplies",
    desc: "Button closure",
  },
  {
    id: "file-folder",
    name: "File Folder (Pack of 5)",
    price: 50,
    category: "supplies",
    desc: "A4 size, assorted colors",
  },
  {
    id: "graph",
    name: "Graph Sheets (set of 10)",
    price: 25,
    category: "supplies",
    desc: "Standard squares",
  },
  {
    id: "drawing-sheet",
    name: "Drawing Sheets A4 (set of 10)",
    price: 40,
    category: "supplies",
    desc: "Thick quality paper",
  },
  {
    id: "stapler",
    name: "Mini Stapler with Pins",
    price: 75,
    category: "supplies",
    desc: "Compact, 100 pins included",
  },
  {
    id: "paper-clips",
    name: "Paper Clips (Box of 100)",
    price: 35,
    category: "supplies",
    desc: "Assorted sizes",
  },
  {
    id: "binder-clips",
    name: "Binder Clips (Pack of 12)",
    price: 40,
    category: "supplies",
    desc: "Different sizes",
  },
  {
    id: "glue-stick",
    name: "Glue Stick",
    price: 25,
    category: "supplies",
    desc: "Non-toxic, 20g",
  },
  {
    id: "scale",
    name: "Plastic Scale (30cm)",
    price: 20,
    category: "supplies",
    desc: "Transparent",
  },
  {
    id: "calculator",
    name: "Scientific Calculator",
    price: 250,
    category: "supplies",
    desc: "Basic functions",
  },
  {
    id: "print-credit",
    name: "Print Credits (10 pages)",
    price: 40,
    category: "supplies",
    desc: "Prepaid bundle",
  },
];

const templates = [
  {
    id: "resume",
    name: "CV / Resume",
    price: 25,
    includes: "High-quality mono, staple",
    note: "Upload PDF",
  },
  {
    id: "lab-report",
    name: "Lab Report",
    price: 30,
    includes: "A4 mono, double-sided",
    note: "Add page ranges",
  },
  {
    id: "poster",
    name: "Event Poster A3",
    price: 50,
    includes: "Full color, thick sheet",
    note: "Upload PNG/PDF",
  },
  {
    id: "slides",
    name: "Lecture Slides",
    price: 40,
    includes: "2 slides per side, staple",
    note: "PDF/PPT accepted",
  },
];

let currentUser = null;
let userCredits = 0;
let uploadedFiles = [];
let searchSuggestions = [];

const currency = (num) => `₹${num}`;

// =======================
// AUTHENTICATION UI
// =======================

function renderAuthUI(user) {
  currentUser = user;
  const authContainer = document.getElementById("authContainer");
  const creditsPaymentOption = document.getElementById("creditsPaymentOption");

  if (user) {
    authContainer.innerHTML = `
      <div class="user-info">
        <span class="muted">${user.displayName || user.email}</span>
        <a href="account.html" class="btn ghost small">My Account</a>
        <button id="walletBtn" class="btn ghost small">Credits: ₹<span id="creditBalance">0</span></button>
        <a href="admin.html" class="btn ghost small" id="adminLink" style="display: none;">Admin</a>
        <button id="signOutBtn" class="btn ghost small">Sign Out</button>
      </div>
    `;

    document
      .getElementById("signOutBtn")
      .addEventListener("click", handleSignOut);
    const walletBtn = document.getElementById("walletBtn");
    if (walletBtn) {
      walletBtn.addEventListener("click", showWalletModal);
    }

    // Show credits payment option
    if (creditsPaymentOption) {
      creditsPaymentOption.style.display = "block";
    }

    // Check if admin and show admin link
    checkAdminStatus(user.uid);

    // Load user credits
    loadUserCredits(user.uid);
  } else {
    authContainer.innerHTML = `
      <button id="signInBtn" class="btn ghost">Sign In</button>
      <button id="signUpBtn" class="btn primary">Sign Up</button>
    `;

    document
      .getElementById("signInBtn")
      .addEventListener("click", showSignInModal);
    document
      .getElementById("signUpBtn")
      .addEventListener("click", showSignUpModal);

    // Hide credits payment option
    if (creditsPaymentOption) {
      creditsPaymentOption.style.display = "none";
    }
  }
}

function showSignInModal() {
  const modal = document.createElement("div");
  modal.className = "modal";
  modal.innerHTML = `
    <div class="modal-content">
      <h2>Sign In</h2>
      <form id="signInForm">
        <input type="email" id="signInEmail" placeholder="Email" required />
        <input type="password" id="signInPassword" placeholder="Password" required />
        <button type="submit" class="btn primary block">Sign In</button>
        <button type="button" class="btn ghost block" id="googleSignInBtn">Sign in with Google</button>
        <button type="button" class="btn ghost small" id="resetPasswordBtn">Forgot Password?</button>
      </form>
      <button class="modal-close" onclick="this.closest('.modal').remove()">×</button>
      <div id="signInStatus" class="status muted small"></div>
    </div>
  `;
  document.body.appendChild(modal);

  document
    .getElementById("signInForm")
    .addEventListener("submit", async (e) => {
      e.preventDefault();
      const email = document.getElementById("signInEmail").value;
      const password = document.getElementById("signInPassword").value;
      const status = document.getElementById("signInStatus");

      status.textContent = "Signing in...";
      const result = await window.authService.signIn(email, password);
      if (result.success) {
        modal.remove();
      } else {
        status.textContent = result.error;
        status.style.color = "#ef4444";
      }
    });

  document
    .getElementById("googleSignInBtn")
    .addEventListener("click", async () => {
      const result = await window.authService.signInWithGoogle();
      if (result.success) {
        modal.remove();
      }
    });

  document
    .getElementById("resetPasswordBtn")
    .addEventListener("click", async () => {
      const email = document.getElementById("signInEmail").value;
      if (!email) {
        alert("Please enter your email first");
        return;
      }
      const result = await window.authService.resetPassword(email);
      alert(result.success ? "Password reset email sent!" : result.error);
    });
}

function showSignUpModal() {
  const modal = document.createElement("div");
  modal.className = "modal";
  modal.innerHTML = `
    <div class="modal-content">
      <h2>Sign Up</h2>
      <form id="signUpForm">
        <input type="text" id="signUpName" placeholder="Full Name" required />
        <input type="email" id="signUpEmail" placeholder="Email" required />
        <input type="password" id="signUpPassword" placeholder="Password" required minlength="6" />
        <button type="submit" class="btn primary block">Sign Up</button>
        <button type="button" class="btn ghost block" id="googleSignUpBtn">Sign up with Google</button>
      </form>
      <button class="modal-close" onclick="this.closest('.modal').remove()">×</button>
      <div id="signUpStatus" class="status muted small"></div>
    </div>
  `;
  document.body.appendChild(modal);

  document
    .getElementById("signUpForm")
    .addEventListener("submit", async (e) => {
      e.preventDefault();
      const name = document.getElementById("signUpName").value;
      const email = document.getElementById("signUpEmail").value;
      const password = document.getElementById("signUpPassword").value;
      const status = document.getElementById("signUpStatus");

      status.textContent = "Creating account...";
      const result = await window.authService.signUp(email, password, name);
      if (result.success) {
        modal.remove();
      } else {
        status.textContent = result.error;
        status.style.color = "#ef4444";
      }
    });

  document
    .getElementById("googleSignUpBtn")
    .addEventListener("click", async () => {
      const result = await window.authService.signInWithGoogle();
      if (result.success) {
        modal.remove();
      }
    });
}

async function handleSignOut() {
  await window.authService.signOut();
}

async function checkAdminStatus(uid) {
  const isAdmin = await window.authService.isAdmin(uid);
  const adminLink = document.getElementById("adminLink");
  if (adminLink) {
    adminLink.style.display = isAdmin ? "inline-block" : "none";
  }
}

async function loadUserCredits(uid) {
  userCredits = await window.firestoreService.getUserCredits(uid);
  const creditBalance = document.getElementById("creditBalance");
  if (creditBalance) {
    creditBalance.textContent = userCredits;
  }
  const checkoutCredits = document.getElementById("checkoutCredits");
  if (checkoutCredits) {
    checkoutCredits.textContent = userCredits;
  }
  // Update credits option availability
  const cartItems = window.cartManager.getItems();
  const total = window.cartManager.getTotal();
  updateCreditsOption(total);

  // Show/hide credits balance display based on payment method
  const paymentMethod = document.getElementById("paymentMethod");
  const creditsBalanceDisplay = document.getElementById(
    "creditsBalanceDisplay"
  );
  if (paymentMethod && creditsBalanceDisplay) {
    const handlePaymentChange = () => {
      if (
        paymentMethod.value === "credits" &&
        currentUser &&
        userCredits >= total
      ) {
        creditsBalanceDisplay.style.display = "block";
      } else {
        creditsBalanceDisplay.style.display = "none";
      }
    };
    paymentMethod.removeEventListener("change", handlePaymentChange);
    paymentMethod.addEventListener("change", handlePaymentChange);
    handlePaymentChange();
  }
}

function showWalletModal() {
  const modal = document.createElement("div");
  modal.className = "modal";
  modal.innerHTML = `
    <div class="modal-content">
      <h2>Print Credit Wallet</h2>
      <div class="wallet-balance">
        <div class="balance-amount">₹${userCredits}</div>
        <div class="muted small">Available Credits</div>
      </div>
      <form id="addCreditsForm">
        <label>Add Credits</label>
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

  document
    .getElementById("addCreditsForm")
    .addEventListener("submit", async (e) => {
      e.preventDefault();
      const amount = parseInt(document.getElementById("creditAmount").value);
      const status = document.getElementById("walletStatus");

      status.textContent = "Adding credits...";
      const result = await window.firestoreService.addCredits(
        currentUser.uid,
        amount
      );
      if (result.success) {
        status.textContent = "Credits added successfully!";
        status.style.color = "#34d399";
        await loadUserCredits(currentUser.uid);
        setTimeout(() => modal.remove(), 1500);
      } else {
        status.textContent = result.error;
        status.style.color = "#ef4444";
      }
    });
}

// =======================
// STATIONERY
// =======================

function renderItems(list) {
  const container = document.getElementById("itemsGrid");
  container.innerHTML = "";

  list.forEach((item) => {
    const card = document.createElement("div");
    card.className = "item";

    card.innerHTML = `
        <div>
          <h3>${item.name}</h3>
          <p class="muted small">${item.desc}</p>
        </div>
        <div class="item-meta">
          <span class="price">${currency(item.price)}</span>
        </div>
        <button class="btn">Add</button>
      `;

    card.querySelector("button").addEventListener("click", () => {
      window.cartManager.addItem({
        type: "stationery",
        name: item.name,
        price: item.price,
        meta: item.desc,
      });
      showNotification("Item added to cart");
    });

    container.appendChild(card);
  });
}

// Search with autocomplete
function setupSearchAutocomplete() {
  const searchInput = document.getElementById("itemSearch");
  const suggestionsContainer = document.createElement("div");
  suggestionsContainer.id = "searchSuggestions";
  suggestionsContainer.className = "search-suggestions";
  searchInput.parentElement.appendChild(suggestionsContainer);

  searchInput.addEventListener("input", (e) => {
    const query = e.target.value.toLowerCase().trim();

    if (query.length < 2) {
      suggestionsContainer.style.display = "none";
      filterItems();
      return;
    }

    // Generate suggestions
    const suggestions = items
      .filter((item) => {
        return (
          item.name.toLowerCase().includes(query) ||
          item.desc.toLowerCase().includes(query) ||
          item.category.toLowerCase().includes(query)
        );
      })
      .slice(0, 5);

    if (suggestions.length > 0) {
      suggestionsContainer.innerHTML = suggestions
        .map(
          (item) => `
        <div class="suggestion-item" data-item-id="${item.id}">
          <strong>${item.name}</strong>
          <span class="muted small">${item.desc}</span>
        </div>
      `
        )
        .join("");
      suggestionsContainer.style.display = "block";

      // Add click handlers
      suggestionsContainer
        .querySelectorAll(".suggestion-item")
        .forEach((el) => {
          el.addEventListener("click", () => {
            const itemId = el.dataset.itemId;
            const item = items.find((i) => i.id === itemId);
            if (item) {
              searchInput.value = item.name;
              suggestionsContainer.style.display = "none";
              filterItems();
            }
          });
        });
    } else {
      suggestionsContainer.style.display = "none";
    }

    filterItems();
  });

  // Hide suggestions when clicking outside
  document.addEventListener("click", (e) => {
    if (
      !searchInput.contains(e.target) &&
      !suggestionsContainer.contains(e.target)
    ) {
      suggestionsContainer.style.display = "none";
    }
  });
}

function filterItems() {
  const query = document.getElementById("itemSearch").value.toLowerCase();
  const category = document.getElementById("categoryFilter").value;

  const filtered = items.filter((item) => {
    const matchesQuery =
      item.name.toLowerCase().includes(query) ||
      item.desc.toLowerCase().includes(query);

    const matchesCategory = category === "all" || item.category === category;

    return matchesQuery && matchesCategory;
  });

  renderItems(filtered);
}

// =======================
// TEMPLATES
// =======================

function renderTemplates() {
  const select = document.getElementById("templateSelect");
  const cards = document.getElementById("templateCards");

  select.innerHTML =
    `<option value="custom">Custom upload</option>` +
    templates
      .map(
        (t) =>
          `<option value="${t.id}">${t.name} — ${currency(t.price)}</option>`
      )
      .join("");

  cards.innerHTML = "";

  templates.forEach((t) => {
    const card = document.createElement("div");
    card.className = "item";

    card.innerHTML = `
        <div>
          <h3>${t.name}</h3>
          <p class="muted small">${t.includes}</p>
          <p class="muted small">${t.note}</p>
        </div>
        <div class="item-meta">
          <span class="price">${currency(t.price)}</span>
        </div>
        <button class="btn">Use template</button>
      `;

    card.querySelector("button").addEventListener("click", () => {
      document.getElementById("templateSelect").value = t.id;
      document.getElementById("printNotes").value = t.note;
      addPrintJob();
    });

    cards.appendChild(card);
  });
}

// =======================
// CART
// =======================

function renderCart() {
  const cartItems = window.cartManager.getItems();
  const total = window.cartManager.getTotal();
  const list = document.getElementById("cartList");
  list.innerHTML = "";

  if (!cartItems.length) {
    list.innerHTML = `<li><span class="muted">Cart is empty</span></li>`;
    document.getElementById("totalAmount").textContent = currency(0);
    updateCreditsOption(total);
    return;
  }

  cartItems.forEach((item) => {
    const li = document.createElement("li");
    li.innerHTML = `
        <div>
          <strong>${item.name}</strong>
          <div class="muted small">${item.meta || ""}</div>
        </div>
        <div>
          <div class="price">${currency(item.price)}</div>
          <button class="btn ghost small">Remove</button>
        </div>
      `;

    li.querySelector("button").addEventListener("click", () => {
      window.cartManager.removeItem(item.id);
      showNotification("Item removed from cart");
    });

    list.appendChild(li);
  });

  document.getElementById("totalAmount").textContent = currency(total);
  updateCreditsOption(total);
}

function updateCreditsOption(total) {
  const creditsPaymentOption = document.getElementById("creditsPaymentOption");
  const creditsBalanceDisplay = document.getElementById(
    "creditsBalanceDisplay"
  );
  const paymentMethod = document.getElementById("paymentMethod");
  if (creditsPaymentOption && paymentMethod) {
    if (!currentUser || userCredits < total) {
      creditsPaymentOption.style.display = "none";
      if (creditsBalanceDisplay) creditsBalanceDisplay.style.display = "none";
      // If credits was selected but not available, switch to cash
      if (paymentMethod.value === "credits") {
        paymentMethod.value = "cash";
      }
    } else {
      creditsPaymentOption.style.display = "block";
      if (creditsBalanceDisplay && paymentMethod.value === "credits") {
        creditsBalanceDisplay.style.display = "block";
      }
    }
  }
}

// =======================
// FILE UPLOAD WITH AI SUGGESTIONS
// =======================

async function handleFiles(files) {
  const list = document.getElementById("fileList");
  list.innerHTML = "";
  uploadedFiles = Array.from(files);

  for (const file of uploadedFiles) {
    const li = document.createElement("li");
    li.className = "chip";

    // Get AI suggestions
    const aiResult = await window.aiService.getPrintSuggestions(
      file.name,
      file.type,
      file.size
    );
    const suggestions = aiResult.suggestions;

    li.innerHTML = `
      <div>
        <strong>${file.name}</strong>
        <span class="muted small">(${Math.round(file.size / 1024)} KB)</span>
        ${
          suggestions.recommendation
            ? `<div class="ai-suggestion muted small">💡 ${suggestions.recommendation}</div>`
            : ""
        }
      </div>
      <button class="chip-remove">×</button>
    `;

    li.querySelector(".chip-remove").addEventListener("click", () => {
      uploadedFiles = uploadedFiles.filter((f) => f !== file);
      li.remove();
    });

    list.appendChild(li);

    // Apply AI suggestions to form if available
    if (suggestions.colorMode) {
      document.getElementById("colorMode").value = suggestions.colorMode;
    }
    if (suggestions.sides) {
      document.getElementById("sides").value = suggestions.sides;
    }
    if (suggestions.copies) {
      document.getElementById("copies").value = suggestions.copies;
    }
  }
}

// =======================
// PRINT JOB
// =======================

function addPrintJob() {
  const templateId = document.getElementById("templateSelect").value;
  const template = templates.find((t) => t.id === templateId);
  const copies = Number(document.getElementById("copies").value || 1);
  const color = document.getElementById("colorMode").value;
  const sides = document.getElementById("sides").value;
  const notes = document.getElementById("printNotes").value.trim();

  const basePrice = template ? template.price : 20;
  const multiplier = color === "color" ? 1.8 : 1;
  const price = Math.max(10, Math.round(basePrice * copies * multiplier));

  const meta = `${
    template ? template.name : "Custom"
  } • ${copies} copies • ${color} • ${sides}${notes ? " • " + notes : ""}`;

  window.cartManager.addItem({
    type: "print",
    name: "Print job",
    price,
    meta,
    files: uploadedFiles.map((f) => ({
      name: f.name,
      size: f.size,
      type: f.type,
    })),
  });

  // Clear files after adding
  uploadedFiles = [];
  document.getElementById("fileList").innerHTML = "";
  document.getElementById("fileInput").value = "";

  showNotification("Print job added to cart");
}

// =======================
// ORDER SUBMIT
// =======================

async function handleOrderSubmit(e) {
  e.preventDefault();

  const cartItems = window.cartManager.getItems();
  if (!cartItems.length) {
    showStatus(
      "Add at least one item or print job before submitting.",
      "error"
    );
    return;
  }

  const customerName = document.getElementById("customerName").value;
  const customerPhone = document.getElementById("customerPhone").value;
  const pickupDate = document.getElementById("pickupDate").value;
  const pickupTime = document.getElementById("pickupTime").value;
  const paymentMethod = document.getElementById("paymentMethod").value;
  const notes = document.getElementById("printNotes").value.trim();

  if (!currentUser && (!customerName || !customerPhone)) {
    showStatus("Please sign in or provide name and phone number.", "error");
    return;
  }

  if (
    paymentMethod === "credits" &&
    (!currentUser || userCredits < window.cartManager.getTotal())
  ) {
    showStatus(
      "Insufficient credits. Please add more credits or choose another payment method.",
      "error"
    );
    return;
  }

  showStatus("Submitting order...", "info");

  try {
    const orderData = {
      cartItems,
      uploadedFiles: uploadedFiles,
      userId: currentUser?.uid || null,
      customerName: customerName || currentUser?.displayName || "Guest",
      customerPhone,
      customerEmail: currentUser?.email || null,
      pickupDate,
      pickupTime,
      notes,
      paymentMethod: paymentMethod || "cash",
    };

    const result = await window.orderService.submitOrder(orderData);

    if (result.success) {
      showStatus(
        "Order submitted successfully! You'll receive a confirmation email shortly.",
        "success"
      );

      // Clear cart and form
      window.cartManager.clear();
      uploadedFiles = [];
      document.getElementById("fileList").innerHTML = "";
      document.getElementById("fileInput").value = "";
      document.getElementById("orderForm").reset();
      setDefaultPickup();

      // Reload credits if used
      if (paymentMethod === "credits" && currentUser) {
        await loadUserCredits(currentUser.uid);
      }
    } else {
      showStatus("Error: " + result.error, "error");
    }
  } catch (error) {
    console.error("Order submission error:", error);
    showStatus("Error submitting order. Please try again.", "error");
  }
}

function showStatus(message, type = "info") {
  const statusEl = document.getElementById("status");
  statusEl.textContent = message;
  statusEl.className = `status muted small status-${type}`;
}

// =======================
// INIT
// =======================

function setDefaultPickup() {
  const now = new Date();
  document.getElementById("pickupDate").value = now.toISOString().split("T")[0];

  const nextHour = new Date(now.getTime() + 60 * 60 * 1000);
  document.getElementById("pickupTime").value = nextHour
    .toTimeString()
    .slice(0, 5);

  document.getElementById("pickupWindow").textContent =
    `${now.toLocaleDateString([], { weekday: "short" })}, ` +
    `${nextHour.getHours()}:00 – ${nextHour.getHours() + 2}:00`;
}

function wireEvents() {
  document.getElementById("itemSearch").addEventListener("input", filterItems);
  document
    .getElementById("categoryFilter")
    .addEventListener("change", filterItems);
  document
    .getElementById("fileInput")
    .addEventListener("change", (e) => handleFiles(e.target.files));
  document.getElementById("addPrintJob").addEventListener("click", addPrintJob);
  document
    .getElementById("orderForm")
    .addEventListener("submit", handleOrderSubmit);

  document
    .getElementById("startStationery")
    .addEventListener("click", () =>
      document
        .getElementById("stationeryPanel")
        .scrollIntoView({ behavior: "smooth" })
    );

  document
    .getElementById("startPrints")
    .addEventListener("click", () =>
      document
        .getElementById("printPanel")
        .scrollIntoView({ behavior: "smooth" })
    );

  document
    .getElementById("scrollOrder")
    .addEventListener("click", () =>
      document
        .getElementById("orderPanel")
        .scrollIntoView({ behavior: "smooth" })
    );

  // Cart change listener
  window.cartManager.onCartChange(() => {
    renderCart();
  });
}

function showNotification(message) {
  const notification = document.createElement("div");
  notification.className = "notification";
  notification.textContent = message;
  document.body.appendChild(notification);

  setTimeout(() => notification.classList.add("show"), 10);
  setTimeout(() => {
    notification.classList.remove("show");
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

function initChatbot() {
  const chatbotToggle = document.getElementById("chatbotToggle");
  const chatbotClose = document.getElementById("chatbotClose");
  const chatbotContainer = document.getElementById("chatbotContainer");
  const chatbotInput = document.getElementById("chatbotInput");
  const chatbotSend = document.getElementById("chatbotSend");
  const chatbotMessages = document.getElementById("chatbotMessages");

  if (!chatbotToggle || !chatbotContainer) return;

  chatbotToggle.addEventListener("click", () => {
    chatbotContainer.classList.add("open");
    chatbotToggle.classList.add("hidden");
    chatbotInput.focus();
  });

  chatbotClose.addEventListener("click", () => {
    chatbotContainer.classList.remove("open");
    chatbotToggle.classList.remove("hidden");
  });

  const sendMessage = async () => {
    const message = chatbotInput.value.trim();
    if (!message) return;

    // Add user message
    const userMsg = document.createElement("div");
    userMsg.className = "chatbot-message user";
    userMsg.textContent = message;
    chatbotMessages.appendChild(userMsg);
    chatbotInput.value = "";

    // Scroll to bottom
    chatbotMessages.scrollTop = chatbotMessages.scrollHeight;

    // Show loading
    const loading = document.createElement("div");
    loading.className = "chatbot-loading";
    loading.textContent = "Thinking...";
    chatbotMessages.appendChild(loading);

    // Get user context
    const userContext = {
      userId: currentUser?.uid || null,
      userEmail: currentUser?.email || null,
    };

    // Get orders count if logged in
    if (currentUser) {
      try {
        const orders = await window.firestoreService.getUserOrders(
          currentUser.uid
        );
        userContext.orderCount = orders.length;
        const credits = await window.firestoreService.getUserCredits(
          currentUser.uid
        );
        userContext.credits = credits;
      } catch (error) {
        console.error("Error fetching user context:", error);
      }
    }

    // Get bot response
    const response = await window.chatbotService.getResponse(
      message,
      userContext
    );

    // Remove loading
    loading.remove();

    // Add bot message
    const botMsg = document.createElement("div");
    botMsg.className = "chatbot-message bot";
    botMsg.textContent = response.message;
    chatbotMessages.appendChild(botMsg);

    // Scroll to bottom
    chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
  };

  chatbotSend.addEventListener("click", sendMessage);
  chatbotInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      sendMessage();
    }
  });
}

function init() {
  // Initialize auth
  window.authService.onAuthStateChanged((user) => {
    renderAuthUI(user);
  });

  // Setup search autocomplete
  setupSearchAutocomplete();

  // Render initial data
  renderItems(items);
  renderTemplates();
  renderCart();
  setDefaultPickup();
  wireEvents();

  // Initialize chatbot
  initChatbot();
}

document.addEventListener("DOMContentLoaded", init);
