import os
from dotenv import load_dotenv

load_dotenv()

# Base URLs
FRONTEND_URL = os.getenv("FRONTEND_URL", os.getenv("CLIENT_URL", "http://localhost:3000")).rstrip("/")
SERVER_URL = os.getenv("SERVER_URL", os.getenv("BACKEND_URL", "http://localhost:5000")).rstrip("/")

# Secret Key for JWT & State signatures
raw_secret = os.getenv("SECRET_KEY", "internportal_secret_key_2025_secure_jwt_token")
SECRET_KEY = raw_secret if len(raw_secret) >= 32 else raw_secret.ljust(32, "_")

# Google OAuth 2.0
GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID", "").strip()
GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET", "").strip()
GOOGLE_CALLBACK_URL = os.getenv(
    "GOOGLE_CALLBACK_URL",
    f"{SERVER_URL}/auth/oauth/callback/google"
).strip()

# GitHub OAuth 2.0
GITHUB_CLIENT_ID = os.getenv("GITHUB_CLIENT_ID", "").strip()
GITHUB_CLIENT_SECRET = os.getenv("GITHUB_CLIENT_SECRET", "").strip()
GITHUB_CALLBACK_URL = os.getenv(
    "GITHUB_CALLBACK_URL",
    f"{SERVER_URL}/auth/oauth/callback/github"
).strip()

# LinkedIn OAuth 2.0 (OpenID Connect)
LINKEDIN_CLIENT_ID = os.getenv("LINKEDIN_CLIENT_ID", "").strip()
LINKEDIN_CLIENT_SECRET = os.getenv("LINKEDIN_CLIENT_SECRET", "").strip()
LINKEDIN_CALLBACK_URL = os.getenv(
    "LINKEDIN_CALLBACK_URL",
    f"{SERVER_URL}/auth/oauth/callback/linkedin"
).strip()

def is_provider_configured(provider):
    p = (provider or "").lower().strip()
    if p == "google":
        return bool(
            GOOGLE_CLIENT_ID
            and GOOGLE_CLIENT_SECRET
            and "your_" not in GOOGLE_CLIENT_ID.lower()
            and "placeholder" not in GOOGLE_CLIENT_ID.lower()
        )
    if p == "github":
        return bool(
            GITHUB_CLIENT_ID
            and GITHUB_CLIENT_SECRET
            and "your_" not in GITHUB_CLIENT_ID.lower()
            and "placeholder" not in GITHUB_CLIENT_ID.lower()
        )
    if p == "linkedin":
        return bool(
            LINKEDIN_CLIENT_ID
            and LINKEDIN_CLIENT_SECRET
            and "your_" not in LINKEDIN_CLIENT_ID.lower()
            and "placeholder" not in LINKEDIN_CLIENT_ID.lower()
        )
    return False

def get_oauth_status():
    return {
        "google": is_provider_configured("google"),
        "github": is_provider_configured("github"),
        "linkedin": is_provider_configured("linkedin"),
    }
