from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    # Supabase
    supabase_url: str
    supabase_service_key: str  # Service role key for backend
    supabase_jwt_secret: str

    # Railway
    railway_environment: str = "development"

    # Microsoft OAuth
    ms_client_id: str = "e9d283c4-76fb-4b7a-9fff-4e28daa0a56e"  # Family Safety app
    ms_redirect_uri: str = ""  # Set in env

    class Config:
        env_file = ".env"


@lru_cache()
def get_settings() -> Settings:
    return Settings()
