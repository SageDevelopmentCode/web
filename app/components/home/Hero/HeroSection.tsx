"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../../../../contexts/auth-context";
import { EmailSubscriptionService } from "../../../../lib/supabase/email_subscriptions";
import { toast } from "sonner";

export default function HeroSection() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isCheckingSubscription, setIsCheckingSubscription] = useState(false);
  const { user } = useAuth();

  // Check subscription status when user logs in
  useEffect(() => {
    const checkSubscriptionStatus = async () => {
      if (user?.email) {
        setIsCheckingSubscription(true);
        try {
          const { exists, isActive } =
            await EmailSubscriptionService.subscriptionExists(user.email);
          setIsSubscribed(exists && isActive);
        } catch (error) {
          console.error("Error checking subscription status:", error);
          setIsSubscribed(false);
        } finally {
          setIsCheckingSubscription(false);
        }
      } else {
        setIsSubscribed(false);
        setIsCheckingSubscription(false);
      }
    };

    checkSubscriptionStatus();
  }, [user]);

  // Email validation function
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubscribe = async () => {
    // Clear previous messages
    setEmailError("");

    // Determine email and user_id based on auth state
    let emailToSubscribe = "";
    let userId: string | null = null;

    if (user) {
      // User is logged in - use their email and id
      emailToSubscribe = user.email || "";
      userId = user.id;

      if (!emailToSubscribe) {
        toast.error("Unable to find your email. Please try again.");
        return;
      }
    } else {
      // User is not logged in - validate email input
      emailToSubscribe = email.trim();

      if (!emailToSubscribe) {
        setEmailError("Please enter your email");
        return;
      }

      if (!validateEmail(emailToSubscribe)) {
        setEmailError("Please enter a valid email address");
        return;
      }
    }

    setIsSubmitting(true);

    try {
      // Check if email already subscribed
      const { exists, isActive, error: checkError } =
        await EmailSubscriptionService.subscriptionExists(emailToSubscribe);

      if (checkError) {
        console.error("Error checking subscription:", checkError);
      }

      if (exists && isActive) {
        toast.error("This email is already subscribed!");
        setIsSubmitting(false);
        return;
      }

      // If subscription exists but unsubscribed, we can still create a new one
      // or you could update the existing one - for now creating new

      // Create subscription
      const { subscription, error } =
        await EmailSubscriptionService.createSubscription({
          email: emailToSubscribe,
          user_id: userId,
        });

      if (error) {
        console.error("Error creating subscription:", error);
        toast.error("Something went wrong. Please try again.");
      } else if (subscription) {
        toast.success("Successfully subscribed! We'll keep you updated.");
        // Update subscription status
        setIsSubscribed(true);
        // Clear email input for non-logged-in users
        if (!user) {
          setEmail("");
        }
      }
    } catch (error) {
      console.error("Subscription error:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="flex flex-col items-center justify-center h-full px-4 sm:px-6 md:px-8"
      style={{ zIndex: 10, position: "relative", pointerEvents: "auto" }}
    >
      <div
        className="mb-3 px-3 py-1.5 rounded-full text-white font-bold text-xs sm:text-sm fade-in-up delay-1"
        style={{ backgroundColor: "#BF8EFF" }}
      >
        Out April 15, 2026
      </div>
      <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-white fade-in-up delay-2 text-center">
        Sage
      </h1>
      <p className="text-white text-sm sm:text-base mt-4 text-center font-bold max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg fade-in-up delay-3 px-2">
        Feeling Disconnected from God During Your Busy Week? Introducing Sage, a{" "}
        <span
          className="px-1 py-0.5 rounded"
          style={{
            background:
              "linear-gradient(90.81deg, #9D638D 0.58%, #BF8EFF 99.31%)",
            borderRadius: "10px",
          }}
        >
          Christian Self-Care
        </span>{" "}
        Game.
      </p>

      {/* Mobile Layout - Separated Components */}
      {!(user && isSubscribed) && (
        <div className="mt-8 sm:hidden w-full max-w-xs fade-in-up delay-4 px-0 flex flex-col gap-3">
          {!user && (
            <div className="w-full">
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setEmailError("");
                }}
                className="w-full text-white placeholder-gray-400 px-6 py-4 rounded-full focus:outline-none text-sm"
                style={{
                  backgroundColor: "#282828",
                  border: emailError ? "2px solid #EF4444" : "none",
                }}
                disabled={isSubmitting}
              />
              {emailError && (
                <p className="text-red-400 text-xs mt-2 px-2">{emailError}</p>
              )}
            </div>
          )}
          <button
            onClick={handleSubscribe}
            disabled={isSubmitting || isCheckingSubscription}
            className="w-full px-6 py-3 text-white font-extrabold rounded-full text-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              background:
                "linear-gradient(90.81deg, #9D638D 0.58%, #BF8EFF 99.31%)",
              pointerEvents: "auto",
              boxShadow: "0px 4px 0px 1px #764B6F",
            }}
            type="button"
          >
            {isSubmitting
              ? "Subscribing..."
              : isCheckingSubscription
              ? "Loading..."
              : "Subscribe for Early Access"}
          </button>
        </div>
      )}

      {/* Desktop Layout - Connected Components */}
      <div className="hidden sm:block mt-12 w-full max-w-md fade-in-up delay-4 px-4">
        {user ? (
          // Logged in user - show subscribe button only if not subscribed
          !isSubscribed && (
            <div className="flex flex-col gap-2">
              <button
                onClick={handleSubscribe}
                disabled={isSubmitting || isCheckingSubscription}
                className="w-full px-6 py-3 text-white font-semibold rounded-full text-base cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  background:
                    "linear-gradient(90.81deg, #9D638D 0.58%, #BF8EFF 99.31%)",
                  pointerEvents: "auto",
                  boxShadow: "0px 4px 0px 1px #764B6F",
                }}
                type="button"
              >
                {isSubmitting
                  ? "Subscribing..."
                  : isCheckingSubscription
                  ? "Loading..."
                  : "Subscribe"}
              </button>
            </div>
          )
        ) : (
          // Not logged in - show email input with subscribe button
          <div className="flex flex-col gap-2">
            <div
              className="relative flex items-center rounded-full p-2"
              style={{
                backgroundColor: "#282828",
                border: emailError ? "2px solid #EF4444" : "none",
              }}
            >
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setEmailError("");
                }}
                className="flex-1 bg-transparent text-white placeholder-gray-400 px-4 py-2 rounded-full focus:outline-none text-base"
                disabled={isSubmitting}
              />
              <button
                onClick={handleSubscribe}
                disabled={isSubmitting}
                className="px-6 py-2 text-white font-semibold rounded-full text-base cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  background:
                    "linear-gradient(90.81deg, #9D638D 0.58%, #BF8EFF 99.31%)",
                  pointerEvents: "auto",
                }}
                type="button"
              >
                {isSubmitting ? "Subscribing..." : "Subscribe"}
              </button>
            </div>
            {emailError && (
              <p className="text-red-400 text-xs px-2">{emailError}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
