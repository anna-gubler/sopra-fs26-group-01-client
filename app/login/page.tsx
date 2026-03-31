"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useApi } from "@/hooks/useApi";
import useLocalStorage from "@/hooks/useLocalStorage";
import { ApplicationError } from "@/types/error";
import Link from "next/link";
import { motion } from "framer-motion";
import { BookOpen, Eye, EyeOff } from "lucide-react";

// shape of the auth response returned by POST /auth/login
interface AuthResponse {
  token: string | null;
  id: number | null;
}

const Login: React.FC = () => {
  const router = useRouter();
  const apiService = useApi();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  // persist token and user id in localStorage for use across pages
  const { set: setToken } = useLocalStorage<string>("token", "");
  const { set: setId } = useLocalStorage<string>("id", "");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    if (!username || !password) {
      setErrorMessage("Please enter both username and password.");
      return;
    }
    try {
      const response = await apiService.post<AuthResponse>("/auth/login", { username, password });
      // store credentials returned by the server
      if (response.token) setToken(response.token);
      if (response.id) setId(String(response.id)); // id is a Java Long, convert to string for localStorage
      router.push("/users/me");
    } catch (error) {
      const status = (error as ApplicationError).status;
      if (status === 400 || status === 401) {
        setErrorMessage("Invalid username or password.");
      } else {
        setErrorMessage("Login failed. Please try again.");
      }
    }
  };

  return (
    <div className="auth-page">
      <motion.div
        className="auth-card"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* logo */}
        <div className="auth-logo">
          <div className="logo-icon">
            <BookOpen size={22} color="white" />
          </div>
          <span className="logo-text">
            Mappd
          </span>
        </div>

        {/* heading */}
        <div className="auth-heading">
          <h2>Welcome back</h2>
          <p>Sign in to continue your learning journey</p>
        </div>

        {/* form */}
        <form className="auth-form" onSubmit={handleLogin}>
          <div className="input-group">
            <label htmlFor="username">Username</label>
            <input
              id="username"
              type="text"
              className="auth-input"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <div className="label-row">
              <label htmlFor="password">Password</label>
              <span className="label-hint-link">
                Forgot password?
              </span>
            </div>
            <div className="password-field">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                className="auth-input"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {errorMessage && <div className="alert-error">{errorMessage}</div>}

          <button type="submit" className="btn-gradient btn-full">
            Sign In
          </button>
        </form>

        {/* footer */}
        <p className="auth-footer-text">
          Don&apos;t have an account?{" "}
          <Link href="/register">Create one</Link>
        </p>
        <p className="auth-footer-text auth-footer-text-tight">
          <Link href="/" className="auth-back-link">← Back to home</Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Login;
