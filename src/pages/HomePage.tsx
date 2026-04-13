import { FormEvent, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../services/auth";

const DEMO_EMAIL = "demo@gmail.com";
const DEMO_PASSWORD = "12345678";

export default function HomePage() {
  const { loading, signIn, signUp, user } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    const message = mode === "login" ? await signIn(email, password) : await signUp(email, password);

    if (message) {
      setError(message);
    } else {
      navigate("/drive");
    }

    setSubmitting(false);
  }

  async function handleDemoLogin() {
    setMode("login");
    setEmail(DEMO_EMAIL);
    setPassword(DEMO_PASSWORD);
    setSubmitting(true);
    setError("");

    const message = await signIn(DEMO_EMAIL, DEMO_PASSWORD);

    if (message) {
      setError(message);
    } else {
      navigate("/drive");
    }

    setSubmitting(false);
  }

  if (!loading && user) {
    return <Navigate to="/drive" replace />;
  }

  return (
    <main className="min-h-screen bg-blue-50 text-slate-950">
      <section className="mx-auto grid max-w-6xl gap-8 px-4 py-8 sm:px-6 sm:py-12 lg:min-h-screen lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:gap-10 lg:py-10">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.22em] text-blue-600 sm:text-sm">CloudBox</p>
          <h1 className="mt-3 max-w-2xl text-3xl font-black leading-tight sm:mt-4 sm:text-5xl">
            Store files, organize folders, keep work close.
          </h1>
          <p className="mt-3 max-w-xl text-sm text-slate-600 sm:mt-5 sm:text-lg">
            Built for the way you work - fast, simple, and secure.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="rounded-lg border border-blue-100 bg-white p-4 shadow-xl sm:p-6">
          <div className="mb-4 grid grid-cols-2 rounded-lg bg-blue-50 p-1 sm:mb-6">
            <button
              type="button"
              onClick={() => setMode("login")}
              className={`rounded-md px-4 py-2 text-sm font-bold transition ${
                mode === "login" ? "bg-white text-blue-700 shadow-sm" : "text-slate-500"
              }`}
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => setMode("signup")}
              className={`rounded-md px-4 py-2 text-sm font-bold transition ${
                mode === "signup" ? "bg-white text-blue-700 shadow-sm" : "text-slate-500"
              }`}
            >
              Signup
            </button>
          </div>

          <label className="text-sm font-bold text-slate-700" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="mt-2 w-full rounded-lg border border-blue-100 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            required
          />

          <label className="mt-4 block text-sm font-bold text-slate-700" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="mt-2 w-full rounded-lg border border-blue-100 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            minLength={6}
            required
          />

          {error && <p className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="mt-6 w-full rounded-lg bg-blue-600 px-5 py-3 font-bold text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
          >
            {submitting ? "Please wait..." : mode === "login" ? "Login" : "Create account"}
          </button>

          {mode === "login" && (
            <button
              type="button"
              onClick={handleDemoLogin}
              disabled={submitting}
              className="mt-3 w-full rounded-lg border border-blue-200 bg-white px-5 py-3 font-bold text-blue-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Login with demo account
            </button>
          )}
        </form>
      </section>
    </main>
  );
}
