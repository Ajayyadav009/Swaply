import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { registerUser, clearError } from '../store/slices/authSlice';
import toast from 'react-hot-toast';

const Register = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.auth);
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', confirmPassword: ''
  });

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
  }, [error]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.password)
      return toast.error('All fields are required');
    if (formData.password !== formData.confirmPassword)
      return toast.error('Passwords do not match');
    if (formData.password.length < 6)
      return toast.error('Password must be at least 6 characters');

    const result = await dispatch(registerUser({
      name: formData.name,
      email: formData.email,
      password: formData.password
    }));

    if (registerUser.fulfilled.match(result)) {
      toast.success('Account created! Add your skills now.');
      navigate('/profile');
    }
  };

  return (
    <div style={styles.page}>
      {/* Left Panel */}
      <div style={styles.leftPanel}>
        <div style={styles.leftContent}>
          <div style={styles.bigIcon}>🔄</div>
          <h1 style={styles.brandTitle}>SkillSwap</h1>
          <p style={styles.brandSubtitle}>
            Join thousands of people<br />exchanging skills every day.
          </p>
          <div style={styles.stats}>
            {[['🧑‍🏫', 'Teach', 'Share your expertise'],
              ['🤝', 'Match', 'Find the right person'],
              ['📈', 'Grow', 'Learn something new']
            ].map(([icon, title, desc]) => (
              <div key={title} style={styles.statBox}>
                <span style={styles.statIcon}>{icon}</span>
                <div>
                  <div style={styles.statTitle}>{title}</div>
                  <div style={styles.statDesc}>{desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div style={styles.rightPanel}>
        <div style={styles.formCard}>
          <h2 style={styles.title}>Create your account ✨</h2>
          <p style={styles.subtitle}>It's free and takes 30 seconds</p>

          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Full Name</label>
              <input
                style={styles.input}
                type="text"
                name="name"
                placeholder="John Doe"
                value={formData.name}
                onChange={handleChange}
              />
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Email address</label>
              <input
                style={styles.input}
                type="email"
                name="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Password</label>
              <input
                style={styles.input}
                type="password"
                name="password"
                placeholder="Min 6 characters"
                value={formData.password}
                onChange={handleChange}
              />
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Confirm Password</label>
              <input
                style={styles.input}
                type="password"
                name="confirmPassword"
                placeholder="Repeat password"
                value={formData.confirmPassword}
                onChange={handleChange}
              />
            </div>

            <button
              type="submit"
              style={loading ? styles.btnDisabled : styles.btn}
              disabled={loading}
            >
              {loading ? 'Creating Account...' : 'Create Account →'}
            </button>
          </form>

          <p style={styles.switchText}>
            Already have an account?{' '}
            <Link to="/login" style={styles.link}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

const styles = {
  page: { display: 'flex', minHeight: '100vh', background: '#f8fafc' },
  leftPanel: {
    flex: 1,
    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a78bfa 100%)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: '60px 40px'
  },
  leftContent: { color: '#fff', maxWidth: '380px' },
  bigIcon: { fontSize: '56px', marginBottom: '16px' },
  brandTitle: {
    fontSize: '42px', fontWeight: '800',
    marginBottom: '12px', letterSpacing: '-1px'
  },
  brandSubtitle: {
    fontSize: '18px', lineHeight: '1.6',
    opacity: 0.9, marginBottom: '40px'
  },
  stats: { display: 'flex', flexDirection: 'column', gap: '14px' },
  statBox: {
    display: 'flex', alignItems: 'center', gap: '14px',
    background: 'rgba(255,255,255,0.15)',
    padding: '14px 18px', borderRadius: '10px',
    backdropFilter: 'blur(10px)'
  },
  statIcon: { fontSize: '24px' },
  statTitle: { fontWeight: '700', fontSize: '14px' },
  statDesc: { fontSize: '12px', opacity: 0.85, marginTop: '2px' },
  rightPanel: {
    flex: 1, display: 'flex',
    alignItems: 'center', justifyContent: 'center',
    padding: '40px 24px'
  },
  formCard: { width: '100%', maxWidth: '400px' },
  title: {
    fontSize: '26px', fontWeight: '700',
    color: '#1e293b', marginBottom: '6px'
  },
  subtitle: { color: '#64748b', marginBottom: '28px', fontSize: '15px' },
  form: { display: 'flex', flexDirection: 'column', gap: '16px' },
  inputGroup: { display: 'flex', flexDirection: 'column', gap: '6px' },
  label: { fontSize: '13px', fontWeight: '600', color: '#374151' },
  input: {
    padding: '13px 16px', borderRadius: '10px',
    border: '1.5px solid #e2e8f0', fontSize: '14px',
    color: '#1e293b', background: '#fff'
  },
  btn: {
    padding: '14px', borderRadius: '10px', border: 'none',
    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    color: '#fff', fontSize: '15px', fontWeight: '600',
    cursor: 'pointer', marginTop: '8px',
    boxShadow: '0 4px 14px rgba(99,102,241,0.35)'
  },
  btnDisabled: {
    padding: '14px', borderRadius: '10px', border: 'none',
    background: '#e2e8f0', color: '#94a3b8',
    fontSize: '15px', cursor: 'not-allowed', marginTop: '8px'
  },
  switchText: {
    textAlign: 'center', marginTop: '24px',
    color: '#64748b', fontSize: '14px'
  },
  link: { color: '#6366f1', fontWeight: '600', textDecoration: 'none' }
};

export default Register;