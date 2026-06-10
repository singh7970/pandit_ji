import razorpay
from app.core.config import settings

razorpay_client = razorpay.Client(
    auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET)
)


def create_razorpay_order(amount_inr: float, booking_id: str) -> dict:
    """Create a Razorpay order. Amount is in INR — converted to paise."""
    amount_paise = int(amount_inr * 100)
    order = razorpay_client.order.create({
        "amount": amount_paise,
        "currency": "INR",
        "receipt": f"booking_{booking_id}",
        "notes": {"booking_id": booking_id},
    })
    return order


def capture_payment(payment_id: str, amount_paise: int) -> dict:
    """Capture an authorized payment."""
    return razorpay_client.payment.capture(payment_id, amount_paise, {"currency": "INR"})


def initiate_refund(payment_id: str, amount_paise: int) -> dict:
    """Issue a full or partial refund."""
    return razorpay_client.payment.refund(payment_id, {
        "amount": amount_paise,
        "speed": "optimum",
    })


def trigger_route_transfer(payment_id: str, pandit_payout_paise: int, pandit_account_id: str) -> dict:
    """
    Route split payout to pandit's linked Razorpay account.
    Requires Razorpay Route feature enabled on the account.
    """
    return razorpay_client.payment.transfer(payment_id, {
        "transfers": [
            {
                "account": pandit_account_id,
                "amount": pandit_payout_paise,
                "currency": "INR",
                "on_hold": False,
            }
        ]
    })
