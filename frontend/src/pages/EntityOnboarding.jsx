import React, { useState } from "react";
import API_BASE_URL from "../config";
import "../styles/Onboarding.css";

const initialEntity = {
  cin: "",
  pan: "",
  sector: "",
  turnover: "",
};
const initialLoan = {
  type: "",
  amount: "",
  tenure: "",
  interest: "",
};

export default function EntityOnboarding({ onSubmit }) {
  const [step, setStep] = useState(1);
  const [entity, setEntity] = useState(initialEntity);
  const [loan, setLoan] = useState(initialLoan);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleEntityChange = (e) => {
    setEntity({ ...entity, [e.target.name]: e.target.value });
  };
  const handleLoanChange = (e) => {
    setLoan({ ...loan, [e.target.name]: e.target.value });
  };
  const validateEntity = () => {
    if (!entity.cin || !entity.pan || !entity.sector || !entity.turnover) {
      setError("Please fill all entity details.");
      return false;
    }
    setError("");
    return true;
  };
  const validateLoan = () => {
    if (!loan.type || !loan.amount || !loan.tenure || !loan.interest) {
      setError("Please fill all loan details.");
      return false;
    }
    setError("");
    return true;
  };
  const handleNext = () => {
    if (validateEntity()) setStep(2);
  };
  const handleBack = () => setStep(1);
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateLoan()) return;
    setError("");
    setSuccess("");
    try {
      const res = await fetch(`${API_BASE_URL}/onboarding/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...entity, ...loan })
      });
      if (!res.ok) throw new Error("Submission failed");
      const data = await res.json();
      setSuccess("Onboarding successful!");
      if (onSubmit) onSubmit(data);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="onboarding-container">
      <h2>Entity Onboarding</h2>
      <form onSubmit={handleSubmit}>
        {step === 1 && (
          <div className="step step-entity">
            <label>CIN: <input name="cin" value={entity.cin} onChange={handleEntityChange} required /></label>
            <label>PAN: <input name="pan" value={entity.pan} onChange={handleEntityChange} required /></label>
            <label>Sector: <input name="sector" value={entity.sector} onChange={handleEntityChange} required /></label>
            <label>Turnover: <input name="turnover" value={entity.turnover} onChange={handleEntityChange} required /></label>
            <button type="button" onClick={handleNext}>Next</button>
          </div>
        )}
        {step === 2 && (
          <div className="step step-loan">
            <label>Loan Type: <input name="type" value={loan.type} onChange={handleLoanChange} required /></label>
            <label>Amount: <input name="amount" value={loan.amount} onChange={handleLoanChange} required /></label>
            <label>Tenure: <input name="tenure" value={loan.tenure} onChange={handleLoanChange} required /></label>
            <label>Interest: <input name="interest" value={loan.interest} onChange={handleLoanChange} required /></label>
            <div className="button-row">
              <button type="button" onClick={handleBack}>Back</button>
              <button type="submit">Submit</button>
            </div>
          </div>
        )}
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}
      </form>
    </div>
  );
}
