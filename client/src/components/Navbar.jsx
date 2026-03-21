import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield, LogOut } from 'lucide-react';
import NotificationPanel from './NotificationPanel';

const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="brand-logo">
          <Shield className="logo-accent" size={24} />
          <span>Eco<span className="logo-accent">Pulse</span></span>
        </Link>

        <div className="navbar-links">
          {!user ? (
            <>
              <Link to="/login" className="btn btn-ghost">Login</Link>
              <Link to="/register" className="btn btn-primary">Get Started</Link>
            </>
          ) : (
            <>
              <NotificationPanel />
              <span className="navbar-greeting">
                Hello, <strong>{user.name}</strong>
              </span>
              <button onClick={logout} className="btn btn-ghost" id="nav-logout">
                <LogOut size={18} /> Logout
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
