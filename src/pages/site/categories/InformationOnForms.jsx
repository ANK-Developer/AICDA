import { withPageMeta } from "@/components/common/withPageMeta";
import { PageShell } from "@/components/site/PageShell";
import { Prose } from "@/components/site/ContentBlocks";

const PAGE_META = [
  { title: "Information on Forms · AICDA" },
  { name: "description", content: "What each RTO form is for and how to fill it correctly." },
  { property: "og:title", content: "Information on Forms · AICDA" },
  {
    property: "og:description",
    content: "What each RTO form is for and how to fill it correctly.",
  },
];

function Page() {
  return (
    <PageShell
      title="Information on Forms"
      subtitle="What each RTO form is for and how to fill it correctly."
    >
      <Prose>
        <h2 className="text-center m-0 p-0 leading-none font-bold text-xl">Important Forms</h2>{" "}
        <div className="max-w-7xl mx-auto py-4">
          <h3 className="text-center text-[18px] font-semibold text-gray-700 uppercase mb-2 mt-0">
            (UNDER M.V.ACT)
          </h3>

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
                    1. Application-cum-Declaration as to Physical Fitness
                  </td>
                  <td className="border border-gray-400 px-3 py-2">1</td>
                </tr>

                <tr>
                  <td className="border border-gray-400 px-3 py-2">2. Medical Certificate</td>
                  <td className="border border-gray-400 px-3 py-2">1A</td>
                </tr>

                <tr>
                  <td className="border border-gray-400 px-3 py-2">
                    3. Form of Application for the Grant of Renewal of Learner's Licence
                  </td>
                  <td className="border border-gray-400 px-3 py-2">2</td>
                </tr>

                <tr>
                  <td className="border border-gray-400 px-3 py-2">4. Learner Licence</td>
                  <td className="border border-gray-400 px-3 py-2">3</td>
                </tr>

                <tr>
                  <td className="border border-gray-400 px-3 py-2">
                    5. Form of Application for Licence to Drive a Motor Vehicle
                  </td>
                  <td className="border border-gray-400 px-3 py-2">4</td>
                </tr>

                <tr>
                  <td className="border border-gray-400 px-3 py-2">
                    6. Driving Certificate issued by Driving School or Establishment
                  </td>
                  <td className="border border-gray-400 px-3 py-2">5</td>
                </tr>

                <tr>
                  <td className="border border-gray-400 px-3 py-2">7. Form of Driving Licence</td>
                  <td className="border border-gray-400 px-3 py-2">6</td>
                </tr>

                <tr>
                  <td className="border border-gray-400 px-3 py-2">
                    8. Form of Driving Licence (Laminated / Smart Card Type)
                  </td>
                  <td className="border border-gray-400 px-3 py-2">7</td>
                </tr>

                <tr>
                  <td className="border border-gray-400 px-3 py-2">
                    9. Application for Addition of a New Class of Vehicle to a Driving Licence
                  </td>
                  <td className="border border-gray-400 px-3 py-2">8</td>
                </tr>

                <tr>
                  <td className="border border-gray-400 px-3 py-2">
                    10. Form of Application for Renewal of Driving Licence
                  </td>
                  <td className="border border-gray-400 px-3 py-2">9</td>
                </tr>

                <tr>
                  <td className="border border-gray-400 px-3 py-2">
                    11. State Register of Driving Licences
                  </td>
                  <td className="border border-gray-400 px-3 py-2">10</td>
                </tr>

                <tr>
                  <td className="border border-gray-400 px-3 py-2">
                    12. Form of Licence for the Establishment of a Motor Driving School
                  </td>
                  <td className="border border-gray-400 px-3 py-2">11</td>
                </tr>

                <tr>
                  <td className="border border-gray-400 px-3 py-2">
                    13. Application for a Licence to Engage in the Business of Imparting Driving
                    Instruction
                  </td>
                  <td className="border border-gray-400 px-3 py-2">12</td>
                </tr>

                <tr>
                  <td className="border border-gray-400 px-3 py-2">
                    14. Application for Renewal of Licence to Engage in the Business of Driving
                    Instruction
                  </td>
                  <td className="border border-gray-400 px-3 py-2">13</td>
                </tr>

                <tr>
                  <td className="border border-gray-400 px-3 py-2">
                    15. Register Showing the Enrolment of Trainees in the Driving School
                  </td>
                  <td className="border border-gray-400 px-3 py-2">14</td>
                </tr>

                <tr>
                  <td className="border border-gray-400 px-3 py-2">
                    16. Register Showing the Driving Hours Spent by a Trainee
                  </td>
                  <td className="border border-gray-400 px-3 py-2">15</td>
                </tr>

                <tr>
                  <td className="border border-gray-400 px-3 py-2">
                    17. Application for Grant/Renewal of Trade Certificate
                  </td>
                  <td className="border border-gray-400 px-3 py-2">16</td>
                </tr>

                <tr>
                  <td className="border border-gray-400 px-3 py-2">
                    18. Form of Trade Certificate
                  </td>
                  <td className="border border-gray-400 px-3 py-2">17</td>
                </tr>

                <tr>
                  <td className="border border-gray-400 px-3 py-2">
                    19. Intimation of Loss or Destruction of a Trade Certificate and Application for
                    Duplicate
                  </td>
                  <td className="border border-gray-400 px-3 py-2">18</td>
                </tr>

                <tr>
                  <td className="border border-gray-400 px-3 py-2">
                    20. Register to be Maintained by the Holder of Trade Certificate
                  </td>
                  <td className="border border-gray-400 px-3 py-2">19</td>
                </tr>

                <tr>
                  <td className="border border-gray-400 px-3 py-2">
                    21. Application for Registration of a Motor Vehicle
                  </td>
                  <td className="border border-gray-400 px-3 py-2">20</td>
                </tr>

                <tr>
                  <td className="border border-gray-400 px-3 py-2">22. Sales Certificate</td>
                  <td className="border border-gray-400 px-3 py-2">21</td>
                </tr>

                <tr>
                  <td className="border border-gray-400 px-3 py-2">
                    23. Initial Certificate of Compliance with Pollution & Safety Standards
                  </td>
                  <td className="border border-gray-400 px-3 py-2">22</td>
                </tr>

                <tr>
                  <td className="border border-gray-400 px-3 py-2">
                    24. Certificate of Compliance (Body Fabricated Separately)
                  </td>
                  <td className="border border-gray-400 px-3 py-2">22A</td>
                </tr>

                <tr>
                  <td className="border border-gray-400 px-3 py-2">
                    25. Certificate of Registration
                  </td>
                  <td className="border border-gray-400 px-3 py-2">23</td>
                </tr>

                <tr>
                  <td className="border border-gray-400 px-3 py-2">
                    26. Certificate of Registration (Smart Card/Electronic)
                  </td>
                  <td className="border border-gray-400 px-3 py-2">23A</td>
                </tr>

                <tr>
                  <td className="border border-gray-400 px-3 py-2">
                    27. Register of Motor Vehicle
                  </td>
                  <td className="border border-gray-400 px-3 py-2">24</td>
                </tr>

                <tr>
                  <td className="border border-gray-400 px-3 py-2">
                    28. Application for Renewal of Certificate of Registration
                  </td>
                  <td className="border border-gray-400 px-3 py-2">25</td>
                </tr>

                <tr>
                  <td className="border border-gray-400 px-3 py-2">
                    29. Application for Duplicate Certificate of Registration
                  </td>
                  <td className="border border-gray-400 px-3 py-2">26</td>
                </tr>

                <tr>
                  <td className="border border-gray-400 px-3 py-2">
                    30. Application for Assignment of New Registration Mark
                  </td>
                  <td className="border border-gray-400 px-3 py-2">27</td>
                </tr>

                <tr>
                  <td className="border border-gray-400 px-3 py-2">
                    31. Application and Grant of No Objection Certificate (NOC)
                  </td>
                  <td className="border border-gray-400 px-3 py-2">28</td>
                </tr>

                <tr>
                  <td className="border border-gray-400 px-3 py-2">
                    32. Notice of Transfer of Ownership of Motor Vehicle
                  </td>
                  <td className="border border-gray-400 px-3 py-2">29</td>
                </tr>

                <tr>
                  <td className="border border-gray-400 px-3 py-2">
                    33. Application for Intimation & Transfer of Ownership
                  </td>
                  <td className="border border-gray-400 px-3 py-2">30</td>
                </tr>

                <tr>
                  <td className="border border-gray-400 px-3 py-2">
                    34. Application for Transfer of Ownership (Successor)
                  </td>
                  <td className="border border-gray-400 px-3 py-2">31</td>
                </tr>

                <tr>
                  <td className="border border-gray-400 px-3 py-2">
                    35. Application for Transfer of Ownership (Public Auction)
                  </td>
                  <td className="border border-gray-400 px-3 py-2">32</td>
                </tr>

                <tr>
                  <td className="border border-gray-400 px-3 py-2">
                    36. Application for Entry of Hire-Purchase / Lease / Hypothecation
                  </td>
                  <td className="border border-gray-400 px-3 py-2">33</td>
                </tr>

                <tr>
                  <td className="border border-gray-400 px-3 py-2">
                    37. Notice of Termination of Hire-Purchase / Lease / Hypothecation
                  </td>
                  <td className="border border-gray-400 px-3 py-2">34</td>
                </tr>

                <tr>
                  <td className="border border-gray-400 px-3 py-2">
                    38. Application for Fresh Certificate of Registration in the Name of Financier
                  </td>
                  <td className="border border-gray-400 px-3 py-2">35</td>
                </tr>

                <tr>
                  <td className="border border-gray-400 px-3 py-2">
                    39. Notice to Registered Owner to Surrender Registration Certificate
                  </td>
                  <td className="border border-gray-400 px-3 py-2">36</td>
                </tr>

                <tr>
                  <td className="border border-gray-400 px-3 py-2">
                    40. Certificate of Fitness (Transport Vehicle)
                  </td>
                  <td className="border border-gray-400 px-3 py-2">37</td>
                </tr>

                <tr>
                  <td className="border border-gray-400 px-3 py-2">
                    41. Notice to Cease to Act as Guarantor
                  </td>
                  <td className="border border-gray-400 px-3 py-2">38</td>
                </tr>

                <tr>
                  <td className="border border-gray-400 px-3 py-2">
                    42. Declaration by a Person Having Agricultural Income
                  </td>
                  <td className="border border-gray-400 px-3 py-2">56</td>
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
