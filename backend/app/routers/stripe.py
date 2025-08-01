import os
import stripe
import logging
from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import JSONResponse
from app.dependencies import get_current_user
from app import models
from app.database import get_db
from sqlalchemy.orm import Session
from pydantic import BaseModel

class CheckoutRequest(BaseModel):
    plan_id: str
    cycle: str = "monthly"

# router = APIRouter(prefix="/billing", tags=["Billing"])
router = APIRouter(tags=["Billing"])

stripe.api_key = os.getenv("STRIPE_SECRET_KEY")
WEBHOOK_SECRET = os.getenv("STRIPE_WEBHOOK_SECRET")
PLAN_PRICE_IDS = os.getenv("STRIPE_PRICE_IDS", "{}")

@router.post("/create-checkout-session")
# def create_checkout_session(plan_id:str, user=Depends(get_current_user)):
def create_checkout_session(data: CheckoutRequest, user=Depends(get_current_user)):
    price_id = PLAN_PRICE_IDS.get(data.plan_id.lower())
    if not price_id:
        raise HTTPException(status_code=400, detail="Invalid plan selected")
    try:
        session = stripe.checkout.Session.create(
            payment_method_types=["card"],
            mode="subscription",
            line_items=[{
                "price": price_id,  
                "quantity": 1,
            }],
            customer_email=user.email,
            metadata={"user_id": user.id, "plan": plan_id},
            success_url=os.getenv("BASE_URL")+"/success",
            cancel_url=os.getenv("BASE_URL")+"/cancel",
        )
        return {"checkout_url": session.url}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/webhook")
async def stripe_webhook(request: Request, db: Session = Depends(get_db)):
    payload = await request.body()
    sig_header = request.headers.get("stripe-signature")

    try:
        event = stripe.Webhook.construct_event(payload, sig_header, WEBHOOK_SECRET)
    except stripe.error.SignatureVerificationError:
        raise HTTPException(status_code=400, detail="Webhook signature verification failed")
    
    logging.info(f"Stripe Event: {event['type']}")
    obj = event["data"]["object"]

    if event["type"] == "checkout.session.completed":
        email = obj.get("customer_email")
        plan = obj["metadata"].get("plan")

        user = db.query(models.User).filter(models.User.email == email).first()
        if user:
            # user.is_subscribed = True
            user.subscription_plan = plan
            db.commit()

    return JSONResponse(status_code=200, content={"status": "success"})