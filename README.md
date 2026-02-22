# MTC Ramadan Calendar Assessment

Full-stack Ramadan calendar built with:

- Backend: FastAPI (Python)
- Frontend: React + TypeScript (Vite)

## Features

- GET /ramadan backend route that proxies IslamicAPI
- API key stored securely in environment variable
- Frontend fetches backend only
- 30-day Ramadan calendar view
- Current day highlighted
- Live countdown timer to next Sahur or Iftar
- Clean Ramadan-themed UI (dark green / gold / white)

---

## Setup Instructions

### Backend

cd backend
python -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt

Create a .env file inside backend/:

ISLAMIC_API_KEY=your_key_here

Run:

python -m fastapi dev main.py

Backend runs on:
http://localhost:8000

---

### Frontend

cd frontend
npm install
npm run dev

Frontend runs on:
http://localhost:5173

---

## Notes

- Backend includes CORS configuration for local development.
- Countdown updates in real time.
