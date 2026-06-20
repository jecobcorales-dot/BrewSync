# BrewSync — Enterprise Coffee Shop SaaS Platform

**Production-grade multi-branch coffee shop platform with ML-powered recommendations, real-time order tracking, and enterprise analytics.**

## Architecture

```
┌─────────────┐     ┌─────────────┐     ┌──────────────┐
│  Frontend   │────▶│   Backend   │────▶│  PostgreSQL  │
│  Next.js 16 │     │  Express 5  │     │   + Prisma   │
│  Socket.IO  │◀───▶│  Socket.IO  │     └──────────────┘
└─────────────┘     └──────┬──────┘
                           │
                    ┌──────▼──────┐
                    │ ML Service  │
                    │ Flask + SK  │
                    │ XGBoost     │
                    └─────────────┘
```

## Quick Start (Docker)

```bash
docker-compose up -d
docker-compose exec backend npx prisma db push
docker-compose exec backend node prisma/seed.js          # Dev seed
docker-compose exec backend node prisma/seed.js enterprise  # 50K customers, 500K orders
```

Open **https://brewsync.com** (or http://localhost:3000 when running locally)

## Manual Setup

### Prerequisites
- Node.js 20+
- PostgreSQL 16+
- Python 3.11+ (ML service)

### 1. Database

```bash
cd backend
cp .env.example .env
npm install
npx prisma db push
npm run db:seed              # Dev: 4 branches, 21 products
npm run db:seed:enterprise   # Enterprise: 25 branches, 200 products, 50K customers, 500K orders
```

### 2. Backend (port 5000)

```bash
cd backend && npm run dev
```

### 3. ML Service (port 8000)

```bash
cd ml-service
pip install -r requirements.txt
python train.py    # Train all models
python app.py      # Start API
```

### 4. Frontend (port 3000)

```bash
cd frontend
cp .env.local.example .env.local  # or use existing .env.local
npm install
npm run dev
```

## Demo Accounts

| Role | Email | Password |
|------|-------|----------|
| Customer | customer@brewsync.com | BrewSync2024! |
| Cashier | cashier@brewsync.com | BrewSync2024! |
| Manager | manager@brewsync.com | BrewSync2024! |
| Admin | admin@brewsync.com | BrewSync2024! |

## Portal Pages

### Customer
- Home, AI Recommendations, Menu, Cart, Checkout, Order Tracking, Loyalty Rewards, Profile

### Cashier
- POS, Order Queue, Customer Lookup, Sales Summary

### Manager
- Analytics, Revenue, Branch Comparison, Forecasting, Customer Insights

### Admin
- Users, Branches, Products, Promotions, ML Models, Audit Logs, System Monitoring

## ML Recommendation Engine

| Algorithm | Use Case | Example Confidence |
|-----------|----------|---------------------|
| Collaborative Filtering | Similar customer tastes | Spanish Latte **92%** |
| Apriori Association Rules | Basket analysis | Butter Croissant **88%** |
| Random Forest | Time/day patterns | — |
| XGBoost | Purchase likelihood ranking | Extra Espresso Shot **94%** |

```bash
cd ml-service && python train.py   # Saves models to ml-service/models/
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | JWT authentication |
| GET | `/api/menu/products` | Product catalog (200 items) |
| GET | `/api/recommendations` | ML recommendations with confidence |
| POST | `/api/orders` | Create order (Socket.IO broadcast) |
| PATCH | `/api/orders/:id/status` | Real-time status update |
| GET | `/api/analytics/dashboard` | Manager KPIs & charts |
| GET | `/api/customers/loyalty` | Loyalty program data |
| POST | `/api/admin/ml-models/train` | Trigger ML retraining |

## Real-Time (Socket.IO)

Events: `order:created`, `order:updated`

Rooms: `order:{id}`, `branch:{id}`, `cashier:queue`

## Environment Variables

### Backend (`backend/.env`)
```
DATABASE_URL=postgresql://brewsync:brewsync_secret@localhost:5432/brewsync
JWT_SECRET=your-secret
FRONTEND_URL=https://brewsync.com
ML_SERVICE_URL=http://localhost:8000
```

### Frontend (`frontend/.env.local`)
```
NEXT_PUBLIC_SITE_URL=https://brewsync.com
NEXT_PUBLIC_API_ORIGIN=https://api.brewsync.com
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
```

## Project Structure

```
BrewSync/
├── frontend/          Next.js 16 + Framer Motion + Recharts
├── backend/           Express 5 + Prisma + Socket.IO
│   └── prisma/        Schema + enterprise seed generator
├── ml-service/        Flask + scikit-learn + XGBoost
│   ├── train.py       Training pipeline
│   ├── predict.py     Inference engine
│   └── app.py         REST API
├── docker-compose.yml
└── README.md
```

## Tech Stack

- **Frontend:** React 19, Next.js 16, Tailwind CSS 4, Framer Motion, Recharts, Socket.IO Client, Zustand
- **Backend:** Node.js, Express 5, Prisma ORM, PostgreSQL, JWT, Socket.IO
- **ML:** Python, Flask, scikit-learn, XGBoost, mlxtend (Apriori)
- **DevOps:** Docker Compose, multi-stage builds

## License

MIT © BrewSync
