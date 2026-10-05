import { withPageMeta } from "@/components/common/withPageMeta";
import { PageShell } from "@/components/site/PageShell";
import { Prose } from "@/components/site/ContentBlocks";

const PAGE_META = [
  { title: "New Registrations · AICDA" },
  {
    name: "description",
    content: "Latest new vehicle registration statistics compiled by AICDA.",
  },
  { property: "og:title", content: "New Registrations · AICDA" },
  {
    property: "og:description",
    content: "Latest new vehicle registration statistics compiled by AICDA.",
  },
];

function Page() {
  return (
    <PageShell
      title="New Registrations"
      subtitle="Latest new vehicle registration statistics compiled by AICDA."
    >
      <Prose>
        <h2>About New Registrations</h2>
        <hr />
        <br />
        <ol>
          <li>1. Verification of vehicles in form No.20</li>

          <li>Sale Letter Form No.21</li>

          <li>Manufacturers Fitness Certificate</li>
          <li> Form No.22</li>

          <li>Pollution Certificate</li>

          <li>Insurance</li>
          <li>Residence Proof</li>

          <li>On time Tax</li>

          <li>Registration Fee</li>

          <li>If Vehicle is from other state temporary registration Certificate</li>
        </ol>
        <hr />
        <br />
      </Prose>
    </PageShell>
  );
}

export default withPageMeta(Page, PAGE_META);
