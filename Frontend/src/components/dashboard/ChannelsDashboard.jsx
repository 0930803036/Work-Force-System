import { useEffect, useState } from "react";

const BASE_URL = "http://localhost:7000/api";

// Map request types to Bootstrap colors
const typeColors = {
  Available: "success",
  Rest: "primary",
  Briefing: "info",
  Learning: "warning",
  Emergency: "danger",
  "No Type": "dark",
};

export function ChannelsDashboard() {
  const [channels, setChannels] = useState([]);
  const [skills, setSkills] = useState(["All"]);
  const [supervisors, setSupervisors] = useState(["All"]);
  const [coaches, setCoaches] = useState(["All"]);

  const [selectedChannel, setSelectedChannel] = useState("");
  const [selectedSkill, setSelectedSkill] = useState("All");
  const [selectedSupervisor, setSelectedSupervisor] = useState("All");
  const [selectedCoach, setSelectedCoach] = useState("All");

  const [requestTypeData, setRequestTypeData] = useState({});
  const [userCount, setUserCount] = useState(0);
  const [loggedInCount, setLoggedInCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 🔹 Fetch available Channels, Skills, Supervisors, Coaches
  useEffect(() => {
    const fetchUserManagementData = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("No authentication token found. Please login.");
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`${BASE_URL}/users`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) throw new Error("Failed to fetch user management data");

        const data = await res.json();

        const uniqueChannels = [...new Set(data.map((user) => user.channel))];
        const uniqueSkills = ["All", ...new Set(data.map((user) => user.skill))];
        const uniqueSupervisors = ["All", ...new Set(data.map((user) => user.supervisorGroup))];
        const uniqueCoaches = ["All", ...new Set(data.map((user) => user.coachGroup))];

        setChannels(uniqueChannels);
        setSkills(uniqueSkills);
        setSupervisors(uniqueSupervisors);
        setCoaches(uniqueCoaches);

        if (uniqueChannels.length > 0) setSelectedChannel(uniqueChannels[0]);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUserManagementData();
  }, []);

  // 🔹 Fetch Dashboard Data
  useEffect(() => {
    if (!selectedChannel) return;

    let intervalId;

    const fetchRequestTypeCounts = async (channel, skill, supervisorGroup, coachGroup) => {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("No authentication token found. Please login.");
        setLoading(false);
        return;
      }

      try {
        const params = new URLSearchParams();
        if (skill && skill !== "All") params.append("skill", skill);
        if (supervisorGroup && supervisorGroup !== "All") params.append("supervisorGroup", supervisorGroup);
        if (coachGroup && coachGroup !== "All") params.append("coachGroup", coachGroup);

        const url = `${BASE_URL}/dashboard/${channel}?${params.toString()}`;
        const res = await fetch(url, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        const contentType = res.headers.get("content-type");
        if (!res.ok) {
          const text = await res.text();
          throw new Error(`Request failed: ${res.status} - ${text}`);
        } else if (!contentType || !contentType.includes("application/json")) {
          const text = await res.text();
          throw new Error(`Expected JSON, but got HTML or text:\n${text}`);
        }

        const data = await res.json();
        setRequestTypeData(data.data || {});
        setUserCount(data.userCount || 0);
        setLoggedInCount(data.loggedInCount || 0);
        setError(null);
      } catch (err) {
        console.error("Dashboard fetch error:", err);
        setError(err.message);
        setRequestTypeData({});
        setUserCount(0);
        setLoggedInCount(0);
      } finally {
        setLoading(false);
      }
    };

    // Initial fetch
    fetchRequestTypeCounts(selectedChannel, selectedSkill, selectedSupervisor, selectedCoach);

    // Refresh every 5 seconds
    intervalId = setInterval(() => {
      fetchRequestTypeCounts(selectedChannel, selectedSkill, selectedSupervisor, selectedCoach);
    }, 5000);

    return () => clearInterval(intervalId);
  }, [selectedChannel, selectedSkill, selectedSupervisor, selectedCoach]);

  // 🔹 UI
  return (
    <div className="container bg-light rounded p-4" style={{ maxWidth: 1000, margin: "20px auto" }}>
      <h4 className="text-center text-success fw-bold mb-3">
        Live Dashboard of: {selectedChannel || "—"} Channel{" "}
        {selectedSkill !== "All" && <span>({selectedSkill} skill)</span>}{" "}
        {selectedSupervisor !== "All" && <span>- {selectedSupervisor} Group</span>}{" "}
        {selectedCoach !== "All" && <span>- {selectedCoach} Coach</span>}
      </h4>

      {/* Filters */}
      <div className="row mb-3">
        <div className="col-md-3">
          <label htmlFor="channel-select" className="form-label">Channel</label>
          <select
            id="channel-select"
            className="form-select"
            value={selectedChannel}
            onChange={(e) => {
              setSelectedChannel(e.target.value);
              setLoading(true);
            }}
          >
            {channels.map((ch) => (
              <option key={ch} value={ch}>{ch}</option>
            ))}
          </select>
        </div>

        <div className="col-md-3">
          <label htmlFor="skill-select" className="form-label">Skill</label>
          <select
            id="skill-select"
            className="form-select"
            value={selectedSkill}
            onChange={(e) => {
              setSelectedSkill(e.target.value);
              setLoading(true);
            }}
          >
            {skills.map((skill) => (
              <option key={skill} value={skill}>{skill}</option>
            ))}
          </select>
        </div>

        <div className="col-md-3">
          <label htmlFor="supervisor-select" className="form-label">Supervisor</label>
          <select
            id="supervisor-select"
            className="form-select"
            value={selectedSupervisor}
            onChange={(e) => {
              setSelectedSupervisor(e.target.value);
              setLoading(true);
            }}
          >
            {supervisors.map((sup) => (
              <option key={sup} value={sup}>{sup}</option>
            ))}
          </select>
        </div>

        <div className="col-md-3">
          <label htmlFor="coach-select" className="form-label">Coach</label>
          <select
            id="coach-select"
            className="form-select"
            value={selectedCoach}
            onChange={(e) => {
              setSelectedCoach(e.target.value);
              setLoading(true);
            }}
          >
            {coaches.map((coach) => (
              <option key={coach} value={coach}>{coach}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Loading / Error */}
      {loading && <p>Loading live dashboard...</p>}
      {error && <p className="text-danger">{error}</p>}

      {/* Request Type Buttons */}
      {!loading && !error && (
        <div className="d-flex flex-wrap gap-2 justify-content-center">
          <button
            className="btn btn-dark d-flex flex-column align-items-center py-3"
            style={{ minWidth: "120px", flex: "1 1 120px" }}
          >
            <span>Total Users</span>
            <span className="fw-bold fs-4 mt-1">{loggedInCount}</span>
          </button>

          {Object.entries(requestTypeData).map(([type, count]) => {
            const btnColor = typeColors[type] || "secondary";
            return (
              <button
                key={type}
                className={`btn btn-${btnColor} d-flex flex-column align-items-center py-3`}
                style={{ minWidth: "120px", flex: "1 1 120px" }}
              >
                <span>{type === "Unknown" ? "No Type" : type}</span>
                <span className="fw-bold fs-4 mt-1">{count}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
