from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.routers import auth, users, pujas, bookings, payments, pandits, admin, customer_auth
from app.core.database import engine, Base


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
def health():
    return {"status": "healthy"}
