"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, User, Phone, Lock, CheckCircle2, XCircle } from "lucide-react";

export default function SignupPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  const passwordsMatch = password === confirmPassword;
  const showMatchIndicator = confirmPassword.length > 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password.length < 8) {
      alert("Password must be at least 8 characters");
      return;
    }
    if (!passwordsMatch) return;
    if (!/^[0-9]{10}$/.test(mobile)) {
      alert("Mobile number must be exactly 10 digits");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/user/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, mobile, password }),
      });
      const data = await res.json();
      if (res.ok) {
        router.push("/auth/login");
      } else {
        alert(data.message);
      }
    } finally {
      setLoading(false);
      setName("");
      setMobile("");
      setPassword("");
      setShowPassword("");
      setConfirmPassword("");
    }
  };

  const iconClass = "absolute left-3 text-gray-400 pointer-events-none";
  const inputClass = "w-full bg-transparent pl-9 pr-10 py-2.5 text-sm outline-none placeholder:text-gray-400";

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 px-4">
      <div className="bg-white w-full max-w-sm rounded-2xl shadow-md p-8 flex flex-col gap-5">

        <div className="text-center">
          <h1 className="text-2xl font-semibold text-gray-900">Create Account</h1>
          <p className="text-sm text-gray-400 mt-1">Join PG Finder today</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">

          {/* Name */}
          <div className="relative flex items-center border border-gray-200 rounded-xl bg-gray-50 focus-within:bg-white focus-within:border-blue-400 transition-colors">
            <User size={15} className={iconClass} />
            <input type="text" placeholder="Full Name" value={name}
              onChange={(e) => setName(e.target.value)}
              className={inputClass} required />
          </div>

          {/* Mobile */}
          <div className="relative flex items-center border border-gray-200 rounded-xl bg-gray-50 focus-within:bg-white focus-within:border-blue-400 transition-colors">
            <Phone size={15} className={iconClass} />
            <input type="tel" placeholder="Mobile Number (10 digits)" value={mobile}
              onChange={(e) => setMobile(e.target.value.replace(/\D/g, "").slice(0, 10))}
              className={inputClass} required minLength={10} maxLength={10} />
          </div>

          {/* Password */}
          <div className="flex flex-col gap-1">
            <div className="relative flex items-center border border-gray-200 rounded-xl bg-gray-50 focus-within:bg-white focus-within:border-blue-400 transition-colors">
              <Lock size={15} className={iconClass} />
              <input type={showPassword ? "text" : "password"} placeholder="Password (min 8 characters)" value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={inputClass} required minLength={8} />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 text-gray-400 hover:text-gray-600 transition-colors">
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {password.length > 0 && password.length < 8 && (
              <p className="text-xs text-red-500 px-1 flex items-center gap-1">
                <XCircle size={13} /> At least 8 characters required ({password.length}/8)
              </p>
            )}
          </div>

          {/* Confirm Password */}
          <div className="flex flex-col gap-1">
            <div className="relative flex items-center border border-gray-200 rounded-xl bg-gray-50 focus-within:bg-white focus-within:border-blue-400 transition-colors">
              <Lock size={15} className={iconClass} />
              <input type={showConfirm ? "text" : "password"} placeholder="Confirm Password" value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={inputClass} required />
              <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 text-gray-400 hover:text-gray-600 transition-colors">
                {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {/* Live match indicator */}
            {showMatchIndicator && (
              <div className={`flex items-center gap-1.5 text-xs px-1 ${passwordsMatch ? "text-green-500" : "text-red-500"}`}>
                {passwordsMatch
                  ? <><CheckCircle2 size={13} />Passwords match</>
                  : <><XCircle size={13} />Passwords do not match</>}
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || password.length < 8 || (showMatchIndicator && !passwordsMatch)}
            className="bg-blue-600 text-white py-2.5 rounded-xl font-medium text-sm hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-1"
          >
            {loading ? "Creating account..." : "Sign Up"}
          </button>

        </form>

        <p className="text-sm text-center text-gray-500">
          Already a member?{" "}
          <Link href="/auth/login" className="text-blue-600 hover:underline font-medium">Login</Link>
        </p>

      </div>
    </div>
  );
}