# Control-Gastos

Sistema web para llevar el control y administración de gastos personales.

Este proyecto lo desarrollé desde cero como primer proyecto del bloque numero 4. La idea principal fue crear una aplicación que me permitiera registrar mis gastos, organizarlos por categorías y consultar la información de una manera sencilla.

## Mi objetivo

Mi objetivo con Control-Gastos fue aplicar los conocimientos que he aprendido durante mi formación como estudiante de informática, principalmente en programación, bases de datos, desarrollo web y organización de proyectos.

También se me indico trabajar el proyecto siguiendo el **SDLC (Software Development Life Cycle)**, pasando por las etapas de planificación, análisis, diseño, desarrollo, pruebas, despliegue y mantenimiento.

## Funcionalidades

Actualmente el proyecto cuenta con:

* Registro de usuarios.
* Inicio de sesión.
* Dashboard principal.
* Registro de gastos.
* Categorías.
* Movimientos.
* Reportes.
* Conexión con base de datos.
* Cierre de sesión.

## Tecnologías utilizadas

* **Angular** — Frontend.
* **TypeScript** — Lenguaje principal.
* **Node.js** — Backend.
* **Express** — API del backend.
* **PostgreSQL** — Base de datos.
* **Prisma** — Manejo de la base de datos.
* **pnpm** — Gestor de paquetes.

## Estructura del proyecto

El proyecto está dividido principalmente en dos partes:

```text
Control-Gastos/
├── backend/
└── frontend/
```

El **backend** se encarga de la lógica, la API y la comunicación con la base de datos.

El **frontend** contiene la interfaz que utiliza el usuario.

## Base de datos

Para el proyecto utilicé **PostgreSQL**.

Primero se debe crear la base de datos:

```sql
CREATE DATABASE control_gastos;
```

Después puedo ingresar a ella desde PostgreSQL:

```sql
\c control_gastos
```

Para revisar las tablas:

```sql
\dt
```

Y para consultar información:

```sql
SELECT * FROM users;
SELECT * FROM categories;
SELECT * FROM expenses;
```

La conexión de la base de datos se configura mediante las variables de entorno del backend.

## Cómo ejecutar el proyecto

Para comenzar, primero se deben instalar las dependencias.

### Backend

Desde la carpeta principal:

```bash
cd backend
```

Instalo las dependencias:

```bash
pnpm install
```

Después configuro el archivo `.env` con los datos de mi base de datos PostgreSQL.

Luego ejecuto Prisma:

```bash
pnpm exec prisma generate
pnpm exec prisma migrate dev
```

Finalmente inicio el backend:

```bash
pnpm run dev
```

El backend funciona en:

```text
http://localhost:3000
```

### Frontend

En otra consola entro a la carpeta del frontend:

```bash
cd frontend
```

Instalo las dependencias:

```bash
pnpm install
```

Y ejecuto Angular:

```bash
pnpm start
```

La aplicación estará disponible en:

```text
http://localhost:4200
```

## Diseño

Para el diseño decidí utilizar un estilo oscuro y sencillo.

Los colores principales son:

* Negro como fondo.
* Dorado para botones y detalles.
* Blanco para los textos principales.
* Gris para textos secundarios.

También trabajé en que la aplicación fuera fácil de entender y que las diferentes secciones mantuvieran un diseño parecido.

## Lo que aprendí

Durante el desarrollo de **Control-Gastos** aprendí y practiqué diferentes temas que antes conocía solamente de forma teórica.

Entre ellos:

* Desarrollo con Angular y TypeScript.
* Creación de APIs con Node.js y Express.
* Uso de PostgreSQL.
* Manejo de Prisma.
* Conexión entre frontend, backend y base de datos.
* Registro e inicio de sesión.
* Organización de un proyecto.
* Uso de Git y GitHub.
* Manejo de errores.
* Diseño de interfaces.
* Uso del SDLC para organizar el desarrollo.

También tuve que investigar y resolver varios errores que fueron apareciendo durante el proyecto, lo cual fue parte importante del aprendizaje.

## Uso de Inteligencia Artificial

Durante el desarrollo utilicé **ChatGPT** como herramienta de apoyo para investigar, entender errores, revisar código y buscar soluciones a problemas que encontré durante el proyecto.

La utilicé principalmente como apoyo para aprender y avanzar en partes que todavía estoy aprendiendo.

## Estado del proyecto

**Control-Gastos v1.0.0**

El proyecto se encuentra funcional en un entorno local y puede seguir creciendo con nuevas funcionalidades en el futuro.
