"""
Integrity Alert Engine for Nyayadarsi
Detects narrowly engineered tender criteria that may favour specific vendors.
Rule-based checks: brand/model names, narrow year ranges, extreme thresholds.
"""
import re

# Category baselines — median thresholds from similar government tenders
CATEGORY_BASELINES = {
    "construction": {
        "annual_turnover": 50_000_000,      # Rs 5 Cr
        "net_worth": 10_000_000,             # Rs 1 Cr
        "similar_projects": 3,
        "experience_years": 5,
    },
    "services": {
        "annual_turnover": 20_000_000,       # Rs 2 Cr
        "net_worth": 5_000_000,              # Rs 50 L
        "similar_projects": 5,
        "experience_years": 3,
    },
    "supplies": {
        "annual_turnover": 10_000_000,       # Rs 1 Cr
        "net_worth": 2_000_000,              # Rs 20 L
        "similar_projects": 2,
        "experience_years": 2,
    },
}

# Known brand/model patterns that trigger specificity alert
BRAND_PATTERNS = [
    r'\b(?:Caterpillar|JCB|Komatsu|Volvo|Hitachi|L&T|Liebherr)\b',
    r'\b(?:Model\s*No\.?\s*[A-Z0-9\-]+)',
    r'\b(?:Part\s*No\.?\s*[A-Z0-9\-]+)',
    r'\b(?:Make:\s*\w+)',
]


def _check_brand_specificity(description: str) -> dict:
    """Check if criterion mentions specific brands or model numbers."""
    for pattern in BRAND_PATTERNS:
        match = re.search(pattern, description, re.IGNORECASE)
        if match:
            return {
                "triggered": True,
                "reason": f"Criterion references specific brand/model: '{match.group()}'. This may restrict competition to a single vendor.",
                "match": match.group(),
            }
    return {"triggered": False}


def _check_narrow_year_range(description: str) -> dict:
    """Check if criterion specifies year range narrower than 5 years."""
    # Match patterns like "between 2019 and 2022", "from 2020 to 2023", "during 2021-2023"
    year_range_patterns = [
        r'(?:between|from|during)\s+(\d{4})\s+(?:and|to|\-)\s+(\d{4})',
        r'(\d{4})\s*[-–]\s*(\d{4})',
        r'(?:in|during)\s+(?:the\s+)?(?:year|FY|financial\s+year)\s+(\d{4})',
    ]

    for pattern in year_range_patterns:
        match = re.search(pattern, description, re.IGNORECASE)
        if match:
            groups = match.groups()
            if len(groups) == 2:
                start, end = int(groups[0]), int(groups[1])
                span = end - start
                if span < 5:
                    return {
                        "triggered": True,
                        "reason": f"Year range {start}-{end} spans only {span} years. Ranges under 5 years significantly restrict the vendor pool.",
                        "year_span": span,
                    }
    return {"triggered": False}


def _check_threshold_extremity(criterion: dict, category: str = "construction") -> dict:
    """Check if threshold is significantly above category baseline."""
    baseline = CATEGORY_BASELINES.get(category, CATEGORY_BASELINES["construction"])
    threshold = criterion.get("threshold")

    if threshold is None:
        return {"triggered": False}

    criterion_type = criterion.get("type", "")
    description_lower = criterion.get("description", "").lower()

    # Match criterion to baseline category
    baseline_value = None
    if "turnover" in description_lower or criterion_type == "financial":
        baseline_value = baseline.get("annual_turnover")
    elif "net worth" in description_lower:
        baseline_value = baseline.get("net_worth")
    elif "project" in description_lower or "experience" in description_lower:
        if "year" in description_lower:
            baseline_value = baseline.get("experience_years")
        else:
            baseline_value = baseline.get("similar_projects")

    if baseline_value and threshold > baseline_value * 3:
        multiplier = threshold / baseline_value
        return {
            "triggered": True,
            "reason": f"Threshold ({threshold:,.0f}) is {multiplier:.1f}x the category baseline ({baseline_value:,.0f}). This level of requirement may restrict eligible vendors to fewer than 3.",
            "multiplier": multiplier,
        }

    return {"triggered": False}


def check(criterion: dict, category: str = "construction") -> dict:
    """
    Run all integrity checks on a single criterion.
    Returns alert object with flag, reason, and estimated qualifying vendors.
    """
    description = criterion.get("description", "")
    alerts = []

    # Check 1: Brand/model specificity
    brand_check = _check_brand_specificity(description)
    if brand_check["triggered"]:
        alerts.append(brand_check["reason"])

    # Check 2: Narrow year range
    year_check = _check_narrow_year_range(description)
    if year_check["triggered"]:
        alerts.append(year_check["reason"])

    # Check 3: Threshold extremity
    threshold_check = _check_threshold_extremity(criterion, category)
    if threshold_check["triggered"]:
        alerts.append(threshold_check["reason"])

    # Check 4: Specificity flag from AI extraction
    if criterion.get("specificity_alert"):
        alerts.append("AI flagged this criterion as potentially restrictive based on its specificity.")

    if alerts:
        # Estimate qualifying vendors based on severity
        estimated = 2 if len(alerts) > 1 else 3
        if threshold_check.get("multiplier", 0) > 5:
            estimated = 1

        return {
            "alert": True,
            "reason": " | ".join(alerts),
            "estimated_qualifying_vendors": estimated,
            "criterion_id": criterion.get("criterion_id"),
            "checks_triggered": len(alerts),
        }

    return {
        "alert": False,
        "reason": "No integrity concerns detected.",
        "estimated_qualifying_vendors": 10,
        "criterion_id": criterion.get("criterion_id"),
        "checks_triggered": 0,
    }
