# Connecting Tech - Online Hosting & Deployment Guide

This guide details the easiest, **100% free** ways to deploy the **Connecting Tech** full-stack platform (React + Node.js Express + PostgreSQL) online.

---

## 🚀 Option 1: 1-Service Fullstack Deployment on Render (Recommended)

In this approach, the Express server serves both the **REST API** (`/api/*`) and the **React frontend** as a single production web service. You get a single HTTPS URL (`https://connecting-tech.onrender.com`) with zero CORS issues!

### Step 1: Get a Free Cloud PostgreSQL Database
You need a PostgreSQL database URL. Any of these free cloud providers work in under 60 seconds without a credit card:

1. **[Neon.tech](https://neon.tech/)** *(Recommended: fastest setup)*
   - Sign up with GitHub or Google.
   - Create a project named `connecting_tech`.
   - Copy the `postgresql://...` connection string.
2. **[Supabase.com](https://supabase.com/)**
   - Create a new project.
   - Go to **Project Settings** → **Database** → **Connection string (URI)**.

### Step 2: Push Your Database Schema & Seed Data
Before or after deploying, initialize your tables with the pre-seeded demo accounts (Anna Univ, TCS Siruseri, etc.):

In your local project terminal (or via Render shell):
```bash
# Set your remote database URL temporarily in server/.env or in terminal:
npx prisma db push --schema=server/prisma/schema.prisma
npx tsx server/prisma/seed.ts
```

### Step 3: Deploy to Render.com (Free)
1. Push your repository to [GitHub](https://github.com/).
2. Go to **[Render.com](https://dashboard.render.com/)** and sign in.
3. Click **New +** → **Web Service**.
4. Connect your GitHub repository.
5. Fill in these settings:
   - **Name**: `connecting-tech`
   - **Runtime**: `Node`
   - **Build Command**:
     ```bash
     npm install && npm --prefix server install && npm --prefix client install && npm run build
     ```
   - **Start Command**:
     ```bash
     npm run start
     ```
   - **Instance Type**: `Free`
6. Add the following **Environment Variables**:
   | Key | Value |
   | :--- | :--- |
   | `NODE_ENV` | `production` |
   | `PORT` | `10000` |
   | `DATABASE_URL` | `postgresql://...` *(from Step 1)* |
   | `JWT_SECRET` | *(Any random 32+ character string)* |
   | `JWT_EXPIRES_IN` | `7d` |
   | `CORS_ORIGIN` | `*` |
   | `DEMO_MODE` | `true` |
   | `MAX_GPS_ACCURACY_METERS` | `100` |
   | `MAX_GEOFENCE_RADIUS_METERS` | `1000` |

7. Click **Create Web Service**. Render will build the app and give you a live URL (`https://connecting-tech.onrender.com`).

---

## ⚡ Option 2: Split Deployment (Frontend on Vercel + Backend on Render)

If you prefer deploying the React frontend on **Vercel** and the API backend on **Render**:

### Backend (Render):
- Set **Root Directory**: `server`
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm run start`
- Add environment variables (`DATABASE_URL`, `JWT_SECRET`, `CORS_ORIGIN=https://your-vercel-site.vercel.app`).

### Frontend (Vercel):
1. Import repository on [Vercel](https://vercel.com/).
2. Set **Root Directory**: `client`
3. Framework Preset: `Vite`
4. Add Environment Variable:
   - `VITE_API_URL`: `https://your-render-backend.onrender.com/api`
5. Click **Deploy**. Single-page routing is already handled by `client/vercel.json`.

---

## 🌐 Option 3: Instant Live Public URL (Local Tunnel)

If you need a live public HTTPS link **right now** to test on a smartphone or share with a teacher/friend without setting up any cloud accounts:

1. Make sure your local server and database are running:
   ```bash
   npm run dev
   ```
2. In a second terminal, run:
   ```bash
   npx localtunnel --port 5173
   ```
   *(Or using Pinggy: `ssh -p 443 -R0:localhost:5173 a.pinggy.io`)*
3. It will output an instant public URL (e.g. `https://cool-campus-42.loca.lt`) accessible from anywhere worldwide!

