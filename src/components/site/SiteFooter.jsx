import { Link } from "react-router-dom";
import { primaryNav } from "./nav-data";

const vehicleDetailLinks = [
  { label: "Parivahan Sewa", href: "https://parivahan.gov.in/" },
  {
    label: "NextGen mParivahan app",
    href: "https://play.google.com/store/apps/details?id=com.nic.mparivahan&hl=en_IN&gl=US",
  },
  { label: "eChallan Parivahan", href: "https://echallan.parivahan.gov.in/index/accused-challan" },
  { label: "National Informatics Centre", href: "https://www.nic.gov.in" },
  { label: "Ministry of Road Transport & Highways", href: "https://morth.gov.in/#/" },
];

export function SiteFooter() {
  return (
    <footer className="mt-16 bg-primary-deep text-primary-foreground sm:mt-20">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 sm:py-12 lg:px-8 md:grid-cols-3 md:gap-10">
        <div>
          <h4 className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-wider opacity-90">
            Vehicle Detail Links
            <span className="rounded-full bg-amber-400 px-1.5 py-0.5 text-[10px] font-black tracking-wide text-primary-deep">
              NEW
            </span>
          </h4>
          <ul className="space-y-1.5 text-sm">
            {vehicleDetailLinks.map((item) => (
              <li key={item.label}>
                <a
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="opacity-80 hover:opacity-100 hover:underline"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-bold uppercase tracking-wider mb-3 opacity-90">
            Quick Links
          </h4>
          <ul className="grid grid-cols-2 gap-y-1 text-sm">
            {primaryNav.map((n) => (
              <li key={n.to}>
                <Link to={n.to} className="opacity-80 hover:opacity-100 hover:underline">
                  {n.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-bold uppercase tracking-wider mb-3 opacity-90">
            Head Office
          </h4>
          <address className="not-italic text-sm opacity-80 leading-relaxed">
            CB-32B, OPP. RBI COLONY, SHALIMAR BAGH New Delhi — 110001, India
            <br />
            <span className="block mt-2">
              Phone: 9818691000, 9810027829, 8587036564, 8595288016
            </span>
            <span className="block">Email: info@aicda.in</span>
          </address>
        </div>
      </div>
      <div className="border-t border-primary-foreground/15 px-4 py-4 text-center text-xs opacity-70 sm:px-6 lg:px-8">
        © {new Date().getFullYear()} All India Car Dealers Association. All rights reserved.
      </div>
    </footer>
  );
}
