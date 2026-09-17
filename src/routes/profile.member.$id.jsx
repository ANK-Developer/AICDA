import { createFileRoute } from "@tanstack/react-router";
import { PublicProfileView } from "@/components/site/PublicProfileView";

export const Route = createFileRoute("/profile/member/$id")({
  head: () => ({
    meta: [
      { title: "Member Profile · AICDA" },
      { name: "description", content: "Public AICDA member profile." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: PublicMemberRoute,
});

function PublicMemberRoute() {
  const { id } = Route.useParams();
  return <PublicProfileView type="member" id={id} />;
}
