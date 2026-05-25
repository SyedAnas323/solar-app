"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="grid min-h-screen place-items-center bg-gradient-to-b from-orange-50 to-white p-4">
      <form
        className="w-full max-w-sm space-y-3 rounded-lg border bg-white p-6"
        onSubmit={async (e) => {
          e.preventDefault();
          const res = await signIn("credentials", { email, password, redirect: false });
          if (res?.ok) window.location.href = "/dashboard";
          else setError("Invalid credentials");
        }}
      >
        <h1 className="text-xl font-bold">Admin Login</h1>
        <input className="h-10 w-full rounded-md border px-3" placeholder="Enter your admin email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            className="h-10 w-full rounded-md border px-3 pr-10"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            type="button"
            aria-label={showPassword ? "Hide password" : "Show password"}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500"
            onClick={() => setShowPassword((v) => !v)}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        <button className="h-10 w-full rounded-md bg-orange-600 text-white">Sign in</button>
      </form>
    </div>
  );
}
