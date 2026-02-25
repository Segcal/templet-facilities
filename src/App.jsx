import { useEffect, useState } from "react";
import axios from "axios";

const coordinateRegex = /^-?\d{1,2}\.\d+,-?\d{1,3}\.\d+$/;

const emptyForm = {
  type: "",
  facilityName: "",
  coordinates: "",
  governmentDonation: false,
  privateOwnerDonation: "",
  dateEstablished: "",
  area: "",
};

/* ─── tiny icon helpers ─────────────────────────────────────────── */
const PlusIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
);
const XIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);
const SearchIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
);
const LocationIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
  </svg>
);

/* ─── Field wrapper ─────────────────────────────────────────────── */
const Field = ({ label, children, span }) => (
  <div style={{ gridColumn: span === 2 ? "1 / -1" : undefined }}>
    <label style={{
      display: "block", marginBottom: 6,
      fontSize: 11, fontWeight: 600, letterSpacing: "0.08em",
      textTransform: "uppercase", color: "#6b7280"
    }}>{label}</label>
    {children}
  </div>
);

const inputStyle = {
  width: "100%", boxSizing: "border-box",
  padding: "10px 14px",
  border: "1.5px solid #e5e7eb",
  borderRadius: 8,
  fontSize: 14, color: "#111827",
  background: "#fafafa",
  outline: "none",
  transition: "border-color 0.15s, box-shadow 0.15s",
  fontFamily: "inherit",
};

/* ─── Main component ─────────────────────────────────────────────── */
export default function FacilitiesApp() {
  const [facilities, setFacilities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("");
  const [sortField, setSortField] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [focusedField, setFocusedField] = useState(null);

  useEffect(() => { fetchFacilities(); }, []);

  const fetchFacilities = async () => {
    try {
      setLoading(true); setError("");
      const res = await axios.get("https://templet-facilities-backend.onrender.com/facilities");
      setFacilities(res.data);
    } catch { setError("Failed to load facilities."); }
    finally { setLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!coordinateRegex.test(form.coordinates.trim())) {
      setError("Invalid coordinates. Use format: 9.8025,1.02");
      return;
    }
    try {
      setLoading(true);
      await axios.post("https://templet-facilities-backend.onrender.com/facilities", form);
      setForm(emptyForm);
      setModalOpen(false);
      fetchFacilities();
    } catch { setError("Failed to save facility."); }
    finally { setLoading(false); }
  };

  const closeModal = () => { setModalOpen(false); setForm(emptyForm); setError(""); };

  const processed = facilities
    .filter(f => f.facilityName?.toLowerCase().includes(search.toLowerCase()))
    .filter(f => filterType ? f.type === filterType : true)
    .sort((a, b) => {
      if (!sortField) return 0;
      const vA = a[sortField] ?? "", vB = b[sortField] ?? "";
      return vA > vB ? 1 : vA < vB ? -1 : 0;
    });

  const fieldStyle = (name) => ({
    ...inputStyle,
    borderColor: focusedField === name ? "#3b82f6" : "#e5e7eb",
    boxShadow: focusedField === name ? "0 0 0 3px rgba(59,130,246,0.12)" : "none",
    background: focusedField === name ? "#fff" : "#fafafa",
  });

  const focusProps = (name) => ({
    onFocus: () => setFocusedField(name),
    onBlur: () => setFocusedField(null),
  });

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Sora', sans-serif; background: #f1f5f9; }
        .mono { font-family: 'JetBrains Mono', monospace; }
        .card-hover { transition: transform 0.15s, box-shadow 0.15s; }
        .card-hover:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,0.09); }
        .btn-primary { cursor: pointer; border: none; outline: none;
          background: #1d4ed8; color: #fff; font-family: 'Sora', sans-serif;
          font-size: 14px; font-weight: 600; padding: 11px 22px;
          border-radius: 8px; transition: background 0.15s, transform 0.1s; display: inline-flex; align-items: center; gap: 8px; }
        .btn-primary:hover { background: #1e40af; transform: translateY(-1px); }
        .btn-primary:disabled { background: #93c5fd; cursor: not-allowed; transform: none; }
        .btn-ghost { cursor: pointer; border: 1.5px solid #e5e7eb; outline: none;
          background: #fff; color: #374151; font-family: 'Sora', sans-serif;
          font-size: 14px; font-weight: 500; padding: 10px 18px;
          border-radius: 8px; transition: all 0.15s; }
        .btn-ghost:hover { border-color: #d1d5db; background: #f9fafb; }
        .modal-overlay { animation: fadeIn 0.18s ease; }
        .modal-box { animation: slideUp 0.22s cubic-bezier(0.34,1.3,0.64,1); }
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(24px) scale(0.97) } to { opacity: 1; transform: translateY(0) scale(1) } }
        select { appearance: none; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2.5'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 12px center; }
        ::-webkit-scrollbar { width: 6px; } ::-webkit-scrollbar-track { background: transparent; } ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 99px; }
      `}</style>

      <div style={{ minHeight: "100vh", padding: "40px 24px", fontFamily: "'Sora', sans-serif" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>

          {/* ── Header ── */}
          <div style={{ marginBottom: 40, display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16 }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                <div style={{ width: 8, height: 32, background: "#1d4ed8", borderRadius: 4 }} />
                <h1 style={{ fontSize: 28, fontWeight: 700, color: "#0f172a", letterSpacing: "-0.02em" }}>
                  Facilities
                </h1>
              </div>
              <p style={{ marginLeft: 18, color: "#64748b", fontSize: 14 }}>
                {facilities.length} registered {facilities.length === 1 ? "facility" : "facilities"}
              </p>
            </div>
            <button className="btn-primary" onClick={() => setModalOpen(true)}>
              <PlusIcon /> Add Facility
            </button>
          </div>

          {/* ── Error banner ── */}
          {error && (
            <div style={{
              marginBottom: 20, padding: "12px 16px",
              background: "#fef2f2", border: "1px solid #fecaca",
              borderRadius: 8, color: "#dc2626", fontSize: 14,
              display: "flex", justifyContent: "space-between", alignItems: "center"
            }}>
              {error}
              <button onClick={() => setError("")} style={{ background: "none", border: "none", cursor: "pointer", color: "#dc2626" }}><XIcon /></button>
            </div>
          )}

          {/* ── Filter bar ── */}
          <div style={{
            background: "#fff", borderRadius: 12,
            border: "1px solid #e2e8f0",
            padding: "14px 16px", marginBottom: 20,
            display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center"
          }}>
            <div style={{ position: "relative", flex: "1 1 220px" }}>
              <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#9ca3af" }}>
                <SearchIcon />
              </span>
              <input
                placeholder="Search facilities..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{ ...inputStyle, paddingLeft: 36, background: "#f8fafc", borderColor: "#e2e8f0" }}
              />
            </div>
            <select value={filterType} onChange={e => setFilterType(e.target.value)}
              style={{ ...inputStyle, width: "auto", flex: "0 0 160px", cursor: "pointer", paddingRight: 32, background: "#f8fafc", borderColor: "#e2e8f0" }}>
              <option value="">All Types</option>
              <option value="Water">Water</option>
              <option value="Health">Health</option>
            </select>
            <select value={sortField} onChange={e => setSortField(e.target.value)}
              style={{ ...inputStyle, width: "auto", flex: "0 0 190px", cursor: "pointer", paddingRight: 32, background: "#f8fafc", borderColor: "#e2e8f0" }}>
              <option value="">Sort by…</option>
              <option value="facilityName">Name A–Z</option>
              <option value="area">Area</option>
              <option value="dateEstablished">Date Established</option>
            </select>
          </div>

          {/* ── Facility cards ── */}
          {loading && !modalOpen ? (
            <div style={{ textAlign: "center", padding: "60px 0", color: "#94a3b8", fontSize: 14 }}>Loading facilities…</div>
          ) : processed.length === 0 ? (
            <div style={{
              textAlign: "center", padding: "80px 0",
              color: "#94a3b8", fontSize: 14,
              background: "#fff", borderRadius: 12, border: "1px dashed #e2e8f0"
            }}>
              No facilities found.
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {processed.map(f => (
                <div key={f.id} className="card-hover" style={{
                  background: "#fff", borderRadius: 12,
                  border: "1px solid #e2e8f0",
                  padding: "20px 24px",
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, flexWrap: "wrap" }}>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                        <h3 style={{ fontSize: 16, fontWeight: 600, color: "#0f172a" }}>{f.facilityName}</h3>
                        {f.type && (
                          <span style={{
                            fontSize: 11, fontWeight: 600, letterSpacing: "0.06em",
                            textTransform: "uppercase", padding: "2px 8px",
                            borderRadius: 99, background: "#eff6ff", color: "#1d4ed8"
                          }}>{f.type}</span>
                        )}
                      </div>
                      {f.coordinates && (
                        <div style={{ display: "flex", alignItems: "center", gap: 4, color: "#64748b", fontSize: 13 }} className="mono">
                          <LocationIcon /> {f.coordinates}
                        </div>
                      )}
                    </div>
                    {f.governmentDonation && (
                      <span style={{
                        fontSize: 11, fontWeight: 600, letterSpacing: "0.05em",
                        textTransform: "uppercase", padding: "4px 10px",
                        borderRadius: 99, background: "#f0fdf4", color: "#16a34a",
                        border: "1px solid #bbf7d0", whiteSpace: "nowrap"
                      }}>
                        ✓ Govt. Funded
                      </span>
                    )}
                  </div>

                  <div style={{ marginTop: 14, display: "flex", flexWrap: "wrap", gap: "8px 24px" }}>
                    {f.area && <Meta label="Area" value={f.area} />}
                    {f.dateEstablished && <Meta label="Established" value={new Date(f.dateEstablished).toLocaleDateString("en-GB", { day:"2-digit", month:"short", year:"numeric" })} />}
                    {f.privateOwnerDonation && <Meta label="Private Donation" value={f.privateOwnerDonation} />}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── MODAL ── */}
      {modalOpen && (
        <div
          className="modal-overlay"
          onClick={e => e.target === e.currentTarget && closeModal()}
          style={{
            position: "fixed", inset: 0, zIndex: 50,
            background: "rgba(15,23,42,0.55)",
            backdropFilter: "blur(4px)",
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: "24px",
          }}
        >
          <div
            className="modal-box"
            style={{
              background: "#fff", borderRadius: 16,
              width: "100%", maxWidth: 560,
              maxHeight: "90vh", overflowY: "auto",
              boxShadow: "0 25px 60px rgba(0,0,0,0.2)",
            }}
          >
            {/* Modal header */}
            <div style={{
              display: "flex", justifyContent: "space-between", alignItems: "center",
              padding: "24px 28px 20px",
              borderBottom: "1px solid #f1f5f9"
            }}>
              <div>
                <h2 style={{ fontSize: 20, fontWeight: 700, color: "#0f172a", letterSpacing: "-0.01em" }}>
                  Add New Facility
                </h2>
                <p style={{ fontSize: 13, color: "#64748b", marginTop: 2 }}>Fill in the details below to register a facility.</p>
              </div>
              <button onClick={closeModal} style={{
                background: "#f1f5f9", border: "none", cursor: "pointer",
                borderRadius: 8, padding: 8, color: "#64748b",
                display: "flex", alignItems: "center", justifyContent: "center",
                transition: "background 0.12s",
              }}
                onMouseEnter={e => e.currentTarget.style.background = "#e2e8f0"}
                onMouseLeave={e => e.currentTarget.style.background = "#f1f5f9"}
              >
                <XIcon />
              </button>
            </div>

            {/* Modal body / form */}
            <form onSubmit={handleSubmit} style={{ padding: "24px 28px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>

                <Field label="Type">
                  <input
                    placeholder="e.g. Water, Health"
                    value={form.type}
                    onChange={e => setForm({ ...form, type: e.target.value })}
                    style={fieldStyle("type")} {...focusProps("type")}
                  />
                </Field>

                <Field label="Facility Name">
                  <input
                    placeholder="Full facility name"
                    value={form.facilityName}
                    onChange={e => setForm({ ...form, facilityName: e.target.value })}
                    style={fieldStyle("name")} {...focusProps("name")}
                  />
                </Field>

                <Field label="Coordinates (lat, long)" span={2}>
                  <input
                    placeholder="e.g. 9.8025, 1.0200"
                    value={form.coordinates}
                    onChange={e => setForm({ ...form, coordinates: e.target.value })}
                    style={{ ...fieldStyle("coords"), fontFamily: "'JetBrains Mono', monospace", fontSize: 13 }}
                    {...focusProps("coords")}
                  />
                </Field>

                <Field label="Private Owner Donation">
                  <input
                    placeholder="Amount or description"
                    value={form.privateOwnerDonation}
                    onChange={e => setForm({ ...form, privateOwnerDonation: e.target.value })}
                    style={fieldStyle("pvt")} {...focusProps("pvt")}
                  />
                </Field>

                <Field label="Date Established">
                  <input
                    type="date"
                    value={form.dateEstablished}
                    onChange={e => setForm({ ...form, dateEstablished: e.target.value })}
                    style={fieldStyle("date")} {...focusProps("date")}
                  />
                </Field>

                <Field label="Area" span={2}>
                  <input
                    placeholder="e.g. 450 m²"
                    value={form.area}
                    onChange={e => setForm({ ...form, area: e.target.value })}
                    style={fieldStyle("area")} {...focusProps("area")}
                  />
                </Field>

                <div style={{ gridColumn: "1 / -1" }}>
                  <label style={{
                    display: "flex", alignItems: "center", gap: 12,
                    cursor: "pointer", padding: "12px 14px",
                    borderRadius: 8, border: "1.5px solid",
                    borderColor: form.governmentDonation ? "#bfdbfe" : "#e5e7eb",
                    background: form.governmentDonation ? "#eff6ff" : "#fafafa",
                    transition: "all 0.15s",
                  }}>
                    <input
                      type="checkbox"
                      checked={form.governmentDonation}
                      onChange={e => setForm({ ...form, governmentDonation: e.target.checked })}
                      style={{ width: 16, height: 16, accentColor: "#1d4ed8", cursor: "pointer" }}
                    />
                    <span style={{ fontSize: 14, fontWeight: 500, color: form.governmentDonation ? "#1d4ed8" : "#374151" }}>
                      Received Government Donation
                    </span>
                  </label>
                </div>

              </div>

              {/* Error inside modal */}
              {error && (
                <div style={{
                  marginTop: 16, padding: "10px 14px",
                  background: "#fef2f2", border: "1px solid #fecaca",
                  borderRadius: 8, color: "#dc2626", fontSize: 13
                }}>{error}</div>
              )}

              {/* Footer actions */}
              <div style={{ display: "flex", gap: 10, marginTop: 24, justifyContent: "flex-end" }}>
                <button type="button" className="btn-ghost" onClick={closeModal}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={loading}>
                  {loading ? "Saving…" : "Save Facility"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

/* ── small meta field ── */
function Meta({ label, value }) {
  return (
    <div style={{ fontSize: 13, color: "#374151" }}>
      <span style={{ fontWeight: 600, color: "#64748b", marginRight: 4 }}>{label}:</span>
      {value}
    </div>
  );
}