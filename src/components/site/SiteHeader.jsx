import { Link } from "react-router-dom";
import { useState } from "react";
import { Menu, X, Phone, Mail } from "lucide-react";
import { primaryNav } from "./nav-data";
import { useBanner } from "@/hooks/use-banners";
import aicdaLogo from "@/assets/Aicda logo.png";

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const becomeMemberBanner = useBanner("become-member");
  const becomeMemberStyle = becomeMemberBanner
    ? {
        backgroundImage: `linear-gradient(0deg, rgba(0,0,0,0.35), rgba(0,0,0,0.35)), url(${becomeMemberBanner})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }
    : undefined;
  const becomeMemberStyleLight = becomeMemberBanner
    ? {
        backgroundImage: `linear-gradient(0deg, rgba(255,255,255,0.7), rgba(255,255,255,0.7)), url(${becomeMemberBanner})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }
    : undefined;
  return (
    <header className="sticky top-0 z-50 shadow-[var(--shadow-elegant)]">
      {/* <div className="bg-background text-foreground text-[11px] border-b border-border">
        <div className="mx-auto max-w-7xl px-4 py-1.5 flex justify-between items-center">
          <span className="opacity-70 uppercase tracking-[0.2em]">Est. Serving Car Dealers Across India</span>
          <span className="hidden sm:inline opacity-70">Since 1998</span>
        </div>
      </div> */}
      <div className="bg-background text-foreground">
        <div className="mx-auto max-w-7xl px-4 py-3 flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-3 group">
            <img
              src={aicdaLogo}
              alt="AICDA"
              className="h-12 w-12 shrink-0 object-contain sm:h-14 sm:w-14"
            />
            <span className="leading-tight">
              <span
                className="block text-lg sm:text-2xl font-black tracking-tight text-primary"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                All India Car Dealers Association
              </span>
              <span className="block text-[10px] uppercase tracking-[0.3em] text-muted-foreground mt-0.5">
                AICDA · Since 1998
              </span>
            </span>
          </Link>
          <div className="hidden lg:flex items-center gap-6 text-sm">
            <span className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-primary" /> +91 9818691000
            </span>
            <span className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-primary" /> info@aicda.in
            </span>
            <span className="opacity-70">RTO Form | Registration No. - S-55924/2006</span>
            <Link
              to="/become-member#enquiry-form"
              style={becomeMemberStyle}
              className="rounded-md bg-primary px-4 py-1.5 text-sm font-semibold text-primary-foreground transition hover:bg-primary-deep"
            >
              Enquiry
            </Link>
          </div>
          <button className="lg:hidden p-2" onClick={() => setOpen(!open)} aria-label="Menu">
            {open ? <X /> : <Menu />}
          </button>
        </div>
      </div>
      <div className="bg-[image:var(--gradient-header)] text-primary-foreground">
        <nav className="hidden lg:block">
          <ul className="mx-auto max-w-7xl px-4 flex flex-wrap">
            {primaryNav.map((item) => (
              <li key={item.to}>
                <Link
                  to={item.to}
                  className="block px-4 py-3 text-sm font-semibold uppercase tracking-wide hover:bg-primary-foreground/10 [&.active]:bg-primary-foreground/15 [&.active]:shadow-inner transition"
                  activeProps={{ className: "active" }}
                  activeOptions={{ exact: item.to === "/" }}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        {open && (
          <nav className="lg:hidden">
            <div className="px-2 pt-2 lg:hidden">
              <Link
                to="/become-member#enquiry-form"
                onClick={() => setOpen(false)}
                style={becomeMemberStyleLight}
                className="block rounded-md bg-primary-foreground px-3 py-2 text-center text-sm font-semibold text-primary hover:opacity-90"
              >
                Enquiry
              </Link>
            </div>
            <ul className="px-2 py-2">
              {primaryNav.map((item) => (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    onClick={() => setOpen(false)}
                    className="block px-3 py-2 rounded text-sm font-semibold hover:bg-primary-foreground/10 [&.active]:bg-primary-foreground/15"
                    activeProps={{ className: "active" }}
                    activeOptions={{ exact: item.to === "/" }}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        )}
      </div>
    </header>
  );
}
