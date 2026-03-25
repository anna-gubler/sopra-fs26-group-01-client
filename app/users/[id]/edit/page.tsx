"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useApi } from "@/hooks/useApi";
import { User } from "@/types/user";
import React, { useState, useEffect } from "react";
import useLocalStorage from "@/hooks/useLocalStorage";
import { Card, Input, Form, Button } from "antd";

const EditProfile: React.FC = () => {
  const params = useParams();
  const id = params.id; // profile id from the URL
  const apiService = useApi();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [form] = Form.useForm();
  const { clear: clearToken } = useLocalStorage<string>("token", "");
  const { value: loggedInId } = useLocalStorage<string>("id", ""); // id of the currently logged-in user

  // update password via PUT /users/me, then log the user out
  const handleChangePassword = async (values: { password: string }) => {
    await apiService.put("/users/me", { password: values.password });
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
      <Card className="User_Card">
        <Link className="User_Overview" href={`/users/${id}`}>← Back</Link>
        <h3>Adjust User Information</h3>
        <br />
        <Form
          form={form}
          name="edit"
          size="large"
          variant="outlined"
          onFinish={handleChangePassword}
          layout="vertical"
        >
          <Form.Item
            name="password"
            label="New Password"
            rules={[{ required: true, message: "Please input your new password!" }]}
          >
            <Input.Password placeholder="Enter new password" />
          </Form.Item>
          <Button className="button_standard button-wide" htmlType="submit">
            Confirm Password Change
          </Button>
        </Form>
      </Card>
    </div>
  );
};

export default EditProfile;
