import { withPageMeta } from "@/components/common/withPageMeta";
import { PageShell } from "@/components/site/PageShell";
import { Prose } from "@/components/site/ContentBlocks";

const PAGE_META = [
  { title: "New Vehicle · AICDA" },
  { name: "description", content: "Registration procedure for a newly purchased vehicle." },
  { property: "og:title", content: "New Vehicle · AICDA" },
  {
    property: "og:description",
    content: "Registration procedure for a newly purchased vehicle.",
  },
];

function Page() {
  return (
    <PageShell title="New Vehicle" subtitle="Registration procedure for a newly purchased vehicle.">
      <Prose>
        <h2>About New Vehicle</h2>

        <hr />
        <br />
        <p>To be applied along with fee and one time tax with form No.20,21,22,23,24,25,26</p>
        <ul>
          <li>Pollution Certificate</li>

          <li>Invoice</li>

          <li>Address Proof</li>

          <li>Insurance</li>
          <li>Computer Form</li>

          <li>H.P.A. Form No.34 (If you want H.P.A)</li>
        </ul>
        <p>
          Temporary Registration if sold by out side Dealers Fitness No.38 in Commercial Vehicle
          etc.
        </p>
        <hr />
      </Prose>
    </PageShell>
  );
}

export default withPageMeta(Page, PAGE_META);
