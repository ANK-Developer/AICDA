import { withPageMeta } from "@/components/common/withPageMeta";
import { useState } from "react";
import { PageShell } from "@/components/site/PageShell";
import { Prose } from "@/components/site/ContentBlocks";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

const PAGE_META = [
  { title: "Rules · AICDA" },
  {
    name: "description",
    content: "Central Motor Vehicles Rules and dealer-specific compliance summarised.",
  },
  { property: "og:title", content: "Rules · AICDA" },
  {
    property: "og:description",
    content: "Central Motor Vehicles Rules and dealer-specific compliance summarised.",
  },
];

function Page() {
  const [page, setPage] = useState(1);
  const itemsPerPage = 6;

  const paragraphs = [
    "On a commission deal the association will verify the role and share of earning of the dealers/dealers involved at the time of deal and then accordingly the shares for refund will be divided accordingly in case of any dispute.",
    "On a vehicle which has been purchased by a dealer and upon being sold if found wrong the concerned dealer without any share will refund the complete amount immediately.",
    "Any earnest money above Rs.1000/- is received by a dealer/dealers and the party does not come to mature the deal then the earnest money will be divided between all the dealers involved in the deal if earnest money is refunded at any stage it will be done accordingly.",
    "If two dealers reach a party together then the first dealer will have the first right two mature the deal and if he wishes he can put a share of the second dealer upon his choice in the deal.",
    "No dealer will deduct commission from any earnest money at any time.",
    "If a dealer sells or purchases a vehicle from a party then he should definitely collect the party's photo, Ration card, Driving License or passport photocopy or proof of credit card or latest bank A/C statement details. This is mandatory for all deals.",
    "All dealers should get the sold vehicle transferred in the buyer's name.",
    "Dealers should try their best to make the payment at the party's residence after proper verification.",
    "If a dealers shows a party vehicle to another dealer and the dealer purchases the vehicle directly or if a dealer takes a party to another dealers office/shop and the party purchases the vehicle from the dealer directly then the dealer who sells the vehicle to the party or the dealer who purchases the vehicle will be liable to pay the commission to that dealer.",
    "Total Boycott and total expulsion of a member if he does not agree to the association's ruling.",
    "Election to be held every 5 years.",
    "An advocate to be appointed by the association on the associations expenses.",
    "All members of committee should try to reach the person in trouble immediately without any delay.",
  ];

  const totalPages = Math.ceil(paragraphs.length / itemsPerPage);
  const startIndex = (page - 1) * itemsPerPage;
  const currentParagraphs = paragraphs.slice(startIndex, startIndex + itemsPerPage);

  return (
    <PageShell
      title="Rules"
      subtitle="Central Motor Vehicles Rules and dealer-specific compliance summarised."
    >
      <div className="px-4 sm:px-6">
        <Prose className="break-words">
          <h2>About Rules</h2>
          <h3 className="mb-[2px] font-bold">Dear Member,</h3>
          {currentParagraphs.map((text, index) => (
            <p key={`${page}-${index}`}>{text}</p>
          ))}
        </Prose>

        {totalPages > 1 && (
          <div className="mt-6 flex justify-center">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => setPage((current) => Math.max(1, current - 1))}
                    className={page === 1 ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>

                {Array.from({ length: totalPages }, (_, index) => {
                  const pageNumber = index + 1;
                  return (
                    <PaginationItem key={pageNumber}>
                      <PaginationLink
                        isActive={page === pageNumber}
                        onClick={() => setPage(pageNumber)}
                      >
                        {pageNumber}
                      </PaginationLink>
                    </PaginationItem>
                  );
                })}

                <PaginationItem>
                  <PaginationNext
                    onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
                    className={page === totalPages ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </div>
    </PageShell>
  );
}

export default withPageMeta(Page, PAGE_META);
