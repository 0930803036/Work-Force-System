const sidebar = document.getElementById("sidebar");
const toggleBtn = document.getElementById("toggleBtn");
const hamburger = document.getElementById("hamburger");
const hamburgerTooltip = hamburger.nextElementSibling;

// Toggle sidebar expand/collapse
function toggleSidebar() {
  sidebar.classList.toggle("expanded");
  toggleBtn.classList.toggle("bi-chevron-left");
  toggleBtn.classList.toggle("bi-chevron-right");
}

toggleBtn.addEventListener("click", toggleSidebar);
hamburger.addEventListener("click", toggleSidebar);

// Auto-expand sidebar when clicking any list item
document.querySelectorAll('.sidebar li').forEach(li => {
  const tooltip = li.querySelector('.tooltip-custom');

  // Expand sidebar on click
  li.addEventListener('click', () => {
    sidebar.classList.add("expanded");
    toggleBtn.classList.add("bi-chevron-left");
    toggleBtn.classList.remove("bi-chevron-right");
  });

  // Tooltip show/hide on hover
  li.addEventListener('mouseenter', () => {
    if (!sidebar.classList.contains('expanded') && tooltip) {
      const rect = li.getBoundingClientRect();
      tooltip.style.top = rect.top + rect.height / 2 - tooltip.offsetHeight / 2 + 'px';
      tooltip.style.left = sidebar.offsetWidth + 14 + 'px';
      tooltip.style.opacity = 1;
    }
  });
  li.addEventListener('mouseleave', () => {
    if (tooltip) tooltip.style.opacity = 0;
  });
});

// Hamburger tooltip
hamburger.addEventListener('mouseenter', () => {
  if (!sidebar.classList.contains('expanded')) {
    const rect = hamburger.getBoundingClientRect();
    hamburgerTooltip.style.top = rect.top + rect.height / 2 - hamburgerTooltip.offsetHeight / 2 + 'px';
    hamburgerTooltip.style.left = sidebar.offsetWidth + 14 + 'px';
    hamburgerTooltip.style.opacity = 1;
  }
});
hamburger.addEventListener('mouseleave', () => {
  hamburgerTooltip.style.opacity = 0;
});