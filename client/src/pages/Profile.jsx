import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { getMyProfile } from '../store/slices/authSlice';
import api from '../services/api';
import Navbar from '../components/Navbar';
import toast from 'react-hot-toast';

const LEVELS = ['beginner', 'intermediate', 'expert'];

const emptySkill = { name: '', level: 'beginner', description: '' };

const Profile = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const [bio, setBio] = useState('');
  const [teaches, setTeaches] = useState([{ ...emptySkill }]);
  const [wantsToLearn, setWantsToLearn] = useState([{ ...emptySkill }]);
  const [saving, setSaving] = useState(false);

  // Load existing profile data
  useEffect(() => {
    if (user) {
      setBio(user.bio || '');
      if (user.teaches?.length) setTeaches(user.teaches);
      if (user.wantsToLearn?.length) setWantsToLearn(user.wantsToLearn);
    }
  }, [user]);

  // ── Skill handlers ──
  const handleSkillChange = (type, index, field, value) => {
    const setter = type === 'teaches' ? setTeaches : setWantsToLearn;
    const arr = type === 'teaches' ? [...teaches] : [...wantsToLearn];
    arr[index][field] = value;
    setter(arr);
  };

  const addSkill = (type) => {
    if (type === 'teaches') setTeaches([...teaches, { ...emptySkill }]);
    else setWantsToLearn([...wantsToLearn, { ...emptySkill }]);
  };

  const removeSkill = (type, index) => {
    if (type === 'teaches') {
      setTeaches(teaches.filter((_, i) => i !== index));
    } else {
      setWantsToLearn(wantsToLearn.filter((_, i) => i !== index));
    }
  };

  // ── Save ──
  const handleSave = async () => {
  const validTeaches = teaches.filter(s => s.name.trim());
  const validWants = wantsToLearn.filter(s => s.name.trim());

  if (!validTeaches.length || !validWants.length) {
    return toast.error('Add at least one skill to teach and one to learn');
  }

  setSaving(true);
  try {
    const response = await api.put('/users/me', {
      bio,
      teaches: validTeaches,
      wantsToLearn: validWants
    });
    console.log('Save response:', response);
    await dispatch(getMyProfile());
    toast.success('Profile saved!');
    navigate('/');
  } catch (err) {
    // This will show the exact error
    console.error('Save error:', err);
    console.error('Error response:', err.response);
    console.error('Error message:', err.response?.data);
    toast.error(err.response?.data?.message || err.message || 'Failed to save');
  } finally {
    setSaving(false);
  }
};

  return (
    <div style={styles.page}>
      <Navbar />
      <div style={styles.container}>

        {/* Header */}
        <div style={styles.header}>
          <h1 style={styles.title}>My Profile</h1>
          <p style={styles.subtitle}>
            Tell the community what you teach and what you want to learn
          </p>
        </div>

        {/* Bio Card */}
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>👤 About You</h2>
          <div style={styles.userRow}>
            <div style={styles.avatarLarge}>
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <p style={styles.nameText}>{user?.name}</p>
              <p style={styles.emailText}>{user?.email}</p>
            </div>
          </div>
          <textarea
            style={styles.textarea}
            placeholder="Write a short bio — what are you passionate about?"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={3}
            maxLength={300}
          />
          <p style={styles.charCount}>{bio.length}/300</p>
        </div>

        {/* Skills I Teach */}
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <div>
              <h2 style={styles.cardTitle}>🎓 Skills I Can Teach</h2>
              <p style={styles.cardSubtitle}>What knowledge can you share?</p>
            </div>
            <button
              onClick={() => addSkill('teaches')}
              style={styles.addBtn}
            >
              + Add Skill
            </button>
          </div>

          {teaches.map((skill, index) => (
            <div key={index} style={styles.skillRow}>
              <div style={styles.skillInputs}>
                <input
                  style={styles.skillInput}
                  placeholder="Skill name (e.g. Guitar)"
                  value={skill.name}
                  onChange={(e) =>
                    handleSkillChange('teaches', index, 'name', e.target.value)
                  }
                />
                <select
                  style={styles.select}
                  value={skill.level}
                  onChange={(e) =>
                    handleSkillChange('teaches', index, 'level', e.target.value)
                  }
                >
                  {LEVELS.map(l => (
                    <option key={l} value={l}>
                      {l.charAt(0).toUpperCase() + l.slice(1)}
                    </option>
                  ))}
                </select>
                <input
                  style={{ ...styles.skillInput, flex: 2 }}
                  placeholder="Short description (optional)"
                  value={skill.description}
                  onChange={(e) =>
                    handleSkillChange('teaches', index, 'description', e.target.value)
                  }
                />
              </div>
              {teaches.length > 1 && (
                <button
                  onClick={() => removeSkill('teaches', index)}
                  style={styles.removeBtn}
                >
                  ✕
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Skills I Want to Learn */}
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <div>
              <h2 style={styles.cardTitle}>📚 Skills I Want to Learn</h2>
              <p style={styles.cardSubtitle}>What do you want to learn in exchange?</p>
            </div>
            <button
              onClick={() => addSkill('wantsToLearn')}
              style={styles.addBtn}
            >
              + Add Skill
            </button>
          </div>

          {wantsToLearn.map((skill, index) => (
            <div key={index} style={styles.skillRow}>
              <div style={styles.skillInputs}>
                <input
                  style={styles.skillInput}
                  placeholder="Skill name (e.g. JavaScript)"
                  value={skill.name}
                  onChange={(e) =>
                    handleSkillChange('wantsToLearn', index, 'name', e.target.value)
                  }
                />
                <select
                  style={styles.select}
                  value={skill.level}
                  onChange={(e) =>
                    handleSkillChange('wantsToLearn', index, 'level', e.target.value)
                  }
                >
                  {LEVELS.map(l => (
                    <option key={l} value={l}>
                      {l.charAt(0).toUpperCase() + l.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
              {wantsToLearn.length > 1 && (
                <button
                  onClick={() => removeSkill('wantsToLearn', index)}
                  style={styles.removeBtn}
                >
                  ✕
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Save Button */}
        <button
          onClick={handleSave}
          disabled={saving}
          style={saving ? styles.saveBtnDisabled : styles.saveBtn}
        >
          {saving ? 'Saving...' : '💾 Save Profile'}
        </button>

      </div>
    </div>
  );
};

const styles = {
  page: { background: '#f8fafc', minHeight: '100vh' },
  container: { maxWidth: '780px', margin: '0 auto', padding: '32px 24px' },
  header: { marginBottom: '28px' },
  title: { fontSize: '26px', fontWeight: '700', color: '#1e293b' },
  subtitle: { color: '#64748b', marginTop: '6px', fontSize: '15px' },
  card: {
    background: '#ffffff',
    borderRadius: '16px',
    padding: '28px',
    marginBottom: '20px',
    border: '1px solid #e2e8f0',
    boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '20px'
  },
  cardTitle: { fontSize: '16px', fontWeight: '700', color: '#1e293b' },
  cardSubtitle: { fontSize: '13px', color: '#94a3b8', marginTop: '3px' },
  userRow: { display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px' },
  avatarLarge: {
    width: '52px', height: '52px', borderRadius: '50%',
    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    color: '#fff', display: 'flex', alignItems: 'center',
    justifyContent: 'center', fontWeight: '700', fontSize: '20px'
  },
  nameText: { fontWeight: '600', color: '#1e293b', fontSize: '15px' },
  emailText: { color: '#94a3b8', fontSize: '13px', marginTop: '2px' },
  textarea: {
    width: '100%', padding: '12px', borderRadius: '8px',
    border: '1px solid #e2e8f0', fontSize: '14px',
    color: '#374151', resize: 'vertical', fontFamily: 'inherit',
    background: '#f8fafc'
  },
  charCount: { fontSize: '12px', color: '#94a3b8', marginTop: '4px', textAlign: 'right' },
  skillRow: {
    display: 'flex', alignItems: 'center',
    gap: '10px', marginBottom: '12px'
  },
  skillInputs: { display: 'flex', gap: '10px', flex: 1 },
  skillInput: {
    flex: 1, padding: '10px 14px', borderRadius: '8px',
    border: '1px solid #e2e8f0', fontSize: '14px',
    color: '#374151', background: '#f8fafc'
  },
  select: {
    padding: '10px 14px', borderRadius: '8px',
    border: '1px solid #e2e8f0', fontSize: '14px',
    color: '#374151', background: '#f8fafc', cursor: 'pointer'
  },
  addBtn: {
    padding: '8px 16px', borderRadius: '8px',
    border: '1px dashed #6366f1', background: '#eef2ff',
    color: '#6366f1', fontSize: '13px', fontWeight: '600', cursor: 'pointer'
  },
  removeBtn: {
    padding: '8px 12px', borderRadius: '8px',
    border: '1px solid #fee2e2', background: '#fff5f5',
    color: '#ef4444', fontSize: '13px', cursor: 'pointer'
  },
  saveBtn: {
    width: '100%', padding: '14px', borderRadius: '12px',
    border: 'none', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    color: '#fff', fontSize: '16px', fontWeight: '600', cursor: 'pointer',
    boxShadow: '0 4px 14px rgba(99,102,241,0.3)'
  },
  saveBtnDisabled: {
    width: '100%', padding: '14px', borderRadius: '12px',
    border: 'none', background: '#e2e8f0',
    color: '#94a3b8', fontSize: '16px', cursor: 'not-allowed'
  }
};

export default Profile;