import { initializeApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getAnalytics, isSupported } from "firebase/analytics";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

function getFirebaseApp() {
  if (getApps().length > 0) {
    return getApps()[0];
  }

  const hasConfig = Object.values(firebaseConfig).some(
    (v) => v !== undefined && v !== ""
  );

  if (!hasConfig) {
    console.warn(
      "Firebase config not found. Set env vars in .env.local. Running in mock mode."
    );
    return null;
  }

  return initializeApp(firebaseConfig);
}

const app = getFirebaseApp();

export const db = app ? getFirestore(app) : null;
export const auth = app ? getAuth(app) : null;

// Initialize Analytics client-side only
export const analytics = typeof window !== "undefined" && app
  ? isSupported().then((supported) => (supported ? getAnalytics(app) : null))
  : null;

export { app };
