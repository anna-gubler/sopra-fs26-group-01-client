// your code here for S2 to display a single user profile after having clicked on it
// each user has their own slug /[id] (/1, /2, /3, ...) and is displayed using this file
// try to leverage the component library from antd by utilizing "Card" to display the individual user
// import { Card } from "antd"; // similar to /app/users/page.tsx

"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useApi } from "@/hooks/useApi"; 
import { User } from "@/types/user";
import React, { useState, useEffect } from "react";
import useLocalStorage from "@/hooks/useLocalStorage";
import { Card, Input, Form, Button } from "antd";
import FormItem from "antd/es/form/FormItem";
// For components that need React hooks and browser APIs,
// SSR (server side rendering) has to be disabled.
// Read more here: https://nextjs.org/docs/pages/building-your-application/rendering/server-side-rendering

const Profile: React.FC = () => {
  const params = useParams();
  const id = params.id;
  const apiService = useApi();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [form] = Form.useForm();

// Logout Handling / Redirect User to Login page / set user status to offline
/* const handleLogout = async () => {
  await apiService.put(`/logout/${token}`, {});
  clearToken();
  router.push("/login");
  };
 */

// Password change Handling and log user out
const { value: token, clear: clearToken } = useLocalStorage<string>("token", "");
  const handleChangeUser = async (values: { password: string }) => {
    await apiService.put(`/users/${id}`, {password: values.password});
    await apiService.put(`/logout/${token}`, {});
    clearToken();
    router.push(`/login`);
  }

// Check if user is signed in/has token. If not, redirect to login
// This is technically redundant since implementing the header authentication, but it was still faster and felt more UX friendly

useEffect(() => {
  const token = localStorage.getItem("token");
  if (!token) {
    router.push("/login");
  }
}, []); 

// User Identification on Page
const { value: loggedInID } = useLocalStorage<string>("id", "");
const UserIdentification = String(loggedInID) === String(id);

useEffect(() => {
  if (loggedInID && String(loggedInID) !== String(id)) {
    router.push(`/users/${id}`);
  }
}, [loggedInID, id]);

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
  const dateFormat = user.creationDate ? new Date(user.creationDate).toLocaleDateString("de-DE") : ""
  
  return (
    <div className="card-container">
      <Card className="User_Card">
        <Link className="User_Overview" href={`/users/${id}`}>← Back</Link>
        <h3 className="H3_User_Profile">Adjust User Information</h3>
        <br></br>
        <Form
        form={form}
        name="register"
        size="large"
        variant="outlined"
        onFinish={handleChangeUser}
        layout="vertical"
        >
        <Form.Item
          name="password"
          label="New Password"
          rules={[{ required: true, message: "Please input your new password!" }]}
        >
          <Input.Password placeholder="Enter new password" />
        </Form.Item>
        {/* <Form.Item
          name="password 2"
          label="Repeat New Password"
          rules={[{ required: true, message: "Please input your new password!" }]}
        >
          <Input placeholder="Repeat new password" />
        </Form.Item> */}
          <button className="button_standard button-wide" type="submit" >Confirm Password Change</button>
        </Form>
      </Card>
    </div>
  );
};

export default Profile;
