import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import API from "../services/api";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";


function BillingPage() {
  const { visit_id } = useParams();

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

  const tax = total * 0.05;
  const finalTotal = total + tax;

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
          </div>
        </div>

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

        {/* TREATMENTS */}
        <table className="w-full border">
          <thead className="bg-gray-200">
            <tr>
              <th className="border p-2">Code</th>
              <th className="border p-2">Description</th>
              <th className="border p-2">Cost</th>
            </tr>
          </thead>

          <tbody>
            {treatments.length > 0 ? (
              treatments.map((t, i) => (
                <tr key={i} className="text-center">
                  <td className="border p-2">{t.code}</td>
                  <td className="border p-2">{t.description}</td>
                  <td className="border p-2">₹{t.cost}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3" className="text-center p-4">
                  No treatments
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* TOTAL */}
        <div className="text-right mt-4">
          <p>Subtotal: ₹{total}</p>
          <p>Tax (5%): ₹{tax}</p>
          <p className="text-xl font-bold text-green-600">
            Total: ₹{finalTotal}
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

      </div>

    </div>
  );
}

export default BillingPage;