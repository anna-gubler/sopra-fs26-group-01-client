"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useApi } from "@/hooks/useApi";
import { getUser, updateMe } from "@/api/userApi";
import { logout } from "@/api/authApi";
import { User } from "@/types/user";
import React, { useState, useEffect } from "react";
import useLocalStorage from "@/hooks/useLocalStorage";
import { BookOpen, Eye, EyeOff } from "lucide-react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import styles from "@/styles/profile.module.css";

const Profile: React.FC = () => {
  const params = useParams();
  const id = params.id; // profile id from the URL
  const apiService = useApi();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { value: token, clear: clearToken } = useLocalStorage<string>("token", "");
  const { value: loggedInId, clear: clearId } = useLocalStorage<string>("id", ""); // id of the currently logged-in user
  const isOwnProfile = id === "me" || String(loggedInId) === String(id); // controls whether edit/logout actions are shown

  // update password via PUT /users/me, then log out
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword === oldPassword) {
      toast.error("New password must be different from your old password.");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match.");
      return;
    }
    try {
      await updateMe(apiService, { password: newPassword } as Parameters<typeof updateMe>[1]);
      await logout(apiService);
      clearToken();
      clearId();
      router.push("/login");
    } catch {
      toast.error("Incorrect old password or request failed. Please try again.");
    }
  };

  // log out locally even if the server call fails
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

  // redirect to login if no token is present
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
    }
  }, []);

  // fetch the profile data for the user with this id
  useEffect(() => {
    if (!token) return; // wait for token to be available before fetching
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

  // format creation date as DD.MM.YYYY (German locale)
  const dateFormat = user.creationDate
    ? new Date(user.creationDate).toLocaleDateString("de-DE")
    : "";

  return (
    <div className="page-deep">

      {/* dot grid overlay */}
      <div className="grid-overlay" />

      {/* navbar */}
      <nav className="glass-nav">
        <Link href="/" className="nav-logo">
          <div className="nav-logo-icon">
            <BookOpen size={16} color="white" />
          </div>
          <span className="logo-text">Mappd</span>
        </Link>
        {isOwnProfile && (
          <button className="btn-ghost btn-sm" onClick={handleLogout}>
            Log Out
          </button>
        )}
      </nav>

      {/* profile card */}
      <div className="page-content-center">
        <motion.div
          className="page-card page-card--md"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* avatar + username */}
          <div className={styles['profile-header']}>
            <div className={styles['profile-avatar']}>
              {user.username?.[0]?.toUpperCase()}
            </div>
            <div>
              <p className={styles['profile-label']}>Username</p>
              <h1 className={styles['profile-username']}>{user.username}</h1>
            </div>
          </div>

          {/* divider */}
          <div className={styles['profile-divider']} />

          {/* bio */}
          <div className={styles['profile-section']}>
            <p className={styles['profile-section-label']}>Bio</p>
            <p className={styles['profile-section-text']}>
              {user.bio || <span className={styles['profile-empty']}>No bio yet.</span>}
            </p>
          </div>

          {/* status + joined */}
          <div className={styles['profile-meta-row']}>
            <div>
              <p className={styles['profile-meta-label']}>Status</p>
              <span className={user.status === "ONLINE" ? styles['profile-status-online'] : styles['profile-status-offline']}>
                ● {user.status}
              </span>
            </div>
            <div>
              <p className={styles['profile-meta-label']}>Member Since</p>
              <span className={styles['profile-meta-value']}>{dateFormat}</span>
            </div>
          </div>

          {/* own profile actions */}
          {isOwnProfile && (
            <>
              <div className={styles['profile-divider']} />
              {!showPasswordForm && (
                <button
                  className="btn-ghost btn-full"
                  onClick={() => { setShowPasswordForm(true); setOldPassword(""); setNewPassword(""); setConfirmPassword(""); }}
                >
                  Change Password
                </button>
              )}

              {showPasswordForm && (
                <form onSubmit={handleChangePassword}>
                  <div className="input-group">
                    <label htmlFor="old-password">Old Password</label>
                    <div className="password-field">
                      <input
                        id="old-password"
                        type={showOldPassword ? "text" : "password"}
                        className="auth-input"
                        placeholder="Enter old password"
                        value={oldPassword}
                        onChange={(e) => setOldPassword(e.target.value)}
                        required
                      />
                      <button type="button" className="toggle-password" onClick={() => setShowOldPassword(!showOldPassword)}>
                        {showOldPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>
                  <div className="input-group">
                    <label htmlFor="new-password">New Password</label>
                    <div className="password-field">
                      <input
                        id="new-password"
                        type={showNewPassword ? "text" : "password"}
                        className="auth-input"
                        placeholder="Enter new password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                      />
                      <button type="button" className="toggle-password" onClick={() => setShowNewPassword(!showNewPassword)}>
                        {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    {newPassword && oldPassword && newPassword === oldPassword && (
                      <span className="field-error">New password must be different from your old password.</span>
                    )}
                  </div>
                  <div className="input-group">
                    <label htmlFor="confirm-password">Confirm New Password</label>
                    <div className="password-field">
                      <input
                        id="confirm-password"
                        type={showConfirmPassword ? "text" : "password"}
                        className="auth-input"
                        placeholder="Enter new password again"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                      />
                      <button type="button" className="toggle-password" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                        {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    {confirmPassword && newPassword && confirmPassword !== newPassword && (
                      <span className="field-error">Passwords do not match.</span>
                    )}
                  </div>
                  <button className="btn-gradient btn-full mt-12" type="submit">
                    Confirm Password Change
                  </button>
                  <button
                    type="button"
                    className="btn-ghost btn-full mt-8"
                    onClick={() => { setShowPasswordForm(false); setOldPassword(""); setNewPassword(""); setConfirmPassword(""); }}
                  >
                    Cancel
                  </button>
                </form>
              )}
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Profile;
