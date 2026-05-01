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
import Button from "../../atoms/Button";
import ConfirmModal from "../../../components/ConfirmModal";
import Link from "next/link";

export default function EditProfilePage() {
  const router = useRouter();
  const { user, ready, updateUser } = useAuth(); // ← ready flag

  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);

  const [confirmPassword, setConfirmPassword] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);

  const [loading, setLoading] = useState(false);

  const [message, setMessage] = useState(null); //*Object, Success OR error banner
  const [showConfirmPopup, setShowConfirmPopup] = useState(false);
  const [pendingBody, setPendingBody] = useState(null); //?Temporarily holds what changed — passed between handleSubmit and confirmUpdate

  const passwordRegex = /^(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,16}$/;

  //? Pre-filling the Form
  useEffect(() => {
    // wait until AuthContext has finished reading localStorage
    if (!ready) return; // ?← guard #1: wait for localStorage to load

    if (!user) {
      router.replace("/auth/login"); //? ← guard #2: not logged in → replace history
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
    if (password && !passwordRegex.test(password)) {
      setMessage({
        type: "error",
        text: "New password must be 8-16 characters with a digit and special character.",
      });
      return;
    }

    // add after the passwordsMatch check
    if (password && !currentPassword) {
      setMessage({
        type: "error",
        text: "Please enter your current password to set a new one.",
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
    // new
    if (password) {
      body.newPassword = password;
      body.currentPassword = currentPassword;
    }

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
        setCurrentPassword("");
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
    } catch (error) {
      setMessage({
        type: "error",
        text: error.message || "Something went wrong. Please try again.",
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
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-rose-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return null; // redirect already fired in useEffect

  return (
    <div className="bg-white px-4 py-10 pb-20">
      <div className="max-w-sm mx-auto">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 mb-6 transition-colors"
        >
          <ArrowLeft size={16} /> Back
        </button>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-10 flex flex-col gap-6">
          {/* header */}
          <div className="text-center">
            <div className="bg-rose-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-5 border border-rose-100">
              <User size={30} className="text-rose-500" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-[#222222]">
              Edit Profile
            </h1>
            <p className="text-base text-[#717171] mt-1.5">
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

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {/* Name   */}

            <div>
              <label className="text-xs font-medium text-slate-500 mb-1.5 block">
                Full Name
              </label>
              <div className="relative flex items-center border border-slate-200 rounded-xl bg-slate-50 focus-within:bg-white focus-within:border-rose-400 focus-within:ring-2 focus-within:ring-rose-50 transition-all">
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
              <div className="relative flex items-center border border-slate-200 rounded-xl bg-slate-50 focus-within:bg-white focus-within:border-rose-400 focus-within:ring-2 focus-within:ring-rose-50 transition-all">
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

              <div className="flex flex-col gap-1 mb-4">
                <label className="text-xs font-medium text-slate-500 mb-1.5 block">
                  Current Password
                </label>
                
                <div className="relative flex items-center border border-slate-200 rounded-xl bg-slate-50 focus-within:bg-white focus-within:border-rose-400 focus-within:ring-2 focus-within:ring-rose-50 transition-all">
                  <Lock size={15} className={iconClass} />
                  <input
                    type={showCurrentPassword ? "text" : "password"}
                    placeholder="Enter current password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className={inputClass}
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showCurrentPassword ? (
                      <EyeOff size={16} />
                    ) : (
                      <Eye size={16} />
                    )}
                  </button>
                </div>
                <Link
                  href="/auth/forgot-password"
                  className="text-xs text-rose-500 hover:text-rose-600 mt-1 px-1 self-end"
                >
                  Forgot password?
                </Link>
              </div>

              {/* New pAssword */}

              <div className="flex flex-col gap-1 mb-4">
                <label className="text-xs font-medium text-slate-500 mb-1.5 block">
                  New Password
                </label>
                <div className="relative flex items-center border border-slate-200 rounded-xl bg-slate-50 focus-within:bg-white focus-within:border-rose-400 focus-within:ring-2 focus-within:ring-rose-50 transition-all">
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
                <div className="relative flex items-center border border-slate-200 rounded-xl bg-slate-50 focus-within:bg-white focus-within:border-rose-400 focus-within:ring-2 focus-within:ring-rose-50 transition-all">
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

            <Button
              type="submit"
              loading={loading}
              disabled={
                passwordTooShort || (showMatchIndicator && !passwordsMatch)
              }
              className="mt-1"
              size="lg"
            >
              Save Changes
            </Button>
          </form>
        </div>
      </div>

      <ConfirmModal
        isOpen={showConfirmPopup}
        onClose={() => setShowConfirmPopup(false)}
        onConfirm={confirmUpdate}
        title="Save Changes?"
        description="Are you sure you want to update your profile?"
        confirmText="Yes, Save"
        variant="primary"
        processing={loading}
      >
        <div className="bg-slate-50 rounded-xl p-3 flex flex-col gap-1.5 text-xs text-slate-600 border border-slate-100 mt-2">
          {pendingBody?.name && (
            <p>
              • Name →{" "}
              <span className="font-semibold text-slate-900">
                {pendingBody.name}
              </span>
            </p>
          )}

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
      </ConfirmModal>
    </div>
  );
}
