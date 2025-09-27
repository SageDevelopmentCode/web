// Example: How to use the AuthContext in any component
// This file shows usage patterns - you can delete it after understanding

"use client";

import { useAuth } from "../contexts/auth-context";

export function ExampleFeatureComponent() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return (
      <div>
        <h2>Please sign in to access this feature</h2>
        <p>You need to be authenticated to use this feature.</p>
      </div>
    );
  }

  return (
    <div>
      <h2>Welcome, {user.user_metadata?.display_name || user.email}!</h2>
      <p>User ID: {user.id}</p>
      <p>Email: {user.email}</p>
      {/* Your feature content here */}
    </div>
  );
}

export function ExampleFeedbackComponent() {
  const { user, isLoading } = useAuth();

  const handleSubmitFeedback = async (feedback: string) => {
    if (!user) {
      alert("Please sign in to submit feedback");
      return;
    }

    // Submit feedback with user.id
    console.log("Submitting feedback from user:", user.id, feedback);
  };

  return (
    <div>
      <h2>Submit Feedback</h2>
      {user ? (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            handleSubmitFeedback(formData.get("feedback") as string);
          }}
        >
          <textarea name="feedback" placeholder="Your feedback..." required />
          <button type="submit" disabled={isLoading}>
            Submit Feedback
          </button>
        </form>
      ) : (
        <p>Please sign in to submit feedback</p>
      )}
    </div>
  );
}

export default ExampleFeatureComponent;
