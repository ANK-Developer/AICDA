import { withPageMeta } from "@/components/common/withPageMeta";
import { PageShell } from "@/components/site/PageShell";
import { Prose } from "@/components/site/ContentBlocks";

const PAGE_META = [
  { title: "Used Vehicle Checklist · AICDA" },
  {
    name: "description",
    content: "A 40-point checklist every buyer should run before purchasing a used car.",
  },
  { property: "og:title", content: "Used Vehicle Checklist · AICDA" },
  {
    property: "og:description",
    content: "A 40-point checklist every buyer should run before purchasing a used car.",
  },
];

function Page() {
  return (
    <PageShell
      title="Used Vehicle Checklist"
      subtitle="A 40-point checklist every buyer should run before purchasing a used car."
    >
      <Prose>
        <h2 className="pl-[20px]">About Used Vehicle Checklist</h2>
        <div className="max-w-6xl mx-auto border-y border-gray-300 py-6 px-6 text-gray-700">
          <h2 className="text-[20px] font-bold leading-snug mb-3">
            Used Vehicle Checklist While Going To Buy/Sell A Second Hand Vehicle
            <span className="font-semibold mt-5px">
              {" "}
              Particulars of Second Hand Vehicles to be Checked Carefully
            </span>
          </h2>

          <ol className="list-decimal pl-6 space-y-1 text-[18px]">
            <li>Engine Number --- Should not be punched</li>
            <li>Chassis Number --- There should be no welding on the plate.</li>
            <li>Registration Book Should not be fake or duplicate.</li>
            <li>Identity of the registered owner. Should be verified properly.</li>
          </ol>

          <h3 className="text-[20px] font-bold uppercase mt-10 mb-8">
            TRY TO VERIFY ANY OF THE BELOW MENTIONED DOCUMENTS AS PROOF.
          </h3>

          <ol className="list-decimal pl-6 space-y-1 text-[18px]">
            <li>Residence of registered Owner.</li>
            <li>Ration Card.</li>
            <li>Election Card.</li>
            <li>Passport.</li>
            <li>Driving Licence.</li>
            <li>Income Tax Permanent Number.</li>
            <li>Telephone Bill.</li>
            <li>Electricity Bill.</li>
            <li>Latest Bank Account Statement or Credit Card Statement.</li>
          </ol>
        </div>
      </Prose>
    </PageShell>
  );
}

export default withPageMeta(Page, PAGE_META);
