"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useApi } from "@/hooks/useApi";
import useLocalStorage from "@/hooks/useLocalStorage";
import { User } from "@/types/user";
import { App, Button, Card, Table } from "antd";
import type { TableProps } from "antd";

// columns definition for the Ant Design table
const columns: TableProps<User>["columns"] = [
  { title: "Name", dataIndex: "name", key: "name" },
  { title: "Username", dataIndex: "username", key: "username" },
  { title: "Status", dataIndex: "status", key: "status" },
  { title: "User ID", dataIndex: "id", key: "id" },
];

const Dashboard: React.FC = () => {
  const router = useRouter();
  const apiService = useApi();
  const { message } = App.useApp();
  const [users, setUsers] = useState<User[] | null>(null);
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
        const users: User[] = await apiService.get<User[]>("/users");
        setUsers(users);
      } catch (error) {
        if ((error as { status?: number }).status === 403) {
          router.push("/login");
        } else if (error instanceof Error) {
          message.error("Something went wrong while fetching users.");
        }
      }
    };
    fetchUsers();
  }, [apiService]);

  return (
    <div className="card-container">
      <Card title="All Users:" loading={!users} className="dashboard-container">
        {users && (
          <>
            <Table<User>
              columns={columns}
              dataSource={users}
              rowKey="id"
              onRow={(row) => ({
                onClick: () => router.push(`/users/${row.id}`),
                style: { cursor: "pointer" },
              })}
            />
            <Button className="button_standard" onClick={handleLogout} type="primary">
              Logout
            </Button>
          </>
        )}
      </Card>
    </div>
  );
};

export default Dashboard;
