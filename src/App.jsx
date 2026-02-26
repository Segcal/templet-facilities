

import { useEffect, useState } from "react";
import axios from "axios";

const BASE = "https://templet-facilities-backend.onrender.com/facilities";
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

/* ── Icons ─────────────────────────────────────────────────────── */
const Icon = ({ d, size = 16 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {d}
  </svg>
);
const PlusIcon = () => (
  <Icon
    size={18}
    d={
      <>
        <line x1="12" y1="5" x2="12" y2="19" />
        <line x1="5" y1="12" x2="19" y2="12" />
      </>
    }
  />
);
const XIcon = () => (
  <Icon
    size={17}
    d={
      <>
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
      </>
    }
  />
);
const SearchIcon = () => (
  <Icon
    size={15}
    d={
      <>
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
      </>
    }
  />
);
const PinIcon = () => (
  <Icon
    size={13}
    d={
      <>
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
        <circle cx="12" cy="10" r="3" />
      </>
    }
  />
);
const EditIcon = () => (
  <Icon
    size={14}
    d={
      <>
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
      </>
    }
  />
);
const TrashIcon = () => (
  <Icon
    size={14}
    d={
      <>
        <polyline points="3 6 5 6 21 6" />
        <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
        <line x1="10" y1="11" x2="10" y2="17" />
        <line x1="14" y1="11" x2="14" y2="17" />
        <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
      </>
    }
  />
);
const WarnIcon = () => (
  <Icon
    size={24}
    d={
      <>
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
        <line x1="12" y1="9" x2="12" y2="13" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
      </>
    }
  />
);

/* ── Shared styles ──────────────────────────────────────────────── */
const inputBase = {
  width: "100%",
  boxSizing: "border-box",
  padding: "10px 14px",
  border: "1.5px solid #e5e7eb",
  borderRadius: 8,
  fontSize: 14,
  color: "#111827",
  background: "#fafafa",
  outline: "none",
  transition: "border-color 0.15s, box-shadow 0.15s, background 0.15s",
  fontFamily: "inherit",
};

const Field = ({ label, children, span }) => (
  <div style={{ gridColumn: span === 2 ? "1 / -1" : undefined }}>
    <label
      style={{
        display: "block",
        marginBottom: 6,
        fontSize: 11,
        fontWeight: 600,
        letterSpacing: "0.08em",
        textTransform: "uppercase",
        color: "#6b7280",
      }}
    >
      {label}
    </label>
    {children}
  </div>
);

/* ── App ────────────────────────────────────────────────────────── */
export default function FacilitiesApp() {
  const [facilities, setFacilities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("");
  const [sortField, setSortField] = useState("");

  // Form modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [focusedField, setFocusedField] = useState(null);

  // Delete confirm modal
  const [deleteTarget, setDeleteTarget] = useState(null);

  useEffect(() => {
    fetchFacilities();
  }, []);

  const fetchFacilities = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await axios.get(BASE);
      setFacilities(res.data);
    } catch {
      setError("Failed to load facilities.");
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setError("");
    setModalOpen(true);
  };

  const openEdit = (f) => {
    setEditingId(f.id);
    setForm({
      type: f.type || "",
      facilityName: f.facilityName || "",
      coordinates: f.coordinates || "",
      governmentDonation: !!f.governmentDonation,
      privateOwnerDonation: f.privateOwnerDonation || "",
      dateEstablished: f.dateEstablished ? f.dateEstablished.slice(0, 10) : "",
      area: f.area || "",
    });
    setError("");
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingId(null);
    setForm(emptyForm);
    setError("");
  };

const handleSubmit = async (e) => {
  e.preventDefault();

  if (!coordinateRegex.test(form.coordinates.trim())) {
    setError("Invalid coordinates. Use format: 9.8025,1.02");
    return;
  }

  try {
    setLoading(true);
    setError("");

    if (editingId) {
      // UPDATE
      const res = await axios.put(`${BASE}/${editingId}`, form);

      setFacilities((prev) =>
        prev.map((f) =>
          f.id === editingId ? res.data : f
        )
      );

    } else {
      // CREATE
      const res = await axios.post(BASE, form);

      setFacilities((prev) => [
        ...prev,
        res.data,
      ]);
    }

    closeModal();

  } catch (err) {

    setError(
      err.response?.data?.message ||
      `Failed to ${editingId ? "update" : "save"} facility.`
    );

  } finally {
    setLoading(false);
  }
};

const confirmDelete = async () => {

  if (!deleteTarget) return;

  try {

    setLoading(true);

    await axios.delete(
      `${BASE}/${deleteTarget.id}`
    );

    setFacilities((prev) =>
      prev.filter(
        (f) => f.id !== deleteTarget.id
      )
    );

    setDeleteTarget(null);

  } catch (err) {

    setError(
      err.response?.data?.message ||
      "Failed to delete facility."
    );

  } finally {

    setLoading(false);

  }

};

  const processed = facilities
    .filter((f) => f.facilityName?.toLowerCase().includes(search.toLowerCase()))
    .filter((f) => (filterType ? f.type === filterType : true))
    .sort((a, b) => {
      if (!sortField) return 0;
      const vA = a[sortField] ?? "",
        vB = b[sortField] ?? "";
      return vA > vB ? 1 : vA < vB ? -1 : 0;
    });

  const fieldStyle = (name) => ({
    ...inputBase,
    borderColor: focusedField === name ? "#3b82f6" : "#e5e7eb",
    boxShadow:
      focusedField === name ? "0 0 0 3px rgba(59,130,246,0.12)" : "none",
    background: focusedField === name ? "#fff" : "#fafafa",
  });
  const fp = (name) => ({
    onFocus: () => setFocusedField(name),
    onBlur: () => setFocusedField(null),
  });

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');
        *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Sora', sans-serif; background: #f1f5f9; }
        .mono { font-family: 'JetBrains Mono', monospace; }

        .card { transition: transform 0.15s, box-shadow 0.15s; }
        .card:hover { transform: translateY(-2px); box-shadow: 0 8px 28px rgba(0,0,0,0.08); }
        .card:hover .card-actions { opacity: 1; }
        .card-actions { opacity: 0; transition: opacity 0.15s; display: flex; gap: 6px; flex-shrink: 0; }
        @media (hover: none) { .card-actions { opacity: 1 !important; } }

        .btn-primary { cursor:pointer; border:none; outline:none; background:#1d4ed8; color:#fff;
          font-family:'Sora',sans-serif; font-size:14px; font-weight:600; padding:11px 22px;
          border-radius:8px; transition:background 0.15s,transform 0.1s;
          display:inline-flex; align-items:center; gap:8px; }
        .btn-primary:hover:not(:disabled) { background:#1e40af; transform:translateY(-1px); }
        .btn-primary:disabled { background:#93c5fd; cursor:not-allowed; }

        .btn-ghost { cursor:pointer; border:1.5px solid #e5e7eb; outline:none; background:#fff;
          color:#374151; font-family:'Sora',sans-serif; font-size:14px; font-weight:500;
          padding:10px 18px; border-radius:8px; transition:all 0.15s; }
        .btn-ghost:hover { border-color:#d1d5db; background:#f9fafb; }

        .btn-icon { cursor:pointer; border:none; outline:none; display:inline-flex;
          align-items:center; justify-content:center; border-radius:7px; padding:6px 10px;
          font-family:'Sora',sans-serif; font-size:12px; font-weight:600; gap:5px; transition:all 0.14s; }
        .btn-edit   { background:#eff6ff; color:#1d4ed8; }
        .btn-edit:hover   { background:#dbeafe; }
        .btn-delete { background:#fef2f2; color:#dc2626; }
        .btn-delete:hover { background:#fee2e2; }

        .btn-danger { cursor:pointer; border:none; outline:none; background:#dc2626; color:#fff;
          font-family:'Sora',sans-serif; font-size:14px; font-weight:600; padding:11px 22px;
          border-radius:8px; transition:background 0.15s;
          display:inline-flex; align-items:center; gap:8px; }
        .btn-danger:hover:not(:disabled) { background:#b91c1c; }
        .btn-danger:disabled { background:#fca5a5; cursor:not-allowed; }

        .overlay { animation: fadeIn 0.18s ease; }
        .modal   { animation: slideUp 0.22s cubic-bezier(0.34,1.3,0.64,1); }
        @keyframes fadeIn  { from { opacity:0 } to { opacity:1 } }
        @keyframes slideUp { from { opacity:0; transform:translateY(24px) scale(0.97) } to { opacity:1; transform:none } }

        select { appearance:none;
          background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2.5'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E");
          background-repeat:no-repeat; background-position:right 12px center; }
        ::-webkit-scrollbar { width:6px; }
        ::-webkit-scrollbar-thumb { background:#cbd5e1; border-radius:99px; }
      `}</style>

      <div
        style={{
          minHeight: "100vh",
          padding: "40px 24px",
          fontFamily: "'Sora', sans-serif",
        }}
      >
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          {/* Header */}
          <div
            style={{
              marginBottom: 36,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              flexWrap: "wrap",
              gap: 16,
            }}
          >
            <div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  marginBottom: 5,
                }}
              >
                <div
                  style={{
                    width: 8,
                    height: 32,
                    background: "#1d4ed8",
                    borderRadius: 4,
                  }}
                />
                <h1
                  style={{
                    fontSize: 28,
                    fontWeight: 700,
                    color: "#0f172a",
                    letterSpacing: "-0.02em",
                  }}
                >
                  Facilities
                </h1>
              </div>
              <p style={{ marginLeft: 18, color: "#64748b", fontSize: 14 }}>
                {facilities.length} registered{" "}
                {facilities.length === 1 ? "facility" : "facilities"}
              </p>
            </div>
            <button className="btn-primary" onClick={openCreate}>
              <PlusIcon /> Add Facility
            </button>
          </div>

          {/* Global error */}
          {error && !modalOpen && (
            <div
              style={{
                marginBottom: 20,
                padding: "12px 16px",
                background: "#fef2f2",
                border: "1px solid #fecaca",
                borderRadius: 8,
                color: "#dc2626",
                fontSize: 14,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              {error}
              <button
                onClick={() => setError("")}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "#dc2626",
                }}
              >
                <XIcon />
              </button>
            </div>
          )}

          {/* Filter bar */}
          <div
            style={{
              background: "#fff",
              borderRadius: 12,
              border: "1px solid #e2e8f0",
              padding: "14px 16px",
              marginBottom: 20,
              display: "flex",
              gap: 10,
              flexWrap: "wrap",
              alignItems: "center",
            }}
          >
            <div style={{ position: "relative", flex: "1 1 220px" }}>
              <span
                style={{
                  position: "absolute",
                  left: 12,
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "#9ca3af",
                  pointerEvents: "none",
                }}
              >
                <SearchIcon />
              </span>
              <input
                placeholder="Search facilities…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  ...inputBase,
                  paddingLeft: 36,
                  background: "#f8fafc",
                  borderColor: "#e2e8f0",
                }}
              />
            </div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              style={{
                ...inputBase,
                width: "auto",
                flex: "0 0 155px",
                cursor: "pointer",
                paddingRight: 32,
                background: "#f8fafc",
                borderColor: "#e2e8f0",
              }}
            >
              <option value="">All Types</option>
              <option value="Water">Water</option>
              <option value="Health">Health</option>
            </select>
            <select
              value={sortField}
              onChange={(e) => setSortField(e.target.value)}
              style={{
                ...inputBase,
                width: "auto",
                flex: "0 0 190px",
                cursor: "pointer",
                paddingRight: 32,
                background: "#f8fafc",
                borderColor: "#e2e8f0",
              }}
            >
              <option value="">Sort by…</option>
              <option value="facilityName">Name A–Z</option>
              <option value="area">Area</option>
              <option value="dateEstablished">Date Established</option>
            </select>
          </div>

          {/* Cards */}
          {loading && !modalOpen ? (
            <div
              style={{
                textAlign: "center",
                padding: "60px 0",
                color: "#94a3b8",
                fontSize: 14,
              }}
            >
              Loading facilities…
            </div>
          ) : processed.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "80px 0",
                color: "#94a3b8",
                fontSize: 14,
                background: "#fff",
                borderRadius: 12,
                border: "1px dashed #e2e8f0",
              }}
            >
              No facilities found.
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {processed.map((f) => (
                <div
                  key={f.id}
                  className="card"
                  style={{
                    background: "#fff",
                    borderRadius: 12,
                    border: "1px solid #e2e8f0",
                    padding: "18px 22px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      gap: 12,
                    }}
                  >
                    {/* Info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                          marginBottom: 4,
                          flexWrap: "wrap",
                        }}
                      >
                        <h3
                          style={{
                            fontSize: 15,
                            fontWeight: 600,
                            color: "#0f172a",
                          }}
                        >
                          {f.facilityName}
                        </h3>
                        {f.type && (
                          <span
                            style={{
                              fontSize: 10,
                              fontWeight: 700,
                              letterSpacing: "0.07em",
                              textTransform: "uppercase",
                              padding: "2px 8px",
                              borderRadius: 99,
                              background: "#eff6ff",
                              color: "#1d4ed8",
                            }}
                          >
                            {f.type}
                          </span>
                        )}
                        {f.governmentDonation && (
                          <span
                            style={{
                              fontSize: 10,
                              fontWeight: 700,
                              letterSpacing: "0.05em",
                              textTransform: "uppercase",
                              padding: "2px 8px",
                              borderRadius: 99,
                              background: "#f0fdf4",
                              color: "#16a34a",
                              border: "1px solid #bbf7d0",
                            }}
                          >
                            ✓ Govt. Funded
                          </span>
                        )}
                      </div>
                      {f.coordinates && (
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 4,
                            color: "#64748b",
                            fontSize: 12,
                          }}
                          className="mono"
                        >
                          <PinIcon /> {f.coordinates}
                        </div>
                      )}
                      <div
                        style={{
                          marginTop: 10,
                          display: "flex",
                          flexWrap: "wrap",
                          gap: "6px 20px",
                        }}
                      >
                        {f.area && <Meta label="Area" value={f.area} />}
                        {f.dateEstablished && (
                          <Meta
                            label="Established"
                            value={new Date(
                              f.dateEstablished,
                            ).toLocaleDateString("en-GB", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })}
                          />
                        )}
                        {f.privateOwnerDonation && (
                          <Meta
                            label="Private Donation"
                            value={f.privateOwnerDonation}
                          />
                        )}
                      </div>
                    </div>

                    {/* Actions (revealed on hover) */}
                    <div className="card-actions">
                      <button
                        className="btn-icon btn-edit"
                        onClick={() => openEdit(f)}
                      >
                        <EditIcon /> Edit
                      </button>
                      <button
                        className="btn-icon btn-delete"
                        onClick={() => setDeleteTarget(f)}
                      >
                        <TrashIcon /> Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Add / Edit Modal ── */}
      {modalOpen && (
        <div
          className="overlay"
          onClick={(e) => e.target === e.currentTarget && closeModal()}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 50,
            background: "rgba(15,23,42,0.55)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 24,
          }}
        >
          <div
            className="modal"
            style={{
              background: "#fff",
              borderRadius: 16,
              width: "100%",
              maxWidth: 560,
              maxHeight: "90vh",
              overflowY: "auto",
              boxShadow: "0 25px 60px rgba(0,0,0,0.2)",
            }}
          >
            {/* Header */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "22px 26px 18px",
                borderBottom: "1px solid #f1f5f9",
              }}
            >
              <div>
                <h2
                  style={{
                    fontSize: 19,
                    fontWeight: 700,
                    color: "#0f172a",
                    letterSpacing: "-0.01em",
                  }}
                >
                  {editingId ? "Edit Facility" : "Add New Facility"}
                </h2>
                <p style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>
                  {editingId
                    ? "Update the details below."
                    : "Fill in the details to register a new facility."}
                </p>
              </div>
              <button
                onClick={closeModal}
                style={{
                  background: "#f1f5f9",
                  border: "none",
                  cursor: "pointer",
                  borderRadius: 8,
                  padding: 8,
                  color: "#64748b",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = "#e2e8f0")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "#f1f5f9")
                }
              >
                <XIcon />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} style={{ padding: "22px 26px" }}>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 14,
                }}
              >
                <Field label="Type">
                  <input
                    placeholder="e.g. Water, Health"
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                    style={fieldStyle("type")}
                    {...fp("type")}
                  />
                </Field>

                <Field label="Facility Name">
                  <input
                    placeholder="Full facility name"
                    value={form.facilityName}
                    onChange={(e) =>
                      setForm({ ...form, facilityName: e.target.value })
                    }
                    style={fieldStyle("name")}
                    {...fp("name")}
                  />
                </Field>

                <Field label="Coordinates (lat, long)" span={2}>
                  <input
                    placeholder="e.g. 9.8025,1.0200"
                    value={form.coordinates}
                    onChange={(e) =>
                      setForm({ ...form, coordinates: e.target.value })
                    }
                    style={{
                      ...fieldStyle("coords"),
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: 13,
                    }}
                    {...fp("coords")}
                  />
                </Field>

                <Field label="Private Owner Donation">
                  <input
                    placeholder="Amount or description"
                    value={form.privateOwnerDonation}
                    onChange={(e) =>
                      setForm({ ...form, privateOwnerDonation: e.target.value })
                    }
                    style={fieldStyle("pvt")}
                    {...fp("pvt")}
                  />
                </Field>

                <Field label="Date Established">
                  <input
                    type="date"
                    value={form.dateEstablished}
                    onChange={(e) =>
                      setForm({ ...form, dateEstablished: e.target.value })
                    }
                    style={fieldStyle("date")}
                    {...fp("date")}
                  />
                </Field>

                <Field label="Area" span={2}>
                  <input
                    placeholder="e.g. 450 m²"
                    value={form.area}
                    onChange={(e) => setForm({ ...form, area: e.target.value })}
                    style={fieldStyle("area")}
                    {...fp("area")}
                  />
                </Field>

                <div style={{ gridColumn: "1 / -1" }}>
                  <label
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      cursor: "pointer",
                      padding: "11px 14px",
                      borderRadius: 8,
                      border: "1.5px solid",
                      borderColor: form.governmentDonation
                        ? "#bfdbfe"
                        : "#e5e7eb",
                      background: form.governmentDonation
                        ? "#eff6ff"
                        : "#fafafa",
                      transition: "all 0.15s",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={form.governmentDonation}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          governmentDonation: e.target.checked,
                        })
                      }
                      style={{
                        width: 16,
                        height: 16,
                        accentColor: "#1d4ed8",
                        cursor: "pointer",
                      }}
                    />
                    <span
                      style={{
                        fontSize: 14,
                        fontWeight: 500,
                        color: form.governmentDonation ? "#1d4ed8" : "#374151",
                      }}
                    >
                      Received Government Donation
                    </span>
                  </label>
                </div>
              </div>

              {error && (
                <div
                  style={{
                    marginTop: 14,
                    padding: "10px 14px",
                    background: "#fef2f2",
                    border: "1px solid #fecaca",
                    borderRadius: 8,
                    color: "#dc2626",
                    fontSize: 13,
                  }}
                >
                  {error}
                </div>
              )}

              <div
                style={{
                  display: "flex",
                  gap: 10,
                  marginTop: 22,
                  justifyContent: "flex-end",
                }}
              >
                <button
                  type="button"
                  className="btn-ghost"
                  onClick={closeModal}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={loading}
                >
                  {loading
                    ? "Saving…"
                    : editingId
                      ? "Save Changes"
                      : "Add Facility"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Delete Confirm Modal ── */}
      {deleteTarget && (
        <div
          className="overlay"
          onClick={(e) => e.target === e.currentTarget && setDeleteTarget(null)}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 60,
            background: "rgba(15,23,42,0.6)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 24,
          }}
        >
          <div
            className="modal"
            style={{
              background: "#fff",
              borderRadius: 16,
              width: "100%",
              maxWidth: 400,
              boxShadow: "0 25px 60px rgba(0,0,0,0.22)",
              padding: "32px 28px",
              textAlign: "center",
            }}
          >
            <div
              style={{
                width: 52,
                height: 52,
                borderRadius: "50%",
                background: "#fef2f2",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 16px",
                color: "#dc2626",
              }}
            >
              <WarnIcon />
            </div>
            <h3
              style={{
                fontSize: 18,
                fontWeight: 700,
                color: "#0f172a",
                marginBottom: 8,
              }}
            >
              Delete Facility?
            </h3>
            <p
              style={{
                fontSize: 14,
                color: "#64748b",
                lineHeight: 1.6,
                marginBottom: 24,
              }}
            >
              <strong style={{ color: "#374151" }}>
                {deleteTarget.facilityName}
              </strong>{" "}
              will be permanently removed. This cannot be undone.
            </p>
            <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
              <button
                className="btn-ghost"
                onClick={() => setDeleteTarget(null)}
              >
                Cancel
              </button>
              <button
                className="btn-danger"
                onClick={confirmDelete}
                disabled={loading}
              >
                {loading ? "Deleting…" : "Yes, Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function Meta({ label, value }) {
  return (
    <div style={{ fontSize: 12, color: "#374151" }}>
      <span style={{ fontWeight: 600, color: "#94a3b8", marginRight: 4 }}>
        {label}:
      </span>
      {value}
    </div>
  );
}
