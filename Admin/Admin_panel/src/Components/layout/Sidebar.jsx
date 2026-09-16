import { NavLink, useNavigate } from "react-router-dom";
import "../../styles/Sidebar.css";

function Sidebar() {
  const navigate = useNavigate();

  const menuItems = [
    {
      label: "Dashboard",
      path: "/admin/dashboard",
      icon: "▦",
    },
    {
      label: "Products",
      path: "/admin/products",
      icon: "□",
    },
    {
      label: "Categories",
      path: "/admin/categories",
      icon: "◇",
    },
    {
      label: "Orders",
      path: "/admin/orders",
      icon: "≡",
    },
    {
      label: "Settings",
      path: "/admin/settings",
      icon: "⚙",
    },
  ];

  const handleLogout = () => {
    navigate("/login");
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-mark">A</div>

        <div>
          <h2>Harvest</h2>
          <span>Admin workspace</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        <p className="menu-title">MENU</p>

        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `sidebar-link ${isActive ? "active" : ""}`
            }
          >
            <span className="sidebar-icon">{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-bottom">
        <div className="sidebar-status">
          <span className="status-dot"></span>
          <span>Store online</span>
        </div>
        <button className="sidebar-link logout-button" onClick={handleLogout}>
          <span className="sidebar-icon">↪</span>
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;