
import { useEffect, useMemo, useState } from "react";
import {
  MapPin,
  Navigation,
  Search,
  RefreshCw,
  Phone,
  Building2,
  LocateFixed,
  AlertCircle,
  MapPinned
} from "lucide-react";
import "./NearbyClinics.css";

const API_URL = "http://localhost:5000/api/clinics";

function calculateDistance(lat1, lon1, lat2, lon2) {
  const toRadians = (value) => (value * Math.PI) / 180;
  const earthRadius = 6371;

  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) ** 2;

  return earthRadius * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export default function NearbyClinics() {
  const [clinics, setClinics] = useState([]);
  const [search, setSearch] = useState("");
  const [userLocation, setUserLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [locating, setLocating] = useState(false);
  const [error, setError] = useState("");

  const fetchClinics = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(API_URL);
      if (!response.ok) throw new Error("Unable to load clinics.");

      const data = await response.json();
      setClinics(data.clinics || []);
    } catch (err) {
      setError(err.message || "Something went wrong while loading clinics.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClinics();
  }, []);

  const detectLocation = () => {
    if (!navigator.geolocation) {
      setError("Your browser does not support location access.");
      return;
    }

    setLocating(true);
    setError("");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        });
        setLocating(false);
      },
      (locationError) => {
        setLocating(false);

        if (locationError.code === 1) {
          setError("Location permission denied. Please allow location access in your browser.");
        } else if (locationError.code === 2) {
          setError("Your current location could not be detected.");
        } else {
          setError("Location request timed out. Please try again.");
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    );
  };

  const filteredClinics = useMemo(() => {
    const query = search.toLowerCase().trim();

    return clinics
      .filter((clinic) => {
        const name = (clinic.name || "").toLowerCase();
        const address = (clinic.address || "").toLowerCase();
        const code = (clinic.clinic_code || "").toLowerCase();

        return (
          name.includes(query) ||
          address.includes(query) ||
          code.includes(query)
        );
      })
      .map((clinic) => {
        const hasCoordinates =
          clinic.latitude !== null &&
          clinic.latitude !== undefined &&
          clinic.longitude !== null &&
          clinic.longitude !== undefined &&
          Number.isFinite(Number(clinic.latitude)) &&
          Number.isFinite(Number(clinic.longitude));

        const distance =
          userLocation && hasCoordinates
            ? calculateDistance(
                userLocation.latitude,
                userLocation.longitude,
                Number(clinic.latitude),
                Number(clinic.longitude)
              )
            : null;

        return { ...clinic, distance };
      })
      .sort((a, b) => {
        if (a.distance === null) return 1;
        if (b.distance === null) return -1;
        return a.distance - b.distance;
      });
  }, [clinics, search, userLocation]);

  const openDirections = (clinic) => {
    if (clinic.latitude == null || clinic.longitude == null) return;

    const destination = `${clinic.latitude},${clinic.longitude}`;
    const origin = userLocation
      ? `&origin=${userLocation.latitude},${userLocation.longitude}`
      : "";

    window.open(
      `https://www.google.com/maps/dir/?api=1&destination=${destination}${origin}`,
      "_blank",
      "noopener,noreferrer"
    );
  };

  return (
    <div className="nearby-page">
      <div className="nearby-header">
        <div>
          <div className="nearby-eyebrow">
            <MapPin size={15} />
            YOUR HEALTHCARE NETWORK
          </div>
          <h1>Nearby Clinics</h1>
          <p>Discover healthcare facilities and find care closer to you.</p>
        </div>

        <button
          className="nearby-refresh"
          onClick={fetchClinics}
          disabled={loading}
        >
          <RefreshCw size={17} className={loading ? "nearby-spin" : ""} />
          Refresh
        </button>
      </div>

      <section className="location-panel">
        <div className="location-icon">
          <Navigation size={24} />
        </div>

        <div className="location-content">
          <h2>Find care closer to you</h2>
          <p>
            Allow location access to calculate distances to registered SETU clinics.
          </p>

          <button
            className="location-button"
            onClick={detectLocation}
            disabled={locating}
          >
            <LocateFixed size={18} />
            {locating ? "Detecting location..." : "Use My Location"}
          </button>

          {userLocation && (
            <div className="location-success">
              <span className="status-dot" />
              Location detected. Distances are calculated from your current position.
            </div>
          )}
        </div>
      </section>

      {error && (
        <div className="nearby-error">
          <AlertCircle size={19} />
          {error}
        </div>
      )}

      <div className="nearby-list-header">
        <div>
          <h2>Registered Clinics</h2>
          <p>
            {loading ? "Loading clinics..." : `${filteredClinics.length} clinic(s) found`}
          </p>
        </div>

        <div className="nearby-search">
          <Search size={19} />
          <input
            type="text"
            placeholder="Search clinics by name or address..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="nearby-empty">
          <RefreshCw size={28} className="nearby-spin" />
          <h3>Loading clinics</h3>
          <p>Please wait while we connect to the SETU network.</p>
        </div>
      ) : filteredClinics.length === 0 ? (
        <div className="nearby-empty">
          <Building2 size={32} />
          <h3>No clinics found</h3>
          <p>Try another search term or refresh the clinic list.</p>
        </div>
      ) : (
        <div className="clinic-grid">
          {filteredClinics.map((clinic) => (
            <article className="clinic-card" key={clinic.id}>
              <div className="clinic-card-top">
                <div className="clinic-avatar">
                  <Building2 size={25} />
                </div>

                <span className="clinic-network-tag">SETU Network</span>
              </div>

              <h3>{clinic.name}</h3>
              <p className="clinic-code">{clinic.clinic_code}</p>

              <div className="clinic-detail">
                <MapPin size={17} />
                <span>{clinic.address || "Address not added yet"}</span>
              </div>

              {clinic.phone && (
                <div className="clinic-detail">
                  <Phone size={17} />
                  <span>{clinic.phone}</span>
                </div>
              )}

              <div className="clinic-distance">
                {clinic.distance !== null ? (
                  <>
                    <MapPinned size={17} />
                    <strong>
                      {clinic.distance < 1
                        ? `${Math.round(clinic.distance * 1000)} m away`
                        : `${clinic.distance.toFixed(1)} km away`}
                    </strong>
                  </>
                ) : (
                  <>
                    <MapPin size={17} />
                    <span>Location coordinates not added</span>
                  </>
                )}
              </div>

              <button
                className="clinic-directions"
                onClick={() => openDirections(clinic)}
                disabled={clinic.latitude == null || clinic.longitude == null}
              >
                <Navigation size={17} />
                Get Directions
              </button>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
