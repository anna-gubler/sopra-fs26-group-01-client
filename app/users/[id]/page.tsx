"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useApi } from "@/hooks/useApi";
import { getUser, updateMe, updateAvatar, changePassword } from "@/api/userApi";
import { logout } from "@/api/authApi";
import { User } from "@/types/user";
import React, { useState, useEffect } from "react";
import useLocalStorage from "@/hooks/useLocalStorage";
import { BookOpen, Eye, EyeOff, Camera, Pencil, Lock, ChevronRight, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { ApplicationError } from "@/types/error";
import styles from "@/styles/profile.module.css";
import { getAvatarUrl } from "@/utils/avatar";

const Profile: React.FC = () => {
  const params = useParams();
  const id = params.id;
  const apiService = useApi();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editForm, setEditForm] = useState({ username: "", bio: "" });
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ oldPassword: "", newPassword: "", confirmPassword: "" });
  const [showPasswords, setShowPasswords] = useState({ old: false, new: false, confirm: false });
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [selectedStyle, setSelectedStyle] = useState<string>("bottts-neutral");
  const [selectedSeed, setSelectedSeed] = useState<string>("");
  const avatarStyles = ["adventurer","adventurer-neutral","avataaars","avataaars-neutral","big-ears","big-ears-neutral","big-smile","bottts","bottts-neutral","croodles","croodles-neutral","dylan","fun-emoji","glass","icons","identicon","initials","lorelei","lorelei-neutral","micah","miniavs","notionists","notionists-neutral","open-peeps","personas","pixel-art","pixel-art-neutral","rings","shapes","thumbs","toon-head"];
  const { value: token, clear: clearToken } = useLocalStorage<string>("token", "");
  const { value: loggedInId, clear: clearId } = useLocalStorage<string>("id", "");
  const isOwnProfile = id === "me" || String(loggedInId) === String(id);

  const openEditForm = () => {
    setEditForm({ username: user?.username ?? "", bio: user?.bio ?? "" });
    setShowEditForm(true);
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const updated = await updateMe(apiService, { username: editForm.username, bio: editForm.bio });
      setUser(updated);
      setShowEditForm(false);
      toast.success("Profile updated.");
    } catch (err: unknown) {
      const status = (err as { status?: number }).status;
      if (status === 409) {
        toast.error("That username is already taken.");
      } else {
        toast.error("Failed to update profile. Please try again.");
      }
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const { oldPassword, newPassword, confirmPassword } = passwordForm;
    if (newPassword === oldPassword) {
      toast.error("New password must be different from your old password.");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match.");
      return;
    }
    try {
      await changePassword(apiService, oldPassword, newPassword);
      await logout(apiService);
      clearToken();
      clearId();
      router.push("/login");
    } catch (err: unknown) {
      const error = err as ApplicationError;
      const knownCodes = [400, 401, 403, 409];
      if (error.status && knownCodes.includes(error.status)) {
        toast.error(error.details);
      } else {
        toast.error("Password change failed. Please try again.");
      }
    }
  };

  const handleLogout = async () => {
    try {
      await logout(apiService);
    } catch {
      // still log out locally if the server is unreachable
    }
    clearToken();
    clearId();
    router.push("/login");
  };

  const handleAvatarUpdate = async (style: string, seed: string) => {
    try {
      const updated = await updateAvatar(apiService, style, seed);
      setUser(updated);
      setShowAvatarPicker(false);
      toast.success("Avatar updated!");
    } catch {
      toast.error("Failed to update avatar. Please try again.");
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
    }
  }, []);

  useEffect(() => {
    if (!token) return;
    const fetchUser = async () => {
      try {
        const result = await getUser(apiService, id as string);
        setUser(result);
      } catch (error) {
        if ((error as { status?: number }).status === 403) {
          router.push("/login");
        }
      }
    };
    fetchUser();
  }, [apiService, token]);

  if (!user) return null;

  const dateFormat = user.creationDate
    ? new Date(user.creationDate).toLocaleDateString("de-DE")
    : "";

  const resetPasswordForm = () => {
    setShowPasswordForm(false);
    setPasswordForm({ oldPassword: "", newPassword: "", confirmPassword: "" });
  };

  const renderPasswordForm = () => (
    <form onSubmit={handleChangePassword}>
      <button type="button" className={styles['profile-back-btn']} onClick={resetPasswordForm}>
        <ArrowLeft size={14} /> Back
      </button>
      <div className="input-group">
        <label htmlFor="old-password">Old Password</label>
        <div className="password-field">
          <input
            id="old-password"
            type={showPasswords.old ? "text" : "password"}
            className="auth-input"
            placeholder="Enter old password"
            value={passwordForm.oldPassword}
            onChange={(e) => setPasswordForm((f) => ({ ...f, oldPassword: e.target.value }))}
            required
          />
          <button type="button" className="toggle-password" aria-label={showPasswords.old ? "Hide old password" : "Show old password"} onClick={() => setShowPasswords((s) => ({ ...s, old: !s.old }))}>
            {showPasswords.old ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
      </div>
      <div className="input-group">
        <label htmlFor="new-password">New Password</label>
        <div className="password-field">
          <input
            id="new-password"
            type={showPasswords.new ? "text" : "password"}
            className="auth-input"
            placeholder="Enter new password"
            value={passwordForm.newPassword}
            onChange={(e) => setPasswordForm((f) => ({ ...f, newPassword: e.target.value }))}
            required
          />
          <button type="button" className="toggle-password" aria-label={showPasswords.new ? "Hide new password" : "Show new password"} onClick={() => setShowPasswords((s) => ({ ...s, new: !s.new }))}>
            {showPasswords.new ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
        {passwordForm.newPassword && passwordForm.oldPassword && passwordForm.newPassword === passwordForm.oldPassword && (
          <span className="field-error">New password must be different from your old password.</span>
        )}
      </div>
      <div className="input-group">
        <label htmlFor="confirm-password">Confirm New Password</label>
        <div className="password-field">
          <input
            id="confirm-password"
            type={showPasswords.confirm ? "text" : "password"}
            className="auth-input"
            placeholder="Enter new password again"
            value={passwordForm.confirmPassword}
            onChange={(e) => setPasswordForm((f) => ({ ...f, confirmPassword: e.target.value }))}
            required
          />
          <button type="button" className="toggle-password" aria-label={showPasswords.confirm ? "Hide confirm password" : "Show confirm password"} onClick={() => setShowPasswords((s) => ({ ...s, confirm: !s.confirm }))}>
            {showPasswords.confirm ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
        {passwordForm.confirmPassword && passwordForm.newPassword && passwordForm.confirmPassword !== passwordForm.newPassword && (
          <span className="field-error">Passwords do not match.</span>
        )}
      </div>
      <button className="btn-gradient btn-full mt-12" type="submit">
        Confirm Password Change
      </button>
    </form>
  );

  const renderEditForm = () => (
    <form onSubmit={handleUpdateProfile}>
      <button type="button" className={styles['profile-back-btn']} onClick={() => setShowEditForm(false)}>
        <ArrowLeft size={14} /> Back
      </button>
      <div className="input-group">
        <label htmlFor="edit-username">Username</label>
        <input
          id="edit-username"
          type="text"
          className="auth-input"
          value={editForm.username}
          onChange={(e) => setEditForm((f) => ({ ...f, username: e.target.value }))}
          required
        />
      </div>
      <div className="input-group">
        <label htmlFor="edit-bio">Bio</label>
        <input
          id="edit-bio"
          type="text"
          className="auth-input"
          value={editForm.bio}
          onChange={(e) => setEditForm((f) => ({ ...f, bio: e.target.value }))}
        />
      </div>
      <button className="btn-gradient btn-full mt-12" type="submit">
        Save Changes
      </button>
    </form>
  );

  const renderOwnerActions = () => {
    if (showAvatarPicker) return (
      <>
        <div className={styles['profile-divider']} />
        <button type="button" className={styles['profile-back-btn']} onClick={() => setShowAvatarPicker(false)}>
          <ArrowLeft size={14} /> Back
        </button>
        <p className={styles['profile-section-label']}>Pick a style:</p>
        <div className={styles['avatar-picker-grid']}>
          {avatarStyles.map((style) => (
            <button
              key={style}
              className={`${styles['avatar-picker-option']} ${selectedStyle === style ? styles['avatar-picker-option-selected'] : ""}`}
              onClick={() => setSelectedStyle(style)}
            >
              <img src={getAvatarUrl(selectedSeed || user.seed, style)} className={styles['profile-avatar-img']} alt={style} />
            </button>
          ))}
        </div>
        <div className="input-group">
          <label>Seed (leave blank to keep current)</label>
          <input
            type="text"
            className="auth-input"
            placeholder={user.seed ?? "Enter a seed"}
            value={selectedSeed}
            onChange={(e) => setSelectedSeed(e.target.value)}
          />
        </div>
        <button className="btn-gradient btn-full mt-8" onClick={() => handleAvatarUpdate(selectedStyle, selectedSeed || (user.seed ?? user.username ?? ""))}>
          Save Avatar
        </button>
      </>
    );

    if (showEditForm) return (
      <>
        <div className={styles['profile-divider']} />
        {renderEditForm()}
      </>
    );

    if (showPasswordForm) return (
      <>
        <div className={styles['profile-divider']} />
        {renderPasswordForm()}
      </>
    );

    return (
      <>
        <div className={styles['profile-divider']} />
        <div className={styles['profile-actions']}>
          <button
            className={styles['profile-action-row']}
            onClick={() => { setSelectedStyle(user.style ?? "bottts-neutral"); setShowAvatarPicker(true); }}
          >
            <div className={styles['profile-action-icon']}><Camera size={16} /></div>
            <div className={styles['profile-action-body']}>
              <span className={styles['profile-action-label']}>Change Avatar</span>
              <span className={styles['profile-action-desc']}>Choose a new avatar style and seed</span>
            </div>
            <ChevronRight size={16} className={styles['profile-action-chevron']} />
          </button>
          <button className={styles['profile-action-row']} onClick={openEditForm}>
            <div className={styles['profile-action-icon']}><Pencil size={16} /></div>
            <div className={styles['profile-action-body']}>
              <span className={styles['profile-action-label']}>Edit Profile</span>
              <span className={styles['profile-action-desc']}>Update your username and bio</span>
            </div>
            <ChevronRight size={16} className={styles['profile-action-chevron']} />
          </button>
          <button
            className={styles['profile-action-row']}
            onClick={() => { setShowPasswordForm(true); setPasswordForm({ oldPassword: "", newPassword: "", confirmPassword: "" }); }}
          >
            <div className={styles['profile-action-icon']}><Lock size={16} /></div>
            <div className={styles['profile-action-body']}>
              <span className={styles['profile-action-label']}>Change Password</span>
              <span className={styles['profile-action-desc']}>Update your account password</span>
            </div>
            <ChevronRight size={16} className={styles['profile-action-chevron']} />
          </button>
        </div>
      </>
    );
  };

  return (
    <div className="page-deep">

      {/* dot grid overlay */}
      <div className="grid-overlay" />

      {/* navbar */}
      <nav className="glass-nav">
        <Link href="/skillmaps" className="nav-logo">
          <div className="nav-logo-icon">
            <BookOpen size={16} color="white" />
          </div>
          <span className="logo-text">Mappd</span>
        </Link>
        <div className={styles["profile-nav-actions"]}>
          <Link href="/skillmaps" className={styles["profile-nav-link"]}>
            <button className="btn-ghost btn-sm">
              See your Skill Maps
            </button>
          </Link>
          {isOwnProfile && (
            <button className="btn-ghost btn-sm" onClick={handleLogout}>
              Log Out
            </button>
          )}
        </div>
      </nav>

      {/* profile card */}
      <div className="page-content-center">
        <motion.div
          className="page-card page-card--md"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* back to skill maps */}
          {!(showAvatarPicker || showEditForm || showPasswordForm) && (
            <button type="button" className={styles['profile-back-btn']} onClick={() => router.push('/skillmaps')}>
              <ArrowLeft size={14} /> Back to Skill Maps
            </button>
          )}

          {/* avatar + username */}
          <div className={styles['profile-header']}>
            <div className={styles['profile-avatar']}>
              <img
                src={getAvatarUrl(user.seed, user.style)}
                alt={`${user.username}'s avatar`}
                className={styles['profile-avatar-img']}
              />
            </div>
            <div>
              <p className={styles["profile-label"]}>Username</p>
              <h1 className={styles["profile-username"]}>{user.username}</h1>
            </div>
          </div>

          {/* bio + meta — hidden while editing */}
          {!(showAvatarPicker || showEditForm || showPasswordForm) && (
            <>
              <div className={styles['profile-divider']} />
              <div className={styles["profile-section"]}>
                <p className={styles["profile-section-label"]}>Bio</p>
                <p className={styles["profile-section-text"]}>
                  {user.bio || <span className={styles["profile-empty"]}>No bio yet.</span>}
                </p>
              </div>
              <div className={styles["profile-meta-row"]}>
                <div>
                  <p className={styles["profile-meta-label"]}>Status</p>
                  <span className={user.status === "ONLINE" ? styles["profile-status-online"] : styles["profile-status-offline"]}>
                    ● {user.status}
                  </span>
                </div>
                <div>
                  <p className={styles["profile-meta-label"]}>Member Since</p>
                  <span className={styles["profile-meta-value"]}>{dateFormat}</span>
                </div>
              </div>
            </>
          )}

          {/* own profile actions */}
          {isOwnProfile && renderOwnerActions()}
        </motion.div>
      </div>
    </div>
  );
};

export default Profile;
