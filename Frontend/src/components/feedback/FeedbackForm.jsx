import React, { useState, useRef } from "react";
import { FeedbackList } from "./FeedbackList";

export function FeedbackForm() {
  const [comment, setComment] = useState("");
  const [toastMessage, setToastMessage] = useState("");
  const [toastSuccess, setToastSuccess] = useState(true);

  const BASE_URL = "http://localhost:7000/api"; // Your backend URL
  const token = localStorage.getItem("token"); // JWT stored in localStorage

  const toastRef = useRef(null);

  // Show toast
  const showToast = (message, success = true) => {
    setToastMessage(message);
    setToastSuccess(success);
    const toast = new window.bootstrap.Toast(toastRef.current);
    toast.show();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!comment.trim()) {
      showToast("Comment cannot be empty", false);
      return;
    }

    try {
      const res = await fetch(`${BASE_URL}/feedback`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ comment }),
      });

      const data = await res.json();

      if (!res.ok) {
        showToast(data.error || "Failed to submit feedback", false);
      } else {
        showToast("Feedback submitted successfully!", true);
        setComment(""); // Clear textarea
      }
    } catch (err) {
      showToast("Network error: " + err.message, false);
    }
  };

  return (
    <div style={{ maxWidth: "500px", margin: "50px auto" }}>
      <h2>Submit Feedback</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <textarea
            className="form-control"
            placeholder="Enter your feedback..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={5}
          />
        </div>
        <button className="btn btn-primary" type="submit">
          Submit
        </button>
      </form>

      {/* ✅ Toast for success/error messages */}
      <div
        className={`toast align-items-center text-bg-${
          toastSuccess ? "success" : "danger"
        } border-0 position-fixed bottom-0 end-0 m-3`}
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

      <FeedbackList />
    </div>
  );
}
