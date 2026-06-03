import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import api from '../services/api';
import Navbar from '../components/Navbar';
import toast from 'react-hot-toast';

const Home = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchMatches();
  }, []);

  const fetchMatches = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/matches');
      setMatches(data.matches);
    } catch (err) {
      if (err.response?.status === 400) {
        // User hasn't added skills yet
        toast('Add your skills first to see matches!', { icon: '👋' });
      } else {
        toast.error('Failed to load matches');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleStartChat = (matchedUser) => {
    const roomId = [user._id, matchedUser._id].sort().join('_');
    navigate(`/chat/${roomId}`, { state: { peer: matchedUser } });
  };

  // Filter by search
  const filtered = matches.filter(m =>
    m.user.name.toLowerCase().includes(search.toLowerCase()) ||
    m.user.teaches?.some(s =>
      s.name.toLowerCase().includes(search.toLowerCase())
    )
  );

  const getScoreColor = (score) => {
    if (score >= 70) return '#10b981';
    if (score >= 40) return '#f59e0b';
    return '#6366f1';
  };

  const getLevelBadge = (level) => {
    const map = {
      beginner: { bg: '#dbeafe', color: '#1d4ed8', label: 'Beginner' },
      intermediate: { bg: '#fef3c7', color: '#d97706', label: 'Intermediate' },
      expert: { bg: '#d1fae5', color: '#065f46', label: 'Expert' }
    };
    return map[level] || map.beginner;
  };

  return (
    <div style={styles.page}>
      <Navbar />

      <div style={styles.container}>

        {/* Hero */}
        <div style={styles.hero}>
          <div>
            <h1 style={styles.heroTitle}>
              Find Your Perfect Skill Match 🎯
            </h1>
            <p style={styles.heroSubtitle}>
              {matches.length > 0
                ? `We found ${matches.length} people ready to swap skills with you`
                : 'Add your skills in Profile to start matching'}
            </p>
          </div>

          {/* Search */}
          <input
            style={styles.search}
            placeholder="🔍  Search by name or skill..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* My Skills Summary */}
        {user?.teaches?.length > 0 && (
          <div style={styles.mySkillsBar}>
            <div style={styles.mySkillsSection}>
              <span style={styles.mySkillsLabel}>🎓 You teach:</span>
              {user.teaches.map((s, i) => (
                <span key={i} style={styles.teachBadge}>{s.name}</span>
              ))}
            </div>
            <div style={styles.divider} />
            <div style={styles.mySkillsSection}>
              <span style={styles.mySkillsLabel}>📚 You want to learn:</span>
              {user.wantsToLearn?.map((s, i) => (
                <span key={i} style={styles.learnBadge}>{s.name}</span>
              ))}
            </div>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div style={styles.centered}>
            <div style={styles.spinner} />
            <p style={styles.loadingText}>Finding your matches...</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && filtered.length === 0 && (
          <div style={styles.emptyState}>
            <div style={styles.emptyIcon}>🔍</div>
            <h3 style={styles.emptyTitle}>No matches found</h3>
            <p style={styles.emptyText}>
              {matches.length === 0
                ? 'Go to your Profile and add skills to start matching!'
                : 'Try a different search term'}
            </p>
            {matches.length === 0 && (
              <button
                style={styles.goProfileBtn}
                onClick={() => navigate('/profile')}
              >
                Set Up My Profile →
              </button>
            )}
          </div>
        )}

        {/* Match Cards Grid */}
        {!loading && filtered.length > 0 && (
          <div style={styles.grid}>
            {filtered.map((match, index) => (
              <div key={match.user._id} style={styles.card}>

                {/* Score Badge */}
                <div style={{
                  ...styles.scoreBadge,
                  background: getScoreColor(match.score)
                }}>
                  {match.score}% match
                </div>

                {/* Card Top */}
                <div style={styles.cardTop}>
                  <div style={styles.avatar}>
                    {match.user.name.charAt(0).toUpperCase()}
                  </div>
                  <div style={styles.userInfo}>
                    <h3 style={styles.userName}>{match.user.name}</h3>
                    <div style={styles.stars}>
                      {'★'.repeat(Math.round(match.user.rating))}
                      {'☆'.repeat(5 - Math.round(match.user.rating))}
                      <span style={styles.reviewCount}>
                        ({match.user.reviewCount})
                      </span>
                    </div>
                    {match.user.bio && (
                      <p style={styles.bio}>{match.user.bio}</p>
                    )}
                  </div>
                </div>

                {/* Skills Exchange */}
                <div style={styles.skillsSection}>
                  <div style={styles.skillColumn}>
                    <p style={styles.skillLabel}>🎓 Teaches</p>
                    {match.user.teaches.map((s, i) => {
                      const badge = getLevelBadge(s.level);
                      return (
                        <div key={i} style={styles.skillItem}>
                          <span style={styles.skillName}>{s.name}</span>
                          <span style={{
                            ...styles.levelBadge,
                            background: badge.bg,
                            color: badge.color
                          }}>
                            {badge.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  <div style={styles.arrowCol}>⇄</div>

                  <div style={styles.skillColumn}>
                    <p style={styles.skillLabel}>📚 Wants to Learn</p>
                    {match.user.wantsToLearn.map((s, i) => {
                      const badge = getLevelBadge(s.level);
                      return (
                        <div key={i} style={styles.skillItem}>
                          <span style={styles.skillName}>{s.name}</span>
                          <span style={{
                            ...styles.levelBadge,
                            background: badge.bg,
                            color: badge.color
                          }}>
                            {badge.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Matched Skills Highlight */}
                {match.matchedSkills.length > 0 && (
                  <div style={styles.matchedRow}>
                    <span style={styles.matchedLabel}>✅ You can exchange:</span>
                    {match.matchedSkills.map((s, i) => (
                      <span key={i} style={styles.matchedSkill}>
                        {s}
                      </span>
                    ))}
                  </div>
                )}

                {/* Action Button */}
                <button
                  style={styles.chatBtn}
                  onClick={() => handleStartChat(match.user)}
                >
                  💬 Start Conversation
                </button>

              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
};

const styles = {
  page: { background: '#f8fafc', minHeight: '100vh' },
  container: { maxWidth: '1100px', margin: '0 auto', padding: '32px 24px' },
  hero: {
    display: 'flex', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: '24px',
    flexWrap: 'wrap', gap: '16px'
  },
  heroTitle: { fontSize: '26px', fontWeight: '700', color: '#1e293b' },
  heroSubtitle: { color: '#64748b', marginTop: '4px', fontSize: '15px' },
  search: {
    padding: '12px 20px', borderRadius: '12px',
    border: '1.5px solid #e2e8f0', fontSize: '14px',
    color: '#1e293b', background: '#fff', width: '280px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
  },
  mySkillsBar: {
    background: '#fff', borderRadius: '12px',
    border: '1px solid #e2e8f0', padding: '14px 20px',
    display: 'flex', alignItems: 'center',
    gap: '16px', marginBottom: '24px',
    flexWrap: 'wrap',
    boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
  },
  mySkillsSection: { display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' },
  mySkillsLabel: { fontSize: '13px', color: '#64748b', fontWeight: '600' },
  teachBadge: {
    padding: '4px 10px', borderRadius: '20px',
    background: '#d1fae5', color: '#065f46',
    fontSize: '12px', fontWeight: '600'
  },
  learnBadge: {
    padding: '4px 10px', borderRadius: '20px',
    background: '#dbeafe', color: '#1d4ed8',
    fontSize: '12px', fontWeight: '600'
  },
  divider: { width: '1px', height: '24px', background: '#e2e8f0' },
  centered: {
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', padding: '80px 0'
  },
  spinner: {
    width: '40px', height: '40px', borderRadius: '50%',
    border: '3px solid #e2e8f0',
    borderTop: '3px solid #6366f1',
    animation: 'spin 0.8s linear infinite'
  },
  loadingText: { color: '#94a3b8', marginTop: '16px', fontSize: '14px' },
  emptyState: {
    textAlign: 'center', padding: '80px 20px'
  },
  emptyIcon: { fontSize: '56px', marginBottom: '16px' },
  emptyTitle: { fontSize: '20px', fontWeight: '700', color: '#1e293b' },
  emptyText: { color: '#64748b', marginTop: '8px', fontSize: '15px' },
  goProfileBtn: {
    marginTop: '20px', padding: '12px 28px',
    borderRadius: '10px', border: 'none',
    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    color: '#fff', fontSize: '14px', fontWeight: '600', cursor: 'pointer'
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
    gap: '20px'
  },
  card: {
    background: '#fff', borderRadius: '16px',
    border: '1px solid #e2e8f0', padding: '24px',
    position: 'relative', overflow: 'hidden',
    boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
    transition: 'box-shadow 0.2s, transform 0.2s'
  },
  scoreBadge: {
    position: 'absolute', top: '16px', right: '16px',
    padding: '4px 10px', borderRadius: '20px',
    color: '#fff', fontSize: '12px', fontWeight: '700'
  },
  cardTop: { display: 'flex', gap: '14px', marginBottom: '20px' },
  avatar: {
    width: '52px', height: '52px', borderRadius: '50%',
    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    color: '#fff', display: 'flex', alignItems: 'center',
    justifyContent: 'center', fontWeight: '700',
    fontSize: '20px', flexShrink: 0
  },
  userInfo: { flex: 1 },
  userName: { fontSize: '16px', fontWeight: '700', color: '#1e293b' },
  stars: { color: '#f59e0b', fontSize: '13px', marginTop: '3px' },
  reviewCount: { color: '#94a3b8', marginLeft: '4px', fontSize: '12px' },
  bio: {
    fontSize: '13px', color: '#64748b',
    marginTop: '4px', lineHeight: '1.4'
  },
  skillsSection: {
    display: 'flex', gap: '8px', alignItems: 'flex-start',
    background: '#f8fafc', borderRadius: '10px',
    padding: '14px', marginBottom: '14px'
  },
  skillColumn: { flex: 1 },
  skillLabel: {
    fontSize: '11px', fontWeight: '700',
    color: '#94a3b8', marginBottom: '8px',
    textTransform: 'uppercase', letterSpacing: '0.5px'
  },
  skillItem: {
    display: 'flex', alignItems: 'center',
    gap: '6px', marginBottom: '6px', flexWrap: 'wrap'
  },
  skillName: { fontSize: '13px', fontWeight: '600', color: '#1e293b' },
  levelBadge: {
    fontSize: '10px', fontWeight: '600',
    padding: '2px 7px', borderRadius: '10px'
  },
  arrowCol: {
    color: '#94a3b8', fontSize: '20px',
    padding: '0 4px', marginTop: '16px'
  },
  matchedRow: {
    display: 'flex', alignItems: 'center',
    gap: '6px', flexWrap: 'wrap', marginBottom: '16px'
  },
  matchedLabel: { fontSize: '12px', color: '#64748b', fontWeight: '600' },
  matchedSkill: {
    padding: '3px 10px', borderRadius: '20px',
    background: '#eef2ff', color: '#6366f1',
    fontSize: '12px', fontWeight: '600'
  },
  chatBtn: {
    width: '100%', padding: '12px', borderRadius: '10px',
    border: 'none',
    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    color: '#fff', fontSize: '14px', fontWeight: '600',
    cursor: 'pointer',
    boxShadow: '0 2px 8px rgba(99,102,241,0.25)'
  }
};

export default Home;