import { useParams } from "react-router-dom";
import { withPageMeta } from "@/components/common/withPageMeta";
import { PublicProfileView } from "@/components/site/PublicProfileView";

const PAGE_META = [
  { title: "Member Profile · AICDA" },
  { name: "description", content: "Public AICDA member profile." },
  { name: "robots", content: "noindex" },
];

function PublicMemberRoute() {
  const { id } = useParams();
  return <PublicProfileView type="member" id={id} />;
}

export default withPageMeta(PublicMemberRoute, PAGE_META);
