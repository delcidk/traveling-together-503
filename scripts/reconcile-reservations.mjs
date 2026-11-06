/**
 * Reconciles existing reservations and trips in Firestore:
 * 1. Backfills denormalized fields (`rutaId`, `rutaNombre`, `fechaSalida`, `vehiculoId`) on all reservations.
 * 2. Recalculates `asientosOcupados` on every trip as the sum of `pasajeros` from non-cancelled reservations.
 *
 * Usage:
 *   node scripts/reconcile-reservations.mjs
 */

import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

function loadEnv() {
  try {
    const envPath = resolve(process.cwd(), ".env.local");
    const raw = readFileSync(envPath, "utf8");
    for (const line of raw.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eqIdx = trimmed.indexOf("=");
      if (eqIdx === -1) continue;
      const key = trimmed.slice(0, eqIdx).trim();
      let val = trimmed.slice(eqIdx + 1).trim();
      if (
        (val.startsWith('"') && val.endsWith('"')) ||
        (val.startsWith("'") && val.endsWith("'"))
      ) {
        val = val.slice(1, -1);
      }
      if (!process.env[key]) {
        process.env[key] = val;
      }
    }
  } catch {
    // rely on existing env vars
  }
}

loadEnv();

const projectId = process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

if (!projectId || !clientEmail || !privateKey) {
  console.error("Missing FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, or FIREBASE_PRIVATE_KEY");
  process.exit(1);
}

const app =
  getApps().length === 0
    ? initializeApp({ credential: cert({ projectId, clientEmail, privateKey }) })
    : getApps()[0];

const db = getFirestore(app);

async function main() {
  const [routesSnap, tripsSnap, reservationsSnap] = await Promise.all([
    db.collection("routes").get(),
    db.collection("trips").get(),
    db.collection("reservations").get(),
  ]);

  const routesMap = new Map();
  for (const doc of routesSnap.docs) {
    routesMap.set(doc.id, doc.data());
  }

  const tripsMap = new Map();
  const occupiedByTrip = new Map();
  for (const doc of tripsSnap.docs) {
    tripsMap.set(doc.id, doc.data());
    occupiedByTrip.set(doc.id, 0);
  }

  let updatedReservations = 0;

  for (const resDoc of reservationsSnap.docs) {
    const data = resDoc.data();
    const tripData = tripsMap.get(data.viajeId);

    if (data.estado !== "cancelada" && data.viajeId && occupiedByTrip.has(data.viajeId)) {
      const prev = occupiedByTrip.get(data.viajeId) || 0;
      occupiedByTrip.set(data.viajeId, prev + Number(data.pasajeros || 0));
    }

    if (tripData) {
      const routeData = tripData.rutaId ? routesMap.get(tripData.rutaId) : null;
      const rutaNombre = routeData
        ? `${routeData.origen} → ${routeData.destino}`
        : data.rutaNombre || "Ruta programada";
      const rutaId = tripData.rutaId || "";
      const fechaSalida = tripData.fechaSalida || null;
      const vehiculoId = tripData.vehiculoId || "";

      const needsUpdate =
        data.rutaId !== rutaId ||
        data.rutaNombre !== rutaNombre ||
        !data.fechaSalida ||
        data.vehiculoId !== vehiculoId;

      if (needsUpdate) {
        await resDoc.ref.update({
          rutaId,
          rutaNombre,
          fechaSalida,
          vehiculoId,
          updatedAt: FieldValue.serverTimestamp(),
        });
        updatedReservations++;
        console.log(`[OK] Backfilled reservation ${resDoc.id} -> ${rutaNombre}`);
      }
    }
  }

  let updatedTrips = 0;
  for (const tripDoc of tripsSnap.docs) {
    const tripData = tripDoc.data();
    const calculatedOccupied = occupiedByTrip.get(tripDoc.id) || 0;
    const currentOccupied = Number(tripData.asientosOcupados || 0);

    if (currentOccupied !== calculatedOccupied) {
      await tripDoc.ref.update({
        asientosOcupados: calculatedOccupied,
        updatedAt: FieldValue.serverTimestamp(),
      });
      updatedTrips++;
      console.log(
        `[OK] Reconciled trip ${tripDoc.id} asientosOcupados: ${currentOccupied} -> ${calculatedOccupied}`
      );
    }
  }

  console.log(
    `Done. Reservations backfilled: ${updatedReservations}/${reservationsSnap.size}, Trips reconciled: ${updatedTrips}/${tripsSnap.size}.`
  );
}

main().catch((err) => {
  console.error("Error reconciling reservations:", err);
  process.exit(1);
});
