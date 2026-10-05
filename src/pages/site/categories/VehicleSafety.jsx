import { withPageMeta } from "@/components/common/withPageMeta";
import { PageShell } from "@/components/site/PageShell";
import { Prose } from "@/components/site/ContentBlocks";

const PAGE_META = [
  { title: "Vehicle Safety · AICDA" },
  {
    name: "description",
    content: "AICDA guidance on pre-delivery safety checks and consumer awareness.",
  },
  { property: "og:title", content: "Vehicle Safety · AICDA" },
  {
    property: "og:description",
    content: "AICDA guidance on pre-delivery safety checks and consumer awareness.",
  },
];

function Page() {
  return (
    <PageShell
      title="Vehicle Safety"
      subtitle="AICDA guidance on pre-delivery safety checks and consumer awareness."
    >
      <Prose>
        <h2 className="pl-[20px]">About Vehicle Safety</h2>
        <div className="max-w-6xl mx-auto border-y border-gray-300 py-8 px-4 text-[#4b5563]">
          <ol className="list-decimal pl-6 text-[17px] leading-8">
            <li>Get you Vehicle etched</li>
            <li>Affix steering locks</li>
            <li>Install Handle locks</li>
            <li>Affix extra door locks</li>
            <li>Install alarm system</li>
            <li>
              Do not park your vehicle unattended in
              <span className="font-medium"> "NO PARKING" </span>
              zones or unmanned parking even for a short period.
            </li>
            <li>
              Before purchasing a second hand vehicle check and get the documents verified from
              transport authority.
            </li>
            <li>
              Always Secure your vehicle by locking all doors and windows when ever you leave the
              vehicle unattended.
            </li>
          </ol>

          <div className="mt-10">
            <p className="text-[17px] leading-8 ">
              <ul>
                <li>In Case your vehicle is stolen, inform the nearest police station,</li>
                <li>
                  police picket, P.C.R. van or Police Control Room at Tel.No 100, immediately.
                </li>
              </ul>
            </p>
          </div>
        </div>
      </Prose>
    </PageShell>
  );
}

export default withPageMeta(Page, PAGE_META);
