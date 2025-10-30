"use client";

import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function AuthError() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const errorParam = searchParams.get("error");
    setError(errorParam);
  }, [searchParams]);

  const getErrorDetails = (error: string | null) => {
    switch (error) {
      case "Configuration":
        return {
          title: "Server Configuration Error",
          message: "There is a problem with the server configuration.",
          suggestion: "Please contact support if this error persists.",
          icon: "⚙️",
        };
      case "AccessDenied":
        return {
          title: "Access Denied",
          message: "You do not have permission to access this resource.",
          suggestion:
            "Please contact an administrator for access or sign in with proper credentials.",
          icon: "🚫",
        };
      case "AccountDisabled":
        return {
          title: "Account Disabled",
          message: "Your account has been disabled by an administrator.",
          suggestion: "Please contact support to reactivate your account.",
          icon: "🔒",
        };
      case "Verification":
        return {
          title: "Verification Error",
          message: "The verification token has expired or is invalid.",
          suggestion: "Please try signing in again.",
          icon: "⏰",
        };
      case "Default":
        return {
          title: "Authentication Error",
          message: "An error occurred during authentication.",
          suggestion: "Please try again or contact support.",
          icon: "⚠️",
        };
      case "OAuthSignin":
        return {
          title: "OAuth Sign-in Error",
          message: "Error in constructing an authorization URL.",
          suggestion: "Please try signing in again.",
          icon: "🔗",
        };
      case "OAuthCallback":
        return {
          title: "OAuth Callback Error",
          message: "Error in handling the response from the OAuth provider.",
          suggestion: "Please try signing in again.",
          icon: "🔄",
        };
      case "OAuthCreateAccount":
        return {
          title: "Account Creation Error",
          message: "Could not create OAuth account in the database.",
          suggestion: "Please contact support for assistance.",
          icon: "👤",
        };
      case "EmailCreateAccount":
        return {
          title: "Email Account Error",
          message: "Could not create email account in the database.",
          suggestion: "Please contact support for assistance.",
          icon: "📧",
        };
      case "Callback":
        return {
          title: "Callback Error",
          message: "Error in the OAuth callback handler route.",
          suggestion: "Please try signing in again.",
          icon: "🔄",
        };
      case "OAuthAccountNotLinked":
        return {
          title: "Account Not Linked",
          message:
            "The email on the account is already linked, but not with this OAuth account.",
          suggestion:
            "Please try signing in with a different method or contact support.",
          icon: "🔗",
        };
      case "EmailSignin":
        return {
          title: "Email Sign-in Error",
          message: "Sending the email with the verification token failed.",
          suggestion: "Please check your email address and try again.",
          icon: "📧",
        };
      case "CredentialsSignin":
        return {
          title: "Credentials Error",
          message: "The provided credentials are invalid.",
          suggestion: "Please check your credentials and try again.",
          icon: "🔐",
        };
      case "SessionRequired":
        return {
          title: "Session Required",
          message: "You must be signed in to view this content.",
          suggestion: "Please sign in and try again.",
          icon: "🔒",
        };
      default:
        return {
          title: "Unknown Error",
          message: "An unexpected error occurred during authentication.",
          suggestion:
            "Please try again or contact support if the problem persists.",
          icon: "❓",
        };
    }
  };

  const errorDetails = getErrorDetails(error);

  const handleRetry = () => {
    router.push("/auth/signin");
  };

  const handleGoHome = () => {
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-error/10 to-warning/10 flex items-center justify-center p-4">
      <div className="card w-full max-w-md bg-base-100 shadow-xl">
        <div className="card-body text-center">
          {/* Error Icon */}
          <div className="text-6xl mb-4">{errorDetails.icon}</div>

          {/* Error Title */}
          <h1 className="text-2xl font-bold text-error mb-2">
            {errorDetails.title}
          </h1>

          {/* Error Message */}
          <p className="text-base-content/70 mb-4">{errorDetails.message}</p>

          {/* Suggestion */}
          <div className="alert alert-info mb-6">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              className="stroke-current shrink-0 w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              ></path>
            </svg>
            <div>
              <div className="text-sm">{errorDetails.suggestion}</div>
            </div>
          </div>

          {/* Error Code */}
          {error && (
            <div className="text-xs text-base-content/50 mb-6 p-2 bg-base-200 rounded">
              Error Code: {error}
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-3">
            <button onClick={handleRetry} className="btn btn-primary w-full">
              Try Signing In Again
            </button>

            <button onClick={handleGoHome} className="btn btn-ghost w-full">
              Go Back to Home
            </button>
          </div>

          {/* Support Link */}
          <div className="mt-6 pt-4 border-t border-base-300">
            <p className="text-sm text-base-content/70 mb-2">
              Still having trouble?
            </p>
            <Link href="/contact" className="link link-primary text-sm">
              Contact Support
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
