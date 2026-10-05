import { withPageMeta } from "@/components/common/withPageMeta";
import { PageShell } from "@/components/site/PageShell";
import { Prose } from "@/components/site/ContentBlocks";

const PAGE_META = [
  { title: "News · AICDA" },
  { name: "description", content: "Industry news, association updates and policy briefings." },
  { property: "og:title", content: "News · AICDA" },
  {
    property: "og:description",
    content: "Industry news, association updates and policy briefings.",
  },
];

function Page() {
  return (
    <PageShell title="News" subtitle="Industry news, association updates and policy briefings.">
      <Prose>
        <h2>About News</h2>
        <p>
          Industry news, association updates and policy briefings. This resource is maintained by
          the AICDA secretariat and updated whenever central or state authorities publish revised
          guidelines.
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
