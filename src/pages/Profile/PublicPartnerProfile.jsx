import { useParams } from "react-router-dom";
import { withPageMeta } from "@/components/common/withPageMeta";
import { PublicProfileView } from "@/components/site/PublicProfileView";

const PAGE_META = [
  { title: "Partner Profile · AICDA" },
  { name: "description", content: "Public AICDA partner profile." },
  { name: "robots", content: "noindex" },
];

function PublicPartnerRoute() {
  const { id } = useParams();
  return <PublicProfileView type="partner" id={id} />;
}

export default withPageMeta(PublicPartnerRoute, PAGE_META);
