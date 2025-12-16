import { useState } from 'react';

const UploadUsers = () => {
  const [file, setFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState('');
  const [loading, setLoading] = useState(false);

  const API_URL = "http://localhost:7000/api";

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setUploadStatus('');
  };

  const handleUpload = async (e) => {
    e.preventDefault();

    if (!file) {
      setUploadStatus('Please select a file.');
      return;
    }

    const formData = new FormData();
    formData.append('usersData', file); // <-- Must match backend

    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/users/bulk-upload`, {
        method: 'POST',
        body: formData
      });

      const contentType = response.headers.get("content-type");

      if (!contentType || !contentType.includes("application/json")) {
        const text = await response.text();
        throw new Error(`Server error: ${text}`);
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Upload failed');
      }

      setUploadStatus(`✅ ${data.message}. Uploaded ${data.inserted} users.`);
    } catch (err) {
      setUploadStatus(`❌ Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-5">
      <div className="card shadow-sm">
        <div className="card-body">
          <h3 className="card-title mb-4">Upload Users from Excel</h3>
          <form onSubmit={handleUpload}>
            <div className="mb-3">
              <input
                type="file"
                accept=".xlsx"
                className="form-control"
                onChange={handleFileChange}
              />
            </div>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? 'Uploading...' : 'Upload'}
            </button>
          </form>

          {uploadStatus && (
            <div
              className="alert mt-4"
              role="alert"
              style={{ color: uploadStatus.includes('✅') ? 'green' : 'red' }}
            >
              {uploadStatus}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UploadUsers;
