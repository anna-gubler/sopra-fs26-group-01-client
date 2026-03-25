"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useApi } from "@/hooks/useApi";
import useLocalStorage from "@/hooks/useLocalStorage";
import { Alert, Button, Form, Input } from "antd";
import { ApplicationError } from "@/types/error";
import Link from "next/link";

// shape of the auth response returned by POST /auth/login
interface AuthResponse {
  token: string | null;
  id: number | null;
}

// values collected from the login form
interface LoginFormValues {
  username: string;
  password: string;
}

const Login: React.FC = () => {
  const router = useRouter();
  const apiService = useApi();
  const [form] = Form.useForm();
  const [errorMessage, setErrorMessage] = useState<string>("");
  // persist token and user id in localStorage for use across pages
  const { set: setToken } = useLocalStorage<string>("token", "");
  const { set: setId } = useLocalStorage<string>("id", "");

  const handleLogin = async (values: LoginFormValues) => {
    setErrorMessage("");
    try {
      const response = await apiService.post<AuthResponse>("/auth/login", values);
      // store credentials returned by the server
      if (response.token) {
        setToken(response.token);
      }
      if (response.id) {
        setId(String(response.id)); // id is a Java Long, convert to string for localStorage
      }
      router.push("/dashboard");
    } catch (error) {
      const status = (error as ApplicationError).status;
      if (status === 400) {
        setErrorMessage("Please enter both username and password.");
      } else if (status === 401) {
        setErrorMessage("Invalid username or password.");
      } else {
        setErrorMessage("Login failed. Please try again.");
      }
    }
  };

  return (
    <div className="login-container">
      <div>
        <h1 style={{ marginBottom: 10 }}>LOG IN</h1>
        <Form
          form={form}
          name="login"
          size="large"
          variant="outlined"
          onFinish={handleLogin}
          layout="vertical"
        >
          <Form.Item
            name="username"
            label="Username"
            rules={[{ required: true, message: "Please input your username!" }]}
          >
            <Input placeholder="Enter username" />
          </Form.Item>
          <Form.Item
            name="password"
            label="Password"
            rules={[{ required: true, message: "Please input your password!" }]}
          >
            <Input.Password placeholder="Enter password" />
          </Form.Item>
          <Form.Item style={{ marginBottom: 4 }}>
            <Link href="/register">Don&apos;t have an account yet? Register Here</Link>
          </Form.Item>
          {errorMessage && (
            <Alert type="error" title={errorMessage} showIcon style={{ marginBottom: 16 }} />
          )}
          <Form.Item>
            <Button type="primary" htmlType="submit" className="button_standard">
              Login
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
};

export default Login;
