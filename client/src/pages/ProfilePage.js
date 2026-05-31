import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useApi } from '../hooks/useApi';

const ProfilePage = () => {
  const { user, updateUser } = useAuth();
  const { put } = useApi();
  const [form, setForm] = useState({ name: user?.name || '', bio: user?.bio || '', profilePicture: user?.profilePicture || '' });
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [msg, setMsg] = useState({ text: '', type: '' });
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');

  const showMsg = (text, type = 'success') => {
    setMsg({ text, type });
    setTimeout(() => setMsg({ text: '', type: '' }), 3000);
  };

  const handleProfileSave = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      const data = await put('/api/auth/update-profile', form);
      updateUser(data.user);
      showMsg('Profile updated successfully!');
    } catch (err) { showMsg(err.message, 'error'); }
    finally { setSaving(false); }
  };

  const roleColor = user?.role === 'admin' ? '#7c3aed' : user?.role === 'teacher' ? '#0891b2' : '#4f46e5';
  const roleLabel = { student: '👨‍🎓 Student', teacher: '👩‍🏫 Teacher', admin: '🛡️ Administrator' }[user?.role];

  return (
    <div className="page" style={{ maxWidth: 720 }}>
      <h1 className="page-title" style={{ marginBottom: 24 }}>👤 My Profile</h1>

      {/* Profile card */}
      <div className="card" style={{ marginBottom: 24, display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
        <div className="avatar avatar-lg" style={{ background: roleColor, fontSize: 28 }}>
          {user?.name?.charAt(0).toUpperCase()}
        </div>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 800 }}>{user?.name}</h2>
          <div style={{ color: 'var(--text-muted)', marginBottom: 6 }}>{user?.email}</div>
          <span className="badge badge-primary" style={{ fontSize: 13, padding: '4px 12px' }}>{roleLabel}</span>
        </div>
        <div style={{ marginLeft: 'auto', fontSize: 13, color: 'var(--text-muted)' }}>
          Member since {new Date(user?.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </div>
      </div>

      {/* Tabs */}
      <div className="tab-bar" style={{ marginBottom: 24 }}>
        <button className={`tab-btn ${activeTab === 'profile' ? 'active' : ''}`} onClick={() => setActiveTab('profile')}>Edit Profile</button>
        <button className={`tab-btn ${activeTab === 'bio' ? 'active' : ''}`} onClick={() => setActiveTab('bio')}>Bio & Info</button>
      </div>

      {msg.text && <div className={`alert ${msg.type === 'error' ? 'alert-error' : 'alert-success'}`}>{msg.text}</div>}

      {activeTab === 'profile' && (
        <div className="card">
          <h3 style={{ marginBottom: 20, fontSize: 16, fontWeight: 700 }}>Edit Profile Information</h3>
          <form onSubmit={handleProfileSave}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input className="form-input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Your full name" required />
            </div>
            <div className="form-group">
              <label className="form-label">Bio</label>
              <textarea className="form-textarea" value={form.bio}
                onChange={e => setForm({ ...form, bio: e.target.value })}
                placeholder={user?.role === 'teacher' ? 'Describe your teaching experience, subjects, etc.' : 'Tell others about yourself, your interests...'}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Profile Picture URL</label>
              <input className="form-input" value={form.profilePicture}
                onChange={e => setForm({ ...form, profilePicture: e.target.value })}
                placeholder="https://example.com/your-photo.jpg" />
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
              <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</button>
            </div>
          </form>
        </div>
      )}

      {activeTab === 'bio' && (
        <div className="card">
          <h3 style={{ marginBottom: 20, fontSize: 16, fontWeight: 700 }}>Account Information</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {[
              { label: 'Full Name', value: user?.name },
              { label: 'Email Address', value: user?.email },
              { label: 'Role', value: roleLabel },
              { label: 'Account Status', value: user?.isActive ? '✅ Active' : '❌ Inactive' },
              { label: 'Member Since', value: new Date(user?.createdAt).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) },
            ].map(({ label, value }) => (
              <div key={label} style={{ display: 'flex', borderBottom: '1px solid var(--border)', paddingBottom: 14 }}>
                <span style={{ width: 150, fontSize: 13, color: 'var(--text-muted)', fontWeight: 600, flexShrink: 0 }}>{label}</span>
                <span style={{ fontSize: 14 }}>{value}</span>
              </div>
            ))}
            {user?.bio && (
              <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: 14 }}>
                <span style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: 6 }}>Bio</span>
                <p style={{ fontSize: 14, lineHeight: 1.7 }}>{user.bio}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
