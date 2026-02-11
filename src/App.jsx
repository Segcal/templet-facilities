import { useEffect, useState } from "react";
import axios from "axios";

const coordinateRegex = /^-?\d{1,2}\.\d+,-?\d{1,3}\.\d+$/;

export default function FacilitiesApp() {
  const [facilities, setFacilities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("");
  const [sortField, setSortField] = useState("");

  const [form, setForm] = useState({
    type: "",
    facilityName: "",
    coordinates: "",
    governmentDonation: false,
    privateOwnerDonation: "",
    dateEstablished: "",
    area: "",
  });

  useEffect(() => {
    fetchFacilities();
  }, []);

  const fetchFacilities = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await axios.get("https://templet-facilities-backend.onrender.com/facilities");
      setFacilities(res.data);
    } catch {
      setError("Failed to load facilities");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!coordinateRegex.test(form.coordinates.trim())) {
      setError("Invalid coordinates format. Use e.g. 9.8025,1.02");
      return;
    }

    try {
      setLoading(true);
      await axios.post("https://templet-facilities-backend.onrender.com/facilities", form);
      setForm({
        type: "",
        facilityName: "",
        coordinates: "",
        governmentDonation: false,
        privateOwnerDonation: "",
        dateEstablished: "",
        area: "",
      });
      fetchFacilities();
    } catch {
      setError("Failed to save facility");
    } finally {
      setLoading(false);
    }
  };

  const processedFacilities = facilities
    .filter((f) => f.facilityName?.toLowerCase().includes(search.toLowerCase()))
    .filter((f) => (filterType ? f.type === filterType : true))
    .sort((a, b) => {
      if (!sortField) return 0;
      const valA = a[sortField] ?? "";
      const valB = b[sortField] ?? "";
      return valA > valB ? 1 : valA < valB ? -1 : 0;
    });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/40 py-10 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <header className="mb-10">
          <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl">
            Facilities Management
          </h1>
        </header>

        {/* Loading / Error */}
        {(loading || error) && (
          <div className="mb-8">
            {loading && (
              <div className="text-lg text-gray-600">Loading...</div>
            )}
            {error && (
              <div className="rounded-lg bg-red-50 p-4 text-red-700 border border-red-200">
                {error}
              </div>
            )}
          </div>
        )}

        {/* Add Facility Form */}
        <section className="mb-12 rounded-xl bg-white shadow-lg ring-1 ring-gray-200/70 overflow-hidden">
          <div className="px-6 py-7 sm:px-10">
            <h2 className="mb-6 text-2xl font-semibold text-gray-800">
              Add New Facility
            </h2>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <input
                placeholder="Facility Type (e.g. Water, Health)"
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
                className="input-base"
              />

              <input
                placeholder="Facility Name"
                value={form.facilityName}
                onChange={(e) => setForm({ ...form, facilityName: e.target.value })}
                className="input-base"
              />

              <input
                placeholder="Coordinates (lat,long)  e.g. 9.8025,1.02"
                value={form.coordinates}
                onChange={(e) => setForm({ ...form, coordinates: e.target.value })}
                className="input-base sm:col-span-2"
              />

              <input
                placeholder="Private Owner Donation"
                value={form.privateOwnerDonation}
                onChange={(e) => setForm({ ...form, privateOwnerDonation: e.target.value })}
                className="input-base"
              />

              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">
                  Date Established
                </label>
                <input
                  type="date"
                  value={form.dateEstablished}
                  onChange={(e) => setForm({ ...form, dateEstablished: e.target.value })}
                  className="input-base"
                />
              </div>

              <input
                placeholder="Area (e.g. 450 m²)"
                value={form.area}
                onChange={(e) => setForm({ ...form, area: e.target.value })}
                className="input-base"
              />

              <div className="sm:col-span-2 flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={form.governmentDonation}
                  onChange={(e) => setForm({ ...form, governmentDonation: e.target.checked })}
                  className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label className="text-gray-700 font-medium">
                  Received Government Donation
                </label>
              </div>

              <div className="sm:col-span-2">
                <button
                  type="submit"
                  disabled={loading}
                  className={`
                    w-full rounded-lg px-6 py-3.5 font-semibold text-white shadow
                    transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                    ${loading 
                      ? "bg-blue-400 cursor-not-allowed" 
                      : "bg-blue-600 hover:bg-blue-700 active:bg-blue-800"}
                  `}
                >
                  {loading ? "Saving..." : "Save Facility"}
                </button>
              </div>
            </form>
          </div>
        </section>

        {/* Facilities List */}
        <section className="rounded-xl bg-white shadow-lg ring-1 ring-gray-200/70 overflow-hidden">
          <div className="px-6 py-7 sm:px-10">
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:flex-wrap">
              <input
                placeholder="Search by name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input-base flex-1 min-w-[240px]"
              />

              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="select-base min-w-[180px]"
              >
                <option value="">All Types</option>
                <option value="Water">Water</option>
                <option value="Health">Health</option>
              </select>

              <select
                value={sortField}
                onChange={(e) => setSortField(e.target.value)}
                className="select-base min-w-[180px]"
              >
                <option value="">Sort By</option>
                <option value="facilityName">Name (A–Z)</option>
                <option value="area">Area</option>
                <option value="dateEstablished">Date Established</option>
              </select>
            </div>

            {processedFacilities.length === 0 ? (
              <div className="py-16 text-center text-gray-500">
                No facilities found matching your criteria.
              </div>
            ) : (
              <div className="space-y-5">
                {processedFacilities.map((f) => (
                  <div
                    key={f.id}
                    className={`
                      rounded-lg border border-gray-200 bg-gray-50/60 p-6 
                      transition-all hover:bg-gray-50 hover:shadow-md hover:-translate-y-0.5
                    `}
                  >
                    <div className="flex flex-wrap items-baseline justify-between gap-4">
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900">
                          {f.facilityName}
                          <span className="ml-3 text-sm font-medium text-gray-500">
                            {f.type}
                          </span>
                        </h3>
                      </div>

                      {f.governmentDonation && (
                        <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-800">
                          Govt. Supported
                        </span>
                      )}
                    </div>

                    <div className="mt-4 grid grid-cols-1 gap-2 text-gray-700 sm:grid-cols-2">
                      <div>
                        <span className="font-medium">Area:</span>{" "}
                        {f.area || "—"}
                      </div>
                      <div>
                        <span className="font-medium">Coordinates:</span>{" "}
                        {f.coordinates || "—"}
                      </div>
                      {f.dateEstablished && (
                        <div>
                          <span className="font-medium">Date:</span>{" "}
                          {new Date(f.dateEstablished).toLocaleDateString()}
                        </div>
                      )}
                      {f.privateOwnerDonation && (
                        <div>
                          <span className="font-medium">Private Donation:</span>{" "}
                          {f.privateOwnerDonation}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

// Reusable Tailwind input/select classes
const inputBase = `
  w-full rounded-lg border border-gray-300 px-4 py-2.5 
  text-gray-900 placeholder:text-gray-400 
  focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 
  outline-none transition-all
`;

const selectBase = `
  w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 
  text-gray-900 
  focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 
  outline-none transition-all cursor-pointer
`;

// You can define these at the top of the file or in a separate styles file
const inputBaseClass = inputBase.trim();
const selectBaseClass = selectBase.trim();

// Then use them like:
{/* className={inputBaseClass} */}