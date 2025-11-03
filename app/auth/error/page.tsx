"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useEffect, useState, Suspense } from "react";
import {
  ArrowPathIcon,
  BellIcon,
  Cog6ToothIcon,
  ExclamationCircleIcon,
  ExclamationTriangleIcon,
  LinkIcon,
  LockClosedIcon,
  QuestionMarkCircleIcon,
  UserIcon,
} from "@heroicons/react/24/outline";
import { EnvelopeIcon } from "@heroicons/react/24/outline";

function AuthErrorContent() {
  const searchParams = useSearchParams();
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
          icon: Cog6ToothIcon,
        };
      case "AccessDenied":
        return {
          title: "Access Denied",
          message: "You do not have permission to access this resource.",
          suggestion:
            "Please contact an administrator for access or sign in with proper credentials.",
          icon: ExclamationCircleIcon,
        };
      case "AccountDisabled":
        return {
          title: "Account Disabled",
          message: "Your account has been disabled by an administrator.",
          suggestion: "Please contact support to reactivate your account.",
          icon: LockClosedIcon,
        };
      case "Verification":
        return {
          title: "Verification Error",
          message: "The verification token has expired or is invalid.",
          suggestion: "Please try signing in again.",
          icon: BellIcon,
        };
      case "Default":
        return {
          title: "Authentication Error",
          message: "An error occurred during authentication.",
          suggestion: "Please try again or contact support.",
          icon: ExclamationTriangleIcon,
        };
      case "OAuthSignin":
        return {
          title: "OAuth Sign-in Error",
          message: "Error in constructing an authorization URL.",
          suggestion: "Please try signing in again.",
          icon: LinkIcon,
        };
      case "OAuthCallback":
        return {
          title: "OAuth Callback Error",
          message: "Error in handling the response from the OAuth provider.",
          suggestion: "Please try signing in again.",
          icon: ArrowPathIcon,
        };
      case "OAuthCreateAccount":
        return {
          title: "Account Creation Error",
          message: "Could not create OAuth account in the database.",
          suggestion: "Please contact support for assistance.",
          icon: UserIcon,
        };
      case "EmailCreateAccount":
        return {
          title: "Email Account Error",
          message: "Could not create email account in the database.",
          suggestion: "Please contact support for assistance.",
          icon: EnvelopeIcon,
        };
      case "Callback":
        return {
          title: "Callback Error",
          message: "Error in the OAuth callback handler route.",
          suggestion: "Please try signing in again.",
          icon: ArrowPathIcon,
        };
      case "OAuthAccountNotLinked":
        return {
          title: "Account Not Linked",
          message:
            "The email on the account is already linked, but not with this OAuth account.",
          suggestion:
            "Please try signing in with a different method or contact support.",
          icon: LinkIcon,
        };
      case "EmailSignin":
        return {
          title: "Email Sign-in Error",
          message: "Sending the email with the verification token failed.",
          suggestion: "Please check your email address and try again.",
          icon: EnvelopeIcon,
        };
      case "CredentialsSignin":
        return {
          title: "Credentials Error",
          message: "The provided credentials are invalid.",
          suggestion: "Please check your credentials and try again.",
          icon: LockClosedIcon,
        };
      case "SessionRequired":
        return {
          title: "Session Required",
          message: "You must be signed in to view this content.",
          suggestion: "Please sign in and try again.",
          icon: LockClosedIcon,
        };
      default:
        return {
          title: "Unknown Error",
          message: "An unexpected error occurred during authentication.",
          suggestion:
            "Please try again or contact support if the problem persists.",
          icon: QuestionMarkCircleIcon,
        };
    }
  };

  const errorDetails = getErrorDetails(error);

  const handleRetry = () => {
    // Force a full page refresh to clear any cached content
    window.location.href = "/auth/signin";
  };

  return (
    <div className="h-screen flex items-center justify-center p-4">
      <div className="card w-full max-w-xl bg-base-100 shadow-xl">
        <div className="card-body text-center">
          {/* Error Icon */}
          <div className="text-6xl mb-4">
            {typeof errorDetails.icon === "string" ? (
              errorDetails.icon
            ) : (
              <errorDetails.icon className="w-16 h-16 mx-auto text-error" />
            )}
          </div>

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
            {/* Primary option: Link with refresh */}
            <Link href="/auth/signin" className="btn btn-[#90AC19] w-full">
              Try Signing In Again
            </Link>

            {/* Alternative: Button with forced refresh for stubborn cache */}
            <button
              onClick={handleRetry}
              className="btn btn-[#90AC19] btn-outline w-full"
            >
              Force Refresh Sign In
            </button>

            <Link href="/" className="btn btn-outline w-full">
              Go Back to Home
            </Link>
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

export default function AuthError() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="loading loading-spinner loading-lg"></div>
        </div>
      }
    >
      <AuthErrorContent />
    </Suspense>
  );
}
