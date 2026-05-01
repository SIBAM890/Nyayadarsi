"""
Document Quality Asymmetry Detection for Nyayadarsi
Detects when one document in a submission has significantly lower quality than others.
"""


def analyse_quality(documents: list[dict]) -> dict:
    """
    Compare document quality metrics across a bidder's submission.
    Flags when one document has significantly lower quality than the average.
    
    Checks: file size per page, OCR confidence, image DPI.
    
    Args:
        documents: List of {"name": str, "size_bytes": int, "pages": int, 
                           "ocr_confidence": float, "dpi": int}
    """
    if len(documents) < 2:
        return {
            "flag": "DOC_QUALITY_ASYMMETRY",
            "triggered": False,
            "evidence": {"interpretation": "Insufficient documents for quality comparison."},
        }

    # Calculate quality scores
    quality_scores = []
    for doc in documents:
        pages = doc.get("pages", 1) or 1
        size_per_page = doc.get("size_bytes", 0) / pages
        ocr_conf = doc.get("ocr_confidence", 0.95)
        dpi = doc.get("dpi", 300)

        # Composite quality score (0-1)
        size_score = min(1.0, size_per_page / 100000)  # Normalize to 100KB/page
        ocr_score = ocr_conf
        dpi_score = min(1.0, dpi / 300)

        composite = (size_score + ocr_score + dpi_score) / 3
        quality_scores.append({
            "document": doc.get("name", "Unknown"),
            "composite_score": round(composite, 3),
            "size_per_page": round(size_per_page),
            "ocr_confidence": ocr_conf,
            "dpi": dpi,
        })

    # Find outliers
    scores = [q["composite_score"] for q in quality_scores]
    avg_score = sum(scores) / len(scores)
    flagged = []

    for qs in quality_scores:
        if avg_score > 0 and qs["composite_score"] < avg_score * 0.5:
            flagged.append(qs["document"])

    triggered = len(flagged) > 0

    return {
        "flag": "DOC_QUALITY_ASYMMETRY",
        "triggered": triggered,
        "flagged_documents": flagged,
        "evidence": {
            "quality_scores": quality_scores,
            "average_score": round(avg_score, 3),
            "interpretation": (
                f"Document(s) {', '.join(flagged)} show significantly lower quality than other submissions. "
                f"This may indicate selective document degradation."
                if triggered
                else "All documents show consistent quality levels."
            ),
        },
    }
