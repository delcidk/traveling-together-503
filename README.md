Enlace al documento PDF de Etapa 3: https://drive.google.com/file/d/18fnegXSXV0HOCsDxldk28Cbu7OU3seea/view?usp=sharing
Enlace al vídeo de explicación: https://www.youtube.com/watch?v=RV-qne25rxk

# Traveling Together 503 - Plataforma Web

![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Firebase](https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)

**Traveling Together 503** es una aplicación web responsiva desarrollada para gestionar los servicios de una agencia de transporte privado para turistas y viajeros en Centroamérica (El Salvador, Guatemala, Nicaragua). 

Este repositorio corresponde a la **Etapa 1 (Versión Web)** del proyecto, sentando las bases de la lógica de negocio, arquitectura y API REST que posteriormente se escalará a una aplicación móvil en React Native.

---

## Características Principales

### Módulo de Autenticación y Roles
- Registro e inicio de sesión integrados con Firebase Auth.
- Sistema de rutas protegidas mediante `Context API`.
- **Dos roles de usuario:** `Administrador` y `Cliente`, cada uno con vistas y permisos estrictamente diferenciados.

### Panel de Administrador (Dashboard)
- **Vista Resumen:** Tarjetas de métricas en tiempo real y tabla de las últimas reservaciones.
- **Gestión (CRUD Completo):**
  - **Vehículos:** Control de flota, capacidades y placas.
  - **Rutas:** Origen, destino y precios.
  - **Viajes Programados:** Asignación de vehículos y rutas a fechas específicas, con cálculo de capacidad de pasajeros en tiempo real.
  - **Reservaciones:** Creación de reservas manuales y asociación con usuarios registrados.

### Panel de Cliente
- **Mis Reservas:** Interfaz donde el usuario autenticado puede visualizar el estado y detalle de sus reservas activas e históricas.
- **Cotizador Inteligente:** Landing page pública con catálogo de servicios y cotizador dinámico conectado directamente a WhatsApp.

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
  - **Administrador:** Panel móvil con métricas globales y CRUD completo en 4 pestañas (**Reservas**, **Rutas**, **Viajes** y **Flota / Vehículos**) con subida de imágenes a Cloudinary.

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
