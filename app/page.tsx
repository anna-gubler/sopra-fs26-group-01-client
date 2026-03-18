"use client"; // For components that need React hooks and browser APIs, SSR (server side rendering) has to be disabled. Read more here: https://nextjs.org/docs/pages/building-your-application/rendering/server-side-rendering
import { useRouter } from "next/navigation";
// import Image from "next/image";
import { Button } from "antd";
// import { BookOutlined, CodeOutlined, GlobalOutlined } from "@ant-design/icons";
import styles from "@/styles/page.module.css";

export default function Home() {
  const router = useRouter();
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <header>
          <h1 style={{ fontFamily: "var(--font-ballet)", fontSize: "10.5rem" }}> Group 01: Mappd</h1>
        </header>
        <div style={{ fontFamily: "var(--font-montserrat)", fontSize: "1.5rem", textAlign: "center" }}>
          <b>In this space big things will emerge soon.</b>
          <p>Our team consists of: Chiara Wooldridge, Elias Iskander, Sebastian Huber, Hadia Aslam and Anna Gubler.</p>
        </div>

        <div className={styles.ctas} style={{ textAlign: "center", display: "flex", justifyContent: "center" }}>
          <Button
            type="default"
            variant="solid"
            onClick={() => router.push("/register")}
          >
            Go to Register
          </Button>
          <Button
            type="primary"
            variant="solid"
            onClick={() => router.push("/login")}
          >
            Go to login
          </Button>
        </div>
      </main>
    </div>
  );
}
