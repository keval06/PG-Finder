"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import { userApi } from "../../../lib/api/user";

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

export default function EditProfilePage() {
  const router = useRouter();
  const { user, ready, updateUser } = useAuth(); // ← ready flag

  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [confirmPassword, setConfirmPassword] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);

  const [loading, setLoading] = useState(false);

  const [message, setMessage] = useState(null); //*Object, Success OR error banner
  const [showConfirmPopup, setShowConfirmPopup] = useState(false);
  const [pendingBody, setPendingBody] = useState(null); //?Temporarily holds what changed — passed between handleSubmit and confirmUpdate

  //? Pre-filling the Form
  useEffect(() => {
    // wait until AuthContext has finished reading localStorage
    if (!ready) return; // ?← guard #1: wait for localStorage to load

    if (!user) {
      router.push("/auth/login"); //? ← guard #2: not logged in → redirect
      return;
    }

    setName(user.name || "");
    setMobile(String(user.mobile || "")); //? React input value must be a STRING: "9876543210"
  }, [ready, user]); // depends on both — fires once ready=true

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

    // ? <- Password field is optional here. If empty → don't change it
    if (password && password.length < 8) {
      // ?← only validate IF user typed something
      setMessage({
        type: "error",
        text: "Password must be at least 8 characters",
      });
      return;
    }

    if (password && !passwordsMatch) {
      setMessage({
        type: "error",
        text: "Passwords do not match",
      });
      return;
    }
    //? Token might have expired or been manually deleted from browser
    //  ?Always verify before making authenticated API calls
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
      setMessage({
        type: "error",
        text: "No changes made",
      });
      return;
    }

    setPendingBody(body);
    setShowConfirmPopup(true);
  };

  const confirmUpdate = async () => {
    setShowConfirmPopup(false);
    const token = localStorage.getItem("token");
    setLoading(true);

    try {
      // Direct API update
      const data = await userApi.update(user._id, pendingBody, token);

      if (data && data._id) {
        updateUser(data); // context + localStorage updated instantly
        setPassword("");
        setConfirmPassword("");
        setMessage({
          type: "success",
          text: "Profile updated successfully!",
        });
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
      // name and mobile stay filled with new values — intentional
    }
  };

  // Tailwind classes for inpiuts
  const iconClass = "absolute left-3 text-slate-400 pointer-events-none";
  const inputClass =
    "w-full bg-transparent pl-9 pr-10 py-2.5 text-sm outline-none placeholder:text-slate-400 text-slate-900";

  // show spinner while AuthContext is hydrating — prevents flash redirect
  if (!ready) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return null; // redirect already fired in useEffect

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8">
      <div className="max-w-sm mx-auto">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 mb-6 transition-colors"
        >
          <ArrowLeft size={16} /> Back
        </button>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 flex flex-col gap-5">
          {/* header */}
          <div className="text-center">
            <div className="bg-blue-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3 border border-blue-100">
              <User size={28} className="text-blue-600" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900">Edit Profile</h1>
            <p className="text-sm text-slate-400 mt-1">
              Update your account details
            </p>
          </div>

          {/* banner */}
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
            {/* Name   */}

            <div>
              <label className="text-xs font-medium text-slate-500 mb-1.5 block">
                Full Name
              </label>
              <div className="relative flex items-center border border-slate-200 rounded-xl bg-slate-50 focus-within:bg-white focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-50 transition-all">
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
              <label className="text-xs font-medium text-slate-500 mb-1.5 block">
                Mobile Number
              </label>
              <div className="relative flex items-center border border-slate-200 rounded-xl bg-slate-50 focus-within:bg-white focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-50 transition-all">
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

            {/* Password section */}
            <div className="border-t border-slate-100 pt-2">
              <p className="text-xs text-slate-400 mb-3">
                Leave password fields empty to keep current password
              </p>

              {/* New pAssword */}

              <div className="flex flex-col gap-1 mb-4">
                <label className="text-xs font-medium text-slate-500 mb-1.5 block">
                  New Password
                </label>
                <div className="relative flex items-center border border-slate-200 rounded-xl bg-slate-50 focus-within:bg-white focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-50 transition-all">
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
                    className="absolute right-3 text-slate-400 hover:text-slate-600 transition-colors"
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

              {/* Confirm New Password */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-slate-500 mb-1.5 block">
                  Confirm New Password
                </label>
                <div className="relative flex items-center border border-slate-200 rounded-xl bg-slate-50 focus-within:bg-white focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-50 transition-all">
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
                    className="absolute right-3 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {showMatchIndicator && (
                  <p
                    className={`text-xs px-1 flex items-center gap-1 ${
                      passwordsMatch ? "text-green-600" : "text-red-500"
                    }`}
                  >
                    {passwordsMatch ? (
                      <>
                        <CheckCircle2 size={13} /> Passwords match
                      </>
                    ) : (
                      <>
                        <XCircle size={13} /> Passwords do not match
                      </>
                    )}
                  </p>
                )}
              </div>
            </div>

            {/*  */}
            <button
              type="submit"
              disabled={
                loading ||
                passwordTooShort ||
                (showMatchIndicator && !passwordsMatch)
              }
              className="bg-blue-600 text-white py-2.5 rounded-xl font-semibold text-sm hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-1"
            >
              {loading ? "Saving…" : "Save Changes"}
            </button>
          </form>
        </div>
      </div>

      {/* CONFIRM POPUP */}
      {showConfirmPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setShowConfirmPopup(false)}
          />

          {/* POPUP CARD */}
          <div className="relative bg-white rounded-2xl shadow-2xl p-6 w-full max-w-xs flex flex-col gap-4 z-10 border border-slate-100">
            {/* Message */}
            <div className="text-center">
              <div className="bg-blue-50 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 border border-blue-100">
                <User size={26} className="text-blue-600" />
              </div>
              <h3 className="text-base font-bold text-slate-900">
                Save Changes?
              </h3>
              <p className="text-sm text-slate-400 mt-1">
                Are you sure you want to update your profile?
              </p>
            </div>

            {/* Show what will change */}
            <div className="bg-slate-50 rounded-xl p-3 flex flex-col gap-1.5 text-xs text-slate-600 border border-slate-100">
              {/* Show name if updated */}
              {pendingBody?.name && (
                <p>
                  • Name →{" "}
                  <span className="font-semibold text-slate-900">
                    {pendingBody.name}
                  </span>
                </p>
              )}

              {/* Show mobile if updated */}
              {pendingBody?.mobile && (
                <p>
                  • Mobile →{" "}
                  <span className="font-semibold text-slate-900">
                    {pendingBody.mobile}
                  </span>
                </p>
              )}

              {pendingBody?.password && <p>• Password will be updated</p>}
            </div>

            <div className="flex gap-3">
              {/* Cancel */}
              <button
                onClick={() => setShowConfirmPopup(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>

              {/* Apply Button */}
              <button
                onClick={confirmUpdate}
                className="flex-1 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors"
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
