"use client";

import { signIn, getProviders } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";

interface Provider {
  id: string;
  name: string;
  type: string;
  signinUrl?: string;
  callbackUrl?: string;
}

type ProvidersType = Record<string, Provider> | null;

export default function SignIn() {
  const searchParams = useSearchParams();
  const [providers, setProviders] = useState<ProvidersType>(null);
  const [loading, setLoading] = useState(false);

  const callbackUrl = searchParams.get("callbackUrl") || "/";
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

  const handleGoogleSignIn = async () => {
    setLoading(true);
    toast.promise(
      signIn("google", {
        callbackUrl,
        redirect: true,
      }),
      {
        loading: "Redirecting to Google...",
        success: "Google sign-in successful!",
        error: "Google sign-in failed. Please try again.",
      }
    );
    setLoading(false);
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
    <div className="min-h-screen bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center p-4">
      <div className="card w-full max-w-md bg-base-100 shadow-xl">
        <div className="card-body">
          {/* Header */}
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-primary mb-2">
              Welcome Back
            </h1>
            <p className="text-base-content/70">
              Sign in to your ParentalPal account
            </p>
          </div>

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

          {/* Sign In Options */}
          <div className="space-y-4">
            {providers?.google && (
              <button
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="btn btn-outline w-full gap-3 hover:bg-red-50 hover:border-red-300"
              >
                {loading ? (
                  <span className="loading loading-spinner loading-sm"></span>
                ) : (
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                )}
                Continue with Google
              </button>
            )}

            {/* Divider */}
            <div className="divider text-base-content/50">or</div>

            {/* Coming Soon Options */}
            <div className="space-y-2">
              <button
                disabled
                className="btn btn-ghost w-full opacity-50 cursor-not-allowed"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
                Continue with Email (Coming Soon)
              </button>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center mt-6 space-y-2">
            <p className="text-sm text-base-content/70">
              Don&apos;t have an account?{" "}
              <span className="text-primary font-medium">
                Sign up automatically on first login
              </span>
            </p>
            <Link href="/" className="link link-primary text-sm">
              Back to Home
            </Link>
          </div>

          {/* Terms */}
          <div className="text-center mt-4">
            <p className="text-xs text-base-content/50">
              By signing in, you agree to our{" "}
              <Link href="/terms" className="link link-primary">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link href="/privacy" className="link link-primary">
                Privacy Policy
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
