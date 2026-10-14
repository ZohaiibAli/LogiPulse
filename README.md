# SwiftShip Logistics — Courier & Delivery Platform

An on-demand courier/delivery platform (TCS + InDrive style): customers book parcel
deliveries, riders accept requests and deliver them, and admins run the operation —
with live GPS tracking, in-app chat, and a Gemini-powered AI assistant.

## Stack

- **Frontend**: React + TypeScript + Vite, Tailwind CSS, shadcn/ui, React Query, React Hook Form + Zod, Leaflet + OpenStreetMap, native WebSockets
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

No maps API key needed at all — see below.

## Maps: OpenStreetMap, not Google

Every map, address search, and route line runs on free, keyless services instead of the
Google Maps Platform (which requires a billing account even to stay within its free tier):

| Need | Service used | Notes |
|---|---|---|
| Map tiles | OpenStreetMap tile servers | `client/src/components/maps/RouteMap.tsx`, `FleetMap.tsx` via `react-leaflet` |
| Address search (pickup/drop-off) | [Nominatim](https://nominatim.openstreetmap.org) | `client/src/components/maps/AddressAutocomplete.tsx`, debounced ~1 req/sec per its usage policy |
| "Use current location" reverse geocoding | Nominatim | `client/src/lib/nominatim.ts` |
| Route line between pickup and drop-off | [OSRM](https://router.project-osrm.org) public demo server | `client/src/lib/osrm.ts`, falls back to a straight line if the demo server is unreachable |
| Distance used for pricing & nearby-pickup sorting | Haversine formula, computed server-side | Never depends on any map provider at all |

No signup, no API key, no billing account — it just works. The trade-off: these are free
public demo-tier services, a notch below Google's polish (address search is a little less
typo-tolerant, routing can be slower under heavy load), which is a fine trade for a
hackathon-scale app.

## Architecture: three connected dashboards, one shared system

Customer, Rider and Admin are not separate apps — they're three role-scoped views over the
same PostgreSQL tables (`users`, `rider_profiles`, `orders`, `order_status_history`,
`chat_messages`), so an action in one dashboard is immediately visible in the others
through the same REST/WebSocket API:

| Role | Can do |
|---|---|
| **Customer** | Request a courier, track their own orders live, see the assigned rider, chat with them, use the AI assistant |
| **Rider** | Registers (needs admin approval), goes online, sees available requests **sorted nearest-first**, accepts one, updates status, shares live location |
| **Admin** | Approves/rejects riders, manages users, monitors every order, views platform-wide stats, sees a live map of online riders |

**The connected order flow** (`client/src/pages/**`, `server/routes/order_routes.py`,
`server/routes/chat_routes.py`):

1. Customer submits a request → `POST /orders` → row created with `status = pending`.
2. It instantly appears to **both** Admin (`/admin/orders`, sees every order) and every
   online Rider (`GET /orders/available`, pending + unassigned only).
3. A rider accepts → `POST /orders/{id}/accept` → `rider_id` set, `status = accepted`,
   broadcast over that order's WebSocket room.
4. The customer's order page re-renders with the assigned rider shown automatically
   (React Query cache invalidation + the WebSocket broadcast).
5. Customer and rider open a live chat scoped to that order (`/ws/orders/{id}`, persisted
   to `chat_messages`).
6. Rider advances status — `accepted → picked_up → in_transit → delivered` — via
   `PATCH /orders/{id}/status`, each transition recorded in `order_status_history`.
7. Every status change is pushed live to the customer's tracking map and reflected the
   next time Admin loads the orders table — one source of truth, no disconnected screens.

Demo admin login is created by `server/seed_admin.py`.

## Smart Nearby Pickup

The rider's "Available requests" feed is sorted by **real, calculated distance** — never a
hardcoded label.

- Riders continuously report their live GPS position (`navigator.geolocation.watchPosition`
  → `PATCH /riders/me/location`), stored on `rider_profiles.current_lat/current_lng`.
- `GET /orders/available` (`server/routes/order_routes.py`) takes the requesting rider's
  stored coordinates and computes the **haversine great-circle distance** (`server/core/pricing.py::haversine_km`)
  from the rider to each pending order's pickup point, then sorts the list ascending by
  that distance before returning it.
- The frontend (`client/src/pages/rider/RiderDashboard.tsx`) shows each request with a
  "X.X km away" badge and a color-coded proximity bar (green ≤2km, amber ≤5km, red beyond),
  plus a "Sorted nearest first" indicator — matching distance-to-rider, not the order's own
  pickup→dropoff trip length (shown separately as secondary context).
- If the rider's location isn't known yet, the feed falls back to newest-first and tells
  the rider to enable location — it never fabricates a distance.
- The same haversine formula also drives fare pricing (`POST /orders/estimate`), so pricing
  and nearby-sorting both work correctly independent of the map provider.
