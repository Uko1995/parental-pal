"use client";

import { signIn, getProviders } from "next-auth/react";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import Image from "next/image";
import { motion } from "framer-motion";

interface Provider {
  id: string;
  name: string;
  type: string;
  signinUrl?: string;
  callbackUrl?: string;
}

type ProvidersType = Record<string, Provider> | null;

function SignInContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [providers, setProviders] = useState<ProvidersType>(null);
  const [credentialsLoading, setCredentialsLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [validationErrors, setValidationErrors] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [isFormValid, setIsFormValid] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  const redirectTo = searchParams.get("callbackUrl");
  const error = searchParams.get("error");

  useEffect(() => {
    // Scroll to top when page loads
    window.scrollTo({ top: 0, behavior: "smooth" });

    const loadProviders = async () => {
      try {
        const providers = await getProviders();
        setProviders(providers);
      } catch (err) {
        console.error("Failed to load providers:", err);
        toast.error("Failed to load login providers");
      }
    };
    loadProviders();

    // Show toast for login errors from callback
    if (error) {
      toast.error(getErrorMessage(error));
    }
    // Show toast for successful login if redirected back
    if (searchParams.get("success")) {
      toast.success("Signed in successfully!");
    }
  }, [error, searchParams]);

  // Validation functions
  const validateEmail = (email: string): string => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) return "Email is required";
    if (!emailRegex.test(email)) return "Please enter a valid email address";
    return "";
  };

  const validatePassword = (password: string): string => {
    if (!password) return "Password is required";
    if (password.length < 8)
      return "Password must be at least 8 characters long";

    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    // Calculate password strength for progress bar
    let strength = 0;
    if (password.length >= 8) strength++;
    if (hasUppercase) strength++;
    if (hasLowercase) strength++;
    if (hasNumber) strength++;
    if (hasSpecialChar) strength++;

    setPasswordStrength(strength);

    if (!hasUppercase)
      return "Password must contain at least one uppercase letter";
    if (!hasLowercase)
      return "Password must contain at least one lowercase letter";
    if (!hasNumber) return "Password must contain at least one number";
    if (!hasSpecialChar)
      return "Password must contain at least one special character";

    return "";
  };

  const validateName = (name: string): string => {
    if (!name) return "Name is required";
    if (name.trim().length < 2)
      return "Name must be at least 2 characters long";
    return "";
  };

  const validateConfirmPassword = (
    password: string,
    confirmPassword: string
  ): string => {
    if (!confirmPassword) return "Please confirm your password";
    if (password !== confirmPassword) return "Passwords do not match";
    return "";
  };

  const validateForm = (data: typeof formData, isRegister: boolean) => {
    const errors = {
      name: isRegister ? validateName(data.name) : "",
      email: validateEmail(data.email),
      password: validatePassword(data.password),
      confirmPassword: isRegister
        ? validateConfirmPassword(data.password, data.confirmPassword)
        : "",
    };

    setValidationErrors(errors);

    const hasErrors = Object.values(errors).some((error) => error !== "");
    setIsFormValid(!hasErrors);

    return !hasErrors;
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    toast.promise(
      signIn("google", {
        redirectTo: redirectTo || "/",
        redirect: true,
      }),
      {
        loading: "Redirecting to Google...",
        success: "Redirect successfull!",
        error: "Google sign-in failed. Please try again.",
      }
    );
    setGoogleLoading(false);
  };

  const handleCredentialsSignIn = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    if (!validateForm(formData, false)) {
      toast.error("Please fix the errors below");
      return;
    }

    setCredentialsLoading(true);
    try {
      const result = await signIn("credentials", {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });

      if (result?.error) {
        toast.error("Invalid credentials. Please try again.");
      } else if (result?.ok) {
        toast.success("Signed in successfully!");
        router.push(redirectTo || "/");
      }
    } catch (error) {
      console.error("Sign in error:", error);
      toast.error("An error occurred during sign in");
    } finally {
      setCredentialsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    if (!validateForm(formData, true)) {
      toast.error("Please fix the errors below");
      return;
    }

    setCredentialsLoading(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Account created successfully! Please sign in.");
        setIsRegisterMode(false);
        setFormData({
          name: "",
          email: formData.email,
          password: "",
          confirmPassword: "",
        });
      } else {
        toast.error(data.error || "Registration failed");
      }
    } catch (error) {
      console.error("Registration error:", error);
      toast.error("An error occurred during registration");
    } finally {
      setCredentialsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const newFormData = {
      ...formData,
      [name]: value,
    };

    setFormData(newFormData);

    // Real-time validation for the current field
    let error = "";
    switch (name) {
      case "name":
        error = validateName(value);
        break;
      case "email":
        error = validateEmail(value);
        break;
      case "password":
        error = validatePassword(value);
        // Also validate confirm password if it exists
        if (formData.confirmPassword && isRegisterMode) {
          const confirmError = validateConfirmPassword(
            value,
            formData.confirmPassword
          );
          setValidationErrors((prev) => ({
            ...prev,
            confirmPassword: confirmError,
          }));
        }
        break;
      case "confirmPassword":
        error = validateConfirmPassword(formData.password, value);
        break;
    }

    setValidationErrors((prev) => ({
      ...prev,
      [name]: error,
    }));

    // Update form validity
    const newErrors = {
      ...validationErrors,
      [name]: error,
    };
    const hasErrors = Object.values(newErrors).some((err) => err !== "");
    setIsFormValid(!hasErrors);
  };

  const getErrorMessage = (error: string) => {
    switch (error) {
      case "OAuthSignin":
        return "Error in constructing an authorization URL.";
      case "OAuthCallback":
        return "Error in handling the response from an OAuth provider.";
      case "OAuthCreateAccount":
        return "Could not create OAuth account in the database.";
      case "EmailCreateAccount":
        return "Could not create email account in the database.";
      case "Callback":
        return "Error in the OAuth callback handler route.";
      case "OAuthAccountNotLinked":
        return "The email on the account is already linked, but not with this OAuth account.";
      case "EmailSignin":
        return "Sending the e-mail with the verification token failed.";
      case "CredentialsSignin":
        return "The authorize callback returned null in the Credentials provider.";
      case "SessionRequired":
        return "The content of this page requires you to be signed in at all times.";
      default:
        return "An error occurred during authentication.";
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center md:gap-20 p-4 bg-[url('/greenBG.jpg')] object-cover relative ">
      <div className="absolute inset-0 bg-black/30 "></div>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="hidden md:block h-auto bg-white rounded-md z-10  w-1/4"
      >
        <motion.div whileHover={{ scale: 1.05 }} transition={{ duration: 0.3 }}>
          <Image
            src="/parentalpalLOGO.webp"
            alt="Logo"
            width={200}
            height={200}
            className="size-full"
          />
        </motion.div>
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="card w-full max-w-lg shadow-2xl bg-base-100"
      >
        <div className="card-body">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="text-center mb-6"
          >
            <h1 className="text-3xl font-bold text-[#90AC19] mb-2">
              {isRegisterMode ? "Create Account" : "Welcome Back"}
            </h1>
            <p className="text-base-content/70">
              {isRegisterMode
                ? "Join ParentalPal and access amazing childcare services"
                : "Sign in to your ParentalPal account"}
            </p>
          </motion.div>

          {/* Error Message */}
          {error && (
            <div className="alert alert-error mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="stroke-current shrink-0 h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span className="text-sm">{getErrorMessage(error)}</span>
            </div>
          )}

          {/* Email/Password Form - Primary Option */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="space-y-4"
          >
            <form
              onSubmit={
                isRegisterMode ? handleRegister : handleCredentialsSignIn
              }
              className="space-y-4"
            >
              {isRegisterMode && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.5 }}
                  className="form-control w-full"
                >
                  <label className="label">
                    <span className="label-text text-gray-800 font-medium">
                      Full Name
                    </span>
                  </label>
                  <motion.input
                    whileFocus={{ scale: 1.02 }}
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className={`input input-bordered w-full transition-shadow duration-300 focus:shadow-lg ${
                      validationErrors.name ? "input-error" : ""
                    }`}
                    placeholder="Enter your full name"
                    required
                  />
                  {validationErrors.name && (
                    <motion.label
                      initial={{ x: -10 }}
                      animate={{ x: [0, -10, 10, -10, 10, 0] }}
                      transition={{ duration: 0.5 }}
                      className="label"
                    >
                      <span className="label-text-alt text-error">
                        {validationErrors.name}
                      </span>
                    </motion.label>
                  )}
                </motion.div>
              )}

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.6 }}
                className="form-control w-full"
              >
                <label className="label">
                  <span className="label-text text-gray-800 font-medium">
                    Email
                  </span>
                </label>
                <motion.input
                  whileFocus={{ scale: 1.02 }}
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`input input-bordered w-full transition-shadow duration-300 focus:shadow-lg ${
                    validationErrors.email ? "input-error" : ""
                  }`}
                  placeholder="Enter your email"
                  required
                />
                {validationErrors.email && (
                  <motion.label
                    initial={{ x: -10 }}
                    animate={{ x: [0, -10, 10, -10, 10, 0] }}
                    transition={{ duration: 0.5 }}
                    className="label"
                  >
                    <span className="label-text-alt text-error">
                      {validationErrors.email}
                    </span>
                  </motion.label>
                )}
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.7 }}
                className="form-control w-full"
              >
                <label className="label">
                  <span className="label-text text-gray-800 font-medium">
                    Password
                  </span>
                </label>
                <motion.input
                  whileFocus={{ scale: 1.02 }}
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className={`input input-bordered w-full transition-shadow duration-300 focus:shadow-lg ${
                    validationErrors.password ? "input-error" : ""
                  }`}
                  placeholder="Enter your password"
                  required
                />
                {/* Password strength indicator */}
                {isRegisterMode && formData.password && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="mt-2 mb-1"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs text-gray-600">
                        Password strength:
                      </span>
                      <div className="flex gap-1 flex-1 max-w-20">
                        {[1, 2, 3, 4, 5].map((level) => (
                          <div
                            key={level}
                            className={`h-1 flex-1 rounded-full transition-all duration-500 ${
                              level <= passwordStrength
                                ? passwordStrength <= 2
                                  ? "bg-red-400"
                                  : passwordStrength <= 3
                                  ? "bg-yellow-400"
                                  : passwordStrength <= 4
                                  ? "bg-blue-400"
                                  : "bg-green-400"
                                : "bg-gray-200"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-xs font-medium">
                        {passwordStrength <= 2
                          ? "Weak"
                          : passwordStrength <= 3
                          ? "Fair"
                          : passwordStrength <= 4
                          ? "Good"
                          : "Strong"}
                      </span>
                    </div>
                  </motion.div>
                )}

                {validationErrors.password && (
                  <motion.label
                    initial={{ x: -10 }}
                    animate={{ x: [0, -10, 10, -10, 10, 0] }}
                    transition={{ duration: 0.5 }}
                    className="label"
                  >
                    <span className="label-text-alt text-error text-xs">
                      {validationErrors.password}
                    </span>
                  </motion.label>
                )}

                {/* Password requirements hint */}
                <label className="label">
                  <span className="label-text-alt text-xs text-gray-500">
                    must have uppercase, lowercase, number & special character
                  </span>
                </label>
              </motion.div>

              {isRegisterMode && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.8 }}
                  className="form-control w-full"
                >
                  <label className="label">
                    <span className="label-text text-gray-800 font-medium">
                      Confirm Password
                    </span>
                  </label>
                  <motion.input
                    whileFocus={{ scale: 1.02 }}
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className={`input input-bordered w-full transition-shadow duration-300 focus:shadow-lg ${
                      validationErrors.confirmPassword ? "input-error" : ""
                    }`}
                    placeholder="Confirm your password"
                    required
                  />
                  {validationErrors.confirmPassword && (
                    <motion.label
                      initial={{ x: -10 }}
                      animate={{ x: [0, -10, 10, -10, 10, 0] }}
                      transition={{ duration: 0.5 }}
                      className="label"
                    >
                      <span className="label-text-alt text-error">
                        {validationErrors.confirmPassword}
                      </span>
                    </motion.label>
                  )}
                </motion.div>
              )}

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={
                  credentialsLoading ||
                  (!isFormValid &&
                    (isRegisterMode || !!formData.email || !!formData.password))
                }
                className={`btn bg-[#90AC19] hover:bg-[#7A9216] text-white w-full transition-colors duration-300 ${
                  !isFormValid &&
                  (isRegisterMode || !!formData.email || !!formData.password)
                    ? "btn-disabled"
                    : ""
                }`}
              >
                {credentialsLoading ? (
                  <span className="loading loading-spinner loading-sm"></span>
                ) : isRegisterMode ? (
                  "Create Account"
                ) : (
                  "Sign In"
                )}
              </motion.button>
            </form>

            {/* Toggle between signin/register */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.9 }}
              className="text-center"
            >
              <button
                onClick={() => setIsRegisterMode(!isRegisterMode)}
                className="link text-[#90AC19] hover:text-[#7A9216] text-sm transition-colors duration-300"
              >
                {isRegisterMode
                  ? "Already have an account? Sign in"
                  : "Don't have an account? Create one"}
              </button>
            </motion.div>

            {/* Divider */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 1 }}
              className="divider text-base-content/50 my-6"
            >
              or continue with
            </motion.div>

            {/* Google Sign In - Alternative Option */}
            {providers?.google && (
              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 1.1 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleGoogleSignIn}
                disabled={googleLoading}
                className="btn btn-outline w-full gap-3 hover:btn-neutral transition-colors duration-300"
              >
                {googleLoading ? (
                  <span className="loading loading-spinner loading-sm"></span>
                ) : (
                  <svg
                    className="w-5 h-5"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    {/* Blue segment */}
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />

                    {/* Green segment */}
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />

                    {/* Yellow segment */}
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />

                    {/* Red segment */}
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                )}
                Google
              </motion.button>
            )}
          </motion.div>

          {/* Footer */}
          <div className="text-center mt-6 space-y-2">
            <Link href="/" className="link text-[#90AC19] text-sm">
              Back to Home
            </Link>
          </div>

          {/* Terms */}
          <div className="text-center mt-4">
            <p className="text-xs text-base-content/50">
              By signing in, you agree to our{" "}
              <Link href="/terms" className="link text-[#90AC19]">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link href="/privacy" className="link text-[#90AC19]">
                Privacy Policy
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default function SignIn() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="loading loading-spinner loading-lg"></div>
        </div>
      }
    >
      <SignInContent />
    </Suspense>
  );
}
