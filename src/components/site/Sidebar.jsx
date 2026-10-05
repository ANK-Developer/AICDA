import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { categoryNav } from "./nav-data";

export function Sidebar({ className = "" }) {
  return (
    <aside className={`w-full lg:w-64 shrink-0 ${className}`}>
      <div className="rounded-lg overflow-hidden border border-border bg-card shadow-[var(--shadow-card)]">
        <div
          className="bg-primary text-primary-foreground px-4 py-3 font-bold text-lg tracking-wide"
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          Categories
        </div>
        <ul className="divide-y divide-border">
          {categoryNav.map((c) => (
            <li key={c.to}>
              <Link
                to={c.to}
                className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-foreground hover:text-primary hover:bg-accent [&.active]:text-primary [&.active]:bg-accent transition"
                activeProps={{ className: "active" }}
              >
                <ChevronRight className="w-3.5 h-3.5 text-primary" />
                <span>{c.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}
