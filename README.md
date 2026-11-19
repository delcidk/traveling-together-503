Enlace al documento PDF de Etapa 3: https://drive.google.com/file/d/1KOHLDgFJIulyrLJw6d-6d-y6ccrckkes/view?usp=drive_link
Enlace al vídeo de explicación: https://youtu.be/zgtcTXS0PQI

# Traveling Together 503 — Solución Multiplataforma (Web + Móvil)

![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![React Native](https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Firebase](https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)
[![License: CC BY-NC-SA 4.0](https://img.shields.io/badge/License-CC_BY--NC--SA_4.0-lightgrey.svg?style=for-the-badge)](https://creativecommons.org/licenses/by-nc-sa/4.0/deed.es)

**Traveling Together 503** es una solución multiplataforma (Web en **React + Next.js** y Móvil en **React Native + Expo**) desarrollada para gestionar los servicios de una agencia de transporte privado para turistas y viajeros en Centroamérica (El Salvador, Guatemala, Nicaragua).

- 🌐 **Producción Web (Vercel):** https://traveling-together-503.vercel.app/
- 📱 **Aplicación Móvil (Android / React Native):** Directorio [`mobile/`](./mobile)

---

## ✅ Cumplimiento de Requerimientos — Entrega Final

| # | Requerimiento | Implementación en el Repositorio |
|---|---|---|
| 1 | **Versión web funcional en React + Next.js desplegada en Vercel** | App Router en [`src/app/`](./src/app) + API REST en [`src/app/api/`](./src/app/api), desplegada en [traveling-together-503.vercel.app](https://traveling-together-503.vercel.app/). |
| 2 | **Versión móvil funcional en React Native con Firebase integrado** | App nativa en [`mobile/`](./mobile) con Expo SDK 57, Expo Router, Firebase Auth (`AsyncStorage`) y Firestore (`onSnapshot`). |
| 3 | **Autenticación completa (correo y redes sociales) en ambas plataformas** | Email/Password + **Google Sign-In** tanto en Web (`signInWithPopup` en [`useAuthLogic.ts`](./src/app/hooks/useAuthLogic.ts)) como en Móvil (`@react-native-google-signin/google-signin` en [`mobile/src/context/AuthContext.tsx`](./mobile/src/context/AuthContext.tsx)), con auto-creación idempotente de perfil en `users/{uid}`. |
| 4 | **Módulos principales y secundarios implementados y funcionales** | **Cliente:** Catálogo con filtros por categoría y buscador, Detalle con galería y Cotizador WhatsApp, Mis Reservas con filtros/cancelación y Mi Perfil (`/perfil`). **Admin:** Dashboard de métricas y CRUD completo de Flota, Rutas, Viajes Programados y Reservaciones en Web y Móvil. |
| 5 | **Persistencia de datos en Firestore compartida entre web y móvil** | Colecciones compartidas (`users`, `routes`, `vehicles`, `trips`, `reservations`), transacciones atómicas de cupo (`adminDb.runTransaction`) y reglas de seguridad en [`firestore.rules`](./firestore.rules). |
| 6 | **Implementación de Licencia Creative Commons en el repositorio** | Licencia **CC BY-NC-SA 4.0** en [`LICENSE`](./LICENSE), metadatos SPDX en `package.json` y aviso legal en pies de página Web y Móvil. |

---

## Características Principales

### Módulo de Autenticación y Roles
- Registro, inicio de sesión con correo/contraseña, recuperación de contraseña, verificación de correo e **inicio de sesión con Google** en Web y Móvil.
- Sistema de rutas protegidas mediante `Context API`, middleware [`src/proxy.ts`](./src/proxy.ts) y Firebase Custom Claims (`admin: true`).
- **Dos roles de usuario:** `Administrador` y `Cliente`, cada uno con vistas y permisos estrictamente diferenciados.

### Panel de Administrador (Dashboard Web y Móvil)
- **Vista Resumen:** Tarjetas de métricas en tiempo real y tabla de las últimas reservaciones.
- **Gestión (CRUD Completo):**
  - **Vehículos:** Control de flota, capacidades, estado operativo y fotografías (ImgBB).
  - **Rutas:** Origen, destino, categorías (`playa`, `internacional`, `aeropuerto`, `ciudad`, `escenico`), precios y galería.
  - **Viajes Programados:** Asignación de vehículos y rutas a fechas específicas, con cálculo transaccional de capacidad de pasajeros.
  - **Reservaciones:** Creación de reservas manuales, ajuste automático de asientos ocupados y asociación con usuarios registrados.

### Panel de Cliente (Web y Móvil)
- **Catálogo de Rutas:** Filtro por categoría y búsqueda en tiempo real por origen o destino.
- **Mis Reservas:** Historial con métricas, filtros por estado (`pendiente`, `confirmada`, `pagada`, `cancelada`), cancelación de reservas pendientes y soporte directo por WhatsApp.
- **Mi Perfil:** Edición de nombre y teléfono, verificación de correo electrónico y cambio de contraseña con reautenticación.
- **Cotizador Inteligente:** Cotizador dinámico conectado directamente a WhatsApp.

---

## Stack Tecnológico

- **Frontend:** React 19 + Next.js (App Router)
- **Estilos:** Tailwind CSS
- **Manejo de Estado Global:** React Context API (Separación limpia de la capa lógica y UI)
- **Backend / API REST:** Next.js API Routes (Rutas dinámicas)
- **Base de Datos:** Firebase Firestore (NoSQL)
- **Autenticación:** Firebase Authentication
- **Validaciones:** Zod + React Hook Form
- **Despliegue:** Vercel

---

## ⚙️ Instalación y Configuración Local

Si deseas correr este proyecto en tu entorno local, sigue estos pasos:

1. **Clonar el repositorio:**
   ```bash
   git clone https://github.com/delcidk/traveling-together-503.git
   cd traveling-together-503

2. **Instalar Dependencias:**
   npm install

3. **Configurar Variables de Entorno: Crea un archivo .env.local en la raíz del proyecto y agrega tus credenciales de Firebase:**
   NEXT_PUBLIC_FIREBASE_API_KEY=tu_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=tu_dominio
NEXT_PUBLIC_FIREBASE_PROJECT_ID=tu_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=tu_storage
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=tu_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=tu_app_id
NEXT_PUBLIC_IMGBB_API_KEY=tu_imgbb_api_key

FIREBASE_PROJECT_ID=tu_project_id
FIREBASE_CLIENT_EMAIL=tu_client_email
FIREBASE_PRIVATE_KEY="tu_private_key"

4. **Ejecutar el servidor de desarrollo:**
   npm run dev

Arquitectura del Proyecto
El proyecto sigue una estructura limpia utilizando el App Router de Next.js:

/src/app: Vistas, Layouts y Componentes UI.
/src/app/api: Endpoints de la API REST para la manipulación segura de la base de datos desde el lado del servidor.
/src/app/context: Manejo de estado global (Auth, Vehicles, Trips, etc.).
/src/app/hooks: Custom hooks (useApi, useAuthLogic) aislando la lógica de negocio.
/src/lib: Tipados compartidos (Zod), helpers y configuración de Firebase Admin.
/mobile: Aplicación móvil nativa en React Native + Expo SDK 57 (Expo Router, Firebase Auth con Google Sign-In nativo, sincronización en tiempo real con Firestore `onSnapshot` y panel de administración completo).
/firestore.rules: Reglas de seguridad de Cloud Firestore basadas en `request.auth.uid` y Custom Claims (`admin: true`).
/scripts: Scripts administrativos para sincronizar Custom Claims (`set-admin-claim.mjs`), reconciliar reservas/viajes (`reconcile-reservations.mjs`) y validar reglas de Firestore (`test-firestore-rules.mjs`).

---

## 📱 Aplicación Móvil (React Native / Expo — Fase 2)

La carpeta [`mobile/`](./mobile) contiene la aplicación móvil para Android conectada al mismo ecosistema Firebase y API REST:

### Arquitectura Híbrida (Tiempo Real + Transacciones Servidor)
- **Autenticación Firebase (Email/Password + Google Sign-In Nativo):**
  - Persistencia de sesión en dispositivo con `@react-native-async-storage/async-storage`.
  - Inicio de sesión nativo con Google mediante `@react-native-google-signin/google-signin` y Expo Development Build (`eas build --profile development --platform android`).
  - Gestión completa de perfil (`Mi Perfil`), verificación de correo, cambio de contraseña y auto-creación idempotente de documento en `users/{uid}`.
- **Persistencia en Firestore y Reglas de Seguridad (`firestore.rules`):**
  - Lecturas en tiempo real mediante `onSnapshot` (`mobile/src/services/firestore.ts`) para rutas, viajes programados, flota, perfil de usuario y reservaciones asociadas a `user.uid`.
  - Escrituras críticas y control de cupos (`asientosOcupados` vs. `capacidad` del vehículo) ejecutadas mediante transacciones atómicas (`adminDb.runTransaction`) en la API REST de Next.js.
  - Control de acceso por roles mediante **Firebase Custom Claims** (`request.auth.token.admin == true`) con respaldo en `users/{uid}.rol`.
- **Módulos Implementados en Móvil:**
  - **Cliente:** Catálogo de rutas con filtros, cotizador de viaje privado por WhatsApp, pantalla **Mis Reservas** en tiempo real (`onSnapshot`) con métricas, filtros por estado y cancelación de reservas pendientes asociadas por el administrador, y pantalla **Mi Perfil**.
  - **Administrador:** Panel móvil con métricas globales y CRUD completo en 4 pestañas (**Reservas**, **Rutas**, **Viajes** y **Flota / Vehículos**) con subida de imágenes a ImgBB.

### Comandos útiles (Móvil y Scripts)
```bash
# Instalar dependencias móviles
cd mobile && npm install

# Iniciar servidor de desarrollo (para usar con el APK de Development Build)
cd mobile && npx expo start --dev-client

# Generar APK de desarrollo en EAS (incluye módulo nativo de Google Sign-In)
cd mobile && npx eas-cli build --profile development --platform android

# Sincronizar Custom Claims de administradores en Firebase Auth
node scripts/set-admin-claim.mjs --sync-all

# Validar sintaxis e invariantes de firestore.rules
node scripts/test-firestore-rules.mjs
```

---

## 👥 Equipo de Desarrollo
Kevin Alexander Del Cid Ponce DP191337 - Desarrollador

---

## 📄 Licencia

Este proyecto se distribuye bajo la licencia **Creative Commons Atribución-NoComercial-CompartirIgual 4.0 Internacional (CC BY-NC-SA 4.0)**.

- **Atribución (BY):** Debes otorgar el crédito correspondiente al autor original (**Kevin Alexander Del Cid Ponce — DP191337**), proporcionar un enlace a la licencia e indicar si se realizaron cambios.
- **NoComercial (NC):** No puedes utilizar el material con fines comerciales.
- **CompartirIgual (SA):** Si remezclas, transformas o creas a partir del material, debes distribuir tu contribución bajo la misma licencia que el original.

Consulta el texto legal completo en el archivo [`LICENSE`](./LICENSE) o el [resumen oficial de Creative Commons](https://creativecommons.org/licenses/by-nc-sa/4.0/deed.es).

