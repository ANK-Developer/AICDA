import { withPageMeta } from "@/components/common/withPageMeta";
import { PageShell } from "@/components/site/PageShell";
import { Prose } from "@/components/site/ContentBlocks";

const PAGE_META = [
  { title: "Important Forms · AICDA" },
  { name: "description", content: "Downloadable RTO forms — 29, 30, 34, 35 and more." },
  { property: "og:title", content: "Important Forms · AICDA" },
  { property: "og:description", content: "Downloadable RTO forms — 29, 30, 34, 35 and more." },
];

function Page() {
  return (
    <PageShell title="Important Forms" subtitle="Downloadable RTO forms — 29, 30, 34, 35 and more.">
      <Prose>
        <div className="max-w-6xl mx-auto py-6 pt-0 ">
          <h2 className="text-center text-[18px] font-semibold text-gray-700 uppercase mt-0 pt-0">
            (UNDER M.V.ACT)
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full min-w-125 border-collapse">
              <thead>
                <tr>
                  <th className="border border-gray-400 text-left px-3 py-2 text-[17px] font-semibold">
                    Purpose
                  </th>
                  <th className="border border-gray-400 text-left px-3 py-2 text-[17px] font-semibold w-28">
                    Form No.
                  </th>
                </tr>
              </thead>

              <tbody>
                <tr>
                  <td className="border border-gray-400 px-3 py-2">
                    1. Application for registration of new Vehicle
                  </td>
                  <td className="border border-gray-400 px-3 py-2">20</td>
                </tr>

                <tr>
                  <td className="border border-gray-400 px-3 py-2">
                    2. Sale Certificate (Sale Letter)
                  </td>
                  <td className="border border-gray-400 px-3 py-2">21</td>
                </tr>

                <tr>
                  <td className="border border-gray-400 px-3 py-2">
                    3. Application for renewal of fitness (Pvt.Vehicles)
                  </td>
                  <td className="border border-gray-400 px-3 py-2">25</td>
                </tr>

                <tr>
                  <td className="border border-gray-400 px-3 py-2">
                    4. Application for issue of duplicate registration Certificate
                  </td>
                  <td className="border border-gray-400 px-3 py-2">26</td>
                </tr>

                <tr>
                  <td className="border border-gray-400 px-3 py-2">
                    5. Application for issue of new registration number against already registered
                    vehicle outside Delhi Area
                  </td>
                  <td className="border border-gray-400 px-3 py-2">27</td>
                </tr>

                <tr>
                  <td className="border border-gray-400 px-3 py-2">
                    6. Application for the grant of N.O.C.
                  </td>
                  <td className="border border-gray-400 px-3 py-2">28</td>
                </tr>

                <tr>
                  <td className="border border-gray-400 px-3 py-2">
                    7. Notice of sale (Sale Letter) for transfer for ownership
                  </td>
                  <td className="border border-gray-400 px-3 py-2">29</td>
                </tr>

                <tr>
                  <td className="border border-gray-400 px-3 py-2">
                    8. Intimation of transfer of ownership.
                  </td>
                  <td className="border border-gray-400 px-3 py-2">30</td>
                </tr>

                <tr>
                  <td className="border border-gray-400 px-3 py-2">
                    9. Application for transfer on death.
                  </td>
                  <td className="border border-gray-400 px-3 py-2">31</td>
                </tr>

                <tr>
                  <td className="border border-gray-400 px-3 py-2">
                    10. Application for registration of disposable vehicles
                  </td>
                  <td className="border border-gray-400 px-3 py-2">32</td>
                </tr>

                <tr>
                  <td className="border border-gray-400 px-3 py-2">
                    11. Application for change of address.
                  </td>
                  <td className="border border-gray-400 px-3 py-2">33</td>
                </tr>

                <tr>
                  <td className="border border-gray-400 px-3 py-2">
                    12. Application for endorsement of H.P.A.
                  </td>
                  <td className="border border-gray-400 px-3 py-2">34</td>
                </tr>

                <tr>
                  <td className="border border-gray-400 px-3 py-2">
                    13. Application for cancellation of H.P.A
                  </td>
                  <td className="border border-gray-400 px-3 py-2">35</td>
                </tr>

                <tr>
                  <td className="border border-gray-400 px-3 py-2">14. Declaration for PAN No.</td>
                  <td className="border border-gray-400 px-3 py-2">60</td>
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
