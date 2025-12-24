# Quick Setup Guide

## Step-by-Step Configuration

### 1. Firebase Setup (5 minutes)

1. **Create Firebase Project**

   - Go to https://console.firebase.google.com/
   - Click "Add project"
   - Enter project name (e.g., "printahead")
   - Disable Google Analytics (optional)
   - Click "Create project"

2. **Enable Services**

   - **Authentication**:

     - Click "Authentication" > "Get started"
     - Enable "Email/Password"
     - Enable "Google" (add your OAuth consent screen)

   - **Firestore Database**:

     - Click "Firestore Database" > "Create database"
     - Start in "Production mode" (we'll add rules)
     - Choose location closest to your users

   - **Storage**:
     - Click "Storage" > "Get started"
     - Start in "Production mode"
     - Use same location as Firestore

3. **Get Configuration**

   - Go to Project Settings (gear icon) > General
   - Scroll to "Your apps" > Click web icon `</>`
   - Register app (nickname: "PrintAhead Web")
   - Copy the `firebaseConfig` object

4. **Configure App**
   - Open `config/firebase-config.js`
   - Paste your Firebase config values

### 2. Set Security Rules (2 minutes)

**Firestore Rules:**

1. Go to Firestore Database > Rules
2. Replace with rules from README.md (Section 3)

**Storage Rules:**

1. Go to Storage > Rules
2. Replace with rules from README.md (Section 4)

### 3. Create Admin User (1 minute)

**After first user signs up:**

1. Go to Firestore Database > Data
2. Open `users` collection
3. Find your user document
4. Click "Add field"
   - Field: `role`
   - Type: `string`
   - Value: `admin`

### 4. Optional: AI Integration with Gemini (2 minutes)

1. Get API key from https://aistudio.google.com/app/apikey (recommended) or https://makersuite.google.com/app/apikey (legacy)
2. Open `services/ai-service.js`
3. Replace `YOUR_GEMINI_API_KEY_HERE` with your API key
4. The service uses Gemini 1.5 Flash by default (fast, free tier available)
   - For more advanced reasoning, you can change to `gemini-1.5-pro` in the same file

**Note**: Works without API key - falls back to rule-based suggestions

### 5. Optional: Email Notifications (10 minutes)

**For Gmail:**

1. Enable 2FA on your Gmail
2. Generate App Password: https://myaccount.google.com/apppasswords
3. Install Firebase CLI: `npm install -g firebase-tools`
4. Login: `firebase login`
5. Initialize: `firebase init functions` (select existing project)
6. Set config:
   ```bash
   firebase functions:config:set email.user="your-email@gmail.com"
   firebase functions:config:set email.password="your-app-password"
   ```
7. Deploy: `firebase deploy --only functions`

### 6. Test the App

1. Start a local server:

   ```bash
   python -m http.server 8000
   # or
   npx http-server
   ```

2. Open http://localhost:8000

3. Test features:

   - Sign up a new user
   - Browse items and add to cart
   - Upload a file (check AI suggestions)
   - Add credits to wallet
   - Submit an order
   - Check Firestore to see order created

4. Test admin:
   - Set your user as admin (Step 3)
   - Refresh page
   - Click "Admin" link
   - View and update orders

## Common Issues

**"Firebase: Error (auth/invalid-api-key)"**

- Check `config/firebase-config.js` has correct values

**"Missing or insufficient permissions"**

- Check Firestore/Storage rules are deployed

**Admin link not showing**

- Verify user document has `role: "admin"` field

**Email not sending**

- Check Cloud Functions logs: `firebase functions:log`
- Verify email config is set

**File upload fails**

- Check Storage rules allow writes
- Check file size (default limit is 5MB)

## Next Steps

- Customize items in `app.js` (items array)
- Customize email templates in `functions/index.js`
- Add more print templates
- Customize styling in `style.css`
- Deploy to Firebase Hosting: `firebase deploy --only hosting`
