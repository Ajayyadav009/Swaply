import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser, clearError } from '../store/slices/authSlice';
import toast from 'react-hot-toast';

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.auth);
  const [formData, setFormData] = useState({ email: '', password: '' });

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
    if (!formData.email || !formData.password)
      return toast.error('All fields are required');

    const result = await dispatch(loginUser(formData));
    if (loginUser.fulfilled.match(result)) {
      toast.success('Welcome back!');
      navigate('/');
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
            Teach what you know.<br />Learn what you don't.
          </p>
          <div style={styles.featureList}>
            {['🎯 Find your perfect skill match',
              '💬 Chat in real time',
              '⭐ Rate your experience'].map((f, i) => (
              <div key={i} style={styles.featureItem}>{f}</div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div style={styles.rightPanel}>
        <div style={styles.formCard}>
          <h2 style={styles.title}>Welcome back 👋</h2>
          <p style={styles.subtitle}>Sign in to your account</p>

          <form onSubmit={handleSubmit} style={styles.form}>
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
                placeholder="Your password"
                value={formData.password}
                onChange={handleChange}
              />
            </div>

            <button
              type="submit"
              style={loading ? styles.btnDisabled : styles.btn}
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Sign In →'}
            </button>
          </form>

          <p style={styles.switchText}>
            Don't have an account?{' '}
            <Link to="/register" style={styles.link}>Create one free</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

const styles = {
  page: {
    display: 'flex', minHeight: '100vh', background: '#f8fafc'
  },
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
  featureList: { display: 'flex', flexDirection: 'column', gap: '12px' },
  featureItem: {
    background: 'rgba(255,255,255,0.15)',
    padding: '12px 18px', borderRadius: '10px',
    fontSize: '14px', backdropFilter: 'blur(10px)'
  },
  rightPanel: {
    flex: 1, display: 'flex',
    alignItems: 'center', justifyContent: 'center',
    padding: '40px 24px'
  },
  formCard: { width: '100%', maxWidth: '400px' },
  title: {
    fontSize: '28px', fontWeight: '700',
    color: '#1e293b', marginBottom: '6px'
  },
  subtitle: { color: '#64748b', marginBottom: '32px', fontSize: '15px' },
  form: { display: 'flex', flexDirection: 'column', gap: '20px' },
  inputGroup: { display: 'flex', flexDirection: 'column', gap: '6px' },
  label: { fontSize: '13px', fontWeight: '600', color: '#374151' },
  input: {
    padding: '13px 16px', borderRadius: '10px',
    border: '1.5px solid #e2e8f0', fontSize: '14px',
    color: '#1e293b', background: '#fff',
    transition: 'border-color 0.2s'
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

export default Login;