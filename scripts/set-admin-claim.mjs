import fs from "node:fs";
import path from "node:path";
import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

function loadEnvLocal() {
  const envPath = path.resolve(process.cwd(), ".env.local");
  if (!fs.existsSync(envPath)) return;
  const content = fs.readFileSync(envPath, "utf8");
  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const eqIdx = line.indexOf("=");
    if (eqIdx === -1) continue;
    const key = line.slice(0, eqIdx).trim();
    const val = line.slice(eqIdx + 1).trim().replace(/^"|"$/g, "");
    if (!process.env[key]) {
      process.env[key] = val;
    }
  }
}

loadEnvLocal();

const projectId = process.env.FIREBASE_PROJECT_ID?.trim().replace(/^"|"$/g, "");
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL?.trim().replace(/^"|"$/g, "");
let privateKey = process.env.FIREBASE_PRIVATE_KEY?.trim().replace(/^"|"$/g, "");
if (privateKey) {
  privateKey = privateKey.replace(/\\n/g, "\n");
}

if (!projectId || !clientEmail || !privateKey) {
  console.error(
    "Faltan variables FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL o FIREBASE_PRIVATE_KEY en .env.local"
  );
  process.exit(1);
}

const app = getApps().length
  ? getApps()[0]
  : initializeApp({
      credential: cert({ projectId, clientEmail, privateKey }),
    });

const adminAuth = getAuth(app);
const adminDb = getFirestore(app);

async function setClaimForUser(identifier, isAdmin = true) {
  const userRecord = identifier.includes("@")
    ? await adminAuth.getUserByEmail(identifier)
    : await adminAuth.getUser(identifier);

  const existingClaims = userRecord.customClaims || {};
  await adminAuth.setCustomUserClaims(userRecord.uid, {
    ...existingClaims,
    admin: isAdmin,
  });

  const userRef = adminDb.collection("users").doc(userRecord.uid);
  const doc = await userRef.get();
  if (doc.exists) {
    await userRef.update({ rol: isAdmin ? "admin" : "cliente" });
  } else {
    await userRef.set({
      uid: userRecord.uid,
      email: userRecord.email || "",
      nombre: userRecord.displayName || "Administrador",
      rol: isAdmin ? "admin" : "cliente",
      telefono: null,
      createdAt: new Date(),
    });
  }

  console.log(
    `[OK] Usuario ${userRecord.email || userRecord.uid} (uid: ${userRecord.uid}) -> claim admin=${isAdmin}, rol=${
      isAdmin ? "admin" : "cliente"
    }`
  );
}

async function syncAllFirestoreAdmins() {
  const snapshot = await adminDb
    .collection("users")
    .where("rol", "==", "admin")
    .get();

  if (snapshot.empty) {
    console.log(
      "No se encontraron documentos con rol == 'admin' en la colección users."
    );
    console.log(
      "Uso para promover un usuario específico: node scripts/set-admin-claim.mjs <correo-o-uid>"
    );
    return;
  }

  for (const doc of snapshot.docs) {
    const data = doc.data();
    await setClaimForUser(doc.id, true);
  }
}

async function main() {
  const args = process.argv.slice(2);
  if (args.length === 0 || args[0] === "--sync-all") {
    await syncAllFirestoreAdmins();
    return;
  }

  if (args[0] === "--revoke" && args[1]) {
    await setClaimForUser(args[1], false);
    return;
  }

  await setClaimForUser(args[0], true);
}

main().catch((err) => {
  console.error("Error ejecutando set-admin-claim:", err.message || err);
  process.exit(1);
});
