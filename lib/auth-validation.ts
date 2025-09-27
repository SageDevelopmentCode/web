// Client-side helper for auth validation
export interface ValidationErrors {
  email?: string;
  displayName?: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationErrors;
}

/**
 * Validates signup data by checking for existing users
 * This function calls the server-side API route to perform the validation
 */
export async function validateSignupData(
  email: string,
  displayName?: string
): Promise<ValidationResult> {
  try {
    const response = await fetch("/api/auth/validate-signup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, displayName }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Validation failed");
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Error validating signup data:", error);
    return {
      isValid: false,
      errors: {
        email: "Unable to verify email availability",
        ...(displayName && {
          displayName: "Unable to verify username availability",
        }),
      },
    };
  }
}

/**
 * Validates just the email
 */
export async function validateEmail(email: string): Promise<{
  isValid: boolean;
  error?: string;
}> {
  const result = await validateSignupData(email);
  return {
    isValid: !result.errors.email,
    error: result.errors.email,
  };
}

/**
 * Validates just the display name
 */
export async function validateDisplayName(displayName: string): Promise<{
  isValid: boolean;
  error?: string;
}> {
  const result = await validateSignupData("temp@example.com", displayName);
  return {
    isValid: !result.errors.displayName,
    error: result.errors.displayName,
  };
}

/**
 * Real-time validation hook for form fields
 * Can be used with debouncing for better UX
 */
export function createValidationDebounce(
  callback: (result: ValidationResult) => void,
  delay: number = 500
) {
  let timeoutId: NodeJS.Timeout;

  return (email: string, displayName?: string) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(async () => {
      const result = await validateSignupData(email, displayName);
      callback(result);
    }, delay);
  };
}
