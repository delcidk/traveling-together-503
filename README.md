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

👥 Equipo de Desarrollo
Kevin Alexander Del Cid Ponce DP191337 - Desarrollador
