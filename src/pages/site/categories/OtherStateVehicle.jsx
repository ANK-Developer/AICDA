import { withPageMeta } from "@/components/common/withPageMeta";
import { PageShell } from "@/components/site/PageShell";
import { Prose } from "@/components/site/ContentBlocks";

const PAGE_META = [
  { title: "Other State Vehicle · AICDA" },
  {
    name: "description",
    content: "Re-registration process when moving a vehicle to a new state.",
  },
  { property: "og:title", content: "Other State Vehicle · AICDA" },
  {
    property: "og:description",
    content: "Re-registration process when moving a vehicle to a new state.",
  },
];

function Page() {
  return (
    <PageShell
      title="Other State Vehicle"
      subtitle="Re-registration process when moving a vehicle to a new state."
    >
      <Prose>
        <h2>About Other State Vehicle</h2>
        <hr />
        <br />
        <ol>
          <li> Verification of vehicles in form No.20</li>
          <li> Two copies of NOC</li>

          <li>Valid Insurance</li>

          <li>Residence Proof</li>

          <li>Pollution Certificate</li>

          <li>Original Registration</li>

          <li>Form No.27</li>

          <li>Tax Clearance</li>
        </ol>
        <hr />
      </Prose>
    </PageShell>
  );
}

export default withPageMeta(Page, PAGE_META);
