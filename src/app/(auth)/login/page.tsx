"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
// components
import AuthForm from "../AuthForm";
// utils
import { createClient } from "@/utils/supabase/client";

export default function Login() {
  const router = useRouter();
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent, email: string, password: string) => {
    e.preventDefault();
    setError("");

    const supabase = createClient();

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) setError(error.message);

    if (!error) {
      router.push("/");
      router.refresh(); // Refreshes the server components (like Navbar)
    }
  };

  return (
    <main>
      <h2 className="text-center">Login</h2>
      <AuthForm handleSubmit={handleSubmit} />
      {error && <p className="error">{error}</p>}
    </main>
  );
}
