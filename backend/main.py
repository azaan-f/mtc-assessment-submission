from fastapi import FastAPI, Query, HTTPException
from dotenv import load_dotenv
import os
import httpx
from fastapi.middleware.cors import CORSMiddleware

# Load enviorment variables from .env 
load_dotenv()
app = FastAPI()

# Allows vite server to call FastAPI server for running locally
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

API_KEY = os.getenv("ISLAMIC_API_KEY")
RAMADAN_URL = "https://islamicapi.com/api/v1/ramadan/"

@app.get("/")
async def root():
    return {"message": "Salaam World"}


@app.get("/ramadan")
async def get_ramadan(
    lat: str = Query(...),
    lon: str = Query(...)
):
    
    if not API_KEY:
        raise HTTPException(status_code=500, detail="API key not setup")
    
    parameter = {
        "lat": lat,
        "lon": lon,
        "api_key": API_KEY
    }

    async with httpx.AsyncClient() as client:
        response = await client.get(RAMADAN_URL, params=parameter)

    data = response.json()

    if data.get("status") != "success":
        raise HTTPException(status_code=502, detail= "Failed to get Ramadan data")

    fasting_days = data["data"]["fasting"]

    # Simple array for frontend calendar
    result = []
    for day in fasting_days:
        result.append({
            "date": day["date"],
            "sahur": day["time"]["sahur"],
            "iftar": day["time"]["iftar"],
        })
    return result

