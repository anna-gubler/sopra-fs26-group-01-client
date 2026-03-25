"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useApi } from "@/hooks/useApi";
import { User } from "@/types/user";
import React, { useState, useEffect } from "react";
import useLocalStorage from "@/hooks/useLocalStorage";
import { Card } from "antd";

const Profile: React.FC = () => {
  const params = useParams();
  const id = params.id; // profile id from the URL
  const apiService = useApi();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const { clear: clearToken } = useLocalStorage<string>("token", "");
  const { value: loggedInId } = useLocalStorage<string>("id", ""); // id of the currently logged-in user
  const isOwnProfile = String(loggedInId) === String(id); // controls whether edit/logout actions are shown

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
    <div className="card-container">
      <Card className="User_Card">
        <Link className="User_Overview" href="/users">← View all users</Link>
        <p className="small_explainer">Name</p>
        <p className="User_Name">{user.name}</p>
        <p className="small_explainer">Username</p>
        <p className="User_Username">{user.username}</p>
        <h3>BIO</h3>
        <p className="User_Bio">{user.bio}</p>
        <p className={user.status === "ONLINE" ? "User_status-online" : "User_status-offline"}>
          {user.status}
        </p>
        <p className="User_CreationDate">User Since: {dateFormat}</p>
        {isOwnProfile && (
          <>
            <Link className="button_standard button-ChangeUser" href={`/users/${id}/edit`}>
              Change your Password →
            </Link>
            <br />
            <button className="button_standard logout_button" onClick={handleLogout}>
              Log Out
            </button>
          </>
        )}
      </Card>
    </div>
  );
};

export default Profile;
