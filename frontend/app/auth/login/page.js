"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Phone, Lock, AlertCircle } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { authApi } from "../../../lib/api/auth";

export default function LoginPage() {
  const router = useRouter();

  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const data = await authApi.login({ mobile, password });

      if (data.token) {
        const { token, ...user } = data;
        login(user, token);
        router.push("/"); //* Home page
      } else {
        // Backend returned 400 { message: "Invalid credentials" }
        setError(data.message || "Login failed. Please try again.");
      }
    } catch (err) {
      // authApi.login now throws typed errors:
      // - AbortError → "Connection timed out..."
      // - HTTP error → "Login failed (400)" or "Invalid credentials"
      // - Network error → TypeError with generic message
      if (err.message?.includes("timed out")) {
        setError(
          "Server is not responding. Make sure the backend is running on the correct port.",
        );
      } else if (
        err.message?.includes("Failed to fetch") ||
        err.message?.includes("NetworkError")
      ) {
        setError(
          "Cannot reach server. Check your internet connection and backend URL.",
        );
      } else {
        setError(err.message || "Login failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const iconClass = "absolute left-3 text-gray-400 pointer-events-none";
  const inputClass =
    "w-full bg-transparent pl-9 pr-10 py-2.5 text-sm outline-none placeholder:text-gray-400";

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-80px)] bg-white px-4 py-8">
      <div className="bg-white w-full max-w-sm rounded-2xl shadow-[0_4px_16px_rgba(0,0,0,0.10)] p-8 flex flex-col gap-5">
        {" "}
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-gray-900">Welcome Back</h1>
          <p className="text-sm text-gray-400 mt-1">Login to QuickPG</p>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Mobile */}
          <div className="relative flex items-center border border-gray-200 rounded-xl bg-gray-50 focus-within:bg-white focus-within:border-rose-400 transition-colors">
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
          {/* Password Container */}
          <div className="relative flex items-center border border-gray-200 rounded-xl bg-gray-50 focus-within:bg-white focus-within:border-rose-400 transition-colors">
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

          {/* Forgot Password Link - Place it HERE, outside the div above */}
          <div className="flex justify-end -mt-2">
            <Link
              href="/auth/forgot-password"
              className="text-xs font-medium text-rose-500 hover:text-rose-600 transition-colors"
            >
              Forgot Password?
            </Link>
          </div>

          {/* Inline error — replaces the blocking native alert() */}
          {error && (
            <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2.5">
              <AlertCircle size={15} className="flex-shrink-0" />
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="bg-[#FF385C] text-white py-2.5 rounded-xl font-medium text-sm hover:bg-[#E31C5F] transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-1"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
        <p className="text-sm text-center text-gray-500">
          Not registered?{" "}
          <Link
            href="/auth/signup"
            className="text-rose-500 hover:underline font-medium"
          >
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
}
