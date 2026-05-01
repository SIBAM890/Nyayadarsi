"""
Consistency Checker for Nyayadarsi
Cross-references financial figures across multiple documents from the same bidder.
Flags when CA certificate turnover differs from ITR income by more than 10%.
"""


async def check_consistency(documents: list[dict]) -> dict:
    """
    Compare financial values across documents from the same bidder.
    Returns consistency flag and any discrepancies found.
    
    For MVP: returns structured result based on simple comparison.
    Phase 2: Uses Gemini to cross-reference actual document contents.
    """
    if len(documents) < 2:
        return {
            "consistent": True,
            "discrepancies": [],
            "note": "Fewer than 2 documents provided — cross-reference not possible.",
        }

    # For MVP: Check if we have pre-computed values in document metadata
    discrepancies = []

    financial_values = {}
    for doc in documents:
        doc_type = doc.get("type", "unknown")
        value = doc.get("financial_value")
        if value is not None:
            financial_values[doc_type] = value

    # Compare CA certificate vs ITR if both present
    ca_value = financial_values.get("CA_certificate")
    itr_value = financial_values.get("ITR")

    if ca_value and itr_value:
        diff_percent = abs(ca_value - itr_value) / max(ca_value, itr_value) * 100
        if diff_percent > 10:
            discrepancies.append({
                "type": "FINANCIAL_MISMATCH",
                "document_a": "CA_certificate",
                "document_b": "ITR",
                "value_a": ca_value,
                "value_b": itr_value,
                "difference_percent": round(diff_percent, 2),
                "severity": "HIGH" if diff_percent > 25 else "MEDIUM",
                "recommendation": "Internal financial document inconsistency detected. Manual verification required.",
            })

    return {
        "consistent": len(discrepancies) == 0,
        "discrepancies": discrepancies,
        "documents_checked": len(documents),
    }
