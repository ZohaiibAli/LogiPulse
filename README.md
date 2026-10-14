# SwiftShip Logistics — Courier & Delivery Platform

An on-demand courier/delivery platform (TCS + InDrive style): customers book parcel
deliveries, riders accept requests and deliver them, and admins run the operation —
with live GPS tracking, in-app chat, and a Gemini-powered AI assistant.

## Stack

- **Frontend**: React + TypeScript + Vite, Tailwind CSS, shadcn/ui, React Query, React Hook Form + Zod, Google Maps JS API, native WebSockets
- **Backend**: FastAPI, SQLAlchemy, PostgreSQL (Neon), JWT auth, native FastAPI WebSockets, Gemini API (`google-genai`)

## Project structure

```
client/   React frontend (Vite)
server/   FastAPI backend
```

## Setup

### Backend

```bash
cd server
python -m venv venv
venv\Scripts\activate        # Windows
pip install -r requirements.txt
python seed_admin.py         # creates the demo admin account (prints credentials)
python -m uvicorn main:app --reload
```

Runs at `http://localhost:8000`. Interactive API docs at `http://localhost:8000/docs`.

### Frontend

```bash
cd client
npm install
npm run dev
```

Runs at `http://localhost:5173`.

## Environment variables

### `server/.env`

| Variable | Required | Notes |
|---|---|---|
| `DATABASE_URL` | yes | Neon/Postgres connection string |
| `JWT_SECRET_KEY` | yes | any long random string |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | no | defaults to 7 days |
| `GEMINI_API_KEY` | for the AI assistant | free key at https://aistudio.google.com/app/apikey |
| `GEMINI_MODEL` | no | defaults to `gemini-2.5-flash` |
| `CORS_ORIGINS` | yes | comma-separated frontend origins, defaults to `http://localhost:5173` |
| `BASE_FARE`, `RATE_PER_KM` | no | pricing formula (PKR) |

### `client/.env`

| Variable | Required | Notes |
|---|---|---|
| `VITE_API_URL` | yes | defaults to `http://localhost:8000` |
| `VITE_WS_URL` | yes | defaults derived from `VITE_API_URL` |
| `VITE_GOOGLE_MAPS_API_KEY` | for maps | enable **Maps JavaScript API**, **Places API**, and **Directions API** on the same key in Google Cloud Console (free $200/month credit covers typical hackathon usage). Without it, the app still runs fully — map widgets fall back to a styled placeholder. |

## Roles

- **Customer** — books couriers, tracks live, chats with rider, uses the AI assistant.
- **Rider** — registers (needs admin approval), goes online, accepts requests from a live feed, updates delivery status, shares live location.
- **Admin** — approves/rejects riders, manages users, views all orders and platform stats. Demo login is created by `seed_admin.py`.
