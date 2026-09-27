"use client";

import { signup } from "@/actions/auth";
import { FormEvent, useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Prefetch the dashboard route in the background
  useEffect(() => {
    router.prefetch("/dashboard");
  }, [router]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const result = await signup(new FormData(event.currentTarget));
      if ("error" in result) {
        setError(result.error ?? "Unable to create your account.");
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Unable to create your account right now. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-zinc-950 px-6 py-12 text-zinc-100">
      <div className="pointer-events-none absolute -left-24 top-1/4 h-72 w-72 rounded-full bg-emerald-400/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 bottom-1/4 h-72 w-72 rounded-full bg-cyan-400/10 blur-3xl" />
      <section className="relative w-full max-w-md rounded-3xl border border-zinc-800 bg-zinc-900/90 p-8 shadow-2xl shadow-black/30 backdrop-blur sm:p-10">
        <div className="mb-8">
          <p className="mb-4 font-mono text-xs uppercase tracking-[0.2em] text-emerald-300">/signal console</p>
          <h1 className="text-3xl font-semibold tracking-tight">Create your workspace.</h1>
          <p className="mt-2 text-sm leading-6 text-zinc-500">Set up a merchant account for your checkout workspace.</p>
        </div>

        {error && <p role="alert" className="mb-5 rounded-xl border border-red-400/30 bg-red-400/10 px-4 py-3 text-sm text-red-200">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-5">
          <label className="block text-sm text-zinc-300">
            Store name
            <input name="storeName" type="text" autoComplete="organization" required className="mt-2 w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-emerald-400" />
          </label>
          <label className="block text-sm text-zinc-300">
            Email
            <input name="email" type="email" autoComplete="email" required className="mt-2 w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-emerald-400" />
          </label>
          <label className="block text-sm text-zinc-300">
            Password
            <div className="relative mt-2">
              <input 
                name="password" 
                type={showPassword ? "text" : "password"} 
                autoComplete="new-password" 
                required 
                placeholder="Create a password" 
                className="w-full rounded-xl border border-zinc-700 bg-zinc-950 py-3 pl-4 pr-11 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-emerald-400" 
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-zinc-500 transition hover:text-emerald-300 focus:outline-none"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                  </svg>
                )}
              </button>
            </div>
          </label>
          
          <button 
            type="submit" 
            disabled={isLoading} 
            className="flex w-full items-center justify-center rounded-xl bg-emerald-400 px-4 py-3 text-sm font-semibold text-zinc-950 transition hover:bg-emerald-300 disabled:cursor-wait disabled:opacity-60"
          >
            {isLoading ? (
              <>
                <svg className="-ml-1 mr-2 h-4 w-4 animate-spin text-zinc-950" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Creating account...
              </>
            ) : (
              "Create merchant account"
            )}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-zinc-500">
          Already have an account? <a href="/login" className="text-emerald-300 transition hover:text-emerald-200">Log in</a>
        </p>
      </section>
    </main>
  );
}