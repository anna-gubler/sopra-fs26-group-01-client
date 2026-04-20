"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useApi } from "@/hooks/useApi";
import { register } from "@/api/authApi";
import useLocalStorage from "@/hooks/useLocalStorage";
import { ApplicationError } from "@/types/error";
import Link from "next/link";
import { motion } from "framer-motion";
import { BookOpen, Eye, EyeOff } from "lucide-react";
import toast from "react-hot-toast";
import styles from "@/styles/auth.module.css";


const Register: React.FC = () => {
  const router = useRouter();
  const apiService = useApi();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [bio, setBio] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  // persist token and user id in localStorage for use across pages
  const { set: setToken } = useLocalStorage<string>("token", "");
  const { set: setId } = useLocalStorage<string>("id", "");

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await register(apiService, {
        username,
        password,
        ...(bio && { bio }),
      });
      // store credentials returned by the server
      if (response.token) setToken(response.token);
      if (response.id) setId(String(response.id)); // id is a Java Long, convert to string for localStorage
      router.push("/skillmaps");
    } catch (error) {
      const status = (error as ApplicationError).status;
      if (status === 400) {
        toast.error("Please fill in all required fields.");
      } else if (status === 409) {
        toast.error("This username is already taken.");
      } else {
        toast.error("Registration failed. Please try again.");
      }
    }
  };

  return (
    <div className={styles['auth-page']}>
      <motion.div
        className={styles['auth-card']}
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Logo */}
        <div className={styles['auth-logo']}>
          <div className={styles['logo-icon']}>
            <BookOpen size={22} color="white" />
          </div>
          <span className="logo-text">
            Mappd
          </span>
        </div>

        {/* heading */}
        <div className={styles['auth-heading']}>
          <h2>Create your account</h2>
          <p>Start mapping your skills today</p>
        </div>

        {/* form */}
        <form className="auth-form" onSubmit={handleRegister}>
          <div className="input-group">
            <label htmlFor="username">Username</label>
            <input
              id="username"
              type="text"
              className="auth-input"
              placeholder="Choose a username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <label htmlFor="password">Password</label>
            <div className="password-field">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                className="auth-input"
                placeholder="Create a password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="toggle-password"
                aria-label={showPassword ? "Hide password" : "Show password"}
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div className="input-group">
            <label htmlFor="bio">Bio <span className="label-optional">(optional)</span></label>
            <textarea
              id="bio"
              className="auth-input textarea-resize-v"
              placeholder="Tell us a bit about yourself"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
            />
          </div>

          <button type="submit" className="btn-gradient btn-full">
            Create Account
          </button>
        </form>

        {/* footer */}
        <p className={styles['auth-footer-text']}>
          Already have an account?{" "}
          <Link href="/login">Sign in</Link>
        </p>
        <p className={`${styles['auth-footer-text']} ${styles['auth-footer-text-tight']}`}>
          <Link href="/" className={styles['auth-back-link']}>← Back to home</Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Register;
