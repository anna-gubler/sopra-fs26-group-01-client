"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useApi } from "@/hooks/useApi";
import { User } from "@/types/user";
import React, { useState, useEffect } from "react";
import useLocalStorage from "@/hooks/useLocalStorage";
import { BookOpen, Eye, EyeOff } from "lucide-react";
import { motion } from "framer-motion";

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
  const [passwordError, setPasswordError] = useState("");
  const { clear: clearToken } = useLocalStorage<string>("token", "");
  const { value: loggedInId, clear: clearId } = useLocalStorage<string>("id", ""); // id of the currently logged-in user
  const isOwnProfile = id === "me" || String(loggedInId) === String(id); // controls whether edit/logout actions are shown

  // update password via PUT /users/me, then log out
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError("");
    if (newPassword === oldPassword) {
      setPasswordError("New password must be different from your old password.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match.");
      return;
    }
    try {
      await apiService.put("/users/me", { password: newPassword });
      await apiService.post("/auth/logout", {});
      clearToken();
      clearId();
      router.push("/login");
    } catch {
      setPasswordError("Incorrect old password or request failed. Please try again.");
    }
  };

  // log out locally even if the server call fails
  const handleLogout = async () => {
    try {
      await apiService.post("/auth/logout", {});
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
    const getUser = async () => {
      try {
        const result = await apiService.get<User>("/users/" + id);
        setUser(result);
      } catch (error) {
        if ((error as { status?: number }).status === 403) {
          router.push("/login");
        }
      }
    };
    getUser();
  }, [apiService]);

  if (!user) return null;

  // format creation date as DD.MM.YYYY (German locale)
  const dateFormat = user.creationDate
    ? new Date(user.creationDate).toLocaleDateString("de-DE")
    : "";

  return (
    <div style={{ background: "var(--bg-deep)", minHeight: "100vh", color: "var(--text-bright)" }}>

      {/* dot grid overlay */}
      <div style={{
        position: "fixed",
        inset: 0,
        backgroundImage:
          "linear-gradient(hsla(263,70%,58%,0.07) 1px, transparent 1px), linear-gradient(to right, hsla(263,70%,58%,0.07) 1px, transparent 1px)",
        backgroundSize: "40px 40px",
        pointerEvents: "none",
        zIndex: 0,
      }} />

      {/* navbar */}
      <nav className="glass-nav">
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none", color: "var(--text-bright)" }}>
          <div style={{
            width: 32, height: 32,
            background: "linear-gradient(135deg, var(--primary), var(--secondary))",
            borderRadius: 8,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <BookOpen size={16} color="white" />
          </div>
          <span style={{ fontWeight: 700, fontSize: 18, fontFamily: "var(--font-space-grotesk)" }}>Mappd</span>
        </Link>
        <div style={{ display: "flex", gap: 8 }}>
          <Link href="/skillmaps" style={{ textDecoration: "none" }}>
            <button className="btn-ghost" style={{ padding: "8px 18px", fontSize: 14 }}>
              See your Skill Maps
            </button>
          </Link>
          {isOwnProfile && (
            <button className="btn-ghost" style={{ padding: "8px 18px", fontSize: 14 }} onClick={handleLogout}>
              Log Out
            </button>
          )}
        </div>
      </nav>

      {/* profile card */}
      <div style={{
        position: "relative",
        zIndex: 1,
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "100px 24px 60px",
      }}>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{
            background: "var(--bg-surface)",
            border: "1px solid var(--border-color)",
            borderRadius: 20,
            padding: "40px 48px",
            width: "100%",
            maxWidth: 560,
          }}
        >
          {/* avatar + username */}
          <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 32 }}>
            <div style={{
              width: 64, height: 64,
              background: "linear-gradient(135deg, var(--primary), var(--secondary))",
              borderRadius: "50%",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 26, fontWeight: 700, color: "white",
              flexShrink: 0,
            }}>
              {user.username?.[0]?.toUpperCase()}
            </div>
            <div>
              <p style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 2 }}>Username</p>
              <h1 style={{ fontSize: 28, fontWeight: 700, color: "var(--text-bright)", lineHeight: 1.1 }}>
                {user.username}
              </h1>
            </div>
          </div>

          {/* divider */}
          <div style={{ borderTop: "1px solid var(--border-color)", marginBottom: 24 }} />

          {/* bio */}
          <div style={{ marginBottom: 20 }}>
            <p style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.08em" }}>Bio</p>
            <p style={{ fontSize: 15, color: "var(--text-secondary)", lineHeight: 1.6 }}>
              {user.bio || <span style={{ color: "var(--text-muted)", fontStyle: "italic" }}>No bio yet.</span>}
            </p>
          </div>

          {/* status + joined */}
          <div style={{ display: "flex", gap: 24, marginBottom: 32 }}>
            <div>
              <p style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.08em" }}>Status</p>
              <span style={{
                fontSize: 13, fontWeight: 600,
                color: user.status === "ONLINE" ? "var(--accent)" : "hsl(351, 80%, 60%)",
              }}>
                ● {user.status}
              </span>
            </div>
            <div>
              <p style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.08em" }}>Member Since</p>
              <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>{dateFormat}</span>
            </div>
          </div>

          {/* own profile actions */}
          {isOwnProfile && (
            <>
              <div style={{ borderTop: "1px solid var(--border-color)", marginBottom: 24 }} />
              {!showPasswordForm && (
                <button
                  className="btn-ghost"
                  style={{ width: "100%", justifyContent: "center" }}
                  onClick={() => { setShowPasswordForm(true); setPasswordError(""); setOldPassword(""); setNewPassword(""); setConfirmPassword(""); }}
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
                      <span style={{ fontSize: 12, color: "hsl(351, 80%, 60%)" }}>New password must be different from your old password.</span>
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
                      <span style={{ fontSize: 12, color: "hsl(351, 80%, 60%)" }}>Passwords do not match.</span>
                    )}
                  </div>
                  {passwordError && <div className="alert-error">{passwordError}</div>}
                  <button className="btn-gradient" style={{ width: "100%", justifyContent: "center", marginTop: 12 }} type="submit">
                    Confirm Password Change
                  </button>
                  <button
                    type="button"
                    className="btn-ghost"
                    style={{ width: "100%", justifyContent: "center", marginTop: 8 }}
                    onClick={() => { setShowPasswordForm(false); setPasswordError(""); setOldPassword(""); setNewPassword(""); setConfirmPassword(""); }}
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
