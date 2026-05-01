"""
Financial Ontology for Nyayadarsi
Maps bidder terminology to tender criteria for semantic matching.
Handles the 'Annual Turnover' vs 'Net Revenue from Operations' problem.
"""

TURNOVER_SYNONYMS = [
    "Annual Turnover",
    "Net Revenue from Operations",
    "Gross Revenue",
    "Revenue from Operations",
    "Net Sales",
    "Total Revenue",
    "Turnover",
    "Revenue",
    "Total Turnover",
    "Aggregate Turnover",
]

EXCLUDED_FROM_TURNOVER = [
    "Other Income",
    "Exceptional Items",
    "Total Comprehensive Income",
    "Finance Income",
    "Interest Income",
    "Dividend Income",
]

ONTOLOGY = {
    "annual_turnover": {
        "synonyms": TURNOVER_SYNONYMS,
        "excluded": EXCLUDED_FROM_TURNOVER,
        "requires_auditor_signature": True,
        "acceptable_docs": ["CA_certificate", "audited_balance_sheet", "ITR"],
        "threshold_unit": "INR",
    },
    "net_worth": {
        "synonyms": [
            "Net Worth",
            "Shareholders' Equity",
            "Total Equity",
            "Proprietor's Fund",
            "Owner's Equity",
        ],
        "excluded": ["Loan Funds", "Borrowings"],
        "requires_auditor_signature": True,
        "acceptable_docs": ["CA_certificate", "audited_balance_sheet"],
        "threshold_unit": "INR",
    },
    "gst_registration": {
        "synonyms": [
            "GST Registration Number",
            "GSTIN",
            "GST No.",
            "Goods and Services Tax Registration",
        ],
        "excluded": [],
        "requires_auditor_signature": False,
        "acceptable_docs": ["gst_certificate", "gst_registration"],
        "threshold_unit": "boolean",
    },
    "iso_9001": {
        "synonyms": [
            "ISO 9001",
            "ISO 9001:2015",
            "Quality Management System",
            "QMS Certification",
        ],
        "excluded": [],
        "requires_auditor_signature": False,
        "acceptable_docs": ["iso_certificate", "qms_certificate"],
        "threshold_unit": "boolean",
    },
    "similar_projects": {
        "synonyms": [
            "Similar Work Experience",
            "Completed Projects",
            "Work Experience",
            "Past Projects of Similar Nature",
            "Experience in Similar Works",
        ],
        "excluded": [],
        "requires_auditor_signature": False,
        "acceptable_docs": ["experience_letter", "completion_certificate", "work_order"],
        "threshold_unit": "projects",
    },
    "experience_years": {
        "synonyms": [
            "Years of Experience",
            "Experience",
            "Years in Business",
            "Firm Established",
        ],
        "excluded": [],
        "requires_auditor_signature": False,
        "acceptable_docs": ["incorporation_certificate", "experience_letter"],
        "threshold_unit": "years",
    },
}


def find_matching_concept(text: str) -> str | None:
    """Find which ontology concept matches the given text."""
    text_lower = text.lower()
    for concept, data in ONTOLOGY.items():
        for synonym in data["synonyms"]:
            if synonym.lower() in text_lower:
                return concept
    return None


def get_acceptable_docs(concept: str) -> list:
    """Get list of acceptable document types for a concept."""
    return ONTOLOGY.get(concept, {}).get("acceptable_docs", [])


def is_excluded_term(text: str, concept: str) -> bool:
    """Check if the text matches an excluded term for the concept."""
    text_lower = text.lower()
    excluded = ONTOLOGY.get(concept, {}).get("excluded", [])
    for term in excluded:
        if term.lower() in text_lower:
            return True
    return False
