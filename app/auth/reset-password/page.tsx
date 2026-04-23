"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";

function validateEmail(email: string): string {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email) return "Email is required";
  if (!emailRegex.test(email)) return "Please enter a valid email address";
  return "";
}

function validatePassword(password: string): string {
  if (!password) return "Password is required";
  if (password.length < 8) return "Password must be at least 8 characters long";
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  if (!hasUppercase)
    return "Password must contain at least one uppercase letter";
  if (!hasLowercase)
    return "Password must contain at least one lowercase letter";
  if (!hasNumber) return "Password must contain at least one number";
  if (!hasSpecialChar)
    return "Password must contain at least one special character";

  return "";
}

function validateOtp(otp: string): string {
  if (!otp) return "OTP is required";
  if (!/^\d{6}$/.test(otp)) return "Enter a valid 6-digit OTP";
  return "";
}

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState({
    email: "",
    otp: "",
    password: "",
    confirmPassword: "",
  });
  const [otpSent, setOtpSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    const initialEmail = searchParams.get("email");
    if (initialEmail) setEmail(initialEmail);
  }, [searchParams]);

  const validateForm = (step: "request" | "reset") => {
    const newErrors = {
      email: validateEmail(email),
      otp: "",
      password: "",
      confirmPassword: "",
    };

    if (step === "reset") {
      newErrors.otp = validateOtp(otp);
      newErrors.password = validatePassword(password);
      if (!confirmPassword) {
        newErrors.confirmPassword = "Please confirm your password";
      } else if (password !== confirmPassword) {
        newErrors.confirmPassword = "Passwords do not match";
      }
    }

    setErrors(newErrors);
    return !Object.values(newErrors).some((value) => value !== "");
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm("request")) {
      toast.error("Please provide a valid email address.");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to send OTP");
      }

      toast.success(data.message || "OTP sent to your email.");
      setOtpSent(true);
    } catch (error) {
      console.error("Send OTP error:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to send OTP",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm("reset")) {
      toast.error("Please fix the errors and try again.");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp, password }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to reset password");
      }

      toast.success(data.message || "Password reset successfully.");
      setEmail("");
      setOtp("");
      setPassword("");
      setConfirmPassword("");
      setOtpSent(false);
      setErrors({ email: "", otp: "", password: "", confirmPassword: "" });
    } catch (error) {
      console.error("Reset password error:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to reset password",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[url('/greenBG.jpg')] bg-cover relative">
      <div className="absolute inset-0 bg-black/30"></div>
      <div className="relative w-full max-w-2xl bg-base-100 shadow-2xl rounded-xl overflow-hidden z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2">
          <div className="hidden lg:flex flex-col justify-center items-center p-10 bg-[#90AC19] text-white">
            <h2 className="text-3xl font-bold mb-4">Reset your password</h2>
            <p className="text-sm text-white/90 max-w-md">
              Enter your email to receive a secure OTP. Then use the code to set
              a new password.
            </p>
          </div>
          <div className="p-8">
            <div className="mb-6 text-center lg:text-left">
              <h1 className="text-3xl font-bold text-[#90AC19] mb-2">
                Reset Password
              </h1>
              <p className="text-sm text-base-content/70">
                {otpSent
                  ? "Enter the OTP from your email and choose a new password."
                  : "Start by requesting an OTP code to your account email."}
              </p>
            </div>

            <form
              onSubmit={otpSent ? handleResetPassword : handleSendOtp}
              className="space-y-4"
            >
              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text text-gray-800 font-medium">
                    Email
                  </span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`input input-bordered w-full ${errors.email ? "input-error" : ""}`}
                  placeholder="Enter your email"
                  required
                />
                {errors.email && (
                  <label className="label">
                    <span className="label-text-alt text-error">
                      {errors.email}
                    </span>
                  </label>
                )}
              </div>

              {otpSent && (
                <>
                  <div className="form-control w-full">
                    <label className="label">
                      <span className="label-text text-gray-800 font-medium">
                        OTP Code
                      </span>
                    </label>
                    <input
                      type="text"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      className={`input input-bordered w-full ${errors.otp ? "input-error" : ""}`}
                      placeholder="Enter the 6-digit OTP"
                      maxLength={6}
                      required
                    />
                    {errors.otp && (
                      <label className="label">
                        <span className="label-text-alt text-error">
                          {errors.otp}
                        </span>
                      </label>
                    )}
                  </div>

                  <div className="form-control w-full">
                    <label className="label">
                      <span className="label-text text-gray-800 font-medium">
                        New Password
                      </span>
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className={`input input-bordered w-full pr-10 ${errors.password ? "input-error" : ""}`}
                        placeholder="Enter new password"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? (
                          <EyeSlashIcon className="h-5 w-5" />
                        ) : (
                          <EyeIcon className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                    {errors.password && (
                      <label className="label">
                        <span className="label-text-alt text-error">
                          {errors.password}
                        </span>
                      </label>
                    )}
                  </div>

                  <div className="form-control w-full">
                    <label className="label">
                      <span className="label-text text-gray-800 font-medium">
                        Confirm Password
                      </span>
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className={`input input-bordered w-full pr-10 ${errors.confirmPassword ? "input-error" : ""}`}
                        placeholder="Confirm new password"
                        required
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                      >
                        {showConfirmPassword ? (
                          <EyeSlashIcon className="h-5 w-5" />
                        ) : (
                          <EyeIcon className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                    {errors.confirmPassword && (
                      <label className="label">
                        <span className="label-text-alt text-error">
                          {errors.confirmPassword}
                        </span>
                      </label>
                    )}
                  </div>
                </>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="btn bg-[#90AC19] hover:bg-[#7A9216] text-white w-full transition-colors duration-300"
              >
                {isLoading ? (
                  <span className="loading loading-spinner loading-sm"></span>
                ) : otpSent ? (
                  "Reset Password"
                ) : (
                  "Send OTP"
                )}
              </button>
            </form>

            <div className="mt-6 text-center space-y-2">
              <p className="text-sm text-base-content/70">
                Remembered your password?
              </p>
              <Link
                href="/auth/signin"
                className="link text-[#90AC19] hover:text-[#7A9216] text-sm"
              >
                Return to sign in
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
