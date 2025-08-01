# routes/myfatoorah.py
import os
import httpx
import json
from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from app.dependencies import get_current_user
from app import models
from app.database import get_db
from pydantic import BaseModel

router = APIRouter(tags=["MyFatoorah"])

class SubscribePayload(BaseModel):
    plan_id: str
    billing_cycle: str

# Plan prices mapped manually
monthly_prices = {"starter": 29, "growth": 59, "pro": 149}
yearly_prices = {
    plan: round(price * 12 * 0.8, 2)
    for plan, price in monthly_prices.items()
}


@router.post("/subscribe")
# async def subscribe_myfatoorah(data: dict, user=Depends(get_current_user)):
async def subscribe_myfatoorah(data: SubscribePayload, user=Depends(get_current_user)):
    plan_id = data.plan_id.lower()
    cycle = data.billing_cycle.lower()
    
    if cycle not in ["monthly", "yearly"]:
        raise HTTPException(status_code=400, detail="Invalid billing cycle")
    
    price = (
        monthly_prices.get(plan_id)
        if cycle == "monthly"
        else yearly_prices.get(plan_id)
    )
    if not price:
        raise HTTPException(status_code=400, detail="Invalid plan")
        
    payload = {
        "CustomerName": user.name or "User",
        "CustomerEmail": user.email,
        "InvoiceValue": price,
        "CallbackUrl": os.getenv("BASE_URL")+"/success",
        "ErrorUrl": os.getenv("BASE_URL")+"/error",
        "Language": "en",
        "DisplayCurrencyIso": "USD",
        "RecurringModel": {
            "RecurringType": "Monthly" if cycle == "monthly" else "Annually",
            "Iteration": 0,
            "RetryCount": 3
        },
        "PaymentMethodId": 2  # Required for recurring test payments
    }

    headers = {
        "Authorization": f"Bearer {os.getenv('MYFATOORAH_API_KEY')}",
        "Content-Type": "application/json"
    }

    async with httpx.AsyncClient() as client:
        res = await client.post(f"{os.getenv('MYFATOORAH_API_URL')}/ExecutePayment", json=payload, headers=headers)

    if res.status_code != 200:
        raise HTTPException(status_code=500, detail="ExecutePayment failed")

    return {"checkout_url": res.json()["Data"]["PaymentURL"]}


@router.post("/webhook")
async def myfatoorah_webhook(request: Request, db: Session = Depends(get_db)):
    payload = await request.json()
    data = payload.get("Data", {})

    email = data.get("CustomerEmail")
    invoice_status = data.get("InvoiceStatus")
    recurring_id = data.get("RecurringId")

    user = db.query(models.User).filter(models.User.email == email).first()
    if user:
        if invoice_status == "Paid":
            user.subscription_status = "active"
            user.billing_method = "myfatoorah"
            user.recurring_id = recurring_id
        elif invoice_status == "Failed":
            user.subscription_status = "failed"
        elif invoice_status == "Canceled":
            user.subscription_status = "canceled"
        db.commit()

    return JSONResponse(content={"status": "ok"})


@router.post("/cancel")
def cancel_recurring(user=Depends(get_current_user), db: Session = Depends(get_db)):
    if not user.recurring_id:
        raise HTTPException(status_code=400, detail="No active recurring payment")

    headers = {"Authorization": f"Bearer {os.getenv('MYFATOORAH_API_KEY')}"}
    res = httpx.post(f"{os.getenv('MYFATOORAH_API_URL')}/CancelRecurringPayment?recurringId={user.recurring_id}", headers=headers)

    if res.status_code == 200 and res.json().get("IsSuccess"):
        user.subscription_status = "canceled"
        user.recurring_id = None
        db.commit()
        return {"status": "canceled"}
    else:
        raise HTTPException(status_code=500, detail="Cancel failed")


@router.post("/resume")
def resume_recurring(user=Depends(get_current_user), db: Session = Depends(get_db)):
    if not user.recurring_id:
        raise HTTPException(status_code=400, detail="No recurring ID found")

    headers = {"Authorization": f"Bearer {os.getenv('MYFATOORAH_API_KEY')}"}
    res = httpx.post(f"{os.getenv('MYFATOORAH_API_URL')}/ResumeRecurringPayment?recurringId={user.recurring_id}", headers=headers)

    if res.status_code == 200 and res.json().get("IsSuccess"):
        user.subscription_status = "active"
        db.commit()
        return {"status": "resumed"}
    else:
        raise HTTPException(status_code=500, detail="Resume failed")
