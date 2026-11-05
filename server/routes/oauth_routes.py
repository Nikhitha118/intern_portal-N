from flask import Blueprint, redirect, request, jsonify
from bson import ObjectId
import os
import urllib.parse
import json
import secrets
import datetime
import jwt
import requests

from config.database import shared_db
import config.oauth_config as cfg

users = shared_db["users"]
oauth_bp = Blueprint("oauth_bp", __name__)


# ─────────────────────────────────────────────────────────────────────────────
# Helper: Generate & Verify Signed CSRF State Tokens
# ─────────────────────────────────────────────────────────────────────────────
def generate_oauth_state(provider, role="intern", redirect_to=None):
    payload = {
        "provider": provider.lower(),
        "role": role.lower() if role in ["intern", "mentor", "institution"] else "intern",
        "redirect_to": redirect_to,
        "nonce": secrets.token_hex(16),
        "exp": datetime.datetime.utcnow() + datetime.timedelta(minutes=15),
    }
    return jwt.encode(payload, cfg.SECRET_KEY, algorithm="HS256")


def verify_oauth_state(state_token, expected_provider=None):
    try:
        data = jwt.decode(state_token, cfg.SECRET_KEY, algorithms=["HS256"])
        if expected_provider and data.get("provider") != expected_provider.lower():
            return None, "Provider mismatch in state parameter"
        return data, None
    except jwt.ExpiredSignatureError:
        return None, "OAuth state expired. Please try signing in again."
    except Exception:
        return None, "Invalid or tampered OAuth state parameter."


# ─────────────────────────────────────────────────────────────────────────────
# Local Fallback Store (Ensures authentication survives MongoDB timeouts)
# ─────────────────────────────────────────────────────────────────────────────
DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data")
USERS_FILE = os.path.join(DATA_DIR, "users_store.json")

def _load_fallback_users():
    try:
        if os.path.exists(USERS_FILE):
            with open(USERS_FILE, "r", encoding="utf-8") as f:
                content = f.read().strip()
                if content:
                    data = json.loads(content)
                    return data if isinstance(data, list) else []
    except Exception as e:
        print(f"[OAuth] Warning loading fallback users: {e}")
    return []

def _save_fallback_users(users_list):
    try:
        os.makedirs(DATA_DIR, exist_ok=True)
        with open(USERS_FILE, "w", encoding="utf-8") as f:
            json.dump(users_list, f, indent=2)
    except Exception as e:
        print(f"[OAuth] Warning saving fallback users: {e}")


# ─────────────────────────────────────────────────────────────────────────────
# Helper: Handle User Linking, Creation & JWT Generation
# ─────────────────────────────────────────────────────────────────────────────
def handle_oauth_user(provider, provider_id, email, full_name, photo, requested_role="intern"):
    email = (email or "").strip().lower()
    full_name = (full_name or "").strip()
    provider = provider.lower().strip()
    provider_id = str(provider_id).strip()

    if not email:
        raise ValueError("Provider did not return a valid email address.")

    clean_role = requested_role.lower() if requested_role in ["intern", "mentor", "institution"] else "intern"
    clean_name = full_name or email.split("@")[0].replace(".", " ").title()

    user = None
    db_available = False

    # 1. Attempt lookup in MongoDB with timeout protection
    try:
        user = users.find_one({f"providers.{provider}": provider_id})
        if not user:
            user = users.find_one({"email": email})
        if not user:
            try:
                user = users.find_one({"email": {"$regex": f"^{email}$", "$options": "i"}})
            except Exception:
                user = None
        db_available = True
    except Exception as db_err:
        print(f"[OAuth] MongoDB offline or timed out: {db_err}. Falling back to persistent local store.")
        user = None
        db_available = False

    # 2. Check local persistent store if DB didn't find or is offline
    fallback_users = _load_fallback_users()
    if not user:
        for u in fallback_users:
            if u.get("providers", {}).get(provider) == provider_id or u.get("email", "").lower() == email:
                user = dict(u)
                break

    # 3. If account exists, update provider linking & photo
    if user:
        update_data = {
            f"providers.{provider}": provider_id,
            "authProvider": user.get("authProvider") or provider,
            "updatedAt": datetime.datetime.utcnow().isoformat(),
        }
        current_photo = user.get("photo")
        if photo and (not current_photo or current_photo == "/intern-avatar.jpg"):
            update_data["photo"] = photo
            user["photo"] = photo

        if not user.get("fullName") and full_name:
            update_data["fullName"] = full_name
            update_data["name"] = full_name
            user["fullName"] = full_name
            user["name"] = full_name

        user.setdefault("providers", {})[provider] = provider_id
        for k, v in update_data.items():
            if not k.startswith("providers."):
                user[k] = v

        if db_available:
            try:
                user_oid = ObjectId(user["_id"]) if not isinstance(user["_id"], ObjectId) else user["_id"]
                users.update_one({"_id": user_oid}, {"$set": update_data})
            except Exception as e:
                print(f"[OAuth] MongoDB update failed: {e}")

        # Sync update to local fallback store
        user_id_str = str(user.get("_id", ""))
        matched_idx = -1
        for idx, u in enumerate(fallback_users):
            if str(u.get("_id", "")) == user_id_str or u.get("email", "").lower() == email:
                matched_idx = idx
                break

        user_to_save = {**user, "_id": user_id_str}
        if matched_idx >= 0:
            fallback_users[matched_idx] = user_to_save
        else:
            fallback_users.append(user_to_save)
        _save_fallback_users(fallback_users)

    # 4. If account does not exist, create new user profile
    if not user:
        new_oid = str(ObjectId())
        new_user = {
            "_id": new_oid,
            "fullName": clean_name,
            "name": clean_name,
            "email": email,
            "password": "",  # Social login accounts have no password hash
            "role": clean_role,
            "photo": photo or "/intern-avatar.jpg",
            "authProvider": provider,
            "providers": {
                provider: provider_id
            },
            "bio": f"Joined InternPortal via {provider.capitalize()}",
            "skills": [],
            "phone": "",
            "createdAt": datetime.datetime.utcnow().isoformat(),
        }

        if db_available:
            try:
                res = users.insert_one(dict(new_user))
                new_user["_id"] = str(res.inserted_id)
            except Exception as e:
                print(f"[OAuth] MongoDB insert failed: {e}")

        fallback_users.append(dict(new_user))
        _save_fallback_users(fallback_users)
        user = new_user

    # Issue JWT session token matching existing portal authentication
    user_id = str(user["_id"])
    role = user.get("role", "intern")
    token = jwt.encode(
        {
            "user_id": user_id,
            "email": email,
            "role": role,
            "exp": datetime.datetime.utcnow() + datetime.timedelta(days=7),
        },
        cfg.SECRET_KEY,
        algorithm="HS256",
    )

    clean_name = (user.get("fullName") or user.get("name") or full_name or email.split("@")[0]).strip()
    return {
        "token": token,
        "user": {
            "id": user_id,
            "fullName": clean_name,
            "name": clean_name,
            "email": email,
            "role": role,
            "photo": user.get("photo") or photo or "/intern-avatar.jpg",
            "authProvider": provider,
        },
    }


# ─────────────────────────────────────────────────────────────────────────────
# 1. OAUTH CONFIGURATION STATUS CHECK
# ─────────────────────────────────────────────────────────────────────────────
@oauth_bp.route("/status", methods=["GET"])
def oauth_status():
    """Returns configuration status for all three social login providers."""
    return jsonify({
        "status": "ok",
        "providers": cfg.get_oauth_status(),
        "callback_urls": {
            "google": cfg.GOOGLE_CALLBACK_URL,
            "github": cfg.GITHUB_CALLBACK_URL,
            "linkedin": cfg.LINKEDIN_CALLBACK_URL,
        },
    })


# ─────────────────────────────────────────────────────────────────────────────
# 2. INITIATE AUTHORIZATION (REDIRECT TO PROVIDER)
# ─────────────────────────────────────────────────────────────────────────────
@oauth_bp.route("/authorize/<provider>", methods=["GET"])
@oauth_bp.route("/<provider>", methods=["GET"])
def authorize(provider):
    """Generates the provider authorization URL and redirects the browser."""
    provider = provider.lower().strip()
    if provider not in ["google", "github", "linkedin"]:
        return jsonify({"error": f"Unsupported provider: {provider}"}), 400

    if not cfg.is_provider_configured(provider):
        client_key = f"{provider.upper()}_CLIENT_ID"
        secret_key = f"{provider.upper()}_CLIENT_SECRET"
        err_msg = (
            f"{provider.capitalize()} OAuth is not configured on the backend. "
            f"Please configure {client_key} and {secret_key} in server/.env."
        )
        if request.headers.get("Accept", "").startswith("application/json"):
            return jsonify({"error": err_msg, "configured": False, "provider": provider}), 400
        return redirect(f"{cfg.FRONTEND_URL}/login?error={urllib.parse.quote(err_msg)}")

    role = request.args.get("role", "intern").strip().lower()
    redirect_to = request.args.get("redirect_to", None)
    state = generate_oauth_state(provider, role=role, redirect_to=redirect_to)

    auth_url = None

    if provider == "google":
        params = {
            "client_id": cfg.GOOGLE_CLIENT_ID,
            "redirect_uri": cfg.GOOGLE_CALLBACK_URL,
            "response_type": "code",
            "scope": "openid email profile",
            "access_type": "offline",
            "prompt": "select_account",
            "state": state,
        }
        auth_url = "https://accounts.google.com/o/oauth2/v2/auth?" + urllib.parse.urlencode(params)

    elif provider == "github":
        params = {
            "client_id": cfg.GITHUB_CLIENT_ID,
            "redirect_uri": cfg.GITHUB_CALLBACK_URL,
            "scope": "read:user user:email",
            "state": state,
        }
        auth_url = "https://github.com/login/oauth/authorize?" + urllib.parse.urlencode(params)

    elif provider == "linkedin":
        # LinkedIn OpenID Connect Sign-In
        params = {
            "client_id": cfg.LINKEDIN_CLIENT_ID,
            "redirect_uri": cfg.LINKEDIN_CALLBACK_URL,
            "response_type": "code",
            "scope": "openid profile email",
            "state": state,
        }
        auth_url = "https://www.linkedin.com/oauth/v2/authorization?" + urllib.parse.urlencode(params)

    if request.args.get("format") == "json":
        return jsonify({"url": auth_url, "provider": provider, "configured": True})

    return redirect(auth_url)


# ─────────────────────────────────────────────────────────────────────────────
# 3. OAUTH CALLBACK HANDLER (CODE EXCHANGE & PROFILE RETRIEVAL)
# ─────────────────────────────────────────────────────────────────────────────
@oauth_bp.route("/callback/<provider>", methods=["GET"])
@oauth_bp.route("/callback", methods=["GET"])
def oauth_callback(provider=None):
    """Handles OAuth 2.0 redirect from Google, GitHub, or LinkedIn."""
    if not provider:
        provider = request.args.get("provider", "google").lower().strip()
    else:
        provider = provider.lower().strip()

    error = request.args.get("error")
    error_desc = request.args.get("error_description") or request.args.get("error_reason") or ""
    if error:
        err_msg = f"{provider.capitalize()} login cancelled or denied."
        if error_desc:
            err_msg += f" ({error_desc})"
        return redirect(f"{cfg.FRONTEND_URL}/login?error={urllib.parse.quote(err_msg)}")

    code = request.args.get("code")
    state = request.args.get("state")

    if not code:
        return redirect(f"{cfg.FRONTEND_URL}/login?error={urllib.parse.quote('Authorization code missing from provider callback.')}")

    if not state:
        return redirect(f"{cfg.FRONTEND_URL}/login?error={urllib.parse.quote('OAuth state parameter missing from callback.')}")

    state_data, state_err = verify_oauth_state(state, expected_provider=provider)
    if state_err:
        return redirect(f"{cfg.FRONTEND_URL}/login?error={urllib.parse.quote(state_err)}")

    requested_role = state_data.get("role", "intern")

    try:
        email = None
        full_name = None
        photo = None
        provider_user_id = None

        if provider == "google":
            token_resp = requests.post(
                "https://oauth2.googleapis.com/token",
                data={
                    "code": code,
                    "client_id": cfg.GOOGLE_CLIENT_ID,
                    "client_secret": cfg.GOOGLE_CLIENT_SECRET,
                    "redirect_uri": cfg.GOOGLE_CALLBACK_URL,
                    "grant_type": "authorization_code",
                },
                timeout=12,
            )
            if token_resp.status_code != 200:
                err_body = token_resp.text
                return redirect(f"{cfg.FRONTEND_URL}/login?error={urllib.parse.quote(f'Google token exchange failed: {err_body[:100]}')}")

            token_data = token_resp.json()
            access_token = token_data.get("access_token")

            userinfo_resp = requests.get(
                "https://openidconnect.googleapis.com/v1/userinfo",
                headers={"Authorization": f"Bearer {access_token}"},
                timeout=12,
            )
            if userinfo_resp.status_code != 200:
                return redirect(f"{cfg.FRONTEND_URL}/login?error={urllib.parse.quote('Failed to fetch user profile from Google.')}")

            uinfo = userinfo_resp.json()
            email = uinfo.get("email")
            full_name = uinfo.get("name") or uinfo.get("given_name", "")
            photo = uinfo.get("picture")
            provider_user_id = uinfo.get("sub")

        elif provider == "github":
            token_resp = requests.post(
                "https://github.com/login/oauth/access_token",
                headers={"Accept": "application/json"},
                data={
                    "code": code,
                    "client_id": cfg.GITHUB_CLIENT_ID,
                    "client_secret": cfg.GITHUB_CLIENT_SECRET,
                    "redirect_uri": cfg.GITHUB_CALLBACK_URL,
                },
                timeout=12,
            )
            if token_resp.status_code != 200:
                return redirect(f"{cfg.FRONTEND_URL}/login?error={urllib.parse.quote('GitHub token exchange failed.')}")

            token_data = token_resp.json()
            access_token = token_data.get("access_token")
            if not access_token:
                err_msg = token_data.get("error_description") or "Invalid GitHub authorization code."
                return redirect(f"{cfg.FRONTEND_URL}/login?error={urllib.parse.quote(err_msg)}")

            gh_headers = {
                "Authorization": f"Bearer {access_token}",
                "Accept": "application/json",
                "User-Agent": "InternPortal-App",
            }
            gh_user_resp = requests.get("https://api.github.com/user", headers=gh_headers, timeout=12)
            if gh_user_resp.status_code != 200:
                return redirect(f"{cfg.FRONTEND_URL}/login?error={urllib.parse.quote('Failed to fetch profile from GitHub API.')}")

            gh_user = gh_user_resp.json()
            provider_user_id = str(gh_user.get("id"))
            full_name = gh_user.get("name") or gh_user.get("login") or "GitHub User"
            photo = gh_user.get("avatar_url")
            email = gh_user.get("email")

            if not email:
                emails_resp = requests.get("https://api.github.com/user/emails", headers=gh_headers, timeout=12)
                if emails_resp.status_code == 200:
                    emails_list = emails_resp.json()
                    if isinstance(emails_list, list):
                        for em in emails_list:
                            if em.get("primary") and em.get("verified"):
                                email = em.get("email")
                                break
                        if not email:
                            for em in emails_list:
                                if em.get("verified"):
                                    email = em.get("email")
                                    break
                if not email:
                    login_name = gh_user.get("login", "user")
                    email = f"{login_name}@users.noreply.github.com"

        elif provider == "linkedin":
            token_resp = requests.post(
                "https://www.linkedin.com/oauth/v2/accessToken",
                headers={"Content-Type": "application/x-www-form-urlencoded"},
                data={
                    "grant_type": "authorization_code",
                    "code": code,
                    "client_id": cfg.LINKEDIN_CLIENT_ID,
                    "client_secret": cfg.LINKEDIN_CLIENT_SECRET,
                    "redirect_uri": cfg.LINKEDIN_CALLBACK_URL,
                },
                timeout=12,
            )
            if token_resp.status_code != 200:
                err_text = token_resp.text
                return redirect(f"{cfg.FRONTEND_URL}/login?error={urllib.parse.quote(f'LinkedIn token exchange failed: {err_text[:100]}')}")

            token_data = token_resp.json()
            access_token = token_data.get("access_token")
            if not access_token:
                err_msg = token_data.get("error_description") or "Invalid LinkedIn access token."
                return redirect(f"{cfg.FRONTEND_URL}/login?error={urllib.parse.quote(err_msg)}")

            userinfo_resp = requests.get(
                "https://api.linkedin.com/v2/userinfo",
                headers={"Authorization": f"Bearer {access_token}"},
                timeout=12,
            )
            if userinfo_resp.status_code != 200:
                return redirect(f"{cfg.FRONTEND_URL}/login?error={urllib.parse.quote('Failed to fetch LinkedIn profile information.')}")

            li_user = userinfo_resp.json()
            provider_user_id = li_user.get("sub")
            email = li_user.get("email")
            full_name = (
                li_user.get("name")
                or f"{li_user.get('given_name', '')} {li_user.get('family_name', '')}".strip()
                or "LinkedIn User"
            )
            photo = li_user.get("picture")

        else:
            return redirect(f"{cfg.FRONTEND_URL}/login?error={urllib.parse.quote(f'Unsupported provider: {provider}')}")

        auth_result = handle_oauth_user(
            provider=provider,
            provider_id=provider_user_id,
            email=email,
            full_name=full_name,
            photo=photo,
            requested_role=requested_role,
        )

        token = auth_result["token"]
        user_json = json.dumps(auth_result["user"])
        encoded_user = urllib.parse.quote(user_json)

        return redirect(
            f"{cfg.FRONTEND_URL}/auth/callback?token={token}&userData={encoded_user}&provider={provider}"
        )

    except Exception as e:
        import traceback
        traceback.print_exc()
        err_msg = f"OAuth authentication error: {str(e)}"
        return redirect(f"{cfg.FRONTEND_URL}/login?error={urllib.parse.quote(err_msg)}")


# ─────────────────────────────────────────────────────────────────────────────
# 4. DIRECT JSON CODE EXCHANGE (SPA POPUP / MANUAL CLIENT EXCHANGE)
# ─────────────────────────────────────────────────────────────────────────────
@oauth_bp.route("/callback", methods=["POST"])
def oauth_callback_post():
    data = request.json or {}
    provider = data.get("provider", "google").lower().strip()
    code = data.get("code")
    state = data.get("state")

    if not code:
        return jsonify({"error": "Authorization code is required"}), 400

    requested_role = "intern"
    if state:
        state_data, state_err = verify_oauth_state(state, expected_provider=provider)
        if not state_err and state_data:
            requested_role = state_data.get("role", "intern")

    if not cfg.is_provider_configured(provider):
        return jsonify({
            "error": f"{provider.capitalize()} OAuth is not configured on the server. Please set {provider.upper()}_CLIENT_ID and {provider.upper()}_CLIENT_SECRET in server/.env.",
            "configured": False,
        }), 400

    return jsonify({"message": "Use GET callback redirect for standard OAuth 2.0 flow."}), 200
