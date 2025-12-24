// =======================
// FIREBASE STORAGE SERVICE
// =======================

class StorageService {
  constructor() {
    this.storage = firebase.storage();
  }

  // Upload file to Firebase Storage
  async uploadFile(file, userId, orderId = null) {
    try {
      const timestamp = Date.now();
      const fileName = `${timestamp}_${file.name}`;
      const path = orderId
        ? `orders/${orderId}/${fileName}`
        : `uploads/${userId}/${fileName}`;

      const storageRef = this.storage.ref(path);
      const uploadTask = storageRef.put(file);

      return new Promise((resolve, reject) => {
        uploadTask.on(
          "state_changed",
          (snapshot) => {
            // Progress tracking (optional)
            const progress =
              (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            console.log(`Upload progress: ${progress}%`);
          },
          (error) => {
            console.error("Upload error:", error);
            reject({ success: false, error: error.message });
          },
          async () => {
            try {
              const downloadURL =
                await uploadTask.snapshot.ref.getDownloadURL();
              resolve({
                success: true,
                url: downloadURL,
                path: path,
                fileName: file.name,
                size: file.size,
                type: file.type,
              });
            } catch (error) {
              reject({ success: false, error: error.message });
            }
          }
        );
      });
    } catch (error) {
      console.error("Error uploading file:", error);
      return { success: false, error: error.message };
    }
  }

  // Upload multiple files
  async uploadFiles(files, userId, orderId = null) {
    try {
      const uploadPromises = Array.from(files).map((file) =>
        this.uploadFile(file, userId, orderId)
      );
      const results = await Promise.all(uploadPromises);
      return results;
    } catch (error) {
      console.error("Error uploading files:", error);
      return [];
    }
  }

  // Delete file from Storage
  async deleteFile(path) {
    try {
      const storageRef = this.storage.ref(path);
      await storageRef.delete();
      return { success: true };
    } catch (error) {
      console.error("Error deleting file:", error);
      return { success: false, error: error.message };
    }
  }

  // Get file metadata
  async getFileMetadata(path) {
    try {
      const storageRef = this.storage.ref(path);
      const metadata = await storageRef.getMetadata();
      return { success: true, metadata };
    } catch (error) {
      console.error("Error getting file metadata:", error);
      return { success: false, error: error.message };
    }
  }
}

// Create singleton instance
window.storageService = new StorageService();
