"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import SupabaseAuth from "../../../lib/supabase-auth";
import { UserService } from "../../../lib/users";
import { supabase } from "../../../lib/supabase";

interface SignupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSignupSuccess?: () => void;
}

export default function SignupModal({
  isOpen,
  onClose,
  onSignupSuccess,
}: SignupModalProps) {
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isVisible, setIsVisible] = useState(false);
  const [showAvatars, setShowAvatars] = useState(false);
  const [isVerificationStep, setIsVerificationStep] = useState(false);
  const [isLoginMode, setIsLoginMode] = useState(false);
  const [verificationCode, setVerificationCode] = useState([
    "",
    "",
    "",
    "",
    "",
    "",
  ]);
  const [validationErrors, setValidationErrors] = useState({
    email: false,
    username: false,
    password: false,
    avatar: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const characters = [
    "Daniel.PNG",
    "David.png",
    "Deborah.png",
    "Elijah.png",
    "Esther.PNG",
    "Gabriel.png",
    "Job.PNG",
    "JohnTheBaptist.PNG",
    "Moses.PNG",
    "Noah.png",
    "Paul.png",
    "Ruth.png",
    "Samson.png",
    "Solomon.PNG",
  ];

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      // Start showing avatars with a slight delay after modal appears
      const timer = setTimeout(() => {
        setShowAvatars(true);
      }, 200);
      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
      setShowAvatars(false);
    }
  }, [isOpen]);

  const handleClose = () => {
    setIsVisible(false);
    setShowAvatars(false);
    // Reset states when closing
    setIsVerificationStep(false);
    setIsLoginMode(false);
    setVerificationCode(["", "", "", "", "", ""]);
    setValidationErrors({
      email: false,
      username: false,
      password: false,
      avatar: false,
    });
    setIsLoading(false);
    setErrorMessage("");
    setSuccessMessage("");
    setEmail("");
    setUsername("");
    setPassword("");
    setSelectedAvatar(null);
    // Delay the actual close to allow exit animation
    setTimeout(() => {
      onClose();
    }, 300);
  };

  const clearFieldError = (field: keyof typeof validationErrors) => {
    if (validationErrors[field]) {
      setValidationErrors((prev) => ({
        ...prev,
        [field]: false,
      }));
    }
    // Clear error message when user starts interacting
    if (errorMessage) {
      setErrorMessage("");
    }
  };

  const validateForm = () => {
    const errors = {
      email: !email.trim(),
      username: isLoginMode ? false : !username.trim(), // Username not required for login
      password: !password.trim(),
      avatar: isLoginMode ? false : !selectedAvatar, // Avatar not required for login
    };

    setValidationErrors(errors);

    // Return true if no errors
    return !Object.values(errors).some((error) => error);
  };

  const handleLogin = async () => {
    // Validate form before login
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setErrorMessage("");

    try {
      const {
        user,
        session,
        error: authError,
      } = await SupabaseAuth.signIn(email, password);

      if (authError) {
        throw new Error(authError.message);
      }

      if (user && session) {
        setSuccessMessage("Successfully logged in!");

        // Call success callback and close modal after a short delay
        setTimeout(() => {
          onSignupSuccess?.();
          handleClose();
        }, 1500);
      } else {
        throw new Error("Login failed. Please try again.");
      }
    } catch (error) {
      console.error("Login error:", error);
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "An error occurred during login. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async () => {
    if (!isVerificationStep) {
      // Validate form before signup
      if (!validateForm()) {
        return;
      }

      setIsLoading(true);
      setErrorMessage("");

      try {
        // Step 1: Sign up with Supabase Auth
        const {
          user,
          session,
          error: authError,
        } = await SupabaseAuth.signUp(
          email,
          password,
          username // This becomes the display_name in auth metadata
        );

        if (authError) {
          throw new Error(authError.message);
        }

        if (user?.id) {
          // Step 2: Create user record in users table
          const profilePicture =
            selectedAvatar?.replace(/\.(png|PNG)$/, "") || "";

          const { user: dbUser, error: dbError } = await UserService.createUser(
            {
              user_id: user.id,
              profile_picture: profilePicture,
            }
          );

          if (dbError) {
            console.error("Error creating user record:", dbError);
            // Note: Auth user was created but DB record failed
            // You might want to handle this case differently
          }

          // Step 3: Move to verification step
          setIsVerificationStep(true);
          setSuccessMessage("Check your email for a verification code!");
        } else {
          throw new Error("No user ID returned from signup");
        }
      } catch (error) {
        console.error("Signup error:", error);
        setErrorMessage(
          error instanceof Error
            ? error.message
            : "An error occurred during signup. Please try again."
        );
      } finally {
        setIsLoading(false);
      }
    } else {
      // Handle verification code
      const verificationCodeString = verificationCode.join("");

      if (verificationCodeString.length !== 6) {
        setErrorMessage("Please enter a complete 6-digit verification code.");
        return;
      }

      setIsLoading(true);
      setErrorMessage("");

      try {
        // Verify the email with the code
        const { data, error } = await supabase.auth.verifyOtp({
          email,
          token: verificationCodeString,
          type: "signup",
        });

        if (error) {
          throw new Error(error.message);
        }

        setSuccessMessage("Email verified successfully! Welcome!");

        // Call success callback and close modal after a short delay
        setTimeout(() => {
          onSignupSuccess?.();
          handleClose();
        }, 2000);
      } catch (error) {
        console.error("Verification error:", error);
        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Invalid verification code. Please try again."
        );
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleVerificationCodeChange = (index: number, value: string) => {
    if (value.length <= 1 && /^\d*$/.test(value)) {
      const newCode = [...verificationCode];
      newCode[index] = value;
      setVerificationCode(newCode);

      // Auto-focus next input
      if (value && index < 5) {
        const nextInput = document.getElementById(`verification-${index + 1}`);
        nextInput?.focus();
      }
    }
  };

  const handleVerificationKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !verificationCode[index] && index > 0) {
      const prevInput = document.getElementById(`verification-${index - 1}`);
      prevInput?.focus();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className={`fixed inset-0 z-[100] flex items-center justify-center transition-all duration-300 ${
        isVisible ? "opacity-100" : "opacity-0"
      }`}
    >
      {/* Black overlay */}
      <div
        className={`absolute inset-0 transition-all duration-300 ${
          isVisible ? "opacity-100" : "opacity-0"
        }`}
        style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
        onClick={handleClose}
      />

      {/* Modal content */}
      <div
        className={`relative w-[90vw] max-w-lg mx-4 rounded-3xl overflow-hidden transition-all duration-300 transform ${
          isVisible
            ? "opacity-100 scale-100 translate-y-0"
            : "opacity-0 scale-95 translate-y-4"
        }`}
        style={{ backgroundColor: "#CBE2D8" }}
      >
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-white bg-opacity-20 hover:bg-opacity-30 transition-all cursor-pointer"
        >
          <svg
            className="w-5 h-5 text-gray-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        <div className="p-10 pb-0">
          {/* Title */}
          <h2
            className="text-xl font-bold text-center mb-8"
            style={{ color: "#2F4A5D" }}
          >
            {isLoginMode
              ? "Login to Your Account"
              : "Sign Up to Provide Feedback or Comment"}
          </h2>

          {/* Error Message */}
          {errorMessage && (
            <div className="mb-4 p-3 rounded-lg bg-red-100 border border-red-300">
              <p className="text-red-700 text-sm text-center">{errorMessage}</p>
            </div>
          )}

          {/* Success Message */}
          {successMessage && (
            <div className="mb-4 p-3 rounded-lg bg-green-100 border border-green-300">
              <p className="text-green-700 text-sm text-center">
                {successMessage}
              </p>
            </div>
          )}

          {!isVerificationStep ? (
            <>
              {/* Email Input */}
              <div className="mb-4">
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    clearFieldError("email");
                  }}
                  className={`w-full px-6 py-3 rounded-full border-2 outline-none placeholder-gray-500 ${
                    validationErrors.email
                      ? "border-red-500"
                      : "border-transparent"
                  }`}
                  style={{
                    backgroundColor: "#D6E5E2",
                    color: "#2F4A5D",
                  }}
                />
              </div>

              {/* Username Input - Only show for signup */}
              {!isLoginMode && (
                <div className="mb-4">
                  <input
                    type="text"
                    placeholder="Enter a Username"
                    value={username}
                    onChange={(e) => {
                      setUsername(e.target.value);
                      clearFieldError("username");
                    }}
                    className={`w-full px-6 py-3 rounded-full border-2 outline-none placeholder-gray-500 ${
                      validationErrors.username
                        ? "border-red-500"
                        : "border-transparent"
                    }`}
                    style={{
                      backgroundColor: "#D6E5E2",
                      color: "#2F4A5D",
                    }}
                  />
                </div>
              )}

              {/* Password Input */}
              <div className={isLoginMode ? "mb-8" : "mb-6"}>
                <input
                  type="password"
                  placeholder={
                    isLoginMode ? "Enter your Password" : "Create a Password"
                  }
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    clearFieldError("password");
                  }}
                  className={`w-full px-6 py-3 rounded-full border-2 outline-none placeholder-gray-500 ${
                    validationErrors.password
                      ? "border-red-500"
                      : "border-transparent"
                  }`}
                  style={{
                    backgroundColor: "#D6E5E2",
                    color: "#2F4A5D",
                  }}
                />
              </div>

              {/* Avatar Selection - Only show for signup */}
              {!isLoginMode && (
                <div className="mb-8">
                  <p
                    className={`text-sm font-bold mb-4 ${
                      validationErrors.avatar ? "text-red-500" : ""
                    }`}
                    style={{
                      color: validationErrors.avatar ? "#ef4444" : "#2F4A5D",
                    }}
                  >
                    Select an Avatar {validationErrors.avatar && "(Required)"}
                  </p>
                  <div
                    className={`grid grid-cols-7 gap-3 p-3 rounded-xl ${
                      validationErrors.avatar ? "border-2 border-red-500" : ""
                    }`}
                  >
                    {characters.map((character, index) => (
                      <button
                        key={character}
                        onClick={() => {
                          setSelectedAvatar(character);
                          clearFieldError("avatar");
                        }}
                        className={`w-12 h-12 cursor-pointer rounded-full overflow-hidden border-2 transition-all duration-150 transform ${
                          showAvatars
                            ? "opacity-100 scale-100 translate-y-0"
                            : "opacity-0 scale-75 translate-y-2"
                        } ${
                          selectedAvatar === character
                            ? "border-gray-600"
                            : "border-gray-300 hover:border-gray-400"
                        }`}
                        style={{
                          backgroundColor: "#D6E5E2",
                          transitionDelay: showAvatars
                            ? `${index * 50}ms`
                            : "0ms",
                        }}
                      >
                        <Image
                          src={`/assets/Characters/${character}`}
                          alt={character.split(".")[0]}
                          width={200}
                          height={200}
                          className={`w-auto h-full object-cover transition-all duration-150 ${
                            selectedAvatar === character
                              ? "opacity-100 grayscale-0"
                              : "opacity-60 grayscale"
                          }`}
                          style={{
                            transform:
                              character === "Ruth.png"
                                ? "scale(3.5) translateY(30%) translateX(10%)"
                                : character === "Samson.png"
                                ? "scale(3.5) translateY(28%) translateX(4%)"
                                : character === "Deborah.png"
                                ? "scale(3.5) translateY(30%) translateX(4%)"
                                : character === "Noah.png"
                                ? "scale(3.5) translateY(26%) translateX(4%)"
                                : "scale(3.5) translateY(33%) translateX(4%)",
                            objectPosition: "center 30%",
                          }}
                          quality={100}
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <>
              {/* Verification Step */}
              <div className="mb-8">
                <p
                  className="text-sm text-center mb-6"
                  style={{ color: "#2F4A5D" }}
                >
                  We've sent a verification code to{" "}
                  <strong>{email || "example@email.com"}</strong>
                </p>

                {/* 6-Digit Verification Code Input */}
                <div className="flex justify-center gap-3 mb-6">
                  {verificationCode.map((digit, index) => (
                    <input
                      key={index}
                      id={`verification-${index}`}
                      type="text"
                      maxLength={1}
                      value={digit}
                      onChange={(e) =>
                        handleVerificationCodeChange(index, e.target.value)
                      }
                      onKeyDown={(e) => handleVerificationKeyDown(index, e)}
                      className="w-12 h-12 text-center text-lg font-bold rounded-lg border-none outline-none"
                      style={{
                        backgroundColor: "#D6E5E2",
                        color: "#2F4A5D",
                      }}
                    />
                  ))}
                </div>

                <p className="text-xs text-center" style={{ color: "#6B764C" }}>
                  Didn't receive the code?{" "}
                  <span className="underline cursor-pointer">Resend</span>
                </p>
              </div>
            </>
          )}

          {/* Sign Up/Login Button */}
          <button
            onClick={isLoginMode ? handleLogin : handleSignUp}
            disabled={isLoading}
            className={`w-full py-3 text-white font-bold transition-all hover:opacity-90 cursor-pointer ${
              isVerificationStep ? "mb-12" : ""
            } ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
            style={{
              backgroundColor: "#778554",
              boxShadow: "0px 4px 0px 1px #57613B",
              borderRadius: "15px",
            }}
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                {isVerificationStep
                  ? "Verifying..."
                  : isLoginMode
                  ? "Logging In..."
                  : "Signing Up..."}
              </div>
            ) : (
              <>
                {isVerificationStep
                  ? "Verify Code"
                  : isLoginMode
                  ? "Login"
                  : "Sign Up"}
              </>
            )}
          </button>

          {!isVerificationStep && (
            /* Toggle between Login/Signup */
            <button
              onClick={() => {
                setIsLoginMode(!isLoginMode);
                // Clear form and errors when toggling
                setEmail("");
                setUsername("");
                setPassword("");
                setSelectedAvatar(null);
                setValidationErrors({
                  email: false,
                  username: false,
                  password: false,
                  avatar: false,
                });
                setErrorMessage("");
                setSuccessMessage("");
              }}
              className="w-full items-center justify-center cursor-pointer"
            >
              <p
                className="text-center text-sm mt-6 mb-6"
                style={{ color: "#6B764C" }}
              >
                {isLoginMode
                  ? "Don't have an account? Sign up"
                  : "Already have an account? Login"}
              </p>
            </button>
          )}
        </div>

        {/* Background Image */}
        <div className="relative h-32 overflow-hidden">
          <Image
            src="/assets/AuthBackground.jpg"
            alt="Background"
            width={1200}
            height={400}
            className="w-full h-auto object-cover object-top"
            quality={100}
            priority
            unoptimized
          />
        </div>
      </div>
    </div>
  );
}
