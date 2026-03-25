"use client";

import { useRouter } from "next/navigation";
import { useApi } from "@/hooks/useApi";
import useLocalStorage from "@/hooks/useLocalStorage";
import { Button, Form, Input } from "antd";
import Link from "next/link";

// shape of the auth response returned by POST /auth/register
interface AuthResponse {
  token: string | null;
  id: number | null;
}

// values collected from the registration form
interface RegisterFormValues {
  name: string;
  username: string;
  password: string;
  bio?: string; // optional, user can leave it empty
  // TODO what do we want for registration
}

const Register: React.FC = () => {
  const router = useRouter();
  const apiService = useApi();
  const [form] = Form.useForm();
  // persist token and user id in localStorage for use across pages
  const { set: setToken } = useLocalStorage<string>("token", "");
  const { set: setId } = useLocalStorage<string>("id", "");

  const handleRegister = async (values: RegisterFormValues) => {
    try {
      const response = await apiService.post<AuthResponse>("/auth/register", values);
      // store credentials returned by the server
      if (response.token) {
        setToken(response.token);
      }
      if (response.id) {
        setId(String(response.id)); // id is a Java Long, convert to string for localStorage
      }
      router.push("/dashboard");
    } catch (error) {
      if (error instanceof Error) {
        alert(`Something went wrong during registration:\n${error.message}`);
      }
    }
  };

  return (
    <div className="login-container">
      <div>
        <h1 style={{ marginBottom: 10 }}>REGISTER</h1>
        <Form
          form={form}
          name="register"
          size="large"
          variant="outlined"
          onFinish={handleRegister}
          layout="vertical"
        >
          <Form.Item
            name="name"
            label="Name"
            rules={[{ required: true, message: "Please input your name!" }]}
          >
            <Input placeholder="Enter name" />
          </Form.Item>
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
          <Form.Item
            name="bio"
            label="Bio"
          >
            <Input.TextArea placeholder="Add bio" />
          </Form.Item>
          <Form.Item style={{ marginBottom: 4 }}>
            <Link href="/login">Already have an account? Log in Here</Link>
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" className="button_standard">
              Register
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
};

export default Register;
