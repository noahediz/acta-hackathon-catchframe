import admin from 'firebase-admin';

// This file sets up a connection to the Firebase Admin SDK, which is used for
// secure server-side operations like fetching data from Firestore.

// Service account credentials are required to authenticate the Admin SDK.
// These should be stored securely in an environment variable, not in the code.
const serviceAccountString = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;

if (!serviceAccountString) {
  throw new Error('FIREBASE_SERVICE_ACCOUNT_JSON environment variable not set.');
}

const serviceAccount = JSON.parse(serviceAccountString);

// To prevent re-initializing the app on every hot-reload in development,
// we check if an app is already initialized.
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

// Export the initialized Firestore database instance for use in our server components.
const db = admin.firestore();

export { db };
