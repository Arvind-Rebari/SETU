
import { useState } from "react";
import {
  Activity, Bell, CalendarDays, CheckCircle2, ChevronDown,
  ChevronRight, ClipboardList, Clock3, FileText, HeartPulse,
  LayoutDashboard, Menu, MessageCircle, Plus, Search, Settings,
  ShieldCheck, Users, X, ArrowUpRight, Stethoscope, AlertCircle,
  MoreHorizontal
} from "lucide-react";

import Referrals from "./pages/Referrals";
import Patients from "./pages/Patients";
import "./index.css";

export default function App() {
  const [activePage, setActivePage] = useState("Dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigation = [
    { name: "Dashboard", icon: LayoutDashboard },
    { name: "Referrals", icon: ClipboardList },
    { name: "Patients", icon: Users },
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
        <div className="mobile-overlay" onClick={() => setSidebarOpen(false)} />
      )}

      <aside className={`sidebar ${sidebarOpen ? "sidebar-open" : ""}`}>
        <div className="brand">
          <div className="brand-icon"><HeartPulse size={27} /></div>
          <div>
            <h1>SETU</h1>
            <p>CONNECTED CARE</p>
          </div>
          <button className="close-sidebar" onClick={() => setSidebarOpen(false)}>
            <X size={19} />
          </button>
        </div>

        <div className="clinic-switcher">
          <div className="clinic-icon"><Stethoscope size={21} /></div>
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
            <p>We're here to make healthcare connections easier.</p>
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
            <button className="menu-toggle" onClick={() => setSidebarOpen(true)}>
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
            <button className="notification-btn" onClick={() => alert("No new notifications.")}>
              <Bell size={19} />
            </button>
            <div className="topbar-profile">PP</div>
          </div>
        </header>

        <div className="page-content">
          {activePage === "Dashboard" && <Dashboard onNavigate={navigate} />}
          {activePage === "Referrals" && <Referrals />}
          {activePage === "Patients" && <Patients />}

          {!["Dashboard", "Referrals", "Patients"].includes(activePage) && (
            <ComingSoon page={activePage} />
          )}
        </div>
      </main>
    </div>
  );
}

function Dashboard({ onNavigate }) {
  const stats = [
    { title: "Total Referrals", value: "128", note: "Clinic referral records", icon: ClipboardList, color: "blue" },
    { title: "Pending Review", value: "12", note: "Needs attention", icon: Clock3, color: "orange" },
    { title: "Accepted Referrals", value: "94", note: "Successfully accepted", icon: CheckCircle2, color: "green" },
    { title: "Urgent Referrals", value: "03", note: "Priority required", icon: AlertCircle, color: "red" }
  ];

  const records = [
    { name: "Ananya Sharma", id: "SETU-1024", reason: "Cardiology consultation", status: "Received", priority: "Normal" },
    { name: "Rahul Mehta", id: "SETU-1025", reason: "Orthopaedic referral", status: "Pending", priority: "Urgent" },
    { name: "Priya Nair", id: "SETU-1026", reason: "General medicine", status: "Accepted", priority: "Normal" }
  ];

  return (
    <>
      <section className="welcome-banner">
        <div className="welcome-content">
          <span className="welcome-label">YOUR HEALTHCARE WORKSPACE</span>
          <h1>Welcome back, Dr. Priya!</h1>
          <p>Manage patient referrals, coordinate with healthcare providers and keep every patient journey connected.</p>
          <button onClick={() => onNavigate("Referrals")}>Explore Referrals <ArrowUpRight size={15} /></button>
        </div>
        <div className="welcome-art"><HeartPulse size={85} /></div>
      </section>

      <div className="dashboard-heading">
        <div>
          <span className="section-eyebrow">OVERVIEW</span>
          <h2>Your Overview</h2>
          <p>A quick look at clinic activity.</p>
        </div>
        <span className="date-filter"><CalendarDays size={16} /> Today</span>
      </div>

      <section className="stats-grid">
        {stats.map(({ title, value, note, icon: Icon, color }) => (
          <div className="stat-card" key={title}>
            <div className={`stat-icon ${color}`}><Icon size={22} /></div>
            <div>
              <h3>{title}</h3>
              <strong>{value}</strong>
              <p>{note}</p>
            </div>
          </div>
        ))}
      </section>

      <section className="content-grid">
        <div className="panel recent-panel">
          <div className="panel-heading">
            <div><h3>Recent Referrals</h3><p>Latest patient handovers.</p></div>
            <button className="text-action" onClick={() => onNavigate("Referrals")}>View all <ArrowUpRight size={14} /></button>
          </div>
          <div className="dashboard-table-scroll">
            <table className="referral-table">
              <thead><tr><th>PATIENT</th><th>REFERRAL REASON</th><th>STATUS</th><th>PRIORITY</th></tr></thead>
              <tbody>
                {records.map((r) => (
                  <tr key={r.id}>
                    <td><strong>{r.name}</strong><span className="table-subtext">{r.id}</span></td>
                    <td>{r.reason}</td>
                    <td><span className={`status-badge ${r.status === "Pending" ? "pending" : "success"}`}>{r.status}</span></td>
                    <td><span className={`priority ${r.priority === "Urgent" ? "high" : "normal"}`}>{r.priority}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="panel activity-panel">
          <div className="panel-heading"><div><h3>Weekly Activity</h3><p>Sample referral activity.</p></div></div>
          <div className="activity-highlight"><strong>36</strong><span>Referrals this week</span></div>
          <div className="weekly-chart">
            {[55, 75, 45, 90, 65, 35, 50].map((height, i) => (
              <div className="chart-column" key={i}>
                <div className="chart-track"><div className="chart-bar" style={{ height: `${height}%` }} /></div>
                <span>{"MTWTFSS"[i]}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="panel quick-panel">
        <div className="panel-heading"><div><h3>Quick Actions</h3><p>Frequently used tools.</p></div></div>
        <div className="quick-actions">
          <button onClick={() => onNavigate("Referrals")}><Plus size={18} /> New Referral</button>
          <button onClick={() => onNavigate("Patients")}><Users size={18} /> View Patients</button>
          <button onClick={() => onNavigate("Appointments")}><CalendarDays size={18} /> Appointments</button>
          <button onClick={() => onNavigate("AI Assistant")}><Activity size={18} /> AI Assistant</button>
        </div>
      </section>

      <p className="demo-disclaimer"><ShieldCheck size={16} /> SETU prototype · Fictional sample data only.</p>
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
      <div className="coming-icon"><Icon size={35} /></div>
      <span className="section-eyebrow">SETU WORKSPACE</span>
      <h2>{page}</h2>
      <p>This module is planned for an upcoming SETU update.</p>
      <span className="coming-badge">Coming soon</span>
    </div>
  );
}
