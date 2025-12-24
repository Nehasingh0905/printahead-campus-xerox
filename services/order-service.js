// =======================
// ORDER SERVICE
// =======================

class OrderService {
  constructor() {
    this.firestore = window.firestoreService;
    this.storage = window.storageService;
  }

  // Submit order with cart items and files
  async submitOrder(orderData) {
    try {
      const { cartItems, uploadedFiles, userId, paymentMethod } = orderData;

      // Calculate total
      const total = cartItems.reduce((sum, item) => sum + (item.price || 0), 0);

      // If using credits, deduct first
      if (paymentMethod === "credits" && userId) {
        const deductResult = await this.firestore.deductCredits(
          userId,
          total,
          null
        );
        if (!deductResult.success) {
          return { success: false, error: deductResult.error };
        }
      }

      // Upload files first if any - files are stored in Firebase Storage
      let fileUrls = [];
      let orderId = null;

      // Generate a temporary order ID for file organization
      if (uploadedFiles && uploadedFiles.length > 0) {
        // Create order first to get orderId for file storage path
        const tempOrderPayload = {
          userId: userId || null,
          cartItems,
          uploadedFiles: [],
          total,
          customerName: orderData.customerName,
          customerPhone: orderData.customerPhone,
          customerEmail: orderData.customerEmail || null,
          pickupDate: orderData.pickupDate,
          pickupTime: orderData.pickupTime,
          notes: orderData.notes || "",
          paymentMethod: paymentMethod || "cash",
          status: "pending",
          createdAt: firebase.firestore.FieldValue.serverTimestamp(),
          updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
        };

        const createResult = await this.firestore.createOrder(tempOrderPayload);
        if (!createResult.success) {
          return createResult;
        }
        orderId = createResult.orderId;

        // Upload files to Firebase Storage with orderId in path
        const uploadResults = await this.storage.uploadFiles(
          uploadedFiles,
          userId,
          orderId
        );
        fileUrls = uploadResults
          .filter((result) => result.success)
          .map((result) => ({
            url: result.url,
            path: result.path,
            fileName: result.fileName,
            size: result.size,
            type: result.type,
          }));

        // Update order with file URLs
        await this.firestore.db.collection("orders").doc(orderId).update({
          uploadedFiles: fileUrls,
        });
      } else {
        // No files, create order normally
        const orderPayload = {
          userId: userId || null,
          cartItems,
          uploadedFiles: fileUrls,
          total,
          customerName: orderData.customerName,
          customerPhone: orderData.customerPhone,
          customerEmail: orderData.customerEmail || null,
          pickupDate: orderData.pickupDate,
          pickupTime: orderData.pickupTime,
          notes: orderData.notes || "",
          paymentMethod: paymentMethod || "cash",
          createdAt: firebase.firestore.FieldValue.serverTimestamp(),
          updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
        };

        const createResult = await this.firestore.createOrder(orderPayload);
        if (!createResult.success) {
          return createResult;
        }
        orderId = createResult.orderId;
      }

      return {
        success: true,
        orderId: orderId,
        total,
        fileUrls,
      };
    } catch (error) {
      console.error("Error submitting order:", error);
      return { success: false, error: error.message };
    }
  }
}

// Create singleton instance
window.orderService = new OrderService();
