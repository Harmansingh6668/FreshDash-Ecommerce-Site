import "../../styles/Header.css";
import { Link } from "react-router-dom";

function Header() {
  return (
    <header className="admin-header">
      <div className="header-title">
        <span className="header-eyebrow">Store overview</span>
        <h1>Good morning, Admin</h1>
        <p>Here is what is happening with your fresh market today.</p>
      </div>

      <div className="header-right">
        <button className="notification-button">🔔</button>

        <Link className="admin-profile" to="/admin/profile">
          <div className="profile-avatar">A</div>

          <div className="profile-info">
            <strong>Admin</strong>
            <span>Administrator</span>
          </div>
        </Link>
      </div>
    </header>
  );
}

export default Header;