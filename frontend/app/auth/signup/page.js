//This tells Next.js to run this code in the user's browser, enabling React memory and event listeners (onChange, onSubmit).
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye,
  EyeOff,
  User,
  Phone,
  Lock,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { userApi } from "../../../lib/api/user";

export default function SignupPage() {
  // The steering wheel
  const router = useRouter();

// Memory for the 3 input boxes
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);//*Toggle: show/hide password text
  
  const [confirmPassword, setConfirmPassword] = useState(""); //* Stores re-entered password
  const [showConfirm, setShowConfirm] = useState(false);  //* Toggle: show/hide confirm password
  
  const passwordsMatch = password === confirmPassword;
  const showMatchIndicator = confirmPassword.length > 0;

  const [loading, setLoading] = useState(false);//*Is API call in progress?
  
  // *Memory to show an error if (e.g., Mobile already registered)
  const [error, setError] = useState(""); // ← visible error banner, not alert()


  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      setLoading(false);
      return;
    }
    if (!passwordsMatch) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }
    if (!/^[0-9]{10}$/.test(mobile)) {
      setError("Mobile number must be exactly 10 digits");
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const data = await userApi.signup({
        name: name.trim(),
        mobile: mobile.trim(),
        password: password,
      });

      if (data._id) {
        router.push("/auth/login");
        return; // ← stop here, don't fall through to error handling
      }

      // show backend error (e.g. "Mobile already registered") in UI
      setError(data.message || "Signup failed. Please try again.");
    } 

    catch {
      setError("Something went wrong. Please try again.");
    } 
    
    finally {
      setLoading(false);
    }
  };

  //  strings of Tailwind CSS classes stored in variables to avoid repetition. Used on every input.
  const iconClass = "absolute left-3 text-slate-400 pointer-events-none";
  const inputClass =
    "w-full bg-transparent pl-9 pr-10 py-2.5 text-sm outline-none placeholder:text-slate-400 text-slate-900";

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#f8fafc] px-4">
      <div className="bg-white w-full max-w-sm rounded-2xl shadow-sm border border-slate-200 p-8 flex flex-col gap-5">

      {/* */}
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900">Create Account</h1>
          <p className="text-sm text-slate-400 mt-1">Join PG Finder today</p>
        </div>

        {/* ERROR BANNER — visible, not alert() */}
        {/* Short-circuit rendering */}
        {error && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-100 text-red-600 text-sm px-4 py-3 rounded-xl">
            <XCircle size={15} className="flex-shrink-0" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">

          {/* Name */}
          <div className="relative flex items-center border border-slate-200 rounded-xl bg-slate-50 focus-within:bg-white focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-50 transition-all">
          {/* The input doesn't store its own value — React's state does. They stay in sync.*/}
            <User size={15} className={iconClass} />
            <input
              type="text"
              placeholder="Full Name"
              value={name}
              onChange={(e) => {
                const val = e.target.value.replace(/[^a-zA-Z\s]/g, "");
                setName(val);
              }}
              className={inputClass}
              required
            />
          </div>

          {/* Mobile */}
          <div className="relative flex items-center border border-slate-200 rounded-xl bg-slate-50 focus-within:bg-white focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-50 transition-all">
            
            {/* Letters are automatically stripped as you type! */}
            <Phone size={15} className={iconClass} />
            <input
              type="tel"
              placeholder="Mobile Number (10 digits)"
              value={mobile}
              onChange={(e) =>
                setMobile(e.target.value.replace(/\D/g, "").slice(0, 10))
              }
              className={inputClass}
              required
            />
          </div>


          {/* Password */}
          <div className="flex flex-col gap-1">
            {/* password input field */}
            <div className="relative flex items-center border border-slate-200 rounded-xl bg-slate-50 focus-within:bg-white focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-50 transition-all">
              <Lock size={15} className={iconClass} />

              {/* showPassword used here */}
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password (min 8 characters)"
                value={password}
                onChange={(e) => setPassword(e.target.value.trim())}
                className={inputClass}
                required
              />

              <button
                type="button"
                onClick={() => setShowPassword((p) => !p)}
                className="absolute right-3 text-slate-400 hover:text-slate-600 transition-colors"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {/* Live Password Length Warning*/}
            {password.trim().length > 0 && password.trim().length < 8 && (
              <p className="text-xs text-red-500 px-1 flex items-center gap-1">
                <XCircle size={13} /> At least 8 characters ({password.length}
                /8)
              </p>
            )}
          </div>

          {/* Confirm password */}
          <div className="flex flex-col gap-1">
            <div className="relative flex items-center border border-slate-200 rounded-xl bg-slate-50 focus-within:bg-white focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-50 transition-all">
              <Lock size={15} className={iconClass} />
              <input
                type={showConfirm ? "text" : "password"}
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value.trim())}
                className={inputClass}
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirm((p) => !p)}
                className="absolute right-3 text-slate-400 hover:text-slate-600 transition-colors"
              >
                {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            
            {/* Live Password Match Warning*/}
            {showMatchIndicator && (
              <p
                className={`text-xs px-1 flex items-center gap-1 ${passwordsMatch ? "text-green-500" : "text-red-500"}`}
              >
                {passwordsMatch ? (
                  <>
                    <CheckCircle2 size={13} />
                    Passwords match
                  </>
                ) : (
                  <>
                    <XCircle size={13} />
                    Passwords do not match
                  </>
                )}
              </p>
            )}

          </div>

          {/*passwordsMatch   */}
          <button
            type="submit"
            disabled={
              loading ||
              password.trim().length < 8 || name.trim().length <3 || 
              (showMatchIndicator && !passwordsMatch)
            }
            className="bg-blue-600 text-white py-2.5 rounded-xl font-semibold text-sm hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-1"
          >
            {loading ? "Creating account…" : "Sign Up"}
          </button>

        </form> {/* Form close*/}

        {/* login router */}
        <p className="text-sm text-center text-slate-500">
          Already a member?{" "}
          <Link
            href="/auth/login"
            className="text-blue-600 hover:underline font-medium"
          >
            Login
          </Link>

        </p>
      </div>
    </div>
  );
}
