# PanditJi 🕉️

> **Book Verified Pandits for Every Puja — On Demand**

An on-demand religious services marketplace connecting urban Hindu families with verified pandits across Indian metro cities.

## Monorepo Structure

```
pandit_ji/
├── backend/          # FastAPI (Python 3.11+) — REST API
├── admin-panel/      # Next.js 14 + Tailwind CSS — Operations dashboard
├── customer-app/     # React Native + Expo — Customer mobile app (WIP)
└── pandit-app/       # React Native + Expo — Pandit mobile app (WIP)
```

## Tech Stack

| Layer | Technology |
|---|---|
| Backend API | FastAPI + SQLAlchemy + PostgreSQL |
| Cache | Redis |
| Auth | OTP via MSG91 + JWT |
| Payments | Razorpay (Orders + Route + Webhooks) |
| Push Notifications | Firebase Cloud Messaging |
| Real-time GPS | Firebase Realtime Database |
| Storage | AWS S3 |
| Admin Panel | Next.js 14 + Tailwind CSS |
| Mobile Apps | React Native + Expo (TypeScript) |

## Quick Start

### Backend
```bash
cd backend
cp .env.example .env        # Fill in your credentials
pip install -r requirements.txt
alembic upgrade head         # Run DB migrations
uvicorn app.main:app --reload --port 8000
# API Docs → http://localhost:8000/docs
```

### Admin Panel
```bash
cd admin-panel
npm install
npm run dev
# → http://localhost:3000
```

## Brand Colors
- **Saffron:** `#FF9933`
- **Deep Maroon:** `#8B0000`
- **Background:** `#FFFDF7`

## License
Private — All rights reserved.
