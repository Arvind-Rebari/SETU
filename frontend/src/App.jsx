
import { useEffect, useState } from "react";
import {
  Activity, Bell, CalendarDays, CheckCircle2, ChevronDown,
  ChevronRight, ClipboardList, Clock3, FileText, HeartPulse,
  LayoutDashboard, Menu, MessageCircle, Plus, Search, Settings,
  ShieldCheck, Users, X, ArrowUpRight, Stethoscope, AlertCircle,
  MoreHorizontal, MapPin
} from "lucide-react";

import Referrals from "./pages/Referrals";
import Patients from "./pages/Patients";
import NearbyClinics from "./pages/NearbyClinics";
import Appointments from "./pages/Appointments";
import Messages from "./pages/Messages";
import AIAssistant from "./pages/AIAssistant";
import "./index.css";

const PATIENTS_API = "http://localhost:5000/api/patients";
const REFERRALS_API = "http://localhost:5000/api/referrals";

export default function App() {
  const [activePage, setActivePage] = useState("Dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigation = [
    { name: "Dashboard", icon: LayoutDashboard },
    { name: "Referrals", icon: ClipboardList },
    { name: "Patients", icon: Users },
    { name: "Nearby Clinics", icon: MapPin },
    { name: "Appointments", icon: CalendarDays },
    { name: "Messages", icon: MessageCircle },
    { name: "AI Assistant", icon: Activity },
    { name: "Analytics", icon: FileText },
    { name: "Settings", icon: Settings }
  ];

  function navigate(page) {
    setActivePage(page);
    setSidebarOpen(false);
  }

  return (
    <div className="app-shell">
      {sidebarOpen && (
        <div
          className="mobile-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside className={`sidebar ${sidebarOpen ? "sidebar-open" : ""}`}>
        <div className="brand">
          <div className="brand-icon">
            <HeartPulse size={27} />
          </div>

          <div>
            <h1>SETU</h1>
            <p>CONNECTED CARE</p>
          </div>

          <button
            className="close-sidebar"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={19} />
          </button>
        </div>

        <div className="clinic-switcher">
          <div className="clinic-icon">
            <Stethoscope size={21} />
          </div>

          <div>
            <strong>Sunrise Clinic</strong>
            <span>Healthcare Provider</span>
          </div>

          <ChevronDown size={16} />
        </div>

        <nav className="navigation">
          <p>MAIN MENU</p>

          {navigation.map(({ name, icon: Icon }) => (
            <button
              key={name}
              className={`nav-item ${activePage === name ? "active" : ""}`}
              onClick={() => navigate(name)}
            >
              <Icon size={18} />
              <span>{name}</span>
            </button>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="help-card">
            <HeartPulse size={22} />
            <h4>Need a little help?</h4>
            <p>
              We're here to make healthcare connections easier.
            </p>

            <button onClick={() => alert("Help Centre coming soon.")}>
              Visit Help Centre <ArrowUpRight size={14} />
            </button>
          </div>

          <div className="profile-card">
            <div className="profile-avatar">PP</div>

            <div>
              <strong>Dr. Priya Patel</strong>
              <span>Clinic Administrator</span>
            </div>

            <MoreHorizontal size={19} />
          </div>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div className="topbar-left">
            <button
              className="menu-toggle"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu size={22} />
            </button>

            <div className="breadcrumb">
              <span>Workspace</span>
              <ChevronRight size={14} />
              <strong>{activePage}</strong>
            </div>
          </div>

          <div className="topbar-right">
            <div className="global-search">
              <Search size={17} />
              <input placeholder="Search patients, referrals..." />
            </div>

            <button
              className="notification-btn"
              onClick={() => alert("No new notifications.")}
            >
              <Bell size={19} />
            </button>

            <div className="topbar-profile">PP</div>
          </div>
        </header>

        <div className="page-content">
          {activePage === "Dashboard" && (
            <Dashboard onNavigate={navigate} />
          )}

          {activePage === "Referrals" && <Referrals />}

          {activePage === "Patients" && <Patients />}

          {activePage === "Nearby Clinics" && <NearbyClinics />}

          {activePage === "Appointments" && <Appointments />}

          {activePage === "Messages" && <Messages />}

          {activePage === "AI Assistant" && <AIAssistant />}

          {![
            "Dashboard",
            "Referrals",
            "Patients",
            "Nearby Clinics",
            "Appointments",
            "Messages",
            "AI Assistant"
          ].includes(activePage) && (
            <ComingSoon page={activePage} />
          )}
        </div>
      </main>
    </div>
  );
}

function Dashboard({ onNavigate }) {
  const [patients, setPatients] = useState([]);
  const [referrals, setReferrals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadDashboardData() {
      try {
        setLoading(true);
        setError("");

        const [patientsResponse, referralsResponse] = await Promise.all([
          fetch(PATIENTS_API),
          fetch(REFERRALS_API)
        ]);

        if (!patientsResponse.ok || !referralsResponse.ok) {
          throw new Error("Unable to load dashboard data.");
        }

        const patientsData = await patientsResponse.json();
        const referralsData = await referralsResponse.json();

        setPatients(patientsData.patients || []);
        setReferrals(referralsData.referrals || []);
      } catch (err) {
        console.error("Dashboard loading error:", err);
        setError(
          "Could not connect to the SETU database. Please check that the backend is running."
        );
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, []);

  const getStatus = (status) =>
    (status || "").trim().toLowerCase();

  const pendingCount = referrals.filter((r) =>
    ["pending", "received", "in review"].includes(getStatus(r.status))
  ).length;

  const acceptedCount = referrals.filter(
    (r) => getStatus(r.status) === "accepted"
  ).length;

  const rejectedCount = referrals.filter(
    (r) => getStatus(r.status) === "rejected"
  ).length;

  const urgentCount = referrals.filter(
    (r) => getStatus(r.priority) === "urgent"
  ).length;

  const recentReferrals = [...referrals]
    .sort((a, b) => {
      const dateA = new Date(
        a.created_at || a.referral_date || 0
      ).getTime();

      const dateB = new Date(
        b.created_at || b.referral_date || 0
      ).getTime();

      return dateB - dateA;
    })
    .slice(0, 3);

  const stats = [
    {
      title: "Registered Patients",
      value: patients.length,
      note: "Total patient records",
      icon: Users,
      color: "blue"
    },
    {
      title: "Total Referrals",
      value: referrals.length,
      note: "Clinic referral records",
      icon: ClipboardList,
      color: "blue"
    },
    {
      title: "Pending Review",
      value: pendingCount,
      note: "Needs attention",
      icon: Clock3,
      color: "orange"
    },
    {
      title: "Accepted Referrals",
      value: acceptedCount,
      note: "Successfully accepted",
      icon: CheckCircle2,
      color: "green"
    },
    {
      title: "Urgent Referrals",
      value: urgentCount,
      note: "Priority required",
      icon: AlertCircle,
      color: "red"
    }
  ];

  return (
    <>
      <section className="welcome-banner">
        <div className="welcome-content">
          <span className="welcome-label">
            YOUR HEALTHCARE WORKSPACE
          </span>

          <h1>Welcome back, Dr. Priya!</h1>

          <p>
            Manage patient referrals, coordinate with healthcare providers
            and keep every patient journey connected.
          </p>

          <button onClick={() => onNavigate("Referrals")}>
            Explore Referrals <ArrowUpRight size={15} />
          </button>
        </div>

        <div className="welcome-art">
          <HeartPulse size={85} />
        </div>
      </section>

      <div className="dashboard-heading">
        <div>
          <span className="section-eyebrow">OVERVIEW</span>
          <h2>Your Overview</h2>
          <p>Live statistics from your SETU database.</p>
        </div>

        <span className="date-filter">
          <CalendarDays size={16} /> Live Data
        </span>
      </div>

      {error && (
        <div
          className="panel"
          style={{ padding: "16px", marginBottom: "20px" }}
        >
          <p style={{ color: "#b42318" }}>{error}</p>
        </div>
      )}

      <section className="stats-grid">
        {stats.map(({ title, value, note, icon: Icon, color }) => (
          <div className="stat-card" key={title}>
            <div className={`stat-icon ${color}`}>
              <Icon size={22} />
            </div>

            <div>
              <h3>{title}</h3>
              <strong>{loading ? "..." : value}</strong>
              <p>{note}</p>
            </div>
          </div>
        ))}
      </section>

      <section className="content-grid">
        <div className="panel recent-panel">
          <div className="panel-heading">
            <div>
              <h3>Recent Referrals</h3>
              <p>Latest patient handovers from the database.</p>
            </div>

            <button
              className="text-action"
              onClick={() => onNavigate("Referrals")}
            >
              View all <ArrowUpRight size={14} />
            </button>
          </div>

          <div className="dashboard-table-scroll">
            <table className="referral-table">
              <thead>
                <tr>
                  <th>PATIENT</th>
                  <th>REFERRAL REASON</th>
                  <th>STATUS</th>
                  <th>PRIORITY</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="4">Loading referrals...</td>
                  </tr>
                ) : recentReferrals.length === 0 ? (
                  <tr>
                    <td colSpan="4">
                      No referrals found. Create your first referral!
                    </td>
                  </tr>
                ) : (
                  recentReferrals.map((r) => {
                    const status = r.status || "Pending";
                    const priority = r.priority || "Normal";

                    return (
                      <tr key={r.id || r.referral_id}>
                        <td>
                          <strong>
                            {r.patient_name || "Unknown Patient"}
                          </strong>
                          <span className="table-subtext">
                            {r.referral_id}
                          </span>
                        </td>

                        <td>{r.reason || "Not specified"}</td>

                        <td>
                          <span
                            className={`status-badge ${
                              [
                                "pending",
                                "received",
                                "in review"
                              ].includes(getStatus(status))
                                ? "pending"
                                : getStatus(status) === "rejected"
                                ? "rejected"
                                : "success"
                            }`}
                          >
                            {status}
                          </span>
                        </td>

                        <td>
                          <span
                            className={`priority ${
                              getStatus(priority) === "urgent"
                                ? "high"
                                : "normal"
                            }`}
                          >
                            {priority}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="panel activity-panel">
          <div className="panel-heading">
            <div>
              <h3>Referral Overview</h3>
              <p>Current database status.</p>
            </div>
          </div>

          <div className="activity-highlight">
            <strong>{loading ? "..." : referrals.length}</strong>
            <span>Total referrals</span>
          </div>

          <div
            style={{
              display: "grid",
              gap: "14px",
              marginTop: "20px"
            }}
          >
            <div>
              <span
                style={{
                  display: "flex",
                  justifyContent: "space-between"
                }}
              >
                <span>Pending / In Review</span>
                <strong>{loading ? "..." : pendingCount}</strong>
              </span>
            </div>

            <div>
              <span
                style={{
                  display: "flex",
                  justifyContent: "space-between"
                }}
              >
                <span>Accepted</span>
                <strong>{loading ? "..." : acceptedCount}</strong>
              </span>
            </div>

            <div>
              <span
                style={{
                  display: "flex",
                  justifyContent: "space-between"
                }}
              >
                <span>Rejected</span>
                <strong>{loading ? "..." : rejectedCount}</strong>
              </span>
            </div>

            <div>
              <span
                style={{
                  display: "flex",
                  justifyContent: "space-between"
                }}
              >
                <span>Urgent</span>
                <strong>{loading ? "..." : urgentCount}</strong>
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="panel quick-panel">
        <div className="panel-heading">
          <div>
            <h3>Quick Actions</h3>
            <p>Frequently used tools.</p>
          </div>
        </div>

        <div className="quick-actions">
          <button onClick={() => onNavigate("Referrals")}>
            <Plus size={18} /> New Referral
          </button>

          <button onClick={() => onNavigate("Patients")}>
            <Users size={18} /> View Patients
          </button>

          <button onClick={() => onNavigate("Appointments")}>
            <CalendarDays size={18} /> Appointments
          </button>

          <button onClick={() => onNavigate("AI Assistant")}>
            <Activity size={18} /> AI Assistant
          </button>

          <button onClick={() => onNavigate("Nearby Clinics")}>
            <MapPin size={18} /> Nearby Clinics
          </button>
        </div>
      </section>

      <p className="demo-disclaimer">
        <ShieldCheck size={16} /> SETU prototype · Use fictional sample data only.
      </p>
    </>
  );
}

function ComingSoon({ page }) {
  const icons = {
    Appointments: CalendarDays,
    Messages: MessageCircle,
    "AI Assistant": Activity,
    Analytics: FileText,
    Settings
  };

  const Icon = icons[page] || HeartPulse;

  return (
    <div className="coming-soon">
      <div className="coming-icon">
        <Icon size={35} />
      </div>

      <span className="section-eyebrow">SETU WORKSPACE</span>
      <h2>{page}</h2>

      <p>This module is planned for an upcoming SETU update.</p>

      <span className="coming-badge">Coming soon</span>
    </div>
  );
}
