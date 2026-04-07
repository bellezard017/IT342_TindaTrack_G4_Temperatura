import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SidebarLayout from '../components/SidebarLayout';
import { authApi } from '../api/authApi';
import '../styles/Profile.css';

/* ── Icons ── */
const EmailIcon    = () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#E07A5F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>);
const RoleIcon     = () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#E07A5F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>);
const StoreIcon    = () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#E07A5F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9.5L12 3l9 6.5V21H3V9.5z"/><rect x="9" y="14" width="6" height="7" rx="1"/></svg>);
const PhoneIcon    = () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#E07A5F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.4 2 2 0 0 1 3.6 1.22h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.8a16 16 0 0 0 6.29 6.29l.96-.96a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>);
const AddressIcon  = () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#E07A5F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>);
const EditIcon     = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>);
const TeamIcon     = () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#E07A5F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>);
const CameraIcon   = () => (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>);
const CloseIcon    = () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>);
const SaveIcon     = () => (<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13"/><polyline points="7 3 7 8 15 8"/></svg>);

export default function Profile() {
  const [user, setUser]             = useState(JSON.parse(localStorage.getItem('user') || '{}'));
  const [avatarUrl, setAvatarUrl]   = useState(null);
  const [uploading, setUploading]   = useState(false);
  const [avatarMenuOpen, setAvatarMenuOpen] = useState(false);
  const [showAvatarPreview, setShowAvatarPreview] = useState(false);
  const [avatarActionError, setAvatarActionError] = useState('');

  // Edit modal state
  const [showEdit, setShowEdit]     = useState(false);
  const [editForm, setEditForm]     = useState({ phone: '', address: '' });
  const [saving, setSaving]         = useState(false);
  const [saveError, setSaveError]   = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);

  const fileInputRef = useRef(null);
  const navigate     = useNavigate();

  useEffect(() => {
    const loadUser = async () => {
      try {
        const freshUser = await authApi.getMe();
        setUser(freshUser);
        localStorage.setItem('user', JSON.stringify(freshUser));
        if (freshUser?.avatarUrl) setAvatarUrl(freshUser.avatarUrl);
      } catch {
        // keep stale user
      }
    };
    loadUser();
  }, []);

  // Populate edit form when modal opens
  const openEditModal = () => {
    setEditForm({ phone: user?.phone || '', address: user?.address || '' });
    setSaveError('');
    setSaveSuccess(false);
    setShowEdit(true);
  };

  /* ── Avatar upload ── */
  const toggleAvatarMenu = () => {
    setAvatarMenuOpen((current) => !current);
    setAvatarActionError('');
  };

  const handleViewAvatar = () => {
    setAvatarMenuOpen(false);
    if (avatarUrl) {
      setShowAvatarPreview(true);
    }
  };

  const handleUploadProfile = () => {
    setAvatarMenuOpen(false);
    fileInputRef.current?.click();
  };

  const handleRemoveAvatar = async () => {
    setAvatarMenuOpen(false);
    setAvatarActionError('');

    try {
      await authApi.removeAvatar();
      const updated = { ...user, avatarUrl: null };
      setUser(updated);
      setAvatarUrl(null);
      localStorage.setItem('user', JSON.stringify(updated));
    } catch (err) {
      setAvatarActionError('Unable to remove profile image. Please try again.');
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAvatarMenuOpen(false);

    // Preview immediately
    const localUrl = URL.createObjectURL(file);
    setAvatarUrl(localUrl);
    setUploading(true);

    try {
      const result = await authApi.uploadAvatar(file);
      if (result?.avatarUrl) {
        setAvatarUrl(result.avatarUrl);
        const updated = { ...user, avatarUrl: result.avatarUrl };
        setUser(updated);
        localStorage.setItem('user', JSON.stringify(updated));
      }
    } catch {
      // keep local preview even if upload fails
    } finally {
      setUploading(false);
    }
  };

  /* ── Save contact details ── */
  const handleSave = async () => {
    setSaving(true);
    setSaveError('');
    setSaveSuccess(false);
    try {
      const updated = await authApi.updateProfile({
        phone:   editForm.phone,
        address: editForm.address,
      });
      const newUser = { ...user, ...updated };
      setUser(newUser);
      localStorage.setItem('user', JSON.stringify(newUser));
      setSaveSuccess(true);
      setTimeout(() => { setShowEdit(false); setSaveSuccess(false); }, 1000);
    } catch (err) {
      setSaveError(err.response?.data?.message || 'Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const roleLabel = user?.role === 'OWNER'
    ? 'Store Owner'
    : user?.role === 'STAFF'
      ? 'Staff Member'
      : user?.role || 'User';

  const INFO_FIELDS = [
    { icon: <EmailIcon />,   label: 'Email',   value: user?.email      || 'Not set' },
    { icon: <RoleIcon />,    label: 'Role',    value: roleLabel },
    { icon: <StoreIcon />,   label: 'Store',   value: user?.storeName  || 'Not set' },
    { icon: <PhoneIcon />,   label: 'Phone',   value: user?.phone      || 'Not set' },
    { icon: <AddressIcon />, label: 'Address', value: user?.address    || 'Not set' },
  ];

  return (
    <SidebarLayout pageTitle="Profile" subtitle="View and manage your account information">
      <div className="profile-wrapper">

        {/* ── Main Card ── */}
        <div className="profile-card">

          {/* Avatar */}
          <div className="profile-avatar-wrap">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt="Profile"
                className="profile-avatar profile-avatar-img"
              />
            ) : (
              <div className="profile-avatar">
                {user?.name?.charAt(0)?.toUpperCase() || 'J'}
              </div>
            )}
            <button
              className={`profile-avatar-cam ${uploading ? 'uploading' : ''}`}
              type="button"
              title="Profile actions"
              onClick={toggleAvatarMenu}
              disabled={uploading}
            >
              {uploading
                ? <span className="spinner-sm" />
                : <CameraIcon />
              }
            </button>
            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png, image/jpeg, image/webp"
              style={{ display: 'none' }}
              onChange={handleAvatarChange}
            />

            {avatarMenuOpen && (
              <div className="avatar-menu">
                <button type="button" className="avatar-menu-item" onClick={handleViewAvatar}>
                  View Profile
                </button>
                <button type="button" className="avatar-menu-item" onClick={handleUploadProfile}>
                  Upload Profile
                </button>
                <button type="button" className="avatar-menu-item avatar-menu-remove" onClick={handleRemoveAvatar}>
                  Remove Profile
                </button>
                {avatarActionError && <div className="avatar-menu-error">{avatarActionError}</div>}
              </div>
            )}
          </div>

          <h2 className="profile-name">{user?.name || 'Juan Dela Cruz'}</h2>
          <span className="profile-badge">{roleLabel}</span>

          {/* Info fields */}
          <div className="profile-fields">
            {INFO_FIELDS.map((f) => (
              <div className="profile-field" key={f.label}>
                <div className="profile-field-icon">{f.icon}</div>
                <div className="profile-field-body">
                  <span className="profile-field-label">{f.label}</span>
                  <span className="profile-field-value">{f.value}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Edit button */}
          <button className="profile-edit-btn" type="button" onClick={openEditModal}>
            <EditIcon /> Edit Contact Details
          </button>
        </div>

        {showAvatarPreview && (
          <div className="modal-overlay" onClick={() => setShowAvatarPreview(false)}>
            <div className="avatar-preview-box" onClick={(e) => e.stopPropagation()}>
              <button className="modal-close" onClick={() => setShowAvatarPreview(false)}>
                <CloseIcon />
              </button>
              <img src={avatarUrl} alt="Profile Preview" className="avatar-preview-img" />
              <div className="avatar-preview-caption">Profile photo</div>
            </div>
          </div>
        )}

      </div>

      {/* ══ Edit Contact Modal ══ */}
      {showEdit && (
        <div className="modal-overlay" onClick={() => setShowEdit(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>

            <div className="modal-header">
              <h3>Edit Contact Details</h3>
              <button className="modal-close" onClick={() => setShowEdit(false)}>
                <CloseIcon />
              </button>
            </div>

            <div className="modal-body">
              {saveError && <div className="error-banner">{saveError}</div>}
              {saveSuccess && <div className="success-banner">Saved successfully!</div>}

              <div className="modal-field">
                <label htmlFor="edit-phone">
                  <PhoneIcon /> Phone Number
                </label>
                <input
                  id="edit-phone"
                  type="tel"
                  placeholder="+63 912 345 6789"
                  value={editForm.phone}
                  onChange={(e) => setEditForm((p) => ({ ...p, phone: e.target.value }))}
                />
              </div>

              <div className="modal-field">
                <label htmlFor="edit-address">
                  <AddressIcon /> Address
                </label>
                <input
                  id="edit-address"
                  type="text"
                  placeholder="123 Rizal St, Cebu City"
                  value={editForm.address}
                  onChange={(e) => setEditForm((p) => ({ ...p, address: e.target.value }))}
                />
              </div>
            </div>

            <div className="modal-footer">
              <button className="modal-cancel" onClick={() => setShowEdit(false)}>
                Cancel
              </button>
              <button className="modal-save" onClick={handleSave} disabled={saving}>
                {saving
                  ? <><span className="spinner-sm" /> Saving…</>
                  : <><SaveIcon /> Save Changes</>
                }
              </button>
            </div>

          </div>
        </div>
      )}

    </SidebarLayout>
  );
}