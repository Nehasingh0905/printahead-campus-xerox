// =======================
// AUTHENTICATION SERVICE
// =======================

class AuthService {
  constructor() {
    this.auth = firebase.auth();
    this.db = firebase.firestore();
    this.user = null;
    this.listeners = [];
  }

  // Listen to auth state changes
  onAuthStateChanged(callback) {
    return this.auth.onAuthStateChanged(async (user) => {
      if (user) {
        // Fetch user document from Firestore
        const userDoc = await this.db.collection("users").doc(user.uid).get();
        this.user = {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          ...(userDoc.exists ? userDoc.data() : {}),
        };
        // Create user document if it doesn't exist
        if (!userDoc.exists) {
          await this.db.collection("users").doc(user.uid).set({
            email: user.email,
            displayName: user.displayName,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            credits: 0,
            role: "customer",
          });
        }
      } else {
        this.user = null;
      }
      callback(this.user);
      this.listeners.forEach((listener) => listener(this.user));
    });
  }

  // Register auth state listener
  addAuthListener(callback) {
    this.listeners.push(callback);
    if (this.user !== null) {
      callback(this.user);
    }
  }

  // Get current user
  getCurrentUser() {
    return this.user;
  }

  // Sign up with email/password
  async signUp(email, password, displayName) {
    try {
      const userCredential = await this.auth.createUserWithEmailAndPassword(
        email,
        password
      );
      await userCredential.user.updateProfile({ displayName });

      // Create user document
      await this.db.collection("users").doc(userCredential.user.uid).set({
        email,
        displayName,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        credits: 0,
        role: "customer",
      });

      return { success: true, user: userCredential.user };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Sign in with email/password
  async signIn(email, password) {
    try {
      const userCredential = await this.auth.signInWithEmailAndPassword(
        email,
        password
      );
      return { success: true, user: userCredential.user };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Sign in with Google
  async signInWithGoogle() {
    try {
      const provider = new firebase.auth.GoogleAuthProvider();
      const userCredential = await this.auth.signInWithPopup(provider);

      // Create user document if it doesn't exist
      const userDoc = await this.db
        .collection("users")
        .doc(userCredential.user.uid)
        .get();
      if (!userDoc.exists) {
        await this.db.collection("users").doc(userCredential.user.uid).set({
          email: userCredential.user.email,
          displayName: userCredential.user.displayName,
          photoURL: userCredential.user.photoURL,
          createdAt: firebase.firestore.FieldValue.serverTimestamp(),
          credits: 0,
          role: "customer",
        });
      }

      return { success: true, user: userCredential.user };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Sign out
  async signOut() {
    try {
      await this.auth.signOut();
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Check if user is admin
  async isAdmin(uid) {
    try {
      const userDoc = await this.db.collection("users").doc(uid).get();
      return userDoc.exists && userDoc.data().role === "admin";
    } catch (error) {
      console.error("Error checking admin status:", error);
      return false;
    }
  }

  // Reset password
  async resetPassword(email) {
    try {
      await this.auth.sendPasswordResetEmail(email);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

// Create singleton instance
window.authService = new AuthService();
