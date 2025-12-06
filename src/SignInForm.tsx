"use client";
import { useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { useState } from "react";
import { toast } from "sonner";

export function SignInForm({ onAuthSuccess }: { onAuthSuccess: (user: any) => void }) {
  const signup = useMutation(api.auth.signup);
  const signin = useMutation(api.auth.signin);
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
        if (password.length < 6) {
          toast.error("Password must be at least 6 characters");
          setSubmitting(false);
          return;
        }

        console.log("Signing up with:", { email, username });
        const result = await signup({
          email: email.toLowerCase().trim(),
          username: username.trim(),
          password,
        });
        console.log("Signup result:", result);
        
        toast.success("Account created successfully!");
        onAuthSuccess(result);
      } else {
        // Sign in
        console.log("Signing in with:", email);
        const result = await signin({
          email: email.toLowerCase().trim(),
          password,
        });
        console.log("Signin result:", result);
        
        toast.success("Signed in successfully!");
        onAuthSuccess(result);
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Authentication failed";
      console.error("Auth error:", errorMsg);
      
      let toastTitle = "";
      if (errorMsg.includes("already")) {
        toastTitle = errorMsg;
      } else if (flow === "signUp") {
        toastTitle = "Could not create account. " + errorMsg;
      } else {
        toastTitle = "Invalid email or password";
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
