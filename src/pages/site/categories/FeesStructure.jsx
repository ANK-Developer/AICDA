import { withPageMeta } from "@/components/common/withPageMeta";
import { PageShell } from "@/components/site/PageShell";
import { Prose } from "@/components/site/ContentBlocks";

const PAGE_META = [
  { title: "Fees Structure · AICDA" },
  { name: "description", content: "Registration, road-tax and hypothecation fees explained." },
  { property: "og:title", content: "Fees Structure · AICDA" },
  {
    property: "og:description",
    content: "Registration, road-tax and hypothecation fees explained.",
  },
];

function Page() {
  return (
    <PageShell
      title="Fees Structure"
      subtitle="Registration, road-tax and hypothecation fees explained."
    >
      <Prose>
        <div className="max-w-5xl mx-auto py-4">
          <h2 className="text-center text-[22px] font-bold mb-2">
            MOTOR VEHICLES RULES 1993 / DELHI
          </h2>

          <h3 className="text-center text-[20px] font-semibold mb-6">MOTOR VEHICLES RULES 2002</h3>

          <div className="max-w-6xl mx-auto py-4 overflow-x-auto">
            <table className="w-full min-w-100 border-collapse text-[18px] text-gray-700">
              <tbody>
                <tr>
                  <td className="border border-gray-400 px-2 py-2">
                    1. Issue or renewal of learner's Licence for class of vehicle
                  </td>
                  <td className="border border-gray-400 px-2 py-2 w-48">30/-</td>
                </tr>

                <tr>
                  <td className="border border-gray-400 px-2 py-2">
                    2. Issue of Licence Polaroid or laser eye type
                  </td>
                  <td className="border border-gray-400 px-2 py-2">40/- + 60/-</td>
                </tr>

                <tr>
                  <td className="border border-gray-400 px-2 py-2">
                    3. Renewal of Licence Polaroid or eye type
                  </td>
                  <td className="border border-gray-400 px-2 py-2">40/- + 80/-</td>
                </tr>

                <tr>
                  <td className="border border-gray-400 px-2 py-2">
                    4. Test to drive each class of vehicle
                  </td>
                  <td className="border border-gray-400 px-2 py-2">30/-</td>
                </tr>

                <tr>
                  <td className="border border-gray-400 px-2 py-2">5. Duplicate Licence</td>
                  <td className="border border-gray-400 px-2 py-2">100/-</td>
                </tr>

                <tr>
                  <td className="border border-gray-400 px-2 py-2">
                    6. Registration &amp; new assignment fee
                  </td>
                  <td className="border border-gray-400 px-2 py-2">50/-</td>
                </tr>

                <tr>
                  <td className="border border-gray-400 px-2 py-2">Two Wheelers</td>
                  <td className="border border-gray-400 px-2 py-2">60/-</td>
                </tr>

                <tr>
                  <td className="border border-gray-400 px-2 py-2">Motor Car</td>
                  <td className="border border-gray-400 px-2 py-2">100/-</td>
                </tr>

                <tr>
                  <td className="border border-gray-400 px-2 py-2">M.M.V</td>
                  <td className="border border-gray-400 px-2 py-2">300/-</td>
                </tr>

                <tr>
                  <td className="border border-gray-400 px-2 py-2">H.M.V</td>
                  <td className="border border-gray-400 px-2 py-2">400/-</td>
                </tr>

                <tr>
                  <td className="border border-gray-400 px-2 py-2">Imported Motor Cycle</td>
                  <td className="border border-gray-400 px-2 py-2">250/-</td>
                </tr>

                <tr>
                  <td className="border border-gray-400 px-2 py-2">Motor Car (Imported)</td>
                  <td className="border border-gray-400 px-2 py-2">450/- + 400/-</td>
                </tr>

                <tr>
                  <td className="border border-gray-400 px-2 py-2">
                    7. Issue of Duplicate Registration
                  </td>
                  <td className="border border-gray-400 px-2 py-2">100/-</td>
                </tr>

                <tr>
                  <td className="border border-gray-400 px-2 py-2">8. Transfer of Vehicle</td>
                  <td className="border border-gray-400 px-2 py-2">100/-</td>
                </tr>

                <tr>
                  <td className="border border-gray-400 px-2 py-2">9. Change of Residence</td>
                  <td className="border border-gray-400 px-2 py-2">50/-</td>
                </tr>

                <tr>
                  <td className="border border-gray-400 px-2 py-2">10. N.O.C.</td>
                  <td className="border border-gray-400 px-2 py-2">FREE</td>
                </tr>

                <tr>
                  <td className="border border-gray-400 px-2 py-2">
                    11. International Driving Permit
                  </td>
                  <td className="border border-gray-400 px-2 py-2">250/-</td>
                </tr>

                {/* Section Heading */}
                <tr>
                  <td colSpan={2} className="text-[20px] font-bold text-gray-700 py-2">
                    Fitness of Vehicles, New Commercial
                  </td>
                </tr>

                <tr>
                  <td className="border border-gray-400 px-2 py-2">New Commercial Vehicle</td>
                  <td className="border border-gray-400 px-2 py-2">2 years</td>
                </tr>

                <tr>
                  <td className="border border-gray-400 px-2 py-2">
                    Old Commercial - 1 year after every
                  </td>
                  <td className="border border-gray-400 px-2 py-2">2 years</td>
                </tr>

                <tr>
                  <td className="border border-gray-400 px-2 py-2">
                    Old Private 5 years after every
                  </td>
                  <td className="border border-gray-400 px-2 py-2">15 years</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </Prose>
    </PageShell>
  );
}

export default withPageMeta(Page, PAGE_META);
