# Deployment Guide

## Stack
- Frontend → Vercel
- Backend  → Railway
- Database → Railway MySQL plugin

---

## 1. Push to GitHub

```bash
git init
git add .
git commit -m "initial commit"
git remote add origin https://github.com/YOUR_USERNAME/course-allocation.git
git push -u origin main
```

---

## 2. Deploy Database + Backend on Railway

1. Go to https://railway.app → New Project → Deploy from GitHub repo
2. Select your repo → set **Root Directory** to `student-course-allocation/backend`
3. Add a **MySQL** plugin from Railway dashboard (+ New → Database → MySQL)
4. Railway auto-sets `DATABASE_URL` — your app reads it automatically
5. Add these environment variables in Railway backend service:
   ```
   JWT_SECRET_KEY=your-strong-secret-here-change-this
   ```
6. After first deploy, run the DB setup by adding a one-time start command:
   ```
   python database/setup.py && gunicorn app:app --bind 0.0.0.0:$PORT
   ```
   Then revert to normal start command after tables are created.
7. Copy your Railway backend URL e.g. `https://your-app.railway.app`

---

## 3. Deploy Frontend on Vercel

1. Go to https://vercel.com → New Project → Import from GitHub
2. Set **Root Directory** to `student-course-allocation/frontend`
3. Framework: **Vite**
4. Add environment variable:
   ```
   VITE_API_URL=https://your-app.railway.app
   ```
5. Deploy → Vercel gives you a URL like `https://course-alloc.vercel.app`

---

## 4. Update CORS on backend (optional hardening)

In `app.py`, replace `origins='*'` with your Vercel URL:
```python
CORS(app, origins=['https://course-alloc.vercel.app'], supports_credentials=True)
```

---

## Local Development
- Backend:  `python app.py` (port 5000)
- Frontend: `npm run dev` (port 3000, proxies /api to 5000)
