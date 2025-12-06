"use client";
import { useAuthActions } from "@convex-dev/auth/react";
import { useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { useState } from "react";
import { toast } from "sonner";

export function SignInForm() {
  const { signIn } = useAuthActions();
  const createUserProfile = useMutation(api.auth.createUserProfile);
  const [flow, setFlow] = useState<"signIn" | "signUp">("signIn");
  const [submitting, setSubmitting] = useState(false);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (flow === "signUp") {
        if (!username.trim()) {
          toast.error("Username is required");
          setSubmitting(false);
          return;
        }
        if (!email.trim()) {
          toast.error("Email is required");
          setSubmitting(false);
          return;
        }
        if (password.length < 8) {
          toast.error("Password must be at least 8 characters");
          setSubmitting(false);
          return;
        }
      }

      const formData = new FormData();
      formData.set("flow", flow);
      formData.set("email", email.toLowerCase().trim());
      formData.set("password", password);

      console.log("Attempting", flow, "with email:", email);
      
      const result = await signIn("password", formData);
      console.log("Auth result:", result);
      
      // After successful authentication
      if (flow === "signUp") {
        try {
          // Add a delay to ensure auth state is updated server-side
          await new Promise(resolve => setTimeout(resolve, 1500));
          console.log("Creating profile for username:", username);
          await createUserProfile({
            email: email.toLowerCase().trim(),
            username: username.trim(),
          });
          console.log("Profile created successfully");
          toast.success("Account created successfully!");
        } catch (profileError) {
          const errorMsg = profileError instanceof Error ? profileError.message : "Failed to create profile";
          console.error("Profile creation error:", errorMsg);
          if (errorMsg.includes("Username already taken")) {
            toast.error("Username already taken. Please choose another.");
          } else {
            toast.warning("Account created successfully! Welcome to TripGenie!");
          }
        }
      } else {
        toast.success("Signed in successfully!");
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Authentication failed";
      console.error("Auth error:", errorMsg);
      
      let toastTitle = "";
      if (errorMsg.includes("Invalid") || errorMsg.includes("password")) {
        if (flow === "signUp") {
          toastTitle = "Signup failed. Email may already be registered.";
        } else {
          toastTitle = "Invalid email or password.";
        }
      } else if (errorMsg.includes("Username")) {
        toastTitle = "Username already taken. Please choose another.";
      } else if (errorMsg.includes("Email")) {
        toastTitle = "Email already registered. Try signing in instead.";
      } else {
        toastTitle = flow === "signUp" ? "Could not create account." : "Could not sign in.";
      }
      toast.error(toastTitle);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        {flow === "signUp" && (
          <input
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required={flow === "signUp"}
            disabled={submitting}
          />
        )}
        <input
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={submitting}
        />
        <input
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          type="password"
          placeholder="Password (min 6 characters)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          disabled={submitting}
        />
        <button
          className="w-full py-2 px-4 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          type="submit"
          disabled={submitting}
        >
          {submitting ? "Loading..." : flow === "signIn" ? "Sign in" : "Create Account"}
        </button>
        <div className="text-center text-sm text-gray-600">
          <span>
            {flow === "signIn"
              ? "Don't have an account? "
              : "Already have an account? "}
          </span>
          <button
            type="button"
            className="text-indigo-600 hover:text-indigo-700 hover:underline font-medium cursor-pointer"
            disabled={submitting}
            onClick={() => {
              setFlow(flow === "signIn" ? "signUp" : "signIn");
              setUsername("");
              setEmail("");
              setPassword("");
            }}
          >
            {flow === "signIn" ? "Sign up" : "Sign in"}
          </button>
        </div>
      </form>
    </div>
  );
}
