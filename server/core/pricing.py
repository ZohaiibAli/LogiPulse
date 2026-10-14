from math import radians, sin, cos, sqrt, atan2

from config.settings import settings

EARTH_RADIUS_KM = 6371


def haversine_km(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
    lat1_r, lng1_r, lat2_r, lng2_r = map(radians, [lat1, lng1, lat2, lng2])
    d_lat = lat2_r - lat1_r
    d_lng = lng2_r - lng1_r
    a = sin(d_lat / 2) ** 2 + cos(lat1_r) * cos(lat2_r) * sin(d_lng / 2) ** 2
    c = 2 * atan2(sqrt(a), sqrt(1 - a))
    return EARTH_RADIUS_KM * c


def estimate_price(distance_km: float) -> float:
    price = settings.BASE_FARE + distance_km * settings.RATE_PER_KM
    return round(price, 2)
