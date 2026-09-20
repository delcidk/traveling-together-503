import { adminAuth, adminDb } from "./src/lib/firebase-admin";

async function check() {
  console.log("--- FIREBASE AUTH USERS ---");
  const listUsersResult = await adminAuth.listUsers(10);
  listUsersResult.users.forEach((userRecord) => {
    console.log(`Email: ${userRecord.email}, UID: ${userRecord.uid}``);
  });

  console.log("\n--- FIRESTORE USERS ---");
  const snapshot = await adminDb.collection("users").get();
  snapshot.forEach((doc) => {
    console.log(`Doc ID: ${doc.id}, Email: ${doc.data().email}, Rol: ${doc.data().rol}``);
  });
}

check().then(() => process.exit(0)).catch(console.error);
