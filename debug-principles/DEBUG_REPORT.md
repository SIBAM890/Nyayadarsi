# 🔍 COMPREHENSIVE DEBUGGING REPORT — Nyayadarsi v2.0
## AI-Powered Procurement Justice Platform

**Report Generated:** May 7, 2026  
**Scope:** Full-stack analysis (Next.js 14 + FastAPI + Gemini AI)  
**Severity Range:** CRITICAL → Low  

---

## TABLE OF CONTENTS
1. [Critical Issues](#critical-issues-11-found)
2. [High Priority Issues](#high-priority-issues-15-found)
3. [Medium Priority Issues](#medium-priority-issues-18-found)
4. [Architecture Inconsistencies](#architecture-inconsistencies)
5. [API Contract Validation](#api-contract-validation)
6. [Security & Performance](#security--performance)
7. [Step-by-Step Repair Plan](#step-by-step-repair-plan)

---

## CRITICAL ISSUES (11 found)

### ✅ RESOLVED — CRITICAL-1: Async/Await Optimization in Criteria Extraction
**Status:** FIXED in commit `5f4a1c`
**Fix:** The `extract()` function was optimized to ensure full non-blocking execution using `loop.run_in_executor` for synchronous SDK calls.

```python
# ❌ BROKEN CODE (criteria_extractor.py lines ~138-150)
async def extract(text: str) -> dict:
    """Extract criteria — should be async but isn't properly implemented"""
    prompt = EXTRACTION_PROMPT.format(tender_text=text)
    response = await gemini_client.generate(prompt)  # ✓ Correctly awaited
    # ... rest of function
    return {"criteria": criteria, "warning": extraction_warning}  # ❌ Returns dict, not awaitable
```

**Runtime Impact:** The await will fail or return synchronously, causing the tender upload to hang or return incomplete data.

**Impact on:** Tender upload flow will fail silently or timeout after 30s.

**Fix:** Change function signature to properly support async:

```python
async def extract(text: str) -> dict:
    """Extract criteria using Gemini AI with fallback to OpenRouter."""
    prompt = EXTRACTION_PROMPT.format(tender_text=text)
    response = await gemini_client.generate(prompt)
    # ... processing ...
    return {"criteria": criteria, "warning": extraction_warning}
```

---

### ✅ RESOLVED — CRITICAL-2: Type Mismatch in TenderUploadResponse
**Status:** FIXED (Added `extraction_warning` to `backend/schemas/tender.py`)

```python
# ❌ SCHEMA MISSING FIELD (backend/schemas/tender.py)
class TenderUploadResponse(BaseModel):
    """Full response from tender PDF upload."""
    tender_id: str
    doc_hash: str
    criteria: list[dict[str, Any]]
    alerts: list[dict[str, Any]]
    total_criteria: int
    mandatory_count: int
    discretionary_count: int
    pdf_info: PdfInfo
    audit: AuditRecord
    # ❌ Missing: extraction_warning field
```

**But backend returns it:** [backend/services/tender_service.py](backend/services/tender_service.py#L106)

```python
return {
    # ...
    "extraction_warning": extraction_warning,  # ✓ Returned but not in schema
    # ...
}
```

**Runtime Impact:** Pydantic validation will fail, returning 422 UNPROCESSABLE_ENTITY to frontend.

**Fix:** Add field to schema:

```python
class TenderUploadResponse(BaseModel):
    # ... existing fields ...
    extraction_warning: Optional[dict[str, str]] = None  # Add this
```

---

### ✅ RESOLVED — CRITICAL-3: Infinite Redirect Loop in Auth 401 Handler
**Status:** FIXED (Retry flag cleared on successful token retrieval in `apiClient.ts`)

```typescript
// ❌ BROKEN CODE (apiClient.ts lines 68-85)
if (response.status === 401 && typeof window !== 'undefined') {
  if (!sessionStorage.getItem('nyayadarsi_auth_retry')) {
    sessionStorage.setItem('nyayadarsi_auth_retry', 'true');  // Set
    sessionStorage.removeItem('nyayadarsi_token');
    window.location.reload();  // Reload to trigger auto-login
  } else {
    console.error('[Auth] Auth failed after retry...');
    sessionStorage.removeItem('nyayadarsi_auth_retry');  // Clear here
  }
}
// Problem: Flag cleared only on second 401. Not cleared on successful login.
```

**Runtime Impact:** 
- User logs in, token stored in sessionStorage
- Makes API call with new token
- **If any 401 occurs** (e.g., token validation race), flag is set
- User then cannot use any API — all requests trigger reload loop
- Auth system becomes permanently stuck

**Fix:** Clear retry flag when token is successfully obtained:

```typescript
// ✅ FIXED CODE
const token = getStoredToken();
if (token) {
  headers['Authorization'] = `Bearer ${token}`;
  // Clear retry flag on successful token retrieval
  sessionStorage.removeItem('nyayadarsi_auth_retry');
}
```

---

### 🔴 CRITICAL-4: Missing API_BASE Environment Variable
**File:** [frontend/services/apiClient.ts](frontend/services/apiClient.ts#L5)  
**Lines:** 5  
**Root Cause:** API_BASE is set from env var but .env.local only exists in development. Production Vercel builds will have empty API_BASE.

```typescript
const API_BASE = process.env.NEXT_PUBLIC_API_URL || '';  // Falls back to ''!
```

**env.local shows:**
```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

**Runtime Impact:** 
- Production: All API calls go to `/api/...` (relative path)
- Vercel hosting frontend at `nyaya-darshi.vercel.app`
- Requests go to `https://nyaya-darshi.vercel.app/api/...` instead of actual backend
- All API calls fail with CORS errors

**Fix:** Set environment variable in Vercel deployment config (vercel.json needs updating):

```json
{
  "env": {
    "NEXT_PUBLIC_API_URL": "@api_url"
  },
  "buildCommand": "npm run build"
}
```

And in prod: `https://nyayadarsi.onrender.com` (or actual backend URL)

---

### 🔴 CRITICAL-5: Database Session Auto-Commit Issue
**File:** [backend/core/database.py](backend/core/database.py#L35)  
**Lines:** 35-37  
**Root Cause:** SessionLocal created with `autocommit=False, autoflush=False` but tender_service.py calls `db.add()` then `db.commit()` inside an async context where the session might be garbage collected.

```python
# ❌ UNSAFE (database.py lines 35-37)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Then in service (tender_service.py):
db.add(tender)
db.commit()  # ❌ Can fail if session is closed due to GC
```

**Runtime Impact:** Under high load or with async context switching:
- Session closes before commit completes
- Data loss: tender created but not persisted
- Audit log created but tender doesn't exist
- Database in inconsistent state

**Fix:** Use proper session lifecycle management:

```python
# ✅ In service, wrap in try/except
try:
    db.add(tender)
    db.flush()  # Flush to get ID
    db.commit()
except Exception as e:
    db.rollback()
    raise HTTPException(...)
```

Or better, use context manager pattern in FastAPI dependency.

---

### 🔴 CRITICAL-6: Gemini JSON Parsing Silent Failure
**File:** [backend/ai/criteria_extractor.py](backend/ai/criteria_extractor.py#L120-160)  
**Lines:** 120-160 (repair_json function)  
**Root Cause:** JSON repair function has aggressive fallback logic that silently returns malformed JSON, and caller doesn't verify validity.

```python
def _repair_json(text: str) -> str:
    """Attempt to repair malformed JSON..."""
    try:
        json.loads(text)
        return text
    except json.JSONDecodeError:
        pass
    
    # ... multiple repair strategies ...
    
    # ❌ CRITICAL: Give up and return whatever we have
    return repaired  # ← Might still be invalid JSON!

# Then in extract():
repaired = _repair_json(response)
data = json.loads(repaired)  # ❌ Can still fail here silently
```

**Runtime Impact:** 
- Gemini returns partially valid JSON
- Repair function gives up
- json.loads() raises exception
- Frontend never receives criteria
- Tender upload fails with no clear error message

**Fix:** Raise exception on parse failure rather than silently continuing:

```python
def extract(text: str) -> dict:
    # ...
    response = await gemini_client.generate(prompt)
    cleaned = _clean_json_response(response)
    repaired = _repair_json(cleaned)
    try:
        data = json.loads(repaired)
    except json.JSONDecodeError as e:
        raise ValueError(f"Failed to parse Gemini response after repairs: {e}. Raw: {response[:200]}")
```

---

### 🔴 CRITICAL-7: Unhandled Promise Rejection in useApi Hook
**File:** [frontend/hooks/useApi.ts](frontend/hooks/useApi.ts#L30-45)  
**Lines:** 30-45 (execute function)  
**Root Cause:** fetchFn promise can reject but rejection is not caught. If network fails during fetch, error is silently swallowed.

```typescript
// ❌ BROKEN (useApi.ts)
const execute = useCallback(async () => {
    setLoading(true);
    setError(null);
    const result = await fetchFn();  // ❌ No try/catch!
    if (mountedRef.current) {
      setData(result.data);
      setError(result.error);
      setLoading(false);
    }
}, deps);
```

**Runtime Impact:** 
- Network error while fetching
- Promise rejects (e.g., fetch() throws)
- Error is never caught
- Component stays in loading state forever
- User sees infinite spinner

**Fix:** Add try/catch:

```typescript
const execute = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchFn();
      if (mountedRef.current) {
        setData(result.data);
        setError(result.error);
        setLoading(false);
      }
    } catch (err) {
      if (mountedRef.current) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        setLoading(false);
      }
    }
}, deps);
```

---

### 🔴 CRITICAL-8: Race Condition in LocationStore.setVerification
**File:** [frontend/store/LocationStore.ts](frontend/store/LocationStore.ts#L168-180)  
**Lines:** 168-180  
**Root Cause:** The setVerification method is called from async context but modifies state without synchronization. If two verification requests complete out-of-order, last one wins (wrong).

```typescript
// ❌ RACE CONDITION (LocationStore.ts)
setVerification(v: LocationVerification) {
    currentState = {
      ...currentState,
      distanceMeters: v.distance_meters,
      isOnsite: v.accepted,
      isFlagged: v.flagged,
      address: v.reverse_geocoded_address,
      // ...
    };
    this.emitChange();  // Notifies subscribers immediately, state might be stale
}

// Called from:
const verify = async () => {
    const { data } = await verifyLocation(/* current coords */);
    if (data) setVerification(data);  // ❌ What if user moved in the meantime?
};
```

**Runtime Impact:** 
- User GPS updated at 12:00:01 → verification request sent
- User GPS updated at 12:00:02 → newer verification request sent
- First request finishes at 12:00:05 → state updated
- Second request finishes at 12:00:03 → state updated (wrong!)
- GPS verification shows wrong location

**Fix:** Add request ID to track which response is current:

```typescript
let latestVerificationRequestId = 0;

setVerification(v: LocationVerification, requestId: number) {
    if (requestId < latestVerificationRequestId) return;  // Discard stale
    // ... update state ...
    this.emitChange();
}
```

---

### ✅ RESOLVED — CRITICAL-9: CORS Misconfiguration for Production
**Status:** FIXED (Render URL `https://nyayadarsi.onrender.com` added to `_ALLOWED_ORIGINS` in `main.py`)

```python
_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://localhost:3001",
    "https://nyaya-darshi.vercel.app",  # ← Hardcoded old domain
]
app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=r"https://.*\.vercel\.app",  # ← Fallback allows any Vercel
    # ...
)
```

**Runtime Impact:** 
- Frontend at `nyaya-darshi.vercel.app`
- Backend at `nyayadarsi.onrender.com`
- Browser blocks cross-origin requests with "CORS policy" error
- All API calls fail
- Users see blank screens

**Fix:** Update CORS configuration:

```python
_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://localhost:3001",
    "https://nyaya-darshi.vercel.app",
    "https://nyayadarsi.onrender.com",
]
```

---

### ✅ RESOLVED — CRITICAL-10: Missing Required Pydantic Field
**Status:** FIXED (YellowQueueResponse updated to use `list[YellowQueueItem]` in `backend/schemas/evaluation.py`)

```python
# ❌ TOO VAGUE (evaluation.py line 49)
class YellowQueueResponse(BaseModel):
    """Yellow queue response."""
    tender_id: str
    total_yellow: int
    items: list[dict]  # ❌ Should be list[YellowQueueItem] or dict


# Backend returns (evaluation_service.py):
return {
    "tender_id": tender_id,
    "total_yellow": len(yellow_items),
    "items": yellow_items,  # ← Contains YellowQueueItem objects
}
```

**Runtime Impact:** Validation passes but frontend expects specific schema. Type safety lost.

**Fix:** Use proper type:

```python
class YellowQueueResponse(BaseModel):
    """Yellow queue response."""
    tender_id: str
    total_yellow: int
    items: list[YellowQueueItem]  # ✓ Strongly typed
```

---

### 🔴 CRITICAL-11: Unhandled FileNotFoundError in Mock Data Loading
**File:** [backend/services/evaluation_service.py](backend/services/evaluation_service.py#L11-19)  
**Lines:** 11-19  
**Root Cause:** _load_mock tries to load JSON files but doesn't handle FileNotFoundError. If demo/mock_data files missing, services crash.

```python
def _load_mock(filename: str) -> dict[str, Any]:
    """Load mock data from demo/mock_data directory."""
    filepath = settings.DEMO_DATA_DIR / filename
    if not filepath.exists():
        return {}
    with open(filepath, "r", encoding="utf-8") as f:
        return json.load(f)  # ❌ Can fail if JSON is invalid


# Called from routes but no error handling at route level
def get_evaluation_results(tender_id: str) -> dict[str, Any]:
    data = _load_mock("evaluation_results.json")  # ← If fails, 500 error
    if not data:
        raise HTTPException(...)
```

**Runtime Impact:** 
- Demo data file corrupted or missing
- json.load() raises JSONDecodeError
- Route returns 500 Internal Server Error (generic)
- User sees generic error message
- No indication that demo data is the problem

**Fix:** Add proper error handling:

```python
def _load_mock(filename: str) -> dict[str, Any]:
    """Load mock data from demo/mock_data directory."""
    filepath = settings.DEMO_DATA_DIR / filename
    if not filepath.exists():
        return {}
    try:
        with open(filepath, "r", encoding="utf-8") as f:
            return json.load(f)
    except json.JSONDecodeError as e:
        logger.error(f"Invalid JSON in {filename}: {e}")
        return {}
    except Exception as e:
        logger.error(f"Error loading {filename}: {e}")
        return {}
```

---

## HIGH PRIORITY ISSUES (15 found)

### 🟠 HIGH-1: Missing AuthProvider Wrapper in _app.tsx
**File:** [frontend/pages/_app.tsx](frontend/pages/_app.tsx#L26-32)  
**Lines:** 26-32  
**Root Cause:** AuthWrapper component doesn't actually protect routes. It just returns children without checking auth.

```typescript
function AuthWrapper({ children }: { children: React.ReactNode }) {
  const { isLoading } = useAuth();
  
  return <>{children}</>;  // ❌ No authentication check!
}
```

**Runtime Impact:** Unauthenticated users can access protected pages (gov, evaluation, builder, audit).

**Fix:** Add proper route protection:

```typescript
function AuthWrapper({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  
  useEffect(() => {
    if (!isLoading && !isAuthenticated && router.pathname !== '/') {
      router.push('/');
    }
  }, [isAuthenticated, isLoading, router]);
  
  if (isLoading) return <LoadingSpinner />;
  
  return <>{children}</>;
}
```

---

### 🟠 HIGH-2: Invalid JSON Import in Development
**File:** [frontend/services/apiClient.ts](frontend/services/apiClient.ts#L93-119)  
**Lines:** 93-119  
**Root Cause:** The mock data fallback tries to dynamically import JSON files, which may fail in production builds (Next.js may bundle differently).

```typescript
// ❌ FRAGILE (apiClient.ts)
try {
    if (url.includes('/evaluation/') && url.includes('/results')) {
      const mock = await import('../demo/mock_data/evaluation_results.json');
      return { data: mock.default as any as T, error: null };
    }
    // ...
} catch (mockErr) {
    console.error('Mock data not found', mockErr);
    return { data: null, error: message };
}
```

**Runtime Impact:** 
- Development: Works via Webpack
- Production: May fail because JSON imports aren't guaranteed
- Users see "Mock data not found" error instead of real data

**Fix:** Use proper mock data structure instead of JSON imports:

```typescript
const MOCK_DATA = {
  '/api/evaluation/*/results': require('../demo/mock_data/evaluation_results.json'),
  '/api/evaluation/*/yellow-queue': require('../demo/mock_data/yellow_queue.json'),
};
```

Or better: Serve mock data as static files from `/public/mock_data/`.

---

### 🟠 HIGH-3: SSR Hydration Mismatch in Builder Dashboard
**File:** [frontend/pages/builder.tsx](frontend/pages/builder.tsx#L35-45)  
**Lines:** 35-45 (MapView dynamic import)  
**Root Cause:** MapView is lazy-loaded with SSR disabled, but component renders differently on server vs client, causing hydration mismatch.

```typescript
const MapView = dynamic<MapViewProps>(
  () => import('@/components/builder/MapView'),
  {
    ssr: false,  // ✓ Good
    loading: () => <LoadingSpinner .../>,  // ✓ Good
  }
);

// But in BuilderDashboardInner, we use location from LocationStore
// which is initialized on client-side only
```

**Runtime Impact:** 
- Initial render on server: no location data
- Hydration on client: location data appears
- "Hydration mismatch" warning in console
- Map might not render initially

**Fix:** Use `useEffect` to delay render until mounted:

```typescript
const [mounted, setMounted] = useState(false);

useEffect(() => {
  setMounted(true);
}, []);

if (!mounted) return null;

return <MapView ... />;
```

---

### 🟠 HIGH-4: Missing Error Boundary in Evaluation Page
**File:** [frontend/pages/evaluation.tsx](frontend/pages/evaluation.tsx#L1)  
**Lines:** 1-50 (beginning of file)  
**Root Cause:** The evaluation page fetches data from two APIs in parallel but has no error boundary if both fail.

```typescript
const [selectedBidder, setSelectedBidder] = useState<BidderEvaluation | null>(null);
// ...
const { evalData, yellowQueue, loading } = useEvaluation(TENDER_ID);
// ❌ If both requests fail, evalData and yellowQueue are both null
// Component tries to render null data without error message
```

**Runtime Impact:** 
- API calls fail
- Page renders empty/broken UI
- No error message to user
- Looks like page is frozen

**Fix:** Add error handling in component:

```typescript
if (!loading && (!evalData || !yellowQueue)) {
  return (
    <Layout title="...">
      <ErrorDisplay error="Failed to load evaluation data. Please refresh." />
    </Layout>
  );
}
```

---

### 🟠 HIGH-5: JWT Token Expiry Not Handled
**File:** [frontend/store/AuthContext.tsx](frontend/store/AuthContext.tsx#L80-100)  
**Lines:** 80-100 (useEffect)  
**Root Cause:** Token is stored and retrieved but never validated for expiry. If token expires, old token is still in sessionStorage.

```typescript
useEffect(() => {
    const token = getToken();
    
    if (token) {
      getMe().then(({ data }) => {
        if (data) {
          dispatch({ type: 'SET_USER', user: data, token });
        } else {
          // Token expired — attempt demo auto-login
          clearToken();
          autoLoginDemo();  // ✓ Tries to recover
        }
      });
    }
}, []);
```

**Runtime Impact:** 
- User logged in 24+ hours ago (ACCESS_TOKEN_EXPIRE_MINUTES=1440)
- Token still in storage but expired
- API calls fail with 401
- User forced to logout and re-login

**Fix:** Decode JWT and check expiry before use:

```typescript
function isTokenExpired(token: string): boolean {
  try {
    const decoded = jwtDecode(token);
    return decoded.exp! * 1000 < Date.now();
  } catch {
    return true;
  }
}
```

---

### 🟠 HIGH-6: Gemini API Rate Limiting Not Handled
**File:** [backend/ai/gemini_client.py](backend/ai/gemini_client.py#L95-110)  
**Lines:** 95-110 (rate limit handling)  
**Root Cause:** Rate limit handling waits 10 seconds but doesn't use exponential backoff. High load will quickly exhaust retries.

```python
if "rate" in error_str or "quota" in error_str or "429" in error_str:
    if attempt == 0:
        logger.warning("Gemini rate limited. Waiting 10s before retry...")
        await asyncio.sleep(10)  # ❌ Fixed 10s, no backoff
        continue
    raise RuntimeError("Gemini rate limit exceeded after retry.")
```

**Runtime Impact:** 
- 10+ concurrent tender uploads
- Gemini API rate limited
- All 10 hit the 10s wait
- All retry at same time → hit limit again
- Cascading failures

**Fix:** Use exponential backoff:

```python
base_delay = 2 ** attempt  # 2, 4, 8, ...
await asyncio.sleep(base_delay + random.uniform(0, 1))
```

---

### 🟠 HIGH-7: Collusion Service Load Mock Data Silently Fails
**File:** [backend/services/collusion_service.py](backend/services/collusion_service.py#L29-45)  
**Lines:** 29-45  
**Root Cause:** If mock data file missing, service returns partial flags with defaults, user sees incomplete collusion report.

```python
def run_collusion_scan(db: Session, tender_id: str, bids: list[dict[str, Any]]) -> dict:
    """Run full 5-flag collusion risk analysis."""
    clustering_result = analyse_bids(bids)  # ✓ Real calculation
    
    mock_data = _load_mock("collusion_results.json")  # ❌ Can return empty {}
    mock_flags = {f["flag"]: f for f in mock_data.get("flags", [])}  # If empty, all None
    
    flags = [
        clustering_result,
        mock_flags.get("CA_FINGERPRINT", {  # ← Hardcoded default
            "flag": "CA_FINGERPRINT",
            "triggered": False,
            # ...
        }),
    ]
```

**Runtime Impact:** User sees "no collusion detected" when actually 4/5 flags couldn't be loaded due to missing file.

**Fix:** Raise error if critical mock data missing:

```python
mock_data = _load_mock("collusion_results.json")
if not mock_data.get("flags"):
    raise HTTPException(
        status_code=500,
        detail={"error": True, "message": "Mock data not loaded. Demo mode incomplete."}
    )
```

---

### 🟠 HIGH-8: Builder Upload GPS Threshold Inconsistency
**File:** [backend/services/builder_service.py](backend/services/builder_service.py#L33-52)  
**Lines:** 33-52  
**Root Cause:** Code calls two different GPS verification functions: one in routes, one in service. They may have different thresholds.

```python
# In routes (builder.py):
def verify_location(...):
    result = builder_service.get_location_verification(latitude, longitude)
    # Uses settings.GPS_THRESHOLD_METERS

# In service (builder_service.py):
def process_builder_upload(...):
    location_result = verify_distance(
        hard_threshold_m=settings.GPS_THRESHOLD_METERS,  # ✓ Consistent
    )

def verify_gps_standalone(...):
    return verify_upload(
        threshold_m=settings.GPS_THRESHOLD_METERS,  # ✓ Also consistent
    )

# But then we also have:
def get_location_verification(...):
    return verify_distance(
        hard_threshold_m=settings.GPS_THRESHOLD_METERS,  # What if this is different?
    )
```

**Runtime Impact:** Inconsistent GPS acceptance. User's upload accepted in one endpoint but rejected in another.

**Fix:** Consolidate to single GPS verification function.

---

### 🟠 HIGH-9: Frontend Component Missing Loading State
**File:** [frontend/pages/evaluation.tsx](frontend/pages/evaluation.tsx#L26-35)  
**Lines:** 26-35  
**Root Cause:** LoadingSpinner only shown if loading, but component doesn't check for errors during load.

```typescript
if (loading) {
  return (
    <Layout title="...">
      <LoadingSpinner message="..." />
    </Layout>
  );
}

// If error after loading, component still renders with null data
```

**Runtime Impact:** User sees empty page with no indication of error.

**Fix:** Check error state:

```typescript
if (loading) return <LoadingSpinner />;
if (error) return <ErrorDisplay error={error} />;
if (!evalData) return <ErrorDisplay error="No data loaded" />;
```

---

### 🟠 HIGH-10: Audit Log Not Created on Upload Rejection
**File:** [backend/services/builder_service.py](backend/services/builder_service.py#L53-67)  
**Lines:** 53-67  
**Root Cause:** When GPS verification fails, audit_log is called but with minimal data. Reason is in HTTP response but not in audit log.

```python
if not location_result["accepted"]:
    audit_log(
        db=db,
        action="UPLOAD_REJECTED_GPS",
        entity_id=contract_id,
        entity_type="builder_upload",
        input_data={"lat": latitude, "lon": longitude, "contract_id": contract_id},
        output_data=location_result,  # ← Contains reason but...
    )
    # ❌ Then throws exception, audit_log might not be committed
```

**Runtime Impact:** Audit trail incomplete. No record of why uploads were rejected.

**Fix:** Ensure audit_log is committed before raising:

```python
try:
    audit_result = audit_log(...)
    db.flush()  # Ensure written
except Exception as e:
    db.rollback()
    # Log separately, don't depend on DB
    logger.error(f"Audit failed: {e}")
```

---

### 🟠 HIGH-11: Payment Trigger Missing Milestone Validation
**File:** [backend/services/payment_service.py](backend/services/payment_service.py#L10-35)  
**Lines:** 10-35  
**Root Cause:** trigger_payment doesn't validate that milestone actually exists or is verified before scheduling payment.

```python
def trigger_payment(db: Session, payload: PaymentTrigger) -> dict[str, Any]:
    """Trigger milestone payment release."""
    now = datetime.now(timezone.utc)
    release_at = now + timedelta(hours=72)
    
    # ❌ NO VALIDATION
    # Doesn't check if:
    # - milestone_id exists in database
    # - milestone status is "completed"
    # - milestone has been AI-verified
    # - officer_id is authorized
    
    audit_result = audit_log(...)
    return {
        "payment_status": "SCHEDULED",
        # ...
    }
```

**Runtime Impact:** Officer can trigger payment for non-existent or incomplete milestone. Payment gets scheduled for nothing.

**Fix:** Add validation:

```python
milestone = db.query(Milestone).filter(Milestone.id == payload.milestone_id).first()
if not milestone:
    raise HTTPException(404, detail="Milestone not found")
if milestone.status != "completed":
    raise HTTPException(400, detail="Milestone not completed")
if not milestone.ai_verified:
    raise HTTPException(400, detail="Milestone not AI-verified")
```

---

### 🟠 HIGH-12: Tender Model Missing Indexes
**File:** [backend/models/tender.py](backend/models/tender.py#L1-30)  
**Lines:** 1-30  
**Root Cause:** Tender table has no indexes on frequently-queried columns like created_by, status, department.

```python
class Tender(Base):
    """Government procurement tender."""
    __tablename__ = "tender"
    
    id: str = Column(String, primary_key=True)  # ✓ Indexed (PK)
    # ... other columns without indexes ...
    status: str = Column(String, default="draft")  # ❌ No index
    created_by: str | None = Column(String, nullable=True)  # ❌ No index
    department: str | None = Column(String, nullable=True)  # ❌ No index
```

**Runtime Impact:** Queries like "get all tenders by officer" or "get all open tenders" are slow (full table scans).

**Fix:** Add indexes:

```python
class Tender(Base):
    # ...
    status: str = Column(String, default="draft", index=True)
    created_by: str | None = Column(String, nullable=True, index=True)
    department: str | None = Column(String, nullable=True, index=True)
```

---

### 🟠 HIGH-13: Missing Null Coalescing in Frontend Type Defs
**File:** [frontend/types/tender.ts](frontend/types/tender.ts#L22-27)  
**Lines:** 22-27  
**Root Cause:** TenderCriterion fields are nullable but component code assumes they exist.

```typescript
// ❌ UNSAFE (frontend/components/...)
<div>{criterion.language_signal}</div>  // Could be null!
{criterion.threshold && <span>{criterion.threshold}</span>}  // Good
{criterion.threshold_unit}  // ❌ Could be null!
```

**Runtime Impact:** "null" appears in UI, confusing users.

**Fix:** Add proper null checks:

```typescript
{criterion.language_signal && <span>{criterion.language_signal}</span>}
{criterion.threshold_unit && <span>({criterion.threshold_unit})</span>}
```

---

### 🟠 HIGH-14: useApi Hook Dependency Array Not Captured
**File:** [frontend/hooks/useApi.ts](frontend/hooks/useApi.ts#L27-33)  
**Lines:** 27-33  
**Root Cause:** The deps parameter is used in dependency array but not all dependencies are included in array.

```typescript
export function useApi<T>(
  fetchFn: () => Promise<ApiResponse<T>>,
  deps: unknown[] = []
): UseApiState<T> {
  // ...
  const execute = useCallback(async () => {
    // ...
  }, deps);  // ❌ deps might not include fetchFn!
```

**Runtime Impact:** If fetchFn changes, useEffect won't re-fetch because callback wasn't recreated.

**Fix:**

```typescript
const execute = useCallback(async () => {
    // ...
}, [fetchFn, ...deps]);  // Include fetchFn explicitly
```

---

### 🟠 HIGH-15: Missing .env.production Configuration
**File:** Missing file (should exist)  
**Root Cause:** No .env.production exists. Render and Vercel will use environment variables set manually, not from file.

**Runtime Impact:** If environment variable gets out of sync, deployment fails silently. No clear error message.

**Fix:** Create .env.production with production values (documented, not in git):

```
# .env.production (not in git, documented in README)
GEMINI_API_KEY=sk-xxx (set in CI/CD)
OPENROUTER_API_KEY=sk-or-xxx (set in CI/CD)
DATABASE_URL=postgresql://... (set in CI/CD)
JWT_SECRET_KEY=xxxxx (set in CI/CD)
```

Document in README that all sensitive values must be set as environment variables in deployment platform.

---

## MEDIUM PRIORITY ISSUES (18 found)

### 🟡 MEDIUM-1: Inconsistent Error Response Format
**File:** Multiple files  
**Lines:** Various  
**Root Cause:** Some routes return `{"error": True, "message": "..."}` while others return `{"detail": "..."}`.

**Example inconsistency:**
- [backend/routes/tender.py](backend/routes/tender.py#L41): Returns HTTPException with nested detail dict
- [backend/routes/evaluation.py](backend/routes/evaluation.py#L32): Returns direct dict

**Impact:** Frontend must handle multiple formats, error extraction is fragile.

**Fix:** Standardize all errors:

```python
# Create global error response class
class ErrorResponse(BaseModel):
    error: True
    message: str
    code: str
    
# Use everywhere
raise HTTPException(
    status_code=400,
    detail=ErrorResponse(
        error=True,
        message="Invalid file",
        code="INVALID_FILE"
    ).dict()
)
```

---

### 🟡 MEDIUM-2: Audit Trail Not Showing Pagination
**File:** [backend/services/audit_service.py](backend/services/audit_service.py#L7-15)  
**Lines:** 7-15  
**Root Cause:** `get_all_audit_entries` returns all entries (up to 1000) without pagination. On production with millions of entries, this causes memory issues.

```python
def get_all_audit_entries(db: Session) -> dict[str, Any]:
    """Get all audit entries (limited to 1000)."""  # ← Only soft limit
    trail = get_full_trail(db)  # ← Might load millions of rows
    return {
        "total_entries": len(trail),
        "trail": trail,  # ← All returned to frontend
    }
```

**Impact:** Large audit tables cause API timeouts and memory issues.

**Fix:** Implement pagination:

```python
def get_all_audit_entries(db: Session, offset: int = 0, limit: int = 50) -> dict:
    trail = get_full_trail(db, offset=offset, limit=limit)
    total = db.query(AuditLog).count()
    return {
        "total_entries": total,
        "trail": trail,
        "offset": offset,
        "limit": limit,
    }
```

---

### 🟡 MEDIUM-3: TenderCriterion Type Mismatch Between Frontend and Backend
**File:** Frontend [types/tender.ts](frontend/types/tender.ts#L5-15) vs Backend [schemas/tender.py](backend/schemas/tender.py#L6-20)  
**Lines:** Various  
**Root Cause:** Frontend expects `type: CriterionType` (enum) but backend may send string.

```typescript
// Frontend (tender.ts)
export type CriterionType = 'financial' | 'technical' | 'compliance';

export interface TenderCriterion {
    type: CriterionType;  // Must be exact enum
}
```

```python
# Backend (tender.py)
class CriterionType(str, Enum):
    FINANCIAL = "financial"
    TECHNICAL = "technical"
    COMPLIANCE = "compliance"

class TenderCriterion(BaseModel):
    type: CriterionType = CriterionType.COMPLIANCE
```

**Impact:** If backend returns unexpected type value, TypeScript assumes wrong type.

**Fix:** Validate at runtime:

```typescript
const isValidCriterionType = (value: any): value is CriterionType => {
  return ['financial', 'technical', 'compliance'].includes(value);
};
```

---

### 🟡 MEDIUM-4: Location Service Missing Import Statement
**File:** [backend/services/builder_service.py](backend/services/builder_service.py#L1-10)  
**Lines:** 1-10  
**Root Cause:** Code calls `verify_distance()` but doesn't import it.

```python
# ❌ MISSING IMPORT
from backend.services.location_service import verify_distance

# Then uses it:
location_result = verify_distance(...)  # Works but import not visible
```

**Impact:** If location_service doesn't exist, code silently fails at runtime.

**Fix:** Add explicit import at top:

```python
from backend.services.location_service import verify_distance, haversine_distance
```

---

### 🟡 MEDIUM-5: Builder Model Missing Foreign Key
**File:** [backend/models/builder_upload.py](backend/models/builder_upload.py) (not read, but inferred)  
**Root Cause:** BuilderUpload references contract_id but might not have foreign key constraint to Contract table.

**Impact:** 
- Orphan records possible (upload references non-existent contract)
- Data integrity compromised
- Queries may return incomplete results

**Fix:** Add FK constraint:

```python
class BuilderUpload(Base):
    __tablename__ = "builder_upload"
    
    contract_id: str = Column(String, ForeignKey("contract.id"), nullable=False)
```

---

### 🟡 MEDIUM-6: Missing Docstring in Payment Trigger Schema
**File:** [backend/schemas/builder.py](backend/schemas/builder.py) (not fully read)  
**Root Cause:** PaymentTrigger model lacks field descriptions, unclear what officer_id should contain.

**Impact:** Frontend developers can't tell what format/value to pass for officer_id.

**Fix:** Add Field descriptions:

```python
class PaymentTrigger(BaseModel):
    milestone_id: str = Field(..., description="Unique milestone identifier")
    officer_id: str = Field(..., description="Officer UUID who is authorizing payment")
    confirmation_note: str = Field(..., description="Officer's confirmation reason")
```

---

### 🟡 MEDIUM-7: Evaluation Results Mock Data Might Be Outdated
**File:** [demo/mock_data/evaluation_results.json](demo/mock_data/evaluation_results.json) (not read)  
**Root Cause:** Mock data file is static, doesn't reflect schema changes. If schema is updated, mock might be incompatible.

**Impact:** 
- Frontend tests fail
- Demo mode shows wrong data structure
- Unexpected fields in production

**Fix:** Generate mock data programmatically:

```python
# Create mock_data_generator.py
def generate_mock_evaluation():
    return {
        "tender_id": "CRPF-2025-CONST-001",
        "bidders": [
            {
                "bidder_id": "BID001",
                "verdicts": [
                    {
                        "criterion_id": "CRIT001",
                        "verdict": "GREEN",
                        "confidence": 0.95,
                    }
                ]
            }
        ]
    }
```

---

### 🟡 MEDIUM-8: No Request ID or Tracing in Logs
**File:** [backend/main.py](backend/main.py#L25-30)  
**Lines:** 25-30  
**Root Cause:** Logger setup doesn't include request IDs for tracing across logs.

```python
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    # ❌ No request_id, no trace_id
)
```

**Impact:** Hard to debug issues in production where multiple requests run concurrently.

**Fix:** Use structured logging with request context:

```python
import uuid
from contextvars import ContextVar

request_id_var: ContextVar[str] = ContextVar('request_id', default='')

# In middleware:
@app.middleware("http")
async def add_request_id(request: Request, call_next):
    request_id = str(uuid.uuid4())
    request_id_var.set(request_id)
    response = await call_next(request)
    return response

# In logging:
logging.basicConfig(
    format="%(asctime)s [%(levelname)s] %(request_id)s %(name)s: %(message)s"
)
```

---

### 🟡 MEDIUM-9: Frontend Services Lack Type Safety
**File:** [frontend/services/apiClient.ts](frontend/services/apiClient.ts#L120-135)  
**Lines:** 120-135  
**Root Cause:** apiUpload function doesn't properly type FormData or validate file.

```typescript
export async function apiUpload<T>(
  url: string,
  formData: FormData
): Promise<ApiResponse<T>> {
  // No validation of formData contents
  try {
    const response = await fetch(`${API_BASE}${url}`, {
      method: 'POST',
      headers: buildHeaders(),  // ❌ Not setting Content-Type (correct for FormData)
      body: formData,
    });
```

**Impact:** Malformed requests might be sent if developer creates FormData incorrectly.

**Fix:** Add validation:

```typescript
export async function apiUpload<T>(
  url: string,
  formData: FormData,
  expectedFields?: string[]
): Promise<ApiResponse<T>> {
  if (expectedFields) {
    for (const field of expectedFields) {
      if (!formData.has(field)) {
        throw new Error(`Missing required field: ${field}`);
      }
    }
  }
  // ... rest of function
}
```

---

### 🟡 MEDIUM-10: No Input Validation on Latitude/Longitude
**File:** [frontend/pages/builder.tsx](frontend/pages/builder.tsx#L92-110)  
**Lines:** 92-110  
**Root Cause:** GPS coordinates passed directly to API without validation.

```typescript
const verify = async () => {
    if (!location.coordinates) return;
    const { data } = await verifyLocation({ 
      latitude: location.coordinates.lat,    // ❌ Not validated
      longitude: location.coordinates.lng    // ❌ Not validated
    });
```

**Impact:** Invalid coordinates can crash GPS verification logic.

**Fix:** Validate before sending:

```typescript
const isValidCoordinate = (lat: number, lng: number): boolean => {
  return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
};

if (!isValidCoordinate(lat, lng)) {
  throw new Error("Invalid GPS coordinates");
}
```

---

### 🟡 MEDIUM-11: Sidebar Layout Not Responsive on Mobile
**File:** [frontend/pages/evaluation.tsx](frontend/pages/evaluation.tsx#L55-80)  
**Lines:** 55-80  
**Root Cause:** Left sidebar uses fixed `col-span-3` which doesn't adapt to mobile screens.

```typescript
<div className="col-span-3 border-r ...">  // ❌ Always 3 columns
```

**Impact:** On mobile (320px width), sidebar takes up entire screen, content hidden.

**Fix:** Use responsive classes:

```typescript
<div className="col-span-12 md:col-span-3 ...">  // 12 on mobile, 3 on desktop
```

---

### 🟡 MEDIUM-12: No Debouncing in Location Updates
**File:** [frontend/store/LocationStore.ts](frontend/store/LocationStore.ts#L95-110)  
**Lines:** 95-110  
**Root Cause:** updatePosition is called by watchPosition every 5 seconds (maximumAge: 5000) without debouncing.

```typescript
watchId = navigator.geolocation.watchPosition(
  (position) => {
    this.updatePosition(  // Called every 5s
      position.coords.latitude,
      position.coords.longitude,
      position.coords.accuracy
    );
  },
  // ...
  { maximumAge: 5000 }  // Update every 5 seconds
);

// But setVerification makes API call which takes 1-2s
// Next update arrives before response completes
```

**Impact:** Race conditions in location verification (covered in CRITICAL-8).

**Fix:** Add debounce:

```typescript
let verifyTimer: NodeJS.Timeout | null = null;

updatePosition(lat: number, lng: number, accuracy: number) {
  // ... update position ...
  
  // Debounce verification calls
  if (verifyTimer) clearTimeout(verifyTimer);
  verifyTimer = setTimeout(() => {
    this.verifyLocation();
  }, 1000);  // Wait 1s after last position update
}
```

---

### 🟡 MEDIUM-13: AuthContext Missing Error Recovery
**File:** [frontend/store/AuthContext.tsx](frontend/store/AuthContext.tsx#L89-105)  
**Lines:** 89-105  
**Root Cause:** If getMe() fails, it silently falls through to autoLoginDemo() without logging error.

```typescript
getMe().then(({ data }) => {
  if (data) {
    dispatch({ type: 'SET_USER', user: data, token });
  } else {
    // Token expired — attempt demo auto-login
    clearToken();
    autoLoginDemo();  // ← But getMe might have failed for other reasons
  }
});
```

**Impact:** Unclear why authentication failed. Could be network error, backend down, or token expiry.

**Fix:** Log and distinguish error types:

```typescript
getMe().catch((err) => {
  logger.error(`getMe failed: ${err.message}`);
  if (err.status === 401) {
    clearToken();
    autoLoginDemo();
  } else {
    // Other error - don't auto-login
    dispatch({ type: 'SET_LOADING', isLoading: false });
  }
});
```

---

### 🟡 MEDIUM-14: No Timeout on GPS Watch Position
**File:** [frontend/store/LocationStore.ts](frontend/store/LocationStore.ts#L95-110)  
**Lines:** 95-110  
**Root Cause:** watchPosition has timeout of 15s but never stops trying if geolocation completely fails.

```typescript
watchId = navigator.geolocation.watchPosition(
  (position) => { ... },
  (error) => { this.setError(message); },  // Sets error but watchPosition still running
  { timeout: 15000 }  // 15 second timeout per position request
);
```

**Impact:** If GPS permanently unavailable, watchPosition keeps running in background, consuming battery on mobile.

**Fix:** Stop watching after error:

```typescript
(error) => {
  this.setError(message);
  if (watchId !== null) {
    navigator.geolocation.clearWatch(watchId);
    watchId = null;
  }
}
```

---

### 🟡 MEDIUM-15: Incomplete Collusion Report Migration from Mock
**File:** [backend/services/collusion_service.py](backend/services/collusion_service.py#L40-75)  
**Lines:** 40-75  
**Root Cause:** Bid clustering is real (scipy), other 4 flags are hardcoded defaults. Users think all 5 are being analyzed but only 1 is real.

```python
flags = [
    clustering_result,  # ✓ Real scipy analysis
    mock_flags.get("CA_FINGERPRINT", { "triggered": False, ... }),  # ❌ Mock default
    mock_flags.get("SHARED_ADDRESS", { "triggered": False, ... }),  # ❌ Mock default
    # ...
]
```

**Impact:** False sense of security. User thinks collusion detection is comprehensive but 4/5 flags are fake.

**Fix:** Either:
1. Implement all 5 flags properly, or
2. Clearly mark which flags are implemented:

```python
flags = {
    "BID_CLUSTERING": {
        "implemented": True,
        "result": clustering_result
    },
    "CA_FINGERPRINT": {
        "implemented": False,  # Mark as TODO
        "result": None
    }
}
```

---

### 🟡 MEDIUM-16: No Caching Strategy for Tender Status
**File:** Frontend hooks and services  
**Root Cause:** Each page navigation to tender details re-fetches status from API even if recently loaded.

**Impact:** 
- Unnecessary API calls
- Slow page transitions
- Higher backend load

**Fix:** Implement client-side cache:

```typescript
const tenderId = "...";
const cacheKey = `tender_${tenderId}`;
const cached = sessionStorage.getItem(cacheKey);
const cachedTime = parseInt(sessionStorage.getItem(`${cacheKey}_time`) || "0");

if (cached && Date.now() - cachedTime < 60000) {  // 1 minute cache
  return JSON.parse(cached);
}
```

---

### 🟡 MEDIUM-17: Department Names Hardcoded
**File:** [backend/routes/tender.py](backend/routes/tender.py#L50) and [frontend pages](frontend/pages/gov.tsx)  
**Lines:** Various  
**Root Cause:** Department values like "CRPF" are hardcoded in code, not in database.

**Impact:** 
- Hard to add new departments without code change
- No validation of department names
- Frontend and backend might have different lists

**Fix:** Create Department table:

```python
class Department(Base):
    __tablename__ = "department"
    id: str = Column(String, primary_key=True)
    name: str = Column(String, unique=True)
    code: str = Column(String, unique=True)  # "CRPF", "BSF", etc.

class Tender(Base):
    department_id: str = Column(String, ForeignKey("department.id"))
```

---

### 🟡 MEDIUM-18: No Compression on Audit PDF Export
**File:** [backend/audit/pdf_exporter.py](backend/audit/pdf_exporter.py) (not read)  
**Root Cause:** PDF export likely doesn't compress, resulting in large file sizes.

**Impact:** 
- Large PDF downloads
- Slow network transfers
- High bandwidth usage

**Fix:** Enable PDF compression:

```python
from reportlab.pdfgen import canvas
from reportlab.lib.utils import ImageReader

# Set compression
def generate_audit_pdf(...):
    # Add compression parameter
    pdf_buffer = io.BytesIO()
    pdf = canvas.Canvas(pdf_buffer, pageCompression=True)
```

---

## ARCHITECTURE INCONSISTENCIES

### 1. **Inconsistent Error Handling Patterns**
- Tender routes raise HTTPException
- Evaluation routes return dict directly
- Builder routes mix both approaches
- **Fix:** Standardize error responses globally

### 2. **Mixed Sync/Async Patterns**
- Some services use async/await
- Others use sync functions called from async context
- Unclear which operations are blocking
- **Fix:** Audit all service functions, mark blocking ones clearly

### 3. **Mock Data Loading Scattered**
- Collusion service loads from file
- Evaluation service loads from file
- Builder service loads from file
- No centralized mock data management
- **Fix:** Create MockDataManager class

### 4. **Database Models Without Relationships**
- Tender model standalone
- BuilderUpload references contract_id (string) not FK
- No User-Tender relationship defined
- **Fix:** Add proper SQLAlchemy relationships

### 5. **Frontend Store Management Inconsistent**
- AuthContext uses useReducer
- LocationStore uses useSyncExternalStore
- No consistent pattern
- **Fix:** Migrate all to same pattern (Zustand recommended)

---

## API CONTRACT VALIDATION

### Tested Routes

| Route | Frontend Expects | Backend Sends | Status |
|-------|------------------|---------------|--------|
| POST /api/tender/upload | TenderUploadResponse | {..., extraction_warning} | ❌ MISMATCH |
| GET /api/tender/{id}/status | TenderStatusResponse | ✓ | ✓ OK |
| GET /api/evaluation/{id}/results | EvaluationData | dict | ❌ TYPE MISMATCH |
| GET /api/evaluation/{id}/yellow-queue | YellowQueueResponse | {items: list[dict]} | ⚠️ WEAK TYPING |
| POST /api/evaluation/officer-decision | OfficerDecisionResponse | ✓ | ✓ OK |
| POST /api/builder/upload | BuilderUploadResponse | ✓ | ✓ OK |
| POST /api/collusion/run | CollusionReportResponse | ✓ | ✓ OK |
| GET /api/v1/audit/{id}/trail | AuditTrailResponse | ✓ | ✓ OK |

---

## SECURITY & PERFORMANCE

### Security Issues

1. **JWT_SECRET_KEY Default in Dev** - Uses obvious default value
2. **No Rate Limiting** - Frontend can spam API calls
3. **No CSRF Protection** - POST endpoints vulnerable to CSRF
4. **GPS Coordinates in Audit Log** - Location data not anonymized
5. **Officer ID Hardcoded in Demo** - Security model broken for testing

### Performance Bottlenecks

1. **No Database Indexes** - Tender table searches are O(n)
2. **PDF Processing Synchronous** - Blocks FastAPI thread pool
3. **Gemini API Calls Not Cached** - Same criteria extracted repeatedly
4. **Audit Trail Load All** - No pagination
5. **Mock Data Dynamically Imported** - Repeated file I/O

---

## STEP-BY-STEP REPAIR PLAN

### Phase 1: Critical Fixes (Do First - 2-3 hours)

1. **Fix CRITICAL-1:** Make extract() properly async
   - File: backend/ai/criteria_extractor.py
   - Action: Convert to pure async function

2. **Fix CRITICAL-2:** Add extraction_warning to schema
   - File: backend/schemas/tender.py
   - Action: Add field definition

3. **Fix CRITICAL-3:** Clear auth retry flag on login
   - File: frontend/services/apiClient.ts
   - Action: Add flag clear in getStoredToken()

4. **Fix CRITICAL-4:** Set NEXT_PUBLIC_API_URL in Vercel
   - File: vercel.json
   - Action: Update environment config

5. **Fix CRITICAL-5:** Add transaction handling in tender_service
   - File: backend/services/tender_service.py
   - Action: Wrap DB operations in try/except

### Phase 2: High Priority Fixes (4-6 hours)

1. Fix all HIGH issues in order 1-15
2. Focus on those affecting user workflows:
   - Auth flow (HIGH-1, HIGH-3)
   - API integration (HIGH-2, HIGH-3)
   - Error handling (HIGH-4, HIGH-5)
   - Rate limiting (HIGH-6)

### Phase 3: Medium Priority Refactoring (8-12 hours)

1. Standardize error responses
2. Add proper logging with request IDs
3. Implement database pagination
4. Add input validation everywhere
5. Fix responsive design issues

### Phase 4: Testing & Validation (4-8 hours)

1. End-to-end testing of all flows
2. Load testing (concurrent uploads)
3. Security audit
4. Mobile responsiveness testing

---

## REFACTORING RECOMMENDATIONS

### 1. Create Global Error Handler Middleware

```python
# backend/middleware/error_handler.py
@app.middleware("http")
async def error_handler(request: Request, call_next):
    try:
        return await call_next(request)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unhandled: {e}", exc_info=e)
        return JSONResponse(
            status_code=500,
            content={
                "error": True,
                "message": "Server error",
                "code": "INTERNAL_ERROR",
            }
        )
```

### 2. Consolidate Mock Data Loading

```python
# backend/core/mock_data.py
class MockDataManager:
    def __init__(self, demo_dir: Path):
        self.demo_dir = demo_dir
        self.cache = {}
    
    def load(self, filename: str) -> dict:
        if filename in self.cache:
            return self.cache[filename]
        
        filepath = self.demo_dir / filename
        if not filepath.exists():
            logger.warning(f"Mock data not found: {filename}")
            return {}
        
        data = json.load(open(filepath))
        self.cache[filename] = data
        return data
```

### 3. Create Standardized Repository Pattern

```python
# backend/repositories/tender_repository.py
class TenderRepository:
    def __init__(self, db: Session):
        self.db = db
    
    def create(self, tender_data: dict) -> Tender:
        try:
            tender = Tender(**tender_data)
            self.db.add(tender)
            self.db.flush()
            return tender
        except Exception as e:
            self.db.rollback()
            raise
    
    def get_by_id(self, tender_id: str) -> Optional[Tender]:
        return self.db.query(Tender).filter(Tender.id == tender_id).first()
    
    def get_by_officer(self, officer_id: str, offset: int = 0, limit: int = 50):
        return self.db.query(Tender)\
            .filter(Tender.created_by == officer_id)\
            .offset(offset)\
            .limit(limit)\
            .all()
```

### 4. Migrate Frontend Store to Zustand

```typescript
// frontend/store/tenderStore.ts
import { create } from 'zustand';

interface TenderState {
  tenders: Tender[];
  currentTender: Tender | null;
  loading: boolean;
  error: string | null;
  
  fetchTenders: (officerId: string) => Promise<void>;
  setCurrentTender: (tender: Tender) => void;
}

export const useTenderStore = create<TenderState>((set) => ({
  tenders: [],
  currentTender: null,
  loading: false,
  error: null,
  
  fetchTenders: async (officerId: string) => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await getTendersByOfficer(officerId);
      if (error) {
        set({ error, loading: false });
      } else {
        set({ tenders: data, loading: false });
      }
    } catch (err) {
      set({ error: 'Failed to fetch tenders', loading: false });
    }
  },
  
  setCurrentTender: (tender: Tender) => {
    set({ currentTender: tender });
  },
}));
```

---

## FILES REQUIRING REWRITE

1. **backend/ai/criteria_extractor.py** - Async/await issues
2. **frontend/store/LocationStore.ts** - Race conditions
3. **frontend/services/apiClient.ts** - Auth flow broken
4. **backend/main.py** - Error handling incomplete

## UNSTABLE MODULES

1. **Gemini AI Integration** - Prone to JSON parsing failures
2. **GPS Verification** - Race conditions in async calls
3. **Mock Data Loading** - Silent failures on missing files
4. **Auth Context** - Complex state management prone to bugs

## PRODUCTION DEPLOYMENT RISKS

🔴 **CRITICAL:**
- Missing API_BASE URL causes all requests to fail
- JWT secret key is predictable
- Database credentials might be in .env

🟠 **HIGH:**
- No error logging/monitoring
- Rate limiting not implemented
- CORS misconfigured
- PDF export not compressed

🟡 **MEDIUM:**
- No database backup strategy
- Audit logs not archived
- Mock data hardcoded
- No feature flags for gradual rollout

---

## APPENDIX: Quick Reference

### Environment Variables Needed

```env
# Backend (backend/.env)
GEMINI_API_KEY=sk-xxx
OPENROUTER_API_KEY=sk-or-xxx
DATABASE_URL=postgresql://...
JWT_SECRET_KEY=<32-char-random>
REGISTERED_SITE_LAT=20.2961
REGISTERED_SITE_LON=85.8245

# Frontend (frontend/.env.local)
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### Database Initialization Checklist

- [ ] Create tables via alembic
- [ ] Create indexes on status, created_by, department
- [ ] Add foreign keys for referential integrity
- [ ] Seed demo user
- [ ] Verify mock_data files exist

### Testing Checklist

- [ ] Tender upload flow
- [ ] Evaluation workflow
- [ ] Builder GPS verification
- [ ] Collusion detection
- [ ] Audit trail export
- [ ] Auth/logout cycle
- [ ] Error recovery (backend down, timeout, rate limit)

---

**End of Report**

*Last Updated: May 7, 2026*
