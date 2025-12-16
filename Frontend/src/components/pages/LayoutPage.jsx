import { Navbar } from "../navbar/Navbar";

export function Layout({ children }) {
  return (
    <>
      {/* Full-width header */}
<div
  className="bg-light text-success border-bottom fw-bold w-100 position-sticky top-0"
  style={{ zIndex: 1040 }}
>
  <div
    style={{
      overflow: "hidden",
      whiteSpace: "nowrap",
      backgroundColor: "#8BC53F"
    }}
  >
    <h5 className="m-1 text-light fw-bold p-1 " style={{display: "inline-block", animation: "scroll-left 20s linear infinite"}}>
    Briefing and Leave Management System
    </h5>
    <img src="/src/assets/et_logo.png" alt="ET Logo" style={{height: 40,marginRight: 5,float: 'right', padding: '2px'}}
/>

  </div>
</div>


      {/* Sidebar + Main content */}
      <div className="container-fluid">
        <div className="row">
          {/* Sidebar */}
          <Navbar />

          {/* Main content (with left margin to avoid overlapping sidebar) */}
          <div
            className="col">
            {children}
          </div>
        </div>
      </div>
    </>
  );
}