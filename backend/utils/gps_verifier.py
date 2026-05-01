"""
GPS Verifier for Nyayadarsi
Haversine formula to verify builder upload locations against registered site.
"""
import math


def haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """
    Calculate the great-circle distance between two points on Earth.
    Returns distance in metres.
    """
    R = 6371000  # Earth radius in metres
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlambda = math.radians(lon2 - lon1)
    a = math.sin(dphi / 2) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(dlambda / 2) ** 2
    return 2 * R * math.asin(math.sqrt(a))


def verify_upload(
    upload_lat: float,
    upload_lon: float,
    registered_lat: float,
    registered_lon: float,
    threshold_m: float = 100,
) -> dict:
    """
    Verify that an upload location is within threshold of the registered site.
    
    Returns:
        {
            "accepted": bool,
            "distance_meters": float,
            "threshold_meters": float,
            "rejection_reason": str | None,
        }
    """
    distance = haversine_distance(upload_lat, upload_lon, registered_lat, registered_lon)

    return {
        "accepted": distance <= threshold_m,
        "distance_meters": round(distance, 1),
        "threshold_meters": threshold_m,
        "rejection_reason": (
            None
            if distance <= threshold_m
            else f"Upload location is {distance:.0f}m from registered site. Maximum allowed: {threshold_m}m."
        ),
    }
