"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useApi } from "@/hooks/useApi";
import { User } from "@/types/user";
import React, { useState, useEffect } from "react";
import useLocalStorage from "@/hooks/useLocalStorage";

const EditProfile: React.FC = () => {
  const params = useParams();
  const id = params.id; // profile id from the URL
  const apiService = useApi();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [password, setPassword] = useState("");
  const { clear: clearToken } = useLocalStorage<string>("token", "");
  const { value: loggedInId } = useLocalStorage<string>("id", ""); // id of the currently logged-in user

  // update password via PUT /users/me, then log the user out
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    await apiService.put("/users/me", { password });
    await apiService.post("/auth/logout", {});
    clearToken();
    router.push("/login");
  };

  // redirect to login if no token is present
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
    }
  }, []);

  // redirect if viewing someone else's edit page
  useEffect(() => {
    if (loggedInId && String(loggedInId) !== String(id)) {
      router.push(`/users/${id}`);
    }
  }, [loggedInId, id]);

  // fetch the user's current data to populate the page
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

  return (
    <div className="card-container">
      <div className="User_Card">
        <Link className="User_Overview" href={`/users/${id}`}>← Back</Link>
        <h3>Adjust User Information</h3>
        <br />
        <form onSubmit={handleChangePassword}>
          <div className="form-item">
            <label htmlFor="password">New Password</label>
            <input
              id="password"
              type="password"
              placeholder="Enter new password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button className="button_standard button-wide" type="submit">
            Confirm Password Change
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditProfile;
