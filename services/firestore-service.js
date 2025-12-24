// =======================
// FIRESTORE SERVICE
// =======================

class FirestoreService {
  constructor() {
    this.db = firebase.firestore();
  }

  // =======================
  // ORDERS
  // =======================

  // Create a new order
  async createOrder(orderData) {
    try {
      const orderRef = await this.db.collection("orders").add({
        ...orderData,
        status: "pending",
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
      });
      return { success: true, orderId: orderRef.id };
    } catch (error) {
      console.error("Error creating order:", error);
      return { success: false, error: error.message };
    }
  }

  // Get orders for a user
  async getUserOrders(userId) {
    try {
      const snapshot = await this.db
        .collection("orders")
        .where("userId", "==", userId)
        .orderBy("createdAt", "desc")
        .get();

      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
    } catch (error) {
      console.error("Error fetching user orders:", error);
      return [];
    }
  }

  // Get all orders (for admin)
  async getAllOrders(filters = {}) {
    try {
      let query = this.db.collection("orders").orderBy("createdAt", "desc");

      if (filters.status) {
        query = query.where("status", "==", filters.status);
      }

      if (filters.startDate) {
        query = query.where("pickupDate", ">=", filters.startDate);
      }

      if (filters.endDate) {
        query = query.where("pickupDate", "<=", filters.endDate);
      }

      const snapshot = await query.get();
      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
    } catch (error) {
      console.error("Error fetching orders:", error);
      return [];
    }
  }

  // Update order status
  async updateOrderStatus(orderId, status) {
    try {
      await this.db.collection("orders").doc(orderId).update({
        status,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
      });
      return { success: true };
    } catch (error) {
      console.error("Error updating order status:", error);
      return { success: false, error: error.message };
    }
  }

  // Get order by ID
  async getOrder(orderId) {
    try {
      const doc = await this.db.collection("orders").doc(orderId).get();
      if (doc.exists) {
        return { id: doc.id, ...doc.data() };
      }
      return null;
    } catch (error) {
      console.error("Error fetching order:", error);
      return null;
    }
  }

  // =======================
  // USER CREDITS
  // =======================

  // Get user credits
  async getUserCredits(userId) {
    try {
      const userDoc = await this.db.collection("users").doc(userId).get();
      if (userDoc.exists) {
        return userDoc.data().credits || 0;
      }
      return 0;
    } catch (error) {
      console.error("Error fetching user credits:", error);
      return 0;
    }
  }

  // Add credits to user wallet
  async addCredits(userId, amount, transactionType = "purchase") {
    try {
      const userRef = this.db.collection("users").doc(userId);
      await this.db.runTransaction(async (transaction) => {
        const userDoc = await transaction.get(userRef);
        const currentCredits = userDoc.data().credits || 0;
        const newCredits = currentCredits + amount;

        transaction.update(userRef, { credits: newCredits });

        // Create transaction record
        transaction.set(this.db.collection("transactions").doc(), {
          userId,
          amount,
          type: transactionType,
          timestamp: firebase.firestore.FieldValue.serverTimestamp(),
          balanceAfter: newCredits,
        });
      });
      return { success: true };
    } catch (error) {
      console.error("Error adding credits:", error);
      return { success: false, error: error.message };
    }
  }

  // Deduct credits from user wallet
  async deductCredits(userId, amount, orderId) {
    try {
      const userRef = this.db.collection("users").doc(userId);
      const result = await this.db.runTransaction(async (transaction) => {
        const userDoc = await transaction.get(userRef);
        const currentCredits = userDoc.data().credits || 0;

        if (currentCredits < amount) {
          throw new Error("Insufficient credits");
        }

        const newCredits = currentCredits - amount;
        transaction.update(userRef, { credits: newCredits });

        // Create transaction record
        transaction.set(this.db.collection("transactions").doc(), {
          userId,
          amount: -amount,
          type: "order_payment",
          orderId,
          timestamp: firebase.firestore.FieldValue.serverTimestamp(),
          balanceAfter: newCredits,
        });

        return { success: true, newBalance: newCredits };
      });
      return result;
    } catch (error) {
      console.error("Error deducting credits:", error);
      return { success: false, error: error.message };
    }
  }

  // Get user transactions
  async getUserTransactions(userId, limit = 50) {
    try {
      const snapshot = await this.db
        .collection("transactions")
        .where("userId", "==", userId)
        .orderBy("timestamp", "desc")
        .limit(limit)
        .get();

      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
    } catch (error) {
      console.error("Error fetching transactions:", error);
      return [];
    }
  }

  // Update user profile
  async updateUserProfile(userId, data) {
    try {
      await this.db
        .collection("users")
        .doc(userId)
        .update({
          ...data,
          updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
        });
      return { success: true };
    } catch (error) {
      console.error("Error updating user profile:", error);
      return { success: false, error: error.message };
    }
  }
}

// Create singleton instance
window.firestoreService = new FirestoreService();
