import { withPageMeta } from "@/components/common/withPageMeta";
import { PageShell } from "@/components/site/PageShell";
import { Prose } from "@/components/site/ContentBlocks";

const PAGE_META = [
  { title: "Transfer Ownership · AICDA" },
  {
    name: "description",
    content: "Step-by-step guide to transferring vehicle ownership at your RTO.",
  },
  { property: "og:title", content: "Transfer Ownership · AICDA" },
  {
    property: "og:description",
    content: "Step-by-step guide to transferring vehicle ownership at your RTO.",
  },
];

function Page() {
  return (
    <PageShell
      title="Transfer Ownership"
      subtitle="Step-by-step guide to transferring vehicle ownership at your RTO."
    >
      <Prose>
        <h2 className="pl-[20px] ">ABOUT TRANSFER OWNERSHIP</h2>
        <div className="max-w-6xl mx-auto border-y border-gray-300 py-6 px-6 text-[#4b5563]">
          <p className="text-[17px] leading-8">
            To be applied on Form 31 by the successor of deceased (nearest legal heir) supported
            with Death certificate (Affidavit of declaring death) and details of legal heirs no
            objection certification of all legal heirs for transfer, (Proposed owner). Address
            proof, Ration Card (Photocopy) and insurance in the name of proposed owner, with
            prescribed fee pollution certificate(certified copy).
          </p>

          <h2 className="text-[18px] font-medium uppercase mt-6 mb-5">Transfer of Ownership</h2>

          <p className="text-[17px] mb-5">
            To be applied on form No.29,30 (In Duplicate) supported with prescribed fee.
          </p>

          <p className="text-[17px] mb-8">
            Attested by Gazetted officer or Notary Address proof in any one of the following.
          </p>

          <ol className="list-decimal pl-8 text-[17px] leading-8 mb-10">
            <li>Election Card</li>
            <li>Ration Card</li>
            <li>Income Tax Number</li>
            <li>Telephone Bill</li>
            <li>Electric Bill</li>
            <li>Driving License</li>
            <li>L.I.C</li>
          </ol>

          <ol className="list-decimal pl-8 text-[17px] leading-8 mb-10">
            <li>Vehicle Insurance in the name of purchaser, certified copy.</li>
            <li>Original Copy of registration Certificate.</li>
            <li>H.P. Termination form 35 (in Duplicate) if required.</li>
            <li>Letter of H.P. cancellation of Financer (If under H.P. agreement).</li>
            <li>Pollution Certificate (photocopy) certified.</li>
          </ol>

          <p className="text-[17px] pl-40">
            *All the documents are to be handed over to the dealing clerk for approval*.
          </p>
        </div>
      </Prose>
    </PageShell>
  );
}

export default withPageMeta(Page, PAGE_META);
