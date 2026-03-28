"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useApi } from "@/hooks/useApi";
import useLocalStorage from "@/hooks/useLocalStorage";
import { User } from "@/types/user";

const Dashboard: React.FC = () => {
  const router = useRouter();
  const apiService = useApi();
  const [users, setUsers] = useState<User[] | null>(null);
  const [fetchError, setFetchError] = useState<string>("");
  const { clear: clearToken } = useLocalStorage<string>("token", "");

  // log out locally even if the server call fails
  const handleLogout = async () => {
    try {
      await apiService.post("/auth/logout", {});
    } catch {
      // still log out locally if the server is unreachable
    }
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

  // fetch all users from GET /users on mount
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data: User[] = await apiService.get<User[]>("/users");
        setUsers(data);
      } catch (error) {
        if ((error as { status?: number }).status === 403) {
          router.push("/login");
        } else if (error instanceof Error) {
          setFetchError("Something went wrong while fetching users.");
        }
      }
    };
    fetchUsers();
  }, [apiService]);

  return (
    <div className="card-container">
      <div className="dashboard-container">
        <h2 style={{ marginBottom: 16 }}>All Users</h2>
        {fetchError && <div className="alert-error">{fetchError}</div>}
        {!users ? (
          <p style={{ color: "var(--ctp-subtext0)" }}>Loading...</p>
        ) : (
          <>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Username</th>
                  <th>Status</th>
                  <th>User ID</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} onClick={() => router.push(`/users/${user.id}`)}>
                    <td>{user.name}</td>
                    <td>{user.username}</td>
                    <td>{user.status}</td>
                    <td>{user.id}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button className="button_standard" onClick={handleLogout}>
              Logout
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
