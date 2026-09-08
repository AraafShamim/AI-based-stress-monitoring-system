import os
import tempfile
from typing import List, Optional
from dotenv import load_dotenv

# Force Python to load the .env file from the exact directory
current_dir = os.path.dirname(os.path.abspath(__file__))
env_path = os.path.join(current_dir, ".env")
load_dotenv(dotenv_path=env_path)

import joblib
import numpy as np
from google import genai
from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from groq import Groq

# Resilient Groq Initialization (guards against crashes if key is delayed/missing)
groq_api_key = os.environ.get("GROQ_API_KEY")
groq_client = Groq(api_key=groq_api_key) if groq_api_key else None

app = FastAPI(
    title="SIH26094 Intelligence Layer API",
    version="1.2.0",
    description="Dynamic Distress Scoring and Escalation Prediction Service"
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Health Check Endpoint for 24/7 Keep-Alive
@app.get("/health")
def health_check():
    return {"status": "alive", "service": "SIH26094 Intelligence Layer"}

# --- 1. Load Models at Startup ---
MODELS_DIR = os.path.join(current_dir, "models")

MODEL_EN_PATH = os.path.join(MODELS_DIR, "model_en.pkl")
MODEL_HI_PATH = os.path.join(MODELS_DIR, "model_hi.pkl")
MODEL_MR_PATH = os.path.join(MODELS_DIR, "model_mr.pkl")
MODEL_ESC_PATH = os.path.join(MODELS_DIR, "escalation_model.pkl")

model_en = joblib.load(MODEL_EN_PATH) if os.path.exists(MODEL_EN_PATH) else None
model_hi = joblib.load(MODEL_HI_PATH) if os.path.exists(MODEL_HI_PATH) else None
model_mr = joblib.load(MODEL_MR_PATH) if os.path.exists(MODEL_MR_PATH) else None
escalation_model = joblib.load(MODEL_ESC_PATH) if os.path.exists(MODEL_ESC_PATH) else None


# --- 2. Request Payloads ---
class ScoreRequest(BaseModel):
    checkin_id: str
    text: str
    language: Optional[str] = "en"
    recent_history: Optional[List[str]] = []
    previous_dds_scores: Optional[List[int]] = []
    response_latency_sec: Optional[int] = 0
    # NEW: Demographic prep for future dashboard slicing
    age_group: Optional[str] = None
    gender: Optional[str] = None
    location: Optional[str] = None

class ChatRequest(BaseModel):
    message: str
    language: Optional[str] = "en"

class CounselorInsightRequest(BaseModel):
    client_name: str
    current_dds: int
    risk_tier: str
    trigger_words: Optional[List[str]] = []
    trend_slope: Optional[int] = 0
    missed_checkins: Optional[int] = 0

class VictimInsightRequest(BaseModel):
    current_dds: int
    language: Optional[str] = "en"

# NEW: Regional Request for State/National Dashboards
class RegionalInsightRequest(BaseModel):
    region_name: str
    region_level: str # "National", "State", or "District"
    average_dds: int
    critical_cases_count: int
    top_triggers: List[str]
    primary_demographic: Optional[str] = "Unknown"


# --- 3. Dynamic Distress Scoring Endpoint ---
@app.post("/ai/v1/score")
def score_checkin(req: ScoreRequest):
    try:
        if req.language == "mr":
            clf = model_mr
        elif req.language == "hi":
            clf = model_hi
        else:
            clf = model_en
            
        if clf is None:
            raise HTTPException(status_code=500, detail=f"Requested language model '{req.language}' is not loaded.")

        # NLP Sentiment & Distress Probability
        distress_prob = float(clf.predict_proba([req.text])[0][1])
        nlp_points = distress_prob * 70  

        # Explainable AI: Extract Trigger Words
        feature_names = clf.named_steps['tfidf'].get_feature_names_out()
        coefficients = clf.named_steps['clf'].coef_[0]
        
        words = req.text.lower().split()
        word_weights = {}
        for word in words:
            if word in feature_names:
                idx = list(feature_names).index(word)
                if coefficients[idx] > 0:
                    word_weights[word] = float(coefficients[idx])
        
        trigger_words = sorted(word_weights, key=word_weights.get, reverse=True)[:3]

        # Behavioural Signal Penalties
        missed_count = req.recent_history.count("missed")
        missed_penalty = min(missed_count * 10, 20)
        latency_penalty = 10 if req.response_latency_sec > 60 else 0

        # Dynamic Distress Score (0-100)
        dds_score = int(min(100, max(0, nlp_points + missed_penalty + latency_penalty)))

        # Risk Tiering
        if dds_score < 40:
            risk_tier = "Low"
        elif dds_score < 70:
            risk_tier = "Moderate"
        elif dds_score < 85:
            risk_tier = "High"
        else:
            risk_tier = "Critical"

        # Predictive Escalation Trend Slope
        past_score = req.previous_dds_scores[-1] if req.previous_dds_scores else dds_score
        slope = dds_score - past_score

        if escalation_model:
            pred_features = np.array([[dds_score, slope, missed_count]])
            escalation_flag = bool(escalation_model.predict(pred_features)[0] == 1)
        else:
            escalation_flag = risk_tier in ["High", "Critical"]

        # Explainability Factors
        factors = [f"Text distress probability: {distress_prob:.2f}"]
        if trigger_words:
            factors.append(f"Trigger words detected: {', '.join(trigger_words)}")
        if missed_count > 0:
            factors.append(f"{missed_count} missed check-ins in recent history")
        if latency_penalty > 0:
            factors.append(f"Extended response latency ({req.response_latency_sec}s)")
        if slope > 15:
            factors.append(f"Rapid distress increase (+{slope} pts trend slope)")

        return {
            "dds_score": dds_score,
            "risk_tier": risk_tier,
            "sentiment_label": "distress" if distress_prob >= 0.5 else "neutral/positive",
            "emotion_signals": {
                "voice_stress": round(min(1.0, distress_prob * 0.9), 2),
                "flat_affect": round(min(1.0, (latency_penalty / 10.0) * 0.5), 2)
            },
            "contributing_factors": factors,
            "trigger_words": trigger_words, 
            "escalation_flag": escalation_flag
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# --- 4. Whisper Multilingual Speech-to-Text Endpoint ---
@app.post("/ai/v1/transcribe")
async def transcribe_audio(file: UploadFile = File(...)):
    try:
        if not groq_client:
            raise HTTPException(status_code=500, detail="Groq API Key is missing or client failed to initialize.")

        with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as temp_audio:
            temp_audio.write(await file.read())
            temp_path = temp_audio.name

        with open(temp_path, "rb") as audio_file:
            transcription = groq_client.audio.transcriptions.create(
                file=(file.filename, audio_file.read()),
                model="whisper-large-v3",
                response_format="json"
            )
            
        os.remove(temp_path)

        return {
            "transcript_text": transcription.text,
            "language_detected": "auto", 
            "confidence": 0.95
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# --- 5. Trauma-Informed Counselor Chatbot ---
@app.post("/ai/v1/chat")
def chat_counselor(req: ChatRequest):
    try:
        api_key = os.environ.get("GEMINI_API_KEY")
        if not api_key:
            raise HTTPException(status_code=500, detail="Gemini API Key is missing on the server.")
        
        client = genai.Client(api_key=api_key)
        
        system_instruction = (
            "You are a trauma-informed crisis counselor AI supporting victims of atrocities. "
            "Your tone must be highly empathetic, non-judgmental, grounding, and concise. "
            "Never provide legal or medical advice, but strictly focus on emotional de-escalation. "
            f"Respond to the user strictly in this language code: {req.language}."
        )
        
        response = client.models.generate_content(
            model='gemini-3.6-flash',
            contents=req.message,
            config=genai.types.GenerateContentConfig(
                system_instruction=system_instruction,
            ),
        )
        
        return {
            "reply": response.text,
            "language_used": req.language
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# --- 6. Counselor AI Insights Endpoint ---
@app.post("/ai/v1/counselor-insight")
def generate_counselor_insight(req: CounselorInsightRequest):
    try:
        api_key = os.environ.get("GEMINI_API_KEY")
        if not api_key:
            raise HTTPException(status_code=500, detail="Gemini API Key missing on the server.")
        
        client = genai.Client(api_key=api_key)
        prompt = (
            f"Provide a concise, 2-sentence objective clinical summary for a human crisis counselor. "
            f"Client: {req.client_name}. Distress Score: {req.current_dds}/100 ({req.risk_tier} Risk). "
            f"Detected triggers: {', '.join(req.trigger_words) if req.trigger_words else 'None'}. "
            f"Trend slope: {req.trend_slope}. Missed check-ins: {req.missed_checkins}. "
            "Highlight potential risks and recommended focus areas for their session."
        )
        
        response = client.models.generate_content(
            model='gemini-3.6-flash',
            contents=prompt,
        )
        return {"counselor_ai_summary": response.text}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/ai/v1/victim-insight")
def generate_victim_insight(req: VictimInsightRequest):
    try:
        api_key = os.environ.get("GEMINI_API_KEY")
        if not api_key:
            raise HTTPException(status_code=500, detail="Gemini API Key missing.")
        
        client = genai.Client(api_key=api_key)
        prompt = (
            f"You are an empathetic AI. The user has a distress score of {req.current_dds}/100. "
            f"Write a single, encouraging, grounding sentence for their dashboard. "
            f"Do not give medical advice. Respond in language: {req.language}."
        )
        
        response = client.models.generate_content(
            model='gemini-3.6-flash',
            contents=prompt,
        )
        return {"victim_ai_summary": response.text}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))    

# --- 7. Regional AI Insights (State/National Dashboards) ---
@app.post("/ai/v1/regional-insight")
def generate_regional_insight(req: RegionalInsightRequest):
    try:
        api_key = os.environ.get("GEMINI_API_KEY")
        if not api_key:
            raise HTTPException(status_code=500, detail="Gemini API Key missing.")
        
        client = genai.Client(api_key=api_key)
        
        if req.region_level.lower() == "district":
            focus = "Recommend tactical, micro-level operational actions (e.g., local counselor dispatch, community shelter coordination)."
        else:
            focus = "Recommend macro-level state or national policy allocations."

        prompt = (
            f"You are a public health AI advisor for the Ministry of Social Justice. "
            f"Generate a concise 3-sentence briefing for the {req.region_level} of {req.region_name}. "
            f"Average Distress Score: {req.average_dds}/100. Critical Cases: {req.critical_cases_count}. "
            f"Top Triggers: {', '.join(req.top_triggers)}. Most affected demographic: {req.primary_demographic}. "
            f"Identify the core problem. {focus} Do not discuss individual users."
        )
        
        response = client.models.generate_content(
            model='gemini-3.6-flash',
            contents=prompt,
        )
        return {"region": req.region_name, "policy_briefing": response.text}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)