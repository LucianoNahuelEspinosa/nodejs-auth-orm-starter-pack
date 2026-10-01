# Node.js Express with Auth & TypeScript Boilerplate

A lightweight, robust, and type-safe starter template built with **Node.js**, **Express**, **Mikro ORM**, and **TypeScript**. Designed to provide a clean development experience with minimal dependencies, path aliases, environment configuration, rate limiting, and custom logging.

---

## 📑 Table of Contents

- [Features](#-features)
- [Project Structure](#-project-structure)
- [Prerequisites](#-prerequisites)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [Middleware Overview](#-middleware-overview)
  - [Global Error Handler](#global-error-handler)
  - [Rate Limiter](#rate-limiter)
  - [Logger](#logger)
- [API Routes](#-api-routes)
- [Scripts](#-scripts)

---

## 🚀 Features

- **End-to-End Type Safety:** Full TypeScript support with explicit type definitions across routes, middlewares, and helpers.
- **Path Aliases:** Configured using `@/*` mapping (e.g. `@/middlewares/errorHandler`) defined in `tsconfig.json`.
- **Lightweight & Fast:** Uses Express with essential production-ready utilities without heavy bloat.
- **Global Error Handling:** Custom error middleware with stack traces enabled in development and suppressed in production.
- **Rate Limiting:** Built-in rate limiting middleware to prevent request abuse.
- **Request & Error Logging:** Custom timestamped console output helper (`consolePrintWithTimedate`).
- **Build System:** Dedicated build script (`npm run build`) compiling TypeScript code into clean JavaScript inside the `dist/` folder.

---

## 📂 Project Structure

```text
.
├── .env                     # Local environment variables
├── .env.example             # Environment variable template
├── .gitignore               # Git ignore file
├── .npmrc                   # NPM configuration
├── LICENSE                  # MIT License file
├── package.json             # NPM dependencies and scripts
├── package-lock.json        # Dependency lockfile
├── tsconfig.json            # TypeScript compiler configuration
├── scripts/
│   └── build.js             # Project build script
└── src/
    ├── config.ts            # Centralized application configuration
    ├── index.ts             # Application entry point
    ├── helpers/
    │   └── consolePrintWithTimedate.ts  # Timestamped console logging utility
    ├── middlewares/
    │   ├── errorHandler.ts   # Global error handler middleware
    │   ├── logger.ts         # HTTP request logging middleware
    │   └── rateLimiter.ts    # Rate limiting middleware
    ├── routes/
    │   └── index.ts          # Main express router definitions
    └── types/
        └── env.d.ts          # Environment variables type definitions
```

---

## 📋 Prerequisites

Ensure you have the following installed on your machine:

- **Node.js**: `v18.x` or higher (v20+ recommended)
- **npm**: `v9.x` or higher

---

## 🛠️ Getting Started

### 1. Extract & Navigate

Extract the template archive and navigate into the project directory:

```bash
cd <project-folder>
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Setup Environment Variables

Copy the example environment file to create your local `.env`:

```bash
cp .env.example .env
```

Define your environment variables inside `.env`:

```env
PORT=4000
NODE_ENV=development
```

### 4. Run the Application

#### **Development Mode (Auto-reload)**
```bash
npm run dev
```

#### **Build for Production**
Compile TypeScript into JavaScript:
```bash
npm run build
```

#### **Production Mode**
Run the compiled JavaScript code from the `dist/` directory:
```bash
npm start
```

---

## ⚙️ Environment Variables

| Variable | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `PORT` | `number` | `4000` | Port where the Express application listens. |
| `NODE_ENV` | `'development' \| 'production'` | `'development'` | Application environment. Suppresses stack traces when set to `production`. |

Type definitions for environment variables are managed in `src/types/env.d.ts`.

---

## 🛡️ Middleware Overview

### Global Error Handler

Located at `src/middlewares/errorHandler.ts`. Implements `CustomError` extending `Error` to support custom status codes while preventing stack trace exposure in production.

#### **Usage in Controllers / Routes:**

To delegate error handling to this middleware, pass the error using `next(error)`:

```typescript
import { Router, Request, Response, NextFunction } from 'express';

const router = Router();

router.get('/example', async (req: Request, res: Response, next: NextFunction) => {
  try {
    throw new Error('Something went wrong!');
  } catch (error) {
    next(error);
  }
});

export default router;
```

---

### Rate Limiter

Located at `src/middlewares/rateLimiter.ts`. Configures request limits per IP to protect endpoints against rate abuse.

```typescript
// Configured in src/index.ts
const apiLimiter = rateLimiter({
  windowMs: 60 * 1000, // 1 Minute
  max: 80,             // Max 80 requests per IP per window
  message: 'Take it easy, wait a minute.'
});

app.use(apiLimiter);
```

---

### Logger

Located at `src/middlewares/logger.ts`. Intercepts incoming HTTP requests and outputs structured timestamp logs to the console.

---

## 🛣️ API Routes

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
| `npm run dev` | Runs the app in development mode with automatic restart. |
| `npm run build` | Compiles TypeScript code to JavaScript in the `dist/` directory. |
| `npm start` | Runs the compiled production code (`node dist/index.js`). |

---

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).