import { motion } from "framer-motion";

import { SiteHeader } from "./SiteHeader";
import { SiteFooter } from "./SiteFooter";
import { Sidebar } from "./Sidebar";
import { BannerSlideshow } from "./BannerSlideshow";
import { useBannerImages } from "@/hooks/use-banners";

import banner1 from "@/assets/AICDA13-2.webp.asset.json";
import banner2 from "@/assets/AICDA12-2.webp.asset.json";
import banner3 from "@/assets/AICDA11-2.webp.asset.json";
import banner4 from "@/assets/AICDA10-2.webp.asset.json";
import banner5 from "@/assets/AICDA9-2.webp.asset.json";
import banner6 from "@/assets/AICDA8-2.webp.asset.json";
import banner7 from "@/assets/AICDA6.webp.asset.json";

const BANNERS = [banner1, banner2, banner3, banner4, banner5, banner6, banner7];

export function PageShell({ title, subtitle, children, hideSidebar = false, bannerKey }) {
  // Only this page's own banners (visible ones, in the admin's order). With none
  // uploaded, the built-in banners are shown instead.
  const sectionBanners = useBannerImages(bannerKey);
  const bannerImages = sectionBanners.length ? sectionBanners : BANNERS.map((banner) => banner.url);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />

      {/* =====================================================
          HERO / PAGE HEADER
      ===================================================== */}
      <section className="relative overflow-hidden">
        {/* Hero Slideshow */}
        <div
          className="
            relative
            h-[300px]
            w-full
            overflow-hidden
            sm:h-[350px]
            lg:h-[400px]
          "
        >
          {/* Banner images (cross-fade + dots when there is more than one) */}
          <BannerSlideshow images={bannerImages} />

          {/* Dark overlay */}
          <div className="absolute inset-0 bg-black/25" />

          {/* Bottom fade */}
          <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/40 to-transparent" />
        </div>

        {/* =================================================
            RED TITLE BAR
        ================================================= */}
        <div className="relative bg-[#770606] text-white">
          <div className="mx-auto w-full max-w-7xl px-4 py-4 sm:px-6 sm:py-5 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.5,
                ease: "easeOut",
              }}
              className="text-left"
            >
              <h1
                className="
                  text-2xl
                  font-bold
                  leading-tight
                  sm:text-3xl
                  lg:text-[28px]
                "
                style={{
                  fontFamily: "'Playfair Display', serif",
                }}
              >
                {title}
              </h1>

              {subtitle && (
                <p className="mt-1 text-xs font-medium text-white/90 sm:text-sm">{subtitle}</p>
              )}
            </motion.div>
          </div>
        </div>
      </section>

      {/* =====================================================
          PAGE CONTENT
      ===================================================== */}
      <main
        className="
          mx-auto
          flex
          w-full
          max-w-7xl
          flex-1
          flex-col
          px-4
          py-8
          sm:px-6
          sm:py-10
          lg:px-8
          lg:py-12
        "
      >
        <div className="grid gap-6 lg:grid-cols-[1fr_16rem] lg:gap-8">
          {!hideSidebar && <Sidebar className="lg:order-2" />}

          <motion.div
            initial={false}
            whileInView={{
              opacity: 1,
              y: 0,
            }}
            viewport={{
              once: true,
              margin: "-50px",
            }}
            transition={{
              duration: 0.6,
            }}
            className={`w-full lg:order-1 ${hideSidebar ? "lg:col-span-2" : ""}`}
          >
            {children}
          </motion.div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
