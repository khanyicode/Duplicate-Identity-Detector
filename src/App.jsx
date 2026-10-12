import React, { useEffect, useMemo, useState } from "react";
import {
  Activity, AlertTriangle, ArrowDownUp, ArrowRight, BadgeCheck, Bell,
  ChevronDown, CircleHelp, Clock3, FileSearch, Filter, Fingerprint,
  LayoutDashboard, Menu, Plus, RefreshCw, Search, ShieldCheck, Users,
  X,
} from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";
const STATUSES = {
  pending: "Awaiting review",
  confirmed_duplicate: "Confirmed duplicate",
  legitimate_separate: "Legitimate customers",
  needs_investigation: "Needs investigation",
};
const ATTRIBUTES = [
  ["first_name", "First name"],
  ["last_name", "Last name"],
  ["date_of_birth", "Date of birth"],
  ["identity_number", "Identity number"],
  ["phone", "Phone"],
  ["email", "Email"],
];

async function api(path, options) {
  const response = await fetch(`${API_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.detail || `Request failed (${response.status})`);
  }
  return response.json();
}

function formatDate(value) {
  return new Intl.DateTimeFormat("en", { day: "numeric", month: "short", year: "numeric" }).format(new Date(value));
}

function App() {
  const [dashboard, setDashboard] = useState(null);
  const [cases, setCases] = useState([]);
  const [profiles, setProfiles] = useState([]);
  const [activeCase, setActiveCase] = useState(null);
  const [filter, setFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [view, setView] = useState("cases");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showAddProfile, setShowAddProfile] = useState(false);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");

  async function loadData() {
    setError("");
    try {
      const [summary, matchCases, customerProfiles] = await Promise.all([
        api("/api/dashboard"),
        api("/api/cases"),
        api("/api/profiles"),
      ]);
      setDashboard(summary);
      setCases(matchCases);
      setProfiles(customerProfiles);
      setActiveCase((current) => current ? matchCases.find((item) => item.id === current.id) || null : null);
    } catch (err) {
      setError(`${err.message}. Start the API with the instructions in Readme.md.`);
    }
  }

  useEffect(() => { loadData(); }, []);

  const filteredCases = useMemo(() => cases.filter((item) => {
    const matchesStatus = filter === "all" || item.status === filter;
    const name = `${item.profile_a?.first_name} ${item.profile_a?.last_name} ${item.profile_b?.first_name} ${item.profile_b?.last_name}`.toLowerCase();
    return matchesStatus && name.includes(query.toLowerCase());
  }), [cases, filter, query]);

  async function runScan() {
    setBusy(true);
    try {
      const result = await api("/api/scan", { method: "POST" });
      await loadData();
      setToast(`${result.new_cases} new case${result.new_cases === 1 ? "" : "s"} found`);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function submitReview(status) {
    if (!activeCase) return;
    setBusy(true);
    try {
      await api(`/api/cases/${activeCase.id}/review`, {
        method: "PATCH",
        body: JSON.stringify({ status, note }),
      });
      setNote("");
      await loadData();
      setToast("Review decision recorded");
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function addProfile(event) {
    event.preventDefault();
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const profile = Object.fromEntries(form.entries());
    Object.keys(profile).forEach((key) => { if (!profile[key]) profile[key] = null; });
    setBusy(true);
    try {
      await api("/api/profiles", { method: "POST", body: JSON.stringify(profile) });
      setShowAddProfile(false);
      formElement.reset();
      await loadData();
      setToast("Profile added and scanned for potential matches");
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    if (!toast) return undefined;
    const timer = setTimeout(() => setToast(""), 3200);
    return () => clearTimeout(timer);
  }, [toast]);

  return (
    <div className="app-shell">
      {sidebarOpen && <button className="sidebar-backdrop" onClick={() => setSidebarOpen(false)} aria-label="Close navigation" />}
      <aside className={`sidebar ${sidebarOpen ? "sidebar-open" : ""}`}>
        <a className="brand" href="#" onClick={() => { setView("cases"); setSidebarOpen(false); }}>
          <span className="brand-icon"><Fingerprint size={22} /></span>
          <span><strong>identity<span>guard</span></strong><small>RISK & COMPLIANCE</small></span>
        </a>
        <div className="workspace-label">WORKSPACE</div>
        <button className={`nav-item ${view === "overview" ? "active" : ""}`} onClick={() => { setView("overview"); setSidebarOpen(false); }}>
          <LayoutDashboard size={18} /> Overview
        </button>
        <button className={`nav-item ${view === "cases" ? "active" : ""}`} onClick={() => { setView("cases"); setSidebarOpen(false); }}>
          <FileSearch size={18} /> Match cases
          <span className="nav-count">{cases.filter((item) => item.status === "pending").length}</span>
        </button>
        <button className={`nav-item ${view === "profiles" ? "active" : ""}`} onClick={() => { setView("profiles"); setSidebarOpen(false); }}>
          <Users size={18} /> Customer profiles
        </button>
        <div className="sidebar-bottom">
          <div className="secure-card"><ShieldCheck size={17} /><span><b>Secure workspace</b><small>Demo environment</small></span></div>
          <button className="nav-item"><CircleHelp size={18} /> Help & guidance</button>
          <div className="user-profile"><div className="avatar">JD</div><span><b>Jordan Davis</b><small>Compliance analyst</small></span><ChevronDown size={16} /></div>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div className="breadcrumbs"><span>Workspace</span><span className="crumb-slash">/</span><b>{view === "cases" ? "Match cases" : view === "profiles" ? "Customer profiles" : "Overview"}</b></div>
          <div className="topbar-actions"><span className="environment"><i /> Demo environment</span><button className="icon-button" aria-label="Notifications"><Bell size={18} /><i /></button><div className="top-avatar">JD</div></div>
        </header>

        <div className="page-content">
          <section className="page-heading">
            <div><div className="eyebrow"><span className="eyebrow-dot" /> KYC INTELLIGENCE</div><h1>{view === "cases" ? "Identity match cases" : view === "profiles" ? "Customer profiles" : "Overview"}</h1><p>Review potential identity matches and make informed decisions.</p></div>
            <div className="heading-actions"><button className="button button-secondary" onClick={runScan} disabled={busy}><RefreshCw size={16} className={busy ? "spin" : ""} /> Run scan</button><button className="button button-primary" onClick={() => setShowAddProfile(true)}><Plus size={17} /> Add profile</button></div>
          </section>

          {error && <div className="alert error-alert"><AlertTriangle size={18} /><span>{error}</span><button onClick={() => setError("")} aria-label="Dismiss"><X size={16} /></button></div>}

          {dashboard && <section className="stats-grid" aria-label="Detection summary">
            <StatCard icon={<Users size={18} />} label="Profiles scanned" value={dashboard.total_profiles} caption="Across all customer records" />
            <StatCard icon={<Fingerprint size={18} />} label="Potential matches" value={dashboard.potential_matches} caption="Flagged for human review" tone="blue" />
            <StatCard icon={<AlertTriangle size={18} />} label="High priority" value={dashboard.high_priority_pending} caption="Awaiting review" tone="amber" />
            <StatCard icon={<BadgeCheck size={18} />} label="Confirmed duplicates" value={dashboard.confirmed_duplicates} caption={`${dashboard.false_positives} false positives identified`} tone="green" />
          </section>}

          {view === "profiles" ? <section className="cases-panel">
            <div className="panel-heading"><div><h2>Customer records</h2><p>Profiles stored in the local demo database.</p></div><span className="profile-count">{profiles.length} profiles</span></div>
            <div className="table-toolbar"><div className="search-box"><Search size={16} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search customer name..." /></div></div>
            <div className="table-wrap"><table><thead><tr><th>CUSTOMER</th><th>DATE OF BIRTH</th><th>PHONE</th><th>EMAIL</th><th>ADDED</th></tr></thead><tbody>
              {profiles.filter((profile) => `${profile.first_name} ${profile.last_name}`.toLowerCase().includes(query.toLowerCase())).map((profile) => <tr key={profile.id}>
                <td><div className="customer-pair"><div className="pair-avatars"><span>{initials(profile)}</span></div><div><b>{profile.first_name} {profile.last_name}</b><small>{profile.id}</small></div></div></td>
                <td>{profile.date_of_birth || "Not provided"}</td><td>{profile.phone || "Not provided"}</td><td>{profile.email || "Not provided"}</td><td className="date-cell">{formatDate(profile.created_at)}</td>
              </tr>)}
              {profiles.filter((profile) => `${profile.first_name} ${profile.last_name}`.toLowerCase().includes(query.toLowerCase())).length === 0 && <tr><td colSpan="5" className="empty-state"><Users size={26} /><b>No profiles found</b><span>Try a different search or add a profile.</span></td></tr>}
            </tbody></table></div>
            <footer className="table-footer"><span>Showing <b>{profiles.filter((profile) => `${profile.first_name} ${profile.last_name}`.toLowerCase().includes(query.toLowerCase())).length}</b> of <b>{profiles.length}</b> profiles</span><span><ShieldCheck size={14} /> Synthetic demo records</span></footer>
          </section> : <>
          <section className="cases-panel">
            <div className="panel-heading">
              <div><h2>{view === "profiles" ? "Recent match cases" : "Potential matches"}</h2><p>Rule-based matching with transparent evidence for every case.</p></div>
              <button className="text-button" onClick={loadData}>View all cases <ArrowRight size={15} /></button>
            </div>
            <div className="table-toolbar">
              <div className="search-box"><Search size={16} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search customer name..." /></div>
              <div className="toolbar-right"><div className="filter-control"><Filter size={15} /><select value={filter} onChange={(event) => setFilter(event.target.value)} aria-label="Filter cases by status"><option value="all">All cases</option><option value="pending">Awaiting review</option><option value="confirmed_duplicate">Confirmed duplicate</option><option value="legitimate_separate">Legitimate customers</option><option value="needs_investigation">Needs investigation</option></select><ChevronDown size={14} /></div><button className="icon-button sort-button" aria-label="Sort cases"><ArrowDownUp size={16} /></button></div>
            </div>
            <div className="table-wrap">
              <table><thead><tr><th>CUSTOMER PROFILES</th><th>MATCH SCORE</th><th>PRIORITY</th><th>KEY EVIDENCE</th><th>STATUS</th><th>LAST UPDATED</th><th /></tr></thead>
                <tbody>{filteredCases.map((item) => <tr key={item.id} onClick={() => { setActiveCase(item); setNote(""); }}>
                  <td><div className="customer-pair"><div className="pair-avatars"><span>{initials(item.profile_a)}</span><span>{initials(item.profile_b)}</span></div><div><b>{item.profile_a.first_name} {item.profile_a.last_name}</b><small>{item.profile_b.first_name} {item.profile_b.last_name}</small></div></div></td>
                  <td><div className="score-cell"><b>{item.score}%</b><div className="score-track"><i style={{ width: `${item.score}%` }} /></div></div></td>
                  <td><span className={`priority priority-${item.priority}`}><i />{capitalize(item.priority)}</span></td>
                  <td><div className="evidence-tags">{item.matching_attributes.slice(0, 2).map((attr) => <span key={attr}>{label(attr)}</span>)}{item.conflicting_attributes.length > 0 && <span className="conflict-tag">+{item.conflicting_attributes.length} conflict{item.conflicting_attributes.length === 1 ? "" : "s"}</span>}</div></td>
                  <td><span className={`status status-${item.status}`}>{item.status === "pending" && <i />}{STATUSES[item.status]}</span></td>
                  <td className="date-cell">{formatDate(item.updated_at)}</td>
                  <td><button className="row-arrow" aria-label="Open case"><ArrowRight size={17} /></button></td>
                </tr>)}
                {filteredCases.length === 0 && <tr><td colSpan="7" className="empty-state"><FileSearch size={26} /><b>No matching cases</b><span>Try changing your search or status filter.</span></td></tr>}
                </tbody>
              </table>
            </div>
            <footer className="table-footer"><span>Showing <b>{filteredCases.length}</b> of <b>{cases.length}</b> cases</span><span><Activity size={14} /> Matching engine active</span></footer>
          </section>

          {dashboard?.recent_reviews?.length > 0 && <section className="activity-panel"><div className="panel-heading"><div><h2>Recent review activity</h2><p>Latest decisions recorded by your team.</p></div><Clock3 size={18} className="muted-icon" /></div><div className="activity-list">{dashboard.recent_reviews.slice(0, 3).map((review) => <div className="activity-item" key={review.id}><div className="activity-marker"><BadgeCheck size={15} /></div><div><b>{review.a_first_name} {review.a_last_name} <span>&</span> {review.b_first_name} {review.b_last_name}</b><p>Marked as {STATUSES[review.status]?.toLowerCase()}{review.note ? ` · “${review.note}”` : ""}</p></div><time>{formatDate(review.reviewed_at)}</time></div>)}</div></section>}
          </>}
        </div>
      </main>

      {activeCase && <div className="overlay" onMouseDown={(event) => { if (event.target === event.currentTarget) setActiveCase(null); }}><aside className="case-drawer">
        <div className="drawer-header"><div><span className="eyebrow">CASE REVIEW</span><h2>Potential identity match</h2></div><button className="icon-button" onClick={() => setActiveCase(null)} aria-label="Close case"><X size={19} /></button></div>
        <div className="drawer-score"><span>Match score</span><strong>{activeCase.score}%</strong><span className={`priority priority-${activeCase.priority}`}><i />{capitalize(activeCase.priority)} priority</span></div>
        <div className="drawer-section"><h3>Profile comparison</h3><div className="comparison-table"><div className="compare-header"><span>ATTRIBUTE</span><span>{activeCase.profile_a.first_name} {activeCase.profile_a.last_name}</span><span>{activeCase.profile_b.first_name} {activeCase.profile_b.last_name}</span></div>{ATTRIBUTES.map(([key, title]) => {
          const matching = activeCase.matching_attributes.includes(key);
          const conflicting = activeCase.conflicting_attributes.includes(key);
          return <div className={`compare-row ${matching ? "is-match" : ""} ${conflicting ? "is-conflict" : ""}`} key={key}><b>{title}</b><span>{activeCase.profile_a[key] || "Not provided"}</span><span>{activeCase.profile_b[key] || "Not provided"}</span></div>;
        })}</div></div>
        <div className="drawer-section"><h3>Why this case was flagged</h3><ul className="reason-list">{activeCase.reasons.map((reason) => <li key={reason}><span className="reason-check"><ShieldCheck size={14} /></span>{reason}</li>)}</ul><div className="recommendation"><b>Suggested next step</b><p>{activeCase.recommendation}</p></div></div>
        <div className="drawer-section"><label className="note-label" htmlFor="review-note">Review note <span>Optional</span></label><textarea id="review-note" value={note} onChange={(event) => setNote(event.target.value)} maxLength={2000} placeholder="Add context for your decision..." /></div>
        <div className="drawer-actions"><button className="button button-secondary full-button" onClick={() => submitReview("needs_investigation")} disabled={busy}>Request investigation</button><div className="decision-buttons"><button className="button button-outline" onClick={() => submitReview("legitimate_separate")} disabled={busy}>Not a duplicate</button><button className="button button-primary" onClick={() => submitReview("confirmed_duplicate")} disabled={busy}><BadgeCheck size={16} /> Confirm match</button></div><p>Decisions are recorded in the case review history.</p></div>
      </aside></div>}

      {showAddProfile && <div className="overlay modal-overlay" onMouseDown={(event) => { if (event.target === event.currentTarget) setShowAddProfile(false); }}><form className="profile-modal" onSubmit={addProfile}>
        <div className="drawer-header"><div><span className="eyebrow">CUSTOMER RECORD</span><h2>Add a profile</h2></div><button type="button" className="icon-button" onClick={() => setShowAddProfile(false)} aria-label="Close form"><X size={19} /></button></div>
        <p className="modal-intro">Add a customer profile to compare it against existing records. Optional fields can be left blank.</p>
        <div className="form-grid">{ATTRIBUTES.map(([key, title]) => <label className={key === "identity_number" || key === "email" ? "wide-field" : ""} key={key}>{title}{(key === "first_name" || key === "last_name") && <em>*</em>}<input name={key} required={key === "first_name" || key === "last_name"} type={key === "date_of_birth" ? "date" : key === "email" ? "email" : "text"} maxLength={key === "first_name" || key === "last_name" ? 100 : undefined} placeholder={key === "identity_number" ? "Use a synthetic ID for demo data" : `Enter ${title.toLowerCase()}`} /></label>)}</div>
        <p className="privacy-note"><ShieldCheck size={15} /> Demo only: use synthetic customer data, never real identity records.</p>
        <div className="modal-actions"><button type="button" className="button button-secondary" onClick={() => setShowAddProfile(false)}>Cancel</button><button className="button button-primary" disabled={busy}><Plus size={16} /> Add and scan</button></div>
      </form></div>}
      {toast && <div className="toast"><BadgeCheck size={17} />{toast}</div>}
      <button className="mobile-menu" aria-label={sidebarOpen ? "Close navigation" : "Open navigation"} aria-expanded={sidebarOpen} onClick={() => setSidebarOpen((open) => !open)}><Menu size={20} /></button>
    </div>
  );
}

function StatCard({ icon, label: title, value, caption, tone = "slate" }) {
  return <article className="stat-card"><div className={`stat-icon tone-${tone}`}>{icon}</div><div className="stat-copy"><span>{title}</span><strong>{value ?? "—"}</strong><small>{caption}</small></div></article>;
}
function initials(profile) { return `${profile?.first_name?.[0] || ""}${profile?.last_name?.[0] || ""}`.toUpperCase(); }
function label(value) { return value.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase()); }
function capitalize(value) { return value[0].toUpperCase() + value.slice(1); }

export default App;
