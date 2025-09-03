[README.md](https://github.com/user-attachments/files/22116975/README.md)
# ScreenTones – Digital Wallpaper Store

A fast, modern e‑commerce app for downloadable wallpapers.

> **Status:** Production-ready

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Monorepo Structure](#monorepo-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Clone & Install](#clone--install)
  - [Environment Variables](#environment-variables)
  - [Run Locally](#run-locally)
- [Configuration](#configuration)
  - [CORS](#cors)
  - [Stripe](#stripe)
  - [Cloudinary](#cloudinary)
- [Scripts](#scripts)
- [Deployment (Render)](#deployment-render)
- [License](#license)

---

## Overview

ScreenTones is a digital wallpaper store with a clean browsing experience, secure checkout, and an admin area for managing products and media.

- **Performance-first** React frontend (mobile‑first, responsive)
- **Node/Express** API with JWT auth
- **MongoDB** for products & users
- **Stripe** for payments
- **Cloudinary** for image hosting/transforms


## Features

- Product gallery with filters & pagination
- Product detail pages
- Cart, checkout, and order confirmation
- Auth: register, login, protected routes
- Admin: create/update/delete products, upload images
- Responsive from iPhone SE → desktop

## Tech Stack

- **Frontend**: React, Vite, React Router, Context API
- **Styling**: CSS Modules with utility classes; accessible focus states
- **Backend**: Node.js, Express, Mongoose
- **DB**: MongoDB Atlas
- **Payments**: Stripe
- **Media**: Cloudinary
- **Deploy**: Render (Static Site + Web Service)

## Monorepo Structure

```
.
├── frontend/            # React app (Vite)
│   ├── src/
│   ├── index.html
│   └── vite.config.ts
├── server/              # Express API
│   ├── src/
│   │   ├── routes/
│   │   ├── models/
│   │   ├── middleware/
│   │   └── utils/
│   ├── package.json
│   └── .env (never commit)
└── README.md
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm 9+
- MongoDB Atlas connection string
- Stripe account (publishable & secret keys)
- Cloudinary account (cloud name, API key, API secret)

### Clone & Install

```bash
# clone
git clone https://github.com/<you>/<repo>.git
cd <repo>

# install
npm install --workspace frontend
npm install --workspace server
```

### Environment Variables

Create **`server/.env`**
```env
# Server
PORT=5000
MONGO_URI=mongodb+srv://<user>:<pass>@<cluster>/<db>?retryWrites=true&w=majority
JWT_SECRET=super-secret-string

# Stripe
STRIPE_SECRET_KEY=sk_live_or_test

# Cloudinary
CLOUDINARY_CLOUD_NAME=<cloud-name>
CLOUDINARY_API_KEY=<api-key>
CLOUDINARY_API_SECRET=<api-secret>

# CORS / Frontend
# Preferred: comma‑separated list of allowed origins
CORS_ORIGIN=https://<frontend-on-render>,http://localhost:5173
# If your server code expects FRONTEND_URL, set it too:
FRONTEND_URL=https://<frontend-on-render>
```

Create **`frontend/.env`**
```env
# Frontend
VITE_API_BASE_URL=https://<api-on-render>/api
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_or_test
VITE_CLOUDINARY_CLOUD_NAME=<cloud-name>
```

> ⚠️ Never commit `.env` files. Consider adding `.env.example` templates.

### Run Locally

```bash
# in one terminal: API
cd server
npm run dev

# in another terminal: Frontend
cd frontend
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

## Configuration

### CORS

The server enables CORS. Recommended env: `CORS_ORIGIN` as a comma‑separated list (local + deployed frontend). Ensure the deployed frontend **origin** exactly matches (protocol + domain + optional port).

### Stripe

- Use `VITE_STRIPE_PUBLISHABLE_KEY` on the frontend.
- Use `STRIPE_SECRET_KEY` on the server.
- If using Stripe webhooks, expose a public URL locally (e.g., `stripe listen`) and set the webhook secret.

### Cloudinary

- Upload product images from the admin UI or scripts.
- Prefer transformations for thumbnails to reduce payload size.

## Scripts

**frontend/package.json**
```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview --port 5173",
    "lint": "eslint src --ext .js,.jsx,.ts,.tsx"
  }
}
```

**server/package.json**
```json
{
  "scripts": {
    "dev": "nodemon src/index.js",
    "start": "node src/index.js"
  }
}
```


## Deployment (Render)

### Frontend (Static Site)

- Root directory: `frontend`
- Build command: `npm ci && npm run build`
- Publish directory: `dist`
- Env: `VITE_API_BASE_URL`, `VITE_STRIPE_PUBLISHABLE_KEY`, `VITE_CLOUDINARY_CLOUD_NAME`

### API (Web Service)

- Start command: `npm start`
- Env: everything in **server/.env** above
- Add Render **Environment Group** to share secrets between services

### Domains

- After deploy, update:
  - `VITE_API_BASE_URL` in frontend to the API URL
  - `CORS_ORIGIN` (and/or `FRONTEND_URL`) in server to the frontend origin
  - Redeploy both services





## License

MIT License.
