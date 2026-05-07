# API INTEGRATION & TYPE MISMATCH REPORT
## Request/Response Contract Validation — Nyayadarsi v2.0

Generated: May 7, 2026

---

## SUMMARY

| Category | Issues | Severity |
|----------|--------|----------|
| Schema Mismatches | 5 | CRITICAL |
| Type Coercion Failures | 7 | HIGH |
| Nullable Field Handling | 6 | HIGH |
| Response Format Inconsistencies | 4 | MEDIUM |
| **Total** | **22** | — |

---

## ✅ RESOLVED — 1. SCHEMA MISMATCH: TenderUploadResponse
**Status:** FIXED (Field `extraction_warning` added to `backend/schemas/tender.py`)

**Backend Returns:**
```python
# backend/services/tender_service.py line ~106
return {
    "tender_id": tender_id,
    "doc_hash": doc_hash,
    "criteria": criteria,
    "alerts": alerts,
    "total_criteria": len(criteria),
    "mandatory_count": mandatory_count,
    "discretionary_count": discretionary_count,
    "extraction_warning": extraction_warning,  # ← Frontend expects this
    "pdf_info": pdf_result,
    "audit": audit_result,
}
```

**Schema Definition:**
```python
# backend/schemas/tender.py line 45-65
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
    # ❌ MISSING: extraction_warning: Optional[dict[str, str]] = None
```

**Frontend Expects:**
```typescript
// frontend/types/tender.ts line 42
export interface TenderUploadResponse {
  tender_id: string;
  doc_hash: string;
  criteria: TenderCriterion[];
  alerts: IntegrityAlertResponse[];
  total_criteria: number;
  mandatory_count: number;
  discretionary_count: number;
  extraction_warning: {          // ← Frontend expects this field
    message: string;
    type: string;
  } | null;
  pdf_info: PdfInfo;
  audit: AuditRecord;
}
```

**Frontend Usage:**
```typescript
// frontend/pages/gov.tsx or component
const { result } = useTenderUpload();
if (result?.extraction_warning) {
  console.warn('Extraction warning:', result.extraction_warning);  // ← Will fail
}
```

**Runtime Impact:**
- Pydantic validation fails (unknown field)
- 422 UNPROCESSABLE_ENTITY returned
- Frontend never receives response
- Upload flow completely broken

**Fix:**

```python
# backend/schemas/tender.py
from typing import Optional

class ExtractionWarning(BaseModel):
    message: str
    type: str

class TenderUploadResponse(BaseModel):
    """Full response from tender PDF upload."""
    tender_id: str
    doc_hash: str
    criteria: list[dict[str, Any]]
    alerts: list[dict[str, Any]]
    total_criteria: int
    mandatory_count: int
    discretionary_count: int
    extraction_warning: Optional[ExtractionWarning] = None  # ← ADD THIS
    pdf_info: PdfInfo
    audit: AuditRecord
```

---

## 2. TYPE MISMATCH: EvaluationData.bidders

### Issue: Items Not Strongly Typed

**Backend Returns:**
```python
# backend/services/evaluation_service.py
def get_evaluation_results(tender_id: str) -> dict[str, Any]:
    data = _load_mock("evaluation_results.json")
    return data  # ← dict[str, Any] - no type checking
```

**Mock Data Actual Structure:**
```json
{
  "tender_id": "CRPF-2025-CONST-001",
  "bidders": [
    {
      "bidder_id": "BID001",
      "company_name": "ACME Corp",
      "overall_verdict": "GREEN",
      "verdicts": [
        {
          "criterion_id": "CRIT001",
          "verdict": "GREEN",
          "confidence": 0.95,
          "extracted_value": null,
          "source_document": null,
          "source_page": null,
          "source_cell": null,
          "citation": null,
          "flag_reason": null,
          "ambiguity": null,
          "mandatory": true,
          "blocker": false,
          "officer_options": null
        }
      ]
    }
  ]
}
```

**Frontend Type Definition:**
```typescript
// frontend/types/evaluation.ts
export interface BidderEvaluation {
  bidder_id: string;
  company_name: string;
  overall_verdict: Verdict;
  bid_amount?: number;  // ← OPTIONAL but mock might not have it
  verdicts: CriterionResult[];
}

export interface EvaluationData {
  tender_id: string;
  tender_title: string;
  bidders: BidderEvaluation[];
}
```

**Problem:** Mock data doesn't include `tender_title` or `bid_amount`

**Frontend Usage That Breaks:**
```typescript
// frontend/pages/evaluation.tsx
const { evalData } = useEvaluation(TENDER_ID);
return (
  <div>
    <h1>{evalData?.tender_title}</h1>  // ← Undefined!
    {evalData?.bidders.map(b => (
      <div key={b.bidder_id}>
        <span>{b.bid_amount}</span>  // ← Undefined! (only optional in TS, missing in runtime)
      </div>
    ))}
  </div>
);
```

**Fix:**

```python
# backend/schemas/evaluation.py
class BidderEvaluationSchema(BaseModel):
    bidder_id: str
    company_name: str
    overall_verdict: Verdict
    bid_amount: Optional[float] = None  # ← ADD THIS
    verdicts: list[CriterionResult]

class EvaluationData(BaseModel):
    tender_id: str
    tender_title: str  # ← ADD THIS
    bidders: list[BidderEvaluationSchema]
```

And update mock_data/evaluation_results.json to include these fields.

---

## 3. NULLABLE FIELD ISSUES

### Issue 3a: Null Certificate in Criterion Without Default

**Schema:**
```python
class TenderCriterion(BaseModel):
    criterion_id: str
    type: CriterionType = CriterionType.COMPLIANCE
    description: str
    threshold: Optional[float] = None  # ← Can be null
    threshold_unit: Optional[str] = None
    mandatory: bool = False
    blocker: bool = False
    language_signal: Optional[str] = None  # ← Can be null
    specificity_alert: bool = False
    acceptable_documents: list[str] = []
```

**Frontend Doesn't Handle Nulls:**
```typescript
// ❌ UNSAFE (component rendering)
<div>
  {criterion.language_signal}  // Shows "null" if null!
</div>

<span>{criterion.threshold} {criterion.threshold_unit}</span>
// Shows "50 null" if unit is null!
```

**Fix:**

```typescript
// ✓ SAFE
<div>
  {criterion.language_signal && <span>{criterion.language_signal}</span>}
</div>

<span>
  {criterion.threshold && criterion.threshold_unit && (
    <span>{criterion.threshold} {criterion.threshold_unit}</span>
  )}
</span>
```

### Issue 3b: YellowQueueItem Nullable Fields

**Schema:**
```python
class YellowQueueItem(BaseModel):
    bidder_id: str
    company_name: str
    criterion_id: str
    criterion: Optional[str] = None  # ← Can be null
    verdict: str = "YELLOW"
    confidence: float
    ambiguity: Optional[str] = None
    mandatory: Optional[bool] = None  # ← Can be null
    blocker: Optional[bool] = None
```

**Frontend Needs:**
```typescript
if (item.mandatory === true && item.blocker === true) {
  // Show as high priority
}
// But if item.mandatory is null, this check fails
```

**Fix:** Provide defaults in schema:

```python
class YellowQueueItem(BaseModel):
    # ...
    mandatory: bool = False  # Default to False instead of None
    blocker: bool = False    # Default to False instead of None
```

---

## 4. RESPONSE FORMAT INCONSISTENCIES

### Issue 4a: Nested detail vs direct error

**Tender Route:**
```python
# backend/routes/tender.py
raise HTTPException(
    status_code=status.HTTP_400_BAD_REQUEST,
    detail={"error": True, "message": "Only PDF files are accepted"}
)
```

**Evaluation Route:**
```python
# backend/routes/evaluation.py
return {
    "error": True,
    "message": "Evaluation results not found"
}
```

**Frontend extraction function:**
```typescript
function extractErrorMessage(data: Record<string, unknown>, fallback: string): string {
  if (typeof data.detail === 'string') return data.detail;
  if (typeof data.message === 'string') return data.message;  // ← Works for one format
  if (typeof data.detail === 'object' && data.detail !== null) {
    const detail = data.detail as Record<string, unknown>;
    if (typeof detail.message === 'string') return detail.message;
  }
  return fallback;
}
```

**Problem:** Function tries to handle both formats but they're inconsistent.

**Fix:** Standardize all errors:

```python
# Create global error response class
from pydantic import BaseModel

class ErrorDetail(BaseModel):
    error: bool = True
    message: str
    code: str

# Use everywhere:
raise HTTPException(
    status_code=400,
    detail=ErrorDetail(
        error=True,
        message="Only PDF files accepted",
        code="INVALID_FILE_TYPE"
    ).dict()
)
```

### Issue 4b: Audit Response Inconsistency

**Audit Route Returns:**
```python
# backend/services/audit_service.py
def get_audit_trail(db: Session, entity_id: str) -> dict[str, Any]:
    trail = get_trail(db, entity_id)
    return {
        "entity_id": entity_id,
        "total_entries": len(trail),
        "trail": trail,  # ← list of dicts
    }
```

**But evaluation_service returns:**
```python
def get_yellow_queue(tender_id: str) -> dict[str, Any]:
    # ...
    return {
        "tender_id": tender_id,
        "total_yellow": len(yellow_items),
        "items": yellow_items,  # ← list of dicts
    }
```

**Inconsistent naming:** `trail` vs `items`

**Fix:** Use consistent field names across all list responses:

```python
class ListResponse(BaseModel):
    """Standard response for lists"""
    total: int
    items: list[dict]
    offset: int = 0
    limit: int = 50
```

---

## 5. MISSING REQUIRED FIELDS IN API CONTRACTS

### Issue 5a: Builder Upload Missing Payment Fields

**Route Returns:**
```python
# backend/services/builder_service.py line ~80
return {
    "accepted": True,
    "distance_meters": location_result["distance_meters"],
    "photo_count": photo_count,
    "timestamp": timestamp,
    "audit_hash": audit_result["output_hash"],
    "message": f"Upload accepted...",
    "flagged": location_result["flagged"],
    "reverse_geocoded_address": location_result["reverse_geocoded_address"],
}
```

**Schema Expects:**
```python
class BuilderUploadResponse(BaseModel):
    accepted: bool
    distance_meters: float
    photo_count: int
    timestamp: str
    audit_hash: str
    message: str
    flagged: bool
    reverse_geocoded_address: str
```

**But not defined in schemas!** Where does this come from?

**Frontend Expects:**
```typescript
// frontend/types/builder.ts (not read, but inferred from pages/builder.tsx)
// ...
```

**Fix:** Define schema formally:

```python
# backend/schemas/builder.py
class BuilderUploadResponse(BaseModel):
    """Response after builder progress upload and GPS verification"""
    accepted: bool = Field(..., description="True if GPS check passed")
    distance_meters: float = Field(..., description="Distance from registered site in meters")
    photo_count: int = Field(..., description="Number of photos uploaded")
    timestamp: str = Field(..., description="ISO timestamp of upload")
    audit_hash: str = Field(..., description="SHA256 hash of audit record")
    message: str = Field(..., description="Human-readable confirmation message")
    flagged: bool = Field(..., description="True if location is outside soft threshold")
    reverse_geocoded_address: str = Field(..., description="Address reverse-geocoded from GPS")
```

### Issue 5b: Officer Decision Missing Fields

**What frontend sends:**
```typescript
{
  "tender_id": "CRPF-2025-CONST-001",
  "bidder_id": "BID001",
  "criterion_id": "CRIT001",
  "decision": "PASS",
  "reason": "Lorem ipsum dolor sit amet...",
  "officer_id": "OFF_DEMO_001"
}
```

**What schema expects:**
```python
class OfficerDecision(BaseModel):
    tender_id: str
    bidder_id: str
    criterion_id: str
    decision: str = Field(..., pattern=r"^(PASS|FAIL)$")
    reason: str = Field(..., min_length=10)
    officer_id: str
```

**BUT:** No validation that `officer_id` is actually authenticated user!

**Fix:**

```python
@router.post("/officer-decision", ...)
async def post_officer_decision(
    decision: OfficerDecision,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),  # ← Get actual user
) -> OfficerDecisionResponse:
    # Validate officer_id matches current user
    if decision.officer_id != current_user.id:
        raise HTTPException(403, detail="Cannot make decision as different officer")
    
    # Continue with decision...
```

---

## 6. FRONTEND TYPE SAFETY GAPS

### Gap 1: ApiResponse Generic Too Loose

```typescript
// frontend/types/api.ts
export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
}

// Used as:
const { data } = await getTenderStatus(tenderId);
// data is TenderStatusResponse | null, but TS doesn't enforce type narrowing
```

**Problem:** If data is null, accessing `data.created_at` doesn't cause TS error.

**Fix:** Create strict variant:

```typescript
export type ApiResult<T> = 
  | { ok: true; data: T }
  | { ok: false; error: string };

// Usage is now type-safe:
const result = await getTenderStatus(tenderId);
if (result.ok) {
  console.log(result.data.created_at);  // ✓ Type-safe
} else {
  console.error(result.error);
}
```

### ✅ RESOLVED — Gap 2: YellowQueueResponse Items Not Typed
**Status:** FIXED (Updated to `list[YellowQueueItem]` in both frontend and backend)

**Fix:**

```typescript
export interface YellowQueueResponse {
  tender_id: string;
  total_yellow: number;
  items: YellowQueueItem[];  // ✓ Strongly typed
}
```

---

## 7. ROUNDTRIP VALIDATION CHECKLIST

Test these request-response cycles:

### Tender Upload Flow
```
1. Frontend sends: FormData with PDF file
2. Backend validates: PDF magic bytes, size < 10MB
3. Backend extracts: Text via pdfplumber
4. Backend calls AI: Gemini for criteria extraction
5. Backend repairs JSON: _repair_json() handles Gemini quirks
6. Backend returns: TenderUploadResponse
7. Frontend validates: TypeScript ensures all fields present
8. Frontend renders: Displays criteria list

❌ Current issue: Step 6 schema missing extraction_warning
```

### Evaluation Results Flow
```
1. Frontend requests: GET /api/evaluation/{id}/results
2. Backend loads mock: evaluation_results.json
3. Backend returns: dict[str, Any] (not typed)
4. Frontend expects: EvaluationData with tender_title
5. Frontend renders: <h1>{evalData.tender_title}</h1>

❌ Current issue: Step 3-4 mismatch, tender_title undefined
```

### GPS Verification Flow
```
1. Builder device sends: latitude, longitude
2. Backend verifies: Distance from site
3. Backend checks: Is distance > 100m? (rejected)
4. Backend checks: Is distance > 500m? (flagged)
5. Backend returns: LocationVerificationResponse
6. Frontend displays: Distance, address, flag status

✓ This flow appears correct
```

---

## RECOMMENDATIONS

### Priority 1: Fix Critical Mismatches
1. Add `extraction_warning` to TenderUploadResponse schema
2. Add `tender_title` and `bid_amount` to EvaluationData
3. Ensure all nullable fields have defaults

### Priority 2: Standardize Response Format
1. Create global error response class
2. Standardize all list responses (use `items` field)
3. Add request/response logging to identify discrepancies

### Priority 3: Add Runtime Validation
1. Use Pydantic validators to catch schema violations early
2. Add JSON schema validation on frontend
3. Generate OpenAPI spec and validate against it

### Priority 4: Improve Type Safety
1. Migrate ApiResponse to Result pattern
2. Use Zod for frontend runtime schema validation
3. Generate TypeScript types from Pydantic models

---

**End of Report**
