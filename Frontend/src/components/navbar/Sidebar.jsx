import { useEffect} from "react";

export function Sidebar({ onMenuSelect }) {
  useEffect(() => {
    const sidebar = document.getElementById("sidebar");
    const toggleBtn = document.getElementById("toggleBtn");
    const hamburger = document.getElementById("hamburger");

    if (!sidebar || !toggleBtn || !hamburger) return;

    // Create tooltip element
    const tooltip = document.createElement("div");
    tooltip.className = "tooltip-custom";
    document.body.appendChild(tooltip);

    // Toggle sidebar
    function toggleSidebar() {
      sidebar.classList.toggle("expanded");
      toggleBtn.classList.toggle("bi-chevron-left");
      toggleBtn.classList.toggle("bi-chevron-right");
      tooltip.style.opacity = "0"; // hide tooltip

      // Dispatch custom event for main content
      const event = new CustomEvent("sidebarToggle", {
        detail: { expanded: sidebar.classList.contains("expanded") },
      });
      window.dispatchEvent(event);
    }

    toggleBtn.addEventListener("click", toggleSidebar);
    hamburger.addEventListener("click", toggleSidebar);

    // Show tooltip on hover
    const items = sidebar.querySelectorAll("li");
    function handleMouseEnter(item) {
      return () => {
        if (sidebar.classList.contains("expanded")) return;
        const label = item.querySelector("span")?.textContent;
        if (!label) return;

        tooltip.textContent = label;
        tooltip.style.opacity = "1";

        const rect = item.getBoundingClientRect();
        tooltip.style.top = `${rect.top + rect.height / 2 - tooltip.offsetHeight / 2}px`;
        tooltip.style.left = `${rect.right + 12}px`;
      };
    }

    function handleMouseLeave() {
      tooltip.style.opacity = "0";
    }

    items.forEach((item) => {
      const enterFn = handleMouseEnter(item);
      item.addEventListener("mouseenter", enterFn);
      item.addEventListener("mouseleave", handleMouseLeave);

      // store references for cleanup
      item._enterFn = enterFn;
    });

    return () => {
      toggleBtn.removeEventListener("click", toggleSidebar);
      hamburger.removeEventListener("click", toggleSidebar);
      items.forEach((item) => {
        item.removeEventListener("mouseenter", item._enterFn);
        item.removeEventListener("mouseleave", handleMouseLeave);
        delete item._enterFn;
      });
      tooltip.remove();
    };
  }, []);

  return (
    <div className="sidebar" id="sidebar">
      <div className="top-row">
        <i className="bi bi-list hamburger" id="hamburger"></i>
        <span className="brand">TaskFlow</span>
        <i className="bi bi-chevron-right toggle-btn" id="toggleBtn"></i>
      </div>

      <ul className="nav flex-column">
        <li onClick={() => onMenuSelect("Dashboard")}><i className="bi bi-grid"></i><span>Dashboard</span></li>
        <li onClick={() => onMenuSelect("Manage Users")}><i className="bi bi-people"></i><span>Manage Users</span></li>
        <li onClick={() => onMenuSelect("Requests")}><i className="bi bi-check2-square"></i><span>Requests</span></li>
        <li onClick={() => onMenuSelect("Search")}><i className="bi bi-search"></i><span>Search</span></li>
        <li onClick={() => onMenuSelect("Activity")}><i className="bi bi-bar-chart"></i><span>Activity</span></li>
        <li onClick={() => onMenuSelect("Notifications")}><i className="bi bi-bell"></i><span>Notifications</span></li>
        <li onClick={() => onMenuSelect("Settings")}><i className="bi bi-gear"></i><span>Settings</span></li>
        <li onClick={() => onMenuSelect("Report")}><i className="bi bi-flag"></i><span>Report</span></li>
        <li onClick={() => onMenuSelect("Support")}><i className="bi bi-info-circle"></i><span>Support</span></li>
        <li onClick={() => onMenuSelect("Profile")}><i className="bi bi-person-circle profile-icon"></i><span>Profile</span></li>
      </ul>
    </div>
  );
}
