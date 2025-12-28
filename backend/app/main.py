from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.services.scheduler import scheduler
from app.routers import health, ms_auth, accounts, control


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    scheduler.start()
    yield
    # Shutdown
    scheduler.shutdown()


app = FastAPI(
    title="XPCombinado Family Safety Service",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS for Supabase Edge Functions and React Native app
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Restrict in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(health.router, tags=["Health"])
app.include_router(ms_auth.router, prefix="/auth", tags=["Microsoft Auth"])
app.include_router(accounts.router, prefix="/accounts", tags=["Accounts"])
app.include_router(control.router, prefix="/control", tags=["Control"])
