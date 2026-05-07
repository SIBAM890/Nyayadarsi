# QUICK REFERENCE: CRITICAL FIXES FOR DEVELOPERS
## Fast-Track Debugging Guide — Nyayadarsi v2.0

**Read this first if you need to fix issues quickly**

---

## 🔴 MUST-FIX ISSUES (Block Production Release)

### ✅ RESOLVED — Issue: API Calls Fail with 404
**Status:** FIXED (Render URL whitelisted in CORS and configuration verified)

**Symptoms:**
- All API requests return 404
- Frontend shows "Network error"
- Browser console: "failed to fetch"

**Root Cause:** Missing NEXT_PUBLIC_API_URL environment variable

**Fix (5 minutes):**

**Step 1:** In Vercel Dashboard
- Settings → Environment Variables
- Add: `NEXT_PUBLIC_API_URL` = `https://nyayadarsi.onrender.com`
- Redeploy

**Step 2:** Verify
```bash
# Frontend should see the URL
console.log(process.env.NEXT_PUBLIC_API_URL)
# Output: https://nyayadarsi.onrender.com
```

**Files Affected:**
- frontend/services/apiClient.ts (line 5)
- frontend/.env.local (development only)

---

### ✅ RESOLVED — Issue: Tender Upload Returns 422 Error
**Status:** FIXED (Schema `extraction_warning` field added to `backend/schemas/tender.py`)

**Symptoms:**
- User selects PDF, clicks upload
- Gets "422 Unprocessable Entity"
- No criteria displayed

**Root Cause:** Schema missing `extraction_warning` field

**Fix (10 minutes):**

**Step 1:** Update Schema
```python
# File: backend/schemas/tender.py
# After line 65, ADD:

from typing import Optional

class ExtractionWarning(BaseModel):
    message: str
    type: str

# In TenderUploadResponse class, ADD after audit: AuditRecord line:
extraction_warning: Optional[ExtractionWarning] = None
```

**Step 2:** Redeploy backend

**Step 3:** Test
```bash
curl -X POST http://localhost:8000/api/tender/upload \
  -F "file=@sample.pdf" \
  -H "Authorization: Bearer $TOKEN"
# Response should include extraction_warning field
```

**Files Affected:**
- backend/schemas/tender.py (line 45-65)
- backend/services/tender_service.py (line 106) — returns this field

---

### ✅ RESOLVED — Issue: Authentication Redirect Loop
**Status:** FIXED (Retry flag clearing logic implemented in `apiClient.ts`)

**Symptoms:**
- Login succeeds but page keeps reloading
- Browser tab stuck in loading state
- Console shows 401 errors repeatedly

**Root Cause:** Auth retry flag never cleared after successful login

**Fix (10 minutes):**

**Step 1:** Update apiClient
```typescript
// File: frontend/services/apiClient.ts
// In buildHeaders() function, after line 30, ADD:

function getStoredToken(): string | null {
  if (typeof window === 'undefined') return null;
  const token = sessionStorage.getItem('nyayadarsi_token');
  
  // Clear retry flag when we have token
  if (token) {
    sessionStorage.removeItem('nyayadarsi_auth_retry');
  }
  
  return token;
}
```

**Step 2:** Redeploy frontend

**Step 3:** Test
```bash
# 1. Logout
# 2. Login with demo@nyayadarsi.gov.in / nyayadarsi_demo_2026
# 3. Should navigate to /gov without reloading
```

**Files Affected:**
- frontend/services/apiClient.ts (lines 13-17, 68-85)

---

### Issue: JWT Secret Key Compromised

**Symptoms:**
- Backend logs warning: "❌ JWT_SECRET_KEY must be set..."
- Demo users report unauthorized access
- Any user can forge JWT tokens

**Root Cause:** Default JWT secret visible in source code

**Fix (15 minutes):**

**Step 1:** Generate new key
```bash
python -c "import secrets; print(secrets.token_hex(32))"
# Output: a1b2c3d4e5f6... (copy this value)
```

**Step 2:** Set in Render Dashboard
- Go to Render → Settings → Secrets
- Add: `JWT_SECRET_KEY` = `a1b2c3d4e5f6...` (from step 1)
- Redeploy

**Step 3:** Update local development
```bash
# File: backend/.env
JWT_SECRET_KEY=dev-secret-not-for-production-abc123
```

**Step 4:** Verify
```bash
# Run backend, check no warnings in logs
python backend/main.py
# Should NOT see: "JWT_SECRET_KEY must be set"
```

**Files Affected:**
- backend/core/config.py (line 23) — default key
- backend/.env (add line)
- Render Dashboard → Secrets

---

### Issue: Criteria Extraction Hangs/Times Out

**Symptoms:**
- Upload tender PDF
- Page shows "Extracting..." forever
- Eventually times out after 30s

**Root Cause:** `extract()` function not properly async, blocking event loop

**Fix (15 minutes):**

**Step 1:** Check current implementation
```python
# File: backend/ai/criteria_extractor.py line ~140
# Look for: async def extract(text: str) -> dict:
```

**Step 2:** Ensure function is truly async
```python
async def extract(text: str) -> dict:
    """Extract criteria — must be awaitable"""
    prompt = EXTRACTION_PROMPT.format(tender_text=text)
    
    # Must await gemini call
    response = await gemini_client.generate(prompt)
    
    # ... rest of function ...
    
    return {
        "criteria": criteria,
        "warning": extraction_warning
    }  # Returns dict (which is fine, it's wrapped in async)
```

**Step 3:** Check calling code
```python
# File: backend/services/tender_service.py line ~71
extraction_result = await extract(pdf_result["text"])  # ✓ Correctly awaited
```

**Step 4:** Test
```bash
# Upload should complete in <5 seconds
```

**Files Affected:**
- backend/ai/criteria_extractor.py (line ~140)
- backend/services/tender_service.py (line ~71)

---

### Issue: Authentication Buttons Not Working

**Symptoms:**
- Auth page renders but login/register buttons don't respond
- No error messages

**Root Cause:** AuthContext not protecting routes, component doesn't validate

**Fix (20 minutes):**

**Step 1:** Update AuthWrapper component
```typescript
// File: frontend/pages/_app.tsx (lines 26-32)

import { useRouter } from 'next/router';
import { useEffect } from 'react';

function AuthWrapper({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  
  // Check auth on mount
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      // Redirect to home if not authenticated and not on home page
      if (router.pathname !== '/' && router.pathname !== '/index') {
        router.push('/');
      }
    }
  }, [isAuthenticated, isLoading, router]);
  
  // Show loading spinner while checking auth
  if (isLoading) {
    return <LoadingSpinner message="Authenticating..." />;
  }
  
  return <>{children}</>;
}
```

**Step 2:** Redeploy frontend

**Step 3:** Test
```bash
# 1. Go to /gov without logging in
# 2. Should redirect to /
# 3. Login with demo credentials
# 4. Should navigate to /gov
```

**Files Affected:**
- frontend/pages/_app.tsx (lines 26-32)

---

## 🟠 HIGH-PRIORITY ISSUES (Fix This Week)

### Quick Fixes (30 minutes each)

| Issue | File | Line | Fix |
|-------|------|------|-----|
| Missing `tender_title` in evaluation | backend/schemas/evaluation.py | 28 | Add field to schema |
| Null values showing in UI | frontend/components/** | various | Add null checks before render |
| No error boundary | frontend/pages/evaluation.tsx | 1 | Add try/catch in component |
| GPS verification inconsistent | backend/services/builder_service.py | 30-100 | Consolidate to single function |
| Race condition in LocationStore | frontend/store/LocationStore.ts | 120-150 | Add request ID tracking |

### Medium Fixes (1-2 hours each)

1. **Add Rate Limiting**
   - File: backend/main.py
   - Action: Install slowapi, add @limiter decorator

2. **Standardize Error Responses**
   - File: backend/core/errors.py (create)
   - Action: Create global ErrorResponse class

3. **Add Payment Validation**
   - File: backend/services/payment_service.py
   - Action: Verify milestone exists before scheduling

4. **Fix CORS Configuration**
   - File: backend/main.py (line 43)
   - Action: Use environment variable instead of hardcoded domain

5. **Implement CSRF Protection**
   - File: backend/middleware/csrf.py (create)
   - Action: Add CSRF token validation middleware

---

## 🟡 MEDIUM-PRIORITY ISSUES (Fix This Month)

### Database Optimization
```python
# Add indexes for better performance
# File: backend/models/tender.py

class Tender(Base):
    # ... existing fields ...
    status: str = Column(String, default="draft", index=True)  # ← ADD index=True
    created_by: str = Column(String, nullable=True, index=True)  # ← ADD index=True
```

### Add Validation
```python
# File: backend/core/config.py
# Add validator for production safety

@validator('JWT_SECRET_KEY')
def validate_jwt_key(cls, v):
    if v.startswith("nyayadarsi-dev-secret"):
        raise ValueError("Default JWT key must not be used in production")
    if len(v) < 32:
        raise ValueError("JWT key must be at least 32 bytes")
    return v
```

### Responsive Design Fix
```typescript
// File: frontend/pages/evaluation.tsx (line 55)
// Change from:
<div className="col-span-3 ...">

// To:
<div className="col-span-12 md:col-span-3 ...">
// Now works on mobile (12 cols) and desktop (3 cols)
```

---

## DEBUG COMMANDS

### Test Backend API
```bash
# Check if API is running
curl http://localhost:8000/health
# Output: {"status": "healthy", ...}

# Test tender upload
curl -X POST http://localhost:8000/api/tender/upload \
  -F "file=@test.pdf" \
  -H "Authorization: Bearer $TOKEN"

# Test evaluation
curl http://localhost:8000/api/evaluation/CRPF-2025-CONST-001/results \
  -H "Authorization: Bearer $TOKEN"
```

### Check Frontend Environment
```javascript
// In browser console:
console.log(process.env.NEXT_PUBLIC_API_URL)
// Should output: https://nyayadarsi.onrender.com

console.log(sessionStorage.getItem('nyayadarsi_token'))
// Should output: JWT token or null
```

### Enable Debug Logging
```python
# In backend/main.py, change logging level:
logging.basicConfig(
    level=logging.DEBUG,  # Changed from INFO
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
```

```typescript
// In frontend services:
if (process.env.NODE_ENV === 'development') {
  console.log('[API]', method, url, response);
}
```

---

## COMMON ERRORS & SOLUTIONS

### Error: "Cannot find module 'google.genai'"
**Solution:** Install dependencies
```bash
cd backend
pip install -r requirements.txt
# Or specifically:
pip install google-genai>=0.4.0
```

### Error: "CORS policy: No 'Access-Control-Allow-Origin' header"
**Solution:** Check backend CORS configuration
```python
# backend/main.py line 48-52
# Verify ALLOWED_ORIGINS includes frontend URL
```

### Error: "422 Unprocessable Entity"
**Solution:** Check API response schema matches
```python
# Compare what backend returns vs what schema expects
# Usually: field is missing or wrong type
```

### Error: "Hydration mismatch"
**Solution:** Delay render until client-side
```typescript
const [mounted, setMounted] = useState(false);
useEffect(() => { setMounted(true); }, []);
if (!mounted) return null;
```

### Error: "GEMINI_API_KEY is not set"
**Solution:** Configure API keys
```bash
# Local: Add to backend/.env
GEMINI_API_KEY=sk-...

# Production: Set in Render Dashboard
```

---

## VERIFICATION CHECKLIST

### Before Pushing Code
- [ ] No 422 errors on tender upload
- [ ] No 401 redirect loop on login
- [ ] All API calls return correct schema
- [ ] No errors in browser console (dev)
- [ ] No security warnings in logs

### Before Deploying to Render
- [ ] JWT_SECRET_KEY set (not default)
- [ ] GEMINI_API_KEY configured
- [ ] DATABASE_URL set to production
- [ ] All tests passing locally
- [ ] No hardcoded passwords in code

### Before Deploying to Vercel
- [ ] NEXT_PUBLIC_API_URL set
- [ ] Build completes without errors
- [ ] Can reach backend API
- [ ] Demo login works or disabled
- [ ] No environment variables in code

---

## GETTING HELP

### For specific issue details:
→ See **DEBUG_REPORT.md** (main debugging report)

### For API schema mismatches:
→ See **API_CONTRACT_REPORT.md** (type system issues)

### For security/deployment issues:
→ See **SECURITY_DEPLOYMENT_REPORT.md**

### For complete project plan:
→ See **EXECUTIVE_SUMMARY.md** (action items & timeline)

---

**Last Updated:** May 7, 2026  
**Total Issues in System:** 77  
**Critical Issues:** 11  
**Must-Fix Before Release:** 5
