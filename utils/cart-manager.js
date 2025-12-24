// =======================
// CART MANAGER
// =======================
// Manages cart state with localStorage persistence

class CartManager {
  constructor() {
    this.storageKey = "printahead_cart";
    this.cart = this.loadCart();
    this.listeners = [];
  }

  // Load cart from localStorage
  loadCart() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error("Error loading cart from localStorage:", error);
      return [];
    }
  }

  // Save cart to localStorage
  saveCart() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.cart));
      this.notifyListeners();
    } catch (error) {
      console.error("Error saving cart to localStorage:", error);
    }
  }

  // Add item to cart
  addItem(item) {
    const cartItem = {
      ...item,
      id: item.id || crypto.randomUUID(),
      addedAt: new Date().toISOString(),
    };
    this.cart.push(cartItem);
    this.saveCart();
    return cartItem;
  }

  // Remove item from cart
  removeItem(itemId) {
    const index = this.cart.findIndex((item) => item.id === itemId);
    if (index !== -1) {
      this.cart.splice(index, 1);
      this.saveCart();
      return true;
    }
    return false;
  }

  // Update item quantity (for future use)
  updateQuantity(itemId, quantity) {
    const item = this.cart.find((item) => item.id === itemId);
    if (item) {
      item.quantity = quantity;
      this.saveCart();
      return true;
    }
    return false;
  }

  // Get all cart items
  getItems() {
    return [...this.cart];
  }

  // Get cart total
  getTotal() {
    return this.cart.reduce((sum, item) => sum + (item.price || 0), 0);
  }

  // Get cart count
  getCount() {
    return this.cart.length;
  }

  // Clear cart
  clear() {
    this.cart = [];
    this.saveCart();
  }

  // Register listener for cart changes
  onCartChange(callback) {
    this.listeners.push(callback);
    // Call immediately with current state
    callback(this.cart, this.getTotal());
  }

  // Notify all listeners
  notifyListeners() {
    this.listeners.forEach((listener) => {
      listener(this.cart, this.getTotal());
    });
  }
}

// Create singleton instance
window.cartManager = new CartManager();
