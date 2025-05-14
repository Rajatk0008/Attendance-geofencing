import math

def haversine(lat1, lon1, lat2, lon2):
    R = 6371000  # Earth radius in meters
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlambda = math.radians(lon2 - lon1)
    a = math.sin(dphi / 2)**2 + math.cos(phi1) * math.cos(phi2) * math.sin(dlambda / 2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c

def is_within_geofence(lat, lon):
    GEOFENCE_LAT = 20.294776
    GEOFENCE_LON = 85.813756
    GEOFENCE_RADIUS = 200  # meters
    return haversine(GEOFENCE_LAT, GEOFENCE_LON, lat, lon) <= GEOFENCE_RADIUS
