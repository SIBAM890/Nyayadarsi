# SECURITY & DEPLOYMENT RISK ASSESSMENT
## Environment Configuration & Production Readiness — Nyayadarsi v2.0

Generated: May 7, 2026

---

## CRITICAL SECURITY RISKS

### ✅ RESOLVED — RISK-1: JWT_SECRET_KEY Predictable & Exposed
**Status:** FIXED (Validator added in `backend/core/config.py` to enforce security standards)

**Issue Location:** [backend/core/config.py](backend/core/config.py#L23)

```python
JWT_SECRET_KEY: str = "nyayadarsi-dev-secret-CHANGE-BEFORE-DEPLOYING-32chars+"
```

**Vulnerability:**
- Hardcoded default in source code (GitHub accessible)
- Only 32 bytes (weak for HS256)
- Checked at runtime but only for Railway environment
- Development deployments might use this key

**Impact:**
- Attacker who reads code can forge JWT tokens
- Any user can claim to be any officer
- Complete authentication bypass

**Runtime Check (Insufficient):**
```python
def __init__(self, **kwargs):
    super().__init__(**kwargs)
    import os
    if self.JWT_SECRET_KEY.startswith("nyayadarsi-dev-secret") and os.getenv("RAILWAY_ENVIRONMENT"):
        raise RuntimeError("...")  # ← Only checks Railway, not Render/Vercel
```

**Fix:**

1. Generate strong key:
```bash
python -c "import secrets; print(secrets.token_hex(32))"
# Output: a1b2c3d4e5f6... (64 hex chars = 32 bytes)
```

2. Set in all deployment platforms:
```bash
# Render: Environment > Secrets
JWT_SECRET_KEY=a1b2c3d4e5f6...

# Vercel: Settings > Environment Variables
# (frontend doesn't use this, but document it)
```

3. Update validation:
```python
@validator('JWT_SECRET_KEY')
def validate_jwt_key(cls, v):
    if v.startswith("nyayadarsi-dev-secret"):
        raise ValueError("Default JWT key must not be used in production")
    if len(v) < 32:
        raise ValueError("JWT key must be at least 32 bytes")
    return v
```

---

## ✅ RESOLVED — RISK-2: API_BASE URL Falls Back to Empty String
**Status:** FIXED (Validation added in `apiClient.ts` and `vercel.json` configuration updated)

```typescript
const API_BASE = process.env.NEXT_PUBLIC_API_URL || '';
```

**Vulnerability:**
- Production Vercel deployment: `NEXT_PUBLIC_API_URL` undefined
- Falls back to empty string
- All API calls go to `https://nyaya-darshi.vercel.app/api/...`
- Should go to `https://nyayadarsi.onrender.com/api/...`
- CORS blocks all requests (different origin)

**Current State:**
- vercel.json exists but doesn't set environment variables properly
- No .env.production file to default values

**Impact:**
- Complete API failure in production
- Silent failures (requests go to wrong domain)
- Zero error messaging to user about misconfiguration

**Fix:**

1. Update vercel.json:
```json
{
  "env": {
    "NEXT_PUBLIC_API_URL": "@api_url"
  },
  "buildCommand": "npm run build && npm run validate-env"
}
```

2. Add validation script:
```bash
#!/bin/bash
# scripts/validate-env.sh
if [ -z "$NEXT_PUBLIC_API_URL" ]; then
  echo "❌ ERROR: NEXT_PUBLIC_API_URL not set"
  exit 1
fi
echo "✓ API_URL set to: $NEXT_PUBLIC_API_URL"
```

3. Add validation to apiClient.ts:
```typescript
const API_BASE = process.env.NEXT_PUBLIC_API_URL;
if (!API_BASE) {
  throw new Error(
    'NEXT_PUBLIC_API_URL environment variable not set. ' +
    'Configure in Vercel dashboard: Settings > Environment Variables'
  );
}
```

---

### ✅ RESOLVED — RISK-3: Hardcoded Demo Credentials in Source Code
**Status:** FIXED (Moved to environment variables with fallback in `backend/main.py`)

**Issue Location:** [frontend/store/AuthContext.tsx](frontend/store/AuthContext.tsx#L71-72)

```typescript
const DEMO_CREDENTIALS = { 
  email: 'demo@nyayadarsi.gov.in', 
  password: 'nyayadarsi_demo_2026' 
};
```

**Vulnerability:**
- Credentials visible in GitHub (public repo or leaked)
- Used for automatic login without user action
- Anyone with code can login as demo user
- Demo account has full permissions (gov_officer role)

**Seeded in Database:** [backend/main.py](backend/main.py#L57-58)

```python
DEMO_EMAIL = "demo@nyayadarsi.gov.in"
DEMO_PASSWORD = "nyayadarsi_demo_2026"
```

**Impact:**
- Unauthorized users can access production system
- Can upload tenders, create fake evaluations
- Complete data manipulation possible

**Fix:**

1. Move credentials to environment variables:
```typescript
const DEMO_CREDENTIALS = {
  email: process.env.NEXT_PUBLIC_DEMO_EMAIL!,
  password: process.env.NEXT_PUBLIC_DEMO_PASSWORD!,
};
```

2. Set in .env.local (git-ignored):
```
NEXT_PUBLIC_DEMO_EMAIL=demo@nyayadarsi.gov.in
NEXT_PUBLIC_DEMO_PASSWORD=<random-password>
```

3. Disable auto-login in production:
```typescript
const ENABLE_DEMO_AUTO_LOGIN = process.env.NODE_ENV === 'development';

if (ENABLE_DEMO_AUTO_LOGIN && !token) {
  autoLoginDemo();
}
```

4. Change demo password in production backend before deploying

---

### 🔴 RISK-4: No CSRF Protection on POST Endpoints

**Issue:** All POST routes lack CSRF token validation

**Vulnerable Routes:**
- POST /api/tender/upload
- POST /api/evaluation/officer-decision
- POST /api/builder/upload
- POST /api/collusion/run
- POST /api/payment/trigger

**Attack Scenario:**
```
1. Officer logged in at nyayadarsi.onrender.com
2. Clicks malicious link on attacker.com
3. Hidden form auto-submits to /api/payment/trigger
4. Browser includes officer's JWT cookie
5. Unauthorized payment triggered
```

**Fix:**

```python
# backend/middleware/csrf.py
from fastapi import Request, HTTPException

@app.middleware("http")
async def csrf_protection(request: Request, call_next):
    if request.method in ["POST", "PUT", "DELETE"]:
        # Check CSRF token
        csrf_token = request.headers.get("X-CSRF-Token")
        if not csrf_token:
            raise HTTPException(403, detail="Missing CSRF token")
        
        # Validate token (implementation details...)
        if not validate_csrf_token(csrf_token):
            raise HTTPException(403, detail="Invalid CSRF token")
    
    return await call_next(request)
```

**Frontend:**
```typescript
// Generate token on login
async function getCSRFToken() {
  const response = await fetch('/api/csrf-token');
  const { token } = await response.json();
  sessionStorage.setItem('csrf_token', token);
  return token;
}

// Include in all POST requests
headers['X-CSRF-Token'] = sessionStorage.getItem('csrf_token');
```

---

### ✅ RESOLVED — RISK-5: GPS Coordinates Stored in Unencrypted Audit Trail
**Status:** FIXED (Redaction logic added to `backend/audit/sha256_logger.py`)

**Issue Location:** [backend/services/builder_service.py](backend/services/builder_service.py#L52-65)

```python
audit_log(
    db=db,
    action="UPLOAD_ACCEPTED",
    entity_id=contract_id,
    input_data={"lat": latitude, "lon": longitude, "photos": photo_count},  # ← Exposed
    output_data=location_result,
)
```

**Vulnerability:**
- Builder GPS location stored in plaintext in audit logs
- Location history visible to any officer
- Can track builder movements over time
- Privacy violation (GDPR, privacy laws)
- Audit PDF exports include location data

**Impact:**
- Privacy compliance violation
- Potential stalking/harassment
- Data breach if logs exposed

**Fix:**

```python
def audit_log(
    db: Session,
    action: str,
    entity_id: str,
    input_data: dict,
    **kwargs
):
    # Redact location data
    if "lat" in input_data or "lon" in input_data:
        input_data = {
            **input_data,
            "lat": "[REDACTED]",
            "lon": "[REDACTED]"
        }
    
    # ... rest of function ...

# Or: Store hash instead
import hashlib

def hash_coordinates(lat: float, lon: float) -> str:
    """Create privacy-preserving hash of coordinates"""
    coords_str = f"{lat},{lon}"
    return hashlib.sha256(coords_str.encode()).hexdigest()[:16]

input_data = {
    "location_hash": hash_coordinates(latitude, longitude),
    # Don't store raw lat/lon
}
```

---

## HIGH PRIORITY SECURITY ISSUES

### ✅ RESOLVED — ISSUE-6: No Rate Limiting on API Endpoints
**Status:** FIXED (Global Rate Limiting Middleware implemented in `main.py`)

**Problem:** Endpoints unprotected against brute force / DOS

```python
# ❌ No rate limiting decorator
@router.post("/login", ...)
async def login(request: LoginRequest, db: Session = Depends(get_db)):
    # Can be called unlimited times
    user = authenticate_user(db, request)
    ...
```

**Attack:** Brute force password attempt
```bash
for i in {1..10000}; do
  curl -X POST http://localhost:8000/api/auth/login \
    -d '{"email":"demo@...", "password":"guess'$i'"}'
done
```

**Fix:**

```python
from slowapi import Limiter

limiter = Limiter(key_func=get_remote_address)

@router.post("/login", ...)
@limiter.limit("5/minute")
async def login(request: Request, ...):
    # Max 5 login attempts per minute per IP
    ...

# Apply to sensitive endpoints:
@router.post("/payment/trigger", ...)
@limiter.limit("10/minute")
async def trigger_payment(...):
    ...
```

---

### ✅ RESOLVED — ISSUE-7: No Input Validation on Length/Content
**Status:** FIXED (max_length constraints added to Pydantic schemas)

**Example:**

```python
@router.post("/integrity-check")
async def check_integrity(
    request: IntegrityCheckRequest,  # ← Field has min_length=10
    ...
):
    # But no max_length! Could be 10MB string
    pass

# Frontend can send:
{
  "criterion_text": "A" * 10000000,  // 10MB string
  "category": "construction"
}
```

**Fix:**

```python
class IntegrityCheckRequest(BaseModel):
    criterion_text: str = Field(..., min_length=10, max_length=50000)
    category: str = Field(..., pattern=r"^(construction|services|supplies)$")
```

---

### ✅ RESOLVED — ISSUE-8: Database Passwords Visible in Logs
**Status:** FIXED (URL sanitization added to startup logs)

**Issue:** DATABASE_URL logged at startup

```python
# backend/main.py
logger.info(f"Database URL: {settings.DATABASE_URL}")
# Logs: postgresql://user:password@host/db
```

**Fix:**

```python
# Sanitize before logging
import re
def sanitize_url(url: str) -> str:
    return re.sub(r':([^:@]+)@', ':***@', url)

logger.info(f"Database: {sanitize_url(settings.DATABASE_URL)}")
# Logs: postgresql://user:***@host/db
```

---

### 🟠 ISSUE-9: No SQL Injection Protection on Dynamic Queries

**Issue:** If any code builds SQL dynamically (unlikely but check)

```python
# ❌ DANGEROUS (don't do this)
query = f"SELECT * FROM tender WHERE id = '{tender_id}'"
db.execute(query)
```

**Fix:** All ORM queries are parameterized (SQLAlchemy does this):

```python
# ✓ SAFE
tender = db.query(Tender).filter(Tender.id == tender_id).first()
```

**Audit:** Grep for `.execute()` with f-strings:
```bash
grep -r "execute.*f\"" backend/
```

---

### ✅ RESOLVED — ISSUE-10: Gemini API Key Exposed in Error Messages
**Status:** FIXED (Generic error handling implemented in `gemini_client.py`)

**Problem:**

```python
# ❌ Error response might leak API key
except ValueError as e:
    raise HTTPException(500, detail=str(e))
    # Error message: "GEMINI_API_KEY is not set. Check configuration."
    # Or: "API key appears invalid: sk-xxx"
```

**Fix:**

```python
except ValueError as e:
    logger.error(f"API key error: {e}", exc_info=True)  # Log full error
    raise HTTPException(
        500,
        detail={"error": True, "message": "AI service not configured", "code": "NO_AI"}
    )  # Generic user-facing message
```

---

## ENVIRONMENT CONFIGURATION ISSUES

### Missing .env Files

**Required Files:**

1. **backend/.env** (local dev only)
```
GEMINI_API_KEY=sk-...
OPENROUTER_API_KEY=sk-or-...
DATABASE_URL=sqlite:///nyayadarsi.db
JWT_SECRET_KEY=dev-key-not-for-production
```

2. **frontend/.env.local** (local dev only)
```
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_DEMO_EMAIL=demo@...
NEXT_PUBLIC_DEMO_PASSWORD=...
```

3. **backend/.env.production** (production reference)
```
# DO NOT COMMIT TO GIT
# Set all values in deployment platform
# Required keys:
# - GEMINI_API_KEY
# - OPENROUTER_API_KEY (optional)
# - DATABASE_URL
# - JWT_SECRET_KEY
# - REGISTERED_SITE_LAT
# - REGISTERED_SITE_LON
```

**Current Issue:** No .env.production or documentation of required vars

**Fix:** Create example file:

```bash
# backend/.env.production.example
GEMINI_API_KEY=<set-in-render-dashboard>
DATABASE_URL=postgresql://<user>:<pass>@<host>/<db>
JWT_SECRET_KEY=<generate-with-secrets.token_hex(32)>
```

And document in README:
```markdown
## Production Deployment

Set these environment variables in your deployment platform:

1. **Render Dashboard → Environment**
   - GEMINI_API_KEY
   - DATABASE_URL (PostgreSQL connection string)
   - JWT_SECRET_KEY (generate with: python -c "import secrets; print(secrets.token_hex(32))")
   
2. **Vercel Dashboard → Settings → Environment Variables**
   - NEXT_PUBLIC_API_URL=https://nyayadarsi.onrender.com
```

---

## ✅ RESOLVED — CORS CONFIGURATION ISSUES
**Status:** FIXED (Production Render URL added to `_ALLOWED_ORIGINS` in `main.py`)

```python
_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://localhost:3001",
    "https://nyaya-darshi.vercel.app",  # ← Old/hardcoded
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=_ALLOWED_ORIGINS,
    allow_origin_regex=r"https://.*\.vercel\.app",  # ← Too permissive
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

**Problems:**

1. Domain might change without code update
2. `allow_origin_regex=r"https://.*\.vercel\.app"` allows ANY Vercel domain (attacker can deploy app)
3. `allow_methods=["*"]` allows dangerous methods

**Fix:**

```python
ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://localhost:3001",
    os.getenv("FRONTEND_URL", "https://nyaya-darshi.vercel.app"),  # ← From env
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],  # ← Explicit
    allow_headers=["Content-Type", "Authorization"],
)
```

**Environment Variable:**
```
# Set in Render/Vercel
FRONTEND_URL=https://nyaya-darshi.vercel.app
```

---

## PRODUCTION DEPLOYMENT CHECKLIST

### Pre-Deployment

- [ ] JWT_SECRET_KEY set to strong random value (64 hex chars)
- [ ] GEMINI_API_KEY configured (or fallback to OpenRouter)
- [ ] DATABASE_URL points to production PostgreSQL
- [ ] NEXT_PUBLIC_API_URL set to production backend URL
- [ ] Demo credentials changed or disabled
- [ ] CORS allowed origins whitelist verified
- [ ] All sensitive keys removed from source code
- [ ] `.env` files added to .gitignore
- [ ] Rate limiting configured
- [ ] CSRF protection enabled
- [ ] Error messages don't leak sensitive data

### Post-Deployment

- [ ] Test API requests from production frontend
- [ ] Verify authentication flow works
- [ ] Check logs for error messages (no API keys visible)
- [ ] Monitor for unusual 401/403 errors (indicates attack)
- [ ] Set up alerts for rate limit hits
- [ ] Test PDF export functionality
- [ ] Verify email notifications (if implemented)
- [ ] Monitor database connection pool

### Ongoing Security

- [ ] Monthly security audit
- [ ] Review API logs for suspicious patterns
- [ ] Update dependencies monthly
- [ ] Rotate JWT secret key quarterly
- [ ] Audit database for orphan records
- [ ] Review audit logs monthly

---

## COMPLIANCE CHECKLIST

### GDPR (if EU users)
- [ ] Privacy Policy published
- [ ] Consent for location data storage
- [ ] Right to be forgotten implementation
- [ ] Data retention policy (delete logs after 90 days?)

### Data Localization (if India-required)
- [ ] Database hosted in India (Render has India region?)
- [ ] Backups stored in India
- [ ] No data transfer to US servers

### Audit Requirements
- [ ] Immutable audit log (SHA256 chain)
- [ ] Officer identification in all logs
- [ ] Timestamp accuracy (UTC)
- [ ] Export audit trail in court-admissible format

---

**End of Report**
