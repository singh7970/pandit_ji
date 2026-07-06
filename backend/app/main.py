import traceback
from fastapi import FastAPI, Request, Depends
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from sqlalchemy import text
from sqlalchemy.orm import Session

from app.routers import auth, users, pujas, bookings, payments, pandits, admin, customer_auth
from app.core.database import engine, Base, get_db


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Create all tables on startup
    Base.metadata.create_all(bind=engine)
    yield


app = FastAPI(
    title="PanditJi API",
    version="1.0.0",
    description="On-demand religious services marketplace API",
    lifespan=lifespan,
)


@app.exception_handler(Exception)
async def debug_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={
            "detail": str(exc),
            "traceback": "".join(traceback.format_exception(type(exc), exc, exc.__traceback__))
        }
    )


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(customer_auth.router, prefix="/customer-auth", tags=["customer-auth"])
app.include_router(users.router, prefix="/users", tags=["users"])
app.include_router(pujas.router, prefix="/pujas", tags=["pujas"])
app.include_router(bookings.router, prefix="/bookings", tags=["bookings"])
app.include_router(payments.router, prefix="/payments", tags=["payments"])
app.include_router(pandits.router, prefix="/pandits", tags=["pandits"])
app.include_router(admin.router, prefix="/admin", tags=["admin"])


@app.get("/")
def root():
    return {"status": "PanditJi API running", "version": "1.0.0"}


@app.get("/health")
def health(db: Session = Depends(get_db)):
    try:
        db.execute(text("SELECT 1"))
        return {"status": "healthy", "database": "connected"}
    except Exception as e:
        return {
            "status": "unhealthy",
            "database": "disconnected",
            "error": str(e),
            "traceback": "".join(traceback.format_exception(type(e), e, e.__traceback__))
        }

