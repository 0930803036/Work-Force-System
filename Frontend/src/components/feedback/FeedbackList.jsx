import React, { useEffect, useState, useRef } from "react";

export function FeedbackList() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [toastMessage, setToastMessage] = useState("");
  const [toastSuccess, setToastSuccess] = useState(true);

  const BASE_URL = "http://localhost:7000/api";
  const token = localStorage.getItem("token");

  const toastRef = useRef(null);
  const confirmModalRef = useRef(null);

  // Show toast
  const showToast = (message, success = true) => {
    setToastMessage(message);
    setToastSuccess(success);
    const toast = new window.bootstrap.Toast(toastRef.current);
    toast.show();
  };

  // Fetch feedbacks
  const fetchFeedbacks = async () => {
    try {
      const res = await fetch(`${BASE_URL}/feedback`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      if (!res.ok) {
        showToast(data.error || "Failed to fetch feedback", false);
      } else {
        setFeedbacks(data);
      }
    } catch (err) {
      showToast("Network error: " + err.message, false);
    }
  };

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  // Open confirmation modal
  const confirmDelete = (userId) => {
    setSelectedUserId(userId);
    const modal = new window.bootstrap.Modal(confirmModalRef.current);
    modal.show();
  };

  // Delete feedback
  const handleDelete = async () => {
    try {
      const res = await fetch(`${BASE_URL}/feedback/${selectedUserId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      if (!res.ok) {
        showToast(data.error || "Failed to delete feedback", false);
      } else {
        showToast(data.message || "Feedback deleted successfully", true);
        fetchFeedbacks();
      }
    } catch (err) {
      showToast("Network error: " + err.message, false);
    }
  };

  return (
    <div style={{ maxWidth: "700px", margin: "50px auto" }}>
      <h2>User Feedback</h2>

      {feedbacks.length === 0 ? (
        <p>No feedback available.</p>
      ) : (
        <ul className="list-group">
          {feedbacks.map((fb) => {
            const canDelete =
              fb.userId === parseInt(localStorage.getItem("userId")) ||
              localStorage.getItem("role") === "admin";
            return (
              <li
                key={fb.id}
                className="list-group-item d-flex justify-content-between align-items-start"
              >
                <div>
                  <p>{fb.comment}</p>
                  <small className="text-muted">
                    By: {fb.UserManagment?.firstName || "Unknown"} (ID: {fb.userId}) |{" "}
                    {new Date(fb.createdAt).toLocaleString()}
                  </small>
                </div>
                {canDelete && (
                  <button
                    className="btn btn-sm btn-danger"
                    onClick={() => confirmDelete(fb.userId)}
                  >
                    Delete
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      )}

      {/* ✅ Confirmation Modal */}
      <div
        className="modal fade"
        ref={confirmModalRef}
        tabIndex="-1"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content border-danger">
            <div className="modal-header">
              <h5 className="modal-title text-danger">Confirm Deletion</h5>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body">
              Are you sure you want to delete this feedback?
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                data-bs-dismiss="modal"
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-danger"
                data-bs-dismiss="modal"
                onClick={handleDelete}
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ✅ Toast for success/error messages */}
      <div
        className={`toast align-items-center text-bg-${toastSuccess ? "success" : "danger"} border-0 position-fixed bottom-0 end-0 m-3`}
        role="alert"
        aria-live="assertive"
        aria-atomic="true"
        ref={toastRef}
      >
        <div className="d-flex">
          <div className="toast-body">{toastMessage}</div>
          <button
            type="button"
            className="btn-close btn-close-white me-2 m-auto"
            data-bs-dismiss="toast"
            aria-label="Close"
          ></button>
        </div>
      </div>
    </div>
  );
}
