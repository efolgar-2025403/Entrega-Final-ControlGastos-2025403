# Control-Gastos

Sistema web para la gestión y control de gastos personales, desarrollado como proyecto académico aplicando el **Ciclo de Vida del Desarrollo de Software (SDLC)**.

El sistema permite administrar usuarios, categorías, ingresos y gastos mediante una arquitectura separada en **frontend, backend y base de datos**.

---

## Tecnologías utilizadas

### Frontend

* Angular
* TypeScript
* HTML
* SCSS
* Angular Router

### Backend

* Node.js
* TypeScript
* Express
* JWT
* API REST

### Base de datos

* PostgreSQL

### Gestión del proyecto

* Git
* GitHub
* pnpm
* Trello

---

## Estructura del proyecto

```text
Control-Gastos-2025403/

├── backend/
│   ├── src/
│   │   ├── config/
│   │   └── modules/
│   │       ├── auth/
│   │       ├── category/
│   │       ├── expense/
│   │       └── income/
│   ├── .env.example
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/
│   ├── src/
│   │   └── app/
│   │       ├── core/
│   │       ├── features/
│   │       │   ├── auth/
│   │       │   ├── categories/
│   │       │   ├── dashboard/
│   │       │   ├── expenses/
│   │       │   ├── income/
│   │       │   ├── movements/
│   │       │   └── reports/
│   │       └── layout/
│   ├── package.json
│   └── angular.json
│
├── database/
│   ├── init.sql
│   └── migrations/
│
├── .gitignore
├── package.json
├── pnpm-lock.yaml
├── pnpm-workspace.yaml
└── README.md
```

---

## Funcionalidades

Actualmente el sistema cuenta con:

* Registro de usuarios.
* Inicio de sesión (correo y contraseña).
* Inicio de sesión con Google (Google Identity Services).
* Autenticación mediante JWT.
* Protección de rutas mediante `authGuard`.
* Gestión de categorías.
* Registro, edición y eliminación de ingresos.
* Registro, edición y eliminación de gastos.
* Control del fondo disponible.
* Validación para evitar gastos mayores al dinero disponible.
* Consulta de movimientos.
* Dashboard financiero.
* Reportes.
* Información del usuario en el perfil.
* Conexión entre Angular, Node.js y PostgreSQL.

### Control del fondo

Los ingresos funcionan como el dinero disponible del usuario.

```text
Ingresos
   ↓
Fondo disponible
   ↓
Gastos
   ↓
Fondo restante
```

Si el usuario intenta registrar un gasto mayor al fondo disponible, el sistema evita la operación y muestra un mensaje indicando que no hay fondos suficientes.

---

## Autenticación

El sistema utiliza **JWT** para manejar la autenticación.

Cuenta con dos métodos de acceso:

* **Correo y contraseña**: registro e inicio de sesión clásicos.
* **Continuar con Google**: autenticación mediante Google Identity Services (OAuth 2.0), con validación de la identidad por parte del backend contra los servidores de Google.

Las rutas internas están protegidas mediante un guard de Angular.

```text
Usuario
   ↓
Registro / Login / Google
   ↓
Backend
   ↓
PostgreSQL
   ↓
JWT
   ↓
Dashboard
```

Cuando el usuario no está autenticado, las rutas protegidas redirigen al Login.

---

## Inicio de sesión con Google

El flujo implementado es:

```text
Google → Frontend → Backend → Validación de Google → Usuario → JWT existente → Dashboard
```

* El frontend renderiza el botón oficial "Continuar con Google" (Google Identity Services).
* Google devuelve un **ID token** (JWT firmado por Google).
* El frontend envía únicamente ese token al backend (`POST /api/auth/google`).
* El backend **valida el token** contra Google (`google-auth-library`): firma, expiración,
  emisor y que el `aud` coincida con `GOOGLE_CLIENT_ID`.
* Si el correo ya está registrado, la cuenta de Google se **vincula** al usuario existente.
* Si no existe, el sistema **crea la cuenta automáticamente** (sin contraseña).
* En ambos casos se emite el mismo **JWT interno** de CONTROL-GASTOS utilizado por el
  login tradicional. No se crea un sistema de sesiones diferente.

> El `GOOGLE_CLIENT_ID` es público por diseño de Google. **No se utiliza ni se almacena
> client secret en este proyecto** porque no se intercambia el token por un access token
> en el backend. No subir ni exponer contraseñas de Google en ningún caso.

### Configuración en Google Cloud Console

1. **Crear el proyecto**
   - Entra en <https://console.cloud.google.com> → selecciona o crea un proyecto
     (p. ej. `control-gastos`).

2. **Configurar la pantalla de consentimiento de OAuth**
   - Menú: **APIs y servicios → Pantalla de consentimiento de OAuth**.
   - Tipo: **Externo** (o Interno si pertenece a un dominio de Google Workspace).
   - Completa el nombre de la aplicación, el correo de soporte y el dominio autorizado.
   - En *Scopes*, añade los básicos `openid`, `email` y `profile`.

3. **Crear credenciales OAuth**
   - Menú: **APIs y servicios → Credenciales → Crear credenciales → ID de cliente de OAuth**.
   - Tipo de aplicación: **Aplicación web**.
   - **Orígenes de JavaScript autorizados**: agrega los orígenes desde donde se sirve el
     frontend. Para desarrollo local:
     - `http://localhost:4200`
   - **URLs de redireccionamiento autorizadas**: NO son necesarias para este flujo
     (Google Sign-In con ID token). Solo se requerirían si se usara el *authorization code flow*
     con redirección del servidor.
   - Copia el **ID de cliente** (p. ej. `xxxx.apps.googleusercontent.com`). No es secreto.

4. **Configurar el backend**
   - Agrega el `GOOGLE_CLIENT_ID` en `backend/.env`:

   ```env
   GOOGLE_CLIENT_ID=xxxx.apps.googleusercontent.com
   ```

   - El frontend obtiene ese valor automáticamente desde `GET /api/auth/google/config`,
     por lo que no debe hardcodearse en el código.

5. **Casos de prueba**
   - Con `GOOGLE_CLIENT_ID` vacío o inválido, el botón de Google no se muestra y el
     login tradicional continúa funcionando.
   - Si el correo de Google ya existe como usuario local, al iniciar con Google se
     vincula la cuenta y el usuario conserva sus datos (ingresos, gastos y categorías).

---

## Base de datos

La aplicación utiliza PostgreSQL.

Base de datos:

```text
control_gastos
```

Principales tablas:

```text
users
categories
expenses
incomes
```

Los gastos e ingresos están relacionados con el usuario que los registra, permitiendo que cada usuario maneje su propia información.

---

## Configuración del Backend

Crear:

```text
backend/.env
```

Tomando como referencia:

```text
backend/.env.example
```

Ejemplo:

```env
PORT=3000

DB_HOST=localhost
DB_PORT=5432
DB_NAME=control_gastos
DB_USER=postgres
DB_PASSWORD=tu_contraseña

JWT_SECRET=tu_clave_secreta
GOOGLE_CLIENT_ID=xxxx.apps.googleusercontent.com
```

El archivo `.env` no debe subirse al repositorio.

---

## Instalación

Clonar el repositorio:

```bash
git clone https://github.com/efolgar-2025403/Control-Gastos-2025403.git
```

Ingresar al proyecto:

```bash
cd Control-Gastos-2025403
```

Instalar dependencias:

```bash
pnpm install
```

---

## Ejecución

### Backend

```bash
cd backend
pnpm run dev
```

Servidor:

```text
http://localhost:3000
```

### Frontend

En otra terminal:

```bash
cd frontend
pnpm start
```

Aplicación:

```text
http://localhost:4200
```