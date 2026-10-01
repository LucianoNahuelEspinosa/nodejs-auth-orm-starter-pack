# Express TypeScript Starter with MikroORM & Auth

A production-ready, highly scalable, and type-safe backend template built with **Node.js**, **Express**, **MikroORM**, and **TypeScript**. 

It features built-in **JWT Authentication with HTTP-Only Cookies**, **Multi-Driver Database Support** (PostgreSQL, MariaDB, MySQL, SQLite), isolated **RequestContext** management, automated migrations, dynamic seeders, rate limiting, and graceful shutdown handling.

---

## 📑 Table of Contents

- [Features](#-features)
- [Project Architecture](#-project-architecture)
- [Prerequisites](#-prerequisites)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [Database & MikroORM Integration](#-database--mikroorm-integration)
  - [Driver Selection](#driver-selection)
  - [Migrations & Seeders](#migrations--seeders)
  - [Request Context & Isolation](#request-context--isolation)
- [Authentication System](#-authentication-system)
- [API Endpoints](#-api-endpoints)
- [Scripts](#-scripts)

---

## 🚀 Features

- **End-to-End Type Safety:** Full TypeScript implementation with explicit interfaces for Express Request context, environment variables, and entities.
- **MikroORM Integration:** Configured with `defineEntity` schema definitions, hooks (automatic bcrypt password hashing), UUID generation, and soft delete tracking.
- **Multi-Driver Engine:** Dynamic database selection out of the box (`postgresql`, `mariadb`, `mysql`, `sqlite`).
- **Secure Authentication:** JWT authentication workflow using `AccessToken` and `RefreshToken` stored in HTTP-Only, Secure, SameSite cookies.
- **Isolated Entity Manager:** Middleware powered by `RequestContext.create` preventing cross-request state pollution and memory leaks.
- **Automated Migration & Seeding:** CLI integration with a custom seeder executor tracking executed seeders in the database.
- **Resilient Server Lifecycle:** Graceful shutdown listeners (`SIGINT`/`SIGTERM`) ensuring proper closure of HTTP connections and database connection pools.
- **Security & Utilities:** Custom Rate Limiting, CORS configuration, Cookie Parser, Path Aliases (`@/*`), and timedate logger middleware.

---

## 📂 Project Architecture

```text
.
├── scripts/
│   ├── build.js             # Esbuild bundling script
│   └── seed.ts              # Dynamic auto-discovering seeder runner
├── src/
│   ├── config.ts            # CORS & JWT global settings
│   ├── index.ts             # Server entry point & lifecycle management
│   ├── mikro-orm.config.ts  # Multi-driver database configuration
│   ├── controllers/
│   │   ├── auth.ts          # Auth controller (login, logout, get user)
│   │   └── user.ts          # User management controller
│   ├── database/
│   │   ├── index.ts         # Initialized MikroORM instance
│   │   ├── entities/        # Entity schema definitions (User, SeederExecution)
│   │   ├── migrations/      # Auto-generated SQL migrations
│   │   └── seeders/         # Seeder classes
│   ├── helpers/
│   │   ├── consolePrintWithTimedate.ts # Timestamped logger utility
│   │   └── sanitizeUser.ts  # Strips sensitive properties before API response
│   ├── middlewares/
│   │   ├── auth.ts          # JWT Cookie authentication & token refresh middleware
│   │   ├── databaseContext.ts # Isolated RequestContext wrapper
│   │   ├── errorHandler.ts   # Global error handling middleware
│   │   ├── logger.ts         # Request logger middleware
│   │   └── rateLimiter.ts    # Rate limiting middleware
│   ├── routes/
│   │   ├── auth.ts          # Auth routes
│   │   ├── user.ts          # User routes
│   │   └── index.ts         # Central router
│   └── types/
│       ├── env.d.ts          # Environment variables declaration
│       └── express.d.ts      # Express Request custom typing (req.em, req.user)
├── tsconfig.json            # TypeScript configuration with @/* aliases
└── package.json
```

---

## 📋 Prerequisites

Ensure you have the following installed:

- **Node.js**: `v20.x` or higher
- **npm**: `v9.x` or higher
- **Database Server**: PostgreSQL, MariaDB, MySQL, or SQLite depending on your target driver.

---

## 🛠️ Getting Started

### 1. Installation

Install all dependencies:

```bash
npm install
```

### 2. Environment Setup

Create a `.env` file in the root directory:

```env
PORT=4000
NODE_ENV=development

# Database Settings
DB_DRIVER=postgresql # Options: postgresql, mariadb, mysql, sqlite
DB_HOST=localhost
DB_PORT=5432
DB_NAME=mikro_starter
DB_USER=root
DB_PASSWORD=secret

# JWT Authentication
SECRET_JWT_KEY=your_super_secret_jwt_key_change_me
```

### 3. Database Initialization

Run database migrations to set up the schema:

```bash
npm run db:migration:up
```

Seed initial development data (creates default admin user):

```bash
npm run db:seed
```

### 4. Running the App

#### **Development Mode**
Runs with `tsx watch` without clearing logs on code changes:
```bash
npm run dev
```

#### **Production Build & Execution**
```bash
npm run build
npm start
```

---

## ⚙️ Environment Variables

| Variable | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `PORT` | `number` | `4000` | HTTP Server port. |
| `NODE_ENV` | `'development' \| 'production'` | `'development'` | Enables/disables debug mode and production security flags. |
| `DB_DRIVER` | `'postgresql' \| 'mariadb' \| 'mysql' \| 'sqlite'` | `'postgresql'` | Driver used by MikroORM. |
| `DB_HOST` | `string` | `localhost` | Database host address. |
| `DB_PORT` | `number` | Driver Default | Database port. |
| `DB_NAME` | `string` | - | Database name. |
| `DB_USER` | `string` | - | Database username. |
| `DB_PASSWORD` | `string` | - | Database password. |
| `SECRET_JWT_KEY` | `string` | - | Secret string used for signing access and refresh tokens. |

---

## 🗄️ Database & MikroORM Integration

### Driver Selection

The configuration in `src/mikro-orm.config.ts` dynamically evaluates `DB_DRIVER` to load the appropriate driver options (`definePostgresConfig`, `defineMariaDbConfig`, etc.).

### Migrations & Seeders

- **Create Migration:** `npm run db:migration:create`
- **Apply Migrations:** `npm run db:migration:up`
- **Revert Migration:** `npm run db:migration:down`
- **Run Seeders:** `npm run db:seed` (Executes pending seeders sequentially and logs execution in `mikro_orm_seeders` table).

*Note: The `db:migration:fresh` command is blocked in production environments for safety.*

### Request Context & Isolation

Each incoming request is wrapped using `RequestContext.create` via `src/middlewares/databaseContext.ts`. You can interact with the database in controllers using `req.em` or directly importing `orm` from `@/database` — both resolve to the isolated request context fork.

---

## 🔐 Authentication System

The application uses double JWT authorization:

1. **Access Token (`1h`):** Evaluated per request.
2. **Refresh Token (`30d`):** Automatically issues a new Access Token upon expiration if valid.
3. **Cookie Security:** Both tokens are sent as `httpOnly`, `sameSite: "strict"` cookies.

Protected endpoints can be attached to `authMiddleware`:

```typescript
import authMiddleware from "@/middlewares/auth";

router.get("/protected-route", authMiddleware, (req, res) => {
  res.send({ userId: req.user.id });
});
```

---

## 🛣️ API Endpoints

Routes are mounted under `/api` in `src/index.ts`. Register your endpoint logic in `src/routes/index.ts`:

```typescript
import { Router, Request, Response } from 'express';

const router = Router();

router.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

export default router;
```

---

## 📜 Scripts

| Command | Description |
| :--- | :--- |
| `npm run dev` | Runs the app in dev mode using `tsx watch --clear-screen=false`. |
| `npm run build` | Compiles source files using `esbuild`. |
| `npm start` | Executes the built application in `dist/index.js`. |
| `npm run db:migration:create` | Generates a new migration snapshot. |
| `npm run db:migration:up` | Executes all pending migrations. |
| `npm run db:migration:down` | Reverts the last executed database migration. |
| `npm run db:migration:fresh` | Drops the database schema and re-runs all migrations from scratch (disabled in production). |
| `npm run db:seed:create` | Generates a new seeder class file template in the seeders directory. |
| `npm run db:seed` | Runs pending seeders. |

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).