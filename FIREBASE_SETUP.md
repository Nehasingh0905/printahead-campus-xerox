# Firebase Configuration Guide

This guide will walk you through setting up Firebase for your PrintAhead application.

## Step 1: Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **"Add project"** or **"Create a project"**
3. Enter a project name (e.g., "printahead" or "campus-printing")
4. (Optional) Disable Google Analytics if you don't need it
5. Click **"Create project"**
6. Wait for the project to be created (usually takes a few seconds)

## Step 2: Register Your Web App

1. In your Firebase project dashboard, click the **Web icon** (`</>` or "Add app" → Web)
2. Register your app with a nickname (e.g., "PrintAhead Web")
3. **Do NOT check** "Also set up Firebase Hosting" for now
4. Click **"Register app"**
5. You'll see your Firebase configuration object - **COPY THIS** (you'll need it in the next step)

The configuration looks like this:
```javascript
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
};
```

## Step 3: Configure Your App

1. Open `config/firebase-config.js` in your project
2. Replace the placeholder values with your actual Firebase configuration:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY_HERE",           // ← Paste your apiKey
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",  // ← Paste your authDomain
  projectId: "YOUR_PROJECT_ID",          // ← Paste your projectId
  storageBucket: "YOUR_PROJECT_ID.appspot.com",  // ← Paste your storageBucket
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID", // ← Paste your messagingSenderId
  appId: "YOUR_APP_ID"                   // ← Paste your appId
};
```

**Important:** Replace ALL the placeholder text with values from your Firebase console.

## Step 4: Enable Authentication

1. In Firebase Console, go to **Authentication** (left sidebar)
2. Click **"Get started"**
3. Go to the **"Sign-in method"** tab
4. Enable the following providers:

### Email/Password:
- Click on **"Email/Password"**
- Toggle **"Enable"** to ON
- Click **"Save"**

### Google Sign-In:
- Click on **"Google"**
- Toggle **"Enable"** to ON
- Enter a **Support email** (your email)
- Click **"Save"**

## Step 5: Create Firestore Database

1. In Firebase Console, go to **Firestore Database** (left sidebar)
2. Click **"Create database"**
3. Choose **"Start in production mode"** (we'll add security rules next)
4. Select a **location** closest to your users (e.g., "us-central" for US, "asia-south1" for India)
5. Click **"Enable"**

### Set Firestore Security Rules:

1. Go to **Firestore Database** → **Rules** tab
2. Replace the default rules with these:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own user document
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Orders - users can create and read their own orders
    match /orders/{orderId} {
      allow create: if request.auth != null;
      allow read: if request.auth != null && 
        (resource.data.userId == request.auth.uid || 
         get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin');
      allow update: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // Transactions - users can read their own transactions
    match /transactions/{transactionId} {
      allow read: if request.auth != null && resource.data.userId == request.auth.uid;
      allow create: if request.auth != null && request.resource.data.userId == request.auth.uid;
    }
  }
}
```

3. Click **"Publish"**

## Step 6: Set Up Firebase Storage

1. In Firebase Console, go to **Storage** (left sidebar)
2. Click **"Get started"**
3. Choose **"Start in production mode"**
4. Use the same location as Firestore
5. Click **"Done"**

### Set Storage Security Rules:

1. Go to **Storage** → **Rules** tab
2. Replace the default rules with these:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /orders/{orderId}/{allPaths=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
    match /uploads/{userId}/{allPaths=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

3. Click **"Publish"**

## Step 7: Create an Admin User (Optional but Recommended)

After you sign up as a regular user:

1. In Firebase Console, go to **Firestore Database** → **Data** tab
2. Click on the **"users"** collection
3. Find your user document (it will have your user ID as the document ID)
4. Click on the document
5. Click **"Add field"**
   - Field name: `role`
   - Field type: `string`
   - Value: `admin`
6. Click **"Update"**

Now you'll have admin access to the admin dashboard!

## Step 8: Test Your Configuration

1. Open `index.html` in your browser (using a local server)
2. Try signing up with a new email
3. Check Firestore Database → **Data** tab to see if a user document was created
4. Try adding items to cart
5. Try submitting an order
6. Check if orders appear in Firestore

## Step 9: (Optional) Set Up Cloud Functions for Email

If you want email notifications:

1. Install Firebase CLI:
   ```bash
   npm install -g firebase-tools
   ```

2. Login to Firebase:
   ```bash
   firebase login
   ```

3. Initialize Functions:
   ```bash
   cd functions
   npm install
   cd ..
   firebase init functions
   ```
   - Select your existing project
   - Choose JavaScript
   - Say yes to ESLint (optional)

4. Configure email settings (for Gmail):
   ```bash
   firebase functions:config:set email.user="your-email@gmail.com"
   firebase functions:config:set email.password="your-app-password"
   ```
   
   **Note:** For Gmail, you need to:
   - Enable 2-factor authentication
   - Generate an App Password at: https://myaccount.google.com/apppasswords

5. Deploy functions:
   ```bash
   firebase deploy --only functions
   ```

## Troubleshooting

### "Firebase: Error (auth/invalid-api-key)"
- Double-check that you copied the correct API key from Firebase Console
- Make sure there are no extra spaces or quotes in `firebase-config.js`

### "Missing or insufficient permissions"
- Check that you've set up Firestore and Storage security rules
- Make sure you've clicked "Publish" on the rules

### "Firebase: Error (auth/operation-not-allowed)"
- Make sure you've enabled Email/Password or Google sign-in in Authentication → Sign-in method

### Files not uploading
- Check Storage rules are published
- Make sure Storage is enabled in Firebase Console

### Admin dashboard shows "Access denied"
- Make sure you've added `role: "admin"` to your user document in Firestore

## Quick Checklist

- [ ] Firebase project created
- [ ] Web app registered
- [ ] Configuration copied to `config/firebase-config.js`
- [ ] Authentication enabled (Email/Password + Google)
- [ ] Firestore Database created and rules set
- [ ] Storage created and rules set
- [ ] Admin user created (optional)
- [ ] Tested sign up/login
- [ ] Tested order submission

## Need Help?

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firebase Support](https://firebase.google.com/support)
- Check browser console for specific error messages

