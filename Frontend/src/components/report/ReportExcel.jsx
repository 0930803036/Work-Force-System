import { useState, useEffect } from "react";

const API_URL = "http://localhost:7000/api";

export function ReportExcel() {
  const today = new Date().toISOString().split("T")[0];

  const [reportType, setReportType] = useState("daily");
  const [date, setDate] = useState("");
  const [week, setWeek] = useState("");
  const [month, setMonth] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [filters, setFilters] = useState({
    channel: "",
    skill: "",
    coachGroup: "",
    supervisorGroup: "",
    statusName: "",
  });

  const [options, setOptions] = useState({
    channels: [],
    skills: [],
    coachGroups: [],
    supervisorGroups: [],
    statusNames: [],
  });

  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(false);

  const itemsPerPage = 50;
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(reportData.length / itemsPerPage);
  const currentData = reportData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const res = await fetch(`${API_URL}/reports/options`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        const data = await res.json();
        setOptions({
          channels: data.channels || [],
          skills: data.skills || [],
          coachGroups: data.coachGroups || [],
          supervisorGroups: data.supervisorGroups || [],
          statusNames: data.statusNames || [],
        });
      } catch (err) {
        console.error("Failed to fetch filter options:", err);
      }
    };
    fetchOptions();
  }, []);

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const buildQuery = () => {
    const params = new URLSearchParams();
    params.set("type", reportType);

    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });

    if (reportType === "daily" && date) params.set("date", date);
    else if (reportType === "weekly" && week) params.set("week", week);
    else if (reportType === "monthly" && month) params.set("month", month);
    else if (reportType === "custom" && startDate && endDate) {
      params.set("startDate", startDate);
      params.set("endDate", endDate);
    }

    return params.toString();
  };

  const fetchReport = async () => {
    setLoading(true);
    try {
      const query = buildQuery();
      const res = await fetch(`${API_URL}/reports/data?${query}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`HTTP ${res.status}: ${text}`);
      }
      const data = await res.json();
      setReportData(data);
      setCurrentPage(1);
    } catch (err) {
      console.error("Failed to fetch report:", err);
      alert("Failed to fetch report. Check console for details.");
    } finally {
      setLoading(false);
    }
  };

  const downloadExcel = async () => {
    try {
      const query = buildQuery();
      const res = await fetch(`${API_URL}/reports/excel?${query}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      if (!res.ok) {
        const text = await res.text();
        console.error("Failed to download file:", text);
        alert(`Download failed: ${res.status} ${res.statusText}`);
        return;
      }
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "Status_Request.xlsx";
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Download error:", err);
      alert("Download error. Check console for details.");
    }
  };

  return (
    <div className="container mt-3">
      <h6  className="mb-2 fw-bold">Viewer Historical Report</h6>

      {/* Report Type + Date Inputs + Buttons Inline */}
      <div className="row mb-3 g-2 align-items-end">
        {/* Report Type */}
        <div className="col-md-2">
          <div className="form-floating w-100">
            <select
              className="form-select"
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              id="reportType"
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="custom">Custom Range</option>
            </select>
            <label htmlFor="reportType">Report Type</label>
          </div>
        </div>

        {/* Date Inputs */}
        {reportType === "daily" && (
          <div className="col-md-2">
            <div className="form-floating w-100">
              <input
                type="date"
                className="form-control"
                value={date}
                max={today}
                onChange={(e) => setDate(e.target.value)}
                id="date"
              />
              <label htmlFor="date">Select Date</label>
            </div>
          </div>
        )}
        {reportType === "weekly" && (
          <div className="col-md-2">
            <div className="form-floating w-100">
              <input
                type="week"
                className="form-control"
                value={week}
                onChange={(e) => setWeek(e.target.value)}
                id="week"
              />
              <label htmlFor="week">Select Week</label>
            </div>
          </div>
        )}
        {reportType === "monthly" && (
          <div className="col-md-2">
            <div className="form-floating w-100">
              <input
                type="month"
                className="form-control"
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                id="month"
              />
              <label htmlFor="month">Select Month</label>
            </div>
          </div>
        )}
        {reportType === "custom" && (
          <>
            <div className="col-md-2">
              <div className="form-floating w-100">
                <input
                  type="date"
                  className="form-control"
                  value={startDate}
                  max={today}
                  onChange={(e) => setStartDate(e.target.value)}
                  id="startDate"
                />
                <label htmlFor="startDate">Start Date</label>
              </div>
            </div>
            <div className="col-md-2">
              <div className="form-floating w-100">
                <input
                  type="date"
                  className="form-control"
                  value={endDate}
                  max={today}
                  onChange={(e) => setEndDate(e.target.value)}
                  id="endDate"
                />
                <label htmlFor="endDate">End Date</label>
              </div>
            </div>
          </>
        )}

        {/* Buttons Inline */}
        <div className="col-md-3 d-flex gap-2">
          <button
            className="btn btn-outline-primary"
            onClick={fetchReport}
            disabled={loading}
          >
            {loading ? "Loading..." : "Fetch Report"}
          </button>
          <button className="btn btn-outline-success" onClick={downloadExcel}>
            Download Report
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="row mb-3 g-2">
        {[
          { name: "channel", label: "Channel", options: options.channels },
          { name: "skill", label: "Skill", options: options.skills },
          { name: "coachGroup", label: "Coach Group", options: options.coachGroups },
          { name: "supervisorGroup", label: "Supervisor Group", options: options.supervisorGroups },
          { name: "statusName", label: "Request Type", options: options.statusNames },
        ].map((filter, idx) => (
          <div className="col-md" key={idx}>
            <div className="form-floating w-100">
              <select
                name={filter.name}
                value={filters[filter.name]}
                onChange={handleFilterChange}
                className="form-select"
                id={filter.name}
              >
                <option value="">All {filter.label}s</option>
                {(filter.options || []).map((opt, i) => (
                  <option key={i} value={opt}>{opt}</option>
                ))}
              </select>
              <label htmlFor={filter.name}>{filter.label}</label>
            </div>
          </div>
        ))}
      </div>

      {/* Report Table */}
      <div className="table-responsive">
        <table className="table table-striped text-nowrap">
          {currentData.length > 0 && (
            <thead>
              <tr>
                <th>User ID</th>
                <th>Name</th>
                <th>Channel</th>
                <th>Skill</th>
                <th>Manager Group</th>
                <th>Supervisor Group</th>
                <th>Coach Group</th>
                <th>Status Name</th>
                <th>Status Created At</th>
                <th>Approval Status</th>
                <th>Duration</th>
                <th>Reason</th>
              </tr>
            </thead>
          )}
          <tbody>
            {currentData.length === 0 && !loading && (
              <tr>
                <td colSpan="12" className="text-center">No data found</td>
              </tr>
            )}
            {currentData.map((r, idx) => (
              <tr key={idx}>
                <td>{r.userId}</td>
                <td>{r.name}</td>
                <td>{r.channel}</td>
                <td>{r.skill}</td>
                <td>{r.managerGroup}</td>
                <td>{r.supervisorGroup}</td>
                <td>{r.coachGroup}</td>
                <td>{r.statusName}</td>
                <td>{r.statusCreatedAt}</td>
                <td>{r.approvalStatus}</td>
                <td>{r.duration}</td>
                <td>{r.reason}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {reportData.length > 0 && (
        <div className="d-flex justify-content-center align-items-center gap-2 mt-2">
          <button
            className="btn btn-sm btn-outline-primary"
            disabled={currentPage === 1}
            onClick={() => goToPage(currentPage - 1)}
          >
            Prev
          </button>

          {[...Array(totalPages)].map((_, i) => (
            <button
              key={i}
              className={`btn btn-sm ${currentPage === i + 1 ? "btn-primary" : "btn-outline-primary"}`}
              onClick={() => goToPage(i + 1)}
            >
              {i + 1}
            </button>
          ))}

          <button
            className="btn btn-sm btn-outline-primary"
            disabled={currentPage === totalPages}
            onClick={() => goToPage(currentPage + 1)}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
