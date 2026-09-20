import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import "./Dashboard.css";

function SuperAdminDashboard() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [feedback, setFeedback] = useState({ type: "", message: "" });

  const API = process.env.REACT_APP_API_BASE_URL || "http://localhost:5000";

  // Fetch pending hospital admin verification requests
  const fetchRequests = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API}/api/hospital-admin/requests`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setRequests(response.data);
    } catch (err) {
      console.error("Error fetching requests:", err);
      setFeedback({
        type: "error",
        message: err.response?.data?.error || "Failed to load pending requests.",
      });
    } finally {
      setLoading(false);
    }
  }, [API]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  // Approve a hospital administrator request
  const approveRequest = async (id) => {
    try {
      setActionLoading(id);
      setFeedback({ type: "", message: "" });
      const token = localStorage.getItem("token");

      await axios.patch(
        `${API}/api/hospital-admin/requests/${id}/approve`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setFeedback({
        type: "success",
        message: "Hospital Administrator verified and approved successfully.",
      });
      setRequests((prev) => prev.filter((r) => r._id !== id));
    } catch (err) {
      console.error("Approval error:", err);
      setFeedback({
        type: "error",
        message: err.response?.data?.error || "Failed to approve request.",
      });
    } finally {
      setActionLoading(null);
    }
  };

  // Reject a hospital administrator request
  const rejectRequest = async (id) => {
    const reason = window.prompt("Enter rejection reason for the applicant:");
    if (reason === null) return;

    try {
      setActionLoading(id);
      setFeedback({ type: "", message: "" });
      const token = localStorage.getItem("token");

      await axios.patch(
        `${API}/api/hospital-admin/requests/${id}/reject`,
        { reason },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setFeedback({
        type: "success",
        message: "Hospital Administrator request rejected.",
      });
      setRequests((prev) => prev.filter((r) => r._id !== id));
    } catch (err) {
      console.error("Rejection error:", err);
      setFeedback({
        type: "error",
        message: err.response?.data?.error || "Failed to reject request.",
      });
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="dashboard-page-container">
      {/* Header Banner */}
      <div className="admin-facility-card">
        <div className="facility-main-info">
          <div className="facility-eyebrow">
            <span>Governance & Access Control</span>
            <span>•</span>
            <span>Super Administrator</span>
          </div>

          <h1 className="facility-name">Hospital Admin Verification Portal</h1>

          <p className="facility-meta-row">
            Review identity and credentials submitted by hospital personnel seeking management access.
            Approving links their account directly to their facility.
          </p>
        </div>

        <div className="facility-status-box">
          <span className="status-counter-pill">
            📋 <strong>{requests.length}</strong> Pending Reviews
          </span>
        </div>
      </div>

      {/* Feedback Banner */}
      {feedback.message && (
        <div
          style={{
            padding: "1rem 1.25rem",
            borderRadius: "12px",
            fontSize: "0.95rem",
            fontWeight: 600,
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            background: feedback.type === "success" ? "#ecfdf5" : "#fef2f2",
            color: feedback.type === "success" ? "#065f46" : "#b91c1c",
            border: `1px solid ${feedback.type === "success" ? "#a7f3d0" : "#fecaca"}`,
          }}
        >
          <span>{feedback.type === "success" ? "✅" : "⚠️"}</span>
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "4rem 1rem", color: "var(--text-secondary)" }}>
          <div style={{ fontSize: "2rem", marginBottom: "1rem" }}>⏳</div>
          <h3>Loading verification queue...</h3>
        </div>
      ) : requests.length === 0 ? (
        /* Empty State */
        <div
          style={{
            background: "var(--surface-bg)",
            border: "1px solid var(--border-color)",
            borderRadius: "16px",
            padding: "3.5rem 2rem",
            textAlign: "center",
            boxShadow: "var(--card-shadow)",
          }}
        >
          <div style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>🎉</div>
          <h3 style={{ margin: "0 0 0.5rem", color: "var(--heading-color)", fontSize: "1.35rem" }}>
            All Verification Requests Processed
          </h3>
          <p style={{ margin: 0, color: "var(--text-secondary)", fontSize: "0.95rem" }}>
            There are currently no pending hospital administrator applications awaiting approval.
          </p>
        </div>
      ) : (
        /* Request Cards */
        <div>
          {requests.map((request) => (
            <div key={request._id} className="superadmin-request-card">
              <div className="request-header-row">
                <div>
                  <h2 className="request-user-title">
                    {request.user?.name || "Applicant Name Unavailable"}
                  </h2>
                  <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                    User Account: <strong>{request.user?.email}</strong>
                  </div>
                </div>

                <span
                  style={{
                    background: "#fef3c7",
                    color: "#b45309",
                    padding: "4px 10px",
                    borderRadius: "6px",
                    fontSize: "0.8rem",
                    fontWeight: 700,
                    textTransform: "uppercase",
                  }}
                >
                  Pending Review
                </span>
              </div>

              {/* Details Grid */}
              <div className="request-details-grid">
                <div className="request-detail-item">
                  <span className="request-detail-label">Requested Hospital</span>
                  <span className="request-detail-value">
                    🏥 {request.hospital?.name || "Unnamed Hospital"}
                  </span>
                </div>

                <div className="request-detail-item">
                  <span className="request-detail-label">Facility Address</span>
                  <span className="request-detail-value">
                    📍 {request.hospital?.address || "Address not provided"}
                  </span>
                </div>

                <div className="request-detail-item">
                  <span className="request-detail-label">Official Work Email</span>
                  <span className="request-detail-value">
                    📧 {request.officialEmail}
                  </span>
                </div>

                <div className="request-detail-item">
                  <span className="request-detail-label">Official Designation</span>
                  <span className="request-detail-value">
                    💼 {request.designation}
                  </span>
                </div>

                <div className="request-detail-item">
                  <span className="request-detail-label">Application Date</span>
                  <span className="request-detail-value">
                    📅 {new Date(request.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="request-actions-bar">
                <button
                  type="button"
                  className="btn-approve"
                  onClick={() => approveRequest(request._id)}
                  disabled={actionLoading === request._id}
                >
                  {actionLoading === request._id
                    ? "Processing..."
                    : "✓ Approve & Grant Admin Rights"}
                </button>

                <button
                  type="button"
                  className="btn-reject"
                  onClick={() => rejectRequest(request._id)}
                  disabled={actionLoading === request._id}
                >
                  ✕ Reject Application
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default SuperAdminDashboard;