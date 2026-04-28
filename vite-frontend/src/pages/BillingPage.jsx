import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../services/api";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

const CHARGE_COLORS = {
  Room: "#3b82f6", ICU: "#ef4444", Nursing: "#8b5cf6",
  Medicine: "#10b981", Lab: "#f59e0b", Radiology: "#0ea5e9", Other: "#64748b"
};

function BillingPage() {
  const { visit_id } = useParams();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [loadingClaim, setLoadingClaim] = useState(false);

  const invoiceRef = useRef();

  useEffect(() => {
    fetchInvoice();
  }, []);

  const fetchInvoice = async () => {
    try {
      const res = await API.get(`/api/billing/${visit_id}`);
      setData(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  // ✅ PDF DOWNLOAD
  const downloadPDF = async () => {
    const canvas = await html2canvas(invoiceRef.current);
    const img = canvas.toDataURL("image/png");

    const pdf = new jsPDF();
    pdf.addImage(img, "PNG", 10, 10, 190, 0);
    pdf.save(`Invoice-${visit_id}.pdf`);
  };

  // ✅ MARK PAID
  const markPaid = async () => {
    try {
      await API.put(`/api/billing/pay/${visit_id}`);
      alert("Payment Successful ✅");
      fetchInvoice();
    } catch (err) {
      console.error(err);
    }
  };

  // ✅ SUBMIT CLAIM
  const submitClaim = async () => {
    try {
      setLoadingClaim(true);

      await API.post(`/api/claims/${visit_id}`, {
        provider: "City Hospital",
        payer: "Star Health Insurance"
      });

      alert("Insurance Claim Submitted ✅");

    } catch (err) {
      console.error(err);
      alert("Claim already exists or error ❌");
    } finally {
      setLoadingClaim(false);
    }
  };

  if (!data) return <p className="text-center mt-10">Loading...</p>;

  const { bill, patient, visit, diagnosis, treatments, total } = data;

  // ─── IP daily charges ──────────────────────────────────────────────────────
  const dailyCharges     = visit?.dailyCharges || [];
  const ipTreatments     = visit?.ipTreatments || [];
  const dailyChargeTotal = dailyCharges.reduce((s, c) => s + (c.amount || 0), 0);
  const ipTreatTotal     = ipTreatments.reduce((s, t) => s + (t.cost   || 0), 0);
  const isIP             = visit?.admitted === true;

  // Grand total: OP treatments + IP treatments + daily charges
  const baseTotal  = isIP ? (ipTreatTotal + dailyChargeTotal) : total;
  const tax        = baseTotal * 0.05;
  const finalTotal = baseTotal + tax;

  return (
    <div className="p-6 bg-gray-100 min-h-screen">

      {/* 🧾 INVOICE */}
      <div
        ref={invoiceRef}
        className="max-w-4xl mx-auto bg-white p-8 shadow-lg rounded"
      >

        {/* HEADER */}
        <div className="flex justify-between border-b pb-4 mb-4">
          <div>
            <h1 className="text-2xl font-bold text-blue-600">
              City Hospital
            </h1>
            <p>Chennai</p>
          </div>

          <div className="text-right">
            <h2 className="text-xl font-bold">INVOICE</h2>
            <p><b>Visit ID:</b> {visit.visit_id}</p>
            <p>{new Date().toLocaleDateString()}</p>
          </div>
        </div>

        {/* PATIENT */}
        <div className="grid grid-cols-2 mb-4">
          <div>
            <h3 className="font-semibold">Patient</h3>
            <p>Name: {patient?.name}</p>
            <p>Age: {patient?.age}</p>
          </div>

          <div>
            <h3 className="font-semibold">Status</h3>
            <p>{bill?.status}</p>
            {/* IP Badge */}
            {isIP && (
              <span style={{
                display: "inline-block", marginTop: 6,
                background: visit.dischargeDetails?.discharged ? "#f1f5f9" : "#dbeafe",
                color: visit.dischargeDetails?.discharged ? "#475569" : "#1d4ed8",
                borderRadius: 20, padding: "2px 10px", fontSize: 12, fontWeight: 600
              }}>
                🛏️ {visit.dischargeDetails?.discharged ? "Discharged" : `IP · ${visit.admissionDetails?.ward || "Admitted"}`}
              </span>
            )}
          </div>
        </div>

        {/* IP ADMISSION INFO */}
        {isIP && visit.admissionDetails?.ward && (
          <div style={{ padding: "10px 14px", background: "#f8faff", borderRadius: 10, marginBottom: 16, fontSize: 13, color: "#475569" }}>
            <b>Ward:</b> {visit.admissionDetails.ward} &nbsp;|&nbsp;
            <b>Room:</b> {visit.admissionDetails.roomNumber} &nbsp;|&nbsp;
            <b>Bed:</b> {visit.admissionDetails.bedNumber} &nbsp;|&nbsp;
            <b>Doctor:</b> {visit.admissionDetails.attendingDoctor}
          </div>
        )}

        {/* DIAGNOSIS */}
        <div className="mb-4">
          <h3 className="font-semibold">Diagnosis</h3>
          {diagnosis.length > 0 ? (
            diagnosis.map((d, i) => (
              <p key={i}>
                {d.code} - {d.description}
              </p>
            ))
          ) : (
            <p>No diagnosis</p>
          )}
        </div>

        {/* OP TREATMENTS */}
        {treatments.length > 0 && (
          <div className="mb-4">
            <h3 className="font-semibold mb-2">Treatments (OP)</h3>
            <table className="w-full border">
              <thead className="bg-gray-200">
                <tr>
                  <th className="border p-2">Code</th>
                  <th className="border p-2">Description</th>
                  <th className="border p-2">Cost</th>
                </tr>
              </thead>
              <tbody>
                {treatments.map((t, i) => (
                  <tr key={i} className="text-center">
                    <td className="border p-2">{t.code}</td>
                    <td className="border p-2">{t.description}</td>
                    <td className="border p-2">₹{t.cost}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* IP TREATMENTS */}
        {isIP && ipTreatments.length > 0 && (
          <div className="mb-4">
            <h3 className="font-semibold mb-2">IP Treatments</h3>
            <table className="w-full border">
              <thead style={{ background: "#ede9fe" }}>
                <tr>
                  <th className="border p-2">Date</th>
                  <th className="border p-2">Code</th>
                  <th className="border p-2">Description</th>
                  <th className="border p-2">Cost</th>
                </tr>
              </thead>
              <tbody>
                {ipTreatments.map((t, i) => (
                  <tr key={i} className="text-center">
                    <td className="border p-2">{t.date ? new Date(t.date).toLocaleDateString("en-IN") : "—"}</td>
                    <td className="border p-2">{t.code || "—"}</td>
                    <td className="border p-2">{t.description}</td>
                    <td className="border p-2">₹{t.cost}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* DAILY CHARGES */}
        {isIP && dailyCharges.length > 0 && (
          <div className="mb-4">
            <h3 className="font-semibold mb-2">Daily Charges</h3>
            <table className="w-full border">
              <thead style={{ background: "#e0f2fe" }}>
                <tr>
                  <th className="border p-2">Date</th>
                  <th className="border p-2">Type</th>
                  <th className="border p-2">Note</th>
                  <th className="border p-2">Amount</th>
                </tr>
              </thead>
              <tbody>
                {dailyCharges.map((c, i) => {
                  const col = CHARGE_COLORS[c.chargeType] || "#64748b";
                  return (
                    <tr key={i} className="text-center">
                      <td className="border p-2">{c.date ? new Date(c.date).toLocaleDateString("en-IN") : "—"}</td>
                      <td className="border p-2">
                        <span style={{ background: `${col}18`, color: col, borderRadius: 20, padding: "2px 8px", fontSize: 12, fontWeight: 600 }}>
                          {c.chargeType}
                        </span>
                      </td>
                      <td className="border p-2">{c.note || "—"}</td>
                      <td className="border p-2">₹{c.amount}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* DISCHARGE SUMMARY */}
        {isIP && visit.dischargeDetails?.discharged && (
          <div style={{ padding: "10px 14px", background: "#f0fdf4", borderRadius: 10, marginBottom: 16, fontSize: 13 }}>
            <p><b>Final Diagnosis:</b> {visit.dischargeDetails.finalDiagnosis}</p>
            <p style={{ marginTop: 4 }}><b>Discharge Summary:</b> {visit.dischargeDetails.summary}</p>
          </div>
        )}

        {/* TOTAL */}
        <div className="text-right mt-4">
          {isIP && (
            <>
              {ipTreatments.length > 0 && <p>IP Treatments: ₹{ipTreatTotal}</p>}
              {dailyCharges.length > 0 && <p>Daily Charges: ₹{dailyChargeTotal}</p>}
            </>
          )}
          {!isIP && <p>Subtotal: ₹{total}</p>}
          <p>Tax (5%): ₹{tax.toFixed(2)}</p>
          <p className="text-xl font-bold text-green-600">
            Total: ₹{finalTotal.toFixed(2)}
          </p>
        </div>

        {/* STATUS */}
        <div className="mt-4 text-right">
          <span className={`px-3 py-1 rounded text-white ${
            bill.status === "Paid" ? "bg-green-500" : "bg-red-500"
          }`}>
            {bill.status}
          </span>
        </div>

      </div>

      {/* BUTTONS */}
      <div className="max-w-4xl mx-auto mt-6 flex gap-4 flex-wrap">

        {/* PDF */}
        <button
          onClick={downloadPDF}
          className="bg-blue-600 text-white px-4 py-2 w-full md:w-auto"
        >
          Download PDF
        </button>

        {/* PAY */}
        {bill.status !== "Paid" && (
          <button
            onClick={markPaid}
            className="bg-green-600 text-white px-4 py-2 w-full md:w-auto"
          >
            Mark as Paid
          </button>
        )}

        {/* CLAIM */}
        <button
          onClick={submitClaim}
          disabled={loadingClaim}
          className="bg-purple-600 text-white px-4 py-2 w-full md:w-auto"
        >
          {loadingClaim ? "Submitting..." : "Submit Insurance Claim"}
        </button>

        {/* IP Details */}
        {isIP && (
          <button
            onClick={() => navigate(`/visit/${visit_id}`)}
            style={{ background: "#0ea5e9", color: "#fff", padding: "8px 16px", border: "none", borderRadius: 4, cursor: "pointer", fontWeight: 600 }}
          >
            🛏️ View IP Details
          </button>
        )}

      </div>

    </div>
  );
}

export default BillingPage;