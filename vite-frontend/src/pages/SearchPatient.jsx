import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

function SearchPatient() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const navigate = useNavigate();

  const handleSearch = async () => {
    try {
      const res = await API.get("/patients");

      // filter locally (simple + fast)
      const filtered = res.data.filter((p) =>
        p.patient_id.toLowerCase().includes(query.toLowerCase()) ||
        p.name.toLowerCase().includes(query.toLowerCase())
      );

      setResults(filtered);
    } catch (err) {
      console.error(err);
      alert("Error searching");
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Search Patient</h2>

      {/* Search Input */}
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          placeholder="Enter Patient ID or Name"
          className="border p-2 w-full"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />

        <button
          className="bg-blue-500 text-white px-4"
          onClick={handleSearch}
        >
          Search
        </button>
      </div>

      {/* Results */}
      <table className="w-full bg-white shadow rounded">
        <thead className="bg-gray-200">
          <tr>
            <th className="p-2">ID</th>
            <th className="p-2">Name</th>
            <th className="p-2">Age</th>
            <th className="p-2">Action</th>
          </tr>
        </thead>

        <tbody>
          {results.length > 0 ? (
            results.map((p) => (
              <tr key={p.patient_id} className="text-center border-t">
                <td className="p-2">{p.patient_id}</td>
                <td className="p-2">{p.name}</td>
                <td className="p-2">{p.age}</td>

                <td>
                  <button
                    className="bg-green-500 text-white px-2 py-1"
                    onClick={() => navigate(`/history/${p.patient_id}`)}
                  >
                    View
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4" className="p-4 text-center">
                No results
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default SearchPatient;