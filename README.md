# MTC Ramadan Calendar Submission

This is my submission for the MTC programming assessment. The application is a Ramadan calendar that fetches Sahur and Iftar times from a live API and displays them in a clean UI with a live countdown timer.

---

## Features

- FastAPI backend route `GET /ramadan` that holds the IslamicAPI key (securely stored in a backend .env file)
- React and TypeScript frontend (Vite)
- 30 day Ramadan calendar grid
- Current day highlighted
- Live countdown timer to the next Sahur or Iftar (updates every second)
- Clean Ramadan themed UI (dark green, gold, white)

---

## Tech Stack

**Backend**
- Python
- FastAPI
- httpx
- python-dotenv

**Frontend**
- React 19
- TypeScript
- Vite

---

## How to Run Locally

### 1. Clone the Repository
```bash
git clone https://github.com/azaan-f/mtc-assessment-submission.git
cd mtc-assessment-submission
```

### 2. Backend Setup
```bash
cd backend
python -m venv .venv
```

Activate the virtual environment:

- **Windows:** `.venv\Scripts\activate`
- **Mac/Linux:** `source .venv/bin/activate`

Install dependencies:
```bash
pip install -r requirements.txt
```

Create a `.env` file inside the `backend/` folder:
```env
ISLAMIC_API_KEY=your_api_key_here
```

> You can get an API key from: [https://islamicapi.com](https://islamicapi.com)

Start the backend:
```bash
python -m fastapi dev main.py
```

Backend runs at: `http://localhost:8000`

### 3. Frontend Setup

Open a new terminal:
```bash
cd frontend
npm install
npm run dev
```

Frontend runs at: `http://localhost:5173`

---

## Notes

- The frontend fetches data from the backend only, never directly from the external API.
- CORS is set up for local development.
- The countdown updates in real time.
