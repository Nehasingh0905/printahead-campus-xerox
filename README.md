# PrintAhead - Full-Stack Print Ordering System

A complete full-stack web application for ordering stationery and print services, built with Firebase (Firestore, Storage, Auth) and modular JavaScript.

## Features

- ✅ **Firebase Integration**: Firestore, Storage, and Authentication
- ✅ **Cart Persistence**: Cart saved in localStorage
- ✅ **Order Management**: Submit orders with file uploads to Firebase Storage
- ✅ **Admin Dashboard**: Protected admin panel for order management
- ✅ **Email Notifications**: Cloud Functions for order confirmations
- ✅ **AI Print Suggestions**: Google Gemini API integration for intelligent print recommendations
- ✅ **User Authentication**: Email/password and Google Sign-In
- ✅ **Print Credit Wallet**: Pre-load credits for easy payments
- ✅ **Mobile Responsive**: Optimized for all devices
- ✅ **Search Autocomplete**: Smart search with suggestions

## Setup Instructions

### 1. Firebase Project Setup

1. Create a new Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable the following services:
   - **Authentication**: Enable Email/Password and Google Sign-In providers
   - **Firestore Database**: Create database in production mode
   - **Storage**: Create storage bucket with default rules
   - **Cloud Functions**: Enable if deploying functions

### 2. Firebase Configuration

1. Go to Firebase Console > Project Settings > General
2. Scroll to "Your apps" and click the web icon (</>)
3. Register your app and copy the configuration
4. Open `config/firebase-config.js` and replace the placeholder values:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY_HERE",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID",
};
```

### 3. Firestore Security Rules

Set up Firestore security rules in Firebase Console > Firestore Database > Rules:

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

### 4. Storage Security Rules

Set up Storage security rules in Firebase Console > Storage > Rules:

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

### 5. Google Gemini API (Optional but Recommended)

For AI-powered print suggestions using Google Gemini:

1. Get API key from [Google AI Studio](https://aistudio.google.com/app/apikey) (new) or [MakerSuite](https://makersuite.google.com/app/apikey) (legacy)
2. Open `services/ai-service.js` and replace:
   ```javascript
   this.apiKey = "YOUR_GEMINI_API_KEY_HERE";
   ```
3. The service uses **Gemini 1.5 Flash** by default (fast and free tier available)
   - To use Gemini 1.5 Pro for more complex reasoning, change:
   ```javascript
   this.model = "gemini-1.5-pro";
   ```

**Features:**

- Analyzes file type, name, and size to suggest optimal print settings
- Provides intelligent recommendations for color, sides, binding, quality, etc.
- Automatically applies suggestions to the print form
- Falls back to rule-based suggestions if API key is not configured or unavailable

**Note**: The app will work without the API key - it will use fallback suggestions based on file type patterns.

### 6. Set Up Admin User

To create an admin user, manually update the user document in Firestore:

1. Sign up a user through the app
2. Go to Firestore Console > `users` collection
3. Find the user document and add: `role: "admin"`

Alternatively, use Firebase CLI:

```bash
firebase firestore:set users/ADMIN_USER_ID {role: "admin"} --project YOUR_PROJECT_ID
```

### 7. Cloud Functions Setup (Email Notifications)

#### Option A: Using Gmail

1. Enable 2-factor authentication on your Gmail account
2. Generate an App Password: [Google Account Settings](https://myaccount.google.com/apppasswords)
3. Deploy functions and set config:

```bash
cd functions
npm install
cd ..

# Set email configuration
firebase functions:config:set email.user="your-email@gmail.com"
firebase functions:config:set email.password="your-app-password"

# Deploy functions
firebase deploy --only functions
```

#### Option B: Using SendGrid (Recommended for Production)

1. Sign up at [SendGrid](https://sendgrid.com/)
2. Create API key
3. Update `functions/index.js` to use SendGrid (instructions in file)
4. Set config:

```bash
firebase functions:config:set sendgrid.key="YOUR_SENDGRID_API_KEY"
```

### 8. Local Development

1. Serve the app using any static file server:

```bash
# Using Python
python -m http.server 8000

# Using Node.js (http-server)
npx http-server

# Using VS Code Live Server extension
```

2. Open `http://localhost:8000` in your browser

### 9. Testing Cloud Functions Locally (Optional)

```bash
cd functions
npm install
npm run serve
```

## Project Structure

```
Project cursor/
├── config/
│   └── firebase-config.js       # Firebase configuration
├── services/
│   ├── auth-service.js          # Authentication service
│   ├── firestore-service.js     # Firestore database service
│   ├── storage-service.js       # Firebase Storage service
│   ├── order-service.js         # Order submission service
│   └── ai-service.js            # AI print suggestions
├── utils/
│   └── cart-manager.js          # Cart with localStorage persistence
├── functions/
│   ├── index.js                 # Cloud Functions for emails
│   └── package.json             # Functions dependencies
├── index.html                   # Main app page
├── admin.html                   # Admin dashboard
├── app.js                       # Main application logic
├── style.css                    # Styles
├── admin.css                    # Admin dashboard styles
└── README.md                    # This file
```

## Usage

### For Customers

1. **Sign Up/Sign In**: Create an account or sign in with Google
2. **Browse Items**: Search and filter stationery items
3. **Add to Cart**: Items persist even after page refresh
4. **Upload Files**: Upload documents for printing (AI suggests optimal settings)
5. **Pay with Credits**: Add credits to wallet and use for payments
6. **Submit Order**: Fill in pickup details and submit
7. **Receive Notifications**: Get email confirmations

### For Admins

1. **Sign In**: Use admin account credentials
2. **Access Dashboard**: Click "Admin" link in header (only visible to admins)
3. **View Orders**: See all orders with filtering options
4. **Update Status**: Mark orders as processing, ready, or completed
5. **Track Statistics**: View daily order statistics

## Key Features Explained

### Cart Persistence

- Cart is automatically saved to localStorage
- Items persist across page refreshes
- Cart is synced in real-time across the app

### Print Credit Wallet

- Users can add credits (₹100, ₹250, ₹500, ₹1000)
- Credits are stored in Firestore
- Transactions are tracked for audit
- Credits can be used to pay for orders

### AI Print Suggestions

- Analyzes file type, name, and size
- Suggests optimal print settings (color, sides, copies, etc.)
- Falls back to rule-based suggestions if API unavailable

### Admin Dashboard

- Protected route - only accessible to admin users
- Real-time order updates
- Filter by status and date
- Update order status with email notifications

### Email Notifications

- Order confirmation sent when order is created
- Ready notification sent when order status changes to "ready"
- HTML email templates with order details

## Troubleshooting

### Firebase Not Initialized

- Check that Firebase SDK scripts are loaded before your config
- Verify Firebase configuration values are correct

### Authentication Not Working

- Ensure Email/Password and Google Sign-In are enabled in Firebase Console
- Check browser console for errors

### File Upload Fails

- Verify Storage rules allow writes
- Check file size limits (default is 5MB per file in Firebase Storage)

### Email Not Sending

- Check Cloud Functions logs: `firebase functions:log`
- Verify email configuration is set correctly
- For Gmail, ensure App Password is used (not regular password)

### Admin Dashboard Access Denied

- Ensure user document has `role: "admin"` field in Firestore

## Security Notes

- Never commit Firebase config or API keys to version control
- Use environment variables for sensitive data in production
- Regularly review Firestore and Storage security rules
- Implement rate limiting for production use
- Use Firebase App Check for additional protection

## License

This project is provided as-is for educational and commercial use.

## Support

For issues or questions, please check:

- Firebase Documentation: https://firebase.google.com/docs
- Firebase Support: https://firebase.google.com/support
