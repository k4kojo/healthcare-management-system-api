import admin from "firebase-admin";
import {
  FIREBASE_ADMIN_CREDENTIALS,
  FIREBASE_ADMIN_PROJECT_ID,
  FIREBASE_ADMIN_CLIENT_EMAIL,
  FIREBASE_ADMIN_PRIVATE_KEY,
  NODE_ENV,
} from "./env.js";

function buildCredential() {
  // Prefer full JSON credentials provided via env (raw JSON or base64-encoded JSON)
  if (FIREBASE_ADMIN_CREDENTIALS) {
    try {
      let jsonStr = FIREBASE_ADMIN_CREDENTIALS;
      if (!jsonStr.trim().startsWith("{")) {
        // Likely base64-encoded
        const decoded = Buffer.from(jsonStr, "base64").toString("utf8");
        jsonStr = decoded;
      }
      const serviceAccount = JSON.parse(jsonStr);
      return admin.credential.cert(serviceAccount);
    } catch (e) {
      if (NODE_ENV === "development") {
        console.warn("Failed to parse FIREBASE_ADMIN_CREDENTIALS env. Falling back.");
      }
    }
  }

  // Or individual fields provided via env
  if (
    FIREBASE_ADMIN_PROJECT_ID &&
    FIREBASE_ADMIN_CLIENT_EMAIL &&
    FIREBASE_ADMIN_PRIVATE_KEY
  ) {
    const privateKey = FIREBASE_ADMIN_PRIVATE_KEY.replace(/\\n/g, "\n");
    return admin.credential.cert({
      projectId: FIREBASE_ADMIN_PROJECT_ID,
      clientEmail: FIREBASE_ADMIN_CLIENT_EMAIL,
      privateKey,
    });
  }

  // Fallback: use application default credentials (GOOGLE_APPLICATION_CREDENTIALS)
  return admin.credential.applicationDefault();
}

if (!admin.apps.length) {
  const credential = buildCredential();
  admin.initializeApp({ credential });
  if (NODE_ENV === "development") {
    console.log("Firebase Admin initialized");
  }
}

export default admin;
