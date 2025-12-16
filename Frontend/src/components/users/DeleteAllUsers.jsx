import { useState } from "react";

const API_URL = "http://localhost:7000/api";


function DeleteAllUsersButton() {
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleDelete = async () => {
    setLoading(true);
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${API_URL}/users/delete-all`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // token added
        },
      });

      const data = await res.json();

      setMessage(
        `Status ${res.status}: ${data.message || data.error || "Failed to delete users."}`
      );
    } catch (err) {
      console.error("Error deleting users:", err);
      setMessage("❌ Something went wrong. Please try again.");
    } finally {
      setLoading(false);
      setShowModal(false);
    }
  };

  return (
    <>
      {/* Delete Button */}
      <button
        className="btn btn-danger"
        onClick={() => setShowModal(true)}
        disabled={loading}
      >
        {loading ? "Deleting..." : "Delete All Users"}
      </button>

      {/* Status message */}
      {message && (
        <p
          className="mt-3 text-center"
          style={{ color: message.includes("❌") ? "red" : "green" }}
        >
          {message}
        </p>
      )}

      {/* Bootstrap Modal */}
      {showModal && (
        <div
          className="modal fade show"
          style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }}
          tabIndex="-1"
          role="dialog"
        >
          <div className="modal-dialog modal-dialog-centered" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title text-danger">Confirm Deletion</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <p>
                  ⚠️ Are you sure you want to delete <strong>ALL users</strong>? This
                  action <strong>cannot be undone</strong>.
                </p>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowModal(false)}
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={handleDelete}
                  disabled={loading}
                >
                  {loading ? "Deleting..." : "Yes, Delete All"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default DeleteAllUsersButton;
