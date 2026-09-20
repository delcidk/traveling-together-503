import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

const projectId = process.env.FIREBASE_PROJECT_ID?.trim()?.replace(/^"|"$/g, '');
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL?.trim()?.replace(/^"|"$/g, '');
let privateKey = process.env.FIREBASE_PRIVATE_KEY?.trim()?.replace(/^"|"$/g, '');

// Manejar saltos de línea 
if (privateKey) {
  privateKey = privateKey.replace(/\\n/g, '\n');
}

const app = !getApps().length
  ? initializeApp({
      credential: cert({
        projectId,
        clientEmail,
        privateKey,
      }),
    })
  : getApps()[0];

export const adminDb = getFirestore(app);
