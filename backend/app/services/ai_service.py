import json
import httpx
from sqlalchemy.orm import Session

from app.database.config import settings
from app.models.ai_insight import AIInsight

FALLBACK_INSIGHT = {
    "summary": "Unable to generate insights",
    "sentiment": "Neutral",
    "action_items": [],
    "risks": [],
}

AI_PROMPT = """Analyze the following meeting notes and provide insights in JSON format.

Meeting Notes:
{notes}

Respond with ONLY a valid JSON object in this exact format (no markdown, no code blocks, no extra text):
{{
  "summary": "A concise summary of the meeting",
  "sentiment": "Positive | Neutral | Negative",
  "action_items": ["action item 1", "action item 2"],
  "risks": ["risk 1", "risk 2"]
}}"""


def call_ai_api(notes: str) -> dict:
    if not settings.AI_API_KEY:
        print("[AI] No API key configured, using fallback")
        return FALLBACK_INSIGHT

    prompt = AI_PROMPT.format(notes=notes)
    max_retries = 2

    for attempt in range(max_retries + 1):
        try:
            with httpx.Client(timeout=30.0) as client:
                response = client.post(
                    settings.AI_API_URL,
                    headers={
                        "Authorization": f"Bearer {settings.AI_API_KEY}",
                        "Content-Type": "application/json",
                    },
                    json={
                        "model": settings.AI_MODEL,
                        "max_tokens": 1024,
                        "temperature": 0.3,
                        "messages": [{"role": "user", "content": prompt}],
                    },
                )

                response.raise_for_status()
                data = response.json()

                content = data["choices"][0]["message"]["content"]

                content = content.strip()
                if content.startswith("```"):
                    content = content.split("\n", 1)[1] if "\n" in content else content[3:]
                if content.endswith("```"):
                    content = content[:-3]
                content = content.strip()

                parsed = json.loads(content)

                if parsed.get("sentiment") not in ("Positive", "Neutral", "Negative"):
                    parsed["sentiment"] = "Neutral"

                print(f"[AI] Successfully generated insights (attempt {attempt + 1})")
                return {
                    "summary": parsed.get("summary", FALLBACK_INSIGHT["summary"]),
                    "sentiment": parsed["sentiment"],
                    "action_items": parsed.get("action_items", []),
                    "risks": parsed.get("risks", []),
                }
        except Exception as e:
            print(f"[AI] Attempt {attempt + 1} failed: {e}")
            if attempt == max_retries:
                return FALLBACK_INSIGHT

    return FALLBACK_INSIGHT


def generate_ai_insights(db: Session, interaction_id: int, notes: str) -> AIInsight:
    existing = db.query(AIInsight).filter(AIInsight.interaction_id == interaction_id).first()
    if existing:
        db.delete(existing)
        db.commit()

    result = call_ai_api(notes)

    insight = AIInsight(
        interaction_id=interaction_id,
        summary=result["summary"],
        sentiment=result["sentiment"],
        action_items=result["action_items"],
        risks=result["risks"],
    )
    db.add(insight)
    db.commit()
    db.refresh(insight)
    return insight
