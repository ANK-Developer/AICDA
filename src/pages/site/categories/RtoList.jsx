import { withPageMeta } from "@/components/common/withPageMeta";
import { PageShell } from "@/components/site/PageShell";
import { Prose } from "@/components/site/ContentBlocks";

const PAGE_META = [
  { title: "RTO List · AICDA" },
  { name: "description", content: "Complete list of Regional Transport Offices across India." },
  { property: "og:title", content: "RTO List · AICDA" },
  {
    property: "og:description",
    content: "Complete list of Regional Transport Offices across India.",
  },
];

function Page() {
  return (
    <PageShell
      title="RTO List"
      subtitle="Complete list of Regional Transport Offices across India."
    >
      <Prose>
        <h2>About RTO List</h2>
        <div className="max-w-6xl mx-auto py-4">
          <h2 className="text-center text-xl font-bold mb-4">
            (Note: This Page is Under Development)
          </h2>

          <ol className="list-decimal pl-8 space-y-1 text-[18px] text-gray-700">
            <li>
              <strong>AN</strong> - Andaman & Nicobar Islands
            </li>
            <li>
              <strong>AP</strong> - Andhra Pradesh
            </li>
            <li>
              <strong>AR</strong> - Arunachal Pradesh
            </li>
            <li>
              <strong>AS</strong> - Assam
            </li>
            <li>
              <strong>BR</strong> - Bihar
            </li>
            <li>
              <strong>CH</strong> - Chandigarh
            </li>
            <li>
              <strong>CG</strong> - Chhattisgarh
            </li>
            <li>
              <strong>DD</strong> - Daman and Diu
            </li>
            <li>
              <strong>DL</strong> - Delhi
            </li>
            <li>
              <strong>DN</strong> - Dadra and Nagar Haveli
            </li>
            <li>
              <strong>GA</strong> - Goa
            </li>
            <li>
              <strong>GJ</strong> - Gujarat
            </li>
            <li>
              <strong>HP</strong> - Himachal Pradesh
            </li>
            <li>
              <strong>HR</strong> - Haryana
            </li>
            <li>
              <strong>JH</strong> - Jharkhand
            </li>
            <li>
              <strong>JK</strong> - Jammu & Kashmir
            </li>
            <li>
              <strong>KA</strong> - Karnataka
            </li>
            <li>
              <strong>KL</strong> - Kerala
            </li>
            <li>
              <strong>LD</strong> - Lakshadweep
            </li>
            <li>
              <strong>MH</strong> - Maharashtra
            </li>
            <li>
              <strong>ML</strong> - Meghalaya
            </li>
            <li>
              <strong>MN</strong> - Manipur
            </li>
            <li>
              <strong>MP</strong> - Madhya Pradesh
            </li>
            <li>
              <strong>MZ</strong> - Mizoram
            </li>
            <li>
              <strong>NL</strong> - Nagaland
            </li>
            <li>
              <strong>OR</strong> - Orissa
            </li>
            <li>
              <strong>PB</strong> - Punjab
            </li>
            <li>
              <strong>PY</strong> - Puducherry
            </li>
            <li>
              <strong>RJ</strong> - Rajasthan
            </li>
            <li>
              <strong>SK</strong> - Sikkim
            </li>
            <li>
              <strong>TN</strong> - Tamil Nadu
            </li>
            <li>
              <strong>TR</strong> - Tripura
            </li>
            <li>
              <strong>UA</strong> - Uttarakhand
            </li>
            <li>
              <strong>UP</strong> - Uttar Pradesh
            </li>
            <li>
              <strong>WB</strong> - West Bengal
            </li>
            <li>
              <strong>Sources</strong>
            </li>
          </ol>
        </div>
      </Prose>
    </PageShell>
  );
}

export default withPageMeta(Page, PAGE_META);
