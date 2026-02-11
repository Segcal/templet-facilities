import { useEffect, useState } from "react";
import axios from "axios";

const coordinateRegex = /^-?\d{1,2}\.\d+,-?\d{1,3}\.\d+$/;

export default function App() {
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
    area: ""
  });

  const fetchFacilities = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await axios.get("http://localhost:5000/facilities");
      setFacilities(res.data);
    } catch {
      setError("Failed to fetch facilities");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFacilities();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!coordinateRegex.test(form.coordinates)) {
      setError("Invalid coordinate format. Example: 9.8025,1.02");
      return;
    }

    try {
      setLoading(true);
      await axios.post("http://localhost:5000/facilities", form);
      fetchFacilities();
    } catch {
      setError("Failed to save facility");
    } finally {
      setLoading(false);
    }
  };

  const processedFacilities = facilities
    .filter(f => f.facilityName.toLowerCase().includes(search.toLowerCase()))
    .filter(f => (filterType ? f.type === filterType : true))
    .sort((a, b) => {
      if (!sortField) return 0;
      return a[sortField] > b[sortField] ? 1 : -1;
    });

  return (
    <div style={{ padding: 20 }}>
      <h1>Facilities Management</h1>

      {loading && <p>Loading...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      <h2>Add Facility</h2>
      <form onSubmit={handleSubmit}>
        <input placeholder="Type" onChange={e => setForm({ ...form, type: e.target.value })} />
        <input placeholder="Facility Name" onChange={e => setForm({ ...form, facilityName: e.target.value })} />
        <input placeholder="Coordinates (lat,long)" onChange={e => setForm({ ...form, coordinates: e.target.value })} />
        <input placeholder="Private Donation" onChange={e => setForm({ ...form, privateOwnerDonation: e.target.value })} />
        <input type="date" onChange={e => setForm({ ...form, dateEstablished: e.target.value })} />
        <input placeholder="Area" onChange={e => setForm({ ...form, area: e.target.value })} />

        <label>
          Government Donation
          <input type="checkbox" onChange={e => setForm({ ...form, governmentDonation: e.target.checked })} />
        </label>

        <button type="submit">Save</button>
      </form>

      <h2>Facilities List</h2>

      <input placeholder="Search..." onChange={e => setSearch(e.target.value)} />

      <select onChange={e => setFilterType(e.target.value)}>
        <option value="">All Types</option>
        <option value="Water">Water</option>
        <option value="Health">Health</option>
      </select>

      <select onChange={e => setSortField(e.target.value)}>
        <option value="">Sort By</option>
        <option value="facilityName">Name</option>
        <option value="area">Area</option>
        <option value="dateEstablished">Date</option>
      </select>

      {processedFacilities.map(f => (
        <div key={f.id}>
          <h3>{f.facilityName} ({f.type})</h3>
          <p>{f.area}</p>
          <p>{f.coordinates}</p>
        </div>
      ))}
    </div>
  );
}
