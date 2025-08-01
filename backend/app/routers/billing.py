from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.dependencies import get_current_user
from app.database import get_db
from app import models
from datetime import datetime

router = APIRouter(prefix="/billing", tags=["Billing"])

@router.get("/status")
def get_billing_status(user=Depends(get_current_user)):
    usage = {
        "projects": 2,
        "keywords": 100,
        "audits": 5
    }
    limits = {
        "projects": 5,
        "keywords": 500,
        "audits": 10
    }
    return {
        "currentPlan": user.subscription_plan,
        "subscriptionStatus": user.subscription_status,
        "nextBilling": {
            "amount": 59.0,
            "date": datetime.utcnow().strftime("%Y-%m-%d")
        },
        "paymentMethod": user.billing_method,
        "usage": usage,
        "limits": limits,
        "currentPlanFeatures": [
            "Unlimited reports", "Team access", "Advanced audits"
        ]
    }

@router.get("/plans")
def get_available_plans():
    return [
        {
            "name": "Starter",
        },
        {
            "name": "Growth",
        },
        {
            "name": "Pro Agency",
        },
        {
            "name": "Enterprise",
        },
    ]
@router.get("/history")
def billing_history(user=Depends(get_current_user), db: Session = Depends(get_db)):
    records = db.query(models.BillingHistory).filter(models.BillingHistory.user_id == user.id).order_by(models.BillingHistory.date.desc()).all()
    return [
        {
            "id": r.id,
            "amount": r.amount,
            "status": r.status,
            "plan": r.plan,
            "provider": r.provider,
            "date": r.date.isoformat()
        }
        for r in records
    ]
