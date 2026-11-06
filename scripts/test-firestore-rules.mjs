import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const rootDir = process.cwd();
const rulesPath = path.join(rootDir, "firestore.rules");
const indexesPath = path.join(rootDir, "firestore.indexes.json");
const firebaseJsonPath = path.join(rootDir, "firebase.json");

const rules = fs.readFileSync(rulesPath, "utf8");
const indexes = JSON.parse(fs.readFileSync(indexesPath, "utf8"));
const firebaseJson = JSON.parse(fs.readFileSync(firebaseJsonPath, "utf8"));

// 1. Verificar configuración base de firebase.json
assert.equal(firebaseJson.firestore.rules, "firestore.rules");
assert.equal(firebaseJson.firestore.indexes, "firestore.indexes.json");

// 2. Verificar balance de llaves y versión en firestore.rules
assert.match(rules, /rules_version\s*=\s*'2';/);
const openBraces = (rules.match(/\{/g) || []).length;
const closeBraces = (rules.match(/\}/g) || []).length;
assert.equal(
  openBraces,
  closeBraces,
  `Desbalance de llaves en firestore.rules: {=${openBraces}, }=${closeBraces}`
);

// 3. Verificar invariantes de seguridad requeridas
assert.match(
  rules,
  /request\.auth\.token\.admin\s*==\s*true/,
  "Las reglas deben validar el Custom Claim `admin == true`"
);
assert.match(
  rules,
  /data\.rol\s*==\s*'cliente'/,
  "La creación de perfil por un cliente debe forzar rol == 'cliente'"
);
assert.match(
  rules,
  /incoming\.rol\s*==\s*current\.rol/,
  "La actualización de perfil por el dueño debe impedir cambiar el rol"
);
assert.match(
  rules,
  /resource\.data\.userId\s*==\s*request\.auth\.uid/,
  "Las reservaciones solo pueden ser leídas por su dueño (userId == uid) o admin"
);
assert.match(
  rules,
  /match\s+\/\{document=\*\*\}\s*\{\s*allow\s+read,\s*write:\s*if\s+false;/s,
  "Debe existir la regla por defecto deny-all"
);

// 4. Verificar índices compuestos críticos
assert.ok(Array.isArray(indexes.indexes), "indexes debe ser un arreglo");
const hasUserReservationsIdx = indexes.indexes.some(
  (idx) =>
    idx.collectionGroup === "reservations" &&
    idx.fields?.[0]?.fieldPath === "userId" &&
    idx.fields?.[1]?.fieldPath === "createdAt" &&
    idx.fields?.[1]?.order === "DESCENDING"
);
assert.ok(
  hasUserReservationsIdx,
  "Falta índice compuesto reservations (userId ASC, createdAt DESC)"
);

const hasRouteTripsIdx = indexes.indexes.some(
  (idx) =>
    idx.collectionGroup === "trips" &&
    idx.fields?.[0]?.fieldPath === "rutaId" &&
    idx.fields?.[1]?.fieldPath === "fechaSalida"
);
assert.ok(
  hasRouteTripsIdx,
  "Falta índice compuesto trips (rutaId ASC, fechaSalida ASC)"
);

console.log(
  "[OK] Validación de firestore.rules, firestore.indexes.json y firebase.json superada correctamente."
);
