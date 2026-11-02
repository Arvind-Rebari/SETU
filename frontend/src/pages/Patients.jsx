
import { useEffect, useMemo, useState } from "react";
import {
  Users, UserPlus, Search, Eye, X,
  UserRound, FileText, HeartPulse,
  CalendarDays, Building2, Clock3
} from "lucide-react";

// Backend API addresses
const API_URL = "http://localhost:5000/api/patients";
const REFERRALS_API_URL = "http://localhost:5000/api/referrals";

// Convert backend database format into frontend format
function formatPatient(patient) {
  return {
    databaseId: patient.id,
    id: patient.patient_id,
    name: patient.name,
    age: patient.age,
    gender: patient.gender,
    phone: patient.phone,
    blood: patient.blood_group || "Unknown",
    clinic: patient.clinic || "",
    referrals: patient.referrals || 0,
    status: patient.status || "Active"
  };
}

export default function Patients() {
  const [patients, setPatients] = useState([]);

  const [search, setSearch] = useState("");
  const [genderFilter, setGenderFilter] = useState("All");

  const [showForm, setShowForm] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);

  const [referralHistory, setReferralHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: "",
    age: "",
    gender: "Male",
    phone: "",
    blood: "Unknown",
    clinic: "Sunrise Clinic"
  });

  // Fetch patients from SQLite backend
  async function fetchPatients() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(API_URL);
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to load patients.");
      }

      setPatients(data.patients.map(formatPatient));
    } catch (err) {
      console.error("Fetch patients error:", err);
      setError(
        "Unable to connect to SETU backend. Please check that the backend server is running."
      );
    } finally {
      setLoading(false);
    }
  }

  // Load patients when page opens
  useEffect(() => {
    fetchPatients();
  }, []);

  // Fetch referral history for the selected patient
  useEffect(() => {
    if (!selectedPatient) {
      setReferralHistory([]);
      setHistoryError("");
      return;
    }

    let cancelled = false;

    async function fetchReferralHistory() {
      try {
        setHistoryLoading(true);
        setHistoryError("");

        const response = await fetch(REFERRALS_API_URL);
        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.message || "Unable to load referral history.");
        }

        const patientReferrals = (data.referrals || []).filter(
          (referral) =>
            Number(referral.patient_database_id) ===
            Number(selectedPatient.databaseId)
        );

        if (!cancelled) {
          setReferralHistory(patientReferrals);
        }
      } catch (err) {
        console.error("Fetch referral history error:", err);

        if (!cancelled) {
          setHistoryError(
            "Unable to load referral history. Please try again."
          );
        }
      } finally {
        if (!cancelled) {
          setHistoryLoading(false);
        }
      }
    }

    fetchReferralHistory();

    return () => {
      cancelled = true;
    };
  }, [selectedPatient]);

  // Search and gender filtering
  const filteredPatients = useMemo(() => {
    return patients.filter((patient) => {
      const searchText = search.toLowerCase();

      const matchesSearch =
        patient.name.toLowerCase().includes(searchText) ||
        patient.id.toLowerCase().includes(searchText) ||
        patient.phone.includes(search);

      const matchesGender =
        genderFilter === "All" ||
        patient.gender === genderFilter;

      return matchesSearch && matchesGender;
    });
  }, [patients, search, genderFilter]);

  // Reset registration form
  function resetForm() {
    setForm({
      name: "",
      age: "",
      gender: "Male",
      phone: "",
      blood: "Unknown",
      clinic: "Sunrise Clinic"
    });
  }

  // Register patient through backend API
  async function handleSubmit(e) {
    e.preventDefault();

    if (saving) return;

    try {
      setSaving(true);
      setError("");

      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name: form.name.trim(),
          age: Number(form.age),
          gender: form.gender,
          phone: form.phone,
          blood_group: form.blood,
          clinic: form.clinic
        })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to register patient.");
      }

      const newPatient = formatPatient(data.patient);

      setPatients((previous) => [
        newPatient,
        ...previous
      ]);

      resetForm();
      setShowForm(false);

    } catch (err) {
      console.error("Add patient error:", err);
      setError(err.message || "Unable to register patient.");
    } finally {
      setSaving(false);
    }
  }

  // Referral status styling
  function getStatusStyle(status) {
    const normalizedStatus = (status || "").toLowerCase();

    if (normalizedStatus === "accepted") {
      return {
        background: "#dcfce7",
        color: "#15803d"
      };
    }

    if (normalizedStatus === "rejected") {
      return {
        background: "#fee2e2",
        color: "#b91c1c"
      };
    }

    if (normalizedStatus === "in review") {
      return {
        background: "#dbeafe",
        color: "#1d4ed8"
      };
    }

    if (normalizedStatus === "urgent") {
      return {
        background: "#fee2e2",
        color: "#b91c1c"
      };
    }

    return {
      background: "#f1f5f9",
      color: "#475569"
    };
  }

  return (
    <div className="patients-page">

      <div className="patients-title-row">
        <div>
          <span className="patients-eyebrow">PATIENT MANAGEMENT</span>
          <h2>Patient Directory</h2>
          <p>Manage and view patient information in one place.</p>
        </div>

        <button
          className="add-patient-btn"
          onClick={() => {
            setError("");
            setShowForm(true);
          }}
        >
          <UserPlus size={17} /> Add patient
        </button>
      </div>

      {/* Backend loading and error messages */}
      {loading && (
        <p style={{ color: "#64748b", marginBottom: "16px" }}>
          Loading patients from database...
        </p>
      )}

      {error && (
        <div
          role="alert"
          style={{
            background: "#fff1f2",
            color: "#be123c",
            padding: "12px 16px",
            borderRadius: "10px",
            marginBottom: "16px",
            fontSize: "14px"
          }}
        >
          {error}
          <button
            type="button"
            onClick={fetchPatients}
            style={{
              marginLeft: "12px",
              textDecoration: "underline",
              color: "inherit",
              background: "none",
              border: "none",
              cursor: "pointer"
            }}
          >
            Retry
          </button>
        </div>
      )}

      {/* Patient statistics */}
      <div className="patient-stats">
        <div className="patient-stat-card">
          <Users className="stat-blue" size={23} />
          <span>Total patients</span>
          <strong>{patients.length}</strong>
        </div>

        <div className="patient-stat-card">
          <HeartPulse className="stat-green" size={23} />
          <span>Active patients</span>
          <strong>
            {patients.filter(p => p.status === "Active").length}
          </strong>
        </div>

        <div className="patient-stat-card">
          <FileText className="stat-orange" size={23} />
          <span>Total referrals</span>
          <strong>
            {patients.reduce((sum, p) => sum + p.referrals, 0)}
          </strong>
        </div>
      </div>

      <div className="patients-card">

        <div className="patients-card-heading">
          <div>
            <h3>All patients</h3>
            <p>Search and manage registered patients.</p>
          </div>

          <span className="patient-count">
            {filteredPatients.length} records
          </span>
        </div>

        <div className="patients-tools">

          <div className="patients-search">
            <Search size={17} />

            <input
              placeholder="Search by name, patient ID or phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <select
            className="gender-filter"
            value={genderFilter}
            onChange={(e) => setGenderFilter(e.target.value)}
          >
            <option value="All">All genders</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>

        </div>

        <div className="patients-table-scroll">

          <table className="patients-table">

            <thead>
              <tr>
                <th>PATIENT</th>
                <th>AGE / GENDER</th>
                <th>PHONE</th>
                <th>BLOOD GROUP</th>
                <th>CLINIC</th>
                <th>REFERRALS</th>
                <th>ACTION</th>
              </tr>
            </thead>

            <tbody>

              {filteredPatients.map((patient) => (
                <tr key={patient.id}>

                  <td>
                    <strong>{patient.name}</strong>
                    <span className="patient-subtext">
                      {patient.id}
                    </span>
                  </td>

                  <td>
                    {patient.age} years / {patient.gender}
                  </td>

                  <td>{patient.phone}</td>

                  <td>
                    <span className="blood-badge">
                      {patient.blood}
                    </span>
                  </td>

                  <td>{patient.clinic}</td>

                  <td>{patient.referrals}</td>

                  <td>
                    <button
                      className="patient-view-btn"
                      onClick={() => setSelectedPatient(patient)}
                    >
                      <Eye size={14} /> View
                    </button>
                  </td>

                </tr>
              ))}

              {!loading && filteredPatients.length === 0 && (
                <tr>
                  <td colSpan="7" className="patients-empty">
                    No patients found. Try another search.
                  </td>
                </tr>
              )}

            </tbody>

          </table>

        </div>

        <p className="patient-demo-note">
          Demo records only. Do not enter real patient or medical information.
        </p>

      </div>

      {/* Add patient modal */}
      {showForm && (
        <div className="patient-modal-backdrop">

          <div className="patient-modal">

            <div className="patient-modal-heading">

              <div>
                <span className="patients-eyebrow">
                  PATIENT REGISTRATION
                </span>

                <h3>Add new patient</h3>

                <p>Enter basic demo patient information.</p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setError("");
                }}
              >
                <X size={19} />
              </button>

            </div>

            <form onSubmit={handleSubmit}>

              <label>
                Full name

                <input
                  required
                  value={form.name}
                  onChange={e =>
                    setForm({ ...form, name: e.target.value })
                  }
                  placeholder="Enter patient name"
                />
              </label>

              <div className="patient-form-row">

                <label>
                  Age

                  <input
                    type="number"
                    min="1"
                    max="120"
                    required
                    value={form.age}
                    onChange={e =>
                      setForm({ ...form, age: e.target.value })
                    }
                    placeholder="Age"
                  />
                </label>

                <label>
                  Gender

                  <select
                    value={form.gender}
                    onChange={e =>
                      setForm({ ...form, gender: e.target.value })
                    }
                  >
                    <option>Male</option>
                    <option>Female</option>
                    <option>Other</option>
                  </select>
                </label>

              </div>

              <label>
                Phone number

                <input
                  type="tel"
                  required
                  pattern="[0-9]{10}"
                  value={form.phone}
                  onChange={e =>
                    setForm({ ...form, phone: e.target.value })
                  }
                  placeholder="10-digit phone number"
                />
              </label>

              <label>
                Blood group

                <select
                  value={form.blood}
                  onChange={e =>
                    setForm({ ...form, blood: e.target.value })
                  }
                >
                  {[
                    "Unknown", "A+", "A-", "B+", "B-",
                    "O+", "O-", "AB+", "AB-"
                  ].map(group => (
                    <option key={group}>{group}</option>
                  ))}
                </select>
              </label>

              <label>
                Clinic

                <select
                  value={form.clinic}
                  onChange={e =>
                    setForm({ ...form, clinic: e.target.value })
                  }
                >
                  <option>Sunrise Clinic</option>
                  <option>City Health Centre</option>
                  <option>Green Life Hospital</option>
                  <option>Wellness Medical</option>
                </select>
              </label>

              <div className="patient-form-notice">
                Demo only. This form is not connected to a secure medical database.
              </div>

              {error && (
                <p
                  role="alert"
                  style={{
                    color: "#be123c",
                    fontSize: "13px",
                    marginTop: "10px"
                  }}
                >
                  {error}
                </p>
              )}

              <button
                className="add-patient-btn patient-submit"
                type="submit"
                disabled={saving}
              >
                {saving ? "Saving patient..." : "Register patient"}
              </button>

            </form>

          </div>

        </div>
      )}

      {/* View patient profile modal */}
      {selectedPatient && (
        <div className="patient-modal-backdrop">

          <div
            className="patient-modal"
            style={{
              maxHeight: "90vh",
              overflowY: "auto"
            }}
          >

            <div className="patient-modal-heading">

              <div>
                <span className="patients-eyebrow">
                  PATIENT PROFILE
                </span>

                <h3>{selectedPatient.name}</h3>

                <p>{selectedPatient.id}</p>
              </div>

              <button
                onClick={() => setSelectedPatient(null)}
              >
                <X size={19} />
              </button>

            </div>

            <div className="patient-profile-icon">
              <UserRound size={30} />
            </div>

            <div className="patient-detail-list">

              <p>
                <strong>Age</strong>
                <span>{selectedPatient.age} years</span>
              </p>

              <p>
                <strong>Gender</strong>
                <span>{selectedPatient.gender}</span>
              </p>

              <p>
                <strong>Phone</strong>
                <span>{selectedPatient.phone}</span>
              </p>

              <p>
                <strong>Blood group</strong>
                <span>{selectedPatient.blood}</span>
              </p>

              <p>
                <strong>Clinic</strong>
                <span>{selectedPatient.clinic}</span>
              </p>

              <p>
                <strong>Total referrals</strong>
                <span>{referralHistory.length}</span>
              </p>

              <p>
                <strong>Status</strong>
                <span>{selectedPatient.status}</span>
              </p>

            </div>

            {/* Referral History */}
            <div
              style={{
                marginTop: "24px",
                borderTop: "1px solid #e2e8f0",
                paddingTop: "20px"
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: "10px",
                  marginBottom: "16px"
                }}
              >
                <div>
                  <h3
                    style={{
                      fontSize: "17px",
                      color: "#0f172a",
                      margin: 0
                    }}
                  >
                    Referral History
                  </h3>

                  <p
                    style={{
                      fontSize: "12px",
                      color: "#64748b",
                      margin: "5px 0 0"
                    }}
                  >
                    Previous and current referrals
                  </p>
                </div>

                <span
                  style={{
                    background: "#e0f2fe",
                    color: "#0369a1",
                    padding: "6px 10px",
                    borderRadius: "20px",
                    fontSize: "12px",
                    fontWeight: 600
                  }}
                >
                  {referralHistory.length} referrals
                </span>
              </div>

              {historyLoading && (
                <p style={{ color: "#64748b", fontSize: "13px" }}>
                  Loading referral history...
                </p>
              )}

              {historyError && (
                <p
                  role="alert"
                  style={{
                    color: "#be123c",
                    fontSize: "13px"
                  }}
                >
                  {historyError}
                </p>
              )}

              {!historyLoading &&
                !historyError &&
                referralHistory.length === 0 && (
                  <div
                    style={{
                      textAlign: "center",
                      padding: "24px 12px",
                      background: "#f8fafc",
                      borderRadius: "12px",
                      border: "1px dashed #cbd5e1"
                    }}
                  >
                    <FileText
                      size={28}
                      color="#94a3b8"
                      style={{ marginBottom: "8px" }}
                    />

                    <p
                      style={{
                        color: "#475569",
                        fontSize: "14px",
                        fontWeight: 600,
                        margin: 0
                      }}
                    >
                      No referral history
                    </p>

                    <p
                      style={{
                        color: "#94a3b8",
                        fontSize: "12px",
                        margin: "5px 0 0"
                      }}
                    >
                      Referrals for this patient will appear here.
                    </p>
                  </div>
                )}

              {!historyLoading &&
                referralHistory.map((referral) => (
                  <div
                    key={referral.id}
                    style={{
                      border: "1px solid #e2e8f0",
                      borderRadius: "12px",
                      padding: "14px",
                      marginBottom: "12px",
                      background: "#ffffff"
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        gap: "10px",
                        flexWrap: "wrap",
                        marginBottom: "12px"
                      }}
                    >
                      <div>
                        <strong
                          style={{
                            fontSize: "13px",
                            color: "#0f172a"
                          }}
                        >
                          {referral.referral_id}
                        </strong>

                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "5px",
                            color: "#64748b",
                            fontSize: "12px",
                            marginTop: "6px"
                          }}
                        >
                          <CalendarDays size={13} />
                          {referral.referral_date || "Date unavailable"}
                        </div>
                      </div>

                      <span
                        style={{
                          ...getStatusStyle(referral.status),
                          padding: "5px 9px",
                          borderRadius: "20px",
                          fontSize: "11px",
                          fontWeight: 600
                        }}
                      >
                        {referral.status || "Pending"}
                      </span>
                    </div>

                    <div
                      style={{
                        display: "grid",
                        gap: "10px"
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "flex-start",
                          gap: "9px"
                        }}
                      >
                        <Building2
                          size={16}
                          color="#64748b"
                          style={{ marginTop: "2px", flexShrink: 0 }}
                        />

                        <div>
                          <span
                            style={{
                              display: "block",
                              fontSize: "11px",
                              color: "#94a3b8"
                            }}
                          >
                            Referring clinic
                          </span>

                          <strong
                            style={{
                              fontSize: "13px",
                              color: "#334155"
                            }}
                          >
                            {referral.referring_clinic || "Not specified"}
                          </strong>
                        </div>
                      </div>

                      <div
                        style={{
                          display: "flex",
                          alignItems: "flex-start",
                          gap: "9px"
                        }}
                      >
                        <FileText
                          size={16}
                          color="#64748b"
                          style={{ marginTop: "2px", flexShrink: 0 }}
                        />

                        <div>
                          <span
                            style={{
                              display: "block",
                              fontSize: "11px",
                              color: "#94a3b8"
                            }}
                          >
                            Reason for referral
                          </span>

                          <strong
                            style={{
                              fontSize: "13px",
                              color: "#334155",
                              fontWeight: 500
                            }}
                          >
                            {referral.reason || "Not specified"}
                          </strong>
                        </div>
                      </div>

                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "9px",
                          flexWrap: "wrap"
                        }}
                      >
                        <Clock3 size={16} color="#64748b" />

                        <span
                          style={{
                            fontSize: "12px",
                            color: "#64748b"
                          }}
                        >
                          Priority:
                        </span>

                        <span
                          style={{
                            ...getStatusStyle(referral.priority),
                            padding: "4px 8px",
                            borderRadius: "20px",
                            fontSize: "11px",
                            fontWeight: 600
                          }}
                        >
                          {referral.priority || "Normal"}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
            </div>

            <p className="patient-demo-note">
              This is a demonstration profile, not a verified medical record.
            </p>

          </div>

        </div>
      )}

    </div>
  );
}
