"""
Location Service — Clean Architecture geospatial operations.
Handles Haversine distance calculations, reverse geocoding, and distance verification.
All geospatial business logic is centralized here.
"""
import math
import logging
from typing import Any, Optional

logger = logging.getLogger("nyayadarsi.location")

# ── Reverse Geocoding (Geopy / Nominatim) ─────────────────────────────────
try:
    from geopy.geocoders import Nominatim
    from geopy.exc import GeocoderTimedOut, GeocoderServiceError

    _geocoder = Nominatim(user_agent="nyayadarsi-builder-verification/2.0", timeout=5)
    _GEOCODER_AVAILABLE = True
except ImportError:
    logger.warning("geopy not installed — reverse geocoding disabled. Install with: pip install geopy")
    _GEOCODER_AVAILABLE = False


# ── Haversine Distance ────────────────────────────────────────────────────
def haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """
    Calculate the great-circle distance between two points on Earth
    using the Haversine formula.

    Args:
        lat1: Latitude of point 1 (degrees).
        lon1: Longitude of point 1 (degrees).
        lat2: Latitude of point 2 (degrees).
        lon2: Longitude of point 2 (degrees).

    Returns:
        Distance in metres.
    """
    R = 6_371_000  # Earth radius in metres
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlambda = math.radians(lon2 - lon1)
    a = math.sin(dphi / 2) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(dlambda / 2) ** 2
    return 2 * R * math.asin(math.sqrt(a))


# ── Reverse Geocoding ─────────────────────────────────────────────────────
def reverse_geocode(lat: float, lon: float) -> Optional[str]:
    """
    Convert raw GPS coordinates to a human-readable address string
    using the Nominatim (OpenStreetMap) reverse geocoder.

    Returns:
        Human-readable address string, or None on failure.
        This is non-blocking — failures are silently logged.
    """
    if not _GEOCODER_AVAILABLE:
        return None

    try:
        location = _geocoder.reverse(f"{lat}, {lon}", exactly_one=True, language="en")
        if location and location.address:
            return str(location.address)
        return None
    except (GeocoderTimedOut, GeocoderServiceError) as e:
        logger.warning("Reverse geocoding failed for (%s, %s): %s", lat, lon, e)
        return None
    except Exception as e:
        logger.error("Unexpected reverse geocoding error: %s", e, exc_info=True)
        return None


# ── Distance Verification ─────────────────────────────────────────────────
# Thresholds
HARD_REJECT_THRESHOLD_M = 100.0    # Hard rejection — upload blocked
SOFT_FLAG_THRESHOLD_M = 500.0      # Soft flag — upload allowed but flagged


def verify_distance(
    upload_lat: float,
    upload_lon: float,
    site_lat: float,
    site_lon: float,
    hard_threshold_m: float = HARD_REJECT_THRESHOLD_M,
    flag_threshold_m: float = SOFT_FLAG_THRESHOLD_M,
) -> dict[str, Any]:
    """
    Verify builder's GPS coordinates against the registered project site.

    Implements a two-tier verification:
        1. Hard Reject (100m default): Upload is blocked entirely.
        2. Soft Flag (500m default): Upload is allowed but flagged for review.

    Args:
        upload_lat: Builder's reported latitude.
        upload_lon: Builder's reported longitude.
        site_lat: Registered project site latitude.
        site_lon: Registered project site longitude.
        hard_threshold_m: Distance in metres for hard rejection.
        flag_threshold_m: Distance in metres for soft flagging.

    Returns:
        Dictionary with verification result:
        {
            "accepted": bool,
            "distance_meters": float,
            "hard_threshold_meters": float,
            "flag_threshold_meters": float,
            "flagged": bool,
            "rejection_reason": str | None,
            "reverse_geocoded_address": str | None,
            "site_coordinates": {"lat": float, "lon": float},
        }
    """
    distance = haversine_distance(upload_lat, upload_lon, site_lat, site_lon)
    accepted = distance <= hard_threshold_m
    flagged = distance > flag_threshold_m

    # Reverse geocode (non-blocking, best-effort)
    address = reverse_geocode(upload_lat, upload_lon)

    rejection_reason: Optional[str] = None
    if not accepted:
        rejection_reason = (
            f"Upload location is {distance:.0f}m from registered site. "
            f"Maximum allowed: {hard_threshold_m:.0f}m."
        )

    return {
        "accepted": accepted,
        "distance_meters": round(distance, 1),
        "hard_threshold_meters": hard_threshold_m,
        "flag_threshold_meters": flag_threshold_m,
        "flagged": flagged,
        "rejection_reason": rejection_reason,
        "reverse_geocoded_address": address,
        "site_coordinates": {"lat": site_lat, "lon": site_lon},
    }
