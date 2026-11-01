
import { useEffect, useMemo, useState } from "react";
import {
  Plus, Search, Filter, ClipboardList, Clock3,
  CheckCircle2, AlertCircle, Eye, X
} from "lucide-react";

const API_URL = "http://localhost:5000/api/referrals";

// Convert database records into frontend format
function formatReferral(referral) {
  return {
    databaseId: referral.id,
    id: referral.referral_id,
    name: referral.patient_name,
    age: referral.patient_age,
    clinic: referral.referring_clinic,
    reason: referral.reason,
    date: referral.referral_date,
    status: referral.status,
    priority: referral.priority
  };
}

export default function Referrals() {
  const [referrals, setReferrals] = useState([]);

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");

  const [showForm, setShowForm] = useState(false);
  const [selected, setSelected] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [updating, setUpdating] = useState(false);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [form, setForm] = useState({
    name: "",
    age: "",
    clinic: "",
    reason: "",
    priority: "Normal"
  });

  // Fetch referrals from SQLite
  async function fetchReferrals() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(API_URL);
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to load referrals.");
      }

      setReferrals(data.referrals.map(formatReferral));

    } catch (err) {
      console.error("Fetch referrals error:", err);
      setError(
        "Unable to connect to SETU referral service. Check that your backend is running."
      );
    } finally {
      setLoading(false);
    }
  }

  // Load referrals when page opens
  useEffect(() => {
    fetchReferrals();
  }, []);

  // Search and filter
  const filtered = useMemo(() => {
    return referrals.filter((r) => {
      const searchText = search.toLowerCase();

      const matchesSearch =
        `${r.name} ${r.id} ${r.clinic} ${r.reason}`
          .toLowerCase()
          .includes(searchText);

      const matchesFilter =
        filter === "All" || r.status === filter;

      return matchesSearch && matchesFilter;
    });
  }, [referrals, search, filter]);

  // Update form fields
  function updateForm(e) {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  }

  // Reset form
  function resetForm() {
    setForm({
      name: "",
      age: "",
      clinic: "",
      reason: "",
      priority: "Normal"
    });
  }

  // Show success message
  function showSuccess(text) {
    setMessage(text);

    setTimeout(() => {
      setMessage("");
    }, 3000);
  }

  // Create referral in database
  async function createReferral(e) {
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
          patient_name: form.name.trim(),
          patient_age: Number(form.age),
          referring_clinic: form.clinic.trim(),
          reason: form.reason.trim(),
          priority: form.priority
        })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to create referral.");
      }

      const newReferral = formatReferral(data.referral);

      setReferrals((previous) => [
        newReferral,
        ...previous
      ]);

      resetForm();
      setShowForm(false);

      showSuccess("New referral created and saved successfully.");

    } catch (err) {
      console.error("Create referral error:", err);
      setError(err.message || "Unable to create referral.");
    } finally {
      setSaving(false);
    }
  }

  // Update referral status in database
  async function changeStatus(referral, status) {
    if (updating) return;

    try {
      setUpdating(true);
      setError("");

      const response = await fetch(
        `${API_URL}/${referral.databaseId}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ status })
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to update status.");
      }

      const updatedReferral = formatReferral(data.referral);

      setReferrals((previous) =>
        previous.map((r) =>
          r.databaseId === updatedReferral.databaseId
            ? updatedReferral
            : r
        )
      );

      setSelected(null);

      showSuccess(`Referral status updated to ${status}.`);

    } catch (err) {
      console.error("Update referral error:", err);
      setError(err.message || "Unable to update referral status.");
    } finally {
      setUpdating(false);
    }
  }

  // Statistics
  const counts = {
    All: referrals.length,
    Received: referrals.filter(r => r.status === "Received").length,
    Pending: referrals.filter(r => r.status === "Pending").length,
    Accepted: referrals.filter(r => r.status === "Accepted").length,
    Urgent: referrals.filter(r => r.priority === "Urgent").length
  };

  return (
    <div className="page-content referrals-page">

      {/* Page heading */}
      <div className="referrals-title-row">
        <div>
          <span className="referrals-eyebrow">
            CARE COORDINATION
          </span>

          <h2>Patient Referrals</h2>

          <p>
            Send, receive and manage patient referrals in one place.
          </p>
        </div>

        <button
          className="new-referral-btn"
          onClick={() => {
            setError("");
            setShowForm(true);
          }}
        >
          <Plus size={18} /> New referral
        </button>
      </div>

      {/* Messages */}
      {message && (
        <div className="referral-message">
          <CheckCircle2 size={17} /> {message}
        </div>
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
            onClick={fetchReferrals}
            style={{
              marginLeft: "12px",
              background: "none",
              border: "none",
              color: "inherit",
              textDecoration: "underline",
              cursor: "pointer"
            }}
          >
            Retry
          </button>
        </div>
      )}

      {loading && (
        <p style={{ color: "#64748b", marginBottom: "16px" }}>
          Loading referrals from database...
        </p>
      )}

      {/* Statistics */}
      <div className="referral-stats">

        <div className="referral-stat">
          <span className="referral-stat-icon total">
            <ClipboardList />
          </span>
          <span>Total referrals</span>
          <strong>{counts.All}</strong>
        </div>

        <div className="referral-stat">
          <span className="referral-stat-icon received">
            <CheckCircle2 />
          </span>
          <span>Received</span>
          <strong>{counts.Received}</strong>
        </div>

        <div className="referral-stat">
          <span className="referral-stat-icon pending">
            <Clock3 />
          </span>
          <span>Pending</span>
          <strong>{counts.Pending}</strong>
        </div>

        <div className="referral-stat">
          <span className="referral-stat-icon urgent">
            <AlertCircle />
          </span>
          <span>Urgent cases</span>
          <strong>{counts.Urgent}</strong>
        </div>

      </div>

      {/* Referral table */}
      <section className="referrals-card">

        <div className="referrals-card-heading">
          <div>
            <h3>All referrals</h3>
            <p>Find and review patient referral requests.</p>
          </div>

          <span className="record-count">
            {filtered.length} records
          </span>
        </div>

        <div className="referrals-tools">

          <label className="referrals-search">
            <Search size={17} />

            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search patient or referral ID..."
            />
          </label>

          <label className="filter-select">
            <Filter size={16} />

            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              {[
                "All",
                "Received",
                "Pending",
                "In Review",
                "Accepted",
                "Rejected"
              ].map(status => (
                <option key={status} value={status}>
                  {status === "All" ? "All statuses" : status}
                </option>
              ))}
            </select>
          </label>

        </div>

        <div className="referrals-table-scroll">

          <table className="referrals-list-table">

            <thead>
              <tr>
                <th>REFERRAL / PATIENT</th>
                <th>REFERRED BY</th>
                <th>REASON</th>
                <th>STATUS</th>
                <th>PRIORITY</th>
                <th>DATE</th>
                <th>ACTION</th>
              </tr>
            </thead>

            <tbody>

              {filtered.map((r) => (
                <tr key={r.id}>

                  <td>
                    <strong>{r.name}</strong>
                    <span className="table-subtext">
                      {r.id} · Age {r.age}
                    </span>
                  </td>

                  <td>{r.clinic}</td>

                  <td>{r.reason}</td>

                  <td>
                    <span
                      className={`ref-status ${r.status.toLowerCase().replace(" ", "-")}`}
                    >
                      {r.status}
                    </span>
                  </td>

                  <td>
                    <span
                      className={`ref-priority ${r.priority.toLowerCase()}`}
                    >
                      ● {r.priority}
                    </span>
                  </td>

                  <td>{r.date}</td>

                  <td>
                    <button
                      className="view-referral-btn"
                      onClick={() => setSelected(r)}
                    >
                      <Eye size={15} /> View
                    </button>
                  </td>

                </tr>
              ))}

              {!loading && filtered.length === 0 && (
                <tr>
                  <td colSpan="7" className="referrals-empty">
                    No referrals found. Try another search or filter.
                  </td>
                </tr>
              )}

            </tbody>

          </table>

        </div>

      </section>

      {/* Create referral modal */}
      {showForm && (
        <div
          className="referral-modal-backdrop"
          onClick={() => setShowForm(false)}
        >
          <section
            className="referral-modal"
            onClick={(e) => e.stopPropagation()}
          >

            <div className="modal-heading">
              <div>
                <h3>Create a new referral</h3>
                <p>Enter the basic patient and referral details.</p>
              </div>

              <button
                type="button"
                onClick={() => setShowForm(false)}
                aria-label="Close form"
              >
                <X />
              </button>
            </div>

            <form onSubmit={createReferral}>

              <label>
                Patient full name

                <input
                  name="name"
                  value={form.name}
                  onChange={updateForm}
                  placeholder="Enter patient name"
                  required
                />
              </label>

              <label>
                Patient age

                <input
                  name="age"
                  type="number"
                  min="1"
                  max="120"
                  value={form.age}
                  onChange={updateForm}
                  placeholder="Enter age"
                  required
                />
              </label>

              <label>
                Referring clinic

                <input
                  name="clinic"
                  value={form.clinic}
                  onChange={updateForm}
                  placeholder="Enter clinic name"
                  required
                />
              </label>

              <label>
                Reason for referral

                <textarea
                  name="reason"
                  value={form.reason}
                  onChange={updateForm}
                  placeholder="Explain why the patient is being referred"
                  required
                />
              </label>

              <label>
                Priority

                <select
                  name="priority"
                  value={form.priority}
                  onChange={updateForm}
                >
                  <option>Normal</option>
                  <option>Urgent</option>
                </select>
              </label>

              <div className="modal-notice">
                Demo only: do not enter real patient or medical information.
              </div>

              <button
                className="new-referral-btn modal-submit"
                type="submit"
                disabled={saving}
              >
                <Plus size={17} />
                {saving ? "Saving referral..." : "Create demo referral"}
              </button>

            </form>

          </section>
        </div>
      )}

      {/* Referral details modal */}
      {selected && (
        <div
          className="referral-modal-backdrop"
          onClick={() => !updating && setSelected(null)}
        >
          <section
            className="referral-modal detail-modal"
            onClick={(e) => e.stopPropagation()}
          >

            <div className="modal-heading">

              <div>
                <span className="referrals-eyebrow">
                  REFERRAL DETAILS
                </span>

                <h3>{selected.name}</h3>

                <p>
                  {selected.id} · Age {selected.age}
                </p>
              </div>

              <button
                onClick={() => setSelected(null)}
                disabled={updating}
                aria-label="Close details"
              >
                <X />
              </button>

            </div>

            <div className="detail-list">

              <p>
                <strong>Referring clinic</strong>
                <span>{selected.clinic}</span>
              </p>

              <p>
                <strong>Referral reason</strong>
                <span>{selected.reason}</span>
              </p>

              <p>
                <strong>Date</strong>
                <span>{selected.date}</span>
              </p>

              <p>
                <strong>Priority</strong>
                <span className={`ref-priority ${selected.priority.toLowerCase()}`}>
                  {selected.priority}
                </span>
              </p>

              <p>
                <strong>Current status</strong>
                <span
                  className={`ref-status ${selected.status.toLowerCase().replace(" ", "-")}`}
                >
                  {selected.status}
                </span>
              </p>

            </div>

            <p className="detail-help">
              Demo workflow: update the referral status to test the interface.
            </p>

            {error && (
              <p role="alert" style={{ color: "#be123c", fontSize: "13px" }}>
                {error}
              </p>
            )}

            <div className="detail-actions">

              <button
                onClick={() => changeStatus(selected, "Accepted")}
                className="accept-btn"
                disabled={updating}
              >
                {updating ? "Updating..." : "Accept"}
              </button>

              <button
                onClick={() => changeStatus(selected, "In Review")}
                className="review-btn"
                disabled={updating}
              >
                In Review
              </button>

              <button
                onClick={() => changeStatus(selected, "Rejected")}
                className="reject-btn"
                disabled={updating}
              >
                Reject
              </button>

            </div>

          </section>
        </div>
      )}

    </div>
  );
}
