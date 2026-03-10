"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  User,
  Phone,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  XCircle,
  ArrowLeft,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export default function EditProfilePage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [showConfirmPopup, setShowConfirmPopup] = useState(false);
  const [pendingBody, setPendingBody] = useState(null); // { type: "success" | "error", text: string }
  const {user, updatedUser } = useAuth();

  useEffect(() => {
    try {
      const stored = localStorage.getItem("user");
      if (!stored || stored === "undefined") {
        router.push("/auth/login");
        return;
      }
      const parsed = JSON.parse(stored);
      setUser(parsed);
      setName(parsed.name || "");
      setMobile(String(parsed.mobile || ""));
    } catch {
      router.push("/auth/login");
    }
  }, []);

  const passwordsMatch = password === confirmPassword;
  const showMatchIndicator = confirmPassword.length > 0;
  const passwordTooShort = password.length > 0 && password.length < 8;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);

    if (name.trim().length < 3) {
      setMessage({ type: "error", text: "Name must be at least 3 characters" });
      return;
    }
    if (!/^[0-9]{10}$/.test(mobile)) {
      setMessage({
        type: "error",
        text: "Mobile number must be exactly 10 digits",
      });
      return;
    }
    if (password && password.length < 8) {
      setMessage({
        type: "error",
        text: "Password must be at least 8 characters",
      });
      return;
    }
    if (password && !passwordsMatch) {
      setMessage({ type: "error", text: "Passwords do not match" });
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/auth/login");
      return;
    }

    const body = {};

    if (name !== user.name) body.name = name;
    if (mobile !== String(user.mobile)) body.mobile = mobile;
    if (password) body.password = password;

    if (Object.keys(body).length === 0) {
      setMessage({ type: "error", text: "No changes made" });
      return;
    }

    // show confirm popup instead of submitting directly
    setPendingBody(body);
    setShowConfirmPopup(true);
  };

  const confirmUpdate = async () => {
    setShowConfirmPopup(false);
    const token = localStorage.getItem("token");
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:5000/api/user/${user._id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(pendingBody),
      });

      const data = await res.json();

      if (res.ok) {
        updatedUser(data);
        setPassword("");
        setConfirmPassword("");
        setMessage({ type: "success", text: "Profile updated successfully!" });
      } else {
        setMessage({
          type: "error",
          text: data.message || "Update failed. Please try again.",
        });
      }
    } catch {
      setMessage({
        type: "error",
        text: "Something went wrong. Please try again.",
      });
    } finally {
      setLoading(false);
      setPendingBody(null);
      setPassword("");
      setConfirmPassword("");
    }
  };

  const iconClass = "absolute left-3 text-gray-400 pointer-events-none";
  const inputClass =
    "w-full bg-transparent pl-9 pr-10 py-2.5 text-sm outline-none placeholder:text-gray-400";

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="max-w-sm mx-auto">
        {/* Back button */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-6 transition-colors"
        >
          <ArrowLeft size={16} /> Back
        </button>

        <div className="bg-white rounded-2xl shadow-md p-8 flex flex-col gap-5">
          <div className="text-center">
            <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
              <User size={28} className="text-gray-500" />
            </div>
            <h1 className="text-2xl font-semibold text-gray-900">
              Edit Profile
            </h1>
            <p className="text-sm text-gray-400 mt-1">
              Update your account details
            </p>
          </div>

          {/* Success / Error message */}
          {message && (
            <div
              className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium ${
                message.type === "success"
                  ? "bg-green-50 text-green-700 border border-green-100"
                  : "bg-red-50 text-red-600 border border-red-100"
              }`}
            >
              {message.type === "success" ? (
                <CheckCircle2 size={16} />
              ) : (
                <XCircle size={16} />
              )}
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Name */}
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1.5 block">
                Full Name
              </label>
              <div className="relative flex items-center border border-gray-200 rounded-xl bg-gray-50 focus-within:bg-white focus-within:border-blue-400 transition-colors">
                <User size={15} className={iconClass} />
                <input
                  type="text"
                  placeholder="Full Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={inputClass}
                  required
                />
              </div>
              {name.trim().length > 0 && name.trim().length < 3 && (
                <p className="text-xs text-red-500 px-1 mt-1 flex items-center gap-1">
                  <XCircle size={13} /> Name must be at least 3 characters
                </p>
              )}
            </div>

            {/* Mobile */}
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1.5 block">
                Mobile Number
              </label>
              <div className="relative flex items-center border border-gray-200 rounded-xl bg-gray-50 focus-within:bg-white focus-within:border-blue-400 transition-colors">
                <Phone size={15} className={iconClass} />
                <input
                  type="tel"
                  placeholder="10-digit mobile number"
                  value={mobile}
                  onChange={(e) =>
                    setMobile(e.target.value.replace(/\D/g, "").slice(0, 10))
                  }
                  className={inputClass}
                  required
                />
              </div>
            </div>

            <div className="border-t border-gray-100 pt-2">
              <p className="text-xs text-gray-400 mb-3">
                Leave password fields empty to keep current password
              </p>

              {/* New Password */}
              <div className="flex flex-col gap-1 mb-4">
                <label className="text-xs font-medium text-gray-500 mb-1.5 block">
                  New Password
                </label>
                <div className="relative flex items-center border border-gray-200 rounded-xl bg-gray-50 focus-within:bg-white focus-within:border-blue-400 transition-colors">
                  <Lock size={15} className={iconClass} />
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="New password (min 8 characters)"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={inputClass}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {passwordTooShort && (
                  <p className="text-xs text-red-500 px-1 flex items-center gap-1">
                    <XCircle size={13} /> At least 8 characters required (
                    {password.length}/8)
                  </p>
                )}
              </div>

              {/* Confirm Password */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-gray-500 mb-1.5 block">
                  Confirm New Password
                </label>
                <div className="relative flex items-center border border-gray-200 rounded-xl bg-gray-50 focus-within:bg-white focus-within:border-blue-400 transition-colors">
                  <Lock size={15} className={iconClass} />
                  <input
                    type={showConfirm ? "text" : "password"}
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={inputClass}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {showMatchIndicator && (
                  <p
                    className={`text-xs px-1 flex items-center gap-1 ${
                      passwordsMatch ? "text-green-500" : "text-red-500"
                    }`}
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
            </div>

            <button
              type="submit"
              disabled={
                loading ||
                name.trim().length < 3 ||
                passwordTooShort ||
                (showMatchIndicator && !passwordsMatch)
              }
              className="bg-blue-600 text-white py-2.5 rounded-xl font-medium text-sm hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-1"
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </form>
        </div>
      </div>

      {/* CONFIRM POPUP */}
      {showConfirmPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          {/* backdrop */}
          <div
            className="absolute inset-0 bg-black bg-opacity-40"
            onClick={() => setShowConfirmPopup(false)}
          />
          {/* popup */}
          <div className="relative bg-white rounded-2xl shadow-xl p-6 w-full max-w-xs flex flex-col gap-4 z-10">
            <div className="text-center">
              <div className="bg-blue-50 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                <User size={22} className="text-blue-500" />
              </div>
              <h3 className="text-base font-semibold text-gray-900">
                Save Changes?
              </h3>
              <p className="text-sm text-gray-400 mt-1">
                Are you sure you want to update your profile?
              </p>
            </div>

            {/* Summary of what's changing */}
            <div className="bg-gray-50 rounded-xl p-3 flex flex-col gap-1.5 text-xs text-gray-600">
              {pendingBody?.name && (
                <p>
                  • Name →{" "}
                  <span className="font-medium">{pendingBody.name}</span>
                </p>
              )}
              {pendingBody?.mobile && (
                <p>
                  • Mobile →{" "}
                  <span className="font-medium">{pendingBody.mobile}</span>
                </p>
              )}
              {pendingBody?.password && <p>• Password will be updated</p>}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirmPopup(false)}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmUpdate}
                className="flex-1 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                Yes, Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
