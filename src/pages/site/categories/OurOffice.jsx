import { withPageMeta } from "@/components/common/withPageMeta";
import { PageShell } from "@/components/site/PageShell";
import { Prose } from "@/components/site/ContentBlocks";

const PAGE_META = [
  { title: "Our Office · AICDA" },
  { name: "description", content: "AICDA head office and zonal office locations." },
  { property: "og:title", content: "Our Office · AICDA" },
  { property: "og:description", content: "AICDA head office and zonal office locations." },
];

function Page() {
  return (
    <PageShell title="Our Office" subtitle="AICDA head office and zonal office locations.">
      <Prose>
        <h2>About Our Office</h2>
        <p>
          AICDA head office and zonal office locations. This resource is maintained by the AICDA
          secretariat and updated whenever central or state authorities publish revised guidelines.
        </p>
        <h2>Key Points</h2>
        <ul>
          <li>Verified against the latest MoRTH notifications.</li>
          <li>Applicable across all Regional Transport Offices in India.</li>
          <li>Free of cost for AICDA members and general public.</li>
          <li>Downloadable summary available on request from the secretariat.</li>
        </ul>
        <h2>Need Assistance?</h2>
        <p>
          Contact the AICDA helpdesk at info@aicda.in or call +91 98100 00000. Our team responds
          within one working day.
        </p>
      </Prose>
    </PageShell>
  );
}

export default withPageMeta(Page, PAGE_META);
