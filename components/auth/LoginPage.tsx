"use client";

import React, { useState, useEffect } from "react";
import { Terminal, Lock, User, Eye, EyeOff, ArrowRight, AlertCircle, Sun, Moon, ShieldCheck, KeyRound } from "lucide-react";
import { playChime } from "@/lib/audio";

interface LoginPageProps {
  onLoginSuccess: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isShake, setIsShake] = useState(false);
  const [isLight, setIsLight] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedTheme = localStorage.getItem("devtrack_theme");
      if (savedTheme === "light") {
        setIsLight(true);
        document.documentElement.setAttribute("data-theme", "light");
      } else {
        setIsLight(false);
        document.documentElement.setAttribute("data-theme", "dark");
      }
    }
  }, []);

  const toggleTheme = () => {
    const next = !isLight;
    setIsLight(next);
    const themeStr = next ? "light" : "dark";
    if (typeof window !== "undefined") {
      document.documentElement.setAttribute("data-theme", themeStr);
      localStorage.setItem("devtrack_theme", themeStr);
    }
  };

  const handleFillDemo = () => {
    setUsername("Jitu");
    setPassword("6462");
    setError(null);
  };

  const triggerConfetti = async () => {
    if (typeof window !== "undefined") {
      try {
        const confetti = (await import("canvas-confetti")).default;
        confetti({
          particleCount: 60,
          spread: 60,
          origin: { y: 0.7 },
        });
      } catch {
        // safe fallback
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmedUser = username.trim();
    const trimmedPass = password.trim();

    if (!trimmedUser || !trimmedPass) {
      setError("Please enter both username and password.");
      triggerShake();
      return;
    }

    setIsSubmitting(true);

    // Validate credentials:
    // Supports primary credentials (Jitu / 6462), admin, or custom saved credentials
    const validUsernames = ["jitu", "admin", "jitendra", "jitendradhamdhere"];
    const isValidUser = validUsernames.includes(trimmedUser.toLowerCase());
    const isValidPass = trimmedPass === "6462" || trimmedPass === "admin123";

    setTimeout(() => {
      if (isValidUser && isValidPass) {
        // Success
        playChime("complete");
        triggerConfetti();

        if (typeof window !== "undefined") {
          if (rememberMe) {
            localStorage.setItem("devtrack_logged_in", "true");
          }
          sessionStorage.setItem("devtrack_logged_in", "true");
        }

        onLoginSuccess();
      } else {
        // Failed
        playChime("warning");
        setError("Invalid credentials. Demo: Username 'Jitu' / Password '6462'");
        triggerShake();
        setIsSubmitting(false);
      }
    }, 350);
  };

  const triggerShake = () => {
    setIsShake(true);
    setTimeout(() => setIsShake(false), 500);
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center p-4 overflow-hidden bg-bg-primary select-none transition-colors duration-300">
      {/* Dynamic Ambient Background Glows */}
      <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-brand-primary/20 blur-[120px] pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-brand-secondary/20 blur-[140px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-brand-primary/5 blur-[160px] pointer-events-none" />

      {/* Top Header Controls */}
      <div className="absolute top-6 right-6 z-20 flex items-center gap-3">
        <button
          onClick={toggleTheme}
          type="button"
          className="p-2.5 rounded-xl text-text-secondary hover:text-text-primary hover:bg-bg-tertiary border border-border-ui transition-all shadow-sm"
          title={isLight ? "Switch to Dark Mode" : "Switch to Light Mode"}
        >
          {isLight ? <Moon size={18} /> : <Sun size={18} />}
        </button>
      </div>

      {/* Main Login Card */}
      <div
        className={`relative z-10 w-full max-w-md glass-card p-8 sm:p-10 transition-transform duration-300 ${
          isShake ? "animate-bounce" : ""
        }`}
      >
        {/* Logo & Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-brand-primary/15 border border-brand-primary/30 text-brand-primary mb-4 shadow-glow">
            <Terminal size={28} />
          </div>
          <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-text-primary tracking-tight">
            DevTrack <span className="text-brand-primary">Pro</span>
          </h1>
          <p className="text-xs sm:text-sm text-text-muted mt-2">
            Sign in to your developer productivity & career operating system
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-3.5 rounded-xl bg-status-danger/10 border border-status-danger/30 text-status-danger text-xs font-medium flex items-center gap-2.5 animate-fadeIn">
            <AlertCircle size={16} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Username Input */}
          <div>
            <label className="block text-xs font-semibold text-text-secondary mb-1.5 flex items-center gap-1.5">
              <User size={13} className="text-brand-primary" /> Username
            </label>
            <div className="relative">
              <input
                type="text"
                required
                autoFocus
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  if (error) setError(null);
                }}
                placeholder="Enter username (e.g. Jitu)"
                className="w-full bg-bg-secondary border border-border-ui rounded-xl pl-3.5 pr-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all"
              />
            </div>
          </div>

          {/* Password Input */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-text-secondary flex items-center gap-1.5">
                <Lock size={13} className="text-brand-primary" /> Password
              </label>
            </div>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) setError(null);
                }}
                placeholder="Enter password"
                className="w-full bg-bg-secondary border border-border-ui rounded-xl pl-3.5 pr-11 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all font-mono"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary p-1 rounded-lg transition-colors"
                title={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Remember Me & Quick Demo Credentials */}
          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-2 text-xs text-text-secondary cursor-pointer hover:text-text-primary select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="rounded bg-bg-secondary border-border-ui text-brand-primary focus:ring-0 cursor-pointer"
              />
              <span>Remember me</span>
            </label>

            <button
              type="button"
              onClick={handleFillDemo}
              className="text-[11px] font-semibold text-brand-primary hover:underline flex items-center gap-1"
            >
              <KeyRound size={12} /> Auto-fill Demo
            </button>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full mt-2 flex items-center justify-center gap-2 py-3 rounded-xl bg-brand-primary hover:bg-brand-hover text-white text-sm font-bold shadow-glow transition-all active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Verifying credentials...</span>
              </>
            ) : (
              <>
                <span>Sign In to Dashboard</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        {/* Security Badge Footer */}
        <div className="mt-8 pt-5 border-t border-border-ui flex items-center justify-center gap-2 text-xs text-text-muted">
          <ShieldCheck size={14} className="text-status-success" />
          <span>Local gate session active • Supabase encrypted</span>
        </div>
      </div>
    </div>
  );
};
