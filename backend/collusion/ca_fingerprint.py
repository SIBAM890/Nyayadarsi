"""
CA Fingerprint Detection for Nyayadarsi
Detects forensically identical formatting in financial documents from different bidders.
"""


def analyse_fingerprints(doc_a: dict, doc_b: dict) -> dict:
    """
    Compare two financial documents for formatting similarity.
    Checks font sizes, decimal patterns, section headers, and CA firm details.
    
    For demo: Returns pre-set similarity for known bidder pairs.
    Phase 2: Real document comparison using extracted formatting metadata.
    """
    bidder_a = doc_a.get("bidder", "Unknown A")
    bidder_b = doc_b.get("bidder", "Unknown B")

    # Demo data — pre-computed for known bidder pairs
    known_matches = {
        ("BuildFast Pvt Ltd", "Rapid Build Ltd"): {
            "similarity_score": 0.91,
            "matching_features": [
                "Identical font sizes (11pt body, 14pt headers)",
                "Same decimal rounding pattern (2 decimal places, comma-separated lakhs)",
                "Identical section header formatting ('FINANCIAL SUMMARY' in all caps, centered)",
                "Same CA firm address format (3-line block, right-aligned)",
            ],
        },
        ("BuildFast Pvt Ltd", "Construct Co. Pvt Ltd"): {
            "similarity_score": 0.23,
            "matching_features": [],
        },
    }

    # Check both orderings
    key = (bidder_a, bidder_b)
    reverse_key = (bidder_b, bidder_a)

    match_data = known_matches.get(key) or known_matches.get(reverse_key)

    if match_data:
        triggered = match_data["similarity_score"] > 0.80
        return {
            "flag": "CA_FINGERPRINT",
            "triggered": triggered,
            "similarity_score": match_data["similarity_score"],
            "evidence": {
                "bidders": [bidder_a, bidder_b],
                "matching_features": match_data["matching_features"],
                "interpretation": (
                    f"Financial documents from {bidder_a} and {bidder_b} show "
                    f"{match_data['similarity_score']:.0%} formatting similarity. "
                    f"{'This strongly suggests the same CA firm prepared both documents.' if triggered else 'Normal variation in document formatting.'}"
                ),
            },
        }

    # Default for unknown pairs
    return {
        "flag": "CA_FINGERPRINT",
        "triggered": False,
        "similarity_score": 0.15,
        "evidence": {
            "bidders": [bidder_a, bidder_b],
            "matching_features": [],
            "interpretation": "Documents show normal variation in formatting.",
        },
    }
