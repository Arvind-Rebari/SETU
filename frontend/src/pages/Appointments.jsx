
import { useEffect, useState } from "react";
import {
  CalendarDays,
  Plus,
  Search,
  Clock,
  UserRound,
  CheckCircle,
  XCircle,
  RefreshCw
} from "lucide-react";
import "./Appointments.css";

const API = "http://localhost:5000/api";

function Appointments() {
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [clinics, setClinics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    patient_id: "",
    clinic_id: "",
    appointment_date: "",
    appointment_time: "",
    doctor_name: "",
    purpose: "",
    notes: ""
  });

  async function loadData() {
    setLoading(true);
    setError("");

    try {
      const [appointmentRes, patientRes, clinicRes] =
        await Promise.all([
          fetch(`${API}/appointments`),
          fetch(`${API}/patients`),
          fetch(`${API}/clinics`)
        ]);

      if (!appointmentRes.ok || !patientRes.ok || !clinicRes.ok) {
        throw new Error("Unable to load appointment data.");
      }

      const appointmentData = await appointmentRes.json();
      const patientData = await patientRes.json();
      const clinicData = await clinicRes.json();

      setAppointments(appointmentData.data || []);
      setPatients(patientData.patients || []);
      setClinics(clinicData.clinics || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  function handleChange(e) {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    try {
      const response = await fetch(`${API}/appointments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(form)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Unable to create appointment.");
      }

      setShowForm(false);

      setForm({
        patient_id: "",
        clinic_id: "",
        appointment_date: "",
        appointment_time: "",
        doctor_name: "",
        purpose: "",
        notes: ""
      });

      await loadData();
    } catch (err) {
      setError(err.message);
    }
  }

  async function updateStatus(id, status) {
    try {
      const response = await fetch(
        `${API}/appointments/${id}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ status })
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Status update failed.");
      }

      await loadData();
    } catch (err) {
      setError(err.message);
    }
  }

  async function deleteAppointment(id) {
    if (!window.confirm("Delete this appointment?")) return;

    try {
      const response = await fetch(`${API}/appointments/${id}`, {
        method: "DELETE"
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Delete failed.");
      }

      await loadData();
    } catch (err) {
      setError(err.message);
    }
  }

  const filteredAppointments = appointments.filter((item) => {
    const matchesSearch =
      (item.patient_name || "").toLowerCase().includes(search.toLowerCase()) ||
      (item.doctor_name || "").toLowerCase().includes(search.toLowerCase()) ||
      (item.purpose || "").toLowerCase().includes(search.toLowerCase());

    const matchesFilter =
      filter === "All" || item.status === filter;

    return matchesSearch && matchesFilter;
  });

  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="appointments-page">

      <div className="appointments-header">
        <div>
          <h1>Appointments</h1>
          <p>Manage patient appointments and schedules.</p>
        </div>

        <button
          className="appointment-primary-btn"
          onClick={() => setShowForm(!showForm)}
        >
          <Plus size={18} />
          New Appointment
        </button>
      </div>

      {error && (
        <div className="appointment-error">
          {error}
        </div>
      )}

      <div className="appointment-stats">
        <div className="appointment-stat-card">
          <CalendarDays />
          <div>
            <span>Total Appointments</span>
            <h2>{appointments.length}</h2>
          </div>
        </div>

        <div className="appointment-stat-card">
          <Clock />
          <div>
            <span>Scheduled</span>
            <h2>
              {appointments.filter(a => a.status === "Scheduled").length}
            </h2>
          </div>
        </div>

        <div className="appointment-stat-card">
          <CheckCircle />
          <div>
            <span>Completed</span>
            <h2>
              {appointments.filter(a => a.status === "Completed").length}
            </h2>
          </div>
        </div>
      </div>

      {showForm && (
        <form className="appointment-form" onSubmit={handleSubmit}>
          <h2>Book New Appointment</h2>

          <div className="appointment-form-grid">

            <label>
              Patient *
              <select
                name="patient_id"
                value={form.patient_id}
                onChange={handleChange}
                required
              >
                <option value="">Select patient</option>
                {patients.map(patient => (
                  <option key={patient.id} value={patient.id}>
                    {patient.name} ({patient.patient_id})
                  </option>
                ))}
              </select>
            </label>

            <label>
              Clinic
              <select
                name="clinic_id"
                value={form.clinic_id}
                onChange={handleChange}
              >
                <option value="">Select clinic</option>
                {clinics.map(clinic => (
                  <option key={clinic.id} value={clinic.id}>
                    {clinic.name}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Appointment Date *
              <input
                type="date"
                name="appointment_date"
                min={today}
                value={form.appointment_date}
                onChange={handleChange}
                required
              />
            </label>

            <label>
              Appointment Time *
              <input
                type="time"
                name="appointment_time"
                value={form.appointment_time}
                onChange={handleChange}
                required
              />
            </label>

            <label>
              Doctor Name
              <input
                type="text"
                name="doctor_name"
                placeholder="Enter doctor name"
                value={form.doctor_name}
                onChange={handleChange}
              />
            </label>

            <label>
              Purpose *
              <input
                type="text"
                name="purpose"
                placeholder="e.g. General Checkup"
                value={form.purpose}
                onChange={handleChange}
                required
              />
            </label>

            <label className="appointment-full-width">
              Notes
              <textarea
                name="notes"
                placeholder="Additional information..."
                value={form.notes}
                onChange={handleChange}
              />
            </label>

          </div>

          <div className="appointment-form-actions">
            <button type="button" onClick={() => setShowForm(false)}>
              Cancel
            </button>
            <button type="submit" className="appointment-primary-btn">
              Save Appointment
            </button>
          </div>
        </form>
      )}

      <div className="appointment-toolbar">
        <div className="appointment-search">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search patient, doctor or purpose..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        <select value={filter} onChange={e => setFilter(e.target.value)}>
          {["All", "Scheduled", "Confirmed", "Completed", "Cancelled", "No Show"].map(status => (
            <option key={status} value={status}>{status}</option>
          ))}
        </select>

        <button onClick={loadData} className="appointment-refresh-btn">
          <RefreshCw size={17} />
          Refresh
        </button>
      </div>

      <div className="appointment-list">
        <h2>Appointment Schedule</h2>

        {loading ? (
          <p>Loading appointments...</p>
        ) : filteredAppointments.length === 0 ? (
          <div className="appointment-empty">
            <CalendarDays size={40} />
            <h3>No appointments found</h3>
            <p>Create a new appointment to get started.</p>
          </div>
        ) : (
          filteredAppointments.map(item => (
            <div className="appointment-card" key={item.id}>

              <div className="appointment-card-icon">
                <UserRound size={22} />
              </div>

              <div className="appointment-card-details">
                <h3>{item.patient_name}</h3>
                <p>{item.purpose}</p>

                <div className="appointment-meta">
                  <span>
                    <CalendarDays size={14} />
                    {item.appointment_date}
                  </span>
                  <span>
                    <Clock size={14} />
                    {item.appointment_time}
                  </span>
                  <span>{item.doctor_name || "Doctor not assigned"}</span>
                </div>

                <small>
                  {item.clinic_name || "Clinic not selected"}
                </small>
              </div>

              <div className="appointment-card-actions">
                <span className={`appointment-status ${item.status.toLowerCase().replaceAll(" ", "-")}`}>
                  {item.status}
                </span>

                <select
                  value={item.status}
                  onChange={e => updateStatus(item.id, e.target.value)}
                >
                  {["Scheduled", "Confirmed", "Completed", "Cancelled", "No Show"].map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>

                <button
                  className="appointment-delete-btn"
                  onClick={() => deleteAppointment(item.id)}
                  title="Delete appointment"
                >
                  <XCircle size={18} />
                </button>
              </div>

            </div>
          ))
        )}
      </div>

    </div>
  );
}

export default Appointments;
