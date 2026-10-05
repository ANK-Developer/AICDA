import { withPageMeta } from "@/components/common/withPageMeta";
import { PageShell } from "@/components/site/PageShell";
import { Prose } from "@/components/site/ContentBlocks";

const PAGE_META = [
  { title: "Contact Us · AICDA" },
  { name: "description", content: "Get in touch with the AICDA secretariat." },
  { property: "og:title", content: "Contact Us · AICDA" },
  { property: "og:description", content: "Get in touch with the AICDA secretariat." },
];

function Page() {
  return (
    <PageShell
      title="Contact Us"
      subtitle="Get in touch with the AICDA secretariat."
      bannerKey="contact-us"
    >
      <Prose>
        <h2 className="px-2 sm:px-2">Head Office</h2>
        <p className="px-2 sm:px-2">CB-32B, OPP. RBI COLONY, SHALIMAR BAGH, Delhi-110088</p>
        <p className="px-2 sm:px-2">Phone: 9818691000, 9810027829, 8587036564, 8595288016</p>
      </Prose>
      <div className="overflow-hidden rounded-xl border border-border shadow-(--shadow-card)">
        <iframe
          src="https://www.google.com/maps?q=28.714059,77.1515525&z=16&output=embed"
          title="AICDA Head Office location"
          width="100%"
          height="400"
          style={{ border: 0 }}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>
      <p className="mt-3">
        <a
          href="https://www.google.com/maps/place/All+India+Car+Dealers+Association/@28.7140637,77.148982,612m/data=!3m2!1e3!4b1!4m6!3m5!1s0x390d015f4101483d:0xe958df023b5b757b!8m2!3d28.714059!4d77.1515525!16s%2Fg%2F11rncx4950?hl=en&entry=ttu&g_ep=EgoyMDI2MDYyOS4wIKXMDSoASAFQAw%3D%3D"
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary underline"
        >
          Open in Google Maps
        </a>
      </p>
    </PageShell>
  );
}

export default withPageMeta(Page, PAGE_META);
