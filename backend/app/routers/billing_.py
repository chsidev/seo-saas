import os, json, stripe, httpx, logging
from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from pydantic import BaseModel
from app.dependencies import get_current_user
from app import models
from app.database import get_db

# router = APIRouter(prefix="/billing", tags=["Billing"])
router = APIRouter(tags=["Billing"])

stripe.api_key = os.getenv("STRIPE_SECRET_KEY")
WEBHOOK_SECRET = os.getenv("STRIPE_WEBHOOK_SECRET")
STRIPE_PRICE_IDS = json.loads(os.getenv("STRIPE_PRICE_IDS", "{}")) 

class CheckoutRequest(BaseModel):
    plan_id: str  
    interval: str  
    payment_method: str  

@router.post("/create-checkout-session")
async def create_checkout_session(data: CheckoutRequest, user=Depends(get_current_user)):
    if data.payment_method == "stripe":
        price_key = f"{data.plan_id}_{data.interval}"
        price_id = STRIPE_PRICE_IDS.get(price_key)
        if not price_id:
            raise HTTPException(status_code=400, detail="Invalid Stripe price")
        try:
            session = stripe.checkout.Session.create(
                mode="subscription",
                payment_method_types=["card"],
                line_items=[{"price": price_id, "quantity": 1}],
                customer_email=user.email,
                metadata={"user_id": user.id, "plan": data.plan_id, "interval": data.interval,},
                success_url=os.getenv("BASE_URL") + "/payment-success",
                cancel_url=os.getenv("BASE_URL") + "/payment-cancel",
                subscription_data={
                    "trial_period_days": 60 if data.plan_id in ["starter", "growth"] else 0
                }
            )
            return {"checkout_url": session.url}
        except Exception as e:
            logging.exception("Stripe error")
            raise HTTPException(status_code=500, detail=str(e))
        
    elif data.payment_method == "myfatoorah":
        plan_prices = {"starter": 29, "growth": 59, "pro": 149}
        invoice_value = plan_prices.get(data.plan_id)
        if invoice_value is None:
            raise HTTPException(status_code=400, detail="Invalid MyFatoorah plan")
        payload = {
            "CustomerName": user.name or "User",
            "CustomerEmail": user.email,
            "InvoiceValue": invoice_value,
            "CallbackUrl": os.getenv("BASE_URL") + "/payment-success",
            "ErrorUrl": os.getenv("BASE_URL") + "/payment-error",
            "Language": "en",
            "DisplayCurrencyIso": "SAR"
        }
        headers = {
            "Authorization": f"Bearer {os.getenv('MYFATOORAH_API_KEY')}",
            "Content-Type": "application/json"
        }
        async with httpx.AsyncClient() as client:
            res = await client.post(f"{os.getenv('MYFATOORAH_API_URL')}/SendPayment", json=payload, headers=headers)
        if res.status_code != 200:
            raise HTTPException(status_code=500, detail="MyFatoorah invoice creation failed")
        return {"checkout_url": res.json()["Data"]["InvoiceURL"]}
    
    raise HTTPException(status_code=400, detail="Unsupported payment method")

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
        interval = obj["metadata"].get("interval")

        user = db.query(models.User).filter(models.User.email == email).first()
        if user:
            user.subscription_status = "active"
            user.subscription_plan = plan
            user.billing_method = "stripe"
            user.subscription_interval = interval
            db.commit()

    return JSONResponse(status_code=200, content={"status": "success"})

@router.post("/stripe/customer-portal")
def create_stripe_portal(user=Depends(get_current_user)):
    try:
        customer = stripe.Customer.list(email=user.email).data[0]  
        session = stripe.billing_portal.Session.create(
            customer=customer.id,
            return_url=os.getenv("BASE_URL") + "/dashboard"
        )
        return {"portal_url": session.url}
    except Exception as e:
        logging.exception("Stripe Portal Error")
        raise HTTPException(status_code=500, detail=str(e))
