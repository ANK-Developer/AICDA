import { withPageMeta } from "@/components/common/withPageMeta";
import { PageShell } from "@/components/site/PageShell";
import { Prose } from "@/components/site/ContentBlocks";

const PAGE_META = [
  { title: "About Us · AICDA" },
  {
    name: "description",
    content: "The story, mission and values of the All India Car Dealers Association.",
  },
  { property: "og:title", content: "About Us · AICDA" },
  {
    property: "og:description",
    content: "The story, mission and values of the All India Car Dealers Association.",
  },
];

function Page() {
  return (
    <PageShell
      title="About Us"
      subtitle="The story, mission and values of the All India Car Dealers Association."
      bannerKey="about-us"
    >
      <Prose>
        <h2 className="mt-[0px] px-2 sm:px-2,">Our Journey</h2>
        <p className="px-2 sm:px-2">
          The Trade of car Sale Purchase is as old as the invention of the Motor car itself. With
          due course of time it has developed into a full fledged trade and industry. From time to
          time the people involved in this trade had been trying to organise themselves and form an
          association which could look after the requirements of the dealers and help them in their
          hour of need. In the year 2001 the Car Sale Purchase dealers of North district of Delhi
          were facing problems from many angles and hence decided it was high time that an
          Association be formed. The dealers gathered ,met and formed an Association. The complete
          charge of the Association was handed over to a dynamic personality by the name of
          J.S.NAYOL who named the Association as NORTHWEST CAR DEALERS ASSOCIATION. J.S.NAYOL had
          political experience of 17yrs.He enjoyed a lot of respect amongst the political and
          beurocratic circles. He could handle any issue from grass root level to the highest level
          with ease as he was a person who had risen from the base level to international fame Upon
          formation the association staring functioning for the benefits of the dealers from day
          one. When the dealers of the neighbouring areas of Delhi got to know about the Association
          and its functioning, they started pressing the members and the Governing body of the
          Association to allow them to join the Association. When the dealers of all areas became
          members of the association then it was felt that the name of the Association should be
          changed. Thus DELHI PRADESH CAR DEALERS ASSOCIATION was formed ,After all dealers of Delhi
          became members. Upon the formation of Delhi Pradesh Car Dealers Association the word
          spread like wild fire amongst the dealers of other states. That other dealers have formed
          such a strong Association that nobody dares to create any problem for the dealers, they
          started sending messages that they too wanted to join the association and that this
          association should work on a National Level. Making a national level association was not
          an easy task and the President JS NAYOL, Gen Secy DS GILL and governing body had to do
          some serious thinking on this issue. Meeting, discussions and a lot of ground work was
          done and finally an Assn by the name of AICDA was formed in the year 2006.The dealers of
          almost all states of India. have joined as member of this Association and those who have
          not become members are eager to become members ,the sooner the better they say. The
          Association works on a multi pronged level. Be it the problem of dealers or of the parking
          or any other documentation or vehicle related problems or any problem faced by customers
          from dealers . All the members are made to practice transparent and fair dealing and also
          to verify the antecedents of the seller /buyer before buying or selling a vehicle. It is
          also mandatory for all the members of the association to check that the documents are in
          proper order before finalizing any deal. If any member is found doing any wrong or unfair
          practice he is expelled from the Association membership and is also boycotted from the
          trade and is blacklisted. Overall the customer is benefited by the dealers practice of
          transparent &fair dealing, clear and clean documentation of the vehicle. We look forward
          to develop a healthy relationship between our member dealers and our valued customers,
          today & always.
        </p>
        {/* <h2>Mission</h2>
          <p>To professionalise Indian auto retail, safeguard consumer interests and represent the trade before every level of government with a single, credible voice.</p>
          <h2>Values</h2>
          <ul><li>Transparency in every transaction</li><li>Compliance with all statutory obligations</li><li>Dignity of the customer at all times</li><li>Solidarity among fellow dealers</li></ul> */}
      </Prose>
    </PageShell>
  );
}

export default withPageMeta(Page, PAGE_META);
