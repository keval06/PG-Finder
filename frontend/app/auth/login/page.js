"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Phone, Lock } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { authApi } from "../../../lib/api/auth";

export default function LoginPage() {
  const router = useRouter();

  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await authApi.login({ mobile, password });

      if (data.token) {
        const { token, ...user } = data;
        //  *login fun called to store -> userData, token in localStorage
        login(user, token);
        router.push("/"); //* Home page
      } else {
        alert(data.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const iconClass = "absolute left-3 text-gray-400 pointer-events-none";
  const inputClass =
    "w-full bg-transparent pl-9 pr-10 py-2.5 text-sm outline-none placeholder:text-gray-400";

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 px-4">
      <div className="bg-white w-full max-w-sm rounded-2xl shadow-md p-8 flex flex-col gap-5">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-gray-900">Welcome Back</h1>
          <p className="text-sm text-gray-400 mt-1">Login to PG Finder</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Mobile */}
          <div className="relative flex items-center border border-gray-200 rounded-xl bg-gray-50 focus-within:bg-white focus-within:border-blue-400 transition-colors">
            <Phone size={15} className={iconClass} />
            <input
              type="tel"
              placeholder="Mobile Number"
              value={mobile}
              onChange={(e) =>
                setMobile(e.target.value.replace(/\D/g, "").slice(0, 10))
              }
              className={inputClass}
              required
            />
          </div>

          {/* Password */}
          <div className="relative flex items-center border border-gray-200 rounded-xl bg-gray-50 focus-within:bg-white focus-within:border-blue-400 transition-colors">
            <Lock size={15} className={iconClass} />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={inputClass}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 text-gray-400 hover:text-gray-600 transition-colors"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white py-2.5 rounded-xl font-medium text-sm hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-1"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="text-sm text-center text-gray-500">
          Not registered?{" "}
          <Link
            href="/auth/signup"
            className="text-blue-600 hover:underline font-medium"
          >
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
}
