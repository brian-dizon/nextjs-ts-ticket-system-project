"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import AuthForm from "../AuthForm";
import { createClient } from "@/utils/supabase/client";

export default function SignUp() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent, email: string, password: string) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const supabase = createClient();

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setError(error.message);
      setIsLoading(false);
    }
    if (!error) router.push("/verify");
  };

  return (
    <main>
      <h2 className="text-center">Sign Up</h2>

      <div className={isLoading ? "opacity-50 pointer-events-none" : ""}>
        <AuthForm handleSubmit={handleSubmit} />
      </div>

      {error && <div className="error">{error}</div>}

      {isLoading && <p className="text-center mt-4">Signing you up. Please wait...</p>}
    </main>
  );
}
