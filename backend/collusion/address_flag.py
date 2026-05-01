"""
Shared Address Detection for Nyayadarsi
Finds bidders sharing the same registered office address.
"""
import re


def _normalize_address(address: str) -> str:
    """Normalize address for comparison."""
    addr = address.lower().strip()
    # Remove punctuation
    addr = re.sub(r'[^\w\s]', '', addr)
    # Standardize abbreviations
    replacements = {
        'pvt': 'private',
        'ltd': 'limited',
        'st': 'street',
        'rd': 'road',
        'ave': 'avenue',
        'blvd': 'boulevard',
        'ste': 'suite',
        'apt': 'apartment',
        'bldg': 'building',
        'flr': 'floor',
        'no': 'number',
        'nagar': 'nagar',
    }
    for short, full in replacements.items():
        addr = re.sub(rf'\b{short}\b', full, addr)
    # Collapse whitespace
    addr = re.sub(r'\s+', ' ', addr)
    return addr


def analyse_addresses(bidder_profiles: list[dict]) -> dict:
    """
    Find bidders sharing the same registered address.
    
    Args:
        bidder_profiles: List of {"bidder": str, "registered_address": str}
    
    Returns:
        Flag result with address clusters.
    """
    if len(bidder_profiles) < 2:
        return {
            "flag": "SHARED_ADDRESS",
            "triggered": False,
            "clusters": [],
            "evidence": {"interpretation": "Insufficient bidders for address comparison."},
        }

    # Normalize and group
    normalized = {}
    for profile in bidder_profiles:
        bidder = profile.get("bidder", profile.get("company_name", "Unknown"))
        address = profile.get("registered_address", "")
        if address:
            norm = _normalize_address(address)
            if norm not in normalized:
                normalized[norm] = []
            normalized[norm].append(bidder)

    # Find clusters (2+ bidders at same address)
    clusters = []
    for norm_addr, bidders in normalized.items():
        if len(bidders) >= 2:
            clusters.append({
                "bidders": bidders,
                "address": norm_addr,
                "count": len(bidders),
            })

    triggered = len(clusters) > 0

    return {
        "flag": "SHARED_ADDRESS",
        "triggered": triggered,
        "clusters": clusters,
        "evidence": {
            "total_bidders": len(bidder_profiles),
            "clusters_found": len(clusters),
            "interpretation": (
                f"Found {len(clusters)} address cluster(s) where multiple bidders share the same registered office."
                if triggered
                else "No shared addresses detected among bidders."
            ),
        },
    }
