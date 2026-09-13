import React, { useEffect, useState } from "react";
import axios from "axios";

function SuperAdminDashboard() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  const API =
    process.env.REACT_APP_API_BASE_URL ||
    "http://localhost:5000";

  // Get pending requests
  const fetchRequests = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await axios.get(
        `${API}/api/hospital-admin/requests`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setRequests(response.data);
    } catch (err) {
      console.error("Error fetching requests:", err);
      alert(
        err.response?.data?.error ||
          "Failed to load requests"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  // Approve request
  const approveRequest = async (id) => {
    try {
      setActionLoading(id);

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

      alert("Hospital Admin approved successfully.");

      setRequests((prev) =>
        prev.filter((request) => request._id !== id)
      );
    } catch (err) {
      console.error("Approval error:", err);

      alert(
        err.response?.data?.error ||
          "Failed to approve request"
      );
    } finally {
      setActionLoading(null);
    }
  };

  // Reject request
  const rejectRequest = async (id) => {
    const reason = window.prompt(
      "Enter rejection reason:"
    );

    if (reason === null) {
      return;
    }

    try {
      setActionLoading(id);

      const token = localStorage.getItem("token");

      await axios.patch(
        `${API}/api/hospital-admin/requests/${id}/reject`,
        {
          reason,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert("Request rejected.");

      setRequests((prev) =>
        prev.filter((request) => request._id !== id)
      );
    } catch (err) {
      console.error("Rejection error:", err);

      alert(
        err.response?.data?.error ||
          "Failed to reject request"
      );
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div
      style={{
        padding: "30px",
        maxWidth: "1000px",
        margin: "0 auto",
      }}
    >
      <h1>Super Admin Dashboard</h1>

      <p>
        Review and verify Hospital Admin requests.
      </p>

      {loading ? (
        <p>Loading requests...</p>
      ) : requests.length === 0 ? (
        <p>No pending Hospital Admin requests.</p>
      ) : (
        <div>
          {requests.map((request) => (
            <div
              key={request._id}
              style={{
                border: "1px solid #ddd",
                borderRadius: "10px",
                padding: "20px",
                marginBottom: "20px",
              }}
            >
              <h2>
                {request.user?.name || "Unknown User"}
              </h2>

              <p>
                <strong>Email:</strong>{" "}
                {request.user?.email}
              </p>

              <p>
                <strong>Hospital:</strong>{" "}
                {request.hospital?.name}
              </p>

              <p>
                <strong>Address:</strong>{" "}
                {request.hospital?.address}
              </p>

              <p>
                <strong>Official Email:</strong>{" "}
                {request.officialEmail}
              </p>

              <p>
                <strong>Designation:</strong>{" "}
                {request.designation}
              </p>

              <p>
                <strong>Status:</strong>{" "}
                {request.status}
              </p>

              <div style={{ marginTop: "15px" }}>
                <button
                  onClick={() =>
                    approveRequest(request._id)
                  }
                  disabled={
                    actionLoading === request._id
                  }
                  style={{
                    marginRight: "10px",
                    padding: "10px 20px",
                    cursor: "pointer",
                  }}
                >
                  {actionLoading === request._id
                    ? "Processing..."
                    : "Approve"}
                </button>

                <button
                  onClick={() =>
                    rejectRequest(request._id)
                  }
                  disabled={
                    actionLoading === request._id
                  }
                  style={{
                    padding: "10px 20px",
                    cursor: "pointer",
                  }}
                >
                  Reject
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