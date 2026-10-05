import { withPageMeta } from "@/components/common/withPageMeta";
import { PageShell } from "@/components/site/PageShell";
import { Prose } from "@/components/site/ContentBlocks";

const PAGE_META = [
  { title: "Obtain N.O.C. · AICDA" },
  {
    name: "description",
    content: "How to obtain a No Objection Certificate for interstate transfer.",
  },
  { property: "og:title", content: "Obtain N.O.C. · AICDA" },
  {
    property: "og:description",
    content: "How to obtain a No Objection Certificate for interstate transfer.",
  },
];

function Page() {
  return (
    <PageShell
      title="Obtain N.O.C."
      subtitle="How to obtain a No Objection Certificate for interstate transfer."
    >
      <Prose>
        <h2 className="pl-[30px]">About Obtain N.O.C.</h2>
        <br />
        <hr />
        <br />
        <p className="pl-[30px]">
          To be applied on form 28 in triplicate supported with chassis print (with Soft Pencil)
        </p>
        <p className="pl-[30px]">The Photocopy of Insurance.</p>
        <p className="pl-[30px]">Registration Certificate, (Certified Copy)</p>
        <p className="pl-[30px]">Surrender Certificate (for tax lapses) Challan clearance.</p>
        <p className="pl-[30px]">Affidavit No.traffic Challan (clearance of financier)</p>
        <p className="pl-[30px]">(N.C.R.B clearance ect.)</p>
        <hr />
      </Prose>
    </PageShell>
  );
}

export default withPageMeta(Page, PAGE_META);
