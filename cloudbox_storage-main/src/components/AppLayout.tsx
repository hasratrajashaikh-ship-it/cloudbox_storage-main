import type { ReactNode } from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../services/auth";

export default function AppLayout({ children }: { children: ReactNode }) {
  const { signOut, user } = useAuth();

  return (
    <div className="min-h-screen bg-blue-50 text-slate-900">
      <header className="sticky top-0 z-20 border-b border-blue-100 bg-white/95 backdrop-blur">
        <div className="flex flex-col gap-4 px-5 py-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-600">CloudBox</p>
            <h1 className="text-2xl font-bold text-slate-950">My Drive</h1>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <span className="max-w-[220px] truncate rounded-full bg-blue-50 px-3 py-2 text-sm font-medium text-blue-700">
              {user?.email}
            </span>
            <button
              onClick={signOut}
              className="rounded-lg border border-blue-200 bg-white px-4 py-2 text-sm font-bold text-blue-700 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="grid min-h-[calc(100vh-81px)] md:grid-cols-[240px_1fr]">
        <aside className="border-b border-blue-100 bg-white p-4 md:border-b-0 md:border-r">
          <nav className="grid gap-2">
            <NavLink
              to="/drive"
              className={({ isActive }) =>
                `rounded-lg px-4 py-3 text-sm font-bold transition ${
                  isActive ? "bg-blue-600 text-white shadow-md" : "text-slate-700 hover:bg-blue-50 hover:text-blue-700"
                }`
              }
            >
              My Drive
            </NavLink>
            <NavLink
              to="/recent"
              className={({ isActive }) =>
                `rounded-lg px-4 py-3 text-sm font-bold transition ${
                  isActive ? "bg-blue-600 text-white shadow-md" : "text-slate-700 hover:bg-blue-50 hover:text-blue-700"
                }`
              }
            >
              Recent
            </NavLink>
            <NavLink
              to="/trash"
              className={({ isActive }) =>
                `rounded-lg px-4 py-3 text-sm font-bold transition ${
                  isActive ? "bg-blue-600 text-white shadow-md" : "text-slate-700 hover:bg-blue-50 hover:text-blue-700"
                }`
              }
            >
              Trash
            </NavLink>
          </nav>
        </aside>
        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}
