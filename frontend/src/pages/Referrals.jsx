
import { useEffect, useMemo, useState } from "react";

const REFERRALS_API = "http://localhost:5000/api/referrals";
const PATIENTS_API = "http://localhost:5000/api/patients";
const CLINICS_API = "http://localhost:5000/api/clinics";

const styles = {
  page: {
    padding: "24px",
    color: "#183b35",
    fontFamily: "Arial, sans-serif",
    maxWidth: "1200px",
    margin: "0 auto"
  },
  heading: {
    fontSize: "28px",
    fontWeight: "700",
    marginBottom: "8px"
  },
  subtitle: {
    color: "#71847f",
    marginBottom: "24px"
  },
  stats: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
    gap: "14px",
    marginBottom: "24px"
  },
  card: {
    background: "#ffffff",
    border: "1px solid #e1ece8",
    borderRadius: "12px",
    padding: "18px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.03)"
  },
  cardLabel: {
    color: "#71847f",
    fontSize: "13px",
    marginBottom: "8px"
  },
  cardValue: {
    fontSize: "26px",
    fontWeight: "700"
  },
  toolbar: {
    display: "flex",
    flexWrap: "wrap",
    gap: "12px",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "18px"
  },
  input: {
    width: "100%",
    padding: "11px 12px",
    border: "1px solid #d7e4df",
    borderRadius: "8px",
    fontSize: "14px",
    boxSizing: "border-box",
    background: "#ffffff"
  },
  button: {
    background: "#16856b",
    color: "#ffffff",
    border: "none",
    borderRadius: "8px",
    padding: "11px 18px",
    fontWeight: "600",
    cursor: "pointer"
  },
  secondaryButton: {
    background: "#e9f5f1",
    color: "#16856b",
    border: "none",
    borderRadius: "8px",
    padding: "10px 14px",
    cursor: "pointer",
    fontWeight: "600"
  },
  tableWrapper: {
    overflowX: "auto",
    background: "#ffffff",
    border: "1px solid #e1ece8",
    borderRadius: "12px"
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    minWidth: "850px"
  },
  th: {
    textAlign: "left",
    padding: "14px",
    background: "#f2f8f5",
    color: "#58736a",
    fontSize: "12px",
    textTransform: "uppercase",
    borderBottom: "1px solid #e1ece8"
  },
  td: {
    padding: "14px",
    borderBottom: "1px solid #edf2ef",
    fontSize: "13px"
  },
  modalOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.45)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "16px",
    zIndex: 1000
  },
  modal: {
    background: "#ffffff",
    borderRadius: "14px",
    padding: "24px",
    width: "100%",
    maxWidth: "520px",
    maxHeight: "90vh",
    overflowY: "auto",
    boxSizing: "border-box"
  },
  label: {
    display: "block",
    fontSize: "13px",
    fontWeight: "600",
    marginBottom: "7px",
    color: "#36564c"
  },
  field: {
    marginBottom: "16px"
  }
};

function getStatusColor(status) {
  const colors = {
    Received: "#16856b",
    Pending: "#b7791f",
    "In Review": "#2563a6",
    Accepted: "#16856b",
    Rejected: "#c0392b"
  };

  return colors[status] || "#71847f";
}

export default function Referrals() {
  const [referrals, setReferrals] = useState([]);
  const [patients, setPatients] = useState([]);
  const [clinics, setClinics] = useState([]);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [form, setForm] = useState({
    patient_database_id: "",
    referring_clinic: "",
    receiving_clinic_id: "",
    reason: "",
    priority: "Normal"
  });

  async function fetchReferrals() {
    const response = await fetch(REFERRALS_API);
    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || "Unable to load referrals.");
    }

    setReferrals(data.referrals || []);
  }

  async function fetchPatients() {
    const response = await fetch(PATIENTS_API);
    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || "Unable to load patients.");
    }

    setPatients(data.patients || []);
  }

  async function fetchClinics() {
    const response = await fetch(CLINICS_API);
    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || "Unable to load clinics.");
    }

    setClinics(data.clinics || []);
  }

  async function loadData() {
    setLoading(true);
    setError("");

    try {
      await Promise.all([
        fetchReferrals(),
        fetchPatients(),
        fetchClinics()
      ]);
    } catch (err) {
      setError(err.message || "Unable to load SETU data.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const selectedPatient = patients.find(
    (patient) =>
      String(patient.id) === String(form.patient_database_id)
  );

  const clinicNames = useMemo(() => {
    return Object.fromEntries(
      clinics.map((clinic) => [String(clinic.id), clinic.name])
    );
  }, [clinics]);

  const filteredReferrals = useMemo(() => {
    const query = search.toLowerCase().trim();

    if (!query) return referrals;

    return referrals.filter((referral) => {
      const receivingClinic =
        clinicNames[String(referral.receiving_clinic_id)] || "";

      return [
        referral.referral_id,
        referral.patient_name,
        referral.referring_clinic,
        receivingClinic,
        referral.reason,
        referral.status,
        referral.priority
      ]
        .filter(Boolean)
        .some((value) =>
          String(value).toLowerCase().includes(query)
        );
    });
  }, [referrals, search, clinicNames]);

  const stats = {
    total: referrals.length,
    pending: referrals.filter(
      (item) => item.status === "Pending" || item.status === "Received"
    ).length,
    accepted: referrals.filter(
      (item) => item.status === "Accepted"
    ).length,
    urgent: referrals.filter(
      (item) => item.priority === "Urgent"
    ).length
  };

  function handleFormChange(event) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value
    }));
  }

  async function createReferral(event) {
    event.preventDefault();
    setError("");
    setMessage("");

    if (!form.patient_database_id) {
      setError("Please select a patient.");
      return;
    }

    if (!form.receiving_clinic_id) {
      setError("Please select a receiving clinic.");
      return;
    }

    if (!form.referring_clinic.trim() || !form.reason.trim()) {
      setError("Please complete all required fields.");
      return;
    }

    setSaving(true);

    try {
      const response = await fetch(REFERRALS_API, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          patient_database_id: Number(form.patient_database_id),
          referring_clinic: form.referring_clinic.trim(),
          receiving_clinic_id: Number(form.receiving_clinic_id),
          reason: form.reason.trim(),
          priority: form.priority
        })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to create referral.");
      }

      setMessage("Referral created successfully!");
      setForm({
        patient_database_id: "",
        referring_clinic: "",
        receiving_clinic_id: "",
        reason: "",
        priority: "Normal"
      });

      setShowModal(false);
      await fetchReferrals();
    } catch (err) {
      setError(err.message || "Unable to create referral.");
    } finally {
      setSaving(false);
    }
  }

  async function updateReferralStatus(id, status) {
    setError("");
    setMessage("");

    try {
      const response = await fetch(`${REFERRALS_API}/${id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ status })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to update status.");
      }

      await fetchReferrals();
      setMessage("Referral status updated successfully.");
    } catch (err) {
      setError(err.message || "Unable to update referral status.");
    }
  }

  return (
    <div style={styles.page}>
      <div style={styles.heading}>Referrals</div>

      <div style={styles.subtitle}>
        Manage patient referrals and track their progress.
      </div>

      <div style={styles.stats}>
        <div style={styles.card}>
          <div style={styles.cardLabel}>Total Referrals</div>
          <div style={styles.cardValue}>{stats.total}</div>
        </div>

        <div style={styles.card}>
          <div style={styles.cardLabel}>Pending / Received</div>
          <div style={styles.cardValue}>{stats.pending}</div>
        </div>

        <div style={styles.card}>
          <div style={styles.cardLabel}>Accepted</div>
          <div style={styles.cardValue}>{stats.accepted}</div>
        </div>

        <div style={styles.card}>
          <div style={styles.cardLabel}>Urgent Referrals</div>
          <div style={styles.cardValue}>{stats.urgent}</div>
        </div>
      </div>

      <div style={styles.toolbar}>
        <input
          type="text"
          placeholder="Search patient, referral ID, clinic..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          style={{ ...styles.input, maxWidth: "380px" }}
        />

        <div style={{ display: "flex", gap: "10px" }}>
          <button
            type="button"
            style={styles.secondaryButton}
            onClick={loadData}
          >
            Refresh
          </button>

          <button
            type="button"
            style={styles.button}
            onClick={() => {
              setError("");
              setMessage("");
              setShowModal(true);
            }}
          >
            + New Referral
          </button>
        </div>
      </div>

      {error && (
        <div
          style={{
            background: "#fff0ef",
            color: "#b42318",
            padding: "12px",
            borderRadius: "8px",
            marginBottom: "14px"
          }}
        >
          {error}
        </div>
      )}

      {message && (
        <div
          style={{
            background: "#e9f7ef",
            color: "#16856b",
            padding: "12px",
            borderRadius: "8px",
            marginBottom: "14px"
          }}
        >
          {message}
        </div>
      )}

      <div style={styles.tableWrapper}>
        {loading ? (
          <p style={{ padding: "24px" }}>Loading referrals...</p>
        ) : filteredReferrals.length === 0 ? (
          <p style={{ padding: "24px", color: "#71847f" }}>
            No referrals found.
          </p>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Referral ID</th>
                <th style={styles.th}>Patient</th>
                <th style={styles.th}>Referring Clinic</th>
                <th style={styles.th}>Receiving Clinic</th>
                <th style={styles.th}>Reason</th>
                <th style={styles.th}>Priority</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Update Status</th>
              </tr>
            </thead>

            <tbody>
              {filteredReferrals.map((referral) => (
                <tr key={referral.id}>
                  <td style={styles.td}>
                    <strong>{referral.referral_id}</strong>
                  </td>

                  <td style={styles.td}>
                    <strong>{referral.patient_name}</strong>
                    <div style={{ color: "#71847f", marginTop: "4px" }}>
                      Age: {referral.patient_age}
                    </div>
                  </td>

                  <td style={styles.td}>
                    {referral.referring_clinic}
                  </td>

                  <td style={styles.td}>
                    {clinicNames[String(referral.receiving_clinic_id)] ||
                      "Not assigned"}
                  </td>

                  <td style={styles.td}>{referral.reason}</td>

                  <td style={styles.td}>
                    <span
                      style={{
                        color:
                          referral.priority === "Urgent"
                            ? "#c0392b"
                            : "#16856b",
                        fontWeight: "700"
                      }}
                    >
                      {referral.priority}
                    </span>
                  </td>

                  <td style={styles.td}>
                    <span
                      style={{
                        color: getStatusColor(referral.status),
                        fontWeight: "700"
                      }}
                    >
                      {referral.status}
                    </span>
                  </td>

                  <td style={styles.td}>
                    <select
                      value={referral.status}
                      onChange={(event) =>
                        updateReferralStatus(
                          referral.id,
                          event.target.value
                        )
                      }
                      style={{ ...styles.input, minWidth: "125px" }}
                    >
                      <option value="Received">Received</option>
                      <option value="Pending">Pending</option>
                      <option value="In Review">In Review</option>
                      <option value="Accepted">Accepted</option>
                      <option value="Rejected">Rejected</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <div
          style={styles.modalOverlay}
          onClick={() => !saving && setShowModal(false)}
        >
          <div
            style={styles.modal}
            onClick={(event) => event.stopPropagation()}
          >
            <h2 style={{ marginTop: 0 }}>Create New Referral</h2>

            <p style={{ color: "#71847f", fontSize: "13px" }}>
              Select a patient and the clinic receiving this referral.
            </p>

            <form onSubmit={createReferral}>
              <div style={styles.field}>
                <label style={styles.label}>Select Patient *</label>

                <select
                  name="patient_database_id"
                  value={form.patient_database_id}
                  onChange={handleFormChange}
                  required
                  style={styles.input}
                >
                  <option value="">Choose a patient</option>

                  {patients.map((patient) => (
                    <option key={patient.id} value={patient.id}>
                      {patient.name} — {patient.patient_id}
                    </option>
                  ))}
                </select>
              </div>

              {selectedPatient && (
                <div
                  style={{
                    background: "#f0f8f5",
                    borderRadius: "8px",
                    padding: "12px",
                    marginBottom: "16px",
                    fontSize: "13px",
                    lineHeight: 1.8
                  }}
                >
                  <strong>Selected Patient Details</strong>
                  <div>Name: {selectedPatient.name}</div>
                  <div>Age: {selectedPatient.age}</div>
                  <div>Patient ID: {selectedPatient.patient_id}</div>
                  <div>Phone: {selectedPatient.phone}</div>
                </div>
              )}

              <div style={styles.field}>
                <label style={styles.label}>Referring Clinic *</label>

                <input
                  name="referring_clinic"
                  type="text"
                  value={form.referring_clinic}
                  onChange={handleFormChange}
                  placeholder="Enter referring clinic"
                  required
                  style={styles.input}
                />
              </div>

              <div style={styles.field}>
                <label style={styles.label}>Receiving Clinic *</label>

                <select
                  name="receiving_clinic_id"
                  value={form.receiving_clinic_id}
                  onChange={handleFormChange}
                  required
                  style={styles.input}
                >
                  <option value="">Choose receiving clinic</option>

                  {clinics.map((clinic) => (
                    <option key={clinic.id} value={clinic.id}>
                      {clinic.name}
                    </option>
                  ))}
                </select>
              </div>

              <div style={styles.field}>
                <label style={styles.label}>Reason for Referral *</label>

                <textarea
                  name="reason"
                  value={form.reason}
                  onChange={handleFormChange}
                  placeholder="Enter reason for referral"
                  required
                  rows={4}
                  style={{
                    ...styles.input,
                    resize: "vertical"
                  }}
                />
              </div>

              <div style={styles.field}>
                <label style={styles.label}>Priority *</label>

                <select
                  name="priority"
                  value={form.priority}
                  onChange={handleFormChange}
                  style={styles.input}
                >
                  <option value="Normal">Normal</option>
                  <option value="Urgent">Urgent</option>
                </select>
              </div>

              {error && (
                <p style={{ color: "#b42318", fontSize: "13px" }}>
                  {error}
                </p>
              )}

              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: "10px",
                  marginTop: "20px"
                }}
              >
                <button
                  type="button"
                  style={styles.secondaryButton}
                  disabled={saving}
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  style={styles.button}
                  disabled={saving || clinics.length === 0}
                >
                  {saving ? "Creating..." : "Create Referral"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <p
        style={{
          fontSize: "12px",
          color: "#8a9994",
          marginTop: "18px"
        }}
      >
        SETU is currently a demonstration prototype. Do not enter real
        patient or medical information.
      </p>
    </div>
  );
}
