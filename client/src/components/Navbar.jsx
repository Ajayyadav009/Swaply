import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../store/slices/authSlice';
import toast from 'react-hot-toast';

const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
    toast.success('Logged out!');
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav style={styles.nav}>
      <div style={styles.container}>

        {/* Logo */}
        <Link to="/" style={styles.logo}>
          <span style={styles.logoIcon}>🔄</span>
          <span style={styles.logoText}>SkillSwap</span>
        </Link>

        {/* Nav Links */}
        <div style={styles.links}>
          <Link
            to="/"
            style={isActive('/') ? styles.linkActive : styles.link}
          >
            🏠 Browse
          </Link>
          <Link
            to="/profile"
            style={isActive('/profile') ? styles.linkActive : styles.link}
          >
            ⚙️ Profile
          </Link>
        </div>

        {/* Right Side */}
        <div style={styles.right}>
          <div style={styles.userInfo}>
            <div style={styles.avatar}>
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <span style={styles.userName}>{user?.name}</span>
          </div>
          <button onClick={handleLogout} style={styles.logoutBtn}>
            Logout
          </button>
        </div>

      </div>
    </nav>
  );
};

const styles = {
  nav: {
    background: '#ffffff',
    borderBottom: '1px solid #e2e8f0',
    position: 'sticky',
    top: 0,
    zIndex: 100,
    boxShadow: '0 1px 3px rgba(0,0,0,0.06)'
  },
  container: {
    maxWidth: '1100px',
    margin: '0 auto',
    padding: '0 24px',
    height: '64px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    textDecoration: 'none'
  },
  logoIcon: { fontSize: '22px' },
  logoText: {
    fontSize: '20px',
    fontWeight: '700',
    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent'
  },
  links: { display: 'flex', gap: '8px' },
  link: {
    padding: '8px 16px',
    borderRadius: '8px',
    textDecoration: 'none',
    color: '#64748b',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'all 0.2s'
  },
  linkActive: {
    padding: '8px 16px',
    borderRadius: '8px',
    textDecoration: 'none',
    color: '#6366f1',
    fontSize: '14px',
    fontWeight: '600',
    background: '#eef2ff'
  },
  right: { display: 'flex', alignItems: 'center', gap: '12px' },
  userInfo: { display: 'flex', alignItems: 'center', gap: '8px' },
  avatar: {
    width: '34px',
    height: '34px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '700',
    fontSize: '14px'
  },
  userName: { fontSize: '14px', fontWeight: '500', color: '#374151' },
  logoutBtn: {
    padding: '7px 16px',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
    background: '#fff',
    color: '#64748b',
    fontSize: '13px',
    fontWeight: '500',
    cursor: 'pointer'
  }
};

export default Navbar;